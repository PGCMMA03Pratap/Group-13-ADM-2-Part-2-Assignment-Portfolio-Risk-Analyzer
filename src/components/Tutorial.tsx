import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DownloadReport } from '@/components/DownloadReport';
import { 
  BookOpen, 
  Play, 
  TrendingUp, 
  Calculator, 
  Target, 
  BarChart3, 
  PieChart,
  Trophy,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Download,
  Users,
  Building2,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Portfolio Configuration",
      icon: <PieChart className="w-5 h-5" />,
      description: "Learn how to set up your investment portfolio"
    },
    {
      title: "Monte Carlo Simulation",
      icon: <Calculator className="w-5 h-5" />,
      description: "Understand risk projections through simulation"
    },
    {
      title: "Risk Metrics Analysis",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Comprehensive risk assessment tools"
    },
    {
      title: "AHP Optimization",
      icon: <Target className="w-5 h-5" />,
      description: "Multi-criteria decision analysis"
    },
    {
      title: "TOPSIS Ranking",
      icon: <Trophy className="w-5 h-5" />,
      description: "Asset ranking and selection"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gradient-primary">
              Portfolio Analyzer Tutorial
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Complete guide to advanced financial analytics
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="animate-slide-up">
        <TabsList className="grid w-full grid-cols-7 bg-card border border-card-border">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="montecarlo" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Monte Carlo
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="methods" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            AHP & TOPSIS
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="download" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Report
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="card-financial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Welcome to Advanced Portfolio Analytics
              </CardTitle>
              <CardDescription>
                Your comprehensive guide to quantitative finance and portfolio optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">🎯 What You'll Learn</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Portfolio construction and optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Monte Carlo simulation techniques
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Risk metrics and VaR calculations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Multi-criteria decision analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Statistical distribution fitting
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">🚀 Advanced Methods</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        {step.icon}
                        <div>
                          <div className="font-medium">{step.title}</div>
                          <div className="text-xs text-muted-foreground">{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card className="card-financial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Portfolio Configuration Tutorial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📊 Step-by-Step Guide</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Add Your Assets</h4>
                        <p className="text-sm text-muted-foreground">Enter stock symbols (MSFT, TSLA, NVDA, etc.) and configure weights</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">Set Expected Returns</h4>
                        <p className="text-sm text-muted-foreground">Input annual expected returns (e.g., 0.12 = 12%)</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium">Configure Volatility</h4>
                        <p className="text-sm text-muted-foreground">Set annual volatility (e.g., 0.25 = 25% standard deviation)</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-medium">Normalize Weights</h4>
                        <p className="text-sm text-muted-foreground">Use the "Normalize" button to ensure weights sum to 100%</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">💡 Best Practices</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                        <div>
                          <p className="text-sm text-card-foreground"><strong>Diversification:</strong> Include assets from different sectors and regions</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-card-foreground"><strong>Historical Data:</strong> Use 3-5 years of historical data for return/volatility estimates</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-secondary mt-0.5" />
                        <div>
                          <p className="text-sm text-card-foreground"><strong>Correlation:</strong> Consider asset correlations - avoid overconcentration in correlated assets</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monte Carlo Tab */}
        <TabsContent value="montecarlo" className="space-y-6">
          <Card className="card-financial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Monte Carlo Simulation Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🎲 What is Monte Carlo?</h3>
                  <p className="text-sm text-muted-foreground">
                    Monte Carlo simulation uses random sampling to model the probability of different outcomes in portfolio performance. 
                    It runs thousands of simulations to predict future portfolio values under various market scenarios.
                  </p>
                  
                  <h4 className="font-medium">Key Parameters:</h4>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Initial Value:</strong> Starting portfolio amount ($100,000 default)</li>
                    <li><strong>Time Horizon:</strong> Investment period in days (252 = 1 year)</li>
                    <li><strong>Simulations:</strong> Number of random paths (10,000+ recommended)</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📈 Interpretation</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <h4 className="font-medium text-sm">Percentiles</h4>
                      <ul className="text-xs space-y-1 mt-2">
                        <li><strong>P5:</strong> Worst-case scenario (5% chance of worse outcome)</li>
                        <li><strong>P50:</strong> Median expected outcome</li>
                        <li><strong>P95:</strong> Best-case scenario (95% confidence)</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <h4 className="font-medium text-sm">Risk Metrics</h4>
                      <ul className="text-xs space-y-1 mt-2">
                        <li><strong>VaR (95%):</strong> Maximum expected loss with 95% confidence</li>
                        <li><strong>Volatility:</strong> Standard deviation of returns</li>
                        <li><strong>Sharpe Ratio:</strong> Risk-adjusted return measure</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">🏢 Real-World Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <Building2 className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Investment Banks</h4>
                      <p className="text-xs text-muted-foreground mt-1">Risk assessment for trading portfolios and derivative pricing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <Users className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Pension Funds</h4>
                      <p className="text-xs text-muted-foreground mt-1">Long-term liability matching and asset allocation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <Briefcase className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Wealth Managers</h4>
                      <p className="text-xs text-muted-foreground mt-1">Client portfolio stress testing and scenario analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          <Card className="card-financial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Risk Metrics & Distribution Fitting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📊 Risk Metrics Explained</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <h4 className="font-medium">Value at Risk (VaR)</h4>
                      <p className="text-sm text-muted-foreground">Maximum expected loss over a specific time period with 95% confidence. Used by banks for regulatory capital requirements.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <h4 className="font-medium">Conditional VaR (CVaR)</h4>
                      <p className="text-sm text-muted-foreground">Average loss beyond the VaR threshold. Also known as Expected Shortfall (ES).</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <h4 className="font-medium">Maximum Drawdown</h4>
                      <p className="text-sm text-muted-foreground">Largest peak-to-trough decline in portfolio value. Critical for hedge fund evaluation.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <h4 className="font-medium">Beta (β)</h4>
                      <p className="text-sm text-muted-foreground">Measures portfolio sensitivity to market movements. β &gt; 1 indicates higher volatility than market.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📈 Distribution Fitting</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <h4 className="font-medium">Statistical Moments</h4>
                      <ul className="text-sm space-y-1 mt-2">
                        <li><strong>Mean:</strong> Average return</li>
                        <li><strong>Std Dev:</strong> Volatility measure</li>
                        <li><strong>Skewness:</strong> Asymmetry in return distribution</li>
                        <li><strong>Kurtosis:</strong> Tail thickness (fat-tail risk)</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <h4 className="font-medium">Normality Testing</h4>
                      <p className="text-sm text-muted-foreground">
                        Tests if returns follow normal distribution. Important because many financial models assume normality.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">🎯 Industry Usage</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Basel III</Badge>
                      <span>Bank capital requirements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Solvency II</Badge>
                      <span>Insurance company regulation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">UCITS</Badge>
                      <span>European fund regulations</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Methods Tab */}
        <TabsContent value="methods" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AHP */}
            <Card className="card-financial">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  AHP Method
                </CardTitle>
                <CardDescription>Analytic Hierarchy Process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-medium">📋 What is AHP?</h4>
                <p className="text-sm text-muted-foreground">
                  A structured technique for organizing and analyzing complex decisions using mathematics and psychology.
                </p>
                
                <h4 className="font-medium">🔄 Process Steps:</h4>
                <ol className="text-sm space-y-2">
                  <li>1. <strong>Define criteria:</strong> Return, risk, liquidity, etc.</li>
                  <li>2. <strong>Pairwise comparison:</strong> Compare criteria importance</li>
                  <li>3. <strong>Calculate weights:</strong> Using eigenvalue method</li>
                  <li>4. <strong>Consistency check:</strong> Verify logical consistency</li>
                  <li>5. <strong>Final ranking:</strong> Optimal asset allocation</li>
                </ol>

                <div className="bg-muted/30 p-3 rounded-lg">
                  <h5 className="font-medium text-sm">Real Applications:</h5>
                  <ul className="text-xs space-y-1 mt-2">
                    <li>• Strategic asset allocation</li>
                    <li>• Vendor selection in procurement</li>
                    <li>• Investment committee decisions</li>
                    <li>• ESG portfolio construction</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* TOPSIS */}
            <Card className="card-financial">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  TOPSIS Method
                </CardTitle>
                <CardDescription>Multi-Criteria Decision Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-medium">🎯 What is TOPSIS?</h4>
                <p className="text-sm text-muted-foreground">
                  Technique for Order Preference by Similarity to Ideal Solution. Ranks alternatives based on distance from ideal solution.
                </p>
                
                <h4 className="font-medium">⚡ Process Steps:</h4>
                <ol className="text-sm space-y-2">
                  <li>1. <strong>Normalize matrix:</strong> Scale all criteria equally</li>
                  <li>2. <strong>Apply weights:</strong> Multiply by importance</li>
                  <li>3. <strong>Find ideal solutions:</strong> Best/worst scenarios</li>
                  <li>4. <strong>Calculate distances:</strong> Euclidean distance</li>
                  <li>5. <strong>Relative closeness:</strong> Final ranking score</li>
                </ol>

                <div className="bg-muted/30 p-3 rounded-lg">
                  <h5 className="font-medium text-sm">Industry Usage:</h5>
                  <ul className="text-xs space-y-1 mt-2">
                    <li>• Mutual fund selection</li>
                    <li>• Credit rating models</li>
                    <li>• Supply chain optimization</li>
                    <li>• Portfolio rebalancing decisions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <Card className="card-financial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Real-World Applications & Use Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Investment Banks */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold">Investment Banking</h3>
                  </div>
                   <div className="space-y-2">
                     <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                       <h4 className="font-medium text-sm text-card-foreground">Trading Desks</h4>
                       <p className="text-xs text-muted-foreground">Daily VaR calculations, stress testing, portfolio optimization</p>
                     </div>
                     <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                       <h4 className="font-medium text-sm text-card-foreground">Risk Management</h4>
                       <p className="text-xs text-muted-foreground">Basel III compliance, capital allocation, limit monitoring</p>
                     </div>
                   </div>
                </div>

                {/* Asset Management */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-semibold">Asset Management</h3>
                  </div>
                   <div className="space-y-2">
                     <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                       <h4 className="font-medium text-sm text-card-foreground">Fund Construction</h4>
                       <p className="text-xs text-muted-foreground">Strategic asset allocation, factor exposure analysis</p>
                     </div>
                     <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                       <h4 className="font-medium text-sm text-card-foreground">Performance Attribution</h4>
                       <p className="text-xs text-muted-foreground">Risk-adjusted returns, benchmark analysis, alpha generation</p>
                     </div>
                   </div>
                </div>

                {/* Insurance */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-500" />
                    <h3 className="text-lg font-semibold">Insurance</h3>
                  </div>
                   <div className="space-y-2">
                     <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                       <h4 className="font-medium text-sm text-card-foreground">Liability Matching</h4>
                       <p className="text-xs text-muted-foreground">Duration matching, cash flow modeling, ALM optimization</p>
                     </div>
                     <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                       <h4 className="font-medium text-sm text-card-foreground">Solvency Capital</h4>
                       <p className="text-xs text-muted-foreground">Solvency II requirements, economic capital modeling</p>
                     </div>
                   </div>
                </div>

                {/* Pension Funds */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-orange-500" />
                    <h3 className="text-lg font-semibold">Pension Funds</h3>
                  </div>
                   <div className="space-y-2">
                     <div className="p-3 rounded-lg bg-accent/30 border border-accent/40">
                       <h4 className="font-medium text-sm text-card-foreground">Long-term Planning</h4>
                       <p className="text-xs text-muted-foreground">30+ year projections, demographic modeling, funding ratios</p>
                     </div>
                     <div className="p-3 rounded-lg bg-accent/30 border border-accent/40">
                       <h4 className="font-medium text-sm text-card-foreground">De-risking Strategies</h4>
                       <p className="text-xs text-muted-foreground">Glide path optimization, liability hedging portfolios</p>
                     </div>
                   </div>
                </div>

                {/* Hedge Funds */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold">Hedge Funds</h3>
                  </div>
                   <div className="space-y-2">
                     <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                       <h4 className="font-medium text-sm text-card-foreground">Alternative Strategies</h4>
                       <p className="text-xs text-muted-foreground">Long/short equity, market neutral, statistical arbitrage</p>
                     </div>
                     <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                       <h4 className="font-medium text-sm text-card-foreground">Risk Budgeting</h4>
                       <p className="text-xs text-muted-foreground">Position sizing, leverage optimization, drawdown management</p>
                     </div>
                   </div>
                </div>

                {/* Regulatory Bodies */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-indigo-500" />
                    <h3 className="text-lg font-semibold">Regulators</h3>
                  </div>
                   <div className="space-y-2">
                     <div className="p-3 rounded-lg bg-muted/30 border border-border">
                       <h4 className="font-medium text-sm text-card-foreground">Stress Testing</h4>
                       <p className="text-xs text-muted-foreground">CCAR, DFAST, systemic risk assessment, macro scenarios</p>
                     </div>
                     <div className="p-3 rounded-lg bg-muted/30 border border-border">
                       <h4 className="font-medium text-sm text-card-foreground">Market Surveillance</h4>
                       <p className="text-xs text-muted-foreground">Systemic risk monitoring, interconnectedness analysis</p>
                     </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Research */}
          <Card className="card-financial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Academic & Research Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📚 Research Areas</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Behavioral finance and market anomalies</li>
                    <li>• Factor investing and smart beta strategies</li>
                    <li>• ESG integration and sustainable investing</li>
                    <li>• Alternative risk premia harvesting</li>
                    <li>• Cryptocurrency and digital assets</li>
                    <li>• Machine learning in portfolio management</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🎓 Educational Value</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• CFA curriculum practical applications</li>
                    <li>• Financial modeling coursework</li>
                    <li>• Quantitative finance programs</li>
                    <li>• Risk management certification</li>
                    <li>• Portfolio theory demonstration</li>
                    <li>• Statistical finance methods</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Download Tab */}
        <TabsContent value="download" className="space-y-6">
          <DownloadReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}