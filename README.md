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
| AI | Vercel AI SDK and OpenAI | AI-powered task prioritization and suggestions |
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

Open the app locally:

```txt
http://localhost:3000
```

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

Next step: add task create, edit, delete, and complete interactions with local state.
