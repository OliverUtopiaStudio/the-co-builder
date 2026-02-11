"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const res = await fetch("/api/fellows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email }),
        });
        if (!res.ok) {
          console.error("Failed to create fellow profile");
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface rounded-sm overflow-hidden" style={{ borderRadius: 2 }}>
      {/* Terracotta header */}
      <div className="bg-accent px-10 pt-10 pb-8">
        <div className="text-white font-bold text-xs tracking-[2px] leading-relaxed mb-5">
          THE<br />UTOPIA<br />STUDIO
        </div>
        <h1 className="text-[28px] font-medium text-white leading-tight">Create Account</h1>
        <p className="text-white/80 text-sm mt-1.5">Join as a Fellow and start building your venture</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-10 py-8 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-sm text-red-700" style={{ borderRadius: 2 }}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="label-uppercase block mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-base"
            style={{ borderRadius: 2 }}
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label htmlFor="email" className="label-uppercase block mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-base"
            style={{ borderRadius: 2 }}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="label-uppercase block mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-base"
            style={{ borderRadius: 2 }}
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label-uppercase block mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-background border border-border text-foreground focus:outline-none focus:border-accent placeholder:text-muted-light text-base"
            style={{ borderRadius: 2 }}
            placeholder="Repeat your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-accent text-white font-semibold text-[15px] hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: 2 }}
        >
          {loading ? "Creating account..." : "Create Account →"}
        </button>
      </form>

      <div className="px-10 pb-6 -mt-2">
        <p className="text-center text-xs text-muted-light">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="px-10 pb-6 text-center">
        <p className="text-xs text-muted-light">The Utopia Studio — Internal Use Only</p>
      </div>
    </div>
  );
}
