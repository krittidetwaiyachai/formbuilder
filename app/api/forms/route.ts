import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { Form } from "@/types";
import { ActivityLog } from "@/types/collaboration";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    
    let forms = dataStore.forms;
    
    if (status && (status === "published" || status === "draft")) {
      forms = forms.filter((form: Form) => form.status === status.toUpperCase());
    }
    
    if (search) {
      const query = search.toLowerCase();
      forms = forms.filter(
        (form: Form) =>
          form.title.toLowerCase().includes(query) ||
          form.description?.toLowerCase().includes(query)
      );
    }
    
    return NextResponse.json({ forms }, { status: 200 });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newForm: Partial<Form> = {
      id: body.id || `form-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      title: body.title || "Untitled Form",
      description: body.description || "",
      status: body.status || "DRAFT",
      fields: body.fields || [],
      settings: body.settings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      viewCount: 0,
      isQuiz: body.isQuiz || false,
      createdById: body.userId || "system",
    };
    
    dataStore.forms.push(newForm as Form);
    
    if (body.userId) {
      const activityLog: ActivityLog = {
        id: `log_${Date.now()}`,
        userId: body.userId,
        userName: body.userName || "User",
        action: "created",
        target: "form",
        description: "Created the form",
        timestamp: new Date().toISOString(),
        formId: newForm.id!
      };
      
      dataStore.activityLogs.push(activityLog);
    }
    
    return NextResponse.json({ form: newForm }, { status: 201 });
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
}
