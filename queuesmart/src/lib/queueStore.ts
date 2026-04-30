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
// ─── queue entries (people in queues) ───────────────────────────────────────
// for reporting + smart wait time

export interface QueueEntry {
  id: string;
  user_id: string;
  service_id: number;
  service_name: string;
  position: number;
  status: "waiting" | "serving" | "completed" | "cancelled" | "no-show";
  joined_at: string;
  served_at: string | null;
  completed_at: string | null;
  wait_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

// who's currently in line for a service
export async function getActiveEntriesByService(
  serviceId: number
): Promise<QueueEntry[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("service_id", serviceId)
    .in("status", ["waiting", "serving"])
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// add a user to the queue, position is just next in line
export async function joinQueue(input: {
  user_id: string;
  service_id: number;
  service_name: string;
}): Promise<QueueEntry> {
  const supabase = getServiceSupabase();

  // figure out their spot
  const active = await getActiveEntriesByService(input.service_id);
  const nextPosition = active.length + 1;

  const { data, error } = await supabase
    .from("queue_entries")
    .insert({
      user_id: input.user_id,
      service_id: input.service_id,
      service_name: input.service_name.trim(),
      position: nextPosition,
      status: "waiting",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// user leaves on their own
export async function leaveQueue(entryId: string): Promise<QueueEntry | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("queue_entries")
    .update({
      status: "cancelled",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", entryId)
    .select()
    .single();

  if (error) return null;
  return data;
}

// admin serves next person, also figures out how long they waited
export async function serveNext(serviceId: number): Promise<QueueEntry | null> {
  const supabase = getServiceSupabase();

  // grab the next person waiting
  const { data: nextEntry, error: fetchError } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("service_id", serviceId)
    .eq("status", "waiting")
    .order("position", { ascending: true })
    .limit(1)
    .single();

  if (fetchError || !nextEntry) return null;

  // wait time in minutes
  const joinedAt = new Date(nextEntry.joined_at).getTime();
  const now = Date.now();
  const waitMinutes = Math.round((now - joinedAt) / 60000);

  const { data, error } = await supabase
    .from("queue_entries")
    .update({
      status: "completed",
      served_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      wait_time_minutes: waitMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", nextEntry.id)
    .select()
    .single();

  if (error) return null;
  return data;
}

// a user's own queue history
export async function getEntriesByUser(userId: string): Promise<QueueEntry[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// all entries, used for the report stuff
export async function getAllEntries(): Promise<QueueEntry[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("queue_entries")
    .select("*")
    .order("joined_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}