"use client";

import { MOCK_USER_FORMS } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, BarChart3, Plus } from "lucide-react";
import { FormSchema } from "@/types/form";

export default function DashboardGrid() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Create New Form Card */}
      <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer bg-gray-50/50">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-1">Create New Form</h3>
              <p className="text-sm text-muted-foreground">
                Start building a new form from scratch
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Cards */}
      {MOCK_USER_FORMS.map((form: FormSchema) => (
        <Card
          key={form.id}
          className="hover:shadow-lg transition-shadow flex flex-col"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{form.title}</CardTitle>
                {form.description && (
                  <CardDescription className="line-clamp-2">
                    {form.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={form.status === "published" ? "default" : "secondary"}
                className={
                  form.status === "published"
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }
              >
                {form.status === "published" ? "Published" : "Draft"}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visits:</span>
                <span className="font-medium">{form.viewCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submissions:</span>
                <span className="font-medium">
                  {form.responseCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">{formatDate(form.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="default" className="flex-1" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Results
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

