"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Monitor, Tablet, Smartphone } from "lucide-react";
import { mockSubmissions, mockForms } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const submission = mockSubmissions.find((s) => s.id === params.id);
  const form = submission ? mockForms.find((f) => f.id === submission.formId) : null;

  if (!submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Submission not found</p>
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

  const deviceIcon = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  }[submission.device || "desktop"] || Monitor;

  const DeviceIcon = deviceIcon;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Submission Details</h1>
            <p className="text-muted-foreground">
              {form?.title || "Form Response"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        { }
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Data</CardTitle>
              <CardDescription>All answers from this submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(submission.data).map(([key, value]) => (
                  <div key={key} className="border-b pb-4 last:border-0">
                    <div className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-base">
                      {Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-2">
                          {value.map((item, idx) => (
                            <Badge key={idx} variant="secondary">
                              {String(item)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {String(value)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        { }
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Submitted At
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(submission.submittedAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Device
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DeviceIcon className="h-4 w-4" />
                  <span className="capitalize">{submission.device || "Unknown"}</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Submission ID
                </div>
                <div className="text-sm font-mono text-xs">
                  {submission.id}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/analytics/${submission.formId}`)}
              >
                View All Responses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

