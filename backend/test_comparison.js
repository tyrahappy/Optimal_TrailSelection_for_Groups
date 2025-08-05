const { greedyMinMaxRegret, calculateRecommendationMetrics } = require('./greedyMinMaxRegret');
const { selectParetoK } = require('./paretoWeightedScoring');

console.log("=== Algorithm Comparison Test ===\n");

// Three different group scenarios: Family, Friends, Expert
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
        distance_weight: 0.3,
        time_weight: 0.3,
        elevation_weight: 0.2,
        difficulty_weight: 0.2,
        preferences: ["mountain", "lake", "forest"]
      },
      {
        name: "Mom",
        acceptable_difficulties: ['Easy'],
        preferred_distance: 4,
        max_time: 2,
        max_elevation: 200,
        distance_weight: 0.35,
        time_weight: 0.35,
        elevation_weight: 0.2,
        difficulty_weight: 0.1,
        preferences: ["lake", "forest", "beach"]
      },
      {
        name: "Teenager",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 8,
        max_time: 4,
        max_elevation: 500,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferences: ["mountain", "waterfall", "alpine"]
      },
      {
        name: "Grandparent",
        acceptable_difficulties: ['Easy'],
        preferred_distance: 2,
        max_time: 1.5,
        max_elevation: 100,
        distance_weight: 0.4,
        time_weight: 0.35,
        elevation_weight: 0.2,
        difficulty_weight: 0.05,
        preferences: ["lake", "forest", "park"]
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
        preferences: ["lake", "mountain", "forest"]
      },
      {
        name: "Sam",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 7,
        max_time: 3.5,
        max_elevation: 550,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferences: ["lake", "ocean", "beach"]
      },
      {
        name: "Jordan",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 9,
        max_time: 4.5,
        max_elevation: 650,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferences: ["lake", "waterfall", "forest"]
      },
      {
        name: "Taylor",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 6,
        max_time: 3,
        max_elevation: 500,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferences: ["mountain", "lake", "alpine"]
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
        max_elevation: 1500,
        distance_weight: 0.2,
        time_weight: 0.2,
        elevation_weight: 0.35,
        difficulty_weight: 0.25,
        preferences: ["mountain", "alpine", "glacier"]
      },
      {
        name: "Photography Expert",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 10,
        max_time: 6,
        max_elevation: 800,
        distance_weight: 0.25,
        time_weight: 0.35,
        elevation_weight: 0.25,
        difficulty_weight: 0.15,
        preferences: ["waterfall", "lake", "alpine"]
      },
      {
        name: "Wildlife Expert",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 12,
        max_time: 7,
        max_elevation: 1000,
        distance_weight: 0.3,
        time_weight: 0.3,
        elevation_weight: 0.25,
        difficulty_weight: 0.15,
        preferences: ["forest", "lake", "wildlife"]
      },
      {
        name: "Adventure Expert",
        acceptable_difficulties: ['Hard'],
        preferred_distance: 20,
        max_time: 10,
        max_elevation: 2000,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.35,
        difficulty_weight: 0.15,
        preferences: ["mountain", "glacier", "alpine"]
      }
    ]
  }
];

// Same sample trails as test_greedy.js
const sampleTrails = [
  {
    trail_id: "BC_001",
    trail_name: "Stanley Park Seawall",
    location: "Vancouver, BC",
    difficulty: "Easy",
    distance_km: 8.9,
    estimated_time_hours: 2.5,
    elevation_gain_m: 50,
    rating: 4.5,
    scenery_types: ["Ocean views", "City skyline", "Parks"],
    trail_type: "Loop"
  },
  {
    trail_id: "BC_027",
    trail_name: "Quarry Rock",
    location: "North Vancouver, BC",
    difficulty: "Easy",
    distance_km: 3.8,
    estimated_time_hours: 1.2,
    elevation_gain_m: 100,
    rating: 4.6,
    scenery_types: ["Ocean views", "Forest"],
    trail_type: "Out & Back"
  },
  {
    trail_id: "BC_068",
    trail_name: "Lost Lake Loop",
    location: "Whistler, BC",
    difficulty: "Easy",
    distance_km: 5.0,
    estimated_time_hours: 1.5,
    elevation_gain_m: 30,
    rating: 4.4,
    scenery_types: ["Lake", "Forest"],
    trail_type: "Loop"
  },
  {
    trail_id: "BC_082",
    trail_name: "Alice Lake",
    location: "Squamish, BC",
    difficulty: "Easy",
    distance_km: 6.0,
    estimated_time_hours: 2.0,
    elevation_gain_m: 50,
    rating: 4.4,
    scenery_types: ["Lake", "Forest"],
    trail_type: "Loop"
  },
  {
    trail_id: "BC_031",
    trail_name: "Rice Lake Loop",
    location: "North Vancouver, BC",
    difficulty: "Easy",
    distance_km: 2.4,
    estimated_time_hours: 0.8,
    elevation_gain_m: 20,
    rating: 4.3,
    scenery_types: ["Lake", "Forest"],
    trail_type: "Loop"
  },
  {
    trail_id: "BC_021",
    trail_name: "Grouse Grind",
    location: "North Vancouver, BC",
    difficulty: "Hard",
    distance_km: 2.9,
    estimated_time_hours: 1.5,
    elevation_gain_m: 850,
    rating: 4.1,
    scenery_types: ["Mountain views", "Forest"],
    trail_type: "Out & Back"
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
  }
];

