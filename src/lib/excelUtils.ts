import * as XLSX from 'xlsx';
import { Asset } from './analytics';

export interface ExcelAsset {
  symbol: string;
  weight: number;
  expectedReturn: number;
  volatility: number;
  price: number;
}

export const downloadTemplateExcel = () => {
  const templateData = [
    {
      Symbol: 'AAPL',
      Weight: 25,
      'Expected Return': 0.12,
      Volatility: 0.25,
      Price: 150
    },
    {
      Symbol: 'MSFT', 
      Weight: 25,
      'Expected Return': 0.13,
      Volatility: 0.24,
      Price: 350
    },
    {
      Symbol: 'GOOGL',
      Weight: 25,
      'Expected Return': 0.15,
      Volatility: 0.28,
      Price: 2800
    },
    {
      Symbol: 'NVDA',
      Weight: 25,
      'Expected Return': 0.20,
      Volatility: 0.35,
      Price: 900
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  ws['!cols'] = [
    { width: 12 }, // Symbol
    { width: 10 }, // Weight
    { width: 18 }, // Expected Return
    { width: 12 }, // Volatility
    { width: 10 }  // Price
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Portfolio Template');
  XLSX.writeFile(wb, 'portfolio-template.xlsx');
};

export const parseExcelFile = (file: File): Promise<Asset[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const assets: Asset[] = jsonData.map((row, index) => {
          // Handle various column name formats
          const symbol = row.Symbol || row.symbol || row.SYMBOL || `STOCK${index + 1}`;
          const weight = parseFloat(row.Weight || row.weight || row.WEIGHT || 0);
          const expectedReturn = parseFloat(row['Expected Return'] || row.expectedReturn || row.EXPECTED_RETURN || row['Expected_Return'] || 0.1);
          const volatility = parseFloat(row.Volatility || row.volatility || row.VOLATILITY || 0.2);
          const price = parseFloat(row.Price || row.price || row.PRICE || 100);

          return {
            symbol: String(symbol),
            name: `${symbol} Corp.`,
            weight,
            expectedReturn,
            volatility,
            price
          };
        }).filter(asset => asset.symbol && asset.weight > 0);

        resolve(assets);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please check the format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the Excel file.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const exportResultsToExcel = (
  assets: Asset[], 
  results: any, 
  riskMetrics: any,
  initialValue: number,
  timeHorizon: number,
  simulations: number
) => {
  const wb = XLSX.utils.book_new();

  // Portfolio Summary Sheet
  const portfolioData = assets.map(asset => ({
    Symbol: asset.symbol,
    Name: asset.name,
    Weight: `${asset.weight.toFixed(2)}%`,
    'Expected Return': `${(asset.expectedReturn * 100).toFixed(2)}%`,
    'Volatility': `${(asset.volatility * 100).toFixed(2)}%`,
    'Current Price': `$${asset.price.toFixed(2)}`
  }));
  
  const portfolioWs = XLSX.utils.json_to_sheet(portfolioData);
  XLSX.utils.book_append_sheet(wb, portfolioWs, 'Portfolio Assets');

  // Simulation Parameters
  const parametersData = [
    { Parameter: 'Initial Portfolio Value', Value: `$${initialValue.toLocaleString()}` },
    { Parameter: 'Time Horizon', Value: `${timeHorizon} days` },
    { Parameter: 'Number of Simulations', Value: simulations.toLocaleString() },
    { Parameter: 'Analysis Date', Value: new Date().toLocaleDateString() }
  ];
  
  const parametersWs = XLSX.utils.json_to_sheet(parametersData);
  XLSX.utils.book_append_sheet(wb, parametersWs, 'Parameters');

  // Multi-Period Projections
  if (results?.multiPeriodProjections) {
    const projectionData = results.multiPeriodProjections.map((projection: any) => ({
      'Time Period': projection.period,
      'Expected Value': `$${projection.percentiles.p50.toFixed(2)}`,
      'Total Return (Median)': `${projection.totalReturn.p50.toFixed(2)}%`,
      'Annualized Return': `${projection.annualizedReturn.toFixed(2)}%`,
      'Probability of Loss': `${projection.probabilityOfLoss.toFixed(2)}%`,
      '5th Percentile Value': `$${projection.percentiles.p5.toFixed(2)}`,
      '25th Percentile Value': `$${projection.percentiles.p25.toFixed(2)}`,
      '75th Percentile Value': `$${projection.percentiles.p75.toFixed(2)}`,
      '95th Percentile Value': `$${projection.percentiles.p95.toFixed(2)}`,
      '5th Percentile Return': `${projection.totalReturn.p5.toFixed(2)}%`,
      '25th Percentile Return': `${projection.totalReturn.p25.toFixed(2)}%`,
      '75th Percentile Return': `${projection.totalReturn.p75.toFixed(2)}%`,
      '95th Percentile Return': `${projection.totalReturn.p95.toFixed(2)}%`
    }));
    
    const projectionWs = XLSX.utils.json_to_sheet(projectionData);
    XLSX.utils.book_append_sheet(wb, projectionWs, 'Multi-Period Projections');
  }

  // Monte Carlo Results
  if (results) {
    const resultsData = [
      { Metric: 'Mean Final Value', Value: `$${results.mean?.toFixed(2) || 'N/A'}` },
      { Metric: 'Median Final Value (P50)', Value: `$${results.percentiles?.p50?.toFixed(2) || 'N/A'}` },
      { Metric: '5th Percentile (P5)', Value: `$${results.percentiles?.p5?.toFixed(2) || 'N/A'}` },
      { Metric: '95th Percentile (P95)', Value: `$${results.percentiles?.p95?.toFixed(2) || 'N/A'}` },
      { Metric: 'Standard Deviation', Value: `$${results.stdDev?.toFixed(2) || 'N/A'}` },
      { Metric: 'Expected Return', Value: `${((results.expectedReturn || 0) * 100).toFixed(2)}%` },
      { Metric: 'Portfolio Volatility', Value: `${((results.volatility || 0) * 100).toFixed(2)}%` },
      { Metric: 'Sharpe Ratio', Value: results.sharpeRatio?.toFixed(3) || 'N/A' }
    ];
    
    const resultsWs = XLSX.utils.json_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(wb, resultsWs, 'Monte Carlo Results');
  }

  // Risk Metrics
  if (riskMetrics) {
    const riskData = [
      { Metric: 'Value at Risk (95%)', Value: `$${Math.abs(riskMetrics.var95 || 0).toFixed(2)}` },
      { Metric: 'Conditional VaR', Value: `$${Math.abs(riskMetrics.cvar95 || 0).toFixed(2)}` },
      { Metric: 'Maximum Drawdown', Value: `${((riskMetrics.maxDrawdown || 0) * 100).toFixed(2)}%` },
      { Metric: 'Sharpe Ratio', Value: (riskMetrics.sharpeRatio || 0).toFixed(3) },
      { Metric: 'Portfolio Beta', Value: (riskMetrics.beta || 0).toFixed(3) },
      { Metric: 'Portfolio Return', Value: `${((riskMetrics.portfolioReturn || 0) * 100).toFixed(2)}%` },
      { Metric: 'Portfolio Volatility', Value: `${((riskMetrics.portfolioVolatility || 0) * 100).toFixed(2)}%` }
    ];
    
    const riskWs = XLSX.utils.json_to_sheet(riskData);
    XLSX.utils.book_append_sheet(wb, riskWs, 'Risk Metrics');
  }

  // Export file
  const fileName = `portfolio-analysis-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};