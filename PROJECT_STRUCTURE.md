# 📁 Project Structure

## 🎯 Correct File Organization

```
Optimal_TrailSelection_for_Groups/
├── 📁 frontend/                    # React frontend app
│   ├── 📁 public/                  # Static files
│   │   └── index.html             # React entry HTML
│   ├── 📁 src/                    # React source code
│   │   ├── index.js               # React app entry
│   │   ├── index.css              # Global styles
│   │   └── InteractiveTrailSelector.js  # Main component
│   └── package.json               # Frontend dependencies
│
├── 📁 backend/                    # Node.js backend app
│   ├── 📁 csv/                    # Data files
│   │   ├── van_wa_200_sorted.csv # Trail data
│   │   ├── van_wa_200_sorted.json
│   │   └── README.md
│   ├── server.js                  # Express server
│   ├── greedyMinMaxRegret.js      # Core algorithm
│   ├── demo.js                    # Algorithm demo
│   ├── package.json               # Backend dependencies
│   └── node_modules/              # Backend node modules
│
├── start.sh                       # One-click start script
├── QUICK_START.md                 # Quick start guide
├── PROJECT_STRUCTURE.md           # Project structure doc
└── README.md                      # Project overview
```

## ✅ Current Status

### Frontend (frontend/)
- ✅ **React project structure**: Correct `src/` and `public/` directories
- ✅ **Component file**: `InteractiveTrailSelector.js` in the right place
- ✅ **Entry files**: `index.js` and `index.html` configured correctly
- ✅ **Dependency management**: `package.json` includes all required dependencies
- ✅ **Proxy config**: Automatically proxies to backend API

### Backend (backend/)
- ✅ **Express server**: `server.js` in the right place
- ✅ **Algorithm module**: `greedyMinMaxRegret.js` as a separate module
- ✅ **Data files**: CSV data in `csv/` directory
- ✅ **Dependency management**: `package.json` includes all required dependencies
- ✅ **Demo script**: `demo.js` for algorithm testing

## 🚀 How to Start

### Method 1: One-click start
```bash
./start.sh
```

### Method 2: Start separately
```bash
# Start backend
cd backend
npm install
npm start

# Start frontend (in a new terminal)
cd frontend
npm install
npm start
```

## 📊 Port Configuration

- **Frontend**: http://localhost:3000 (React dev server)
- **Backend**: http://localhost:3001 (Express API server)

## 🔧 Development Workflow

### Frontend development
```bash
cd frontend
npm start  # Start dev server
# Edit src/InteractiveTrailSelector.js
```

### Backend development
```bash
cd backend
npm run dev  # Use nodemon for auto-reload
# Edit server.js or greedyMinMaxRegret.js
```

### Algorithm testing
```bash
cd backend
node demo.js  # Run algorithm demo
```

## 📁 File Responsibilities

### Frontend files
- `frontend/src/InteractiveTrailSelector.js`: Main React component
- `frontend/src/index.js`: React app entry
- `frontend/public/index.html`: HTML template
- `frontend/package.json`: Frontend dependencies and scripts

### Backend files
- `backend/server.js`: Express server and API routes
- `backend/greedyMinMaxRegret.js`: Greedy MinMax Regret algorithm
- `backend/demo.js`: Algorithm demo and testing
- `backend/csv/`: Trail data files
- `backend/package.json`: Backend dependencies and scripts

### Project files
- `start.sh`: One-click start script
- `QUICK_START.md`: User quick start guide
- `PROJECT_STRUCTURE.md`: Developer documentation
- `README.md`: Project overview

## ✅ Best Practices

1. **Separation of concerns**: Frontend and backend are fully separated
2. **Modular design**: Algorithm is independent from server code
3. **Data-driven**: Uses real CSV data
4. **Developer-friendly**: Hot reload and auto-restart
5. **Complete documentation**: Every part is explained

## 🎯 Next Steps

Your project structure is now fully correct! You can start developing:

1. Visit http://localhost:3000 to view the frontend
2. Test the API endpoint at http://localhost:3001/api/health
3. Start adding new features or optimizing existing code 