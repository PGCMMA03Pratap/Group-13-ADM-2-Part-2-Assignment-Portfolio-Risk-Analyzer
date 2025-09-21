import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Zap, Star } from 'lucide-react';
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

  const getHeatMapStyle = (profitLossPercentage: number, intensity: number) => {
    const clampedIntensity = Math.min(Math.max(intensity, 0.1), 1);
    
    if (profitLossPercentage > 0) {
      return {
        background: `linear-gradient(135deg, 
          hsl(150 90% 45% / ${0.1 + clampedIntensity * 0.3}) 0%, 
          hsl(150 90% 60% / ${0.05 + clampedIntensity * 0.2}) 100%)`,
        borderColor: `hsl(150 90% 45% / ${0.3 + clampedIntensity * 0.4})`,
        boxShadow: `0 4px 20px hsl(150 90% 45% / ${0.1 + clampedIntensity * 0.2})`
      };
    } else if (profitLossPercentage < 0) {
      return {
        background: `linear-gradient(135deg, 
          hsl(355 90% 65% / ${0.1 + clampedIntensity * 0.3}) 0%, 
          hsl(355 90% 55% / ${0.05 + clampedIntensity * 0.2}) 100%)`,
        borderColor: `hsl(355 90% 65% / ${0.3 + clampedIntensity * 0.4})`,
        boxShadow: `0 4px 20px hsl(355 90% 65% / ${0.1 + clampedIntensity * 0.2})`
      };
    } else {
      return {
        background: 'linear-gradient(135deg, hsl(235 12% 18% / 0.5) 0%, hsl(235 15% 25% / 0.3) 100%)',
        borderColor: 'hsl(235 12% 18%)',
        boxShadow: '0 4px 15px hsl(235 12% 18% / 0.2)'
      };
    }
  };

  const getPerformanceIcon = (profitLossPercentage: number, intensity: number) => {
    if (profitLossPercentage > 15) return <Star className="w-4 h-4 text-yellow-400" />;
    if (profitLossPercentage > 0) return <TrendingUp className="w-4 h-4 text-success-light" />;
    if (profitLossPercentage < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Zap className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 animate-glow">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <span className="text-gradient-primary">Stock Performance Heat Map</span>
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Interactive visualization of expected profits and losses for portfolio assets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stockData.map((stock, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer animate-slide-up"
              style={{
                ...getHeatMapStyle(stock.profitLossPercentage, stock.intensity),
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{
                     background: stock.profitLossPercentage > 0 
                       ? 'linear-gradient(45deg, transparent, hsl(150 90% 45% / 0.1), transparent)'
                       : 'linear-gradient(45deg, transparent, hsl(355 90% 65% / 0.1), transparent)'
                   }} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground truncate">{stock.symbol}</h3>
                    <div className="animate-float" style={{ animationDelay: `${index * 200}ms` }}>
                      {getPerformanceIcon(stock.profitLossPercentage, stock.intensity)}
                    </div>
                  </div>
                  
                  {/* Performance badge */}
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    stock.profitLossPercentage > 0 ? 'bg-success/20 text-success-light' : 
                    stock.profitLossPercentage < 0 ? 'bg-destructive/20 text-destructive' : 
                    'bg-muted/20 text-muted-foreground'
                  }`}>
                    {stock.profitLossPercentage > 0 ? '+' : ''}{stock.profitLossPercentage.toFixed(1)}%
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-card/30 rounded-lg backdrop-blur-sm">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-semibold text-foreground">{stock.weight.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-card/30 rounded-lg backdrop-blur-sm">
                    <span className="text-muted-foreground">Invested:</span>
                    <span className="font-semibold text-foreground">₹{stock.investedAmount.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-card/30 rounded-lg backdrop-blur-sm border-t border-card-border/50">
                    <span className="font-medium text-foreground">Annual P&L:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-lg ${
                        stock.profitLoss > 0 ? 'text-success-light' : 
                        stock.profitLoss < 0 ? 'text-destructive' : 
                        'text-muted-foreground'
                      }`}>
                        {stock.profitLoss > 0 ? '+' : ''}₹{Math.abs(stock.profitLoss).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Intensity indicator dots */}
                <div className="flex justify-center mt-4 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        i < Math.ceil(stock.intensity * 5) 
                          ? (stock.profitLossPercentage > 0 ? 'bg-success-light' : 'bg-destructive')
                          : 'bg-muted/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Legend */}
        <div className="mt-8 p-6 glass-card rounded-2xl space-y-4">
          <h4 className="text-lg font-semibold text-gradient-primary mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Legend
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-success to-success-light"></div>
              <span className="text-success-light font-medium">High Expected Returns</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-destructive-dark to-destructive"></div>
              <span className="text-destructive font-medium">Expected Losses</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-muted/20">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-muted to-accent"></div>
              <span className="text-muted-foreground font-medium">Neutral/Low Volatility</span>
            </div>
          </div>
          <div className="pt-3 border-t border-card-border/30">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-primary">Interactive Features:</span> Hover over cards for enhanced visuals. 
              Dot indicators show return intensity. Color gradients represent risk-adjusted performance expectations.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockHeatMap;