import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

// GET /api/analytics/[id] - Get analytics data for a form
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
    
    const analytics = dataStore.getAnalyticsData(params.id);
    
    if (!analytics) {
      return NextResponse.json(
        { error: "Failed to generate analytics" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ analytics }, { status: 200 });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

