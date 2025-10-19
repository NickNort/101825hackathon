# Data Analysis Reference Guide

## Common Statistical Measures

### Descriptive Statistics
- **Mean**: Average value
- **Median**: Middle value when sorted
- **Mode**: Most frequent value
- **Standard Deviation**: Measure of spread
- **Variance**: Square of standard deviation

### Correlation Analysis
- **Pearson Correlation**: Linear relationship between variables (-1 to 1)
- **Spearman Correlation**: Monotonic relationship (rank-based)
- **Kendall's Tau**: Alternative rank correlation

## Visualization Types

### Distribution Plots
- **Histogram**: Shows frequency distribution
- **Box Plot**: Shows quartiles and outliers
- **Violin Plot**: Shows distribution shape
- **Density Plot**: Smooth distribution curve

### Relationship Plots
- **Scatter Plot**: Two continuous variables
- **Line Plot**: Time series or ordered data
- **Heatmap**: Correlation matrix visualization
- **Pair Plot**: All variable combinations

## Data Quality Checks

### Missing Data
- **Complete Cases**: Rows with no missing values
- **Missing Patterns**: Which variables are missing together
- **Imputation Methods**: Mean, median, mode, or model-based

### Outlier Detection
- **Z-Score**: Values beyond ±3 standard deviations
- **IQR Method**: Values beyond 1.5 × IQR from quartiles
- **Isolation Forest**: Machine learning approach

## Analysis Workflow

1. **Data Exploration**
   - Load and inspect data structure
   - Check data types and missing values
   - Generate summary statistics

2. **Data Cleaning**
   - Handle missing values
   - Remove or transform outliers
   - Standardize formats

3. **Analysis**
   - Calculate descriptive statistics
   - Perform correlation analysis
   - Create visualizations

4. **Reporting**
   - Summarize key findings
   - Highlight important patterns
   - Provide actionable insights
