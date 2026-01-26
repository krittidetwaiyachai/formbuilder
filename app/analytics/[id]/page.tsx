"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockForms, mockSubmissions } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Eye, MessageSquare, TrendingDown, TrendingUp, List, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const form = mockForms.find((f) => f.id === params.id);
  const submissions = mockSubmissions.filter((s) => s.formId === params.id);

  
  const viewsData = [
    { date: "Jan 15", views: 45, submissions: 12 },
    { date: "Jan 16", views: 52, submissions: 15 },
    { date: "Jan 17", views: 48, submissions: 10 },
    { date: "Jan 18", views: 61, submissions: 18 },
    { date: "Jan 19", views: 55, submissions: 14 },
    { date: "Jan 20", views: 67, submissions: 20 },
    { date: "Jan 21", views: 72, submissions: 22 },
  ];

  const deviceData = [
    { name: "Desktop", value: 45, color: "#8884d8" },
    { name: "Mobile", value: 30, color: "#82ca9d" },
    { name: "Tablet", value: 25, color: "#ffc658" },
  ];

  const totalViews = form?.viewCount || 0;
  const totalSubmissions = form?.responseCount || 0;
  const submissionRate = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : "0";
  const bounceRate = "32.5"; 

  const latestSubmissions = submissions.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {form?.title || "Analytics"}
        </h1>
        <p className="text-muted-foreground">
          Track your form performance and insights
        </p>
      </div>

      { }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submission Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSubmissions} total submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Users who left without submitting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed submissions
            </p>
          </CardContent>
        </Card>
      </div>

      { }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        { }
        <Card>
          <CardHeader>
            <CardTitle>Views vs Submissions</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#8884d8" name="Views" />
                <Bar dataKey="submissions" fill="#82ca9d" name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        { }
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Submissions by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      { }
      <Tabs defaultValue="submissions" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="submissions">
              <List className="h-4 w-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="fields">
              <BarChart3 className="h-4 w-4 mr-2" />
              By Field
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            onClick={() => router.push(`/responses/${params.id}`)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Field Analytics
          </Button>
        </div>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Latest Submissions</CardTitle>
              <CardDescription>Most recent form responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Device
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Data
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestSubmissions.length > 0 ? (
                      latestSubmissions.map((submission) => (
                        <tr key={submission.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className="capitalize">{submission.device || "Unknown"}</span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(submission.data).slice(0, 3).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs"
                                >
                                  <span className="font-medium">{key}:</span>{" "}
                                  <span className="ml-1">{String(value)}</span>
                                </span>
                              ))}
                              {Object.keys(submission.data).length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{Object.keys(submission.data).length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/submission/${submission.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 px-4 text-center text-sm text-muted-foreground">
                          No submissions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields">
          <Card>
            <CardHeader>
              <CardTitle>Field Summary</CardTitle>
              <CardDescription>Quick overview of responses by field</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const fieldSummary: Record<string, { total: number; unique: number; topValue: any }> = {};
                
                submissions.forEach((submission) => {
                  Object.entries(submission.data).forEach(([key, value]) => {
                    if (!fieldSummary[key]) {
                      fieldSummary[key] = { total: 0, unique: 0, topValue: null };
                    }
                    fieldSummary[key].total += 1;
                  });
                });

                
                Object.keys(fieldSummary).forEach((key) => {
                  const valueCounts: Record<string, number> = {};
                  submissions.forEach((submission) => {
                    const value = (submission.data as Record<string, any>)[key];
                    const values = Array.isArray(value) ? value : [value];
                    values.forEach((v) => {
                      valueCounts[String(v)] = (valueCounts[String(v)] || 0) + 1;
                    });
                  });
                  fieldSummary[key].unique = Object.keys(valueCounts).length;
                  const topEntry = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0];
                  fieldSummary[key].topValue = topEntry ? { value: topEntry[0], count: topEntry[1] } : null;
                });

                return (
                  <div className="space-y-4">
                    {Object.entries(fieldSummary).map(([fieldName, summary]) => (
                      <div key={fieldName} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium capitalize">
                            {fieldName.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {summary.total} responses, {summary.unique} unique values
                          </div>
                        </div>
                        {summary.topValue && (
                          <div className="text-sm text-muted-foreground">
                            Most common: <span className="font-medium">{summary.topValue.value}</span> (
                            {summary.topValue.count} times, {((summary.topValue.count / summary.total) * 100).toFixed(1)}%)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
