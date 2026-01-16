"use client";

import { useState } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { mockSubmissions, mockForms } from "@/lib/mock-data";
import FieldAnalyticsSelector from "@/components/analytics/FieldAnalyticsSelector";
import AnalysisRenderer from "@/components/analytics/AnalysisRenderer";

export default function ResponsesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const form = mockForms.find((f) => f.id === params.id);
  const submissions = mockSubmissions.filter((s) => s.formId === params.id);

  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("ranking");

  // Get available fields from submissions
  const availableFields = Array.from(
    new Set(
      submissions.flatMap((submission) => Object.keys(submission.data))
    )
  );

  const handleAnalysisChange = (field: string, analysisType: string) => {
    setSelectedField(field);
    setSelectedAnalysis(analysisType);
  };

  React.useEffect(() => {
    if (availableFields.length > 0 && !selectedField) {
      const firstField = availableFields[0];
      handleAnalysisChange(firstField, "ranking");
    }
  }, [availableFields.length]);

  if (!form) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Form not found</p>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/analytics/${params.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analytics
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Field Analytics</h1>
          <p className="text-muted-foreground">
            {form.title} - เลือก field และประเภทการวิเคราะห์ที่ต้องการ
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Field & Analysis Selector */}
        <FieldAnalyticsSelector
          availableFields={availableFields}
          onAnalysisChange={handleAnalysisChange}
        />

        {/* Analysis Results */}
        {selectedField && (
          <AnalysisRenderer
            fieldName={selectedField}
            submissions={submissions}
            analysisType={selectedAnalysis}
          />
        )}

        {!selectedField && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                เลือก field และประเภทการวิเคราะห์เพื่อเริ่มต้น
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

