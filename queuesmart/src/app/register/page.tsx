"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
} from "@/lib/validations";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    const nameErr = validateName(name);
    if (nameErr) newErrors.name = nameErr;
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;
    const confirmErr = validateConfirmPassword(password, confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function clearError(field: keyof FormErrors) {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await res.json();

      if (!result.success) {
        setErrors({ general: result.error });
        setIsLoading(false);
        return;
      }

      // Store user in localStorage for session persistence
      localStorage.setItem("queuesmart_user", JSON.stringify(result.user));

      router.push("/dashboard");
    } catch {
      setErrors({ general: "Network error. Please try again." });
      setIsLoading(false);
    }
  }

  const inputClass = (field: keyof FormErrors) =>
    `w-full rounded-xl bg-[#f5f5f7] px-4 py-[13px] text-[17px] text-foreground placeholder:text-[#86868b]/50 border-2 transition-all duration-200 ${
      errors[field]
        ? "border-error bg-white"
        : "border-transparent focus:border-accent focus:bg-white"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div
        className="w-full max-w-[340px] px-6"
        style={{ animation: "fadeUp 0.5s ease-out both" }}
      >
        {/* mark */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-[#d2d2d7]">
            <span className="text-[22px] font-semibold tracking-tight text-foreground">
              Q
            </span>
          </div>
        </div>

        {/* header */}
        <h1 className="text-center text-[28px] font-semibold leading-tight tracking-tight text-foreground">
          Create account
        </h1>
        <p className="mt-2 text-center text-[15px] text-muted">
          to get started with QueueSmart
        </p>

        {/* general error */}
        {errors.general && (
          <div className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-[14px] text-error">
            {errors.general}
          </div>
        )}

        {/* form */}
        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <div className="space-y-3">
            {/* name */}
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("name");
                }}
                placeholder="Full name"
                autoComplete="name"
                autoFocus
                className={inputClass("name")}
              />
              {errors.name && (
                <p className="mt-1.5 text-[13px] text-error">{errors.name}</p>
              )}
            </div>

            {/* email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                placeholder="Email"
                autoComplete="email"
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-[13px] text-error">{errors.email}</p>
              )}
            </div>

            {/* password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  placeholder="Password"
                  autoComplete="new-password"
                  className={`${inputClass("password")} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[13px] text-error">
                  {errors.password}
                </p>
              )}
            </div>

            {/* confirm password */}
            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError("confirmPassword");
                }}
                placeholder="Confirm password"
                autoComplete="new-password"
                className={inputClass("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-[13px] text-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-full bg-accent py-[13px] text-[17px] font-medium text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account\u2026" : "Create Account"}
          </button>
        </form>

        {/* links */}
        <div className="mt-6 text-center text-[13px]">
          <span className="text-muted">Already have an account? </span>
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
