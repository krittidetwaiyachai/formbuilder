import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { Form } from "@/types";
import { ActiveEditor } from "@/types/collaboration";

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
    
    const editors = dataStore.activeEditors.filter((e: ActiveEditor) => (e as any).formId === params.id);
    
    return NextResponse.json({ editors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching active editors:", error);
    return NextResponse.json(
      { error: "Failed to fetch active editors" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const form = dataStore.forms.find((f: Form) => f.id === params.id);
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    const editor: ActiveEditor & { formId: string } = {
      formId: params.id,
      userId: body.userId,
      userName: body.userName,
      userColor: body.userColor || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      isActive: true,
      lastSeen: new Date().toISOString(),
    };
    
    const existingIndex = dataStore.activeEditors.findIndex(
      (e: ActiveEditor) => (e as any).formId === params.id && e.userId === body.userId
    );
    
    if (existingIndex >= 0) {
      dataStore.activeEditors[existingIndex] = editor;
    } else {
      dataStore.activeEditors.push(editor as any);
    }
    
    return NextResponse.json({ editor }, { status: 200 });
  } catch (error) {
    console.error("Error updating active editor:", error);
    return NextResponse.json(
      { error: "Failed to update active editor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }
    
    const form = dataStore.forms.find((f: Form) => f.id === params.id);
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    const editorIndex = dataStore.activeEditors.findIndex(
      (e: ActiveEditor) => (e as any).formId === params.id && e.userId === userId
    );
    
    if (editorIndex >= 0) {
      dataStore.activeEditors.splice(editorIndex, 1);
    }
    
    return NextResponse.json(
      { message: "Editor removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing active editor:", error);
    return NextResponse.json(
      { error: "Failed to remove active editor" },
      { status: 500 }
    );
  }
}
