import { create, all } from 'mathjs';

const math = create(all);

/**
 * 🚀 ADVANCED PORTFOLIO ANALYTICS LIBRARY
 * 
 * ✅ IMPLEMENTED METHODS:
 * 🎯 Monte Carlo Simulation - 10,000+ simulations for risk projections (lines 67-121)
 * 📊 Distribution Fitting - Statistical analysis of return patterns (lines 123-145) 
 * 📈 Comprehensive Risk Metrics - VaR, CVaR, Sharpe ratio, Beta (lines 148-205)
 * 🎯 AHP Method - Analytic Hierarchy Process for optimal weighting (lines 227-282)
 * 🎯 TOPSIS Method - Multi-criteria decision support for asset ranking (lines 320-427)
 * 
 * 🔮 FUTURE ENHANCEMENTS:
 * - Black-Litterman Model - Enhanced portfolio optimization
 * - Copula Models - Advanced correlation modeling
 * - Fama-French Factor Models - Multi-factor risk analysis
 */

export interface Asset {
  symbol: string;
  name: string;
  weight: number;
  expectedReturn: number;
  volatility: number;
  price: number;
}

export interface MonteCarloResult {
  finalValues: number[];
  returns: number[];
  percentiles: {
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  };
  var95: number;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  timeHorizonDays: number;
  multiPeriodProjections?: MultiPeriodProjection[];
}

export interface MultiPeriodProjection {
  period: string;
  timeHorizonDays: number;
  percentiles: {
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  };
  totalReturn: {
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  };
  annualizedReturn: number;
  probabilityOfLoss: number;
}

export interface RiskMetrics {
  portfolioReturn: number;
  portfolioVolatility: number;
  sharpeRatio: number;
  var95: number;
  cvar95: number;
  maxDrawdown: number;
  beta: number;
  skewness?: number;
  kurtosis?: number;
  volatility?: number;
}

export interface TOPSISCriteria {
  name: string;
  weight: number;
  beneficial: boolean; // true if higher values are better, false if lower values are better
}

export interface TOPSISResult {
  assetIndex: number;
  symbol: string;
  score: number;
  rank: number;
  distanceToIdeal: number;
  distanceToNegative: number;
}

// Normal distribution random number generator (Box-Muller)
function normalRandom(mean: number = 0, std: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * std + mean;
}

// Calculate portfolio expected return and volatility
export function calculatePortfolioMetrics(assets: Asset[]): { expectedReturn: number; volatility: number } {
  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
  
  const expectedReturn = assets.reduce((sum, asset) => 
    sum + (asset.weight / totalWeight) * asset.expectedReturn, 0
  );
  
  // Simplified volatility calculation (assuming no correlation)
  const variance = assets.reduce((sum, asset) => 
    sum + Math.pow(asset.weight / totalWeight, 2) * Math.pow(asset.volatility, 2), 0
  );
  
  const volatility = Math.sqrt(variance);
  
  return { expectedReturn, volatility };
}

// 🎯 MONTE CARLO SIMULATION - 10,000+ simulations for risk projections
// Advanced stochastic modeling using Box-Muller transformation for normal distribution
export function runMonteCarloSimulation(
  assets: Asset[],
  initialValue: number = 100000,
  timeHorizon: number = 252, // trading days in a year
  simulations: number = 10000,
  includeMultiPeriod: boolean = true
): MonteCarloResult {
  const { expectedReturn, volatility } = calculatePortfolioMetrics(assets);
  
  const dailyReturn = expectedReturn / 252;
  const dailyVolatility = volatility / Math.sqrt(252);
  
  const finalValues: number[] = [];
  const returns: number[] = [];
  
  // 🔄 MONTE CARLO SIMULATION ENGINE - Running 10,000+ simulations
  for (let i = 0; i < simulations; i++) {
    let portfolioValue = initialValue;
    
    // Daily price evolution using geometric Brownian motion
    for (let day = 0; day < timeHorizon; day++) {
      const dailyGrowth = normalRandom(dailyReturn, dailyVolatility);
      portfolioValue *= (1 + dailyGrowth);
    }
    
    finalValues.push(portfolioValue);
    returns.push((portfolioValue - initialValue) / initialValue);
  }
  
  // Sort results for percentile calculations
  const sortedValues = [...finalValues].sort((a, b) => a - b);
  const sortedReturns = [...returns].sort((a, b) => a - b);
  
  const percentiles = {
    p5: sortedValues[Math.floor(0.05 * simulations)],
    p25: sortedValues[Math.floor(0.25 * simulations)],
    p50: sortedValues[Math.floor(0.50 * simulations)],
    p75: sortedValues[Math.floor(0.75 * simulations)],
    p95: sortedValues[Math.floor(0.95 * simulations)]
  };
  
  // Value at Risk (95% confidence)
  const var95 = Math.abs((sortedValues[Math.floor(0.05 * simulations)] - initialValue) / initialValue);
  
  // Sharpe Ratio (assuming risk-free rate of 2%)
  const riskFreeRate = 0.02;
  const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
  
  // Calculate multi-period projections if requested
  const multiPeriodProjections = includeMultiPeriod ? 
    calculateMultiPeriodProjections(assets, initialValue, simulations) : undefined;

  return {
    finalValues,
    returns,
    percentiles,
    var95,
    expectedReturn,
    volatility,
    sharpeRatio,
    timeHorizonDays: timeHorizon,
    multiPeriodProjections
  };
}

