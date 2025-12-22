import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { ActivityLog } from "@/types/collaboration";

// GET /api/activity/[id] - Get activity logs for a form
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
    
    const logs = dataStore.getActivityLogs(params.id);
    
    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}

// POST /api/activity/[id] - Create a new activity log
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const form = dataStore.getForm(params.id);
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    const activityLog: ActivityLog = {
      id: body.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      formId: params.id,
      userId: body.userId,
      userName: body.userName,
      userAvatar: body.userAvatar,
      action: body.action,
      target: body.target,
      targetId: body.targetId,
      targetName: body.targetName,
      description: body.description || "",
      timestamp: body.timestamp || new Date().toISOString(),
    };
    
    const log = dataStore.createActivityLog(activityLog);
    
    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity log:", error);
    return NextResponse.json(
      { error: "Failed to create activity log" },
      { status: 500 }
    );
  }
}

