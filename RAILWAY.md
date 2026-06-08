# Railway Deployment Guide

## Setup Steps

### 1. Create a PostgreSQL Database on Railway
- Go to [Railway Dashboard](https://railway.app/)
- Create a new PostgreSQL database
- Copy the connection string from the database settings

### 2. Set Environment Variables in Railway
In your Railway project settings, add these environment variables:

```
DATABASE_URL=postgresql://user:password@host:port/devspace
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
```

### 3. Configure Build Command
Set the build command to:
```
npm install && npm run build
```

### 4. Configure Start Command
The start command is already configured in `package.json`:
```
npm start
```

This will:
1. Attempt to run database migrations
2. Start the server even if migrations fail on first deploy
3. The server will be accessible once the database is ready

### 5. Deploy
- Push your code to GitHub
- Connect your Railway project to the repository
- Railway will automatically:
  - Run `npm install` 
  - Run `npm run build` (compiles TypeScript and generates Prisma client)
  - Run `npm start` (runs migrations and starts server)

## Troubleshooting

### Database Connection Errors
If you see `Error: P1001: Can't reach database server`, ensure:
1. ✅ DATABASE_URL is set in Railway environment variables
2. ✅ The PostgreSQL database is running in Railway
3. ✅ The connection string format is correct

### Migration Failures
- First deploy may fail migrations - this is normal
- Subsequent deploys will apply migrations correctly
- Check Railway logs for detailed error messages

### Server Won't Start
- Check that `dist/server.js` exists (run `npm run build` locally to test)
- Verify all environment variables are set
- Check Railway logs for error details

## Local Development

To test locally before deploying:

```bash
# Start PostgreSQL
docker-compose up -d

# Install dependencies
pnpm install

# Run migrations
npx prisma migrate deploy

# Start dev server
pnpm dev
```

## Additional Notes

- The new `scripts/start.js` gracefully handles migration failures
- This allows the server to start even if the DB isn't immediately available
- Migrations will be retried on subsequent restarts
