import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, Target, TrendingUp, Activity, Zap } from 'lucide-react';
import { RiskMetrics } from '@/lib/analytics';

interface RiskMetricsDisplayProps {
  metrics: RiskMetrics;
}

export function RiskMetricsDisplay({ metrics }: RiskMetricsDisplayProps) {
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${(value * 100).toFixed(2)}%`;
  };

  const getRiskLevel = (sharpeRatio: number) => {
    if (sharpeRatio >= 2) return { level: 'Excellent', color: 'text-success', bg: 'bg-success/10' };
    if (sharpeRatio >= 1) return { level: 'Good', color: 'text-secondary', bg: 'bg-secondary/10' };
    if (sharpeRatio >= 0.5) return { level: 'Fair', color: 'text-primary', bg: 'bg-primary/10' };
    return { level: 'Poor', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  const getVolatilityLevel = (volatility: number) => {
    if (volatility <= 0.1) return { level: 'Low', color: 'text-success', progress: 25 };
    if (volatility <= 0.2) return { level: 'Moderate', color: 'text-secondary', progress: 50 };
    if (volatility <= 0.3) return { level: 'High', color: 'text-primary', progress: 75 };
    return { level: 'Very High', color: 'text-destructive', progress: 100 };
  };

  const riskLevel = getRiskLevel(metrics.sharpeRatio);
  const volatilityLevel = getVolatilityLevel(metrics.portfolioVolatility);

  const riskMetricCards = [
    {
      title: 'Portfolio Return',
      value: formatPercent(metrics.portfolioReturn),
      description: 'Expected annual return',
      icon: TrendingUp,
      color: metrics.portfolioReturn >= 0 ? 'text-success' : 'text-destructive',
      bg: metrics.portfolioReturn >= 0 ? 'bg-success/10' : 'bg-destructive/10'
    },
    {
      title: 'Portfolio Volatility',
      value: formatPercent(metrics.portfolioVolatility),
      description: 'Standard deviation of returns',
      icon: Activity,
      color: volatilityLevel.color,
      bg: volatilityLevel.color.replace('text-', 'bg-') + '/10'
    },
    {
      title: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(3),
      description: 'Risk-adjusted return measure',
      icon: Target,
      color: riskLevel.color,
      bg: riskLevel.bg
    },
    {
      title: 'Value at Risk (95%)',
      value: formatPercent(metrics.var95),
      description: '95% confidence worst-case loss',
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10'
    },
    {
      title: 'Conditional VaR',
      value: formatPercent(metrics.cvar95),
      description: 'Expected loss beyond VaR',
      icon: Shield,
      color: 'text-destructive',
      bg: 'bg-destructive/10'
    },
    {
      title: 'Beta',
      value: metrics.beta.toFixed(3),
      description: 'Market sensitivity',
      icon: Zap,
      color: metrics.beta > 1 ? 'text-primary' : 'text-secondary',
      bg: metrics.beta > 1 ? 'bg-primary/10' : 'bg-secondary/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Risk Assessment Summary */}
      <Card className="card-financial animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Risk Assessment Summary
          </CardTitle>
          <CardDescription>
            Overall portfolio risk evaluation based on key metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Level Indicator */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-card-hover border border-card-border">
            <div>
              <h3 className="font-semibold">Overall Risk Level</h3>
              <p className="text-sm text-muted-foreground">Based on Sharpe ratio and volatility</p>
            </div>
            <div className="text-right">
              <Badge className={`${riskLevel.bg} ${riskLevel.color} border-current`}>
                {riskLevel.level}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Sharpe: {metrics.sharpeRatio.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Volatility Meter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Volatility Level</span>
              <Badge className={`${volatilityLevel.color.replace('text-', 'bg-')}/10 ${volatilityLevel.color} border-current`}>
                {volatilityLevel.level}
              </Badge>
            </div>
            <Progress 
              value={volatilityLevel.progress} 
              className="h-3"
            />
            <p className="text-sm text-muted-foreground">
              {formatPercent(metrics.portfolioVolatility)} annual volatility
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riskMetricCards.map((metric, index) => (
          <Card key={index} className="card-metric animate-counter">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${metric.bg}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                    {metric.title}
                  </h3>
                  <p className={`text-2xl font-bold ${metric.color} mb-2`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Interpretation Guide */}
      <Card className="card-financial animate-slide-up">
        <CardHeader>
          <CardTitle>Risk Metrics Interpretation</CardTitle>
          <CardDescription>
            Understanding your portfolio's risk profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Sharpe Ratio</h4>
                <div className="text-sm space-y-1">
                  <p><Badge variant="outline" className="mr-2">{'>'} 2.0</Badge> Excellent risk-adjusted return</p>
                  <p><Badge variant="outline" className="mr-2">1.0-2.0</Badge> Good risk-adjusted return</p>
                  <p><Badge variant="outline" className="mr-2">0.5-1.0</Badge> Fair risk-adjusted return</p>
                  <p><Badge variant="outline" className="mr-2">{'<'} 0.5</Badge> Poor risk-adjusted return</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-secondary">Value at Risk (VaR)</h4>
                <p className="text-sm text-muted-foreground">
                  The maximum expected loss over the time horizon with 95% confidence. 
                  Your portfolio has a 5% chance of losing more than this amount.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-success">Beta</h4>
                <div className="text-sm space-y-1">
                  <p><Badge variant="outline" className="mr-2">{'>'} 1.0</Badge> More volatile than market</p>
                  <p><Badge variant="outline" className="mr-2">= 1.0</Badge> Moves with market</p>
                  <p><Badge variant="outline" className="mr-2">{'<'} 1.0</Badge> Less volatile than market</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-destructive">Conditional VaR</h4>
                <p className="text-sm text-muted-foreground">
                  Expected loss given that the loss exceeds the VaR threshold. 
                  This represents the average of worst-case scenarios.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}