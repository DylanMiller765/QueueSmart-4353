import { NextRequest, NextResponse } from "next/server";
import { getAllServices, createService, validateServiceInput } from "@/lib/serviceStore";
import { ServiceInput } from "@/lib/serviceStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    const services = getAllServices(activeOnly);
    return NextResponse.json({ success: true, data: services }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to retrieve services." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<ServiceInput> = await req.json();
    const errors = validateServiceInput(body);
    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 422 });
    }
    const newService = createService(body as ServiceInput);
    return NextResponse.json({ success: true, data: newService }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }
}