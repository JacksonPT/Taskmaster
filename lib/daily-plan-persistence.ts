import "server-only"

import type { DailyPlanOutput } from "@/lib/ai/daily-plan-validation"
import {
  MAX_DAILY_PLAN_GENERATIONS,
  type DailyPlanItemView,
} from "@/lib/daily-plan"
import { prisma } from "@/lib/prisma"

export const DAILY_PLAN_RESERVATION_TTL_MS = 5 * 60 * 1000

type DailyPlanDatabase = typeof prisma

export async function reserveDailyPlanGeneration(
  userId: string,
  usageDate: string,
  database: DailyPlanDatabase = prisma,
  reservationTime = new Date()
) {
  const staleBefore = new Date(
    reservationTime.getTime() - DAILY_PLAN_RESERVATION_TTL_MS
  )

  await database.dailyPlanUsage.upsert({
    where: {
      userId_usageDate: {
        userId,
        usageDate,
      },
    },
    create: {
      userId,
      usageDate,
    },
    update: {},
  })

  return database.$transaction(async (transaction) => {
    // Updating this row serializes reservation decisions for one user and day.
    const usage = await transaction.dailyPlanUsage.update({
      where: {
        userId_usageDate: {
          userId,
          usageDate,
        },
      },
      data: {
        updatedAt: reservationTime,
      },
      select: {
        generationCount: true,
      },
    })

    await transaction.dailyPlanReservation.deleteMany({
      where: {
        userId,
        usageDate,
        createdAt: {
          lt: staleBefore,
        },
      },
    })

    const pendingCount = await transaction.dailyPlanReservation.count({
      where: {
        userId,
        usageDate,
      },
    })

    if (usage.generationCount + pendingCount >= MAX_DAILY_PLAN_GENERATIONS) {
      return {
        reservationId: null,
        generationsUsedToday: usage.generationCount,
      }
    }

    const reservation = await transaction.dailyPlanReservation.create({
      data: {
        userId,
        usageDate,
      },
      select: {
        id: true,
      },
    })

    return {
      reservationId: reservation.id,
      generationsUsedToday: usage.generationCount,
    }
  })
}

export async function releaseDailyPlanReservation(
  reservationId: string,
  userId: string,
  usageDate: string,
  database: DailyPlanDatabase = prisma
) {
  await database.dailyPlanReservation.deleteMany({
    where: {
      id: reservationId,
      userId,
      usageDate,
    },
  })
}

type CommitDailyPlanInput = {
  userId: string
  usageDate: string
  reservationId: string
  output: DailyPlanOutput
  generatedAt: Date
}

export async function commitDailyPlanGeneration(
  input: CommitDailyPlanInput,
  database: DailyPlanDatabase = prisma
) {
  const { userId, usageDate, reservationId, output, generatedAt } = input

  return database.$transaction(async (transaction) => {
    const usageBeforeCompletion = await transaction.dailyPlanUsage.update({
      where: {
        userId_usageDate: {
          userId,
          usageDate,
        },
      },
      data: {
        updatedAt: generatedAt,
      },
      select: {
        generationCount: true,
      },
    })

    const activeReservation = await transaction.dailyPlanReservation.findFirst({
      where: {
        id: reservationId,
        userId,
        usageDate,
      },
      select: {
        id: true,
      },
    })

    if (
      !activeReservation ||
      usageBeforeCompletion.generationCount >= MAX_DAILY_PLAN_GENERATIONS
    ) {
      throw new Error("Daily plan reservation expired before completion.")
    }

    const plan = await transaction.dailyPlan.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        summary: output.summary,
        planDate: usageDate,
        generatedAt,
      },
      update: {
        summary: output.summary,
        planDate: usageDate,
        generatedAt,
      },
    })

    await transaction.dailyPlanItem.deleteMany({
      where: {
        dailyPlanId: plan.id,
      },
    })

    await transaction.dailyPlanItem.createMany({
      data: output.items.map((item, index) => ({
        dailyPlanId: plan.id,
        taskId: item.taskId,
        position: index + 1,
        reason: item.reason,
      })),
    })

    await transaction.dailyPlanReservation.delete({
      where: {
        id: reservationId,
      },
    })

    const usage = await transaction.dailyPlanUsage.update({
      where: {
        userId_usageDate: {
          userId,
          usageDate,
        },
      },
      data: {
        generationCount: {
          increment: 1,
        },
      },
      select: {
        generationCount: true,
      },
    })

    return {
      plan,
      generationsUsedToday: usage.generationCount,
    }
  })
}

type ReorderResult =
  | { status: "missing" }
  | { status: "changed" }
  | { status: "success"; items: DailyPlanItemView[] }

type ReorderOptions = {
  database?: DailyPlanDatabase
  claimedAt?: Date
  afterPlanLoaded?: () => Promise<void>
}

export async function reorderDailyPlanForUser(
  userId: string,
  orderedTaskIds: string[],
  options: ReorderOptions = {}
): Promise<ReorderResult> {
  const database = options.database ?? prisma
  const plan = await database.dailyPlan.findUnique({
    where: {
      userId,
    },
    include: {
      items: true,
    },
  })

  if (!plan) {
    return { status: "missing" }
  }

  const reasonByTaskId = new Map(
    plan.items.map((item) => [item.taskId, item.reason])
  )

  if (
    plan.items.length !== orderedTaskIds.length ||
    orderedTaskIds.some((taskId) => !reasonByTaskId.has(taskId))
  ) {
    return { status: "changed" }
  }

  const reorderedItems = orderedTaskIds.map((taskId, index) => ({
    taskId,
    position: index + 1,
    reason: reasonByTaskId.get(taskId)!,
  }))

  await options.afterPlanLoaded?.()

  const claimed = await database.$transaction(async (transaction) => {
    const claimedPlan = await transaction.dailyPlan.updateMany({
      where: {
        id: plan.id,
        userId,
        updatedAt: plan.updatedAt,
      },
      data: {
        updatedAt: options.claimedAt ?? new Date(),
      },
    })

    if (claimedPlan.count !== 1) {
      return false
    }

    await transaction.dailyPlanItem.deleteMany({
      where: {
        dailyPlanId: plan.id,
      },
    })

    await transaction.dailyPlanItem.createMany({
      data: reorderedItems.map((item) => ({
        ...item,
        dailyPlanId: plan.id,
      })),
    })

    return true
  })

  return claimed
    ? { status: "success", items: reorderedItems }
    : { status: "changed" }
}
