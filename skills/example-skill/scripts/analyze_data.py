#!/usr/bin/env python3
"""
Data Analysis Script

This script provides common data analysis functions that can be used
to analyze datasets and generate insights.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Any

def load_data(file_path: str) -> pd.DataFrame:
    """
    Load data from various file formats.
    
    Args:
        file_path: Path to the data file
        
    Returns:
        pandas DataFrame with the loaded data
    """
    if file_path.endswith('.csv'):
        return pd.read_csv(file_path)
    elif file_path.endswith('.json'):
        return pd.read_json(file_path)
    elif file_path.endswith('.xlsx'):
        return pd.read_excel(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_path}")

def basic_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate basic statistics for a DataFrame.
    
    Args:
        df: pandas DataFrame
        
    Returns:
        Dictionary with statistical summary
    """
    return {
        'shape': df.shape,
        'columns': list(df.columns),
        'dtypes': df.dtypes.to_dict(),
        'missing_values': df.isnull().sum().to_dict(),
        'numeric_summary': df.describe().to_dict() if len(df.select_dtypes(include=[np.number]).columns) > 0 else None
    }

def create_correlation_matrix(df: pd.DataFrame, columns: List[str] = None) -> pd.DataFrame:
    """
    Create a correlation matrix for numeric columns.
    
    Args:
        df: pandas DataFrame
        columns: List of columns to include (default: all numeric columns)
        
    Returns:
        Correlation matrix as DataFrame
    """
    numeric_df = df.select_dtypes(include=[np.number])
    
    if columns:
        numeric_df = numeric_df[columns]
    
    return numeric_df.corr()

def plot_distribution(df: pd.DataFrame, column: str, bins: int = 30):
    """
    Create a distribution plot for a numeric column.
    
    Args:
        df: pandas DataFrame
        column: Column name to plot
        bins: Number of bins for histogram
    """
    plt.figure(figsize=(10, 6))
    plt.hist(df[column].dropna(), bins=bins, alpha=0.7, edgecolor='black')
    plt.title(f'Distribution of {column}')
    plt.xlabel(column)
    plt.ylabel('Frequency')
    plt.grid(True, alpha=0.3)
    plt.show()

def generate_summary_report(df: pd.DataFrame) -> str:
    """
    Generate a text summary report of the dataset.
    
    Args:
        df: pandas DataFrame
        
    Returns:
        String with summary report
    """
    report = f"""
# Data Summary Report

## Dataset Overview
- **Shape**: {df.shape[0]} rows, {df.shape[1]} columns
- **Memory Usage**: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB

## Column Information
"""
    
    for col in df.columns:
        dtype = df[col].dtype
        null_count = df[col].isnull().sum()
        null_pct = (null_count / len(df)) * 100
        
        report += f"- **{col}**: {dtype} ({null_count} nulls, {null_pct:.1f}%)\n"
    
    # Add numeric summary if available
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        report += f"\n## Numeric Summary\n"
        report += df[numeric_cols].describe().to_string()
    
    return report

if __name__ == "__main__":
    # Example usage
    print("Data Analysis Helper Script")
    print("This script provides functions for data analysis tasks.")
    print("Import and use the functions as needed in your analysis.")
