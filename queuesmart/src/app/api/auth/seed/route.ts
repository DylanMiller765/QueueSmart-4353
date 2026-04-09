import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServiceSupabase } from "@/lib/supabase";

// Seeds the database with demo accounts
// Call this once after setting up your Supabase tables
export async function POST() {
  try {
    const supabase = getServiceSupabase();

    const demoUsers = [
      { name: "Admin", email: "admin@queuesmart.com", password: "admin123", role: "admin" },
      { name: "Dylan Miller", email: "user@queuesmart.com", password: "user123", role: "user" },
    ];

    const results = [];

    for (const user of demoUsers) {
      // Check if already exists
      const { data: existing } = await supabase
        .from("user_credentials")
        .select("id")
        .eq("email", user.email)
        .single();

      if (existing) {
        results.push({ email: user.email, status: "already exists" });
        continue;
      }

      const encryptedPassword = await bcrypt.hash(user.password, 10);

      const { data: credentials, error: credError } = await supabase
        .from("user_credentials")
        .insert({
          email: user.email,
          encrypted_password: encryptedPassword,
          role: user.role,
        })
        .select("id")
        .single();

      if (credError) {
        results.push({ email: user.email, status: "error", error: credError.message });
        continue;
      }

      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: credentials!.id,
          full_name: user.name,
          email: user.email,
        });

      if (profileError) {
        results.push({ email: user.email, status: "error", error: profileError.message });
        continue;
      }

      results.push({ email: user.email, status: "created" });
    }

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
