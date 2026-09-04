# RaRa Pet Care — complete setup

## 1. Requirements

- Node.js 20 or newer
- npm 10 or newer
- A modern browser
- Supabase is **not required** while dummy authentication is enabled

## 2. Install and run

From the project directory:

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

For a production check:

```powershell
npm.cmd run build
npm.cmd start
```

## 3. Current dummy-auth mode

Authentication currently runs entirely in the browser. No email is sent, no password is uploaded, and no Supabase tables are changed. Dummy accounts and sessions are stored in the browser's local storage.

Do not use dummy authentication for a public production deployment.

### Built-in logins

| Role | Email | Password |
| --- | --- | --- |
| Pet parent | `parent@rara.test` | `Parent123!` |
| Pet sitter | `sitter@rara.test` | `Sitter123!` |
| Administrator | `admin` | `Afnash7` |

Go to `http://localhost:3000/login`, enter one of the accounts, and select **Sign in**. You will be sent to `/dashboard`, which displays the correct options for that role.

### Dashboard permissions represented in the UI

- Pet parent: overview, pets, bookings and messages
- Pet sitter: overview, schedule, care requests, messages and earnings
- Administrator: overview, users, sitter approvals, all bookings and payments

### Create another dummy user

1. Open `/signup`.
2. Enter a name, email and password of at least eight characters.
3. Select either **Pet parent** or **Pet sitter**.
4. Enter a six-digit Singapore PIN/postal code. This is saved with the profile for location-based matching.
5. Submit the form. The new user is logged in immediately.

### Test dynamic parent features

After signing in as a pet parent, open **My pets** and choose **Add pet**. The form stores type, name, DOB and gender locally. Open **Services** and choose **Request service** to add start time, end time and a service type. Requests also appear under **Bookings**.

Administrator registration is intentionally unavailable. Use the built-in administrator account during dummy mode.

Custom dummy accounts are saved under `rara_dummy_users`, and the current login is saved under `rara_dummy_session` in local storage. They exist only in the browser profile where they were created.

### Reset dummy users

Open the browser developer console and run:

```js
localStorage.removeItem('rara_dummy_users');
localStorage.removeItem('rara_dummy_session');
location.href = '/login';
```

Clearing the browser's site data has the same effect. Built-in accounts are defined in `components/AuthForm.tsx` and remain available after a reset.

## 4. Project structure

```text
app/                         Next.js routes and global styles
app/(auth)/login/            Login page
app/(auth)/signup/           Registration page
app/dashboard/               Protected workspace entry point
components/AuthForm.tsx      Current dummy authentication logic
components/Dashboard.tsx     Role-specific dashboard interface
components/DummyDashboard.tsx Browser session guard
lib/supabase/                Supabase browser, server and proxy clients
supabase/migrations/         Database schema and RLS policies
scripts/create-demo-users.mjs Production-backend sample data helper
```

## 5. Environment file

Dummy mode does not need an environment file. If you create one, copy the template:

```powershell
Copy-Item .env.example .env.local
```

Keep this setting while using dummy authentication:

```env
NEXT_PUBLIC_USE_DUMMY_AUTH=true
```

`.env.local` is excluded by `.gitignore` and must never be committed.

## 6. Prepare Supabase for the production-auth switch

This section prepares the database but does not automatically disable dummy auth.

1. Create a Supabase project.
2. Open **SQL Editor** in the Supabase dashboard.
3. Run `supabase/migrations/001_schema.sql`.
4. Run `supabase/migrations/002_rls.sql`.
5. In **Project Settings → API**, copy the project URL and publishable key.
6. Add them to `.env.local`:

```env
NEXT_PUBLIC_USE_DUMMY_AUTH=true
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The migrations create profiles, sitter profiles, pets, services, bookings, availability, booking updates, messages, reviews and payments. They also create the signup trigger and Row Level Security policies.

### Create Supabase sample users and data

Copy the server-only service-role key from Supabase project settings into `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Then run:

```powershell
node --env-file=.env.local scripts/create-demo-users.mjs
```

This adds a confirmed parent, verified sitter, administrator, pet, service relationship and sample booking. The service-role key bypasses RLS; never expose it through a `NEXT_PUBLIC_` variable.

### Promote a real administrator

Normal signup accepts only parent or sitter roles. Promote a trusted user through the Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = 'AUTH_USER_UUID';
```

## 7. Switching from dummy auth to Supabase

The Supabase clients and migrations are already included. To complete the switch:

1. Set `NEXT_PUBLIC_USE_DUMMY_AUTH=false`.
2. Replace the local-storage submit logic in `components/AuthForm.tsx` with `signUp` and `signInWithPassword` calls using `lib/supabase/client.ts`.
3. Replace `DummyDashboard` in `app/dashboard/page.tsx` with a server lookup using `lib/supabase/server.ts`.
4. Enable the session proxy guard in `lib/supabase/proxy.ts`.
5. Test all roles and RLS allow/deny cases before deployment.

The original Supabase implementation files remain in the repository so this transition can be made without redesigning the database.

## 8. Troubleshooting

### A previous role keeps appearing

Sign out or clear `rara_dummy_session` in local storage, then sign in again.

### Changes are not visible

Stop the dev server, remove the generated cache, and restart:

```powershell
Remove-Item -Recurse -Force -LiteralPath .next
npm.cmd run dev
```

### Port 3000 is already in use

```powershell
npm.cmd run dev -- --port 3001
```

Then open `http://localhost:3001`.
