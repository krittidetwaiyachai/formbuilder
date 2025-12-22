"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ActivityLog from "@/components/builder/ActivityLog";
import { mockForms, mockActivityLogs } from "@/lib/mock-data";

export default function ActivityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const form = mockForms.find((f) => f.id === params.id);
  const activityLogs = mockActivityLogs.filter((log) => log.formId === params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Activity Log - {form?.title || "Form"}
          </h1>
          <p className="text-muted-foreground">
            View all changes and activities for this form
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ActivityLog logs={activityLogs} maxItems={50} />
      </div>
    </div>
  );
}

