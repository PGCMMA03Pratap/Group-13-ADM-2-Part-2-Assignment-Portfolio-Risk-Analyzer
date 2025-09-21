import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { MultiPeriodProjection } from '@/lib/analytics';

interface MultiPeriodProjectionsProps {
  projections: MultiPeriodProjection[];
  initialValue: number;
}

export function MultiPeriodProjections({ projections, initialValue }: MultiPeriodProjectionsProps) {
  // Prepare data for the growth chart
  const chartData = projections.map(projection => ({
    period: projection.period,
    years: projection.timeHorizonDays / 252,
    median: projection.percentiles.p50,
    p25: projection.percentiles.p25,
    p75: projection.percentiles.p75,
    p5: projection.percentiles.p5,
    p95: projection.percentiles.p95,
    medianReturn: projection.totalReturn.p50,
    annualizedReturn: projection.annualizedReturn
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getRiskColor = (probabilityOfLoss: number) => {
    if (probabilityOfLoss < 10) return 'text-success';
    if (probabilityOfLoss < 25) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskBadgeVariant = (probabilityOfLoss: number) => {
    if (probabilityOfLoss < 10) return 'default';
    if (probabilityOfLoss < 25) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Multi-Period Summary Table */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Multi-Period Return Projections
          </CardTitle>
          <CardDescription>
            Portfolio value projections across different time horizons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">Period</th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">Expected Value</th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">Total Return</th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">Annual Return</th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">Loss Risk</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((projection, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {projection.period}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">
                          {formatCurrency(projection.percentiles.p50)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Range: {formatCurrency(projection.percentiles.p25)} - {formatCurrency(projection.percentiles.p75)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="space-y-1">
                        <div className={`font-semibold ${projection.totalReturn.p50 >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatPercent(projection.totalReturn.p50)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercent(projection.totalReturn.p25)} to {formatPercent(projection.totalReturn.p75)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className={`font-semibold ${projection.annualizedReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatPercent(projection.annualizedReturn)}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Badge 
                        variant={getRiskBadgeVariant(projection.probabilityOfLoss)}
                        className="text-xs"
                      >
                        {projection.probabilityOfLoss.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Growth Projection Chart */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Portfolio Growth Projection
          </CardTitle>
          <CardDescription>
            Expected portfolio value growth over time (with confidence intervals)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="years" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value}y`}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-card-border rounded-lg p-4 shadow-lg">
                          <p className="font-medium mb-2">{data.period}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Expected Value:</span>{' '}
                              <span className="font-medium">{formatCurrency(data.median)}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Total Return:</span>{' '}
                              <span className={`font-medium ${data.medianReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {formatPercent(data.medianReturn)}
                              </span>
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Annual Return:</span>{' '}
                              <span className={`font-medium ${data.annualizedReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {formatPercent(data.annualizedReturn)}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="p95" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="95th Percentile"
                />
                <Line 
                  type="monotone" 
                  dataKey="p75" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  dot={false}
                  name="75th Percentile"
                />
                <Line 
                  type="monotone" 
                  dataKey="median" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  name="Expected (Median)"
                />
                <Line 
                  type="monotone" 
                  dataKey="p25" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  dot={false}
                  name="25th Percentile"
                />
                <Line 
                  type="monotone" 
                  dataKey="p5" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="5th Percentile"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-primary"></div>
              <span>Expected Value</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-success"></div>
              <span>75th-95th Percentile</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-destructive"></div>
              <span>5th-25th Percentile</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projections.slice(0, 3).map((projection, index) => {
          const riskLevel = projection.probabilityOfLoss < 10 ? 'Low' : 
                           projection.probabilityOfLoss < 25 ? 'Medium' : 'High';
          
          return (
            <Card key={index} className="card-metric">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{projection.period}</Badge>
                    <Badge variant={getRiskBadgeVariant(projection.probabilityOfLoss)}>
                      {riskLevel} Risk
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Expected Value</span>
                    </div>
                    <p className="text-xl font-bold">
                      {formatCurrency(projection.percentiles.p50)}
                    </p>
                    <p className={`text-sm font-medium ${projection.totalReturn.p50 >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatPercent(projection.totalReturn.p50)} total return
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Worst Case (5%)</span>
                    </div>
                    <p className="text-sm">
                      {formatCurrency(projection.percentiles.p5)} 
                      <span className="text-destructive ml-1">
                        ({formatPercent(projection.totalReturn.p5)})
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}