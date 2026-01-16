import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { Form } from "@/types";

export async function POST(
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
    
    dataStore.forms[formIndex] = {
      ...dataStore.forms[formIndex],
      viewCount: (dataStore.forms[formIndex].viewCount || 0) + 1,
    };
    
    return NextResponse.json(
      { form: dataStore.forms[formIndex], message: "View count incremented" },
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
