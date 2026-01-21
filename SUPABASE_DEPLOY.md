# Supabase Deployment Guide

This guide describes how to deploy your local Supabase configuration (database schema, migrations, etc.) to the Supabase Cloud.

## Prerequisites

1.  **Supabase Account**: Create an account at [supabase.com](https://supabase.com).
2.  **Supabase Project**: Create a new project in the Supabase Dashboard.
3.  **Supabase CLI**: Ensure you have the Supabase CLI installed. Since you have it in your project devDependencies, you can use `npx supabase`.

## Deployment Steps

### 1. Login to Supabase

Authenticate the CLI with your Supabase account.

```bash
npx supabase login
```

This will open your browser to confirm the login.

### 2. Link Your Project

Link your local project to the remote Supabase project using the Project Reference ID.
You can find the Reference ID in your project's settings page in the Supabase Dashboard (it usually looks like `abcdefghijklmno`).

```bash
npx supabase link --project-ref <your-project-ref>
```

When prompted for the database password, enter the password you created when setting up the project.

### 3. Push Database Changes

Apply your local migrations to the remote database.

```bash
npx supabase db push
```

This command will:
*   Apply any pending migrations from `supabase/migrations` to the remote database.
*   Ensure your remote schema matches your local development state.

### 4. Seed Data (Optional)

If you have initial data in `supabase/seed.ts` (or `seed.sql`) that you want to apply:

**Note**: `seed.ts` is likely a script you run manually with a client, whereas `seed.sql` is natively supported by `db reset`.
Since your `package.json` has a `db:seed` script (`tsx supabase/seed.ts`), you can run this against your remote database if you configure your environment variables to point to the remote Supabase instance, OR strictly use SQL seeding.

To use the built-in SQL seeding (if you have `supabase/seed.sql`):
```bash
npx supabase db reset --linked
```
*Warning: This resets the database which might destroy data.*

For production safe seeding or data updates, it is better to create a new migration or run a script.

### 5. Environment Variables in Render.com

Once your Supabase project is deployed, you will need to get the API keys to use in your Render.com services.

1.  Go to **Project Settings** -> **API**.
2.  Copy the `Project URL`, `anon` public key, and `service_role` secret key.
3.  Add these as Environment Variables in your `render.yaml` or directly in the Render Dashboard for `mytudo-server`.

*   `SUPABASE_URL`
*   `SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_KEY`

## Troubleshooting

*   **Migration Conflicts**: If the remote database has changes not reflected locally, you might need to pull changes first (`npx supabase db pull`) or repair the migration history.
*   **Edge Functions**: If you have edge functions (in `supabase/functions`), deploy them with `npx supabase functions deploy`.
