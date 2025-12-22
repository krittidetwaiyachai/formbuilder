"use client";

import { useState } from "react";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Mail, Lock, Link as LinkIcon } from "lucide-react";
import { FormSettings } from "@/types/form";

interface FormSettingsPanelProps {
  settings: FormSettings;
  onSettingsChange: (settings: FormSettings) => void;
}

const defaultSettings: FormSettings = {
  allowMultipleSubmissions: true,
  showProgressBar: false,
  showPageNumbers: false,
  requireLogin: false,
  successMessage: "Thank you for your submission!",
  emailNotifications: false,
  notificationEmails: [],
};

export default function FormSettingsPanel({ settings, onSettingsChange }: FormSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<FormSettings>(settings || defaultSettings);

  // Sync with prop changes
  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleChange = (updates: Partial<FormSettings>) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleEmailAdd = (email: string) => {
    if (email && !localSettings.notificationEmails?.includes(email)) {
      handleChange({
        notificationEmails: [...(localSettings.notificationEmails || []), email],
      });
    }
  };

  const handleEmailRemove = (email: string) => {
    handleChange({
      notificationEmails: localSettings.notificationEmails?.filter((e) => e !== email),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Form Settings
        </CardTitle>
        <CardDescription>Configure form behavior and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Submission Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Submission Settings</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowMultiple"
              checked={localSettings.allowMultipleSubmissions}
              onChange={(e) => handleChange({ allowMultipleSubmissions: e.target.checked })}
            />
            <Label htmlFor="allowMultiple" className="cursor-pointer">
              Allow multiple submissions
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireLogin"
              checked={localSettings.requireLogin}
              onChange={(e) => handleChange({ requireLogin: e.target.checked })}
            />
            <Label htmlFor="requireLogin" className="cursor-pointer flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              Require login to submit
            </Label>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700">Display Settings</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showProgress"
              checked={localSettings.showProgressBar}
              onChange={(e) => handleChange({ showProgressBar: e.target.checked })}
            />
            <Label htmlFor="showProgress" className="cursor-pointer">
              Show progress bar
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showPageNumbers"
              checked={localSettings.showPageNumbers}
              onChange={(e) => handleChange({ showPageNumbers: e.target.checked })}
            />
            <Label htmlFor="showPageNumbers" className="cursor-pointer">
              Show page numbers
            </Label>
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2 border-t pt-4">
          <Label>Success Message</Label>
          <Textarea
            value={localSettings.successMessage || ""}
            onChange={(e) => handleChange({ successMessage: e.target.value })}
            placeholder="Thank you for your submission!"
            rows={3}
          />
        </div>

        {/* Redirect URL */}
        <div className="space-y-2 border-t pt-4">
          <Label className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Redirect URL (Optional)
          </Label>
          <Input
            type="url"
            value={localSettings.redirectUrl || ""}
            onChange={(e) => handleChange({ redirectUrl: e.target.value })}
            placeholder="https://example.com/thank-you"
          />
          <p className="text-xs text-muted-foreground">
            Redirect users after form submission
          </p>
        </div>

        {/* Email Notifications */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailNotifications"
              checked={localSettings.emailNotifications}
              onChange={(e) => handleChange({ emailNotifications: e.target.checked })}
            />
            <Label htmlFor="emailNotifications" className="cursor-pointer flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              Email notifications
            </Label>
          </div>

          {localSettings.emailNotifications && (
            <div className="space-y-2 ml-6">
              <Label className="text-xs">Notification Emails</Label>
              <div className="space-y-2">
                {localSettings.notificationEmails?.map((email) => (
                  <div key={email} className="flex items-center gap-2">
                    <Input value={email} readOnly className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmailRemove(email)}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Input
                  type="email"
                  placeholder="email@example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEmailAdd(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Press Enter to add email
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

