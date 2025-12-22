import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

// POST /api/forms/[id]/view - Increment form view count
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const form = dataStore.getForm(params.id);
    
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    dataStore.incrementFormView(params.id);
    
    const updatedForm = dataStore.getForm(params.id);
    
    return NextResponse.json(
      { form: updatedForm, message: "View count incremented" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}

