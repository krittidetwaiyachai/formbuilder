import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

// GET /api/forms/[id] - Get a specific form
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const form = dataStore.getForm(params.id);
    
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ form }, { status: 200 });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}

// PUT /api/forms/[id] - Update a form
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updated = dataStore.updateForm(params.id, {
      title: body.title,
      description: body.description,
      status: body.status,
      elements: body.elements,
      theme: body.theme,
      settings: body.settings,
    });
    
    if (!updated) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    // Create activity log
    if (body.userId) {
      const { ActivityLog } = await import("@/types/collaboration");
      
      const activityLog: ActivityLog = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        formId: params.id,
        userId: body.userId,
        userName: body.userName || "User",
        action: "updated",
        target: "form",
        description: body.description || "Updated the form",
        timestamp: new Date().toISOString(),
      };
      
      dataStore.createActivityLog(activityLog);
    }
    
    return NextResponse.json({ form: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = dataStore.deleteForm(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Form deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Failed to delete form" },
      { status: 500 }
    );
  }
}

