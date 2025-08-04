# Pacific Northwest Trail Recommendation Dataset

A comprehensive dataset of 243 hiking trails in the Pacific Northwest region, designed for developing and evaluating group trail recommendation algorithms. The dataset covers the Greater Vancouver Area, British Columbia, and adjacent areas of Washington State.

## CSV Data Workflow

![CSV Workflow Diagram](Untitled%20diagram%20_%20Mermaid%20Chart-2025-07-25-224114%202.png)

*CSV data processing workflow showing the complete pipeline from data collection to final dataset preparation.*

## Dataset Overview

### Geographic Coverage
- Vancouver, North Vancouver, West Vancouver
- Squamish, BC  
- Adjacent regions of Washington State

### Dataset Size
- **Total Trails**: 243 unique hiking trails
- **Format**: CSV with structured trail metadata
- **Quality**: Multi-layer validated and cleaned

## Data Features

Based on the comprehensive data collection and validation process described in our methodology, the dataset includes:

### Quantitative Attributes
- **Trail Length**: 0.2 km to 180 km (average: 6.66 km)
- **Elevation Gain**: 10 meters to 2000+ meters  
- **Estimated Time**: 0.5 hours to 12+ hours
- **User Ratings**: 3.6 to 4.9 out of 5 (average: 4.24)

### Categorical Attributes
- **Difficulty Levels**: Easy (66.7%), Moderate (16.9%), Hard (16.5%)
- **Trail Types**: Loop (72), Out & Back (163), Point-to-Point (8)
- **Scenic Features**: Lakes, mountains, forests, waterfalls
- **Facilities**: Parking, restrooms, viewpoints, amenities

## Data Quality Assurance

Our dataset underwent rigorous validation:

✅ **Manual Cross-Verification**: Sample trails verified against AllTrails website  
✅ **AI-Assisted Validation**: Cross-referenced with multiple AI sources for popular trails  
✅ **Statistical Consistency**: All numerical attributes within expected ranges  
✅ **Deduplication**: Removed duplicate entries from overlapping queries  
✅ **Missing Data Handling**: Excluded trails with incomplete critical information  

## Usage

### Loading the Dataset
```python
import pandas as pd

# Load the dataset
trails_df = pd.read_csv('your_dataset_file.csv')

# Explore the structure
print(trails_df.head())
print(trails_df.columns.tolist())
print(trails_df.info())
```

### Data Exploration
```python
# Check dataset shape and basic statistics
print(f"Dataset shape: {trails_df.shape}")
print(trails_df.describe())

# Examine categorical variables
categorical_cols = trails_df.select_dtypes(include=['object']).columns
for col in categorical_cols:
    print(f"\n{col} unique values: {trails_df[col].nunique()}")
    print(trails_df[col].value_counts().head())
```

## Research Applications

This dataset is designed for:

- **Group Decision-Making Algorithms**: Multi-criteria trail selection research
- **Recommendation Systems**: Personalized and group-based trail suggestions
- **Machine Learning**: Classification and clustering of outdoor recreation data
- **User Preference Analysis**: Understanding hiking decision patterns

### Example Research Questions
- How do group preferences affect trail selection?
- What trail features predict user satisfaction?
- Can we model consensus-building in outdoor recreation choices?

## Data Collection Method

This dataset was collected using the [AllTrails MCP Server](https://github.com/srinath1510/alltrails-mcp-server), an open-source tool for structured AllTrails data extraction.

### Collection Process
1. **Tool Setup**: Configured the AllTrails MCP Server for batch querying
2. **Geographic Targeting**: Focused queries on Pacific Northwest regions
3. **Data Extraction**: Retrieved structured JSON data via the MCP server
4. **Format Conversion**: Converted JSON responses to CSV format
5. **Quality Processing**: Applied comprehensive cleaning and validation pipeline

### Workflow Overview
The CSV workflow diagram above illustrates the complete data processing pipeline, from initial data collection through final dataset preparation. This systematic approach ensures data quality and consistency across all 243 trail records.

### Key Collection Parameters
- **Target Areas**: Vancouver metro, Squamish, Washington State borders
- **Query Strategy**: Dynamic parameters designed to maximize regional coverage
- **Compliance**: All data collection followed platform access terms
- **Validation**: Multi-source cross-verification for data authenticity

*For detailed methodology, see our research documentation.*

## File Information

The main dataset file contains all processed trail data after cleaning and validation. Column names and data types can be explored using standard pandas operations.

## Acknowledgments

- **Data Source**: [AllTrails MCP Server](https://github.com/srinath1510/alltrails-mcp-server)
- **Platform**: AllTrails for underlying trail information
- **Validation**: Claude AI and ChatGPT-4 for cross-verification
- **Regional Sources**: BC Parks and Washington State trail authorities

## License

This dataset is provided for research purposes. Please refer to AllTrails terms of service for data usage guidelines.

---

**Dataset Version**: 1.0  
**Last Updated**: [Date]  
**Total Records**: 243 trails