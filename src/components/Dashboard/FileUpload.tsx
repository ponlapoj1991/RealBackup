import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';
import { SocialMention } from '@/types/dashboard';

const processExcelData = (rawData: any[]): SocialMention[] => {
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

interface FileUploadProps {
  onDataUpload: (data: SocialMention[]) => void;
}

export function FileUpload({ onDataUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Please select an Excel file (.xlsx or .xls)');
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File must be less than 50MB');
      }

      setUploadProgress(20);
      const arrayBuffer = await file.arrayBuffer();
      setUploadProgress(40);

      const workbook = XLSX.read(arrayBuffer, {
        cellDates: true,
        dateNF: 'yyyy-mm-dd'
      });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      setUploadProgress(70);

      if (rawData.length === 0) {
        throw new Error('The Excel file is empty.');
      }

      const processedData = processExcelData(rawData);
      setUploadProgress(90);
      
      onDataUpload(processedData);
      setUploadProgress(100);
      setSuccess(true);

      setTimeout(() => {
        setOpen(false);
        setIsUploading(false);
        setSuccess(false);
        setUploadProgress(0);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading the file.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
            <Upload className="h-4 w-4 mr-2" />
            Upload from Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Excel File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Upload successful!</AlertDescription>
            </Alert>
          )}

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Excel File</p>
              <p className="text-xs text-muted-foreground">
                Supports .xlsx, .xls files up to 50MB
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
              />
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Supported Columns:</strong></p>
            <p>Url, date, content, sentiment, Channel, content_type, total_engagement, username, Category, Sub_Category, type_of_speaker, Comment, Reactions, Share</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
