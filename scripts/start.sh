#!/bin/bash

# Try to run migrations, but continue even if they fail
# This allows the server to start even if DB isn't immediately available
echo "Attempting to run migrations..."
npx prisma migrate deploy || echo "⚠️  Migration failed, continuing startup..."

# Start the server
echo "Starting server..."
node dist/server.js
