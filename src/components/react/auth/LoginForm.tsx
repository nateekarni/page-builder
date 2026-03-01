/**
 * Login Form Component
 *
 * Client-side React component for admin authentication.
 * Uses Better Auth client for sign-in with email/password.
 *
 * Clean Code: single responsibility — handles login form only.
 */

import { signIn } from "@/lib/auth-client";
import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("[LOGIN] Attempting sign in with:", email);

      const result = await signIn.email(
        {
          email,
          password,
          callbackURL: "/admin",
        },
        {
          onSuccess: () => {
            console.log("[LOGIN] Success, redirecting to /admin");
            window.location.href = "/admin";
          },
          onError: (ctx) => {
            console.error("[LOGIN] Error:", ctx.error);
            setError(ctx.error.message ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
          },
        }
      );

      console.log("[LOGIN] Sign in result:", result);
    } catch (err) {
      console.error("[LOGIN] Exception:", err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .login-input:focus { border-color: #3B82F6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }
        .login-btn:hover:not(:disabled) { background-color: #2563EB !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.4) !important; }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .toggle-pw:hover { color: #CBD5E1 !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .login-card { animation: fadeIn 0.4s ease; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .shake { animation: shake 0.4s ease; }
      `}</style>

      <div style={styles.page}>
        <div style={styles.bg}>
          <div style={styles.bgOrb1} />
          <div style={styles.bgOrb2} />
          <div style={styles.bgGrid} />
        </div>

        <div className="login-card" style={styles.card}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
            </div>
            <h1 style={styles.brand}>Portfolio Builder</h1>
            <p style={styles.brandSub}>Admin Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div className="shake" style={styles.errorBox}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>
                อีเมล
              </label>
              <div style={styles.inputWrap}>
                <svg
                  style={styles.inputIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="email"
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>
                รหัสผ่าน
              </label>
              <div style={styles.inputWrap}>
                <svg
                  style={styles.inputIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ ...styles.input, paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
              style={{
                ...styles.button,
                opacity: isLoading ? 0.75 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

          <p style={styles.footer}>
            Portfolio Builder &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#060B14",
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
  },
  bg: { position: "absolute", inset: 0, pointerEvents: "none" },
  bgOrb1: {
    position: "absolute",
    top: "-20%",
    left: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
  },
  bgOrb2: {
    position: "absolute",
    bottom: "-20%",
    right: "-10%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    margin: "1rem",
    padding: "2.5rem",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(20px)",
    borderRadius: "1.25rem",
    border: "1px solid rgba(51, 65, 85, 0.8)",
    boxShadow:
      "0 32px 64px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
  },
  logoWrap: { textAlign: "center" as const, marginBottom: "2rem" },
  logoIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    borderRadius: "1rem",
    background: "linear-gradient(135deg, #3B82F6, #6366F1)",
    boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
    marginBottom: "1rem",
  },
  brand: {
    fontSize: "1.625rem",
    fontWeight: 700,
    color: "#F8FAFC",
    letterSpacing: "-0.03em",
    margin: 0,
  },
  brandSub: {
    fontSize: "0.8125rem",
    color: "#64748B",
    marginTop: "0.25rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    fontWeight: 500,
  },
  form: { display: "flex", flexDirection: "column" as const, gap: "1.25rem" },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    borderRadius: "0.625rem",
    color: "#FCA5A5",
    fontSize: "0.8125rem",
  },
  field: { display: "flex", flexDirection: "column" as const, gap: "0.375rem" },
  label: { fontSize: "0.8125rem", fontWeight: 500, color: "#94A3B8" },
  inputWrap: { position: "relative" as const },
  inputIcon: {
    position: "absolute" as const,
    left: "0.875rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#475569",
    pointerEvents: "none" as const,
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 2.625rem",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    border: "1px solid #1E293B",
    borderRadius: "0.625rem",
    color: "#F8FAFC",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: {
    position: "absolute" as const,
    right: "0.875rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#475569",
    cursor: "pointer",
    padding: "0.25rem",
    display: "flex",
    alignItems: "center",
    transition: "color 0.15s",
  },
  button: {
    padding: "0.8125rem 1.5rem",
    background: "linear-gradient(135deg, #3B82F6, #6366F1)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.625rem",
    fontSize: "0.9375rem",
    fontWeight: 600,
    transition: "all 0.2s",
    marginTop: "0.25rem",
    letterSpacing: "-0.01em",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: "2rem",
    fontSize: "0.75rem",
    color: "#334155",
  },
};
