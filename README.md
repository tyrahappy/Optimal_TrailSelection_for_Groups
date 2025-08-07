# 🏔️ Optimal Trail Selection for Groups

A sophisticated trail recommendation system that uses advanced algorithms to find the perfect hiking trails for groups with diverse preferences. The system implements both **Greedy MinMax Regret** and **Pareto Weighted Scoring** algorithms to balance individual satisfaction with group consensus.

## 🎯 Features

### 🤖 **Dual Algorithm System**
- **Greedy MinMax Regret**: Minimizes maximum regret across all group members
- **Pareto Weighted Scoring**: Uses Pareto frontier + weighted scoring for optimal balance
- **Complete Methodology**: Individual utility functions with 5-criteria evaluation
- **Group Satisfaction Model**: Combines average satisfaction, fairness, and consensus metrics
- **Social Choice Theory**: Grounded in multi-attribute decision-making principles

### 📊 **Comprehensive Evaluation System**
- **Individual Utility Function**: 5-criteria utility based on difficulty, distance, time, elevation, and preferences
- **Gaussian Preference Function**: Sophisticated distance preference modeling
- **Group Satisfaction Model**: Combines average satisfaction, fairness, consensus, and controversy metrics
- **Diversity Enhancement**: Ensures varied trail selections for better group experience

### 👥 **Group-Specific Scenarios**
- **Family Groups**: Diverse ages and fitness levels (parents, children, grandparents)
- **Friends Groups**: Similar interests with compromise capabilities
- **Expert Groups**: Experienced hikers with specialized preferences

### 🎨 **Modern Web Interface**
- **React Frontend**: Interactive group setup and preference collection
- **Real-time Recommendations**: Instant trail suggestions with detailed metrics
- **Responsive Design**: Works on desktop devices
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
│   │   ├── groupSatisfaction.js   # Core methodology
│   │   └── normalize.js           # Data normalization
│   ├── server.js                  # Express server with simplified API
│   ├── greedyMinMaxRegret.js      # Greedy algorithm
│   ├── paretoWeightedScoring.js   # Pareto algorithm
│   ├── test_greedy.js            # Greedy testing
│   ├── test_pareto.js            # Pareto testing
│   ├── test_comparison.js        # Algorithm comparison
│   └── package.json
│
├── start.sh                       # One-click start
└── README.md                      # This file
```

## 🧮 Algorithm Details

### Greedy MinMax Regret Algorithm
**Best for**: Diverse preferences, fairness-focused groups

**Core Principle**: Minimizes the maximum regret across all group members by iteratively selecting trails that reduce the worst-case dissatisfaction.

**Algorithm Steps**:
1. **Individual Utility Calculation**: Each member's satisfaction based on 5 criteria
2. **Regret Computation**: Calculate potential regret for each candidate trail
3. **Greedy Selection**: Choose trail that minimizes maximum group regret
4. **Diversity Enhancement**: Optional diversity consideration for varied selections
5. **Iterative Process**: Repeat until k trails are selected

**Key Features**:
- **Regret Minimization**: Ensures no member is severely dissatisfied
- **Diversity Control**: Optional similarity-based diversity scoring
- **Adaptive Weights**: Configurable regret vs diversity balance
- **Scalable**: O(k × n × m) time complexity

### Pareto Weighted Scoring Algorithm
**Best for**: Similar preferences, consensus-building groups

**Core Principle**: Uses Pareto frontier to identify non-dominated solutions, then applies weighted scoring for final selection.

**Algorithm Steps**:
1. **Pareto Frontier**: Identify non-dominated solutions using multi-objective optimization
2. **Objective Vector**: 6-dimensional evaluation (satisfaction, fairness, accessibility, distance, time, consensus)
3. **Dominance Check**: Solution A dominates B if A ≥ B on all objectives and A > B on at least one
4. **Weighted Scoring**: Apply methodology weights to Pareto set
5. **Final Selection**: Choose top-k trails from weighted Pareto set

**Key Features**:
- **Multi-Objective**: Balances multiple conflicting objectives
- **Pareto Optimal**: Guarantees no dominated solutions
- **Consensus Focus**: Optimizes for group agreement
- **Methodology Aligned**: Uses same weights as satisfaction model

### Complete Methodology Implementation

**Individual Utility Function** (0-100 scale):
```javascript
utility = difficulty_score + distance_score + time_score + 
          elevation_score + preference_score
```

**Group Satisfaction Model**:
```javascript
group_score = 0.4 * avg_satisfaction + 
              0.3 * fairness_score + 
              0.3 * consensus_degree
```

**Pareto Objective Vector** (6-dimensional):
```javascript
objectives = [
  avg_satisfaction,      // Average group satisfaction
  fairness_score,        // Minimum member satisfaction
  accessibility,         // Difficulty-based accessibility
  distance_score,        // Normalized distance preference
  time_score,           // Normalized time preference
  consensus_degree       // Group agreement level
]
```

**Algorithm Comparison**:
| Aspect | Greedy MinMax Regret | Pareto Weighted Scoring |
|--------|----------------------|-------------------------|
| **Focus** | Fairness & Regret Minimization | Consensus & Multi-objective |
| **Complexity** | O(k × m x n² × logn) | O(n² × m) |

### Implementation Examples

**Greedy MinMax Regret Usage**:
```javascript
const { greedyMinMaxRegret } = require('./greedyMinMaxRegret');

const options = {
  considerDiversity: true,
  diversityWeight: 0.3,
  regretWeight: 0.7
};

const recommendations = greedyMinMaxRegret(trails, groupMembers, 5, options);
```

**Pareto Weighted Scoring Usage**:
```javascript
const { selectParetoK } = require('./paretoWeightedScoring');

const weights = {
  avg: 0.4,    // Average satisfaction weight
  min: 0.3,    // Fairness score weight
  cons: 0.3    // Consensus degree weight
};

const recommendations = selectParetoK(trails, groupMembers, 5, weights);
```

## 📊 Performance Metrics

### Algorithm Metrics
- **Average Rating**: Trail quality assessment (1-5 stars)
- **Average Distance**: Physical accessibility (km)
- **Average Satisfaction**: Overall group happiness (0-100%)
- **Fairness Score**: Minimum member satisfaction (0-100%)
- **Consensus Degree**: Group agreement level (0-100%)
- **Diversity Score**: Trail variety percentage (0-100%)
- **Regret Score**: Maximum group dissatisfaction (0-100%)

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
- `GET /api/trails` - Get all trails
- `GET /api/trails/filter` - Get filtered trails
- `POST /api/trails/recommend` - Get group recommendations
- `GET /api/scenery-types` - Get all scenery types
- `GET /api/trails/stats` - Get trail statistics
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
- **Real-time Updates**: Instant recommendation updates

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

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Pacific Northwest Trail Data**: Real hiking trail information
- **React Community**: Frontend framework and ecosystem
- **Node.js Community**: Backend runtime and packages
- **Academic Research**: Social choice theory and group decision-making
