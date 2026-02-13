import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "../../../lib/data-store";
import { FormSchema, FormElement, FormSettings } from "../../../types/form";
import { ActivityLog } from "../../../types/collaboration";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let forms = dataStore.getAllForms();

    if (status && (status === "published" || status === "draft")) {
      // Note: status in URL might be lowercase, FormSchema status is 'draft'|'published'
      forms = forms.filter((form: FormSchema) => form.status === status);
    }

    if (search) {
      const query = search.toLowerCase();
      forms = forms.filter(
        (form: FormSchema) =>
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

    const newForm: FormSchema = {
      id: body.id || `form-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      title: body.title || "Untitled Form",
      description: body.description || "",
      status: body.status || "draft",
      elements: (body.fields as FormElement[]) || [],
      settings: body.settings as FormSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      viewCount: 0,
      isQuiz: body.isQuiz || false,
      createdById: body.userId || "system",
    };

    dataStore.createForm(newForm);

    if (body.userId) {
      const activityLog: ActivityLog = {
        id: `log_${Date.now()}`,
        userId: body.userId,
        userName: body.userName || "User",
        action: "created",
        target: "form",
        description: "Created the form",
        timestamp: new Date().toISOString(),
        formId: newForm.id
      };

      dataStore.createActivityLog(activityLog);
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
