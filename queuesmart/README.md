# QueueSmart

A queue management system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Getting Started

### 1. Install dependencies

```bash
cd queuesmart
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in the Supabase keys (ask Dylan for these):

```bash
cp .env.local.example .env.local
```

You need these three values in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://rxdxlspyipjsrgsttvbi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ask Dylan>
SUPABASE_SERVICE_ROLE_KEY=<ask Dylan>
```

- `NEXT_PUBLIC_SUPABASE_URL` is the same for everyone (shown above)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are secret keys Dylan will share with you directly

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Demo accounts

- **Admin:** admin@queuesmart.com / admin123
- **User:** user@queuesmart.com / user123

## Database (Supabase)

We use Supabase (PostgreSQL) as our database. The project is already linked and migrations are managed via the Supabase CLI.

### Current tables (Assignment 4)

| Table | Description | Owner |
|-------|-------------|-------|
| `user_credentials` | Auth info: email, encrypted password (bcrypt), role | Dylan |
| `user_profiles` | User details: full name, email, phone, preferences | Dylan |
| `services` | Services offered (name, description, duration, priority) | **Needs to be created** |
| `queues` | Active queues for services (status, created date) | **Needs to be created** |
| `queue_entries` | Users waiting in queue (position, join time, status) | **Needs to be created** |
| `notifications` | System activity log (message, timestamp, status) | **Needs to be created** |

### How to add a new table

1. Create a migration file:
   ```bash
   npx supabase migration new your_table_name
   ```
   This creates a file in `supabase/migrations/`. Write your SQL there.

2. Push to the remote database:
   ```bash
   SUPABASE_ACCESS_TOKEN=<ask Dylan for token> npx supabase db push
   ```

3. Create/update the API route in `src/app/api/` to read/write from the new table.

4. Use `getServiceSupabase()` from `src/lib/supabase.ts` in your API routes to query the database.

### Example: querying Supabase in an API route

```typescript
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("your_table").select("*");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
```

## Project Structure

```
queuesmart/
  src/
    app/
      api/
        auth/          # Auth API routes (login, register, me, seed)
        queue/         # Queue API routes
        services/      # Services API routes
      login/           # Login page
      register/        # Register page
      dashboard/       # User dashboard
      admin/           # Admin pages
    lib/
      supabase.ts      # Supabase client setup
      auth.ts          # Legacy in-memory auth (kept for reference)
      validations.ts   # Input validation helpers
    types/
      index.ts         # TypeScript interfaces
  supabase/
    migrations/        # SQL migration files
  __tests__/           # Jest tests
```

## Running Tests

```bash
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL)
- bcryptjs (password hashing)
- Jest (testing)
