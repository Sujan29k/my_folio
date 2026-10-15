# Sujan Kharel — Personal Portfolio

My personal portfolio website showcasing my projects, work experience, and skills as a Computer Engineering student. Built with Next.js on the frontend and a custom Express.js REST API backend connected to a PostgreSQL database on Supabase. Features a private admin dashboard to manage all content dynamically without touching code. Deployed on Vercel (frontend) and Render (backend).

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

**Backend**
- Node.js
- Express.js
- PostgreSQL (Supabase)
- Supabase Storage (image uploads)

**Deployment**
- Vercel — frontend
- Render — backend

---

## Features

- Fully dynamic content managed through a private admin dashboard
- Add, edit, and delete projects, work experience, and skills without touching code
- Image upload directly from the admin panel to Supabase Storage
- REST API backend with Express.js
- Responsive design for all screen sizes

---

---

## Get Started

### 1. Clone the project

```bash
git clone https://github.com/Sujan29k/tfolio.git
```

### 2. Go to the project directory

```bash
cd tfolio
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Install backend dependencies

```bash
cd backend && npm install
```

### 5. Set up frontend environment variables

Create `.env.local` in the root folder:

```env
API_URL=http://localhost:3001
ADMIN_PASSWORD=your_private_admin_password
ADMIN_SESSION_SECRET=your_random_secret_at_least_32_characters
ADMIN_API_TOKEN=your_random_server_to_server_token
```

### 6. Set up backend environment variables

Create `.env` inside the `backend/` folder:

```env
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=https://your_project_id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
ADMIN_API_TOKEN=the_same_server_to_server_token_as_the_frontend
```

### 7. Set up Supabase

Create the following tables in your Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS hero (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  github_url TEXT
);

CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  bio TEXT NOT NULL,
  resume_url TEXT
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  items TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[],
  live_url TEXT,
  github_url TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS experience (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  start_date TEXT,
  end_date TEXT,
  logo_url TEXT,
  display_order INT DEFAULT 0
);
```

### 8. Start the backend server

```bash
cd backend
npm run dev
```

### 9. Start the frontend development server

```bash
cd ..
npm run dev
```

### 10. Open in browser

---

## Public server caching and admin updates

The installed Next.js version is **14.2.24** (App Router). The home and projects
pages are Server Components. They pass server-fetched data into the existing
animated client components; public components no longer fetch data in effects.
The cursor and footer remain client components for their browser interactions.

| Backend resource | Data Cache tag | Revalidation interval |
|---|---|---|
| `/api/hero` (name, subtitle/introduction, image URL, GitHub URL) | `hero` | 3600 seconds |
| `/api/about/skills` | `skills` | 3600 seconds |
| `/api/about/resume` | `resume` | 3600 seconds |
| `/api/projects` (shared by home and projects pages) | `projects` | 900 seconds |
| `/api/experience` | `experience` | 900 seconds |

The About paragraphs are static JSX in `About.tsx`, already included in the
server-rendered HTML. The current API has no bio read/update route, so no new
endpoint or database-driven bio was invented. Editing that prose requires a
code deployment. Its skills and résumé data use the hourly caches above.

`lib/server/portfolio.ts` uses Next.js 14's `unstable_cache` to store **validated
successful data** in Next's persistent Data Cache (managed by Vercel in
production; `.next/cache` locally). Cache keys include the backend URL. The inner
fetch deliberately uses `no-store`: there is only one cache, around the validated
result, so even a malformed HTTP 200 cannot poison it. Each resource has its own
cache tag. No Redis, Nginx, browser localStorage cache, or Render memory cache is
needed.

Both public pages call `unstable_noStore()` **outside** the cached helpers.
This skips the Full Route Cache while retaining the Data Cache. In Next.js 14,
a static page with mixed fetch intervals can adopt the shortest interval
(900 seconds here). Rendering from individually cached data keeps the requested
3600/900-second lifetimes independent and avoids caching an error page. The
tradeoff is a Vercel server render per request instead of serving a fully cached
HTML page from the CDN. Existing visual animation delays are preserved.

Intervals are demand-driven, not scheduled jobs. A cold cache waits for Render
and Supabase, fetching all home resources concurrently (up to a 60-second
backend timeout). Later visitors receive cached data in the initial HTML. After
a resource expires, the next read serves its previous value and triggers a
background refresh. A failed background refresh retains the previous successful
value. Without a previous value, a section shows an explicit unavailable message
and retries on the next server request; it is never replaced with fake content.
The database connection must still work for initial population and refreshes.

### Vercel and Render configuration

Copy the placeholders in `.env.example` into local `.env.local`, or configure
these values in Vercel's Environment Variables for the relevant environments:

