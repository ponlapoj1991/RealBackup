import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from "sonner";
import { 
  Key, 
  Settings2, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

export function AISettings() {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings.aiSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setLocalSettings(settings.aiSettings);
  }, [settings.aiSettings]);

  const handleSettingChange = (field: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    updateSettings({ aiSettings: localSettings });
    setHasUnsavedChanges(false);
    toast.success("AI settings saved successfully!");
  };

  const handleReset = () => {
    setLocalSettings(settings.aiSettings);
    setHasUnsavedChanges(false);
  };

  const isApiKeyValid = localSettings.apiKey && localSettings.apiKey.startsWith('sk-');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>API Configuration</span>
          </CardTitle>
          <CardDescription>Configure your OpenAI API key and model selection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={localSettings.apiKey}
                  onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                  className={`pr-10 ${isApiKeyValid ? 'border-success' : localSettings.apiKey ? 'border-destructive' : ''}`}
                />
                {isApiKeyValid && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-success" />
                )}
                {localSettings.apiKey && !isApiKeyValid && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'Hide' : 'Show'}
              </Button>
            </div>
            {localSettings.apiKey && !isApiKeyValid && (
              <p className="text-xs text-destructive flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Invalid API Key (must start with 'sk-')
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Get your API Key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select 
              value={localSettings.model} 
              onValueChange={(value) => handleSettingChange('model', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                <SelectItem value="gpt-4.1">GPT-4.1 (Latest)</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Cost-effective)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center space-x-2">
            <Settings2 className="h-4 w-4" />
            <span>AI Behavior</span>
          </CardTitle>
           <CardDescription>Customize how the AI assistant responds and behaves.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="system-prompt">Custom System Prompt</Label>
              <Info className="h-3 w-3 text-muted-foreground" title="Define the AI's role and behavior" />
            </div>
            <Textarea
              id="system-prompt"
              placeholder="Your role is an expert social media data analyst..."
              rows={6}
              value={localSettings.systemPrompt}
              onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperature: {localSettings.temperature}</Label>
              <Badge variant="outline" className="text-xs">
                {localSettings.temperature <= 0.3 ? 'Deterministic' : 
                 localSettings.temperature <= 0.7 ? 'Balanced' : 'Creative'}
              </Badge>
            </div>
            <Slider
              value={[localSettings.temperature]}
              onValueChange={([value]) => handleSettingChange('temperature', value)}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>More Precise</span>
              <span>More Creative</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Max Tokens: {localSettings.maxTokens}</Label>
              <Badge variant="outline" className="text-xs">
                ~{Math.round(localSettings.maxTokens * 0.75)} words
              </Badge>
            </div>
            <Slider
              value={[localSettings.maxTokens]}
              onValueChange={([value]) => handleSettingChange('maxTokens', value)}
              max={2000}
              min={100}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Shorter (100)</span>
              <span>Longer (2000)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {hasUnsavedChanges ? 'You have unsaved changes.' : 'All settings are up to date.'}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
