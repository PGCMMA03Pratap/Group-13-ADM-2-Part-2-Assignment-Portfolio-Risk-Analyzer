import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Zap, 
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Asset, calculatePortfolioMetrics } from '@/lib/analytics';

interface PortfolioStrategy {
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  volatility: number;
  allocation: { [key: string]: number };
  icon: React.ComponentType<any>;
  color: string;
}

interface RecommendationProps {
  assets: Asset[];
  userRiskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon?: number; // in years
  currentAge?: number;
}

const portfolioStrategies: PortfolioStrategy[] = [
  {
    name: 'Conservative Growth',
    description: 'Low-risk portfolio focused on capital preservation with modest growth',
    riskLevel: 'low',
    expectedReturn: 0.08,
    volatility: 0.15,
    allocation: {
      'Large Cap Stocks': 40,
      'Bonds': 45,
      'REITs': 10,
      'Cash/Money Market': 5
    },
    icon: Shield,
    color: 'text-green-600'
  },
  {
    name: 'Balanced Portfolio',
    description: 'Moderate risk with balanced growth and income generation',
    riskLevel: 'medium',
    expectedReturn: 0.12,
    volatility: 0.22,
    allocation: {
      'Large Cap Stocks': 50,
      'Small Cap Stocks': 15,
      'International Stocks': 20,
      'Bonds': 15
    },
    icon: BarChart3,
    color: 'text-blue-600'
  },
  {
    name: 'Aggressive Growth',
    description: 'High-risk, high-reward portfolio for maximum long-term growth',
    riskLevel: 'high',
    expectedReturn: 0.18,
    volatility: 0.35,
    allocation: {
      'Growth Stocks': 45,
      'Tech Stocks': 25,
      'Small Cap Stocks': 15,
      'International Stocks': 15
    },
    icon: Zap,
    color: 'text-red-600'
  }
];

