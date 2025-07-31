import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Mountain, Star, Users, Eye, Zap, TrendingUp, AlertCircle, RefreshCw, Heart, Activity, Award, ChevronDown, X, Plus, User, Settings, ArrowRight, ArrowLeft, Home, CheckCircle } from 'lucide-react';

const InteractiveTrailSelector = () => {
  const [trails, setTrails] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Group management states
  const [currentStep, setCurrentStep] = useState('group-setup'); // 'group-setup', 'member-preferences', 'results'
  const [groupSize, setGroupSize] = useState(3);
  const [groupMembers, setGroupMembers] = useState([]);
  const [activeMember, setActiveMember] = useState(0);
  const [currentMemberPreferences, setCurrentMemberPreferences] = useState({
    distance: '',
    elevation: '',
    time: '',
    difficulty: '',
    scenery: []
  });

  // Preference options
  const preferenceOptions = {
    distance: ['Short (< 5km)', 'Medium (5-10km)', 'Long (> 10km)'],
    elevation: ['Low (< 200m)', 'Medium (200-500m)', 'High (> 500m)'],
    time: ['Quick (< 2h)', 'Moderate (2-4h)', 'Long (> 4h)'],
    difficulty: ['Easy', 'Moderate', 'Hard'],
    scenery: ['Mountain', 'Lake', 'Forest', 'Ocean', 'Waterfall', 'Alpine', 'Beach', 'Canyon', 'Glacier', 'River']
  };

  // Load trail data from backend
  useEffect(() => {
    const loadTrails = async () => {
      setDataLoading(true);
      setError(null);
      
      try {
        console.log('🔍 正在从后端加载步道数据...');
        const response = await fetch('http://localhost:3001/api/trails');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
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
        console.log(`✅ 成功加载 ${processedData.length} 条步道数据`);
      } catch (err) {
        console.error('❌ 加载步道数据失败:', err);
        setError(`Failed to load trails: ${err.message}`);
      } finally {
        setDataLoading(false);
      }
    };

    loadTrails();
  }, []);

  // Initialize group members
  const initializeGroup = () => {
    const members = [];
    for (let i = 0; i < groupSize; i++) {
      members.push({
        id: i,
        name: `Person ${i + 1}`,
        preferences: {
          distance: '',
          elevation: '',
          time: '',
          difficulty: '',
          scenery: []
        },
        completed: false
      });
    }
    setGroupMembers(members);
    setCurrentStep('member-preferences');
    setActiveMember(0);
    setCurrentMemberPreferences({
      distance: '',
      elevation: '',
      time: '',
      difficulty: '',
      scenery: []
    });
  };

  // Switch to a different member
  const switchToMember = (memberIndex) => {
    if (memberIndex >= 0 && memberIndex < groupMembers.length) {
      setActiveMember(memberIndex);
      const member = groupMembers[memberIndex];
      setCurrentMemberPreferences({
        distance: member.preferences.distance,
        elevation: member.preferences.elevation,
        time: member.preferences.time,
        difficulty: member.preferences.difficulty,
        scenery: [...member.preferences.scenery]
      });
    }
  };

  // Handle preference changes
  const handlePreferenceChange = (type, value) => {
    if (type === 'scenery') {
      const currentScenery = currentMemberPreferences.scenery;
      const newScenery = currentScenery.includes(value)
        ? currentScenery.filter(s => s !== value)
        : [...currentScenery, value];
      
      setCurrentMemberPreferences(prev => ({
        ...prev,
        scenery: newScenery
      }));
    } else {
      setCurrentMemberPreferences(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };

  // Submit member preferences and get recommendations
  const submitMemberPreferences = async () => {
    // Update current member's preferences
    const updatedMembers = [...groupMembers];
    updatedMembers[activeMember] = {
      ...updatedMembers[activeMember],
      preferences: { ...currentMemberPreferences },
      completed: true
    };
    setGroupMembers(updatedMembers);

    // Get recommendations immediately after each member submits
    await getRecommendations(updatedMembers);

    // Move to next member
    const nextMemberIndex = (activeMember + 1) % groupMembers.length;
    switchToMember(nextMemberIndex);
  };

  // Get recommendations from backend
  const getRecommendations = async (membersData = groupMembers) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 正在获取推荐...');
      
      // Convert preferences to backend format
      const groupPreferences = membersData
        .filter(member => member.completed)
        .map(member => ({
          name: member.name,
          preferences: [
            ...Object.entries(member.preferences)
              .filter(([key, value]) => {
                if (key === 'scenery') return value && value.length > 0;
                return value && value !== '';
              })
              .flatMap(([key, value]) => {
                if (key === 'scenery') {
                  return value.map(v => v.toLowerCase());
                }
                // Convert preference values to match backend expectations
                switch(key) {
                  case 'distance':
                    if (value === 'Short (< 5km)') return 'short';
                    if (value === 'Medium (5-10km)') return 'medium';
                    if (value === 'Long (> 10km)') return 'long';
                    return value.toLowerCase();
                  case 'elevation':
                    if (value === 'Low (< 200m)') return 'low';
                    if (value === 'Medium (200-500m)') return 'medium';
                    if (value === 'High (> 500m)') return 'high';
                    return value.toLowerCase();
                  case 'time':
                    if (value === 'Quick (< 2h)') return 'quick';
                    if (value === 'Moderate (2-4h)') return 'moderate';
                    if (value === 'Long (> 4h)') return 'long';
                    return value.toLowerCase();
                  default:
                    return value.toLowerCase();
                }
              })
          ]
        }));

      const response = await fetch('http://localhost:3001/api/trails/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupPreferences: groupPreferences,
          filters: {},
          k: 6
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || data);
      console.log(`✅ 成功获取 ${(data.recommendations || data).length} 条推荐`);
    } catch (err) {
      console.error('❌ 获取推荐失败:', err);
      setError(`Failed to get recommendations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate group match percentage for a trail
  const calculateGroupMatch = (trail) => {
    const completedMembers = groupMembers.filter(m => m.completed);
    if (completedMembers.length === 0) return 0;
    
    let totalMatchScore = 0;
    completedMembers.forEach(member => {
      const prefs = member.preferences;
      let memberMatchScore = 0;
      let totalPreferences = 0;
      
      // Check distance preference
      if (prefs.distance && prefs.distance !== '') {
        totalPreferences++;
        const trailDistance = trail.distance_km;
        if (prefs.distance.includes('Short') && trailDistance < 5) memberMatchScore++;
        else if (prefs.distance.includes('Medium') && trailDistance >= 5 && trailDistance <= 10) memberMatchScore++;
        else if (prefs.distance.includes('Long') && trailDistance > 10) memberMatchScore++;
      }
      
      // Check elevation preference
      if (prefs.elevation && prefs.elevation !== '') {
        totalPreferences++;
        const trailElevation = trail.elevation_gain_m;
        if (prefs.elevation.includes('Low') && trailElevation < 200) memberMatchScore++;
        else if (prefs.elevation.includes('Medium') && trailElevation >= 200 && trailElevation <= 500) memberMatchScore++;
        else if (prefs.elevation.includes('High') && trailElevation > 500) memberMatchScore++;
      }
      
      // Check time preference
      if (prefs.time && prefs.time !== '') {
        totalPreferences++;
        const trailTime = trail.estimated_time_hours;
        if (prefs.time.includes('Quick') && trailTime < 2) memberMatchScore++;
        else if (prefs.time.includes('Moderate') && trailTime >= 2 && trailTime <= 4) memberMatchScore++;
        else if (prefs.time.includes('Long') && trailTime > 4) memberMatchScore++;
      }
      
      // Check difficulty preference
      if (prefs.difficulty && prefs.difficulty !== '') {
        totalPreferences++;
        if (prefs.difficulty === trail.difficulty) memberMatchScore++;
      }
      
      // Check scenery preference
      if (prefs.scenery && prefs.scenery.length > 0) {
        totalPreferences++;
        const hasMatchingScenery = prefs.scenery.some(pref => 
          trail.scenery_types.some(scenery => 
            scenery.toLowerCase().includes(pref.toLowerCase())
          )
        );
        if (hasMatchingScenery) memberMatchScore++;
      }
      
      // Calculate member's match percentage
      if (totalPreferences > 0) {
        totalMatchScore += (memberMatchScore / totalPreferences) * 100;
      }
    });
    
    return Math.round(totalMatchScore / completedMembers.length);
  };

  if (dataLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <Mountain className="text-white animate-pulse" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Trail Data...</h2>
          <p className="text-gray-600">Connecting to backend and loading trails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="py-4">
        <div className="max-w-6xl mx-auto px-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="text-red-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Error</h3>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setError(null)}
                  style={{
                    background: 'linear-gradient(to right, #f97316, #eab308)',
                    color: 'white'
                  }}
                  className="px-4 py-2 rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 shadow-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Group Setup */}
          {currentStep === 'group-setup' && (
            <div className="flex items-center justify-center py-4">
              <div className="max-w-4xl w-full">
                {/* Main Title */}
                <div className="text-center mb-6">
                  <h1 className="text-5xl font-bold text-gray-800 mb-4">Setup Your Group</h1>
                  <p className="text-xl text-gray-600">Create your hiking team and get personalized recommendations</p>
                </div>
                
                {/* Main Content */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/30">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side - Group Setup */}
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                          How many people in your hiking group?
                        </h2>
                        <select
                          value={groupSize}
                          onChange={(e) => setGroupSize(parseInt(e.target.value))}
                          className="w-full p-6 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 shadow-lg text-xl font-medium transition-all duration-200 hover:border-gray-300"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                            <option key={size} value={size}>
                              {size} {size === 1 ? 'Person' : 'People'}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <button
                        onClick={initializeGroup}
                        style={{
                          background: 'linear-gradient(to right, #f97316, #eab308)',
                          color: 'white'
                        }}
                        className="w-full py-6 px-8 rounded-2xl hover:shadow-2xl transform hover:-translate-y-1 text-xl font-semibold transition-all duration-300 flex items-center justify-center gap-4 shadow-xl"
                      >
                        <ArrowRight size={24} />
                        Start Setting Preferences
                      </button>
                    </div>
                    
                    {/* Right Side - How it works */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Settings className="text-white" size={20} />
                        </div>
                        How it works:
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                            1
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Set Individual Preferences</h4>
                            <p className="text-gray-600">Each person sets their hiking preferences including distance, difficulty, and scenery types</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                            2
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">AI Analysis</h4>
                            <p className="text-gray-600">Advanced algorithms analyze group compatibility and preferences</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                            3
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Get Recommendations</h4>
                            <p className="text-gray-600">Receive top 5 personalized trail recommendations perfect for your group</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="text-center mt-6">
                  <p className="text-gray-500 text-sm">
                    Powered by advanced group optimization algorithms • 243+ trails available
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Member Preferences */}
          {currentStep === 'member-preferences' && (
            <div className="min-h-[70vh]">
              {/* Main Title */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Set Your Preferences</h1>
                <p className="text-lg text-gray-600">Configure hiking preferences for each group member</p>
              </div>
              
              {/* Main Content */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/30">
                {/* Group Members Navigation */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <User className="text-white" size={20} />
                    </div>
                    Group Members ({groupMembers.filter(m => m.completed).length}/{groupMembers.length} completed)
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {groupMembers.map((member, index) => (
                      <button
                        key={member.id}
                        onClick={() => switchToMember(index)}
                        className={`p-5 rounded-xl border-4 transition-all duration-200 ${
                          activeMember === index
                            ? 'border-orange-600 bg-orange-50 hover:bg-orange-100'
                            : member.completed
                            ? 'border-green-500 bg-green-50 hover:bg-green-100'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                        style={activeMember === index ? {
                          borderColor: '#ea580c',
                          backgroundColor: '#fff7ed',
                          boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.1)'
                        } : {}}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              activeMember === index ? 'bg-white text-orange-600 border-2 border-orange-600' :
                              member.completed ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                            }`}
                          >
                            {member.completed && activeMember !== index ? <CheckCircle size={16} /> : (index + 1)}
                          </div>
                          <span 
                            className="text-sm font-bold text-gray-700"
                            style={activeMember === index ? { color: '#c2410c' } : {}}
                          >
                            {member.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Active Member Preferences */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Settings className="text-white" size={20} />
                    </div>
                    {groupMembers[activeMember]?.name}'s Hiking Preferences
                  </h3>
                  
                  <div className="space-y-8">
                    {/* Distance Preference */}
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <MapPin size={20} />
                        Preferred Trail Distance
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {preferenceOptions.distance.map((option) => (
                          <button
                            key={option}
                            onClick={() => handlePreferenceChange('distance', option)}
                            className="p-8 rounded-2xl border-2 transition-all duration-200 text-base border-gray-200 bg-gray-50 hover:bg-gray-100"
                            style={currentMemberPreferences.distance === option ? {
                              borderColor: '#ea580c',
                              backgroundColor: '#fff7ed',
                              color: '#c2410c',
                              boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.1)'
                            } : {
                              backgroundColor: '#f9fafb',
                              borderColor: '#e5e7eb'
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Elevation Preference */}
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Mountain size={20} />
                        Preferred Elevation Gain
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {preferenceOptions.elevation.map((option) => (
                          <button
                            key={option}
                            onClick={() => handlePreferenceChange('elevation', option)}
                            className="p-8 rounded-2xl border-2 transition-all duration-200 text-base border-gray-200 bg-gray-50 hover:bg-gray-100"
                            style={currentMemberPreferences.elevation === option ? {
                              borderColor: '#ea580c',
                              backgroundColor: '#fff7ed',
                              color: '#c2410c',
                              boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.1)'
                            } : {
                              backgroundColor: '#f9fafb',
                              borderColor: '#e5e7eb'
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Preference */}
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Clock size={20} />
                        Preferred Hiking Duration
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {preferenceOptions.time.map((option) => (
                          <button
                            key={option}
                            onClick={() => handlePreferenceChange('time', option)}
                            className="p-8 rounded-2xl border-2 transition-all duration-200 text-base border-gray-200 bg-gray-50 hover:bg-gray-100"
                            style={currentMemberPreferences.time === option ? {
                              borderColor: '#ea580c',
                              backgroundColor: '#fff7ed',
                              color: '#c2410c',
                              boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.1)'
                            } : {
                              backgroundColor: '#f9fafb',
                              borderColor: '#e5e7eb'
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Preference */}
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Activity size={20} />
                        Preferred Difficulty Level
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {preferenceOptions.difficulty.map((option) => (
                          <button
                            key={option}
                            onClick={() => handlePreferenceChange('difficulty', option)}
                            className="p-8 rounded-2xl border-2 transition-all duration-200 text-base border-gray-200 bg-gray-50 hover:bg-gray-100"
                            style={currentMemberPreferences.difficulty === option ? {
                              borderColor: '#ea580c',
                              backgroundColor: '#fff7ed',
                              color: '#c2410c',
                              boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.1)'
                            } : {
                              backgroundColor: '#f9fafb',
                              borderColor: '#e5e7eb'
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scenery Preference */}
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Eye size={20} />
                        Preferred Scenery Types (select multiple)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {preferenceOptions.scenery.map((option) => (
                          <button
                            key={option}
                            onClick={() => handlePreferenceChange('scenery', option)}
                            className="p-6 rounded-2xl border-2 transition-all duration-200 text-sm border-gray-200 bg-gray-50 hover:bg-gray-100"
                            style={currentMemberPreferences.scenery.includes(option) ? {
                              borderColor: '#ea580c',
                              backgroundColor: '#fff7ed',
                              color: '#c2410c',
                              boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.1)'
                            } : {
                              backgroundColor: '#f9fafb',
                              borderColor: '#e5e7eb'
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-8">
                      <button
                        onClick={submitMemberPreferences}
                        disabled={loading}
                        style={{
                          background: 'linear-gradient(to right, #f97316, #eab308)',
                          color: 'white'
                        }}
                        className="py-6 px-12 rounded-2xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 shadow-xl text-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="animate-spin" size={24} />
                            Getting Recommendations...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={24} />
                            Submit & Get Recommendations
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Display - Show alongside member preferences */}
          {recommendations.length > 0 && currentStep === 'member-preferences' && (
            <div className="mt-6">
              {/* Main Title */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Current Recommendations</h2>
                <p className="text-lg text-gray-600">Updated based on {groupMembers.filter(m => m.completed).length}/{groupMembers.length} completed preferences</p>
              </div>
              
              {/* Main Content */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    Top 6 Recommended Trails
                  </h3>
                  
                  <div className="flex gap-4">
                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                      {groupMembers.filter(m => m.completed).length}/{groupMembers.length} members completed
                    </div>
                    <button
                      onClick={() => {
                        setCurrentStep('group-setup');
                        setGroupMembers([]);
                        setRecommendations([]);
                        setActiveMember(0);
                      }}
                      style={{
                        background: 'linear-gradient(to right, #f97316, #eab308)',
                        color: 'white'
                      }}
                      className="py-3 px-5 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 shadow-md text-base font-semibold"
                    >
                      <ArrowLeft size={16} />
                      Start Over
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((trail, index) => (
                    <div key={trail.trail_id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <h3 className="font-bold text-gray-800 text-lg">{trail.trail_name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                            <MapPin size={14} />
                            {trail.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-lg">
                          <Star className="text-yellow-500" size={16} />
                          <span className="text-sm font-semibold text-gray-700">{trail.rating}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-4">
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
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {trail.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                          {trail.trail_type}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {trail.scenery_types.slice(0, 3).map((scenery, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                            {scenery}
                          </span>
                        ))}
                        {trail.scenery_types.length > 3 && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs">
                            +{trail.scenery_types.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">
                          Group Match: <span className="font-semibold text-green-600">{calculateGroupMatch(trail).toFixed(0)}%</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {trail.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trail Stats */}
          {trails.length > 0 && currentStep !== 'group-setup' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/30">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Activity className="text-white" size={20} />
                </div>
                Trail Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{trails.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Trails</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">{groupMembers.filter(m => m.completed).length}</div>
                  <div className="text-sm text-gray-600 font-medium">Completed</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{recommendations.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Recommendations</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">4.6</div>
                  <div className="text-sm text-gray-600 font-medium">Avg Rating</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveTrailSelector;