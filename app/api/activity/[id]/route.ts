import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { Form } from "@/types";
import { ActivityLog } from "@/types/collaboration";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const form = dataStore.forms.find((f: Form) => f.id === params.id);
    
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    const logs = dataStore.activityLogs.filter((log: ActivityLog) => log.formId === params.id);
    
    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const form = dataStore.forms.find((f: Form) => f.id === params.id);
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
      action: body.action,
      target: body.target,
      description: body.description || "",
      timestamp: body.timestamp || new Date().toISOString(),
    };
    
    dataStore.activityLogs.push(activityLog);
    
    return NextResponse.json({ log: activityLog }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity log:", error);
    return NextResponse.json(
      { error: "Failed to create activity log" },
      { status: 500 }
    );
  }
}
