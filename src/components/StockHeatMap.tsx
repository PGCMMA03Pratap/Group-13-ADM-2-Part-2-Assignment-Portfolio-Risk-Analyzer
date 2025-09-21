import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Asset } from '@/lib/analytics';

interface StockHeatMapProps {
  assets: Asset[];
  initialValue: number;
}

const StockHeatMap: React.FC<StockHeatMapProps> = ({ assets, initialValue }) => {
  // Calculate profit/loss for each stock based on expected return
  const stockData = assets.map(asset => {
    const investedAmount = (asset.weight / 100) * initialValue;
    const annualizedReturn = asset.expectedReturn / 100;
    const profitLoss = investedAmount * annualizedReturn;
    const profitLossPercentage = annualizedReturn * 100;
    
    return {
      ...asset,
      investedAmount,
      profitLoss,
      profitLossPercentage,
      intensity: Math.abs(profitLossPercentage) / 20 // Normalize for color intensity
    };
  });

  const getHeatMapColor = (profitLossPercentage: number, intensity: number) => {
    const clampedIntensity = Math.min(intensity, 1);
    
    if (profitLossPercentage > 0) {
      // Green for profits
      const opacity = Math.max(0.1, clampedIntensity);
      return `rgba(34, 197, 94, ${opacity})`;
    } else if (profitLossPercentage < 0) {
      // Red for losses
      const opacity = Math.max(0.1, clampedIntensity);
      return `rgba(239, 68, 68, ${opacity})`;
    } else {
      // Neutral gray for break-even
      return 'rgba(156, 163, 175, 0.2)';
    }
  };

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Stock Performance Heat Map
        </CardTitle>
        <CardDescription>
          Visual representation of expected profits and losses for each stock
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stockData.map((stock, index) => (
            <div
              key={index}
              className="relative p-4 rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: getHeatMapColor(stock.profitLossPercentage, stock.intensity),
                borderColor: stock.profitLossPercentage > 0 ? 'rgb(34, 197, 94)' : 
                           stock.profitLossPercentage < 0 ? 'rgb(239, 68, 68)' : 
                           'rgb(156, 163, 175)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm truncate">{stock.symbol}</h3>
                {stock.profitLossPercentage > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : stock.profitLossPercentage < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                )}
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{stock.weight.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invested:</span>
                  <span className="font-medium">₹{stock.investedAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Return:</span>
                  <span className={`font-medium ${
                    stock.profitLossPercentage > 0 ? 'text-green-600' : 
                    stock.profitLossPercentage < 0 ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {stock.profitLossPercentage > 0 ? '+' : ''}{stock.profitLossPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-muted-foreground">Annual P&L:</span>
                  <span className={`font-bold ${
                    stock.profitLoss > 0 ? 'text-green-600' : 
                    stock.profitLoss < 0 ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {stock.profitLoss > 0 ? '+' : ''}₹{stock.profitLoss.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Intensity indicator */}
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full"
                   style={{
                     backgroundColor: stock.profitLossPercentage > 0 ? 'rgb(34, 197, 94)' : 
                                    stock.profitLossPercentage < 0 ? 'rgb(239, 68, 68)' : 
                                    'rgb(156, 163, 175)',
                     opacity: Math.max(0.5, stock.intensity)
                   }} />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Heat Map Legend:</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/60"></div>
              <span>Higher Expected Profits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500/60"></div>
              <span>Higher Expected Losses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-400/40"></div>
              <span>Break-even/Low Returns</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Color intensity represents the magnitude of expected returns. Hover over cards for better visibility.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockHeatMap;