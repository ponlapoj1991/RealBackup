import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import Papa from 'papaparse';
import { SocialMention } from '@/types/dashboard';

const SHEET_CONFIG = {
  sheetId: '1pTvDqlnGmSKbIyg2t8dRVy08uOfe-dnji8pJNd6z0Cw',
  sheetName: 'SCGDATA',
  gid: 1494033773
};

interface GoogleSheetsUploadProps {
  onDataUpload: (data: SocialMention[]) => void;
}

const processGoogleSheetData = (rawData: any[]): SocialMention[] => {
  return rawData.map((row, index) => {
    let dateValue = row.date || row.Date || row.DATE || '';
    if (dateValue) {
      try {
        let parsedDate: Date;
        
        if (typeof dateValue === 'string') {
          if (dateValue.includes('T')) {
            parsedDate = new Date(dateValue);
          } else {
            parsedDate = new Date(dateValue);
          }
        } else if (typeof dateValue === 'number') {
          parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
        } else if (dateValue instanceof Date) {
          parsedDate = dateValue;
        } else {
          parsedDate = new Date();
        }
        
        if (isNaN(parsedDate.getTime())) {
          parsedDate = new Date();
        }
        
        dateValue = parsedDate.toISOString().split('T')[0];
        
      } catch (error) {
        dateValue = new Date().toISOString().split('T')[0];
      }
    } else {
      dateValue = new Date().toISOString().split('T')[0];
    }

    const processedRow = {
      id: index + 1,
      date: dateValue,
      content: String(row.content || row.Content || row.CONTENT || '').trim(),
      sentiment: (row.sentiment || row.Sentiment || row.SENTIMENT || 'Neutral') as 'Positive' | 'Negative' | 'Neutral',
      channel: (row.Channel || row.channel || row.CHANNEL || 'Website') as any,
      content_type: (row.content_type || row['Content Type'] || row.contentType || 'Post') as any,
      total_engagement: parseInt(String(row.total_engagement || row['Total Engagement'] || row.totalEngagement || '0')) || 0,
      username: String(row.username || row.Username || row.USERNAME || row.user || '').trim(),
      category: (row.Category || row.category || row.CATEGORY || 'Business Branding') as any,
      sub_category: (row.Sub_Category || row['Sub Category'] || row.subCategory || row.Sub_category || 'Corporate') as any,
      type_of_speaker: (row.type_of_speaker || row['Type of Speaker'] || row.speakerType || 'Consumer') as any,
      comments: parseInt(String(row.Comment || row.Comments || row.comment || '0')) || 0,
      reactions: parseInt(String(row.Reactions || row.reactions || row.Reaction || '0')) || 0,
      shares: parseInt(String(row.Share || row.Shares || row.shares || '0')) || 0
    };

    return processedRow;
  });
};

export function GoogleSheetsUpload({ onDataUpload }: GoogleSheetsUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const buildCSVUrl = () => {
    return `https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.sheetId}/export?format=csv&gid=${SHEET_CONFIG.gid}`;
  };

  const handleGoogleSheetsLoad = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      setProgress(20);
      const csvUrl = buildCSVUrl();
      setProgress(40);
      
      const response = await fetch(csvUrl, {
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}. Sheet may not be public or URL is incorrect.`);
      }
      
      const csvText = await response.text();
      setProgress(60);
      
      if (!csvText || csvText.trim().length === 0) {
        throw new Error('No data received from Google Sheets');
      }
      
      setProgress(80);
      
      const parseResult = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });
      
      const rawData = parseResult.data;
      
      if (!rawData || rawData.length === 0) {
        throw new Error('No data rows found in Google Sheets');
      }
      
      setProgress(90);
      
      const processedData = processGoogleSheetData(rawData);
      
      setProgress(100);
      onDataUpload(processedData);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setProgress(0);
        setIsLoading(false);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data from Google Sheets');
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGoogleSheetsLoad}
        disabled={isLoading}
        variant="outline"
        className="w-full justify-start"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Cloud className="h-4 w-4 mr-2" />
        )}
        {isLoading ? 'Loading...' : 'Connect to Google Sheets'}
      </Button>

      {isLoading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Loading data from Google Sheets...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Successfully loaded data from Google Sheets!</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
