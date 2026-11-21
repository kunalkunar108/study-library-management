# Study Library Management Demo

A browser-based demonstration of study library operations for prospective clients.

## Technology

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Lucide icons
- Browser localStorage for demo persistence

## Available workflows

- Corporate overview dashboard with live counts from demo records
- Add, edit and delete branches
- Branch capacity and student count overview
- Add and edit student profiles
- Automatic demo student ID generation
- Delete student records
- Search students by name, ID or phone
- Filter student records by branch
- Save changes in the current browser using localStorage

## Local development

Requirements: Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Development status

- [x] Project foundation
- [x] Corporate application shell and dashboard
- [x] Branch management demo workflows
- [x] Student management demo workflows
- [ ] Admissions enhancements and student documents
- [ ] Seats and memberships
- [ ] Attendance and fee collection
- [ ] Reports
- [ ] Browser and build testing
- [ ] Vercel deployment (requires explicit approval)

## Demo-only notice

This project is a frontend demonstration. It is not intended for real student records, real payments, or production library operations. Do not enter sensitive personal information. Data is stored locally in the browser and is not synchronized between devices or users.
