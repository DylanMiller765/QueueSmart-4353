import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServiceSupabase } from "@/lib/supabase";
import { validateEmail, validatePassword } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate inputs
    const emailErr = validateEmail(email || "");
    if (emailErr) return NextResponse.json({ success: false, error: emailErr }, { status: 400 });

    const passErr = validatePassword(password || "");
    if (passErr) return NextResponse.json({ success: false, error: passErr }, { status: 400 });

    const supabase = getServiceSupabase();
    const normalizedEmail = email.toLowerCase().trim();

    // Look up user credentials
    const { data: credentials, error: credError } = await supabase
      .from("user_credentials")
      .select("id, email, encrypted_password, role")
      .eq("email", normalizedEmail)
      .single();

    if (credError || !credentials) {
      return NextResponse.json(
        { success: false, error: "No account found with this email." },
        { status: 401 }
      );
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, credentials.encrypted_password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // Get user profile
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