- `API_URL`: your Render origin, e.g. `https://my-folio-p4od.onrender.com` (no
  `/api` suffix). This server-only variable takes precedence over the existing
  `NEXT_PUBLIC_API_URL`, which remains a supported fallback. A production
  deployment must not point at localhost.
- `ADMIN_PASSWORD`: the password checked by the server. Use a new password;
  the old `NEXT_PUBLIC_ADMIN_PASSWORD` was shipped to browsers. Remove that old
  variable from Vercel and local configuration. There is deliberately no fallback
  to the exposed password.
- `ADMIN_SESSION_SECRET`: a random secret of at least 32 characters. For example,
  generate a value locally with `openssl rand -hex 32`.
- `ADMIN_API_TOKEN`: a separate random server-to-server token. Configure the
  **same value on Render**. It must never have a `NEXT_PUBLIC_` prefix.

Keep existing EmailJS variables. Keep `DATABASE_URL`, `SUPABASE_URL`, and
`SUPABASE_ANON_KEY` on Render. No database credentials belong in the frontend.
Do not commit actual values. Preview deployments should use a separate backend
if you do not want preview admin edits to modify production content.

Deploy the backend guard and frontend changes together after configuring these
variables. Until both are deployed, old browser-based admin writes will be
rejected by the updated backend. Public GET routes remain public. The backend
rejects writes if its token is missing, rather than silently permitting them.

### What happens after an admin edit

The same password-login UI now verifies the password on the server and issues a
signed, HttpOnly, Secure-in-production, SameSite=Strict cookie lasting eight
hours. The localStorage flag has been removed. Dashboard access and every admin
API request check the session; mutations also check the request origin. Changing
the password or signing secret expires existing sessions.

Admin reads and writes use `/api/admin/content/...` with `no-store`. The server
forwards only explicitly allowed operations to Render using `ADMIN_API_TOKEN`.
After a successful write it calls Next.js 14's single-argument
`revalidateTag(tag)` for the affected section. Failed writes do not invalidate
anything; image upload alone does not invalidate content until the image URL is
saved on a section. Admin forms check response status and show failures, and
saved rows are returned or fetched fresh for the admin view.

The next public server request fetches that section again, without waiting for
its timer. Both project pages share the same tag. Existing open public tabs are
not pushed updates; reload them to see the new version. A hard navigation from
admin's “View site” opens a fresh public request. Direct database changes or
scripts that write to Render do not trigger Vercel invalidation and become
visible after time-based refresh. If invalidation itself fails after a save, the
admin receives an explicit “saved, but refresh failed” message.

### Verification

```bash
npm run build
npx tsc --noEmit
npm run test:cache
```

`test:cache` starts the production Next server and an isolated in-memory test
backend on temporary local ports. It never contacts or writes to Supabase. It
checks initial HTML, cache reuse across pages, error recovery, fresh admin reads,
authenticated/tag-specific invalidation, failed writes, create/delete, résumé
clearing, origin/session checks, backend write protection, cache TTL metadata,
and that client bundles contain no admin secrets. Run it after each build.
The build needs Google Fonts network access; the test needs local port binding.
Actual Vercel cache behavior, Render secrets, and database connectivity still
require verification after deployment. Image uploads now pass through the
authenticated Vercel proxy, so keep uploads under 4 MB to allow multipart overhead
within [Vercel's 4.5 MB request limit](https://vercel.com/docs/functions/limitations).

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/hero | Get hero section data |
| PUT | /api/hero | Update hero section |
| GET | /api/projects | Get all projects |
| POST | /api/projects | Add a project |
| PUT | /api/projects/:id | Update a project |
| DELETE | /api/projects/:id | Delete a project |
| GET | /api/experience | Get all experience |
| POST | /api/experience | Add experience |
| PUT | /api/experience/:id | Update experience |
| DELETE | /api/experience/:id | Delete experience |
| GET | /api/about/skills | Get all skills |
| POST | /api/about/skills | Add skill category |
| PUT | /api/about/skills/:id | Update skill category |
| POST | /api/upload | Upload an image |

---

## Usage and Contribution

This is an open source project and you're welcome to use the code or parts of it for your own portfolio. When using this project, make tweaks to the components and styling to really make it your own.

If you're not modifying the design much, please credit me as the original developer.

For any questions or concerns, reach out to me on [LinkedIn](https://linkedin.com/in/sujankharel) or [GitHub](https://github.com/Sujan29k).

---

## Feedback

I'd love to hear your thoughts and suggestions on this project. Feel free to open an issue or reach out directly — your feedback helps me grow as a developer and improve this project for others who want to build their own portfolios.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.