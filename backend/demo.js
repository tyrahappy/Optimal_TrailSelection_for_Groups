const { greedyMinMaxRegret, calculateRecommendationMetrics } = require('./backend/greedyMinMaxRegret');

console.log("=== Greedy MinMax Regret Algorithm Demo ===\n");

// Simulate different group preference scenarios
const scenarios = [
  {
    name: "Scenario 1: Diverse Preferences",
    description: "Group with very different preferences",
    groupPreferences: [
      { name: "Alice", preferences: ["mountain", "lake", "waterfall"] },
      { name: "Bob", preferences: ["ocean", "beach", "lake"] },
      { name: "Carol", preferences: ["forest", "waterfall", "lake"] }
    ]
  },
  {
    name: "Scenario 2: Similar Preferences",
    description: "Group with similar preferences (all like lakes)",
    groupPreferences: [
      { name: "Alice", preferences: ["lake", "mountain", "forest"] },
      { name: "Bob", preferences: ["lake", "ocean", "beach"] },
      { name: "Carol", preferences: ["lake", "waterfall", "forest"] }
    ]
  },
  {
    name: "Scenario 3: Mixed Preferences",
    description: "Group with some overlap in preferences",
    groupPreferences: [
      { name: "Alice", preferences: ["mountain", "alpine", "glacier"] },
      { name: "Bob", preferences: ["ocean", "beach", "city"] },
      { name: "Carol", preferences: ["forest", "lake", "mountain"] }
    ]
  }
];

// Simulate trail data (based on real data)
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

// Algorithm configuration options
const algorithmOptions = {
  considerDiversity: true,
  diversityWeight: 0.3,
  regretWeight: 0.7
};

// Run demo for each scenario
scenarios.forEach((scenario, scenarioIndex) => {
  console.log(`\n${scenarioIndex + 1}. ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  console.log("\n   Group Members:");
  scenario.groupPreferences.forEach(member => {
    console.log(`   - ${member.name}: ${member.preferences.join(', ')}`);
  });

  // Run algorithm
  const recommendedTrails = greedyMinMaxRegret(sampleTrails, scenario.groupPreferences, 5, algorithmOptions);
  const metrics = calculateRecommendationMetrics(recommendedTrails, scenario.groupPreferences);

  console.log("\n   Top 5 Recommended Trails:");
  recommendedTrails.forEach((trail, index) => {
    console.log(`   ${index + 1}. ${trail.trail_name}`);
    console.log(`      Location: ${trail.location}`);
    console.log(`      Difficulty: ${trail.difficulty}, Rating: ${trail.rating}★`);
    console.log(`      Scenery: ${trail.scenery_types.join(', ')}`);
  });

  console.log("\n   Algorithm Metrics:");
  console.log(`   - Average Rating: ${metrics.averageRating.toFixed(1)}/5.0`);
  console.log(`   - Average Distance: ${metrics.averageDistance.toFixed(1)}km`);
  console.log(`   - Diversity Score: ${(metrics.diversityScore * 100).toFixed(0)}%`);
  console.log(`   - Regret Score: ${metrics.regretScore.toFixed(2)}`);

  console.log("\n   Group Satisfaction:");
  scenario.groupPreferences.forEach((member, index) => {
    console.log(`   - ${member.name}: ${metrics.groupMatchPercentages[index]}% match`);
  });

  console.log("\n   Difficulty Distribution:");
  Object.entries(metrics.difficultyDistribution).forEach(([difficulty, count]) => {
    console.log(`   - ${difficulty}: ${count} trails`);
  });

  console.log("\n" + "=".repeat(60));
});

// Algorithm analysis
console.log("\n=== Algorithm Analysis ===");
console.log("The Greedy MinMax Regret algorithm demonstrates:");
console.log("1. Minimizes maximum regret across all group members");
console.log("2. Considers trail diversity to avoid similar selections");
console.log("3. Balances individual preferences with group satisfaction");
console.log("4. Provides comprehensive metrics for decision making");
console.log("5. Adapts to different group preference scenarios");

console.log("\n=== Key Features ===");
console.log("• Utility Calculation: Considers rating, preference matching, and difficulty");
console.log("• Regret Minimization: Finds trails that minimize maximum group regret");
console.log("• Diversity Optimization: Ensures selected trails are diverse");
console.log("• Comprehensive Metrics: Provides detailed statistics and analysis");
console.log("• Scalable: Handles multiple group members and large trail datasets");

console.log("\n=== Performance ===");
console.log("• Time Complexity: O(k * n * m) where k=trails to select, n=total trails, m=group size");
console.log("• Space Complexity: O(n) for storing trail data");
console.log("• Scalability: Efficiently handles 200+ trails and multiple group members"); 