export function PortfolioRecommendations({ 
  assets, 
  userRiskTolerance = 'moderate',
  investmentHorizon = 10,
  currentAge = 35
}: RecommendationProps) {
  const currentMetrics = useMemo(() => {
    if (assets.length === 0) return null;
    return calculatePortfolioMetrics(assets);
  }, [assets]);

  const recommendations = useMemo(() => {
    if (!currentMetrics) return [];

    const currentReturn = currentMetrics.expectedReturn;
    const currentVolatility = currentMetrics.volatility;
    const currentSharpe = (currentReturn - 0.02) / currentVolatility;

    const recommendations: any[] = [];

    // Analyze current portfolio
    const analysis = {
      isOverConcentrated: assets.some(asset => asset.weight > 40),
      hasHighVolatility: currentVolatility > 0.30,
      hasLowReturn: currentReturn < 0.10,
      needsDiversification: assets.length < 5,
      riskScore: currentVolatility * 100
    };

    // General recommendations
    if (analysis.isOverConcentrated) {
      recommendations.push({
        type: 'warning',
        title: 'Portfolio Concentration Risk',
        description: 'Your portfolio has high concentration in few assets. Consider diversifying to reduce risk.',
        action: 'Rebalance to limit individual positions to 25% or less'
      });
    }

    if (analysis.needsDiversification) {
      recommendations.push({
        type: 'info',
        title: 'Increase Diversification',
        description: 'Add more assets to your portfolio to improve risk-adjusted returns.',
        action: 'Target 8-12 different assets across various sectors'
      });
    }

    if (analysis.hasHighVolatility && userRiskTolerance === 'conservative') {
      recommendations.push({
        type: 'warning',
        title: 'High Risk for Conservative Profile',
        description: 'Your portfolio volatility is high for a conservative investor.',
        action: 'Consider adding bonds or defensive stocks to reduce volatility'
      });
    }

    // Age-based recommendations
    const suggestedBondAllocation = Math.min(currentAge, 50);
    if (suggestedBondAllocation > 20) {
      recommendations.push({
        type: 'info',
        title: 'Age-Appropriate Asset Allocation',
        description: `Consider ${suggestedBondAllocation}% allocation to bonds for stability as you approach retirement.`,
        action: 'Gradually shift to more conservative investments'
      });
    }

    return recommendations;
  }, [assets, currentMetrics, userRiskTolerance, currentAge]);

  const getRecommendedStrategy = () => {
    const riskMap = {
      'conservative': 'low',
      'moderate': 'medium', 
      'aggressive': 'high'
    };
    return portfolioStrategies.find(strategy => strategy.riskLevel === riskMap[userRiskTolerance]);
  };

  const calculateOptimalAllocation = () => {
    if (!currentMetrics) return [];

    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
    
    return assets.map(asset => {
      const currentWeight = (asset.weight / totalWeight) * 100;
      const sharpeRatio = (asset.expectedReturn - 0.02) / asset.volatility;
      
      // Simple optimization: adjust weights based on Sharpe ratio
      const recommendedWeight = Math.max(5, Math.min(25, sharpeRatio * 15));
      
      return {
        ...asset,
        currentWeight,
        recommendedWeight,
        adjustment: recommendedWeight - currentWeight
      };
    }).sort((a, b) => Math.abs(b.adjustment) - Math.abs(a.adjustment));
  };

  const recommendedStrategy = getRecommendedStrategy();
  const optimalAllocation = calculateOptimalAllocation();

  if (!currentMetrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please add assets to your portfolio to see recommendations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Portfolio Analysis */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Portfolio Analysis & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-metric">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expected Return</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">
                {(currentMetrics.expectedReturn * 100).toFixed(1)}%
              </div>
            </div>
            <div className="card-metric">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Portfolio Risk</span>
                <BarChart3 className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold">
                {(currentMetrics.volatility * 100).toFixed(1)}%
              </div>
            </div>
            <div className="card-metric">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">
                {((currentMetrics.expectedReturn - 0.02) / currentMetrics.volatility).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="space-y-3">
            <h4 className="font-semibold">Risk Assessment</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Portfolio Risk Level</span>
                <Badge variant={
                  currentMetrics.volatility < 0.20 ? "default" : 
                  currentMetrics.volatility < 0.30 ? "secondary" : "destructive"
                }>
                  {currentMetrics.volatility < 0.20 ? "Low" : 
                   currentMetrics.volatility < 0.30 ? "Medium" : "High"}
                </Badge>
              </div>
              <Progress 
                value={Math.min(100, currentMetrics.volatility * 200)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      {recommendations.length > 0 && (
        <Card className="card-financial">
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <Alert key={index} className={rec.type === 'warning' ? 'border-orange-200' : 'border-blue-200'}>
                <AlertTriangle className="h-4 w-4" />
                <div>
                  <div className="font-semibold">{rec.title}</div>
                  <AlertDescription className="mt-1">
                    {rec.description}
                  </AlertDescription>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Action:</strong> {rec.action}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Strategy */}
      {recommendedStrategy && (
        <Card className="card-financial">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Recommended Strategy: {recommendedStrategy.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-secondary">
                <recommendedStrategy.icon className={`w-6 h-6 ${recommendedStrategy.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground mb-4">{recommendedStrategy.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Expected Return:</span> {(recommendedStrategy.expectedReturn * 100).toFixed(1)}%
                  </div>
                  <div>
                    <span className="font-medium">Expected Risk:</span> {(recommendedStrategy.volatility * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Recommended Asset Allocation</h4>
              <div className="space-y-2">
                {Object.entries(recommendedStrategy.allocation).map(([asset, percentage]) => (
                  <div key={asset} className="flex justify-between items-center">
                    <span className="text-sm">{asset}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimal Allocation Adjustments */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle>Portfolio Optimization Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimalAllocation.map((asset, index) => (
              <div key={index} className="card-metric">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{asset.symbol}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Sharpe: {((asset.expectedReturn - 0.02) / asset.volatility).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {Math.abs(asset.adjustment) > 2 && (
                      <Badge variant={asset.adjustment > 0 ? "default" : "secondary"}>
                        {asset.adjustment > 0 ? "Increase" : "Decrease"}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-medium ml-1">{asset.currentWeight.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Suggested:</span>
                    <span className="font-medium ml-1">{asset.recommendedWeight.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-1 text-muted-foreground" />
                    <span className={`font-medium ${
                      asset.adjustment > 2 ? 'text-green-600' : 
                      asset.adjustment < -2 ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {asset.adjustment > 0 ? '+' : ''}{asset.adjustment.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Strategy Comparison */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle>Strategy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {portfolioStrategies.map((strategy, index) => (
              <div key={index} className="card-metric">
                <div className="flex items-center gap-3 mb-3">
                  <strategy.icon className={`w-5 h-5 ${strategy.color}`} />
                  <h4 className="font-semibold">{strategy.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Return:</span>
                    <span className="font-medium">{(strategy.expectedReturn * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk:</span>
                    <span className="font-medium">{(strategy.volatility * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Level:</span>
                    <Badge variant={
                      strategy.riskLevel === 'low' ? 'default' :
                      strategy.riskLevel === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {strategy.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">1</div>
              <div>
                <h4 className="font-medium">Review Asset Allocation</h4>
                <p className="text-sm text-muted-foreground">Consider the suggested weight adjustments above to optimize your portfolio's risk-return profile.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">2</div>
              <div>
                <h4 className="font-medium">Implement Gradual Changes</h4>
                <p className="text-sm text-muted-foreground">Make portfolio adjustments gradually over 3-6 months to minimize market timing risks.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="font-medium">Regular Monitoring</h4>
                <p className="text-sm text-muted-foreground">Review and rebalance your portfolio quarterly to maintain optimal allocation.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}