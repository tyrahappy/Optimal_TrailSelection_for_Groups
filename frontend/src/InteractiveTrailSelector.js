import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Mountain, Star, Users, Eye, Zap, TrendingUp, AlertCircle, RefreshCw, Heart, Activity, Award, ChevronDown, X, Plus, User, Settings, ArrowRight, ArrowLeft, Home } from 'lucide-react';

const InteractiveTrailSelector = () => {
  const [trails, setTrails] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Group management
  const [groupSize, setGroupSize] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [currentStep, setCurrentStep] = useState('group-size'); // 'group-size', 'preferences', 'results'
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  
  // Available preferences
  const availablePreferences = [
    { id: 'distance', label: 'Distance', icon: MapPin, options: ['Short (< 5km)', 'Medium (5-10km)', 'Long (> 10km)'] },
    { id: 'elevation', label: 'Elevation Gain', icon: Mountain, options: ['Low (< 200m)', 'Medium (200-500m)', 'High (> 500m)'] },
    { id: 'time', label: 'Duration', icon: Clock, options: ['Quick (< 2h)', 'Moderate (2-4h)', 'Long (> 4h)'] },
    { id: 'difficulty', label: 'Difficulty', icon: Activity, options: ['Easy', 'Moderate', 'Hard'] },
    { id: 'scenery', label: 'Scenery Type', icon: Eye, options: ['Mountain', 'Lake', 'Forest', 'Ocean', 'Waterfall', 'Alpine'] }
  ];
  
  const [filters, setFilters] = useState({
    difficulty: '',
    maxDistance: '',
    maxTime: '',
    minRating: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  // Load trail data from backend
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
        
        // Process data format, ensure scenery_types is array
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
        console.log(`✅ Successfully loaded ${processedData.length} trail data`);
      } catch (err) {
        console.error('Error loading trails:', err);
        setError(`Failed to load trails: ${err.message}`);
      } finally {
        setDataLoading(false);
      }
    };

    loadTrails();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const initializeGroupMembers = (size) => {
    const members = [];
    for (let i = 0; i < size; i++) {
      members.push({
        id: i,
        name: `Person ${i + 1}`,
        preferences: {}
      });
    }
    setGroupMembers(members);
    setCurrentStep('preferences');
    setCurrentMemberIndex(0);
  };

  const updateMemberPreference = (memberId, preferenceType, value) => {
    setGroupMembers(members => 
      members.map(member => 
        member.id === memberId 
          ? { ...member, preferences: { ...member.preferences, [preferenceType]: value } }
          : member
      )
    );
  };

  const nextMember = () => {
    if (currentMemberIndex < groupMembers.length - 1) {
      setCurrentMemberIndex(currentMemberIndex + 1);
    } else {
      // All members have set preferences, get recommendations
      getRecommendations();
    }
  };

  const prevMember = () => {
    if (currentMemberIndex > 0) {
      setCurrentMemberIndex(currentMemberIndex - 1);
    }
  };

  const calculateGroupMatch = (trail) => {
    if (groupMembers.length === 0) return 0;
    let matchCount = 0;
    groupMembers.forEach(member => {
      const memberMatch = member.preferences.scenery && 
        trail.scenery_types.some(scenery => 
          scenery.toLowerCase().includes(member.preferences.scenery.toLowerCase())
        );
      if (memberMatch) matchCount++;
    });
    return (matchCount / groupMembers.length) * 100;
  };

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert groupMembers to the format expected by the backend
      const groupPreferences = groupMembers.map(member => ({
        name: member.name,
        preferences: Object.keys(member.preferences).map(key => {
          const value = member.preferences[key];
          // Convert preference values to match backend expectations
          switch(key) {
            case 'distance':
              if (value === 'Short (< 5km)') return 'short';
              if (value === 'Medium (5-10km)') return 'medium';
              if (value === 'Long (> 10km)') return 'long';
              return value;
            case 'elevation':
              if (value === 'Low (< 200m)') return 'low';
              if (value === 'Medium (200-500m)') return 'medium';
              if (value === 'High (> 500m)') return 'high';
              return value;
            case 'time':
              if (value === 'Quick (< 2h)') return 'quick';
              if (value === 'Moderate (2-4h)') return 'moderate';
              if (value === 'Long (> 4h)') return 'long';
              return value;
            case 'difficulty':
              return value.toLowerCase();
            case 'scenery':
              return value.toLowerCase();
            default:
              return value;
          }
        }).filter(pref => pref) // Remove empty preferences
      }));

      console.log('Sending group preferences:', groupPreferences);

      const response = await fetch('http://localhost:3001/api/trails/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupPreferences: groupPreferences,
          filters: filters,
          k: 5
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Recommendation request failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Add group match information to recommended trails
      const recommendationsWithGroupMatch = data.recommendations.map(trail => ({
        ...trail,
        groupMatchPercentage: calculateGroupMatch(trail)
      }));
      
      setRecommendations(recommendationsWithGroupMatch);
      setCurrentStep('results');
      
      console.log('✅ Recommendation algorithm completed:', {
        algorithm: data.algorithm,
        totalCandidates: data.totalCandidates,
        recommendationsCount: data.recommendations.length
      });
      
    } catch (error) {
      console.error('❌ Recommendation algorithm error:', error);
      setError(`Recommendation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetToGroupSize = () => {
    setCurrentStep('group-size');
    setGroupSize('');
    setGroupMembers([]);
    setCurrentMemberIndex(0);
    setRecommendations([]);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Mountain className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading Trail Data...</h2>
          <p className="text-gray-600">Connecting to backend and loading trails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Trail Explorer</h1>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Help</a>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Step 1: Group Size Selection */}
          {currentStep === 'group-size' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Image */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-12 text-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-white" size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Find your <span className="text-blue-600">perfect trail</span>
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    AI-powered trail recommendations for groups. 
                    We connect people, analyze preferences, and find the best hiking adventures.
                  </p>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">How many people in your group?</h3>
                  <p className="text-gray-600 mb-6">Select the number of people in your hiking group</p>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Size
                    </label>
                    <select
                      value={groupSize}
                      onChange={(e) => {
                        const size = parseInt(e.target.value);
                        if (size > 0) {
                          initializeGroupMembers(size);
                        }
                      }}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select group size...</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                        <option key={size} value={size}>
                          {size} {size === 1 ? 'Person' : 'People'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">What happens next?</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Each person will set their preferences
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Our AI analyzes group compatibility
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Get top 5 personalized recommendations
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preferences Selection */}
          {currentStep === 'preferences' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {groupMembers[currentMemberIndex]?.name}'s Preferences
                </h2>
                <p className="text-gray-600">
                  {currentMemberIndex + 1} of {groupMembers.length} • Set your hiking preferences
                </p>
              </div>
              
              <div className="space-y-8">
                {availablePreferences.map((pref) => {
                  const Icon = pref.icon;
                  const currentValue = groupMembers[currentMemberIndex]?.preferences[pref.id] || '';
                  
                  return (
                    <div key={pref.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="text-blue-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">{pref.label}</h3>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select your preferred {pref.label.toLowerCase()}
                        </label>
                        <select
                          value={currentValue}
                          onChange={(e) => updateMemberPreference(groupMembers[currentMemberIndex].id, pref.id, e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">Choose {pref.label.toLowerCase()}...</option>
                          {pref.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center mt-12">
                <button
                  onClick={prevMember}
                  disabled={currentMemberIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} />
                  Previous Person
                </button>
                
                <button
                  onClick={nextMember}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <>
                      {currentMemberIndex === groupMembers.length - 1 ? 'Get Recommendations' : 'Next Person'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {currentStep === 'results' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Top 5 Recommended Trails</h2>
                <p className="text-gray-600">Based on your group's preferences</p>
              </div>
              
              {recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((trail, index) => (
                    <div key={trail.trail_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </span>
                              <h3 className="font-bold text-gray-900 text-lg">{trail.trail_name}</h3>
                            </div>
                            <p className="text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              {trail.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-lg">
                            <Star className="text-yellow-500" size={16} />
                            <span className="text-sm font-semibold text-gray-700">{trail.rating}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{trail.distance_km}km</div>
                            <div className="text-xs text-gray-500">Distance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{trail.estimated_time_hours}h</div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{trail.elevation_gain_m}m</div>
                            <div className="text-xs text-gray-500">Elevation</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {trail.difficulty}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {trail.trail_type}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {trail.scenery_types.slice(0, 3).map((scenery, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {scenery}
                            </span>
                          ))}
                          {trail.scenery_types.length > 3 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                              +{trail.scenery_types.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Group Match: <span className="font-semibold text-blue-600">{calculateGroupMatch(trail).toFixed(0)}%</span>
                          </span>
                          <span className="text-gray-600">
                            Utility: <span className="font-semibold text-green-600">{((trail.averageMemberUtility || 0.8) * 100).toFixed(0)}%</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-center gap-4 pt-8">
                <button
                  onClick={resetToGroupSize}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Start Over
                </button>
                
                <button
                  onClick={() => setCurrentStep('preferences')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Preferences
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InteractiveTrailSelector;