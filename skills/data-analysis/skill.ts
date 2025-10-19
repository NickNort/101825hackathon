/**
 * Data Analysis Skill
 *
 * Provides Python-based data analysis capabilities using code execution
 */

import { Skill } from '../types';

export const dataAnalysisSkill: Skill = {
  id: 'data-analysis',
  name: 'Data Analysis',
  description: 'Python-based data analysis, visualization, and statistical computing',
  enabled: true,
  priority: 8,

  systemPrompt: `## Data Analysis

You have access to Python code execution for data analysis tasks. You can:

- **Data Processing**: Use pandas, numpy for data manipulation and cleaning
- **Statistical Analysis**: Calculate statistics, perform hypothesis testing
- **Data Visualization**: Create charts and graphs using matplotlib, seaborn
- **Machine Learning**: Basic ML tasks with scikit-learn
- **File Processing**: Read CSV, Excel, JSON and other data formats

**Available Libraries:**
- pandas: Data manipulation and analysis
- numpy: Numerical computing
- matplotlib: Data visualization
- seaborn: Statistical visualization
- scikit-learn: Machine learning
- scipy: Scientific computing

**Best Practices:**
- Show your code before executing it
- Explain what the code does
- Interpret results for the user
- Handle errors gracefully
- Suggest next steps or additional analyses`,

  tools: [
    {
      type: 'code_execution_20250825',
      name: 'code_execution',
    },
  ],
};
