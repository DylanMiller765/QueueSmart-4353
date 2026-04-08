import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServiceSupabase } from "@/lib/supabase";
import { validateEmail, validatePassword, validateName } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = "user" } = body;

    // Validate inputs
    const nameErr = validateName(name || "");
    if (nameErr) return NextResponse.json({ success: false, error: nameErr }, { status: 400 });

    const emailErr = validateEmail(email || "");
    if (emailErr) return NextResponse.json({ success: false, error: emailErr }, { status: 400 });

    const passErr = validatePassword(password || "");
    if (passErr) return NextResponse.json({ success: false, error: passErr }, { status: 400 });

    if (role !== "user" && role !== "admin") {
      return NextResponse.json({ success: false, error: "Invalid role." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("user_credentials")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Insert into user_credentials
    const { data: credentials, error: credError } = await supabase
      .from("user_credentials")
      .insert({
        email: normalizedEmail,
        encrypted_password: encryptedPassword,
        role,
      })
      .select("id, email, role")
      .single();

    if (credError) {
      console.error("Error creating credentials:", credError);
      return NextResponse.json(
        { success: false, error: "Failed to create account." },
        { status: 500 }
      );
    }

    // Insert into user_profiles
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: credentials.id,
        full_name: trimmedName,
        email: normalizedEmail,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Clean up the credentials if profile creation fails
      await supabase.from("user_credentials").delete().eq("id", credentials.id);
      return NextResponse.json(
        { success: false, error: "Failed to create profile." },
        { status: 500 }
      );
    }

    const user = {
      id: credentials.id,
      email: credentials.email,
      name: trimmedName,
      role: credentials.role,
    };

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
