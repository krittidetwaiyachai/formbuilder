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
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download, TrendingUp, Award, Hash, Percent, Calendar, List } from "lucide-react";
import { FormSubmission } from "@/types/form";

interface AnalysisRendererProps {
  fieldName: string;
  submissions: FormSubmission[];
  analysisType: string;
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

export default function AnalysisRenderer({
  fieldName,
  submissions,
  analysisType,
}: AnalysisRendererProps) {
  // Calculate field responses
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

  // Timeline data
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
              <h3 className="text-lg font-semibold">Ranking</h3>
              <Badge variant="secondary">{totalResponses} total responses</Badge>
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
                      {response.count} responses ({(response.count / totalResponses * 100).toFixed(1)}%)
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
                <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalResponses}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unique Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueValues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Common</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {fieldResponses[0]?.value || "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {fieldResponses[0]?.count || 0} times
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Count</CardTitle>
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
              <Bar dataKey="count" fill="#8884d8" />
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
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
              <h3 className="text-lg font-semibold">Top 10 Values</h3>
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
                  <div className="text-sm text-muted-foreground mb-1">Value</div>
                  <div className="font-medium mb-2">{response.value}</div>
                  <div className="text-2xl font-bold">{response.count}</div>
                  <div className="text-xs text-muted-foreground">
                    {(response.count / totalResponses * 100).toFixed(1)}% of total
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
              <h3 className="text-lg font-semibold">All Responses</h3>
              <Badge variant="secondary">{totalResponses} responses</Badge>
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
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case "export":
        return (
          <div className="text-center py-8">
            <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Export Data</h3>
            <p className="text-muted-foreground mb-4">
              Export {fieldName} analytics as CSV file
            </p>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        );

      default:
        return <div>Select an analysis type</div>;
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
              {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis
            </CardDescription>
          </div>
          {analysisType !== "export" && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{renderAnalysis()}</CardContent>
    </Card>
  );
}

