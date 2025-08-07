const { greedyMinMaxRegret } = require('./greedyMinMaxRegret');
const { selectParetoK } = require('./paretoWeightedScoring');
const { calculateGroupSatisfaction, individualUtility } = require('./utils/groupSatisfaction');

console.log("=== Algorithm Comparison Test ===\n");

// Sample trail data (same as before)
const sampleTrails = [
  {
    trail_id: "BC_001",
    trail_name: "Alice Lake",
    location: "Squamish, BC",
    difficulty: "Easy",
    distance_km: 4.5,
    estimated_time_hours: 2.0,
    elevation_gain_m: 150,
    rating: 4.4,
    scenery_types: ["Lake", "Forest"],
    trail_type: "Loop"
  },
  {
    trail_id: "BC_075",
    trail_name: "Joffre Lakes",
    location: "Pemberton, BC",
    difficulty: "Moderate",
    distance_km: 11.0,
    estimated_time_hours: 4.0,
    elevation_gain_m: 400,
    rating: 4.9,
    scenery_types: ["Lakes", "Glaciers", "Alpine"],
    trail_type: "Out & Back"
  },
  {
    trail_id: "BC_061",
    trail_name: "Garibaldi Lake",
    location: "Whistler, BC",
    difficulty: "Hard",
    distance_km: 18.0,
    estimated_time_hours: 8.0,
    elevation_gain_m: 820,
    rating: 4.8,
    scenery_types: ["Lake", "Mountain views", "Alpine"],
    trail_type: "Out & Back"
  },
  {
    trail_id: "WA_056",
    trail_name: "Narada Falls",
    location: "Paradise, WA",
    difficulty: "Easy",
    distance_km: 0.2,
    estimated_time_hours: 0.1,
    elevation_gain_m: 50,
    rating: 4.3,
    scenery_types: ["Waterfall", "Alpine"],
    trail_type: "Out & Back"
  },
  {
    trail_id: "WA_084",
    trail_name: "Second Beach Trail",
    location: "Olympic Peninsula, WA",
    difficulty: "Easy",
    distance_km: 1.4,
    estimated_time_hours: 0.8,
    elevation_gain_m: 100,
    rating: 4.7,
    scenery_types: ["Beach", "Ocean"],
    trail_type: "Out & Back"
  },
  {
    trail_id: "BC_002",
    trail_name: "Quarry Rock",
    location: "North Vancouver, BC",
    difficulty: "Easy",
    distance_km: 3.5,
    estimated_time_hours: 1.5,
    elevation_gain_m: 200,
    rating: 4.6,
    scenery_types: ["Ocean views", "Forest"],
    trail_type: "Out & Back"
  },
  {
    trail_id: "BC_003",
    trail_name: "Rice Lake Loop",
    location: "North Vancouver, BC",
    difficulty: "Easy",
    distance_km: 3.0,
    estimated_time_hours: 1.0,
    elevation_gain_m: 50,
    rating: 4.3,
    scenery_types: ["Lake", "Forest"],
    trail_type: "Loop"
  },
  {
    trail_id: "BC_004",
    trail_name: "Lost Lake Loop",
    location: "Whistler, BC",
    difficulty: "Easy",
    distance_km: 5.0,
    estimated_time_hours: 2.0,
    elevation_gain_m: 100,
    rating: 4.4,
    scenery_types: ["Lake", "Forest"],
    trail_type: "Loop"
  },
  {
    trail_id: "BC_005",
    trail_name: "Grouse Grind",
    location: "North Vancouver, BC",
    difficulty: "Hard",
    distance_km: 2.9,
    estimated_time_hours: 1.5,
    elevation_gain_m: 853,
    rating: 4.1,
    scenery_types: ["Mountain views", "Forest"],
    trail_type: "Out & Back"
  },
  {
    trail_id: "BC_006",
    trail_name: "Stanley Park Seawall",
    location: "Vancouver, BC",
    difficulty: "Easy",
    distance_km: 10.0,
    estimated_time_hours: 3.0,
    elevation_gain_m: 50,
    rating: 4.5,
    scenery_types: ["Ocean views", "City skyline", "Parks"],
    trail_type: "Loop"
  }
];

