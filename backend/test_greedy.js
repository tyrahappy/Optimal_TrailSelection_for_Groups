const { greedyMinMaxRegret } = require('./greedyMinMaxRegret');
const { calculateGroupSatisfaction, individualUtility } = require('./utils/groupSatisfaction');

console.log("=== Greedy MinMax Regret Algorithm Demo ===\n");

/**
 * Test scenarios for Greedy MinMax Regret algorithm
 * Each scenario represents different group preference patterns to test algorithm robustness
 */
const scenarios = [
  {
    name: "Scenario 1: Diverse Preferences",
    description: "Group with very different preferences",
    groupPreferences: [
      {
        name: "Alice",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 8,
        max_time: 4,
        max_elevation: 600,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["mountain", "lake", "waterfall"],
        scenery_weight: 0.2
      },
      {
        name: "Bob",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 6,
        max_time: 3,
        max_elevation: 400,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["ocean", "beach", "lake"],
        scenery_weight: 0.2
      },
      {
        name: "Carol",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 10,
        max_time: 5,
        max_elevation: 800,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["forest", "waterfall", "lake"],
        scenery_weight: 0.2
      }
    ]
  },
  {
    name: "Scenario 2: Similar Preferences",
    description: "Group with similar preferences (all like lakes)",
    groupPreferences: [
      {
        name: "Alice",
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
        name: "Bob",
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
        name: "Carol",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 10,
        max_time: 5,
        max_elevation: 800,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["lake", "waterfall", "forest"],
        scenery_weight: 0.2
      }
    ]
  },
  {
    name: "Scenario 3: Mixed Preferences",
    description: "Group with some overlap in preferences",
    groupPreferences: [
      {
        name: "Alice",
        acceptable_difficulties: ['Easy', 'Moderate', 'Hard'],
        preferred_distance: 12,
        max_time: 6,
        max_elevation: 1000,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["mountain", "alpine", "glacier"],
        scenery_weight: 0.2
      },
      {
        name: "Bob",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 8,
        max_time: 4,
        max_elevation: 500,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["ocean", "beach", "city"],
        scenery_weight: 0.2
      },
      {
        name: "Carol",
        acceptable_difficulties: ['Easy', 'Moderate'],
        preferred_distance: 10,
        max_time: 5,
        max_elevation: 700,
        distance_weight: 0.25,
        time_weight: 0.25,
        elevation_weight: 0.25,
        difficulty_weight: 0.25,
        preferred_scenery_types: ["forest", "lake", "mountain"],
        scenery_weight: 0.2
      }
    ]
  }
];

// Sample trail data
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

// Algorithm configuration options
const algorithmOptions = {
  considerDiversity: true,
  diversityWeight: 0.3,
  regretWeight: 0.7
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
  
  // Individual match percentages
  const groupMatchPercentages = groupMembers.map(member => {
    const matchingTrails = selectedTrails.filter(trail => {
      const utility = individualUtility(member, trail);
      return utility > 50;
    });
    return Math.round((matchingTrails.length / selectedTrails.length) * 100);
  });
  
  // Difficulty distribution
  const difficultyDistribution = {};
  selectedTrails.forEach(trail => {
    difficultyDistribution[trail.difficulty] = (difficultyDistribution[trail.difficulty] || 0) + 1;
  });
  
  return {
    averageRating,
    averageDistance,
    averageGroupSatisfaction,
    fairnessScore,
    groupMatchPercentages,
    difficultyDistribution
  };
}

// Run demo for each scenario
scenarios.forEach((scenario, scenarioIndex) => {
  console.log(`\n${scenarioIndex + 1}. ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  console.log("\n   Group Members:");
  scenario.groupPreferences.forEach(member => {
    console.log(`   - ${member.name}: ${member.preferred_scenery_types.join(', ')}`);
  });

  // Run algorithm
  const recommendedTrails = greedyMinMaxRegret(sampleTrails, scenario.groupPreferences, 5, algorithmOptions);
  const metrics = calculateDirectMetrics(recommendedTrails, scenario.groupPreferences);

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
  console.log(`   - Average Satisfaction: ${metrics.averageGroupSatisfaction.toFixed(1)}`);
  console.log(`   - Fairness Score: ${metrics.fairnessScore.toFixed(1)}`);

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