// 📊 DISTRIBUTION FITTING - Statistical analysis of return patterns
// Calculates skewness, kurtosis, and normality tests for risk assessment
export function fitDistribution(returns: number[]): {
  mean: number;
  std: number;
  skewness: number;
  kurtosis: number;
  isNormal: boolean;
} {
  const n = returns.length;
  const mean = returns.reduce((sum, r) => sum + r, 0) / n;
  
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (n - 1);
  const std = Math.sqrt(variance);
  
  // Calculate skewness and kurtosis
  const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / std, 3), 0) / n;
  const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / std, 4), 0) / n - 3;
  
  // Simple normality test (rough approximation)
  const isNormal = Math.abs(skewness) < 0.5 && Math.abs(kurtosis) < 1;
  
  return { mean, std, skewness, kurtosis, isNormal };
}

// 📈 COMPREHENSIVE RISK METRICS - VaR, CVaR, Sharpe ratio, Beta
// Advanced risk analytics including Value at Risk, Conditional VaR, and market correlation
export function calculateRiskMetrics(
  assets: Asset[],
  returns: number[],
  marketReturns?: number[]
): RiskMetrics {
  const { expectedReturn: portfolioReturn, volatility: portfolioVolatility } = calculatePortfolioMetrics(assets);
  
  // Sharpe Ratio
  const riskFreeRate = 0.02;
  const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;
  
  // 📊 VaR & CVaR CALCULATION - Value at Risk and Conditional Value at Risk (95% confidence)
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const var95Index = Math.floor(0.05 * returns.length);
  const var95 = Math.abs(sortedReturns[var95Index]);
  
  // 🔥 CVaR (Expected Shortfall) - Average loss beyond VaR threshold
  const cvar95 = Math.abs(
    sortedReturns.slice(0, var95Index).reduce((sum, r) => sum + r, 0) / var95Index
  );
  
  // Maximum Drawdown
  let runningMax = returns[0];
  let maxDrawdown = 0;
  
  for (let i = 1; i < returns.length; i++) {
    runningMax = Math.max(runningMax, returns[i]);
    const drawdown = (runningMax - returns[i]) / runningMax;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  // 📈 BETA CALCULATION - Market correlation and systematic risk measurement
  let beta = 1.0;
  if (marketReturns && marketReturns.length === returns.length) {
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
    const portfolioMean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    let covariance = 0;
    let marketVariance = 0;
    
    for (let i = 0; i < returns.length; i++) {
      covariance += (returns[i] - portfolioMean) * (marketReturns[i] - marketMean);
      marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }
    
    beta = covariance / marketVariance;
  }
  
  return {
    portfolioReturn,
    portfolioVolatility,
    sharpeRatio,
    var95,
    cvar95,
    maxDrawdown,
    beta
  };
}

// Calculate multi-period projections for different time horizons
export function calculateMultiPeriodProjections(
  assets: Asset[],
  initialValue: number,
  simulations: number = 10000
): MultiPeriodProjection[] {
  const { expectedReturn, volatility } = calculatePortfolioMetrics(assets);
  const dailyReturn = expectedReturn / 252;
  const dailyVolatility = volatility / Math.sqrt(252);

  // Define standard time periods (in trading days)
  const periods = [
    { name: '1 Year', days: 252 },
    { name: '3 Years', days: 252 * 3 },
    { name: '5 Years', days: 252 * 5 },
    { name: '10 Years', days: 252 * 10 },
    { name: '15 Years', days: 252 * 15 },
    { name: '20 Years', days: 252 * 20 }
  ];

  return periods.map(period => {
    const finalValues: number[] = [];
    
    // Run simulations for this specific period
    for (let i = 0; i < simulations; i++) {
      let portfolioValue = initialValue;
      
      for (let day = 0; day < period.days; day++) {
        const dailyGrowth = normalRandom(dailyReturn, dailyVolatility);
        portfolioValue *= (1 + dailyGrowth);
      }
      
      finalValues.push(portfolioValue);
    }
    
    // Sort for percentile calculations
    const sortedValues = [...finalValues].sort((a, b) => a - b);
    
    const percentiles = {
      p5: sortedValues[Math.floor(0.05 * simulations)],
      p25: sortedValues[Math.floor(0.25 * simulations)],
      p50: sortedValues[Math.floor(0.50 * simulations)],
      p75: sortedValues[Math.floor(0.75 * simulations)],
      p95: sortedValues[Math.floor(0.95 * simulations)]
    };
    
    // Calculate total returns
    const totalReturn = {
      p5: ((percentiles.p5 - initialValue) / initialValue) * 100,
      p25: ((percentiles.p25 - initialValue) / initialValue) * 100,
      p50: ((percentiles.p50 - initialValue) / initialValue) * 100,
      p75: ((percentiles.p75 - initialValue) / initialValue) * 100,
      p95: ((percentiles.p95 - initialValue) / initialValue) * 100
    };
    
    // Calculate annualized return (median)
    const years = period.days / 252;
    const annualizedReturn = (Math.pow(percentiles.p50 / initialValue, 1 / years) - 1) * 100;
    
    // Calculate probability of loss
    const lossCount = finalValues.filter(value => value < initialValue).length;
    const probabilityOfLoss = (lossCount / simulations) * 100;
    
    return {
      period: period.name,
      timeHorizonDays: period.days,
      percentiles,
      totalReturn,
      annualizedReturn,
      probabilityOfLoss
    };
  });
}

// Generate sample historical data for demonstration
export function generateSampleData(assets: Asset[], days: number = 252): number[][] {
  return assets.map(asset => {
    const data: number[] = [];
    let price = asset.price;
    
    const dailyReturn = asset.expectedReturn / 252;
    const dailyVolatility = asset.volatility / Math.sqrt(252);
    
    for (let i = 0; i < days; i++) {
      const dailyChange = normalRandom(dailyReturn, dailyVolatility);
      price *= (1 + dailyChange);
      data.push(price);
    }
    
    return data;
  });
}

// 🎯 AHP METHOD - Analytic Hierarchy Process for optimal weighting  
// Multi-criteria decision analysis using eigenvalue decomposition and consistency checking
export function calculateAHPWeights(
  criteria: string[],
  pairwiseMatrix: number[][]
): { weights: number[]; consistencyRatio: number } {
  try {
    const n = criteria.length;
    
    // Calculate eigenvector (simplified approach using power method)
    let weights = new Array(n).fill(1 / n);
    
    for (let iter = 0; iter < 100; iter++) {
      const newWeights = new Array(n).fill(0);
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          newWeights[i] += pairwiseMatrix[i][j] * weights[j];
        }
      }
      
      // Normalize
      const sum = newWeights.reduce((acc, w) => acc + w, 0);
      for (let i = 0; i < n; i++) {
        newWeights[i] /= sum;
      }
      
      // Check convergence
      const diff = weights.reduce((acc, w, i) => acc + Math.abs(w - newWeights[i]), 0);
      weights = newWeights;
      
      if (diff < 1e-6) break;
    }
    
    // Calculate consistency ratio (simplified)
    let lambda = 0;
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += pairwiseMatrix[i][j] * weights[j];
      }
      lambda += sum / weights[i];
    }
    lambda /= n;
    
    const ci = (lambda - n) / (n - 1);
    const ri = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41][n] || 1.41;
    const consistencyRatio = ci / ri;
    
    return { weights, consistencyRatio };
  } catch (error) {
    console.error('AHP calculation error:', error);
    return { 
      weights: new Array(criteria.length).fill(1 / criteria.length), 
      consistencyRatio: 0 
    };
  }
}

