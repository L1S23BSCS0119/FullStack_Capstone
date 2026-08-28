# IssueFlow — Full-Stack Production Capstone

IssueFlow is a responsive full-stack service request and issue tracking application. Users can create and manage support tickets, discuss updates through comments, search/filter requests, and follow progress from a dashboard. Administrators can view all tickets, update ticket status, and manage user roles.

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



