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

  // Switch to a member for preference setting
  const switchToMember = (memberIndex) => {
    // Save current preferences if member exists
    if (groupMembers[activeMember]) {
      const updatedMembers = [...groupMembers];
      updatedMembers[activeMember].preferences = { ...currentMemberPreferences };
      setGroupMembers(updatedMembers);
    }
    
    // Switch to new member
    setActiveMember(memberIndex);
    setCurrentMemberPreferences(groupMembers[memberIndex]?.preferences || {
      distance: '',
      elevation: '',
      time: '',
      difficulty: '',
      scenery: []
    });
  };

  // Handle preference changes
  const handlePreferenceChange = (type, value) => {
    if (type === 'scenery') {
      setCurrentMemberPreferences(prev => ({
        ...prev,
        scenery: prev.scenery.includes(value)
          ? prev.scenery.filter(s => s !== value)
          : [...prev.scenery, value]
      }));
    } else {
      setCurrentMemberPreferences(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };

  // Submit current member's preferences
  const submitMemberPreferences = async () => {
    const updatedMembers = [...groupMembers];
    updatedMembers[activeMember] = {
      ...updatedMembers[activeMember],
      preferences: { ...currentMemberPreferences },
      completed: true
    };
    setGroupMembers(updatedMembers);

    console.log(`✅ ${updatedMembers[activeMember].name} 偏好已保存:`, currentMemberPreferences);

    // Get recommendations with updated preferences
    await getRecommendations(updatedMembers);
  };

  // Get recommendations from backend
  const getRecommendations = async (membersData = groupMembers) => {
    setLoading(true);
    console.log('🚀 开始获取推荐...');
    
    try {
      // Convert group members to backend format
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

      console.log('📊 发送给后端的群体偏好:', groupPreferences);

      const response = await fetch('http://localhost:3001/api/trails/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupPreferences: groupPreferences,
          filters: {},
          k: 5
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`推荐请求失败: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('✅ 收到后端推荐:', data);
      
      setRecommendations(data.recommendations || []);
      
    } catch (error) {
      console.error('❌ 推荐错误:', error);
      setError(`推荐失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate group match percentage
  const calculateGroupMatch = (trail) => {
    const completedMembers = groupMembers.filter(member => member.completed);
    if (completedMembers.length === 0) return 0;
    
    let matchCount = 0;
    completedMembers.forEach(member => {
      const memberMatch = member.preferences.scenery.some(pref =>
        trail.scenery_types.some(scenery => 
          scenery.toLowerCase().includes(pref.toLowerCase())
        )
      );
      if (memberMatch) matchCount++;
    });
    return (matchCount / completedMembers.length) * 100;
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <Mountain className="text-white animate-pulse" size={40} />
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
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => setError(null)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                Dismiss
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
                <p className="text-blue-100 text-lg">Group-based hiking recommendations powered by advanced algorithms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Group Setup */}
        {currentStep === 'group-setup' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={20} />
              </div>
              Setup Your Group
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  How many people in your hiking group?
                </label>
                <select
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value))}
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-lg"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                    <option key={size} value={size}>
                      {size} {size === 1 ? 'Person' : 'People'}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={initializeGroup}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg font-semibold"
                >
                  <ArrowRight size={20} />
                  Start Setting Preferences
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">How it works:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-gray-700">Each person sets their hiking preferences</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-gray-700">AI analyzes group compatibility</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-gray-700">Get top 5 personalized trail recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Member Preferences */}
        {currentStep === 'member-preferences' && (
          <div className="space-y-8">
            {/* Group Members Navigation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                Group Members ({groupMembers.filter(m => m.completed).length}/{groupMembers.length} completed)
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {groupMembers.map((member, index) => (
                  <button
                    key={member.id}
                    onClick={() => switchToMember(index)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      activeMember === index
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : member.completed
                        ? 'border-green-500 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        member.completed ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {member.completed ? <CheckCircle size={20} /> : (index + 1)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{member.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Member Preferences */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {groupMembers[activeMember]?.name}'s Hiking Preferences
              </h3>
              
              <div className="space-y-6">
                {/* Distance Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <MapPin className="inline mr-2" size={16} />
                    Preferred Trail Distance
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {preferenceOptions.distance.map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePreferenceChange('distance', option)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          currentMemberPreferences.distance === option
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Elevation Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Mountain className="inline mr-2" size={16} />
                    Preferred Elevation Gain
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {preferenceOptions.elevation.map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePreferenceChange('elevation', option)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          currentMemberPreferences.elevation === option
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="inline mr-2" size={16} />
                    Preferred Hiking Duration
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {preferenceOptions.time.map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePreferenceChange('time', option)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          currentMemberPreferences.time === option
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Activity className="inline mr-2" size={16} />
                    Preferred Difficulty Level
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {preferenceOptions.difficulty.map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePreferenceChange('difficulty', option)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          currentMemberPreferences.difficulty === option
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scenery Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Eye className="inline mr-2" size={16} />
                    Preferred Scenery Types (select multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {preferenceOptions.scenery.map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePreferenceChange('scenery', option)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          currentMemberPreferences.scenery.includes(option)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <button
                    onClick={submitMemberPreferences}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin" size={20} />
                        Getting Recommendations...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Submit & Get Recommendations
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Display */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border border-green-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
                Top 5 Recommended Trails
              </h2>
              
              <button
                onClick={() => {
                  setCurrentStep('group-setup');
                  setGroupMembers([]);
                  setRecommendations([]);
                  setActiveMember(0);
                }}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Start Over
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((trail, index) => (
                <div key={trail.trail_id} className="bg-white/90 backdrop-blur-sm border border-green-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-gray-800 text-lg">{trail.trail_name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
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
                    {trail.scenery_types.slice(0, 4).map((scenery, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {scenery}
                      </span>
                    ))}
                    {trail.scenery_types.length > 4 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                        +{trail.scenery_types.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      Group Match: <span className="font-semibold text-green-600">{calculateGroupMatch(trail).toFixed(0)}%</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {trail.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trail Stats */}
        {trails.length > 0 && currentStep !== 'group-setup' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{trails.length}</div>
                <div className="text-sm text-gray-600">Total Trails</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{groupMembers.filter(m => m.completed).length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{recommendations.length}</div>
                <div className="text-sm text-gray-600">Recommendations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">4.6</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveTrailSelector;