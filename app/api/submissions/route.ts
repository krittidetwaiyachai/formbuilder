import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "../../../lib/data-store";
import { FormSubmission } from "../../../types/form";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const formId = searchParams.get("formId");
    
    const submissions = dataStore.getAllSubmissions(formId || undefined);
    
    return NextResponse.json({ submissions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.formId) {
      return NextResponse.json(
        { error: "formId is required" },
        { status: 400 }
      );
    }
    
    const form = dataStore.getForm(body.formId);
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    if (form.status !== "published") {
      return NextResponse.json(
        { error: "Form is not published" },
        { status: 400 }
      );
    }
    
    const newSubmission: FormSubmission = {
      id: body.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      formId: body.formId,
      submittedAt: new Date().toISOString(),
      data: body.data || {},
    };
    
    dataStore.createSubmission(newSubmission);
    
    return NextResponse.json({ submission: newSubmission }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
