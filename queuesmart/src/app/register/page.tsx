"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please create a password.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    // fake delay, no real backend yet
    await new Promise((r) => setTimeout(r, 600));
    // after "registration", send user to dashboard
    router.push("/dashboard");
    setIsLoading(false);
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
          Create account
        </h1>
        <p className="mt-2 text-center text-[15px] text-muted">
          to get started with QueueSmart
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <div className="space-y-3">
            {/* Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
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

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="Password"
                  autoComplete="new-password"
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

            {/* Confirm password */}
            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                placeholder="Confirm password"
                autoComplete="new-password"
                className={`w-full rounded-xl bg-[#f5f5f7] px-4 py-[13px] text-[17px] text-foreground placeholder:text-[#86868b]/50 border-2 transition-all duration-200 ${
                  errors.confirmPassword
                    ? "border-error bg-white"
                    : "border-transparent focus:border-accent focus:bg-white"
                }`}
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
            {isLoading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 flex items-center justify-center text-[13px]">
          <span className="text-muted">Already have an account?</span>
          <Link
            href="/login"
            className="ml-2 text-accent hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}