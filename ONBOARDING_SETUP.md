# Onboarding Setup Instructions

## What I've Built

I've created a complete onboarding flow for Evalu8 with the following features:

### 1. **Onboarding Component** (`components/onboarding.tsx`)
   - 3-step carousel onboarding flow with smooth animations
   - Step 1: Welcome screen
   - Step 2: Name input
   - Step 3: Email input
   - Saves user data to localStorage AND database
   - Beautiful UI with Framer Motion animations

### 2. **API Route** (`app/api/user/route.ts`)
   - POST endpoint to save user data
   - Uses Prisma to upsert user in MongoDB
   - Detailed error logging for debugging

### 3. **Prisma Client** (`lib/prisma.ts`)
   - Singleton pattern for Prisma client
   - Prevents multiple instances in development

### 4. **Updated Home Page** (`app/page.tsx`)
   - Checks localStorage for existing user
   - Shows onboarding if no user found
   - Shows dashboard if user exists

## Setup Steps (Run these in order)

### Step 1: Stop the Dev Server
If your dev server is running, stop it first (Ctrl+C in the terminal).

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Push Database Schema
```bash
npx prisma db push
```

### Step 4: Start Dev Server
```bash
npm run dev
```

### Step 5: Test the Onboarding
1. Open http://localhost:3000
2. If you've already completed onboarding, clear localStorage:
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Find localStorage
   - Delete the `evalu8_user` key
   - Refresh the page

## How It Works

### Data Flow:
1. User visits the site
2. `app/page.tsx` checks `localStorage.getItem('evalu8_user')`
3. If no user found → Show `<Onboarding />` component
4. User completes 3 steps (Welcome → Name → Email)
5. On submit:
   - POST request to `/api/user` with name and email
   - API saves to MongoDB via Prisma (upsert operation)
   - User data saved to localStorage
   - Onboarding closes, dashboard appears

### Database Schema:
The User model in Prisma stores:
- `id`: Auto-generated ObjectId
- `email`: Unique identifier
- `name`: User's name
- `role`: Default "user"
- `isActive`: Default true
- `createdAt` & `updatedAt`: Timestamps

## Troubleshooting

### Error: "Failed to save user"
- Check browser console for detailed error message
- Check terminal for server-side logs
- Verify MongoDB connection string in `.env`
- Ensure Prisma client is generated

### Onboarding doesn't show
- Clear localStorage in browser DevTools
- Check that the dev server is running

### Database connection issues
- Verify `.env` has `MONGODB_CONNECTION_STRING` with database name
- Format: `mongodb+srv://user:pass@cluster.mongodb.net/evalu8?appName=Cluster0`
- Note the `/evalu8` database name is now included

## Files Modified/Created

✅ Created:
- `components/onboarding.tsx` - Onboarding UI component
- `app/api/user/route.ts` - User API endpoint
- `lib/prisma.ts` - Prisma client singleton

✅ Modified:
- `app/page.tsx` - Added onboarding logic
- `.env` - Fixed MongoDB connection string (added database name)
- `.env.local` - Fixed MongoDB connection string (added database name)

## Next Steps

After onboarding works, you can:
- Customize the welcome messages
- Add more user fields (avatar, preferences, etc.)
- Add authentication (NextAuth, Clerk, etc.)
- Display user name in the dashboard header
