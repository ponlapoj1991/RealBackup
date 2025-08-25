import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAI } from '@/contexts/AIContext';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { FilterPanel } from '@/components/Dashboard/FilterPanel';
import { OverviewView } from '@/components/Views/OverviewView';
import { SentimentView } from '@/components/Views/SentimentView';
import { PerformanceView } from '@/components/Views/PerformanceView';
import { InfluencerView } from '@/components/Views/InfluencerView';
import { ContentView } from '@/components/Views/ContentView';
import { AIChat } from '@/components/AI/AIChat';
import { 
  FileSpreadsheet, 
  Filter, 
  X, 
  Bot,
  MessageSquare
} from 'lucide-react';

function DashboardContent() {
  const { state } = useDashboard();
  const { state: aiState, toggleChat } = useAI();
  const [showFilters, setShowFilters] = useState(false);

  const renderCurrentView = () => {
    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading Data...</p>
          </div>
        </div>
      );
    }

    switch (state.currentView) {
      case 'sentiment':
        return <SentimentView />;
      case 'performance':
        return <PerformanceView />;
      case 'influencer':
        return <InfluencerView />;
      case 'content':
        return <ContentView />;
      default:
        return <OverviewView />;
    }
  };

  const hasActiveFilters = () => {
    const { filters } = state;
    return (
      filters.sentiment.length > 0 ||
      filters.channels.length > 0 ||
      filters.categories.length > 0 ||
      (filters.dateRange.start && filters.dateRange.end)
    );
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      <Sidebar className="w-64 flex-shrink-0" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
              Social Listening Dashboard
            </h1>
            {state.data.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {state.filteredData.length.toLocaleString()} of {state.data.length.toLocaleString()} items
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {state.data.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative ${hasActiveFilters() ? 'border-primary' : ''}`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters() && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                      •
                    </div>
                  )}
                </Button>
                
                <Button
                  variant={aiState.isOpen ? "default" : "outline"}
                  size="sm"
                  onClick={toggleChat}
                  className="relative"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Chat
                  {!aiState.settings.apiKey && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-warning text-warning-foreground rounded-full text-xs flex items-center justify-center">
                      !
                    </div>
                  )}
                </Button>
              </>
            )}
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            {state.data.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6">
                <Card className="w-full max-w-2xl">
                  <CardContent className="text-center space-y-6 p-8">
                    <div className="mx-auto w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
                      <FileSpreadsheet className="h-12 w-12 text-white" />
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">Welcome to Social Listening Dashboard</h2>
                      <p className="text-muted-foreground">
                        Navigate to Settings to upload your Excel data or connect to Google Sheets.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p>✅ Analyze sentiment & trends</p>
                          <p>✅ Measure channel performance</p>
                          <p>✅ Discover influencer insights</p>
                        </div>
                        <div className="space-y-2">
                          <p>✅ Analyze content performance</p>
                          <p>✅ Filter and drill down data</p>
                          <p>✅ AI Assistant for analysis 🤖</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              renderCurrentView()
            )}
          </div>
          
          {showFilters && state.data.length > 0 && (
            <div className="w-80 border-l border-border bg-card overflow-y-auto">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Data Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <FilterPanel />
              </div>
            </div>
          )}

          {aiState.isOpen && state.data.length > 0 && (
            <div className="w-96 border-l border-border bg-card">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold flex items-center">
                    <Bot className="h-4 w-4 mr-2 text-primary" />
                    AI Assistant
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <AIChat className="h-full border-0" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SocialListeningDashboard() {
  return (
      <DashboardContent />
  );
}
