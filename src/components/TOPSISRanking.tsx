import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, TrendingUp, TrendingDown, Target, Award, Medal } from 'lucide-react';
import { Asset, TOPSISCriteria, TOPSISResult, calculateTOPSISRanking } from '@/lib/analytics';

interface TOPSISRankingProps {
  assets: Asset[];
}

const defaultCriteria: TOPSISCriteria[] = [
  { name: 'expectedReturn', weight: 0.3, beneficial: true },
  { name: 'volatility', weight: 0.2, beneficial: false },
  { name: 'sharpeRatio', weight: 0.3, beneficial: true },
  { name: 'price', weight: 0.2, beneficial: false }
];

export function TOPSISRanking({ assets }: TOPSISRankingProps) {
  const [criteria, setCriteria] = useState<TOPSISCriteria[]>(defaultCriteria);

  const updateCriteria = (index: number, field: keyof TOPSISCriteria, value: string | number | boolean) => {
    const updatedCriteria = [...criteria];
    
    if (field === 'weight') {
      updatedCriteria[index] = { 
        ...updatedCriteria[index], 
        weight: typeof value === 'string' ? parseFloat(value) || 0 : value as number
      };
    } else if (field === 'beneficial') {
      updatedCriteria[index] = { 
        ...updatedCriteria[index], 
        beneficial: value as boolean
      };
    } else if (field === 'name') {
      updatedCriteria[index] = { 
        ...updatedCriteria[index], 
        name: value as string
      };
    }
    
    setCriteria(updatedCriteria);
  };

  const normalizeWeights = () => {
    const total = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    if (total > 0) {
      const normalizedCriteria = criteria.map(criterion => ({
        ...criterion,
        weight: criterion.weight / total
      }));
      setCriteria(normalizedCriteria);
    }
  };

  const topsisResults: TOPSISResult[] = useMemo(() => {
    if (assets.length === 0) return [];
    return calculateTOPSISRanking(assets, criteria);
  }, [assets, criteria]);

  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Target className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  };

  const criteriaLabels = {
    expectedReturn: 'Expected Return',
    volatility: 'Volatility (Risk)',
    sharpeRatio: 'Sharpe Ratio',
    price: 'Stock Price'
  };

  return (
    <div className="space-y-6">
      {/* TOPSIS Configuration */}
      <Card className="card-financial">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                TOPSIS Criteria Configuration
              </CardTitle>
              <CardDescription>
                Configure multi-criteria decision analysis weights and preferences
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <Badge variant={Math.abs(totalWeight - 1) < 0.01 ? "default" : "destructive"}>
                Total: {(totalWeight * 100).toFixed(1)}%
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
          {criteria.map((criterion, index) => (
            <div key={index} className="card-metric space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Criteria</Label>
                  <div className="flex items-center gap-2">
                    {criterion.beneficial ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {criteriaLabels[criterion.name as keyof typeof criteriaLabels] || criterion.name}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`weight-${index}`}>Weight</Label>
                  <Input
                    id={`weight-${index}`}
                    type="number"
                    value={criterion.weight}
                    onChange={(e) => updateCriteria(index, 'weight', e.target.value)}
                    className="input-financial"
                    min="0"
                    max="1"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preference</Label>
                  <div className="flex items-center gap-2">
                    <span className={!criterion.beneficial ? "font-medium" : ""}>Lower Better</span>
                    <Switch
                      checked={criterion.beneficial}
                      onCheckedChange={(checked) => updateCriteria(index, 'beneficial', checked)}
                    />
                    <span className={criterion.beneficial ? "font-medium" : ""}>Higher Better</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Impact</Label>
                  <Badge variant={criterion.beneficial ? "default" : "secondary"}>
                    {criterion.beneficial ? "Beneficial" : "Cost"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* TOPSIS Results */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            TOPSIS Asset Rankings
          </CardTitle>
          <CardDescription>
            Multi-criteria decision analysis results - assets ranked by optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topsisResults.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">TOPSIS Score</TableHead>
                  <TableHead className="text-right">Distance to Ideal</TableHead>
                  <TableHead className="text-right">Distance to Anti-Ideal</TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topsisResults.map((result, index) => (
                  <TableRow key={result.assetIndex} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(result.rank)}
                        <span className="font-bold">#{result.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{result.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {assets[result.assetIndex].name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={getScoreColor(result.score)}>
                        {(result.score * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {result.distanceToIdeal.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {result.distanceToNegative.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {result.rank <= 3 ? (
                          <Badge variant="default">Excellent</Badge>
                        ) : result.rank <= assets.length / 2 ? (
                          <Badge variant="secondary">Good</Badge>
                        ) : (
                          <Badge variant="outline">Consider</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Add assets to your portfolio to see TOPSIS rankings
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TOPSIS Methodology */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            TOPSIS Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">How TOPSIS Works</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Normalizes decision matrix</li>
                <li>• Applies criteria weights</li>
                <li>• Identifies ideal & anti-ideal solutions</li>
                <li>• Calculates relative closeness scores</li>
                <li>• Ranks alternatives by performance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Score Interpretation</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <span className="text-green-600">70%+</span>: Excellent choice</li>
                <li>• <span className="text-yellow-600">50-70%</span>: Good option</li>
                <li>• <span className="text-red-600">&lt;50%</span>: Consider alternatives</li>
                <li>• Higher scores = closer to ideal solution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}