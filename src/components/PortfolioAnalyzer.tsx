import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, TrendingUp, TrendingDown, BarChart3, PieChart, Calculator, Target, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Asset, 
  MonteCarloResult, 
  RiskMetrics,
  runMonteCarloSimulation, 
  calculateRiskMetrics, 
  calculateAHPWeights,
  generateSampleData
} from '@/lib/analytics';
import { downloadTemplateExcel, parseExcelFile, exportResultsToExcel, exportResultsWithFormulas } from '@/lib/excelUtils';
import { MonteCarloChart } from '@/components/MonteCarloChart';
import { RiskMetricsDisplay } from '@/components/RiskMetricsDisplay';
import { AssetAllocation } from '@/components/AssetAllocation';
import { Tutorial } from '@/components/Tutorial';
import { TOPSISRanking } from '@/components/TOPSISRanking';
import { PortfolioRecommendations } from '@/components/PortfolioRecommendations';
import StockHeatMap from '@/components/StockHeatMap';

const defaultAssets: Asset[] = [
  { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 20, expectedReturn: 0.13, volatility: 0.24, price: 29050 },
  { symbol: 'TSLA', name: 'Tesla Inc.', weight: 25, expectedReturn: 0.18, volatility: 0.45, price: 20750 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 20, expectedReturn: 0.20, volatility: 0.35, price: 74700 },
  { symbol: 'AAPL', name: 'Apple Inc.', weight: 20, expectedReturn: 0.12, volatility: 0.25, price: 12450 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 15, expectedReturn: 0.15, volatility: 0.28, price: 232400 }
];

