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
    
    return NextResponse.json({ submissions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch form submissions" },
      { status: 500 }
    );
  }
}
