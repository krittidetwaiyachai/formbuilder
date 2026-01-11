import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormSchema } from "@/types/form";
import { Calendar, Eye, FileText, MessageSquare, BarChart3, Users, Clock } from "lucide-react";
import { mockActiveEditors } from "@/lib/mock-data";

interface FormCardProps {
  form: FormSchema;
}

export default function FormCard({ form }: FormCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={form.status === "published" ? "default" : "secondary"}>
            {form.status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>
        
        {/* Active Editors */}
        {(() => {
          const activeEditors = mockActiveEditors[form.id] || [];
          if (activeEditors.length > 0) {
            return (
              <div className="mb-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {activeEditors.length} {activeEditors.length === 1 ? "person" : "people"} editing
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeEditors.slice(0, 3).map((editor) => (
                    <div
                      key={editor.userId}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                      style={{ backgroundColor: editor.userColor }}
                      title={editor.userName}
                    >
                      {editor.userName.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {activeEditors.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                      +{activeEditors.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{form.responseCount || 0} responses</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{form.viewCount || 0} views</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Updated {formatDate(form.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button asChild variant="outline" className="flex-1 justify-center !text-xl font-semibold">
            <Link href={`/builder/${form.id}`} className="flex items-center justify-center gap-3" style={{ fontSize: '1.25rem' }}>
              <FileText className="h-8 w-8" style={{ width: '2rem', height: '2rem' }} />
              Edit
            </Link>
          </Button>
          <Button asChild variant="default" className="flex-1 justify-center !text-xl font-semibold">
            <Link href={`/preview/${form.id}`} className="flex items-center justify-center gap-3" style={{ fontSize: '1.25rem' }}>
              <Eye className="h-8 w-8" style={{ width: '2rem', height: '2rem' }} />
              Preview
            </Link>
          </Button>
        </div>
        <div className="flex gap-2 w-full">
          <Button asChild variant="outline" className="flex-1 justify-center !text-xl font-semibold">
            <Link href={`/analytics/${form.id}`} className="flex items-center justify-center gap-3" style={{ fontSize: '1.25rem' }}>
              <BarChart3 className="h-8 w-8" style={{ width: '2rem', height: '2rem' }} />
              Analytics
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 justify-center !text-xl font-semibold">
            <Link href={`/activity/${form.id}`} className="flex items-center justify-center gap-3" style={{ fontSize: '1.25rem' }}>
              <Clock className="h-8 w-8" style={{ width: '2rem', height: '2rem' }} />
              Activity
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

