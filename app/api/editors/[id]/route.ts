import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { ActiveEditor } from "@/types/collaboration";

// GET /api/editors/[id] - Get active editors for a form
export async function GET(
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
    
    const editors = dataStore.getActiveEditors(params.id);
    
    return NextResponse.json({ editors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching active editors:", error);
    return NextResponse.json(
      { error: "Failed to fetch active editors" },
      { status: 500 }
    );
  }
}

// POST /api/editors/[id] - Update or add an active editor
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const form = dataStore.getForm(params.id);
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    const editor: ActiveEditor = {
      userId: body.userId,
      userName: body.userName,
      userAvatar: body.userAvatar,
      userColor: body.userColor || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      isActive: true,
      lastSeen: new Date().toISOString(),
    };
    
    dataStore.updateActiveEditor(params.id, editor);
    
    return NextResponse.json({ editor }, { status: 200 });
  } catch (error) {
    console.error("Error updating active editor:", error);
    return NextResponse.json(
      { error: "Failed to update active editor" },
      { status: 500 }
    );
  }
}

// DELETE /api/editors/[id] - Remove an active editor
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
    
    const form = dataStore.getForm(params.id);
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    dataStore.removeActiveEditor(params.id, userId);
    
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

