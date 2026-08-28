# IssueFlow — Full-Stack Production Capstone

IssueFlow is a responsive full-stack service request and issue tracking application. Users can create and manage support tickets, discuss updates through comments, search/filter requests, and follow progress from a dashboard. Administrators can view all tickets, update ticket status, and manage user roles.

## Live Demo

- Frontend: `ADD_YOUR_VERCEL_URL_HERE`
- Backend API: `ADD_YOUR_RENDER_URL_HERE`
- GitHub: `ADD_YOUR_GITHUB_REPO_HERE`

## Capstone Requirements Covered

- 8+ frontend views: Home, Login, Register, Dashboard, Tickets, New/Edit Ticket, Ticket Detail, Profile, Admin
- Flask REST API with persistent SQL database
- Full CRUD on two related resources: Tickets and Comments
- JWT authentication and protected frontend/backend routes
- Role-based permissions for users and admins
- Client-side and server-side validation
- Loading, error and empty states
- Responsive polished UI
- Search and filters
- Dashboard chart
- Dark mode
- 13 automated tests total: 8 backend + 5 frontend
- Production deployment configuration for Vercel + Render/PostgreSQL

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Recharts
- Vitest + React Testing Library

### Backend
- Python
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Werkzeug password hashing
- Pytest

### Database
- SQLite for local development
- PostgreSQL for production

## Architecture

```text
React/Vite Frontend
       |
       | HTTPS / JSON REST API
       v
Flask Backend + JWT Auth
       |
       v
SQLAlchemy ORM
       |
       +--> SQLite (local)
       +--> PostgreSQL (production)
```

Core entities:

```text
User 1 ---- * Ticket 1 ---- * Comment
  |                         /
  +------------------------*
```

A user owns tickets and comments. Each comment belongs to one ticket. Admin users can inspect all requests and update ticket statuses.

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_REPO_URL
cd issueflow-capstone
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
```

Windows PowerShell:

```powershell
venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:JWT_SECRET_KEY="development-secret"
python app.py
```

Windows CMD:

```cmd
venv\Scripts\activate
pip install -r requirements.txt
set JWT_SECRET_KEY=development-secret
python app.py
```

Backend runs at `http://localhost:5000`.

Default local admin account:
- Email: `admin@issueflow.com`
- Password: `Admin123!`

Change these values with environment variables before production deployment.

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

Backend:

```env
JWT_SECRET_KEY=replace-with-a-long-random-secret
DATABASE_URL=sqlite:///issueflow.db
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@issueflow.com
ADMIN_PASSWORD=Admin123!
```

Frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run Tests

Backend:

```bash
cd backend
pytest -q
```

Frontend:

```bash
cd frontend
npm test
```

## Production Deployment

### Backend on Render

1. Push the project to GitHub.
2. In Render, create a new Blueprint and select this repository, or manually create a Python web service with `backend` as the root directory.
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Create a PostgreSQL database and set `DATABASE_URL`.
6. Add `JWT_SECRET_KEY`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
7. After deploying the frontend, set `FRONTEND_URL` to the Vercel URL.

### Frontend on Vercel

1. Import the same GitHub repository into Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Vite.
4. Add environment variable:
   - `VITE_API_URL=https://YOUR-RENDER-API.onrender.com/api`
5. Deploy.

## API Summary

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile

GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
DELETE /api/tickets/:id

POST   /api/tickets/:id/comments
PUT    /api/comments/:id
DELETE /api/comments/:id

GET    /api/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/role
```

## Case Study

### Problem

Service requests are often reported through scattered messages, emails, or verbal conversations. This makes it difficult to know what was reported, who is responsible, and whether the problem was resolved. IssueFlow centralizes the full request lifecycle in one searchable application.

### Why I chose this stack

React provides a component-based frontend that is easy to scale across multiple views. Flask keeps the backend API lightweight and readable while still supporting authentication, validation, role-based authorization, and database access. SQLAlchemy makes local SQLite development and production PostgreSQL deployment straightforward. JWT authentication fits the separated frontend/backend architecture well.

### A challenge and how I solved it

A key challenge was preventing users from accessing or editing requests that do not belong to them while still allowing administrators to manage every request. I solved this on the server instead of relying only on hidden frontend controls. Each protected ticket and comment route checks the authenticated user's ID and role before returning or modifying data. This means unauthorized requests remain blocked even if someone manually calls the API.

## Future Improvements

- File/image attachments on tickets
- Real-time notification updates using WebSockets
- Email notifications
- Ticket assignment to staff members
- Audit logs
- CI/CD workflow with GitHub Actions

## Screenshots

Add screenshots after running the app:

```md
![Home](screenshots/home.png)
![Dashboard](screenshots/dashboard.png)
![Tickets](screenshots/tickets.png)
![Ticket Detail](screenshots/ticket-detail.png)
![Admin](screenshots/admin.png)
```
