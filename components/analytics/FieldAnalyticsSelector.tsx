"use client";

import { useState } from "react";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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
  FileText,
  Circle,
  GitCompare,
} from "lucide-react";
import { FormSubmission } from "@/types/form";

interface FieldAnalyticsSelectorProps {
  submissions: FormSubmission[];
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

const analysisOptions: Array<{
  id: AnalysisType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "ranking",
    label: "Ranking",
    description: "จัดอันดับคำตอบที่ตอบมากที่สุด",
    icon: <Award className="h-5 w-5" />,
  },
  {
    id: "statistics",
    label: "Statistics",
    description: "สถิติพื้นฐาน (จำนวน, unique values, etc.)",
    icon: <Hash className="h-5 w-5" />,
  },
  {
    id: "barChart",
    label: "Bar Chart",
    description: "กราฟแท่งแสดงจำนวนคำตอบ",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "pieChart",
    label: "Pie Chart",
    description: "กราฟวงกลมแสดงสัดส่วน",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "topValues",
    label: "Top Values",
    description: "แสดงค่า top N ที่ตอบมากที่สุด",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "percentage",
    label: "Percentage",
    description: "แสดงเปอร์เซ็นต์ของแต่ละคำตอบ",
    icon: <Percent className="h-5 w-5" />,
  },
  {
    id: "count",
    label: "Count",
    description: "นับจำนวนคำตอบแต่ละค่า",
    icon: <Hash className="h-5 w-5" />,
  },
  {
    id: "allResponses",
    label: "All Responses",
    description: "แสดงคำตอบทั้งหมดของ field นี้",
    icon: <List className="h-5 w-5" />,
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "แสดงการตอบตามเวลา",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "filter",
    label: "Filter",
    description: "กรองข้อมูลตามเงื่อนไข",
    icon: <Filter className="h-5 w-5" />,
  },
  {
    id: "compare",
    label: "Compare",
    description: "เปรียบเทียบระหว่าง fields",
    icon: <GitCompare className="h-5 w-5" />,
  },
  {
    id: "export",
    label: "Export",
    description: "ส่งออกข้อมูลเป็น CSV/Excel",
    icon: <Download className="h-5 w-5" />,
  },
];

export default function FieldAnalyticsSelector({
  submissions,
  availableFields,
  onAnalysisChange,
}: FieldAnalyticsSelectorProps) {
  const [selectedField, setSelectedField] = useState<string>(availableFields[0] || "");
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType>("ranking");

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
        <CardTitle>Field Analytics</CardTitle>
        <CardDescription>
          เลือก field และประเภทการวิเคราะห์ที่ต้องการ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field Selection */}
        <div className="space-y-2">
          <Label>Select Field</Label>
          <Select
            value={selectedField}
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            {availableFields.map((field) => (
              <option key={field} value={field}>
                {field.replace(/([A-Z])/g, " $1").trim()}
              </option>
            ))}
          </Select>
        </div>

        {/* Analysis Type Selection */}
        <div className="space-y-2">
          <Label>Analysis Type</Label>
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

