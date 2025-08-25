import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Database } from 'lucide-react';
import { SocialMention } from '@/types/dashboard';
import { useDashboard } from '@/contexts/DashboardContext';
import { FileUpload } from '@/components/Dashboard/FileUpload';
import { GoogleSheetsUpload } from '@/components/Dashboard/GoogleSheetsUpload';
import { AISettings } from '@/components/AI/AISettings';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { dispatch } = useDashboard();

    const handleDataUpload = (data: SocialMention[]) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        setTimeout(() => {
            dispatch({ type: 'SET_DATA', payload: data });
            dispatch({ type: 'SET_LOADING', payload: false });
            navigate('/');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                <Card className="border-0 shadow-card">
                    <CardHeader>
                        <CardTitle className="text-2xl">Settings</CardTitle>
                        <CardDescription>Manage your dashboard settings and data sources.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="database" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="database">
                                    <Database className="h-4 w-4 mr-2" />
                                    Database
                                </TabsTrigger>
                                <TabsTrigger value="ai">
                                    <Bot className="h-4 w-4 mr-2" />
                                    AI Assistant
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="database" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Data Import</CardTitle>
                                        <CardDescription>Upload data from an Excel file or connect to a Google Sheet.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        <div className="p-4 border rounded-lg">
                                            <h3 className="font-semibold mb-2 text-foreground">Upload from Excel</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Import your data by uploading a .xlsx or .xls file.
                                            </p>
                                            <FileUpload onDataUpload={handleDataUpload} />
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h3 className="font-semibold mb-2 text-foreground">Connect to Google Sheets</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Sync your data directly from a public Google Sheet.
                                            </p>
                                            <GoogleSheetsUpload onDataUpload={handleDataUpload} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="ai" className="mt-6">
                                <AISettings />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
