"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const newErrors: RegisterErrors = {};

    // email
    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // password
    if (!password) {
      newErrors.password = "Please enter a password.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    // confirm password
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

    // fake API call
    await new Promise((r) => setTimeout(r, 600));

    // after "registering", send user to Join Queue screen (A2 UI flow)
    router.push("/user/join-queue");

    setIsLoading(false);
  }

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

        {/* form */}
        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <div className="space-y-3">
            {/* email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
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

            {/* password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    const newPass = e.target.value;
                    setPassword(newPass);

                    // clear password error if they start typing
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }

                    // live confirm-password mismatch check (prevents "sticky" error)
                    if (confirmPassword && confirmPassword !== newPass) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: "Passwords do not match.",
                      }));
                    } else {
                      // if it matches (or confirm is empty), clear mismatch
                      if (errors.confirmPassword === "Passwords do not match.") {
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }));
                      }
                    }
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
                  const newConfirm = e.target.value;
                  setConfirmPassword(newConfirm);

                  // clear confirm error as they type
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }

                  // if they already typed password, check mismatch live
                  if (password && newConfirm && newConfirm !== password) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: "Passwords do not match.",
                    }));
                  }
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

        {/* links */}
        <div className="mt-6 text-center text-[13px]">
          <span className="text-muted">Already have an account? </span>
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </div>

        {/* demo hint */}
        <p className="mt-12 text-center text-[12px] leading-relaxed text-muted/60">
          Demo — this screen only simulates account creation for the UI design
          assignment.
        </p>
      </div>
    </div>
  );
}