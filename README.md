## Gaten LMS - Development Setup Guide
### Project Structure

/gaten (monorepo)
├── apps/
│   ├── frontend/          # Next.js app (deployed to Vercel)
│   │   └── src/trpc/      # tRPC client setup
│   └── backend/           # Node.js + tRPC server (deployed to Railway)
│       ├── src/           # Server source code
│       ├── schema.prisma  # Database schema
│       └── .env           # Local database connection
├── packages/
│   ├── db/               # Shared database package (unused in production)
│   └── shared/           # Shared types and utilities
└── package.json          # Root workspace configuration


Environment Setup
Local Development Environment Variables
Backend (apps/backend/.env):
bashDATABASE_URL="postgresql://postgres:jJxQuMUuCNGTwobYJsvjiPIVriuEcgWL@shortline.proxy.rlwy.net:47795/railwayL"
Frontend (apps/frontend/.env.local):
bashNEXT_PUBLIC_API_URL=http://localhost:4000
Production Environment Variables
Railway Backend:

DATABASE_URL: ${{ Postgres.DATABASE_URL }} (private network, no egress costs)
NODE_ENV: production

Vercel Frontend:

NEXT_PUBLIC_API_URL: https://gaten-production.up.railway.app

Database Operations
Available Scripts (run from apps/backend/)
bash# Push schema changes to database (no migration files)
npm run db:push

# Generate Prisma client after schema changes  
npm run db:generate

# Create migration files and apply them
npm run db:migrate

# Open Prisma Studio (database browser)
npm run db:studio

# Reset database and run all migrations
npm run db:reset
Development Workflow
bash# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only

# Database operations (from apps/backend/)
cd apps/backend
npm run db:push        # Apply schema changes
npm run db:generate    # Regenerate Prisma client
Database Schema
Current schema includes:

Users (with Admin/Student roles)
Courses (with modules and lessons)
Enrollments (user progress tracking)
Reviews (course ratings and feedback)
Module/Lesson hierarchy

Network Architecture
Local Development

Frontend (localhost:3000) → Backend (localhost:4000) → Railway Database (public URL)

Production

Frontend (Vercel) → Backend (Railway) → Database (Railway private network)

The private network connection between backend and database in production eliminates egress costs for data-heavy operations.
Deployment URLs

Frontend: Auto-deployed to Vercel on git push
Backend: https://gaten-production.up.railway.app
Health Check: https://gaten-production.up.railway.app/health
tRPC Endpoint: https://gaten-production.up.railway.app/trpc

Common Commands
bash# Install dependencies
npm install --workspaces

# Check Railway connection
railway status

# Deploy to Railway (auto on git push)
git push origin main

# Test local tRPC connection
curl http://localhost:4000/health
Troubleshooting

Database connection errors: Ensure .env file exists in apps/backend/
tRPC client errors: Verify backend is running on port 4000
Deployment fails: Check Railway build logs for Prisma generation issues
Missing environment variables: Verify Railway and Vercel dashboard settings

Next Development Phase
Ready to implement:

Better-auth authentication system
Course management CRUD operations
User enrollment and progress tracking
Redis caching layer
Advanced tRPC procedures


This setup provides a scalable foundation for your LMS with proper environment separation and cost-optimized database connectivity.