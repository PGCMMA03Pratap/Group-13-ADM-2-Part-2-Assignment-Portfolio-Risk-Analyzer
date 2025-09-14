import { create, all } from 'mathjs';

const math = create(all);

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
}

export interface RiskMetrics {
  portfolioReturn: number;
  portfolioVolatility: number;
  sharpeRatio: number;
  var95: number;
  cvar95: number;
  maxDrawdown: number;
  beta: number;
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

// Monte Carlo Simulation for portfolio returns
export function runMonteCarloSimulation(
  assets: Asset[],
  initialValue: number = 100000,
  timeHorizon: number = 252, // trading days in a year
  simulations: number = 10000
): MonteCarloResult {
  const { expectedReturn, volatility } = calculatePortfolioMetrics(assets);
  
  const dailyReturn = expectedReturn / 252;
  const dailyVolatility = volatility / Math.sqrt(252);
  
  const finalValues: number[] = [];
  const returns: number[] = [];
  
  for (let i = 0; i < simulations; i++) {
    let portfolioValue = initialValue;
    
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
  
  return {
    finalValues,
    returns,
    percentiles,
    var95,
    expectedReturn,
    volatility,
    sharpeRatio
  };
}

// Distribution fitting for historical returns
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

// Calculate comprehensive risk metrics
export function calculateRiskMetrics(
  assets: Asset[],
  returns: number[],
  marketReturns?: number[]
): RiskMetrics {
  const { expectedReturn: portfolioReturn, volatility: portfolioVolatility } = calculatePortfolioMetrics(assets);
  
  // Sharpe Ratio
  const riskFreeRate = 0.02;
  const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;
  
  // VaR and CVaR (95% confidence)
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const var95Index = Math.floor(0.05 * returns.length);
  const var95 = Math.abs(sortedReturns[var95Index]);
  
  // Conditional VaR (Expected Shortfall)
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
  
  // Beta calculation (if market returns provided)
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

// AHP (Analytic Hierarchy Process) for portfolio optimization
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