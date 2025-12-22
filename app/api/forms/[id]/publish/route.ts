import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

// POST /api/forms/[id]/publish - Publish or unpublish a form
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { publish, userId, userName } = body;
    
    const form = dataStore.getForm(params.id);
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    const newStatus = publish ? "published" : "draft";
    const updated = dataStore.updateForm(params.id, {
      status: newStatus,
    });
    
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update form status" },
        { status: 500 }
      );
    }
    
    // Create activity log
    if (userId) {
      const { ActivityLog } = await import("@/types/collaboration");
      
      const activityLog: ActivityLog = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        formId: params.id,
        userId,
        userName: userName || "User",
        action: publish ? "published" : "unpublished",
        target: "form",
        description: publish ? "Published the form" : "Unpublished the form",
        timestamp: new Date().toISOString(),
      };
      
      dataStore.createActivityLog(activityLog);
    }
    
    return NextResponse.json(
      { form: updated, message: `Form ${publish ? "published" : "unpublished"} successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error publishing form:", error);
    return NextResponse.json(
      { error: "Failed to publish form" },
      { status: 500 }
    );
  }
}

