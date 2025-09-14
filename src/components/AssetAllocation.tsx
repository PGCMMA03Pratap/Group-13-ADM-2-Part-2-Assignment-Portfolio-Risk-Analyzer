import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, TrendingUp, DollarSign } from 'lucide-react';
import { Asset } from '@/lib/analytics';

interface AssetAllocationProps {
  assets: Asset[];
}

export function AssetAllocation({ assets }: AssetAllocationProps) {
  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
  
  // Prepare data for pie chart
  const chartData = assets.map((asset, index) => ({
    name: asset.symbol,
    value: asset.weight,
    percentage: totalWeight > 0 ? (asset.weight / totalWeight) * 100 : 0,
    expectedReturn: asset.expectedReturn,
    volatility: asset.volatility,
    color: `hsl(${(index * 137.508) % 360}, 70%, 50%)` // Golden angle for color distribution
  }));

  // Color palette for the pie chart
  const colors = [
    'hsl(210, 100%, 50%)', // Primary blue
    'hsl(175, 60%, 45%)',  // Teal
    'hsl(142, 76%, 36%)',  // Success green
    'hsl(25, 95%, 53%)',   // Orange
    'hsl(280, 100%, 70%)', // Purple
    'hsl(45, 100%, 51%)',  // Yellow
    'hsl(340, 82%, 52%)',  // Pink
    'hsl(200, 100%, 40%)', // Dark blue
  ];

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-card-border rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold text-foreground mb-2">{data.name}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Allocation: <span className="text-foreground font-medium">{formatPercent(data.percentage)}</span>
            </p>
            <p className="text-muted-foreground">
              Expected Return: <span className="text-success font-medium">{formatPercent(data.expectedReturn * 100)}</span>
            </p>
            <p className="text-muted-foreground">
              Volatility: <span className="text-primary font-medium">{formatPercent(data.volatility * 100)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {formatPercent(percentage)}
      </text>
    );
  };

  // Calculate portfolio-level metrics
  const portfolioReturn = assets.reduce((sum, asset) => 
    sum + (asset.weight / totalWeight) * asset.expectedReturn, 0
  );
  
  const portfolioVolatility = Math.sqrt(
    assets.reduce((sum, asset) => 
      sum + Math.pow(asset.weight / totalWeight, 2) * Math.pow(asset.volatility, 2), 0
    )
  );

  const riskFreeRate = 0.02;
  const sharpeRatio = totalWeight > 0 ? (portfolioReturn - riskFreeRate) / portfolioVolatility : 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-metric animate-counter">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Return</p>
                <p className="text-2xl font-bold text-success">
                  {formatPercent(portfolioReturn * 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-metric animate-counter">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Risk</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPercent(portfolioVolatility * 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-metric animate-counter">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <PieChartIcon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-secondary">
                  {sharpeRatio.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation Chart */}
      <Card className="card-financial animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Asset Allocation
          </CardTitle>
          <CardDescription>
            Portfolio composition and individual asset metrics
          </CardDescription>
          {totalWeight !== 100 && (
            <Badge variant="destructive" className="w-fit">
              Warning: Weights don't sum to 100% ({totalWeight.toFixed(1)}%)
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Asset Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-4">Asset Details</h3>
              {chartData.map((asset, index) => (
                <div 
                  key={asset.name} 
                  className="flex items-center justify-between p-3 rounded-lg bg-card-hover border border-card-border"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPercent(asset.expectedReturn * 100)} return, {formatPercent(asset.volatility * 100)} risk
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPercent(asset.percentage)}</p>
                    <p className="text-sm text-muted-foreground">
                      Weight: {asset.value.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk-Return Scatter (if more than one asset) */}
      {assets.length > 1 && (
        <Card className="card-financial animate-slide-up">
          <CardHeader>
            <CardTitle>Risk-Return Analysis</CardTitle>
            <CardDescription>
              Individual asset positioning and portfolio efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Highest Return Assets</h4>
                {assets
                  .sort((a, b) => b.expectedReturn - a.expectedReturn)
                  .slice(0, 3)
                  .map((asset, index) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-2 rounded bg-success/5">
                      <span className="font-medium">{asset.symbol}</span>
                      <Badge className="bg-success/10 text-success border-success/20">
                        {formatPercent(asset.expectedReturn * 100)}
                      </Badge>
                    </div>
                  ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Lowest Risk Assets</h4>
                {assets
                  .sort((a, b) => a.volatility - b.volatility)
                  .slice(0, 3)
                  .map((asset, index) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-2 rounded bg-primary/5">
                      <span className="font-medium">{asset.symbol}</span>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {formatPercent(asset.volatility * 100)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}