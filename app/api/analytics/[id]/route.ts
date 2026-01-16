import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { Form, FormResponse } from "@/types";

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
    
    const submissions = dataStore.submissions.filter((s: FormResponse) => s.formId === params.id);
    
    const analytics = {
      totalResponses: submissions.length,
      viewCount: form.viewCount || 0,
      conversionRate: form.viewCount ? ((submissions.length / form.viewCount) * 100).toFixed(1) : 0,
      submissions: submissions,
    };
    
    return NextResponse.json({ analytics }, { status: 200 });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
