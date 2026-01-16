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
    
    return NextResponse.json({ form }, { status: 200 });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const formIndex = dataStore.forms.findIndex((f: Form) => f.id === params.id);
    
    if (formIndex === -1) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    const existingForm = dataStore.forms[formIndex];
    const updatedForm: Form = {
      ...existingForm,
      title: body.title ?? existingForm.title,
      description: body.description ?? existingForm.description,
      status: body.status ?? existingForm.status,
      fields: body.fields ?? existingForm.fields,
      settings: body.settings ?? existingForm.settings,
      updatedAt: new Date().toISOString(),
    };
    
    dataStore.forms[formIndex] = updatedForm;
    
    if (body.userId) {
      const activityLog: ActivityLog = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        formId: params.id,
        userId: body.userId,
        userName: body.userName || "User",
        action: "updated",
        target: "form",
        description: body.changeDescription || "Updated the form",
        timestamp: new Date().toISOString(),
      };
      
      dataStore.activityLogs.push(activityLog);
    }
    
    return NextResponse.json({ form: updatedForm }, { status: 200 });
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formIndex = dataStore.forms.findIndex((f: Form) => f.id === params.id);
    
    if (formIndex === -1) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    dataStore.forms.splice(formIndex, 1);
    
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
