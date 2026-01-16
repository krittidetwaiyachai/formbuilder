"use client";

import { useState } from "react";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  TrendingUp,
  List,
  Download,
  Filter,
  Hash,
  Calendar,
  Percent,
  Award,
  GitCompare,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface FieldAnalyticsSelectorProps {
  availableFields: string[];
  onAnalysisChange: (field: string, analysisType: string) => void;
}

type AnalysisType =
  | "ranking"
  | "statistics"
  | "barChart"
  | "pieChart"
  | "export"
  | "filter"
  | "compare"
  | "count"
  | "timeline"
  | "percentage"
  | "topValues"
  | "allResponses";

export default function FieldAnalyticsSelector({
  availableFields,
  onAnalysisChange,
}: FieldAnalyticsSelectorProps) {
  const { t } = useTranslation();
  const [selectedField, setSelectedField] = useState<string>(availableFields[0] || "");
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType>("ranking");

  const analysisOptions: Array<{
    id: AnalysisType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "ranking",
      label: t('analytics.analysis.ranking'),
      description: t('analytics.analysis.ranking_desc'),
      icon: <Award className="h-5 w-5" />,
    },
    {
      id: "statistics",
      label: t('analytics.analysis.statistics'),
      description: t('analytics.analysis.statistics_desc'),
      icon: <Hash className="h-5 w-5" />,
    },
    {
      id: "barChart",
      label: t('analytics.analysis.barchart'),
      description: t('analytics.analysis.barchart_desc'),
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: "pieChart",
      label: t('analytics.analysis.piechart'),
      description: t('analytics.analysis.piechart_desc'),
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: "topValues",
      label: t('analytics.analysis.topvalues'),
      description: t('analytics.analysis.topvalues_desc'),
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      id: "percentage",
      label: t('analytics.analysis.percentage'),
      description: t('analytics.analysis.percentage_desc'),
      icon: <Percent className="h-5 w-5" />,
    },
    {
      id: "count",
      label: t('analytics.analysis.count'),
      description: t('analytics.analysis.count_desc'),
      icon: <Hash className="h-5 w-5" />,
    },
    {
      id: "allResponses",
      label: t('analytics.analysis.allresponses'),
      description: t('analytics.analysis.allresponses_desc'),
      icon: <List className="h-5 w-5" />,
    },
    {
      id: "timeline",
      label: t('analytics.analysis.timeline'),
      description: t('analytics.analysis.timeline_desc'),
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: "filter",
      label: t('analytics.analysis.filter'),
      description: t('analytics.analysis.filter_desc'),
      icon: <Filter className="h-5 w-5" />,
    },
    {
      id: "compare",
      label: t('analytics.analysis.compare'),
      description: t('analytics.analysis.compare_desc'),
      icon: <GitCompare className="h-5 w-5" />,
    },
    {
      id: "export",
      label: t('analytics.analysis.export'),
      description: t('analytics.analysis.export_desc'),
      icon: <Download className="h-5 w-5" />,
    },
  ];

  React.useEffect(() => {
    if (availableFields.length > 0 && !selectedField) {
      setSelectedField(availableFields[0]);
      onAnalysisChange(availableFields[0], "ranking");
    }
  }, [availableFields]);

  const handleFieldChange = (field: string) => {
    setSelectedField(field);
    onAnalysisChange(field, selectedAnalysis);
  };

  const handleAnalysisChange = (analysisType: AnalysisType) => {
    setSelectedAnalysis(analysisType);
    if (selectedField) {
      onAnalysisChange(selectedField, analysisType);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analytics.field_analytics')}</CardTitle>
        <CardDescription>
          {t('analytics.select_field_analyze')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field Selection */}
        <div className="space-y-2">
          <Label>{t('analytics.select_field')}</Label>
          <Select
            value={selectedField}
            onValueChange={handleFieldChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field} value={field}>
                  {field.replace(/([A-Z])/g, " $1").trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Analysis Type Selection */}
        <div className="space-y-2">
          <Label>{t('analytics.analysis_type')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {analysisOptions.map((option) => (
              <Button
                key={option.id}
                variant={selectedAnalysis === option.id ? "default" : "outline"}
                className="h-auto flex-col items-start p-4"
                onClick={() => handleAnalysisChange(option.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {option.icon}
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                <span className="text-xs text-left text-muted-foreground">
                  {option.description}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

