import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Mountain, Star, Users, Eye, Zap, TrendingUp, AlertCircle, RefreshCw, Heart, Activity, Award, ChevronDown, X, Plus } from 'lucide-react';

const InteractiveTrailSelector = () => {
  const [trails, setTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [selectedTrails, setSelectedTrails] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationMetrics, setRecommendationMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  
  const [groupMembers, setGroupMembers] = useState([
    { name: "Alice", preferences: ["mountain", "lake", "waterfall"] },
    { name: "Bob", preferences: ["ocean", "beach", "lake"] },
    { name: "Carol", preferences: ["forest", "waterfall", "lake"] }
  ]);
  
  const [filters, setFilters] = useState({
    difficulty: '',
    maxDistance: '',
    maxTime: '',
    maxElevation: '',
    trailType: '',
    sceneryTypes: [],
    minRating: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // 从后端加载步道数据
  useEffect(() => {
    const loadTrails = async () => {
      setDataLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:3001/api/trails');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 处理数据格式，确保 scenery_types 是数组
        const processedData = data.map(trail => ({
          ...trail,
          distance_km: parseFloat(trail.distance_km),
          estimated_time_hours: parseFloat(trail.estimated_time_hours),
          elevation_gain_m: parseInt(trail.elevation_gain_m),
          rating: parseFloat(trail.rating),
          scenery_types: Array.isArray(trail.scenery_types) 
            ? trail.scenery_types 
            : (typeof trail.scenery_types === 'string' 
                ? trail.scenery_types.split(',').map(s => s.trim()) 
                : [])
        }));
        
        setTrails(processedData);
        setFilteredTrails(processedData);
        console.log(`✅ 成功加载 ${processedData.length} 条步道数据`);
      } catch (err) {
        console.error('Error loading trails:', err);
        setError(`Failed to load trails: ${err.message}`);
      } finally {
        setDataLoading(false);
      }
    };

    loadTrails();
  }, []);

  // Get all unique scenery types
  const getAllSceneryTypes = () => {
    const allTypes = trails.flatMap(trail => trail.scenery_types);
    return [...new Set(allTypes)];
  };

  // Apply filter conditions
  useEffect(() => {
    let filtered = trails.filter(trail => {
      if (searchTerm && !trail.trail_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !trail.location.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (filters.difficulty && trail.difficulty !== filters.difficulty) {
        return false;
      }
      
      if (filters.maxDistance && trail.distance_km > parseFloat(filters.maxDistance)) {
        return false;
      }
      
      if (filters.maxTime && trail.estimated_time_hours > parseFloat(filters.maxTime)) {
        return false;
      }
      
      if (filters.maxElevation && trail.elevation_gain_m > parseInt(filters.maxElevation)) {
        return false;
      }
      
      if (filters.trailType && trail.trail_type !== filters.trailType) {
        return false;
      }
      
      if (filters.sceneryTypes.length > 0) {
        const hasMatchingScenery = filters.sceneryTypes.some(selectedType =>
          trail.scenery_types.some(trailType => trailType.includes(selectedType))
        );
        if (!hasMatchingScenery) {
          return false;
        }
      }
      
      if (filters.minRating && trail.rating < parseFloat(filters.minRating)) {
        return false;
      }
      
      return true;
    });
    
    setFilteredTrails(filtered);
  }, [trails, filters, searchTerm]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSceneryTypeToggle = (sceneryType) => {
    setFilters(prev => ({
      ...prev,
      sceneryTypes: prev.sceneryTypes.includes(sceneryType)
        ? prev.sceneryTypes.filter(type => type !== sceneryType)
        : [...prev.sceneryTypes, sceneryType]
    }));
  };

  const handleTrailSelect = (trail) => {
    if (selectedTrails.find(t => t.trail_id === trail.trail_id)) {
      setSelectedTrails(prev => prev.filter(t => t.trail_id !== trail.trail_id));
    } else {
      setSelectedTrails(prev => [...prev, trail]);
    }
  };

  const calculateGroupMatch = (trail) => {
    let matchCount = 0;
    groupMembers.forEach(member => {
      const memberMatch = member.preferences.some(pref =>
        trail.scenery_types.some(scenery => 
          scenery.toLowerCase().includes(pref.toLowerCase())
        )
      );
      if (memberMatch) matchCount++;
    });
    return (matchCount / groupMembers.length) * 100;
  };

  // 算法实现函数
  const calculateMemberUtility = (trail, member) => {
    let utility = 0;
    
    // 基础评分 (0-1 scale)
    utility += trail.rating / 5.0;
    
    // 偏好匹配奖励
    const preferenceMatches = member.preferences.filter(pref =>
      trail.scenery_types.some(scenery => 
        scenery.toLowerCase().includes(pref.toLowerCase())
      )
    );
    
    if (preferenceMatches.length > 0) {
      utility += (preferenceMatches.length / member.preferences.length) * 0.5;
    }
    
    // 难度偏好
    const difficultyScore = {
      'Easy': 0.8,
      'Moderate': 1.0,
      'Hard': 0.6
    };
    utility += (difficultyScore[trail.difficulty] || 0.8) * 0.2;
    
    return Math.min(utility, 1.0);
  };

  const calculateTrailSimilarity = (trail1, trail2) => {
    let similarity = 0;
    
    // 景观类型相似性
    const scenery1 = new Set(trail1.scenery_types);
    const scenery2 = new Set(trail2.scenery_types);
    const intersection = new Set([...scenery1].filter(x => scenery2.has(x)));
    const union = new Set([...scenery1, ...scenery2]);
    const scenerySimilarity = intersection.size / union.size;
    
    // 难度相似性
    const difficultySimilarity = trail1.difficulty === trail2.difficulty ? 1 : 0;
    
    // 距离相似性
    const maxDistance = Math.max(trail1.distance_km, trail2.distance_km);
    const distanceSimilarity = 1 - Math.abs(trail1.distance_km - trail2.distance_km) / maxDistance;
    
    // 位置相似性
    const locationSimilarity = trail1.location === trail2.location ? 1 : 0;
    
    similarity = (scenerySimilarity * 0.4 + 
                  difficultySimilarity * 0.2 + 
                  distanceSimilarity * 0.2 + 
                  locationSimilarity * 0.2);
    
    return similarity;
  };

  const calculateDiversity = (trails) => {
    if (trails.length <= 1) return 1.0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < trails.length; i++) {
      for (let j = i + 1; j < trails.length; j++) {
        const similarity = calculateTrailSimilarity(trails[i], trails[j]);
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return 1 - (totalSimilarity / comparisons);
  };

  const calculateRegret = (selectedTrails, allTrails, groupPreferences) => {
    let maxRegret = 0;
    
    groupPreferences.forEach(member => {
      const selectedUtility = selectedTrails.reduce((sum, trail) => {
        return sum + calculateMemberUtility(trail, member);
      }, 0);
      
      const memberUtilities = allTrails.map(trail => ({
        trail,
        utility: calculateMemberUtility(trail, member)
      })).sort((a, b) => b.utility - a.utility);
      
      const bestUtility = memberUtilities
        .slice(0, selectedTrails.length)
        .reduce((sum, item) => sum + item.utility, 0);
      
      const memberRegret = bestUtility - selectedUtility;
      maxRegret = Math.max(maxRegret, memberRegret);
    });
    
    return maxRegret;
  };

  const greedyMinMaxRegret = (trails, groupPreferences, k = 5) => {
    const selectedTrails = [];
    const availableTrails = [...trails];
    const diversityWeight = 0.3;
    const regretWeight = 0.7;
    
    for (let i = 0; i < k && availableTrails.length > 0; i++) {
      let bestTrail = null;
      let bestScore = -Infinity;
      
      for (let j = 0; j < availableTrails.length; j++) {
        const candidateTrail = availableTrails[j];
        const candidateSelection = [...selectedTrails, candidateTrail];
        
        const regretScore = calculateRegret(candidateSelection, trails, groupPreferences);
        const normalizedRegret = 1 - (regretScore / (groupPreferences.length * k));
        
        const diversityScore = calculateDiversity(candidateSelection);
        
        const combinedScore = (regretWeight * normalizedRegret) + 
                             (diversityWeight * diversityScore);
        
        if (combinedScore > bestScore) {
          bestScore = combinedScore;
          bestTrail = candidateTrail;
        }
      }
      
      if (bestTrail) {
        selectedTrails.push(bestTrail);
        const index = availableTrails.findIndex(t => t.trail_id === bestTrail.trail_id);
        if (index > -1) {
          availableTrails.splice(index, 1);
        }
      }
    }
    
    return selectedTrails;
  };

  const calculateRecommendationMetrics = (selectedTrails, groupMembers) => {
    if (selectedTrails.length === 0) {
      return {
        averageRating: 0,
        averageDistance: 0,
        averageTime: 0,
        averageElevation: 0,
        diversityScore: 0,
        regretScore: 0,
        groupMatchPercentages: groupMembers.map(() => 0)
      };
    }

    const metrics = {
      averageRating: selectedTrails.reduce((sum, t) => sum + t.rating, 0) / selectedTrails.length,
      averageDistance: selectedTrails.reduce((sum, t) => sum + t.distance_km, 0) / selectedTrails.length,
      averageTime: selectedTrails.reduce((sum, t) => sum + t.estimated_time_hours, 0) / selectedTrails.length,
      averageElevation: selectedTrails.reduce((sum, t) => sum + t.elevation_gain_m, 0) / selectedTrails.length,
      diversityScore: calculateDiversity(selectedTrails),
      regretScore: calculateRegret(selectedTrails, selectedTrails, groupMembers),
      groupMatchPercentages: groupMembers.map(member => {
        const matchingTrails = selectedTrails.filter(trail =>
          member.preferences.some(pref =>
            trail.scenery_types.some(scenery => 
              scenery.toLowerCase().includes(pref.toLowerCase())
            )
          )
        );
        return Math.round((matchingTrails.length / selectedTrails.length) * 100);
      })
    };

    return metrics;
  };

  // 推荐函数
  const getRecommendations = async () => {
    setLoading(true);
    
    try {
      // 调用后端推荐 API
      const response = await fetch('http://localhost:3001/api/trails/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupPreferences: groupMembers,
          filters: filters,
          k: 5
        })
      });
      
      if (!response.ok) {
        throw new Error(`推荐请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 为推荐的步道添加群体匹配信息
      const recommendationsWithGroupMatch = data.recommendations.map(trail => ({
        ...trail,
        groupMatchPercentage: calculateGroupMatch(trail)
      }));
      
      setRecommendations(recommendationsWithGroupMatch);
      setRecommendationMetrics(data.metrics);
      setShowRecommendations(true);
      
      console.log('✅ 推荐算法完成:', {
        algorithm: data.algorithm,
        totalCandidates: data.totalCandidates,
        recommendationsCount: data.recommendations.length
      });
      
    } catch (error) {
      console.error('❌ 推荐算法错误:', error);
      setError(`推荐失败: ${error.message}`);
      
      // 如果后端调用失败，回退到前端算法
      console.log('🔄 回退到前端算法...');
      
      let candidateTrails = trails.filter(trail => {
        if (filters.difficulty && trail.difficulty !== filters.difficulty) {
          return false;
        }
        
        if (filters.maxDistance && trail.distance_km > parseFloat(filters.maxDistance)) {
          return false;
        }
        
        if (filters.maxTime && trail.estimated_time_hours > parseFloat(filters.maxTime)) {
          return false;
        }
        
        if (filters.maxElevation && trail.elevation_gain_m > parseInt(filters.maxElevation)) {
          return false;
        }
        
        if (filters.trailType && trail.trail_type !== filters.trailType) {
          return false;
        }
        
        if (filters.sceneryTypes.length > 0) {
          const hasMatchingScenery = filters.sceneryTypes.some(selectedType =>
            trail.scenery_types.some(trailType => trailType.includes(selectedType))
          );
          if (!hasMatchingScenery) {
            return false;
          }
        }
        
        if (filters.minRating && trail.rating < parseFloat(filters.minRating)) {
          return false;
        }
        
        return true;
      });

      // 运行前端 Greedy MinMax Regret 算法
      const recommendedTrails = greedyMinMaxRegret(candidateTrails, groupMembers, 5);
      
      // 计算指标
      const metrics = calculateRecommendationMetrics(recommendedTrails, groupMembers);
      
      // 为推荐的步道添加额外信息
      const recommendationsWithMetrics = recommendedTrails.map(trail => ({
        ...trail,
        groupMatchPercentage: calculateGroupMatch(trail),
        averageMemberUtility: groupMembers.reduce((sum, member) => 
          sum + calculateMemberUtility(trail, member), 0) / groupMembers.length
      }));
      
      setRecommendations(recommendationsWithMetrics);
      setRecommendationMetrics(metrics);
      setShowRecommendations(true);
      
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      difficulty: '',
      maxDistance: '',
      maxTime: '',
      maxElevation: '',
      trailType: '',
      sceneryTypes: [],
      minRating: ''
    });
    setSearchTerm('');
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
              <Mountain className="text-white animate-pulse" size={40} />
            </div>
            <RefreshCw className="absolute -top-2 -right-2 animate-spin text-blue-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Trail Data...</h2>
          <p className="text-gray-600">Connecting to backend and loading trails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-red-500" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Connection Issue</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 mb-8 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Mountain className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Trail Explorer</h1>
                <p className="text-blue-100 text-lg">Discover your perfect hiking adventure with AI-powered recommendations</p>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{filteredTrails.length}</p>
                <p className="text-sm text-gray-600">Available Trails</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Heart className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{selectedTrails.length}</p>
                <p className="text-sm text-gray-600">Selected Trails</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{groupMembers.length}</p>
                <p className="text-sm text-gray-600">Group Members</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">4.6</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Group Preferences */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/20">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            Group Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groupMembers.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    index === 0 ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                    index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                  <h4 className="font-semibold text-gray-800 text-lg">{member.name}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.preferences.map((pref, i) => (
                    <span key={i} className="px-3 py-1 bg-white/70 backdrop-blur-sm text-gray-700 rounded-full text-sm font-medium border border-gray-200 shadow-sm">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/20">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search trails by name or location..."
                className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-800 placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Filter size={20} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                <ChevronDown className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} size={16} />
              </button>
              
              <button
                onClick={getRecommendations}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Zap size={20} />
                )}
                {loading ? 'Getting Recommendations...' : 'AI Recommendations'}
              </button>
              
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <X size={20} />
                Clear Filters
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                      <option value="">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Distance (km)</label>
                    <input
                      type="number"
                      value={filters.maxDistance}
                      onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      placeholder="e.g. 10"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Time (hours)</label>
                    <input
                      type="number"
                      value={filters.maxTime}
                      onChange={(e) => handleFilterChange('maxTime', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      placeholder="e.g. 4"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                      <option value="">Any Rating</option>
                      <option value="4.0">4.0+</option>
                      <option value="4.2">4.2+</option>
                      <option value="4.4">4.4+</option>
                      <option value="4.6">4.6+</option>
                    </select>
                  </div>
                </div>

                {/* Scenery Types */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Scenery Features</label>
                  <div className="flex flex-wrap gap-2">
                    {getAllSceneryTypes().map((sceneryType, index) => (
                      <button
                        key={index}
                        onClick={() => handleSceneryTypeToggle(sceneryType)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          filters.sceneryTypes.includes(sceneryType)
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {sceneryType}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 mb-8 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              AI Recommendations ({recommendations.length})
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Recommended Trails</h3>
                <div className="space-y-4">
                  {recommendations.map((trail, index) => (
                    <div key={trail.trail_id} className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <h4 className="font-bold text-gray-800 text-lg">{trail.trail_name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin size={14} />
                            {trail.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
                          <Star className="text-yellow-500" size={16} />
                          <span className="text-sm font-semibold text-gray-700">{trail.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Activity size={14} />
                          {trail.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {trail.distance_km}km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {trail.estimated_time_hours}h
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {trail.scenery_types.map((scenery, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {scenery}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Group Match: <span className="font-semibold text-green-600">{calculateGroupMatch(trail).toFixed(0)}%</span>
                        </span>
                        <span className="text-gray-600">
                          Utility: <span className="font-semibold text-blue-600">{((trail.averageMemberUtility || 0.8) * 100).toFixed(0)}%</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Metrics</h3>
                {recommendationMetrics && (
                  <div className="space-y-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <Award size={16} />
                        Statistics
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Rating:</span>
                          <span className="font-semibold text-gray-800">{recommendationMetrics.averageRating.toFixed(1)}/5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Distance:</span>
                          <span className="font-semibold text-gray-800">{recommendationMetrics.averageDistance.toFixed(1)}km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Time:</span>
                          <span className="font-semibold text-gray-800">{recommendationMetrics.averageTime.toFixed(1)}h</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        <Activity size={16} />
                        Algorithm Performance
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Diversity Score:</span>
                          <span className="font-semibold text-gray-800">{(recommendationMetrics.diversityScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Regret Score:</span>
                          <span className="font-semibold text-gray-800">{recommendationMetrics.regretScore.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trail Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Eye className="text-white" size={20} />
            </div>
            Available Trails ({filteredTrails.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrails.map((trail) => {
              const isSelected = selectedTrails.find(t => t.trail_id === trail.trail_id);
              const groupMatch = calculateGroupMatch(trail);
              
              return (
                <div
                  key={trail.trail_id}
                  className={`group relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 ${
                    isSelected 
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50'
                  }`}
                  onClick={() => handleTrailSelect(trail)}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="text-white" size={14} />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                        {trail.trail_name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} />
                        {trail.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-lg shadow-sm">
                      <Star className="text-yellow-500" size={16} />
                      <span className="text-sm font-semibold text-gray-700">{trail.rating}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{trail.distance_km}km</div>
                      <div className="text-xs text-gray-500">Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{trail.estimated_time_hours}h</div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{trail.elevation_gain_m}m</div>
                      <div className="text-xs text-gray-500">Elevation</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                      trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trail.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium shadow-sm">
                      {trail.trail_type}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {trail.scenery_types.slice(0, 4).map((scenery, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {scenery}
                      </span>
                    ))}
                    {trail.scenery_types.length > 4 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                        +{trail.scenery_types.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Group Match: <span className="font-semibold text-blue-600">{groupMatch.toFixed(0)}%</span>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm ${
                        isSelected 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                      }`}
                    >
                      {isSelected ? 'Selected ✓' : 'Select Trail'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredTrails.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No trails found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveTrailSelector;