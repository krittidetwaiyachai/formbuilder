"use client";

import FormPreview from "@/components/demo/FormPreview";
import DashboardGrid from "@/components/demo/DashboardGrid";
import AnalyticsOverview from "@/components/demo/AnalyticsOverview";
import SubmissionsTable from "@/components/demo/SubmissionsTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Demo Components</h1>
        <p className="text-muted-foreground">
          Preview all demo components with mock data
        </p>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="form">Form Preview</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Grid</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Preview</CardTitle>
              <CardDescription>
                Visual form with all element types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormPreview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Grid</CardTitle>
              <CardDescription>
                User's homepage with form cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardGrid />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsOverview />
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submissions Table</CardTitle>
              <CardDescription>
                Data table with form submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