// Test scenarios with complete methodology format
const scenarios = [
  {
    name: "Scenario 1: Family Group",
    description: "Family with diverse ages and fitness levels - parents, children, grandparents",
    groupPreferences: [
      {
        name: "Dad",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 6,
        max_time: 3,
        max_elevation: 300,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.2,
        difficulty_weight: 0.15,
        preferred_scenery_types: ["mountain", "lake", "forest"],
        scenery_weight: 0.2
      },
      {
        name: "Mom",
        acceptable_difficulties: ['Easy'],
        preferred_distance: 4,
        max_time: 2,
        max_elevation: 200,
        distance_weight: 0.3,
        time_weight: 0.3,
        elevation_weight: 0.2,
        difficulty_weight: 0.1,
        preferred_scenery_types: ["lake", "forest", "beach"],
        scenery_weight: 0.2
      },
      {
        name: "Teenager",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 2,
        max_time: 1,
        max_elevation: 250,
        distance_weight: 0.2,
        time_weight: 0.2,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["mountain", "waterfall", "alpine"],
        scenery_weight: 0.2
      },
      {
        name: "Grandparent",
        acceptable_difficulties: ['Easy'],
        preferred_distance: 2,
        max_time: 1.5,
        max_elevation: 100,
        distance_weight: 0.4,
        time_weight: 0.3,
        elevation_weight: 0.2,
        difficulty_weight: 0.05,
        preferred_scenery_types: ["lake", "forest", "park"],
        scenery_weight: 0.2
      }
    ]
  },
  {
    name: "Scenario 2: Friends Group",
    description: "Group of friends with similar interests and fitness levels",
    groupPreferences: [
      {
        name: "Alex",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 8,
        max_time: 4,
        max_elevation: 600,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["lake", "mountain", "forest"],
        scenery_weight: 0.2
      },
      {
        name: "Sam",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 6,
        max_time: 3,
        max_elevation: 400,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["lake", "ocean", "beach"],
        scenery_weight: 0.2
      },
      {
        name: "Jordan",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 7,
        max_time: 3.5,
        max_elevation: 500,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["lake", "waterfall", "forest"],
        scenery_weight: 0.2
      },
      {
        name: "Taylor",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 9,
        max_time: 4.5,
        max_elevation: 700,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["mountain", "lake", "alpine"],
        scenery_weight: 0.2
      }
    ]
  },
  {
    name: "Scenario 3: Expert Group",
    description: "Experienced hikers with diverse preferences and high fitness levels",
    groupPreferences: [
      {
        name: "Mountain Expert",
        acceptable_difficulties: ['Moderate', 'Hard'],
        preferred_distance: 15,
        max_time: 8,
        max_elevation: 1200,
        distance_weight: 0.2,
        time_weight: 0.2,
        elevation_weight: 0.35,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["mountain", "alpine", "glacier"],
        scenery_weight: 0.2
      },
      {
        name: "Photography Expert",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 10,
        max_time: 5,
        max_elevation: 800,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.15,
        preferred_scenery_types: ["waterfall", "lake", "alpine"],
        scenery_weight: 0.2
      },
      {
        name: "Wildlife Expert",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 8,
        max_time: 4,
        max_elevation: 600,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.15,
        preferred_scenery_types: ["forest", "lake", "wildlife"],
        scenery_weight: 0.2
      },
      {
        name: "Adventure Expert",
        acceptable_difficulties: ['Moderate', 'Hard'],
        preferred_distance: 20,
        max_time: 10,
        max_elevation: 1500,
        distance_weight: 0.15,
        time_weight: 0.15,
        elevation_weight: 0.35,
        difficulty_weight: 0.15,
        preferred_scenery_types: ["mountain", "glacier", "alpine"],
        scenery_weight: 0.2
      }
    ]
  }
];

// Algorithm options
const greedyOptions = {
  returnOnlyTrails: false  // Get full result with regret information
};

const paretoOptions = {
  avg: 0.4,
  min: 0.3,
  cons: 0.3
};

