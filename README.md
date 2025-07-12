# [StackIt](https://stack-it-odoo-o89c.vercel.app/) – Minimal Q&A Forum Platform
[deployment link](https://stack-it-odoo-o89c.vercel.app/)
DEMO LOGIN CREDENTIALS:email yeash<at>me<dot>c   password: yeash

## Problem Statement 


StackIt – A Minimal Q&A Forum Platform
## Team Details

- Sanskar Shrivastava: snskrshrvstv@gmail.com
- Yash Dangi: yashdangipcmjee@gmail.com
- Mohammad Maasir: maasir554@gmail.com
- Satyam Vatsal: satyamvatsal257@gmail.com



## Overview

StackIt is a minimal question-and-answer platform for collaborative learning and structured knowledge sharing. It is simple, user-friendly, and focused on the core experience of asking and answering questions within a community. This project is developed for Odoo Hackathon '25 by Team 1276.


## Features

- User roles: Guest, User, Admin
- Ask questions with a title, rich text description, and tags
- Rich text editor for questions and answers (bold, italic, lists, emoji, links, images, alignment, etc.)
- Answer questions (only logged-in users)
- Voting and accepting answers
- Tagging system
- Notification system (bell icon, unread count, dropdown)
- Mobile-compatible UI


## Environment Variables

Create a `.env` file in the root with:

```
DATABASE_URL=""
NEXTAUTH_SECRET=""
GEMINI_API_KEY=""
```

## Getting Started (Locally running code)

Your root directory needs a .env file containing DATABASE_URL=" ", NEXTAUTH_SECRET=", "GEMINI_API_KEY=" "(incase you need additional autotagging & other features)
0. Add .env
1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) to view the app.

---


