import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // Get credentials
    const { data: credentials, error: credError } = await supabase
      .from("user_credentials")
      .select("id, email, role")
      .eq("id", userId)
      .single();

    if (credError || !credentials) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Get profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name, phone, preferences")
      .eq("user_id", credentials.id)
      .single();

    const user = {
      id: credentials.id,
      email: credentials.email,
      name: profile?.full_name || "",
      role: credentials.role,
      phone: profile?.phone || null,
      preferences: profile?.preferences || {},
    };

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