export function PortfolioAnalyzer() {
  const [assets, setAssets] = useState<Asset[]>(defaultAssets);
  const [initialValue, setInitialValue] = useState(1000000);
  const [timeHorizon, setTimeHorizon] = useState(252);
  const [simulations, setSimulations] = useState(10000);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<MonteCarloResult | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [progress, setProgress] = useState(0);

  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);

  const updateAsset = (index: number, field: keyof Asset, value: string | number) => {
    const updatedAssets = [...assets];
    
    // Handle string fields (symbol, name) vs numeric fields
    if (field === 'symbol' || field === 'name') {
      updatedAssets[index] = { 
        ...updatedAssets[index], 
        [field]: value as string
      };
    } else {
      // Handle numeric fields (weight, expectedReturn, volatility, price)
      updatedAssets[index] = { 
        ...updatedAssets[index], 
        [field]: typeof value === 'string' ? parseFloat(value) || 0 : value 
      };
    }
    
    setAssets(updatedAssets);
  };

  const addAsset = () => {
    const newAsset: Asset = {
      symbol: `STOCK${assets.length + 1}`,
      name: `Stock ${assets.length + 1}`,
      weight: 10,
      expectedReturn: 0.10,
      volatility: 0.20,
      price: 100
    };
    setAssets([...assets, newAsset]);
  };

  const removeAsset = (index: number) => {
    if (assets.length > 1) {
      setAssets(assets.filter((_, i) => i !== index));
    }
  };

  const normalizeWeights = () => {
    const total = totalWeight;
    if (total > 0) {
      const normalizedAssets = assets.map(asset => ({
        ...asset,
        weight: (asset.weight / total) * 100
      }));
      setAssets(normalizedAssets);
      toast.success('Portfolio weights normalized to 100%');
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedAssets = await parseExcelFile(file);
      setAssets(parsedAssets);
      toast.success(`Successfully imported ${parsedAssets.length} assets from Excel`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import Excel file');
    } finally {
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDownloadResults = () => {
    if (!results || !riskMetrics) {
      toast.error('Please run the analysis first to generate results');
      return;
    }
    
    exportResultsToExcel(assets, results, riskMetrics, initialValue, timeHorizon, simulations);
    toast.success('Results exported to Excel successfully');
  };

  const handleDownloadResultsWithFormulas = () => {
    if (!results || !riskMetrics) {
      toast.error('Please run the analysis first to generate results');
      return;
    }
    
    exportResultsWithFormulas(assets, results, riskMetrics, initialValue, timeHorizon, simulations);
    toast.success('Results with active formulas exported to Excel successfully');
  };

  const runAnalysis = async () => {
    if (totalWeight === 0) {
      toast.error('Please add some assets to your portfolio');
      return;
    }

    setIsRunning(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 200);

      // Add small delay to show progress animation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Run Monte Carlo simulation
      const mcResults = runMonteCarloSimulation(assets, initialValue, timeHorizon, simulations);
      
      // Generate sample historical data for risk metrics
      const historicalData = generateSampleData(assets, 252);
      const portfolioReturns = historicalData[0].map((_, i) => {
        return assets.reduce((sum, asset, assetIndex) => {
          const weight = asset.weight / totalWeight;
          const returns = historicalData[assetIndex];
          const dailyReturn = i > 0 ? (returns[i] - returns[i-1]) / returns[i-1] : 0;
          return sum + weight * dailyReturn;
        }, 0);
      });

      const risk = calculateRiskMetrics(assets, portfolioReturns);

      clearInterval(progressInterval);
      setProgress(100);

      setResults(mcResults);
      setRiskMetrics(risk);
      
      toast.success(`Analysis complete! Ran ${simulations.toLocaleString()} simulations`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please check your inputs and try again.');
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative z-10 text-center py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="animate-slide-up">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary-glow animate-glow">
                  <BarChart3 className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-gradient-primary">Advanced Portfolio</span>
                <br />
                <span className="text-foreground">Analytics Suite</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Harness the power of Monte Carlo simulations, risk analytics, and AI-driven insights 
                to optimize your investment portfolio with institutional-grade precision.
              </p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl mx-auto mb-4 flex items-center justify-center animate-glow">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gradient-primary">Monte Carlo Simulation</h3>
                  <p className="text-sm text-muted-foreground">Advanced probabilistic modeling for portfolio performance prediction</p>
                </div>
                
                <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300" style={{ animationDelay: '100ms' }}>
                  <div className="w-12 h-12 bg-gradient-to-br from-success to-success-light rounded-xl mx-auto mb-4 flex items-center justify-center animate-glow">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gradient-success">Risk Analytics</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive risk metrics including VaR, CVaR, and Sharpe ratios</p>
                </div>
                
                <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300" style={{ animationDelay: '200ms' }}>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl mx-auto mb-4 flex items-center justify-center animate-glow">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">TOPSIS Ranking</h3>
                  <p className="text-sm text-muted-foreground">Multi-criteria decision analysis for optimal asset selection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="animate-slide-up max-w-7xl mx-auto px-4">
        <TabsList className="grid w-full grid-cols-7 glass-card border border-card-border/50 p-2 rounded-2xl">
          <TabsTrigger value="tutorial" className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-card/60">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Tutorial</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-card/60">
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-card/60">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">💡 Recommendations</span>
          </TabsTrigger>
          <TabsTrigger value="simulation" className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-card/60">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Simulation</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-card/60">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Results</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-card/60">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Risk Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="topsis" className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-card/60">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">TOPSIS</span>
          </TabsTrigger>
        </TabsList>

        {/* Tutorial */}
        <TabsContent value="tutorial" className="space-y-6">
          <Tutorial />
        </TabsContent>

        {/* Portfolio Configuration */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card className="card-financial">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Portfolio Assets
                  </CardTitle>
                  <CardDescription>
                    Configure your portfolio allocation and expected returns
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={totalWeight === 100 ? "default" : "destructive"}>
                    Total: {totalWeight.toFixed(1)}%
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={normalizeWeights}
                    className="btn-financial-secondary"
                  >
                    Normalize
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {assets.map((asset, index) => (
                <div key={index} className="card-metric space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`symbol-${index}`}>Symbol</Label>
                      <Input
                        id={`symbol-${index}`}
                        value={asset.symbol}
                        onChange={(e) => updateAsset(index, 'symbol', e.target.value)}
                        className="input-financial"
                        placeholder="AAPL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`weight-${index}`}>Weight (%)</Label>
                      <Input
                        id={`weight-${index}`}
                        type="number"
                        value={asset.weight}
                        onChange={(e) => updateAsset(index, 'weight', e.target.value)}
                        className="input-financial"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`return-${index}`}>Expected Return</Label>
                      <Input
                        id={`return-${index}`}
                        type="number"
                        value={asset.expectedReturn}
                        onChange={(e) => updateAsset(index, 'expectedReturn', e.target.value)}
                        className="input-financial"
                        step="0.01"
                        min="0"
                        placeholder="0.12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`volatility-${index}`}>Volatility</Label>
                      <Input
                        id={`volatility-${index}`}
                        type="number"
                        value={asset.volatility}
                        onChange={(e) => updateAsset(index, 'volatility', e.target.value)}
                        className="input-financial"
                        step="0.01"
                        min="0"
                        placeholder="0.25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`price-${index}`}>Price (₹)</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        value={asset.price}
                        onChange={(e) => updateAsset(index, 'price', e.target.value)}
                        className="input-financial"
                        min="0"
                        placeholder="150"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAsset(index)}
                        disabled={assets.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={addAsset} className="btn-financial-secondary">
                  Add Asset
                </Button>
                <Button 
                  onClick={downloadTemplateExcel} 
                  variant="outline" 
                  className="btn-financial-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="excel-upload"
                  />
                  <Button variant="outline" className="btn-financial-secondary">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {assets.length > 0 && <AssetAllocation assets={assets} />}
        </TabsContent>

        {/* Portfolio Recommendations */}
        <TabsContent value="recommendations" className="space-y-6">
          <PortfolioRecommendations assets={assets} />
        </TabsContent>

        {/* Simulation Parameters */}
        <TabsContent value="simulation" className="space-y-6">
          <Card className="card-financial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Monte Carlo Parameters
              </CardTitle>
              <CardDescription>
                Configure simulation settings for risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="initial-value">Initial Portfolio Value (₹)</Label>
                  <Input
                    id="initial-value"
                    type="number"
                    value={initialValue}
                    onChange={(e) => setInitialValue(parseInt(e.target.value) || 100000)}
                    className="input-financial"
                    min="1000"
                    step="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-horizon">Time Horizon (days)</Label>
                  <Input
                    id="time-horizon"
                    type="number"
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(parseInt(e.target.value) || 252)}
                    className="input-financial"
                    min="1"
                    max="2520"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="simulations">Number of Simulations</Label>
                  <Input
                    id="simulations"
                    type="number"
                    value={simulations}
                    onChange={(e) => setSimulations(parseInt(e.target.value) || 10000)}
                    className="input-financial"
                    min="1000"
                    max="100000"
                    step="1000"
                  />
                </div>
              </div>

              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Running simulation...</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button 
                onClick={runAnalysis} 
                disabled={isRunning || totalWeight === 0}
                className="btn-financial-primary w-full"
              >
                {isRunning ? 'Running Analysis...' : 'Run Monte Carlo Analysis'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results */}
        <TabsContent value="results" className="space-y-6">
          {results ? (
            <div className="space-y-6">
              <div className="flex justify-end gap-2 flex-wrap">
                <Button 
                  onClick={handleDownloadResults}
                  variant="outline"
                  className="btn-financial-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
                <Button 
                  onClick={handleDownloadResultsWithFormulas}
                  className="btn-financial-primary"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Export with Formulas
                </Button>
              </div>
              <StockHeatMap assets={assets} initialValue={initialValue} />
              <MonteCarloChart results={results} initialValue={initialValue} />
            </div>
          ) : (
            <Card className="card-financial">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Run a Monte Carlo simulation to see results
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Risk Metrics */}
        <TabsContent value="risk" className="space-y-6">
          {riskMetrics ? (
            <RiskMetricsDisplay metrics={riskMetrics} />
          ) : (
            <Card className="card-financial">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Run analysis to view comprehensive risk metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TOPSIS Analysis */}
        <TabsContent value="topsis" className="space-y-6">
          <TOPSISRanking assets={assets} />
        </TabsContent>
      </Tabs>
    </div>
  );
}