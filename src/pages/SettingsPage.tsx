import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bot, Database, Save } from 'lucide-react';
import { SocialMention } from '@/types/dashboard';
import { useDashboard } from '@/contexts/DashboardContext';
import { FileUpload } from '@/components/Dashboard/FileUpload';
import { GoogleSheetsUpload } from '@/components/Dashboard/GoogleSheetsUpload';
import { AISettings } from '@/components/AI/AISettings';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from "sonner";

const SettingsPage = () => {
    const navigate = useNavigate();
    const { dispatch } = useDashboard();
    const { settings, updateSettings } = useSettings();

    const [googleSheetsConfig, setGoogleSheetsConfig] = useState(settings.googleSheetsSettings);
    const [hasGssChanges, setHasGssChanges] = useState(false);

    useEffect(() => {
        setGoogleSheetsConfig(settings.googleSheetsSettings);
    }, [settings.googleSheetsSettings]);

    const handleGssChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGoogleSheetsConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setHasGssChanges(true);
    };

    const handleGssSave = () => {
        updateSettings({ googleSheetsSettings: googleSheetsConfig });
        setHasGssChanges(false);
        toast.success("Google Sheets settings saved successfully!");
    };

    const handleDataUpload = (data: SocialMention[]) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        setTimeout(() => {
            dispatch({ type: 'SET_DATA', payload: data });
            dispatch({ type: 'SET_LOADING', payload: false });
            toast.success(`${data.length} records loaded successfully!`, {
                description: "Returning to the dashboard.",
            });
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
                                        <div className="p-4 border rounded-lg space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2 text-foreground">Connect to Google Sheets</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Sync your data directly from a public Google Sheet.
                                                </p>
                                                <GoogleSheetsUpload onDataUpload={handleDataUpload} />
                                            </div>
                                            <div className="space-y-4 pt-4 border-t">
                                                <h4 className="font-medium text-foreground">Configuration</h4>
                                                <div className="space-y-2">
                                                    <Label htmlFor="sheetId">Sheet ID</Label>
                                                    <Input id="sheetId" name="sheetId" value={googleSheetsConfig.sheetId} onChange={handleGssChange} placeholder="Enter your Google Sheet ID" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="sheetName">Sheet Name</Label>
                                                    <Input id="sheetName" name="sheetName" value={googleSheetsConfig.sheetName} onChange={handleGssChange} placeholder="Enter the name of the sheet" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="gid">Sheet GID</Label>
                                                    <Input id="gid" name="gid" value={googleSheetsConfig.gid} onChange={handleGssChange} placeholder="Enter the GID of the sheet" />
                                                </div>
                                                <div className="flex justify-end">
                                                    <Button size="sm" onClick={handleGssSave} disabled={!hasGssChanges}>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save Google Sheets Config
                                                    </Button>
                                                </div>
                                            </div>
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