// 🎯 TOPSIS METHOD - Multi-criteria decision support for asset ranking
// Technique for Order Preference by Similarity to Ideal Solution
export function calculateTOPSISRanking(
  assets: Asset[],
  criteria: TOPSISCriteria[]
): TOPSISResult[] {
  try {
    const n = assets.length;
    const m = criteria.length;
    
    // Step 1: Create decision matrix with normalized values
    const decisionMatrix: number[][] = [];
    
    // Extract criteria values for each asset
    for (let i = 0; i < n; i++) {
      const asset = assets[i];
      const row: number[] = [];
      
      criteria.forEach(criterion => {
        switch (criterion.name.toLowerCase()) {
          case 'return':
          case 'expectedReturn':
            row.push(asset.expectedReturn);
            break;
          case 'volatility':
          case 'risk':
            row.push(asset.volatility);
            break;
          case 'sharpe':
          case 'sharperatio':
            const riskFreeRate = 0.02;
            row.push((asset.expectedReturn - riskFreeRate) / asset.volatility);
            break;
          case 'price':
            row.push(asset.price);
            break;
          default:
            row.push(0); // Default value for unknown criteria
        }
      });
      
      decisionMatrix.push(row);
    }
    
    // Step 2: Normalize the decision matrix
    const normalizedMatrix: number[][] = [];
    
    for (let j = 0; j < m; j++) {
      // Calculate sum of squares for column j
      const sumOfSquares = decisionMatrix.reduce((sum, row) => sum + Math.pow(row[j], 2), 0);
      const denominator = Math.sqrt(sumOfSquares);
      
      // Normalize each element in column j
      for (let i = 0; i < n; i++) {
        if (!normalizedMatrix[i]) normalizedMatrix[i] = [];
        normalizedMatrix[i][j] = denominator !== 0 ? decisionMatrix[i][j] / denominator : 0;
      }
    }
    
    // Step 3: Calculate weighted normalized matrix
    const weightedMatrix: number[][] = normalizedMatrix.map(row =>
      row.map((value, j) => value * criteria[j].weight)
    );
    
    // Step 4: Determine ideal and negative-ideal solutions
    const idealSolution: number[] = [];
    const negativeIdealSolution: number[] = [];
    
    for (let j = 0; j < m; j++) {
      const columnValues = weightedMatrix.map(row => row[j]);
      
      if (criteria[j].beneficial) {
        // For beneficial criteria, ideal is max, negative-ideal is min
        idealSolution[j] = Math.max(...columnValues);
        negativeIdealSolution[j] = Math.min(...columnValues);
      } else {
        // For non-beneficial criteria, ideal is min, negative-ideal is max
        idealSolution[j] = Math.min(...columnValues);
        negativeIdealSolution[j] = Math.max(...columnValues);
      }
    }
    
    // Step 5: Calculate distances and TOPSIS scores
    const results: TOPSISResult[] = [];
    
    for (let i = 0; i < n; i++) {
      // Distance to ideal solution
      const distanceToIdeal = Math.sqrt(
        weightedMatrix[i].reduce((sum, value, j) => 
          sum + Math.pow(value - idealSolution[j], 2), 0
        )
      );
      
      // Distance to negative-ideal solution
      const distanceToNegative = Math.sqrt(
        weightedMatrix[i].reduce((sum, value, j) => 
          sum + Math.pow(value - negativeIdealSolution[j], 2), 0
        )
      );
      
      // TOPSIS score (relative closeness to ideal solution)
      const score = distanceToNegative / (distanceToIdeal + distanceToNegative);
      
      results.push({
        assetIndex: i,
        symbol: assets[i].symbol,
        score: isNaN(score) ? 0 : score,
        rank: 0, // Will be set after sorting
        distanceToIdeal,
        distanceToNegative
      });
    }
    
    // Step 6: Rank alternatives based on TOPSIS scores (higher is better)
    results.sort((a, b) => b.score - a.score);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    return results;
  } catch (error) {
    console.error('TOPSIS calculation error:', error);
    return assets.map((asset, index) => ({
      assetIndex: index,
      symbol: asset.symbol,
      score: 0,
      rank: index + 1,
      distanceToIdeal: 0,
      distanceToNegative: 0
    }));
  }
}