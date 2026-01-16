import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { Form } from "@/types";
import { ActivityLog } from "@/types/collaboration";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { publish, userId, userName } = body;
    
    const formIndex = dataStore.forms.findIndex((f: Form) => f.id === params.id);
    if (formIndex === -1) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    const newStatus = publish ? "PUBLISHED" : "DRAFT";
    dataStore.forms[formIndex] = {
      ...dataStore.forms[formIndex],
      status: newStatus as any,
      updatedAt: new Date().toISOString(),
    };
    
    if (userId) {
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
      
      dataStore.activityLogs.push(activityLog);
    }
    
    return NextResponse.json(
      { form: dataStore.forms[formIndex], message: `Form ${publish ? "published" : "unpublished"} successfully` },
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
