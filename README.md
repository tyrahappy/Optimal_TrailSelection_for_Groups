# 🏔️ Optimal Trail Selection for Groups

A sophisticated trail recommendation system that uses advanced algorithms to find the perfect hiking trails for groups with diverse preferences. The system implements both **Greedy MinMax Regret** and **Pareto Weighted Scoring** algorithms to balance individual satisfaction with group consensus.

## 🎯 Features

### 🤖 **Dual Algorithm System**
- **Greedy MinMax Regret**: Minimizes maximum regret across all group members
- **Pareto Weighted Scoring**: Uses Pareto frontier + weighted scoring for optimal balance
- **Algorithm Comparison**: Built-in comparison tools for different group scenarios

### 📊 **Complete Methodology Implementation**
- **Individual Utility Function**: 5-criteria utility based on difficulty, distance, time, elevation, and preferences
- **Gaussian Preference Function**: Sophisticated distance preference modeling
- **Group Satisfaction Model**: Combines average satisfaction, fairness, consensus, and controversy metrics
- **Social Choice Theory**: Grounded in multi-attribute decision-making principles

### 👥 **Group-Specific Scenarios**
- **Family Groups**: Diverse ages and fitness levels (parents, children, grandparents)
- **Friends Groups**: Similar interests with compromise capabilities
- **Expert Groups**: Experienced hikers with specialized preferences

### 🎨 **Modern Web Interface**
- **React Frontend**: Interactive group setup and preference collection
- **Real-time Recommendations**: Instant trail suggestions with detailed metrics
- **Responsive Design**: Works on desktop and mobile devices
- **Orange Gradient Theme**: Beautiful and modern UI

## 🚀 Quick Start

### One-Click Setup
```bash
./start.sh
```

### Manual Setup
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm start
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📁 Project Structure

```
Optimal_TrailSelection_for_Groups/
├── 📁 frontend/                    # React frontend
│   ├── 📁 src/
│   │   ├── InteractiveTrailSelector.js  # Main component
│   │   ├── index.js               # App entry
│   │   └── index.css              # Styles
│   └── package.json
│
├── 📁 backend/                     # Node.js backend
│   ├── 📁 csv/                    # Trail data
│   │   ├── van_wa_200_sorted.csv  # 200+ Pacific Northwest trails
│   │   └── README.md
│   ├── 📁 utils/
│   │   ├── groupSatisfaction.js   # Complete methodology
│   │   └── normalize.js           # Data normalization
│   ├── server.js                  # Express server
│   ├── greedyMinMaxRegret.js      # Greedy algorithm
│   ├── paretoWeightedScoring.js   # Pareto algorithm
│   ├── test_comparison.js         # Algorithm comparison
│   ├── test_greedy.js            # Greedy testing
│   ├── test_pareto.js            # Pareto testing
│   └── package.json
│
├── start.sh                       # One-click start
└── README.md                      # This file
```

## 🧮 Algorithm Details

### Greedy MinMax Regret Algorithm
**Best for**: Diverse preferences, fairness-focused groups

1. **Utility Calculation**: Individual satisfaction based on 5 criteria
2. **Regret Minimization**: Finds trails that minimize maximum group regret
3. **Diversity Enhancement**: Ensures varied trail selections
4. **Iterative Selection**: Greedy approach for optimal combination

### Pareto Weighted Scoring Algorithm
**Best for**: Similar preferences, consensus-building groups

1. **Pareto Frontier**: Identifies non-dominated solutions
2. **Weighted Scoring**: Applies methodology weights to Pareto set
3. **Multi-objective Optimization**: Balances multiple criteria
4. **Consensus Building**: Optimizes for group agreement

### Complete Methodology
```javascript
// Individual Utility Function (0-100 scale)
utility = difficulty_score + distance_score + time_score + 
          elevation_score + preference_score

// Group Satisfaction Model
group_score = 0.4 * avg_satisfaction + 
              0.3 * fairness_score + 
              0.3 * consensus_degree
```

## 📊 Performance Metrics

### Algorithm Comparison Metrics
- **Average Rating**: Trail quality assessment
- **Average Distance**: Physical accessibility
- **Diversity Score**: Trail variety percentage
- **Regret Score**: Maximum group dissatisfaction
- **Average Satisfaction**: Overall group happiness
- **Fairness Score**: Minimum member satisfaction
- **Consensus Degree**: Group agreement level
- **Controversy Level**: Preference variance

### Group-Specific Recommendations
- **Family**: Safety, accessibility, fairness across ages
- **Friends**: Compromise, shared experiences, group dynamics
- **Expert**: Technical difficulty, specialized interests, challenge level

## 🧪 Testing & Development

### Run Algorithm Tests
```bash
cd backend

# Test Greedy algorithm
node test_greedy.js

# Test Pareto algorithm
node test_pareto.js

# Compare both algorithms
node test_comparison.js
```

### Test Scenarios
1. **Family Group**: Diverse ages and fitness levels
2. **Friends Group**: Similar interests with compromise
3. **Expert Group**: Experienced hikers with specialized preferences

## 📈 Performance Characteristics

### Time Complexity
- **Greedy MinMax Regret**: O(k × n × m)
- **Pareto Weighted Scoring**: O(n² + k × n × m)
- Where: k = trails to select, n = total trails, m = group size

### Scalability
- **Trail Dataset**: 200+ Pacific Northwest trails
- **Group Size**: 2-10+ members
- **Real-time Processing**: < 1 second response time

## 🔧 API Endpoints

### Core Endpoints
- `GET /api/trails` - Get all trails with filtering
- `POST /api/trails/recommend` - Get group recommendations
- `GET /api/health` - Server health check

### Filtering Options
- Difficulty: Easy, Moderate, Hard
- Distance: 0-50km range
- Time: 0-12 hours
- Elevation: 0-3000m
- Scenery: Ocean, Mountain, Forest, Lake, etc.

## 🎨 Frontend Features

### Group Setup
- **Member Management**: Add/remove group members
- **Preference Collection**: Individual preference forms
- **Constraint Setting**: Physical and time limitations

### Results Display
- **Trail Cards**: Detailed trail information
- **Metrics Dashboard**: Algorithm performance metrics
- **Group Satisfaction**: Individual and collective scores
- **Comparison View**: Side-by-side algorithm results

## 🚀 Future Enhancements

### Planned Features
1. **Machine Learning Integration**: ML-based preference prediction
2. **Real-time Updates**: WebSocket support for live updates
3. **Advanced Filtering**: More sophisticated filtering options
4. **User Feedback**: Incorporate user ratings and feedback
5. **Mobile App**: Native mobile application
6. **Social Features**: Share recommendations and group planning

### Technical Improvements
1. **Caching**: Redis integration for faster responses
2. **Database**: PostgreSQL for persistent data
3. **Authentication**: User accounts and saved preferences
4. **API Documentation**: Swagger/OpenAPI documentation
5. **Testing**: Comprehensive unit and integration tests

## 📚 Methodology References

This project implements advanced concepts from:
- **Social Choice Theory**: Group decision-making principles
- **Multi-Attribute Decision Making (MADM)**: Multi-criteria evaluation
- **Gaussian Preference Functions**: Sophisticated preference modeling
- **Pareto Optimality**: Multi-objective optimization
- **Regret Minimization**: Worst-case scenario optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Pacific Northwest Trail Data**: Real hiking trail information
- **React Community**: Frontend framework and ecosystem
- **Node.js Community**: Backend runtime and packages
- **Academic Research**: Social choice theory and group decision-making

---

**Built with ❤️ for outdoor enthusiasts and group adventure planning** 