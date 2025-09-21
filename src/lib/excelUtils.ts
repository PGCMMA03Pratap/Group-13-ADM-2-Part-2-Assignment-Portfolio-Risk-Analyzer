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
    'Current Price': `₹${asset.price.toFixed(2)}`
  }));
  
  const portfolioWs = XLSX.utils.json_to_sheet(portfolioData);
  XLSX.utils.book_append_sheet(wb, portfolioWs, 'Portfolio Assets');

  // Simulation Parameters
  const parametersData = [
    { Parameter: 'Initial Portfolio Value', Value: `₹${initialValue.toLocaleString()}` },
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
      'Expected Value': `₹${projection.percentiles.p50.toFixed(2)}`,
      'Total Return (Median)': `${projection.totalReturn.p50.toFixed(2)}%`,
      'Annualized Return': `${projection.annualizedReturn.toFixed(2)}%`,
      'Probability of Loss': `${projection.probabilityOfLoss.toFixed(2)}%`,
      '5th Percentile Value': `₹${projection.percentiles.p5.toFixed(2)}`,
      '25th Percentile Value': `₹${projection.percentiles.p25.toFixed(2)}`,
      '75th Percentile Value': `₹${projection.percentiles.p75.toFixed(2)}`,
      '95th Percentile Value': `₹${projection.percentiles.p95.toFixed(2)}`,
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
      { Metric: 'Mean Final Value', Value: `₹${results.mean?.toFixed(2) || 'N/A'}` },
      { Metric: 'Median Final Value (P50)', Value: `₹${results.percentiles?.p50?.toFixed(2) || 'N/A'}` },
      { Metric: '5th Percentile (P5)', Value: `₹${results.percentiles?.p5?.toFixed(2) || 'N/A'}` },
      { Metric: '95th Percentile (P95)', Value: `₹${results.percentiles?.p95?.toFixed(2) || 'N/A'}` },
      { Metric: 'Standard Deviation', Value: `₹${results.stdDev?.toFixed(2) || 'N/A'}` },
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
      { Metric: 'Value at Risk (95%)', Value: `₹${Math.abs(riskMetrics.var95 || 0).toFixed(2)}` },
      { Metric: 'Conditional VaR', Value: `₹${Math.abs(riskMetrics.cvar95 || 0).toFixed(2)}` },
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

// New function to export with active Excel formulas
export const exportResultsWithFormulas = (
  assets: Asset[],
  results: any,
  riskMetrics: any,
  initialValue: number,
  timeHorizon: number,
  simulations: number
) => {
  const wb = XLSX.utils.book_new();

  // Input Data Sheet with formulas
  const inputSheet = XLSX.utils.aoa_to_sheet([
    ['Portfolio Analysis with Active Formulas'],
    [''],
    ['Input Parameters:'],
    ['Initial Portfolio Value', initialValue],
    ['Time Horizon (days)', timeHorizon],
    ['Number of Simulations', simulations],
    ['Risk-Free Rate', 0.03],
    [''],
    ['Asset Data:'],
    ['Symbol', 'Weight (%)', 'Expected Return', 'Volatility', 'Current Price', 'Portfolio Value', 'Weighted Return', 'Weighted Risk'],
    ...assets.map((asset, index) => [
      asset.symbol,
      asset.weight,
      asset.expectedReturn,
      asset.volatility,
      asset.price,
      { f: `B${11 + index}/100*$B$4` }, // Portfolio allocation formula
      { f: `C${11 + index}*B${11 + index}/100` }, // Weighted return formula
      { f: `D${11 + index}*B${11 + index}/100` } // Weighted risk formula
    ]),
    [''],
    ['Portfolio Totals:'],
    [`Total Weight`, { f: `SUM(B11:B${10 + assets.length})` }],
    [`Portfolio Expected Return`, { f: `SUM(G11:G${10 + assets.length})` }],
    [`Average Portfolio Volatility`, { f: `AVERAGE(H11:H${10 + assets.length})` }],
    [`Total Portfolio Value`, { f: `SUM(F11:F${10 + assets.length})` }]
  ]);

  // Calculations Sheet with advanced formulas
  const calcRow = 15 + assets.length;
  const calculationsSheet = XLSX.utils.aoa_to_sheet([
    ['Advanced Portfolio Calculations'],
    [''],
    ['Risk Metrics:'],
    ['Sharpe Ratio', { f: `(InputData!B${calcRow}-(InputData!$B$7*100))/InputData!B${calcRow + 1}` }],
    ['Portfolio Beta', riskMetrics?.beta || 1.0],
    ['Value at Risk (95%)', { f: `InputData!$B$4*NORMSINV(0.05)*InputData!B${calcRow + 1}/100*SQRT(InputData!$B$5/365)` }],
    ['Expected Shortfall (CVaR)', { f: `B6*1.2` }], // Approximation formula
    ['Maximum Drawdown %', (riskMetrics?.maxDrawdown || 0) * 100],
    [''],
    ['Monte Carlo Projections:'],
    ['Mean Final Value', { f: `InputData!$B$4*(1+InputData!B${calcRow}/100)^(InputData!$B$5/365)` }],
    ['Standard Deviation', { f: `B10*InputData!B${calcRow + 1}/100*SQRT(InputData!$B$5/365)` }],
    ['5th Percentile', { f: `B10+B11*NORMSINV(0.05)` }],
    ['25th Percentile', { f: `B10+B11*NORMSINV(0.25)` }],
    ['50th Percentile (Median)', { f: `B10` }],
    ['75th Percentile', { f: `B10+B11*NORMSINV(0.75)` }],
    ['95th Percentile', { f: `B10+B11*NORMSINV(0.95)` }],
    [''],
    ['Multi-Period Analysis:'],
    ['Period', '1 Year', '3 Years', '5 Years', '10 Years'],
    ['Expected Value', 
      { f: `InputData!$B$4*(1+InputData!B${calcRow}/100)^1` },
      { f: `InputData!$B$4*(1+InputData!B${calcRow}/100)^3` },
      { f: `InputData!$B$4*(1+InputData!B${calcRow}/100)^5` },
      { f: `InputData!$B$4*(1+InputData!B${calcRow}/100)^10` }
    ],
    ['Total Return %',
      { f: `(B19/InputData!$B$4-1)*100` },
      { f: `(C19/InputData!$B$4-1)*100` },
      { f: `(D19/InputData!$B$4-1)*100` },
      { f: `(E19/InputData!$B$4-1)*100` }
    ],
    ['Annualized Return %',
      { f: `((B19/InputData!$B$4)^(1/1)-1)*100` },
      { f: `((C19/InputData!$B$4)^(1/3)-1)*100` },
      { f: `((D19/InputData!$B$4)^(1/5)-1)*100` },
      { f: `((E19/InputData!$B$4)^(1/10)-1)*100` }
    ],
    ['Probability of Loss %',
      { f: `NORMSDIST(-B21/InputData!B${calcRow + 1})*100` },
      { f: `NORMSDIST(-C21/InputData!B${calcRow + 1})*100` },
      { f: `NORMSDIST(-D21/InputData!B${calcRow + 1})*100` },
      { f: `NORMSDIST(-E21/InputData!B${calcRow + 1})*100` }
    ]
  ]);

  // Portfolio Optimization Sheet
  const optimizationSheet = XLSX.utils.aoa_to_sheet([
    ['Portfolio Optimization Formulas'],
    [''],
    ['Efficient Frontier Calculations:'],
    ['Target Return', 0.08, 0.10, 0.12, 0.15, 0.18],
    ['Required Volatility', 
      { f: `SQRT(B4*InputData!B${calcRow + 1}/100)` },
      { f: `SQRT(C4*InputData!B${calcRow + 1}/100)` },
      { f: `SQRT(D4*InputData!B${calcRow + 1}/100)` },
      { f: `SQRT(E4*InputData!B${calcRow + 1}/100)` },
      { f: `SQRT(F4*InputData!B${calcRow + 1}/100)` }
    ],
    ['Sharpe Ratio',
      { f: `(B4-InputData!$B$7)/B5` },
      { f: `(C4-InputData!$B$7)/C5` },
      { f: `(D4-InputData!$B$7)/D5` },
      { f: `(E4-InputData!$B$7)/E5` },
      { f: `(F4-InputData!$B$7)/F5` }
    ],
    [''],
    ['Asset Allocation Recommendations:'],
    ['Conservative Portfolio (Lower Risk):'],
    ...assets.map((asset, index) => [
      asset.symbol,
      { f: `MIN(InputData!B${11 + index}*1.2, 40)` } // Conservative allocation formula
    ]),
    [''],
    ['Aggressive Portfolio (Higher Return):'],
    ...assets.map((asset, index) => [
      asset.symbol,
      { f: `InputData!B${11 + index}*InputData!C${11 + index}/InputData!B${calcRow}*100` } // Return-weighted allocation
    ])
  ]);

  // Summary Dashboard
  const dashboardSheet = XLSX.utils.aoa_to_sheet([
    ['PORTFOLIO ANALYSIS DASHBOARD'],
    [''],
    ['Key Metrics Summary:'],
    ['Current Portfolio Value', { f: `InputData!B${calcRow + 2}` }],
    ['Expected Annual Return', { f: `InputData!B${calcRow}*100&"%"` }],
    ['Portfolio Volatility', { f: `InputData!B${calcRow + 1}*100&"%"` }],
    ['Sharpe Ratio', { f: `Calculations!B4` }],
    ['Value at Risk (95%)', { f: `"$"&ABS(Calculations!B6)` }],
    [''],
    ['1-Year Projection:'],
    ['Expected Value', { f: `"$"&Calculations!B19` }],
    ['Best Case (95%)', { f: `"$"&Calculations!B16` }],
    ['Worst Case (5%)', { f: `"$"&Calculations!B12` }],
    ['Probability of Loss', { f: `Calculations!B22&"%"` }],
    [''],
    ['Portfolio Health Check:'],
    ['Diversification Score', { f: `IF(InputData!B${calcRow - 3}>95,"Good","Needs Improvement")` }],
    ['Risk Level', { f: `IF(InputData!B${calcRow + 1}<0.15,"Low",IF(InputData!B${calcRow + 1}<0.25,"Medium","High"))` }],
    ['Return Potential', { f: `IF(InputData!B${calcRow}>0.12,"High",IF(InputData!B${calcRow}>0.08,"Medium","Low"))` }]
  ]);

  // Set column widths for better readability
  inputSheet['!cols'] = [
    { width: 20 }, { width: 15 }, { width: 18 }, { width: 15 }, 
    { width: 15 }, { width: 18 }, { width: 18 }, { width: 15 }
  ];

  calculationsSheet['!cols'] = [
    { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
  ];

  dashboardSheet['!cols'] = [{ width: 25 }, { width: 20 }];

  // Add sheets to workbook
  XLSX.utils.book_append_sheet(wb, inputSheet, 'InputData');
  XLSX.utils.book_append_sheet(wb, calculationsSheet, 'Calculations');
  XLSX.utils.book_append_sheet(wb, optimizationSheet, 'Optimization');
  XLSX.utils.book_append_sheet(wb, dashboardSheet, 'Dashboard');

  // Export file with formulas
  const fileName = `portfolio-analysis-formulas-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};