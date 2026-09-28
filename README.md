# Multi-Agent Helpdesk Ticketing System — Frontend

A React + Vite frontend for a multi-agent customer support ticketing system.

The application provides separate workflows for customers and support agents and communicates with the NestJS backend through REST APIs.

## Tech Stack

* React
* Vite
* JavaScript
* Axios
* React Router
* CSS
* JWT authentication

## Features

### Customer Dashboard

Customers can:

* Register an account
* Login
* Create support tickets
* Select ticket urgency
* View their submitted tickets
* View ticket status
* View SLA deadline
* View remaining SLA time
* See overdue tickets
* Logout

### Agent Dashboard

Agents can:

* Login
* View the Open ticket queue
* Claim available tickets
* View tickets currently assigned to them
* Resolve assigned tickets
* View ticket urgency and status
* View SLA deadline
* See a live SLA countdown
* See tickets marked overdue
* Logout

## Ticket Workflow

```text
Customer creates ticket
        ↓
      Open
        ↓
Agent claims ticket
        ↓
   In Progress
        ↓
Agent resolves ticket
        ↓
     Resolved
```

## Live SLA Countdown

The agent dashboard maintains a local clock that updates every second.

This allows the remaining SLA time to change continuously without requiring a page refresh.

Example:

```text
23h 59m 58s
23h 59m 57s
23h 59m 56s
...
```

When the SLA deadline is reached, the ticket is displayed as:

```text
OVERDUE
```

The backend remains the authoritative source for the actual SLA state.

## Agent Heartbeat

After an agent claims a ticket, the frontend periodically sends heartbeat requests to the backend.

The heartbeat keeps the agent's 3-minute ticket lock alive while the agent is actively working.

If the browser or network connection is lost and heartbeats stop, the backend eventually releases the ticket back into the Open queue.

The backend, rather than the frontend, is responsible for enforcing this behavior.

## Automatic Dashboard Refresh

The agent dashboard refreshes ticket data periodically so that changes made by other agents or the backend become visible without requiring a manual page refresh.

## Authentication

The frontend stores the JWT access token locally after login and automatically attaches it to API requests using an Axios interceptor.

Authenticated requests use:

```http
Authorization: Bearer <access-token>
```

Users are redirected to the appropriate dashboard based on their role.

## API Configuration

The API client is configured in:

```text
src/api.js
```

The current local development API URL is:

```text
http://localhost:5000
```

Before production deployment, this should be changed to the deployed backend URL.

## Installation

Clone the repository:

```bash
git clone https://github.com/Navyasripuvvada/task3-frontend.git
cd task3-frontend
```

Install dependencies:

```bash
npm install
```

## Run Locally

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated production files are placed in:

```text
dist/
```

## Project Structure

```text
task3-frontend/
├── public/
├── src/
│   ├── pages/
│   │   ├── AgentDashboard.jsx
│   │   ├── CustomerDashboard.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## User Roles

### CUSTOMER

Can:

* Register/login
* Create tickets
* View own tickets

Cannot:

* Access the agent queue
* Claim tickets
* Resolve tickets
* Modify another user's tickets

### AGENT

Can:

* View Open tickets
* Claim tickets
* View assigned tickets
* Send heartbeats
* Resolve assigned tickets

Backend authorization remains responsible for enforcing these permissions.

## Backend Dependency

The frontend requires the NestJS backend to be running.

Local development:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

Swagger API documentation:

```text
http://localhost:5000/api
```

## Testing

The application was tested for:

* Customer registration and login
* Agent login
* Ticket creation
* Ticket queue
* Ticket claiming
* Concurrent ticket claiming
* Agent ownership protection
* Ticket resolution
* Ghosted agent recovery
* Live SLA countdown
* Overdue ticket handling
* Unauthorized API access

## Deployment

The frontend is designed to be deployed as a Vite application.

Recommended Vercel settings:

```text
Framework:
Vite

Build Command:
npm run build

Output Directory:
dist
```

The production frontend must be configured to communicate with the deployed backend API rather than:

```text
http://localhost:5000
```

## Repository

GitHub:

https://github.com/Navyasripuvvada/task3-frontend
