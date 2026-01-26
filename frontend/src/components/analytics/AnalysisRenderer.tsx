"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FormSubmission {
  data: Record<string, any>;
  submittedAt: string;
}

interface AnalysisRendererProps {
  fieldName: string;
  submissions: FormSubmission[];
  analysisType: string;
}


export default function AnalysisRenderer({
  fieldName,
  submissions,
  analysisType,
}: AnalysisRendererProps) {
  const { t } = useTranslation();

  
  const fieldResponses: { value: any; count: number }[] = [];
  const valueCounts: Record<string, number> = {};

  submissions.forEach((submission) => {
    const value = submission.data[fieldName];
    if (value !== undefined) {
      const values = Array.isArray(value) ? value : [value];
      values.forEach((val) => {
        const key = String(val);
        valueCounts[key] = (valueCounts[key] || 0) + 1;
      });
    }
  });

  Object.entries(valueCounts).forEach(([value, count]) => {
    fieldResponses.push({ value, count });
  });

  fieldResponses.sort((a, b) => b.count - a.count);

  const totalResponses = submissions.length;
  const uniqueValues = fieldResponses.length;

  
  const timelineData = submissions
    .map((submission) => ({
      date: new Date(submission.submittedAt).toLocaleDateString(),
      value: String(submission.data[fieldName] || ""),
    }))
    .reduce((acc, item) => {
      const existing = acc.find((a) => a.date === item.date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ date: item.date, count: 1 });
      }
      return acc;
    }, [] as Array<{ date: string; count: number }>)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleExport = () => {
    const csv = [
      ["Field", "Value", "Count", "Percentage"],
      ...fieldResponses.map((r) => [
        fieldName,
        r.value,
        r.count,
        ((r.count / totalResponses) * 100).toFixed(2) + "%",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fieldName}_analytics.csv`;
    a.click();
  };

  const renderAnalysis = () => {
    switch (analysisType) {
      case "ranking":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('analytics.analysis.ranking')}</h3>
              <Badge variant="secondary">{totalResponses} {t('analytics.total_responses_count')}</Badge>
            </div>
            {fieldResponses.map((response, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{response.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {response.count} {t('analytics.times')} ({(response.count / totalResponses * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">{response.count}</Badge>
              </div>
            ))}
          </div>
        );

      case "statistics":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('analytics.total_responses_count')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalResponses}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('analytics.unique_values')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueValues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('analytics.most_common')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {fieldResponses[0]?.value || "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {fieldResponses[0]?.count || 0} {t('analytics.times')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('analytics.average_count')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {uniqueValues > 0 ? (totalResponses / uniqueValues).toFixed(1) : 0}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "barChart":
        const barData = fieldResponses.slice(0, 10).map((r) => ({
          value: String(r.value).substring(0, 20),
          count: r.count,
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="value"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name={t('analytics.count')} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pieChart":
        const pieData = fieldResponses.slice(0, 8).map((r) => ({
          name: String(r.value).substring(0, 15),
          value: r.count,
        }));
        const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00", "#ff00ff", "#00ffff", "#ffff00"];
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case "topValues":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('analytics.analysis.topvalues')} (Top 10)</h3>
            </div>
            {fieldResponses.slice(0, 10).map((response, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{response.value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {(response.count / totalResponses * 100).toFixed(1)}%
                  </span>
                  <Badge>{response.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        );

      case "percentage":
        return (
          <div className="space-y-3">
            {fieldResponses.map((response, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{response.value}</span>
                  <span className="text-muted-foreground">
                    {response.count} ({(response.count / totalResponses * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(response.count / totalResponses) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "count":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fieldResponses.map((response, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">{t('analytics.value')}</div>
                  <div className="font-medium mb-2">{response.value}</div>
                  <div className="text-2xl font-bold">{response.count}</div>
                  <div className="text-xs text-muted-foreground">
                    {(response.count / totalResponses * 100).toFixed(1)}% {t('analytics.of_total')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "allResponses":
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('analytics.analysis.allresponses')}</h3>
              <Badge variant="secondary">{totalResponses} {t('analytics.total_responses_count')}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {submissions.map((submission, idx) => {
                const value = submission.data[fieldName];
                return (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </Badge>
                );
              })}
            </div>
          </div>
        );

      case "timeline":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} name={t('analytics.count')}/>
            </LineChart>
          </ResponsiveContainer>
        );

      case "export":
        return (
          <div className="text-center py-8">
            <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('analytics.export')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('analytics.export_desc', { field: fieldName })}
            </p>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t('analytics.download_csv')}
            </Button>
          </div>
        );

      default:
        return <div>{t('analytics.select_analysis_type')}</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="capitalize">
              {fieldName.replace(/([A-Z])/g, " $1").trim()}
            </CardTitle>
            <CardDescription>
              {t(`analytics.analysis.${analysisType}`) || analysisType} {t('analytics.field_analytics')}
            </CardDescription>
          </div>
          {analysisType !== "export" && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t('analytics.analysis.export')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{renderAnalysis()}</CardContent>
    </Card>
  );
}

