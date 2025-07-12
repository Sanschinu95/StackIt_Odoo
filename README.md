# StackIt – Minimal Q&A Forum Platform

## Overview

StackIt is a minimal question-and-answer platform for collaborative learning and structured knowledge sharing. It is simple, user-friendly, and focused on the core experience of asking and answering questions within a community.

## Features

- User roles: Guest, User, Admin
- Ask questions with title, rich text description, and tags
- Rich text editor for questions and answers (bold, italic, lists, emoji, links, images, alignment, etc.)
- Answer questions (only logged-in users)
- Voting and accepting answers
- Tagging system
- Notification system (bell icon, unread count, dropdown)
- Mobile compatible UI

## Environment Variables

Create a `.env.local` file in the root with:

```
DATABASE_URL="mongodb+srv://guruji:guruji1234@cluster0.f3kxw.mongodb.net/gurueternity?retryWrites=true&w=majority&appName=Cluster0"
NEXTAUTH_SECRET="terabhaiseedheguruji"
GEMINI_API_KEY="AIzaSyCOmP0hVH11JOWFiWp4tK-trxpHEGArpiI"
```

## Getting Started

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) to view the app.

---

This project uses Next.js, MongoDB, NextAuth, MUI, and Editor.js.
