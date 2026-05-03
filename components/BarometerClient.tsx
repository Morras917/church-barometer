"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";
import Link from "next/link";

interface FundraisingData {
  current: number;
  goal: number;
  title: string;
  currency: string;
}

export default function BarometerClient({ initialData }: { initialData: FundraisingData }) {
  const [data, setData] = useState<FundraisingData>(initialData);
  const [displayAmount, setDisplayAmount] = useState(initialData.current);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const animRef = useRef<number | null>(null);
  const prevRef = useRef(initialData.current);
  const captureRef = useRef<HTMLDivElement>(null);

  // Animate the counter when value changes
  function animateTo(target: number) {
    const start = prevRef.current;
    const duration = 1800;
    const startTime = performance.now();
    setIsAnimating(true);

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayAmount(Math.round(start + (target - start) * eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        prevRef.current = target;
        setIsAnimating(false);
      }
    }
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);
  }

  useEffect(() => {
    if (data.current !== prevRef.current) {
      animateTo(data.current);
    }
  }, [data.current]);

  // Trigger celebration when goal is reached
  useEffect(() => {
    if (data.current >= 500000) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [data.current]);

  // Real-time Supabase subscription
  useEffect(() => {
    const channel = supabase
      .channel("fundraising-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "fundraising" },
        (payload) => {
          setData((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const BULB_MAX = 50000;
  const DISPLAY_MAX = 500000;

  // Overall progress for percentage display
  const pct = Math.min((data.current / DISPLAY_MAX) * 100, 100);

  // Bulb fills from 0 to 50k
  const bulbPct = Math.min((data.current / BULB_MAX) * 100, 100);

  // Tube fills from 50k to 500k
  const tubePct = data.current <= BULB_MAX
    ? 0
    : Math.min(((data.current - BULB_MAX) / (DISPLAY_MAX - BULB_MAX)) * 100, 100);
  const fillHeight = tubePct;

  const isOverGoal = data.current > DISPLAY_MAX;
  const overflowAmount = Math.max(0, data.current - DISPLAY_MAX);

  // Milestone labels — tube represents 50k–500k
  const milestones = [
    { value: 500000, label: `${data.currency}500k` },
    { value: 450000, label: `${data.currency}450k` },
    { value: 400000, label: `${data.currency}400k` },
    { value: 350000, label: `${data.currency}350k` },
    { value: 300000, label: `${data.currency}300k` },
    { value: 250000, label: `${data.currency}250k` },
    { value: 200000, label: `${data.currency}200k` },
    { value: 150000, label: `${data.currency}150k` },
    { value: 100000, label: `${data.currency}100k` },
    { value: 50000, label: `${data.currency}50k` },
  ];

  function formatNum(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 0) + "k";
    return n.toString();
  }

  function formatFull(n: number) {
    return n.toLocaleString("en-ZA");
  }

  // Download barometer as image
  const handleDownload = useCallback(async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#0d1117",
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `organ-fund-${data.currency}${formatFull(data.current)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, [data]);

  // Color based on progress
  const overflowColor = "#4ade80"; // green for overflow
  const fillColor =
    pct >= 100
      ? "#c9a84c"
      : pct >= 75
      ? "#7abf8f"
      : pct >= 50
      ? "#5a9fc0"
      : pct >= 25
      ? "#7a9fd0"
      : "#4a7aaf";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "2rem 1rem 3rem",
      fontFamily: "'Crimson Text', serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background image */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/church-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
      }} />
      {/* Dark overlay for readability */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        pointerEvents: "none",
      }} />

      {/* Confetti celebration */}
      {showCelebration && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: "-20px",
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                background: ["#c9a84c", "#f0d080", "#4ade80", "#f5f0e8", "#ff6b6b", "#4a9fd0", "#ff9f43"][i % 7],
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                animation: `confetti-fall ${3 + Math.random() * 5}s linear ${Math.random() * 8}s forwards`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}

      {/* Capturable area for download */}
      <div ref={captureRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 2rem 2.5rem", position: "relative" }}>

      {/* Decorative arch top */}
      <svg width="400" height="60" viewBox="0 0 400 60" style={{ marginBottom: "-10px", opacity: 0.4 }}>
        <path d="M0,60 Q200,-20 400,60" fill="none" stroke="#c9a84c" strokeWidth="1" />
        <path d="M40,60 Q200,0 360,60" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.5" />
      </svg>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem", position: "relative", zIndex: 1 }}>
        <div style={{
          fontSize: "0.75rem",
          letterSpacing: "0.3em",
          color: "#c9a84c",
          fontFamily: "'Cinzel', serif",
          marginBottom: "0.5rem",
          opacity: 0.8,
        }}>
          ✦ HERMANUS ✦
        </div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.6rem, 5vw, 2.8rem)",
          fontWeight: "900",
          color: "#f5f0e8",
          lineHeight: 1.1,
          marginBottom: "0.4rem",
          textShadow: "0 0 40px rgba(201,168,76,0.3)",
        }}>
          St Peter&apos;s Church
        </h1>
        <div style={{
          width: "120px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
          margin: "0.75rem auto",
        }} />
        <p style={{
          color: "#8b9ab0",
          fontSize: "1rem",
          letterSpacing: "0.08em",
          fontFamily: "'Cinzel', serif",
        }}>
          ORGAN FUND
        </p>
      </div>

      {/* Main barometer container */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "3rem",
        position: "relative",
        zIndex: 1,
        marginBottom: "2.5rem",
      }}>
        {/* Labels left side */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "340px",
            paddingBottom: "20px",
          }}>
            {milestones.map((m) => (
              <div
                key={m.value}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.65rem",
                  color: "#c9a84c",
                  letterSpacing: "0.05em",
                  fontWeight: "400",
                }}
              >
                {m.label}
              </div>
            ))}
          </div>
          {/* R0 label next to bulb */}
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "0.65rem",
            color: "#c9a84c",
            letterSpacing: "0.05em",
            fontWeight: "400",
            marginTop: "20px",
          }}>
            {data.currency}0
          </div>
        </div>

        {/* Thermometer */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Glow behind thermometer */}
          <div style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: `${Math.max(fillHeight, 5)}%`,
            background: isOverGoal ? overflowColor : fillColor,
            filter: "blur(20px)",
            opacity: 0.3,
            transition: "height 1.8s cubic-bezier(0.16, 1, 0.3, 1), background 1s",
            borderRadius: "40px",
            maxHeight: "340px",
          }} />

          {/* Tube outer */}
          <div style={{
            width: "36px",
            height: "340px",
            background: "rgba(255,255,255,0.06)",
            border: "2px solid rgba(255,255,255,0.15)",
            borderRadius: "18px 18px 0 0",
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
          }}>
            {/* Fill — tube represents 50k–500k */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${fillHeight}%`,
              background: `linear-gradient(180deg, ${fillColor}cc 0%, ${fillColor} 100%)`,
              transition: "height 1.8s cubic-bezier(0.16, 1, 0.3, 1), background 1s ease",
              borderRadius: "18px 18px 0 0",
            }} />

            {/* Overflow fill — green cap on top for amount above 500k */}
            {isOverGoal && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: `${Math.min((overflowAmount / (DISPLAY_MAX - BULB_MAX)) * 100, 100)}%`,
                background: `linear-gradient(180deg, ${overflowColor} 0%, ${overflowColor}99 100%)`,
                transition: "height 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
                borderRadius: "18px 18px 0 0",
                boxShadow: `0 0 10px ${overflowColor}66`,
              }} />
            )}

            {/* Shine */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "4px",
              width: "6px",
              height: "100%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
              borderRadius: "3px",
              pointerEvents: "none",
            }} />

            {/* Tick marks */}
            {[25, 50, 75].map((tick) => (
              <div
                key={tick}
                style={{
                  position: "absolute",
                  bottom: `${tick}%`,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>

          {/* Bulb — fills from 0 to 50k */}
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.2)",
            boxShadow: `0 0 20px ${fillColor}66, 0 0 60px ${fillColor}22`,
            transition: "box-shadow 1s ease",
            marginTop: "-4px",
            position: "relative",
            overflow: "hidden",
            background: "rgba(255,255,255,0.06)",
          }}>
            {/* Bulb fill */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${bulbPct}%`,
              background: `radial-gradient(circle at 38% 35%, ${fillColor}ff, ${fillColor}88)`,
              transition: "height 1.8s cubic-bezier(0.16, 1, 0.3, 1), background 1s ease",
            }} />
            {/* Shine */}
            <div style={{
              position: "absolute",
              top: "8px",
              left: "10px",
              width: "10px",
              height: "10px",
              background: "rgba(255,255,255,0.4)",
              borderRadius: "50%",
              filter: "blur(2px)",
              zIndex: 1,
            }} />
          </div>
        </div>

        {/* Right: milestone dots */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "340px",
            paddingBottom: "20px",
          }}>
            {milestones.map((m) => (
              <div
                key={m.value}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: displayAmount >= m.value ? fillColor : "rgba(255,255,255,0.1)",
                  border: `1px solid ${displayAmount >= m.value ? fillColor : "rgba(255,255,255,0.15)"}`,
                  boxShadow: displayAmount >= m.value ? `0 0 8px ${fillColor}` : "none",
                  transition: "all 0.8s ease",
                }}
              />
            ))}
          </div>
          {/* R0 dot next to bulb */}
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            marginTop: "24px",
            background: displayAmount > 0 ? fillColor : "rgba(255,255,255,0.1)",
            border: `1px solid ${displayAmount > 0 ? fillColor : "rgba(255,255,255,0.15)"}`,
            boxShadow: displayAmount > 0 ? `0 0 8px ${fillColor}` : "none",
            transition: "all 0.8s ease",
          }} />
        </div>
      </div>

      {/* Current amount display */}
      <div style={{
        textAlign: "center",
        marginBottom: "1.5rem",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          fontSize: "0.7rem",
          letterSpacing: "0.25em",
          color: "#6b7a90",
          fontFamily: "'Cinzel', serif",
          marginBottom: "0.4rem",
        }}>
          RAISED SO FAR
        </div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(2.2rem, 8vw, 3.5rem)",
          fontWeight: "900",
          color: fillColor,
          textShadow: `0 0 40px ${fillColor}44`,
          letterSpacing: "-0.01em",
          transition: "color 1s ease",
          lineHeight: 1,
        }}>
          {data.currency}{formatFull(displayAmount)}
        </div>
        {isOverGoal && (
          <div style={{
            marginTop: "0.4rem",
            fontFamily: "'Cinzel', serif",
            fontSize: "1.1rem",
            color: overflowColor,
            textShadow: `0 0 20px ${overflowColor}44`,
          }}>
            {data.currency}{formatFull(overflowAmount)} above goal!
          </div>
        )}
        <div style={{
          marginTop: "0.6rem",
          fontSize: "1rem",
          color: "#6b7a90",
          fontFamily: "'Crimson Text', serif",
          fontStyle: "italic",
        }}>
          of {data.currency}{formatFull(500000)} goal
        </div>

        {/* Progress percentage */}
        <div style={{
          display: "inline-block",
          marginTop: "0.75rem",
          padding: "0.3rem 1.2rem",
          background: `${fillColor}18`,
          border: `1px solid ${fillColor}44`,
          borderRadius: "20px",
          fontFamily: "'Cinzel', serif",
          fontSize: "0.85rem",
          color: fillColor,
          letterSpacing: "0.1em",
        }}>
          {pct.toFixed(1)}% COMPLETE
        </div>
      </div>

      {/* Milestone bar */}
      <div style={{
        width: "100%",
        maxWidth: "320px",
        height: "4px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "2px",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${fillColor}88, ${fillColor})`,
          transition: "width 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
          borderRadius: "2px",
          boxShadow: `0 0 8px ${fillColor}`,
        }} />
      </div>

      </div>{/* End capturable area */}

      {/* Download button */}
      <button
        onClick={handleDownload}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          margin: "1.5rem 0 2rem",
          padding: "0.5rem 1.4rem",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "20px",
          color: "#c9a84c",
          fontFamily: "'Cinzel', serif",
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          cursor: "pointer",
          position: "relative",
          zIndex: 1,
          transition: "all 0.3s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.15)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        DOWNLOAD IMAGE
      </button>

      {/* Live indicator */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "2rem",
        opacity: 0.6,
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#4ade80",
          animation: "pulse 2s infinite",
          boxShadow: "0 0 6px #4ade80",
        }} />
        <span style={{
          fontSize: "0.7rem",
          fontFamily: "'Cinzel', serif",
          letterSpacing: "0.2em",
          color: "#4ade80",
        }}>
          LIVE UPDATES
        </span>
      </div>

      {/* Praise God message at goal */}
      {pct >= 100 && (
        <div style={{
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          marginBottom: "1.5rem",
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
          fontWeight: "700",
          color: "#c9a84c",
          textShadow: "0 0 30px rgba(201,168,76,0.4)",
          letterSpacing: "0.1em",
          animation: "pulse 2s infinite",
        }}>
          Praise God!
        </div>
      )}

      {/* Decorative cross */}
      <div style={{
        position: "relative",
        zIndex: 1,
        marginBottom: "1.5rem",
        opacity: 0.2,
      }}>
        <svg width="24" height="32" viewBox="0 0 24 32">
          <rect x="10" y="0" width="4" height="32" fill="#c9a84c" />
          <rect x="0" y="8" width="24" height="4" fill="#c9a84c" />
        </svg>
      </div>

      <Link href="/admin" style={{
        fontSize: "0.7rem",
        fontFamily: "'Cinzel', serif",
        color: "#2a3040",
        letterSpacing: "0.1em",
        textDecoration: "none",
        position: "relative",
        zIndex: 1,
        transition: "color 0.3s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "#4a5568")}
        onMouseLeave={e => (e.currentTarget.style.color = "#2a3040")}
      >
        admin
      </Link>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
