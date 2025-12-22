import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { FormSchema } from "@/types/form";

// GET /api/forms - Get all forms
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    
    let forms = dataStore.getAllForms();
    
    // Filter by status
    if (status && (status === "published" || status === "draft")) {
      forms = forms.filter(form => form.status === status);
    }
    
    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      forms = forms.filter(
        form =>
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

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newForm: FormSchema = {
      id: body.id || `form-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      title: body.title || "Untitled Form",
      description: body.description || "",
      status: body.status || "draft",
      elements: body.elements || [],
      theme: body.theme,
      settings: body.settings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      viewCount: 0,
    };
    
    const form = dataStore.createForm(newForm);
    
    // Create activity log
    if (body.userId) {
      const { dataStore: store } = await import("@/lib/data-store");
      const { ActivityLog } = await import("@/types/collaboration");
      
      const activityLog: ActivityLog = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        formId: form.id,
        userId: body.userId,
        userName: body.userName || "User",
        action: "created",
        target: "form",
        description: "Created the form",
        timestamp: new Date().toISOString(),
      };
      
      store.createActivityLog(activityLog);
    }
    
    return NextResponse.json({ form }, { status: 201 });
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
}

