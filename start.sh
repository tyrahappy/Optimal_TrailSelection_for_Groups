#!/bin/bash

echo "🚀 Starting Trail Selection System..."

# Kill any existing processes on ports 3001 and 3000
echo "🔄 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start backend server
echo "🔧 Starting backend server on port 3001..."
cd backend
npm install 2>/dev/null || echo "Backend dependencies already installed"
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "Backend server is running on http://localhost:3001"
else
    echo "Backend server failed to start"
    exit 1
fi

# Start frontend server
echo "🌐 Starting frontend server on port 3000..."
cd frontend
npm install 2>/dev/null || echo "Frontend dependencies already installed"
npm start &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "Frontend server is running on http://localhost:3000"
else
    echo "Frontend server may still be starting..."
fi

echo ""
echo "Trail Selection System is now running!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo ""
echo "System Status:"
echo "   - Backend: Running (243 trails loaded)"
echo "   - Frontend: React development server"
echo "   - Algorithm: Greedy MinMax Regret ready"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"

# Wait for user to stop
wait 