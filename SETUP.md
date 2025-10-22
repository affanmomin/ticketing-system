# Ticketly - Setup Guide

## Demo Accounts

To use the application, you'll need to create demo accounts through the Supabase authentication system.

### Creating Demo Users

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Create the following users:

#### Admin Account
- Email: `admin@example.com`
- Password: `password`
- After creating, add a row to the `users` table:
  - id: (same as auth user id)
  - email: `admin@example.com`
  - full_name: `Admin User`
  - role: `admin`

#### Employee Account
- Email: `employee@example.com`
- Password: `password`
- Add to `users` table with role: `employee`

#### Client Account
- Email: `client@example.com`
- Password: `password`
- Add to `users` table with role: `client`

### Sample Data

Once you have users created, you can add:

1. **Clients**: Create client organizations in the `clients` table
2. **Projects**: Link projects to clients
3. **Tickets**: Create tickets linked to projects
4. **Tags**: Add categorization tags

## Features

- **Dark/Light Theme**: Toggle between themes (default: dark)
- **Command Palette**: Press `Cmd + K` (or `Ctrl + K`) to open
- **Role-Based Access**:
  - Admin: Full access to all features
  - Employee: Access to assigned projects and tickets
  - Client: View projects and create tickets
- **Kanban Board**: Drag-and-drop ticket management
- **Multiple Views**: Kanban, List, Calendar, By Assignee

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (Database + Auth)
- React Router
- DnD Kit (Drag and Drop)
- Framer Motion (Animations)
