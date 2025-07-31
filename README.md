# Trail Selection Backend with Greedy MinMax Regret Algorithm

This backend implements a sophisticated trail selection system using a Greedy MinMax Regret algorithm to recommend hiking trails for groups based on individual preferences and trail features.

## Features

- **Greedy MinMax Regret Algorithm**: Minimizes the maximum regret across all group members
- **Enhanced Utility Calculation**: Considers rating, preference matching, and difficulty preferences
- **Diversity Optimization**: Ensures selected trails are diverse in features and characteristics
- **Comprehensive Filtering**: Filter trails by difficulty, distance, time, elevation, type, and scenery
- **Group Preference Matching**: Calculates how well trails match each group member's preferences
- **Real-time Metrics**: Provides detailed statistics and metrics for recommendations

## Algorithm Details

### Greedy MinMax Regret Algorithm

The algorithm works as follows:

1. **Utility Calculation**: For each group member, calculate utility based on:
   - Trail rating (0-5 scale)
   - Preference matching (scenery types)
   - Difficulty preferences

2. **Regret Calculation**: For each potential trail selection:
   - Calculate utility for each group member
   - Find the best possible utility for each member
   - Calculate regret as: `best_utility - selected_utility`
   - Take the maximum regret across all members

3. **Greedy Selection**: Iteratively select trails that minimize the maximum regret

4. **Diversity Enhancement**: Consider trail diversity to avoid similar selections

## Performance

### Greedy MinMax Regret Algorithm
- **Time Complexity**: O(k * n * m) where k is number of trails to select, n is total trails, m is group size
- **Space Complexity**: O(n) for storing trail data
- **Scalability**: Handles up to 200+ trails efficiently

## Future Enhancements

1. **Machine Learning Integration**: Use ML models for better preference prediction
2. **Real-time Updates**: WebSocket support for live updates
3. **Caching**: Redis integration for faster responses
4. **Advanced Filtering**: More sophisticated filtering options
5. **User Feedback**: Incorporate user ratings and feedback

## License

MIT License 