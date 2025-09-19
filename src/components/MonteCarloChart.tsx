import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import { MonteCarloResult } from '@/lib/analytics';
import { MultiPeriodProjections } from '@/components/MultiPeriodProjections';

interface MonteCarloChartProps {
  results: MonteCarloResult;
  initialValue: number;
}

export function MonteCarloChart({ results, initialValue }: MonteCarloChartProps) {
  // Create histogram data for distribution chart
  const createHistogramData = () => {
    const bins = 50;
    const min = Math.min(...results.returns);
    const max = Math.max(...results.returns);
    const binWidth = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0).map((_, i) => ({
      return: (min + i * binWidth) * 100,
      count: 0
    }));
    
    results.returns.forEach(ret => {
      const binIndex = Math.min(Math.floor((ret - min) / binWidth), bins - 1);
      histogram[binIndex].count++;
    });
    
    return histogram;
  };

  // Create percentile data for visualization
  const percentileData = [
    { 
      label: '5th Percentile', 
      value: results.percentiles.p5,
      return: ((results.percentiles.p5 - initialValue) / initialValue) * 100,
      color: '#ef4444'
    },
    { 
      label: '25th Percentile', 
      value: results.percentiles.p25,
      return: ((results.percentiles.p25 - initialValue) / initialValue) * 100,
      color: '#f97316'
    },
    { 
      label: 'Median', 
      value: results.percentiles.p50,
      return: ((results.percentiles.p50 - initialValue) / initialValue) * 100,
      color: '#22d3ee'
    },
    { 
      label: '75th Percentile', 
      value: results.percentiles.p75,
      return: ((results.percentiles.p75 - initialValue) / initialValue) * 100,
      color: '#84cc16'
    },
    { 
      label: '95th Percentile', 
      value: results.percentiles.p95,
      return: ((results.percentiles.p95 - initialValue) / initialValue) * 100,
      color: '#10b981'
    }
  ];

  const histogramData = createHistogramData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Multi-Period Projections */}
      {results.multiPeriodProjections && (
        <MultiPeriodProjections 
          projections={results.multiPeriodProjections} 
          initialValue={initialValue} 
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-metric animate-counter">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(results.percentiles.p50)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-metric animate-counter">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Return</p>
                <p className="text-2xl font-bold text-success">
                  {formatPercent(results.expectedReturn * 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-metric animate-counter">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">95% VaR</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatPercent(results.var95 * 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-metric animate-counter">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Target className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold">
                  {results.sharpeRatio.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card className="card-financial animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            Return Distribution
          </CardTitle>
          <CardDescription>
            Distribution of simulated portfolio returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="return" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-card-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{`Return: ${parseFloat(label).toFixed(1)}%`}</p>
                          <p className="text-primary">{`Frequency: ${payload[0].value}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#primaryGradient)"
                  radius={[2, 2, 0, 0]}
                />
                <defs>
                  <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Percentile Analysis */}
      <Card className="card-financial animate-slide-up">
        <CardHeader>
          <CardTitle>Portfolio Value Percentiles</CardTitle>
          <CardDescription>
            Key percentiles from Monte Carlo simulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {percentileData.map((item, index) => (
              <div key={index} className="card-metric">
                <div className="space-y-2">
                  <Badge 
                    style={{ backgroundColor: item.color + '20', color: item.color, borderColor: item.color + '40' }}
                    className="w-full justify-center"
                  >
                    {item.label}
                  </Badge>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {formatCurrency(item.value)}
                    </p>
                    <p 
                      className={`text-sm font-medium ${
                        item.return >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {formatPercent(item.return)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}