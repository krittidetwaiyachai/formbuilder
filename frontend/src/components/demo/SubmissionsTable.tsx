"use client";

import { MOCK_SUBMISSIONS } from "@/lib/mock-data";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MockSubmission {
  id: string;
  submittedAt: string;
  device: string;
  data: Record<string, string>;
}
import { Eye } from "lucide-react";

export default function SubmissionsTable() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get all unique keys from submission data to create dynamic columns
  const getAllDataKeys = (submissions: MockSubmission[]): string[] => {
    const keysSet = new Set<string>();
    submissions.forEach((submission) => {
      Object.keys(submission.data).forEach((key) => keysSet.add(key));
    });
    return Array.from(keysSet).sort();
  };

  const dataKeys = getAllDataKeys(MOCK_SUBMISSIONS as unknown as MockSubmission[]);

  // Format key for display (capitalize, add spaces)
  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Submitted At</TableHead>
            <TableHead>Status</TableHead>
            {dataKeys.map((key) => (
              <TableHead key={key}>{formatKey(key)}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_SUBMISSIONS.length > 0 ? (
            (MOCK_SUBMISSIONS as unknown as MockSubmission[]).map((submission: MockSubmission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">
                  {formatDate(submission.submittedAt)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {submission.device || "Unknown"}
                  </Badge>
                </TableCell>
                {dataKeys.map((key) => (
                  <TableCell key={key}>
                    {submission.data[key] !== undefined
                      ? String(submission.data[key])
                      : "-"}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={dataKeys.length + 3}
                className="text-center py-8 text-muted-foreground"
              >
                No submissions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

