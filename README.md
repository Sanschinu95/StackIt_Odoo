# StackIt – Minimal Q&A Forum Platform
<<<<<<< HEAD

## Overview

StackIt is a minimal question-and-answer platform for collaborative learning and structured knowledge sharing. It is simple, user-friendly, and focused on the core experience of asking and answering questions within a community.
=======
## Problem Statement 

StackIt – A Minimal Q&A Forum Platform

## Overview

StackIt is a minimal question-and-answer platform for collaborative learning and structured knowledge sharing. It is simple, user-friendly, and focused on the core experience of asking and answering questions within a community. This project is developed for Odoo Hackathon '25 by Team 1276.
>>>>>>> 2871b4cb1e9ac8826c8e3115429571c97adbe100

## Features

- User roles: Guest, User, Admin
- Ask questions with title, rich text description, and tags
- Rich text editor for questions and answers (bold, italic, lists, emoji, links, images, alignment, etc.)
- Answer questions (only logged-in users)
- Voting and accepting answers
- Tagging system
- Notification system (bell icon, unread count, dropdown)
- Mobile compatible UI

<<<<<<< HEAD
## Environment Variables

Create a `.env` file in the root with:

```
DATABASE_URL=""
NEXTAUTH_SECRET=""
GEMINI_API_KEY=""
```

## Getting Started

=======


## Getting Started
0. Your root directory needs a .env file containing DATABASE_URL=" ", NEXTAUTH_SECRET=", "GEMINI_API_KEY=" "(incase you need additional autotagging & other features)
>>>>>>> 2871b4cb1e9ac8826c8e3115429571c97adbe100
1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) to view the app.

---

This project uses Next.js, MongoDB, NextAuth, MUI, and Editor.js.
