"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { validateEmail, validatePassword } from "@/lib/validations";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const result = login(email, password);
    if (!result.success) {
      setErrors({ general: result.error });
      setIsLoading(false);
      return;
    }

    router.push(
      result.user!.role === "admin" ? "/admin/dashboard" : "/dashboard"
    );
  }

  function clearError(field: keyof FormErrors) {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    if (errors.general) setErrors((p) => ({ ...p, general: undefined }));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div
        className="w-full max-w-[340px] px-6"
        style={{ animation: "fadeUp 0.5s ease-out both" }}
      >
        {/* Mark */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-[#d2d2d7]">
            <span className="text-[22px] font-semibold tracking-tight text-foreground">
              Q
            </span>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-center text-[28px] font-semibold leading-tight tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="mt-2 text-center text-[15px] text-muted">
          to continue to QueueSmart
        </p>

        {/* General error */}
        {errors.general && (
          <div className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-[14px] text-error">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <div className="space-y-3">
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
                autoFocus
                className={`w-full rounded-xl bg-[#f5f5f7] px-4 py-[13px] text-[17px] text-foreground placeholder:text-[#86868b]/50 border-2 transition-all duration-200 ${
                  errors.email
                    ? "border-error bg-white"
                    : "border-transparent focus:border-accent focus:bg-white"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-[13px] text-error">{errors.email}</p>
              )}
            </div>

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
                  autoComplete="current-password"
                  className={`w-full rounded-xl bg-[#f5f5f7] px-4 py-[13px] pr-16 text-[17px] text-foreground placeholder:text-[#86868b]/50 border-2 transition-all duration-200 ${
                    errors.password
                      ? "border-error bg-white"
                      : "border-transparent focus:border-accent focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-full bg-accent py-[13px] text-[17px] font-medium text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in\u2026" : "Sign In"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 flex items-center justify-center text-[13px]">
          <button className="text-accent hover:underline">
            Forgot password?
          </button>
          <span className="mx-3 text-[#d2d2d7]">|</span>
          <Link href="/register" className="text-accent hover:underline">
            Create account
          </Link>
        </div>

        {/* Demo hint */}
        <p className="mt-12 text-center text-[12px] leading-relaxed text-muted/60">
          Demo — admin@queuesmart.com / admin123 or user@queuesmart.com / user123
        </p>
      </div>
    </div>
  );
}
