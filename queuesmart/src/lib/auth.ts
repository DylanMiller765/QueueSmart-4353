import { User } from "@/types";

interface StoredUser extends User {
  password: string;
}

// In-memory user store — seeded with demo accounts
const users: StoredUser[] = [
  {
    id: "1",
    email: "admin@queuesmart.com",
    name: "Admin",
    role: "admin",
    password: "admin123",
  },
  {
    id: "2",
    email: "user@queuesmart.com",
    name: "Dylan Miller",
    role: "user",
    password: "user123",
  },
];

let currentUser: User | null = null;
let nextId = 3;

export function register(
  name: string,
  email: string,
  password: string,
  role: "user" | "admin" = "user"
): { success: boolean; error?: string; user?: User } {
  const existing = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const newUser: StoredUser = {
    id: String(nextId++),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    role,
    password,
  };
  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  currentUser = userWithoutPassword;
  return { success: true, user: userWithoutPassword };
}

export function login(
  email: string,
  password: string
): { success: boolean; error?: string; user?: User } {
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user) {
    return { success: false, error: "No account found with this email." };
  }
  if (user.password !== password) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  const { password: _, ...userWithoutPassword } = user;
  currentUser = userWithoutPassword;
  return { success: true, user: userWithoutPassword };
}

export function logout(): void {
  currentUser = null;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function getAllUsers(): User[] {
  return users.map(({ password: _, ...u }) => u);
}