// Algorithm configurations
const greedyOptions = {
  considerDiversity: true,
  diversityWeight: 0.3,
  regretWeight: 0.7
};

const paretoOptions = {
  avg: 0.4,
  min: 0.3,
  cons: 0.3
};

// Comparison metrics function
function compareAlgorithms(greedyResults, paretoResults, scenario, groupPreferences) {
  const comparison = {
    scenario: scenario.name,
    greedyMetrics: calculateRecommendationMetrics(greedyResults, groupPreferences),
    paretoMetrics: calculateRecommendationMetrics(paretoResults, groupPreferences),
    
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
  
  // Analyze strengths
  if (comparison.greedyMetrics.diversityScore > comparison.paretoMetrics.diversityScore) {
    comparison.strengths.greedy.push("Better diversity");
  } else {
    comparison.strengths.pareto.push("Better diversity");
  }
  
  if (comparison.greedyMetrics.regretScore < comparison.paretoMetrics.regretScore) {
    comparison.strengths.greedy.push("Lower regret");
  } else {
    comparison.strengths.pareto.push("Lower regret");
  }
  
  if (comparison.greedyMetrics.averageGroupSatisfaction > comparison.paretoMetrics.averageGroupSatisfaction) {
    comparison.strengths.greedy.push("Higher average satisfaction");
  } else {
    comparison.strengths.pareto.push("Higher average satisfaction");
  }
  
  if (comparison.greedyMetrics.fairnessScore > comparison.paretoMetrics.fairnessScore) {
    comparison.strengths.greedy.push("Better fairness");
  } else {
    comparison.strengths.pareto.push("Better fairness");
  }
  
  // Determine recommendation based on scenario type
  if (scenario.name.includes("Family")) {
    // Family groups need fairness and safety - Greedy is better for diverse ages
    comparison.recommendation = comparison.strengths.greedy.length > comparison.strengths.pareto.length ? 
      "Greedy MinMax Regret (Better for family fairness)" : "Pareto Weighted Scoring (Better for family consensus)";
  } else if (scenario.name.includes("Friends")) {
    // Friends groups can compromise more - Pareto is better for similar interests
    comparison.recommendation = comparison.strengths.pareto.length > comparison.strengths.greedy.length ? 
      "Pareto Weighted Scoring (Better for friend consensus)" : "Greedy MinMax Regret (Better for friend fairness)";
  } else if (scenario.name.includes("Expert")) {
    // Expert groups have diverse but informed preferences - depends on metrics
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
    console.log(`   - ${member.name}: ${member.preferences.join(', ')}`);
  });
  
  // Run both algorithms
  const greedyResults = greedyMinMaxRegret(sampleTrails, scenario.groupPreferences, 5, greedyOptions);
  const paretoResults = selectParetoK(sampleTrails, scenario.groupPreferences, 5, paretoOptions);
  
  // Compare results
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
  
  console.log("\n   Greedy Metrics:");
  console.log(`   - Average Rating: ${comparison.greedyMetrics.averageRating.toFixed(1)}/5.0`);
  console.log(`   - Average Distance: ${comparison.greedyMetrics.averageDistance.toFixed(1)}km`);
  console.log(`   - Diversity Score: ${(comparison.greedyMetrics.diversityScore * 100).toFixed(0)}%`);
  console.log(`   - Regret Score: ${comparison.greedyMetrics.regretScore.toFixed(2)}`);
  console.log(`   - Average Satisfaction: ${comparison.greedyMetrics.averageGroupSatisfaction.toFixed(1)}`);
  console.log(`   - Fairness Score: ${comparison.greedyMetrics.fairnessScore.toFixed(1)}`);
  
  console.log("\n   Pareto Metrics:");
  console.log(`   - Average Rating: ${comparison.paretoMetrics.averageRating.toFixed(1)}/5.0`);
  console.log(`   - Average Distance: ${comparison.paretoMetrics.averageDistance.toFixed(1)}km`);
  console.log(`   - Diversity Score: ${(comparison.paretoMetrics.diversityScore * 100).toFixed(0)}%`);
  console.log(`   - Regret Score: ${comparison.paretoMetrics.regretScore.toFixed(2)}`);
  console.log(`   - Average Satisfaction: ${comparison.paretoMetrics.averageGroupSatisfaction.toFixed(1)}`);
  console.log(`   - Fairness Score: ${comparison.paretoMetrics.fairnessScore.toFixed(1)}`);
  
  console.log("\n   === ALGORITHM STRENGTHS ===");
  console.log("   Greedy MinMax Regret:");
  comparison.strengths.greedy.forEach(strength => console.log(`   ✅ ${strength}`));
  
  console.log("\n   Pareto Weighted Scoring:");
  comparison.strengths.pareto.forEach(strength => console.log(`   ✅ ${strength}`));
  
  console.log(`\n   === RECOMMENDATION ===`);
  console.log(`   For this scenario: ${comparison.recommendation}`);
  
  console.log("\n" + "=".repeat(80));
});