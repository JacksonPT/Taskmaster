# Taskmaster

Taskmaster is an AI-assisted task management app that helps users decide what to work on next, break down overwhelming tasks, and stay motivated with personalized feedback.

The goal of this project is not only to build a useful productivity app, but also to learn the technologies behind a modern full-stack TypeScript application step by step.

## Core Idea

Most task apps help users store tasks. Taskmaster should help users make better decisions about those tasks.

The app will eventually support:

- Creating and managing personal tasks
- AI-suggested priority levels
- AI explanations for why a task is important
- AI-generated steps for completing tasks
- Notes and resources attached to each task
- A suggested daily task order
- Completion encouragement messages
- A dashboard for progress, overdue tasks, and completed work

## Tech Stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Framework | Next.js | Full-stack React app structure |
| Language | TypeScript | Type safety and better developer tooling |
| UI | React | Component-based interface |
| Styling | Tailwind CSS | Utility-first styling system |
| Components | shadcn/ui and Base UI | Accessible, reusable UI building blocks |
| Icons | Lucide React | Consistent icon system |
| Formatting | Prettier | Consistent code formatting |
| Linting | ESLint | Code quality checks |
| Database | PostgreSQL | Persistent relational data storage |
| ORM | Prisma | Type-safe database queries and migrations |
| Auth | Clerk | User accounts and protected routes |
| AI | Vercel AI SDK, Google Gemini, and Zod | Structured, validated task recommendations |
| Deployment | Vercel | Hosting for the Next.js app |
| Database Hosting | Neon or Supabase | Hosted PostgreSQL database |

## MVP Scope

The first useful version of Taskmaster should include:

- User authentication
- Create, edit, delete, and complete tasks
- Store tasks in a database
- Suggest a priority level for each task using AI
- Generate task completion suggestions using AI
- Show a suggested daily order
- Display a simple progress dashboard

## Build Roadmap

This project is being built in modules so each step has a clear learning goal.

1. Project identity and README
2. Landing page
3. Task UI with temporary data
4. Task create/edit/delete/complete interactions
5. Prisma and PostgreSQL setup
6. Persist tasks in the database
7. Authentication with Clerk
8. User-owned private tasks
9. AI priority suggestions
10. AI task completion suggestions
11. Daily planning flow
12. Completion encouragement messages
13. Dashboard and progress stats
14. Polish, documentation, and deployment

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Run code quality checks:

```bash
pnpm lint
pnpm typecheck
```

Generate the Prisma client after changing the database schema:

```bash
pnpm db:generate
```

Apply Prisma schema changes to your PostgreSQL database:

```bash
pnpm db:migrate
```

Open Prisma Studio to inspect database rows visually:

```bash
pnpm db:studio
```

Open the app locally:

```txt
http://localhost:3000
```

## Database Setup

Taskmaster uses Neon-hosted PostgreSQL with Prisma as the TypeScript database layer.

1. Create a Neon PostgreSQL database.
2. Copy `.env.example` to `.env`.
3. Paste your Neon connection string into `DATABASE_URL`.
4. Run `pnpm db:generate` to generate Prisma Client.
5. Run `pnpm db:migrate` when you are ready to create the database tables.

The Prisma `Task` model stores Clerk's `userId` as the ownership key. PostgreSQL indexes that field so user-scoped queries remain efficient as the table grows. The field remains nullable only for pre-auth development rows; new application writes always include an owner.

## Authentication Setup

Taskmaster uses Clerk for sign-in, sign-up, session handling, and protected server resources.

1. Create a Clerk application.
2. Copy the publishable and secret keys from the Clerk Dashboard API Keys page.
3. Add both values to your local `.env` using the names shown in `.env.example`.
4. Run `pnpm dev` and create the first test account from the landing page.

The `/tasks` page and every task Server Action require a signed-in user.

## AI Setup

Taskmaster uses the Vercel AI SDK with Google's Gemini provider. AI calls run only on the server, and Zod validates each structured model response before the browser receives it.

1. Create a Google AI Studio API key at `https://aistudio.google.com/app/apikey`.
2. Add it to your local `.env` as `GOOGLE_GENERATIVE_AI_API_KEY`.
3. Restart `pnpm dev` after changing environment variables.
4. Open an add or edit form, enter a title and description, and select **Suggest priority**.
5. Save a task and select **Generate action plan** on its card for completion guidance.

The key is intentionally not prefixed with `NEXT_PUBLIC_`, so Next.js does not include it in browser JavaScript. Gemini classifies one task at a time; ordinary TypeScript then sorts active tasks High, Medium, and Low without spending more AI quota. Generating or regenerating a completion plan makes one additional Gemini request.

Completion-plan buttons send only a task id. The Server Action authenticates the Clerk session, loads the owned task from PostgreSQL, and gives Gemini that trusted task data. Zod requires one summary and two to five ordered steps before Prisma stores the summary as text and the steps as a PostgreSQL text array. Editing a task clears its previous plan because guidance generated from old details may no longer be accurate.

## Authorization Architecture

Clerk handles identity and supplies the authenticated `userId`. Server Actions use that trusted id in every Prisma `where` clause, while PostgreSQL returns only matching rows. The browser never chooses or submits task ownership.

This separates the security responsibilities:

- Clerk authentication establishes who made the request.
- Next.js Server Actions enforce authorization near database access.
- Prisma expresses ownership filters in type-safe queries.
- PostgreSQL stores and indexes the ownership key.

## Learning Goals

By building this app, the goal is to understand and be able to discuss:

- How Next.js structures pages, layouts, and server-side logic
- How React components manage UI and user interactions
- How TypeScript makes application code safer
- How Tailwind CSS helps build responsive layouts quickly
- How reusable UI components are organized
- How Prisma models database tables and relationships
- How authentication connects users to private data
- How AI features are called from server-side code
- How to validate and protect user input
- How to deploy a full-stack app with environment variables

## Current Status

Initialized with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Base UI, ESLint, Prettier, and Lucide icons.

The public landing page now introduces the product with a branded hero, temporary logo mark, tagline, login call-to-action, and task preview card.

The temporary task workspace at `/tasks` now uses mock task data to render task cards, priority labels, statuses, AI suggestion copy, and dashboard counters.

The `/tasks` workspace now supports temporary browser-only task interactions: create, edit, complete, reopen, and delete.

Prisma and PostgreSQL setup has been added with a first `Task` schema, a Prisma config file, database scripts, and a reusable Prisma Client helper.

The `/tasks` workspace now reads from PostgreSQL and uses server actions to create, edit, delete, complete, and reopen persisted tasks.

Clerk authentication now provides sign-in/sign-up controls, session-aware landing content, a user menu, and authentication checks around the task page and task Server Actions.

All task reads and mutations are now scoped to the authenticated Clerk user, creating private per-user task lists in a shared PostgreSQL database.

Gemini now recommends a priority for one task at a time through an authenticated Server Action. The AI SDK requests structured output, Zod validates its priority and rationale, and accepted results persist in PostgreSQL while remaining manually overridable.

Saved task cards can now generate or regenerate a Gemini completion plan. Each validated plan contains a summary and two to five ordered steps, persists in PostgreSQL, and remains available after a refresh.

Next step: compare active tasks in an AI-assisted daily planning flow.
