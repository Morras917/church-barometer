"use client";
import { useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(`Updated! Current total: R${parseFloat(amount).toLocaleString()}`);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to update");
      }
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a1a 0%, #2a2010 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "'Crimson Text', serif",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: "16px",
        padding: "2.5rem",
        width: "100%",
        maxWidth: "420px",
      }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "1.5rem",
          color: "#c9a84c",
          marginBottom: "0.5rem",
          textAlign: "center",
        }}>Admin Panel</h1>
        <p style={{ color: "#a09070", textAlign: "center", marginBottom: "2rem", fontSize: "1rem" }}>
          Update fundraising total
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "#c9a84c", marginBottom: "0.5rem", fontSize: "0.9rem", fontFamily: "'Cinzel', serif", letterSpacing: "0.05em" }}>
              Amount Raised (R)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 45000"
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(201,168,76,0.4)",
                borderRadius: "8px",
                color: "#f5f0e8",
                fontSize: "1.1rem",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: "100%",
              padding: "0.9rem",
              background: status === "loading" ? "rgba(201,168,76,0.4)" : "linear-gradient(135deg, #c9a84c, #f0d080)",
              border: "none",
              borderRadius: "8px",
              color: "#1a1a1a",
              fontSize: "1rem",
              fontFamily: "'Cinzel', serif",
              fontWeight: "700",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              letterSpacing: "0.05em",
            }}
          >
            {status === "loading" ? "Updating..." : "Update Amount"}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: "8px",
            background: status === "success" ? "rgba(80,180,80,0.15)" : "rgba(220,60,60,0.15)",
            border: `1px solid ${status === "success" ? "rgba(80,180,80,0.4)" : "rgba(220,60,60,0.4)"}`,
            color: status === "success" ? "#80dd80" : "#ff8080",
            textAlign: "center",
          }}>
            {message}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/" style={{ color: "#a09070", fontSize: "0.9rem", textDecoration: "none" }}>
            ← View barometer
          </Link>
        </div>
      </div>
    </div>
  );
}
