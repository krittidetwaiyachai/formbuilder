import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { Form, FormResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const formId = searchParams.get("formId");
    
    let submissions = dataStore.submissions;
    
    if (formId) {
      submissions = submissions.filter((s: FormResponse) => s.formId === formId);
    }
    
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
    
    const form = dataStore.forms.find((f: Form) => f.id === body.formId);
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    if (form.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Form is not published" },
        { status: 400 }
      );
    }
    
    const userAgent = request.headers.get("user-agent") || "";
    let device: "desktop" | "tablet" | "mobile" = "desktop";
    if (/mobile|android|iphone|ipod/i.test(userAgent)) {
      device = "mobile";
    } else if (/tablet|ipad/i.test(userAgent)) {
      device = "tablet";
    }
    
    const newSubmission: FormResponse = {
      id: body.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      formId: body.formId,
      submittedAt: new Date().toISOString(),
      answers: body.answers || [],
    };
    
    dataStore.submissions.push(newSubmission);
    
    const formIndex = dataStore.forms.findIndex((f: Form) => f.id === body.formId);
    if (formIndex >= 0) {
      dataStore.forms[formIndex] = {
        ...dataStore.forms[formIndex],
        responseCount: (dataStore.forms[formIndex].responseCount || 0) + 1,
      };
    }
    
    return NextResponse.json({ submission: newSubmission }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