// Direct calculation using utils
function calculateDirectMetrics(selectedTrails, groupMembers) {
  if (selectedTrails.length === 0) return {};
  
  // Basic statistics
  const averageRating = selectedTrails.reduce((sum, t) => sum + t.rating, 0) / selectedTrails.length;
  const averageDistance = selectedTrails.reduce((sum, t) => sum + t.distance_km, 0) / selectedTrails.length;
  
  // Group satisfaction for each trail
  const groupSatisfactions = selectedTrails.map(trail => 
    calculateGroupSatisfaction(trail, groupMembers)
  );
  
  // Average group satisfaction metrics
  const averageGroupSatisfaction = groupSatisfactions.reduce((sum, g) => sum + g.avg_satisfaction, 0) / selectedTrails.length;
  const fairnessScore = groupSatisfactions.reduce((sum, g) => sum + g.fairness_score, 0) / selectedTrails.length;
  const consensusDegree = groupSatisfactions.reduce((sum, g) => sum + g.consensus_degree, 0) / selectedTrails.length;
  
  // Individual match percentages
  const groupMatchPercentages = groupMembers.map(member => {
    const matchingTrails = selectedTrails.filter(trail => {
      const utility = individualUtility(member, trail);
      return utility > 50;
    });
    return Math.round((matchingTrails.length / selectedTrails.length) * 100);
  });
  
  return {
    averageRating,
    averageDistance,
    averageGroupSatisfaction,
    fairnessScore,
    consensusDegree,
    groupMatchPercentages
  };
}

// Comparison function using direct utils calculations
function compareAlgorithms(greedyResults, paretoResults, scenario, groupMembers) {
  const greedyMetrics = calculateDirectMetrics(greedyResults, groupMembers);
  const paretoMetrics = calculateDirectMetrics(paretoResults, groupMembers);
  
  const comparison = {
    scenario: scenario.name,
    greedyMetrics,
    paretoMetrics,
    
    // Trail overlap analysis
    overlap: {
      count: 0,
      trails: []
    },
    
    // Algorithm-specific strengths
    strengths: {
      greedy: [],
      pareto: []
    },
    
    // Recommendation for scenario type
    recommendation: ""
  };
  
  // Calculate overlap
  const greedyTrailIds = greedyResults.map(t => t.trail_id);
  const paretoTrailIds = paretoResults.map(t => t.trail_id);
  
  comparison.overlap.count = greedyTrailIds.filter(id => paretoTrailIds.includes(id)).length;
  comparison.overlap.trails = greedyResults.filter(trail => paretoTrailIds.includes(trail.trail_id));
  
  // Analyze strengths using direct metrics
  if (greedyMetrics.averageGroupSatisfaction > paretoMetrics.averageGroupSatisfaction) {
    comparison.strengths.greedy.push("Higher average satisfaction");
  } else {
    comparison.strengths.pareto.push("Higher average satisfaction");
  }
  
  if (greedyMetrics.fairnessScore > paretoMetrics.fairnessScore) {
    comparison.strengths.greedy.push("Better fairness");
  } else {
    comparison.strengths.pareto.push("Better fairness");
  }
  
  if (greedyMetrics.consensusDegree > paretoMetrics.consensusDegree) {
    comparison.strengths.greedy.push("Better consensus");
  } else {
    comparison.strengths.pareto.push("Better consensus");
  }
  
  // Determine recommendation based on scenario type
  if (scenario.name.includes("Family")) {
    comparison.recommendation = comparison.strengths.greedy.length > comparison.strengths.pareto.length ? 
      "Greedy MinMax Regret (Better for family fairness)" : "Pareto Weighted Scoring (Better for family consensus)";
  } else if (scenario.name.includes("Friends")) {
    comparison.recommendation = comparison.strengths.pareto.length > comparison.strengths.greedy.length ? 
      "Pareto Weighted Scoring (Better for friend consensus)" : "Greedy MinMax Regret (Better for friend fairness)";
  } else if (scenario.name.includes("Expert")) {
    comparison.recommendation = comparison.strengths.greedy.length > comparison.strengths.pareto.length ? 
      "Greedy MinMax Regret (Better for expert diversity)" : "Pareto Weighted Scoring (Better for expert optimization)";
  } else {
    comparison.recommendation = "Both algorithms perform similarly";
  }
  
  return comparison;
}

