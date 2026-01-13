"use client";

import { ActivityLog as ActivityLogType } from "@/types/collaboration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  FileText,
  Settings,
  Clock
} from "lucide-react";
import { mockUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ActivityLogProps {
  logs: ActivityLogType[];
  maxItems?: number;
}

const actionIcons = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  published: Send,
  unpublished: FileText,
  viewed: Eye,
};

const actionColors = {
  created: "text-green-600 bg-green-50",
  updated: "text-blue-600 bg-blue-50",
  deleted: "text-red-600 bg-red-50",
  published: "text-purple-600 bg-purple-50",
  unpublished: "text-gray-600 bg-gray-50",
  viewed: "text-gray-600 bg-gray-50",
};

const targetIcons = {
  form: FileText,
  element: Edit,
  settings: Settings,
};

import { useTranslation } from "react-i18next";

export default function ActivityLog({ logs, maxItems = 10 }: ActivityLogProps) {
  const { t } = useTranslation();
  const displayLogs = logs.slice(0, maxItems);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('activity.just_now');
    if (diffMins < 60) return t('activity.m_ago', { count: diffMins });
    if (diffHours < 24) return t('activity.h_ago', { count: diffHours });
    if (diffDays < 7) return t('activity.d_ago', { count: diffDays });
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('activity.title')}
        </CardTitle>
        <CardDescription>
          {t('activity.recent_changes')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayLogs.length > 0 ? (
            displayLogs.map((log) => {
              const ActionIcon = actionIcons[log.action];
              const TargetIcon = targetIcons[log.target];
              const actionColor = actionColors[log.action];

              return (
                <div key={log.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                      )}
                      style={{
                        backgroundColor: mockUsers.find((u) => u.id === log.userId)?.color || "#6B7280",
                      }}
                    >
                      {getInitials(log.userName)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div
                        className={cn(
                          "p-1.5 rounded-md flex-shrink-0",
                          actionColor
                        )}
                      >
                        <ActionIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{log.userName}</span>{" "}
                          {log.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(log.timestamp)}
                          </span>
                          {log.targetName && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <TargetIcon className="h-3 w-3" />
                                <span>{log.targetName}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-sm text-gray-500">
              {t('activity.no_activity')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

