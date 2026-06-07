# Sujan Kharel — Personal Portfolio

My personal portfolio website showcasing my projects, work experience, and skills as a Computer Engineering student. Built with Next.js on the frontend and a custom Express.js REST API backend connected to a PostgreSQL database on Supabase. Features a private admin dashboard to manage all content dynamically without touching code. Deployed on Vercel (frontend) and Azure (backend).

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
- Azure — backend

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
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_PASSWORD=yourpassword
```

### 6. Set up backend environment variables

Create `.env` inside the `backend/` folder:

```env
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=https://your_project_id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
ALLOWED_ORIGIN=*
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
  bio TEXT NOT NULL
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