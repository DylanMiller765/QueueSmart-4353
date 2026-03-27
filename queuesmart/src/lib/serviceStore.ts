// Service Management — In Memory Store

export type PriorityLevel = "low" | "medium" | "high";

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  priority: PriorityLevel;
  isActive: boolean;
}

export interface ServiceInput {
  name: string;
  description: string;
  duration: number;
  priority: PriorityLevel;
}

export interface ServiceUpdateInput {
  name?: string;
  description?: string;
  duration?: number;
  priority?: PriorityLevel;
  isActive?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Seed data 
const seedServices: Service[] = [
  { id: 1, name: "Customer Support", description: "General customer queries and issue resolution", duration: 15, priority: "high", isActive: true },
  { id: 2, name: "Technical Assistance", description: "Hardware and software technical support", duration: 30, priority: "medium", isActive: true },
  { id: 3, name: "Billing Inquiry", description: "Invoice, payment, and billing questions", duration: 10, priority: "low", isActive: true },
];

// Global store (persists across Next.js hot reloads in dev)
const g = global as typeof global & { _services?: Service[]; _serviceCounter?: number };
if (!g._services) g._services = [...seedServices];
if (!g._serviceCounter) g._serviceCounter = 10;

const getStore = (): Service[] => g._services!;

// ID generator 
export function generateId(): number {
  g._serviceCounter! += 1;
  return g._serviceCounter!;
}

//  Validation 
const VALID_PRIORITIES: PriorityLevel[] = ["low", "medium", "high"];

export function validateServiceInput(input: Partial<ServiceInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || typeof input.name !== "string" || input.name.trim() === "") {
    errors.push({ field: "name", message: "Service name is required." });
  } else if (input.name.trim().length < 2) {
    errors.push({ field: "name", message: "Service name must be at least 2 characters." });
  } else if (input.name.trim().length > 100) {
    errors.push({ field: "name", message: "Service name must be 100 characters or fewer." });
  }

  if (!input.description || typeof input.description !== "string" || input.description.trim() === "") {
    errors.push({ field: "description", message: "Description is required." });
  } else if (input.description.trim().length > 500) {
    errors.push({ field: "description", message: "Description must be 500 characters or fewer." });
  }

  if (input.duration === undefined || input.duration === null) {
    errors.push({ field: "duration", message: "Duration is required." });
  } else if (typeof input.duration !== "number" || isNaN(input.duration)) {
    errors.push({ field: "duration", message: "Duration must be a number." });
  } else if (!Number.isInteger(input.duration) || input.duration < 1) {
    errors.push({ field: "duration", message: "Duration must be a positive whole number." });
  } else if (input.duration > 480) {
    errors.push({ field: "duration", message: "Duration cannot exceed 480 minutes." });
  }

  if (!input.priority) {
    errors.push({ field: "priority", message: "Priority level is required." });
  } else if (!VALID_PRIORITIES.includes(input.priority)) {
    errors.push({ field: "priority", message: "Priority must be low, medium, or high." });
  }

  return errors;
}

export function validateUpdateInput(input: Partial<ServiceUpdateInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    if (typeof input.name !== "string" || input.name.trim() === "") {
      errors.push({ field: "name", message: "Service name cannot be empty." });
    } else if (input.name.trim().length < 2) {
      errors.push({ field: "name", message: "Service name must be at least 2 characters." });
    } else if (input.name.trim().length > 100) {
      errors.push({ field: "name", message: "Service name must be 100 characters or fewer." });
    }
  }

  if (input.description !== undefined) {
    if (typeof input.description !== "string" || input.description.trim() === "") {
      errors.push({ field: "description", message: "Description cannot be empty." });
    } else if (input.description.trim().length > 500) {
      errors.push({ field: "description", message: "Description must be 500 characters or fewer." });
    }
  }

  if (input.duration !== undefined) {
    if (typeof input.duration !== "number" || isNaN(input.duration)) {
      errors.push({ field: "duration", message: "Duration must be a number." });
    } else if (!Number.isInteger(input.duration) || input.duration < 1) {
      errors.push({ field: "duration", message: "Duration must be a positive whole number." });
    } else if (input.duration > 480) {
      errors.push({ field: "duration", message: "Duration cannot exceed 480 minutes." });
    }
  }

  if (input.priority !== undefined && !VALID_PRIORITIES.includes(input.priority)) {
    errors.push({ field: "priority", message: "Priority must be low, medium, or high." });
  }

  if (input.isActive !== undefined && typeof input.isActive !== "boolean") {
    errors.push({ field: "isActive", message: "isActive must be true or false." });
  }

  return errors;
}

// CRUD operations 

export function getAllServices(activeOnly = false): Service[] {
  const store = getStore();
  if (activeOnly) return store.filter((s) => s.isActive);
  return [...store];
}

export function getServiceById(id: number): Service | undefined {
  return getStore().find((s) => s.id === id);
}

export function createService(input: ServiceInput): Service {
  const newService: Service = {
    id: generateId(),
    name: input.name.trim(),
    description: input.description.trim(),
    duration: input.duration,
    priority: input.priority,
    isActive: true,
  };
  getStore().push(newService);
  return newService;
}

export function updateService(id: number, input: ServiceUpdateInput): Service | undefined {
  const store = getStore();
  const index = store.findIndex((s) => s.id === id);
  if (index === -1) return undefined;
  store[index] = {
    ...store[index],
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.description !== undefined && { description: input.description.trim() }),
    ...(input.duration !== undefined && { duration: input.duration }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  };
  return store[index];
}

export function deleteService(id: number): boolean {
  const store = getStore();
  const index = store.findIndex((s) => s.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

// Test helper 
export function __resetStore(): void {
  g._services = [...seedServices];
  g._serviceCounter = 10;
}