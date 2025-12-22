import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { FormSubmission } from "@/types/form";

// GET /api/submissions - Get all submissions (optionally filtered by formId)
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

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.formId) {
      return NextResponse.json(
        { error: "formId is required" },
        { status: 400 }
      );
    }
    
    // Check if form exists
    const form = dataStore.getForm(body.formId);
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    // Check if form is published
    if (form.status !== "published") {
      return NextResponse.json(
        { error: "Form is not published" },
        { status: 400 }
      );
    }
    
    // Detect device type from user agent
    const userAgent = request.headers.get("user-agent") || "";
    let device: "desktop" | "tablet" | "mobile" = "desktop";
    if (/mobile|android|iphone|ipod/i.test(userAgent)) {
      device = "mobile";
    } else if (/tablet|ipad/i.test(userAgent)) {
      device = "tablet";
    }
    
    const newSubmission: FormSubmission = {
      id: body.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      formId: body.formId,
      data: body.data || {},
      submittedAt: new Date().toISOString(),
      device: body.device || device,
    };
    
    const submission = dataStore.createSubmission(newSubmission);
    
    // Increment form view count (submission implies a view)
    dataStore.incrementFormView(body.formId);
    
    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}