// Run comparison for each scenario
scenarios.forEach((scenario, scenarioIndex) => {
  console.log(`\n${scenarioIndex + 1}. ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  console.log("\n   Group Members:");
  scenario.groupPreferences.forEach(member => {
    console.log(`   - ${member.name}: ${member.preferred_scenery_types.join(', ')}`);
  });
  
  // Run both algorithms
  const greedyResult = greedyMinMaxRegret(sampleTrails, scenario.groupPreferences, 5, greedyOptions);
  const paretoResults = selectParetoK(sampleTrails, scenario.groupPreferences, 5, paretoOptions);
  
  // Extract trails from greedy result (handle both array and object return types)
  const greedyResults = Array.isArray(greedyResult) ? greedyResult : greedyResult.selectedTrails;
  
  // Compare results using direct utils calculations
  const comparison = compareAlgorithms(greedyResults, paretoResults, scenario, scenario.groupPreferences);
  
  console.log("\n   === ALGORITHM COMPARISON ===");
  
  console.log("\n   Greedy MinMax Regret Results:");
  greedyResults.forEach((trail, index) => {
    console.log(`   ${index + 1}. ${trail.trail_name} (${trail.difficulty}, ${trail.rating}★)`);
  });
  
  console.log("\n   Pareto Weighted Scoring Results:");
  paretoResults.forEach((trail, index) => {
    console.log(`   ${index + 1}. ${trail.trail_name} (${trail.difficulty}, ${trail.rating}★)`);
  });
  
  console.log("\n   === METRICS COMPARISON ===");
  console.log(`   Overlap: ${comparison.overlap.count}/5 trails (${(comparison.overlap.count/5*100).toFixed(0)}%)`);
  
  // Add regret information if available
  if (!Array.isArray(greedyResult) && greedyResult.maxRegret !== undefined) {
    console.log(`   - Greedy Max Regret: ${greedyResult.maxRegret}`);
  }
  
  console.log("\n   Greedy Metrics:");
  console.log(`   - Average Rating: ${comparison.greedyMetrics.averageRating.toFixed(1)}/5.0`);
  console.log(`   - Average Distance: ${comparison.greedyMetrics.averageDistance.toFixed(1)}km`);
  console.log(`   - Average Satisfaction: ${comparison.greedyMetrics.averageGroupSatisfaction.toFixed(1)}`);
  console.log(`   - Fairness Score: ${comparison.greedyMetrics.fairnessScore.toFixed(1)}`);
  console.log(`   - Consensus Degree: ${(comparison.greedyMetrics.consensusDegree * 100).toFixed(0)}%`);
  
  console.log("\n   Pareto Metrics:");
  console.log(`   - Average Rating: ${comparison.paretoMetrics.averageRating.toFixed(1)}/5.0`);
  console.log(`   - Average Distance: ${comparison.paretoMetrics.averageDistance.toFixed(1)}km`);
  console.log(`   - Average Satisfaction: ${comparison.paretoMetrics.averageGroupSatisfaction.toFixed(1)}`);
  console.log(`   - Fairness Score: ${comparison.paretoMetrics.fairnessScore.toFixed(1)}`);
  console.log(`   - Consensus Degree: ${(comparison.paretoMetrics.consensusDegree * 100).toFixed(0)}%`);
  
  console.log("\n   === ALGORITHM STRENGTHS ===");
  console.log("   Greedy MinMax Regret:");
  comparison.strengths.greedy.forEach(strength => console.log(`   ✅ ${strength}`));
  
  console.log("\n   Pareto Weighted Scoring:");
  comparison.strengths.pareto.forEach(strength => console.log(`   ✅ ${strength}`));
  
  console.log(`\n   === RECOMMENDATION ===`);
  console.log(`   For this scenario: ${comparison.recommendation}`);
  
  console.log("\n" + "=".repeat(80));
});