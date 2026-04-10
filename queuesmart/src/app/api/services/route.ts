import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET all services
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("service")
      .select("*")
      .order("service_id", { ascending: true });

    if (error) {
      console.error("Error fetching services:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve services." },
      { status: 500 }
    );
  }
}

// POST new service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { service_name, description, expected_duration, priority_level } = body;

    if (!service_name) {
      return NextResponse.json(
        { success: false, error: "service_name is required" },
        { status: 422 }
      );
    }

    const { data, error } = await supabase
      .from("service")
      .insert([
        {
          service_name,
          description,
          expected_duration,
          priority_level,
          is_active: true
        }
      ])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data[0] },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }
}