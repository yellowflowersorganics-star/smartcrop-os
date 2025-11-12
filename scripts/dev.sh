#!/bin/bash

# SmartCrop OS - Development Script
# Start all services for local development

echo "🌱 Starting SmartCrop OS Development Environment"
echo "================================================"

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    jobs -p | xargs kill 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✓ Services started:"
echo "  - Backend: http://localhost:3000"
echo "  - Frontend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for any process to exit
wait

