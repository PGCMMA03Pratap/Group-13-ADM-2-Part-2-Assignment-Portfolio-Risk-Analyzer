import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, ExternalLink } from 'lucide-react';

export function DownloadReport() {
  const downloadReport = () => {
    const reportUrl = '/portfolio-analyzer-report.md';
    const link = document.createElement('a');
    link.href = reportUrl;
    link.download = 'Portfolio-Analyzer-Comprehensive-Report.md';
    link.click();
  };

  const downloadWordReport = () => {
    const reportUrl = '/portfolio-analyzer-report.html';
    const link = document.createElement('a');
    link.href = reportUrl;
    link.download = 'Portfolio-Analyzer-Comprehensive-Report.html';
    link.click();
  };

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Project Documentation
        </CardTitle>
        <CardDescription>
          Comprehensive technical report and documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium">📄 Comprehensive Project Report</h4>
          <p className="text-sm text-muted-foreground">
            Download the complete technical documentation in your preferred format. The HTML version 
            can be opened in Microsoft Word for editing and submission as a Word document.
          </p>
          
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h5 className="font-medium text-sm">Available Formats:</h5>
            <ul className="text-xs space-y-1">
              <li>• <strong>Markdown (.md):</strong> Plain text format, readable in any text editor</li>
              <li>• <strong>HTML (.html):</strong> Web format, can be opened in Word for .docx conversion</li>
            </ul>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h5 className="font-medium text-sm">Report Contents:</h5>
            <ul className="text-xs space-y-1 grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <li>• Executive Summary & Project Overview</li>
              <li>• Technical Architecture & Implementation</li>
              <li>• Monte Carlo Simulation Methodology</li>
              <li>• Risk Metrics & Distribution Analysis</li>
              <li>• AHP & TOPSIS Mathematical Framework</li>
              <li>• Real-World Applications & Use Cases</li>
              <li>• Performance Metrics & Benchmarks</li>
              <li>• Future Enhancements & Roadmap</li>
            </ul>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Button onClick={downloadReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Report (Markdown)
            </Button>
            <Button 
              onClick={downloadWordReport} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Download Report (Word)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/portfolio-analyzer-report.md', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Markdown
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/portfolio-analyzer-report.html', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View HTML Report
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium">🎓 Educational Resources</h4>
          <p className="text-sm text-muted-foreground mt-2">
            This application serves as both a practical tool and educational platform for:
          </p>
          <ul className="text-sm space-y-1 mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <li>• Quantitative Finance Students</li>
            <li>• Risk Management Professionals</li>
            <li>• Portfolio Managers & Analysts</li>
            <li>• Academic Researchers</li>
            <li>• Financial Engineers</li>
            <li>• Investment Committee Members</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}