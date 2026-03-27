
import { NextRequest, NextResponse } from "next/server";
import { getServiceById, updateService, deleteService, validateUpdateInput } from "@/lib/serviceStore";
import { ServiceUpdateInput } from "@/lib/serviceStore";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const id = Number(params.id);
    const service = getServiceById(id);
    if (!service) {
      return NextResponse.json({ success: false, error: `Service ${id} not found.` }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: service }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to retrieve service." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const id = Number(params.id);
    if (!getServiceById(id)) {
      return NextResponse.json({ success: false, error: `Service ${id} not found.` }, { status: 404 });
    }
    const body: Partial<ServiceUpdateInput> = await req.json();
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ success: false, error: "Body must contain at least one field." }, { status: 422 });
    }
    const errors = validateUpdateInput(body);
    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 422 });
    }
    const updated = updateService(id, body);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const id = Number(params.id);
    const existing = getServiceById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: `Service ${id} not found.` }, { status: 404 });
    }
    deleteService(id);
    return NextResponse.json({ success: true, data: { message: `Service "${existing.name}" deleted.` } }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete service." }, { status: 500 });
  }
}