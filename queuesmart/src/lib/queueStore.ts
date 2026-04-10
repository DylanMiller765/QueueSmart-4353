import { getServiceSupabase } from "@/lib/supabase";

export interface Queue {
  id: string;
  service_id: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ─── Validation ─────────────────────────────────────────────────────────────
export function validateQueueInput(input: {
  service_id?: string;
  status?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.service_id || !input.service_id.trim()) {
    errors.push({ field: "service_id", message: "service_id is required" });
  } else if (input.service_id.length > 100) {
    errors.push({ field: "service_id", message: "service_id must be under 100 characters" });
  }

  if (input.status !== undefined && !["open", "closed"].includes(input.status)) {
    errors.push({ field: "status", message: "status must be 'open' or 'closed'" });
  }

  return errors;
}

export function validateUpdateInput(input: {
  status?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.status === undefined) {
    errors.push({ field: "status", message: "status is required" });
  } else if (!["open", "closed"].includes(input.status)) {
    errors.push({ field: "status", message: "status must be 'open' or 'closed'" });
  }

  return errors;
}

// ─── Database Operations ─────────────────────────────────────────────────────
export async function getAllQueues(): Promise<Queue[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("queue")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQueueByServiceId(serviceId: string): Promise<Queue | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("queue")
    .select("*")
    .eq("service_id", serviceId)
    .single();

  if (error) return null;
  return data;
}

export async function createQueue(input: {
  service_id: string;
  status?: "open" | "closed";
}): Promise<Queue> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("queue")
    .insert({
      service_id: input.service_id.trim(),
      status: input.status ?? "open",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateQueueStatus(
  id: string,
  status: "open" | "closed"
): Promise<Queue | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("queue")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deleteQueue(id: string): Promise<boolean> {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("queue")
    .delete()
    .eq("id", id);

  return !error;
}