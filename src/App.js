import React, { useRef, useState } from "react";

export default function App() {
  const countries = [
    { name: "Indian", flag: "🇮🇳" },
    { name: "Vietnamese", flag: "🇻🇳" },
    { name: "Chinese", flag: "🇨🇳" },
    { name: "Spanish", flag: "🇪🇸" },
    { name: "American", flag: "🇺🇸" },
    { name: "Cuban", flag: "🇨🇺" },
    { name: "Mexican", flag: "🇲🇽" },
    { name: "Guatemalan", flag: "🇬🇹" },
    { name: "Salvadoran", flag: "🇸🇻" },
    { name: "Thai", flag: "🇹🇭" },
    { name: "Japanese", flag: "🇯🇵" },
    { name: "Korean", flag: "🇰🇷" },
    { name: "Italian", flag: "🇮🇹" },
    { name: "Brazilian", flag: "🇧🇷" },
    { name: "French", flag: "🇫🇷" },
    { name: "Lebanese", flag: "🇱🇧" },
    { name: "Peruvian", flag: "🇵🇪" },
    { name: "Greek", flag: "🇬🇷" },
    { name: "Ethiopian", flag: "🇪🇹" },
    { name: "Hawaiian", flag: "🌺" },
    { name: "Jamaican", flag: "🇯🇲" },
    { name: "German", flag: "🇩🇪" },
    { name: "Turkish", flag: "🇹🇷" },
    { name: "Moroccan", flag: "🇲🇦" },
    { name: "British", flag: "🇬🇧" },
    { name: "Argentinian", flag: "🇦🇷" },
    { name: "Filipino", flag: "🇵🇭" },
    { name: "Nigerian", flag: "🇳🇬" },
    { name: "Persian", flag: "🇮🇷" },
    { name: "Southern BBQ", flag: "🍗" },
    { name: "Middle Eastern", flag: "🥙" },
    { name: "Dim Sum", flag: "🥟" },
    { name: "Salad", flag: "🥗" }
  ];

  const [selected, setSelected] = useState("what are we eating?");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [hint, setHint] = useState("");

  const segmentAngle = 360 / countries.length;

  /* ================= WIN SOUND ================= */
  const playWinSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const notes = [220, 330, 440, 660, 880];

    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();

      o.type = "sine";
      o.frequency.value = freq;

      g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.08 + 0.2
      );

      o.connect(g);
      g.connect(ctx.destination);

      o.start(ctx.currentTime + i * 0.08);
      o.stop(ctx.currentTime + i * 0.08 + 0.25);
    });
  };

  /* ================= CONFETTI (600 FLAGS, 15s) ================= */
  const burstConfetti = (flag) => {
    const total = 600;

    for (let i = 0; i < total; i++) {
      const el = document.createElement("div");

      el.innerText = flag;

      el.style.position = "fixed";
      el.style.left = Math.random() * 100 + "vw";
      el.style.top = "-50px";
      el.style.fontSize = "20px";
      el.style.zIndex = 9999;
      el.style.pointerEvents = "none";
      el.style.userSelect = "none";

      document.body.appendChild(el);

      const speed = 0.8 + Math.random() * 3.5;
      const drift = (Math.random() - 0.5) * 6;
      const delay = Math.random() * 15000;

      let fall = 0;

      setTimeout(() => {
        const anim = setInterval(() => {
          fall += speed;

          el.style.transform = `
            translate(${drift}px, ${fall}px)
            rotate(${fall * 0.4}deg)
          `;

          if (fall > window.innerHeight + 100) {
            clearInterval(anim);
            el.remove();
          }
        }, 16);
      }, delay);
    }
  };

  /* ================= TRUE INERTIA WHEEL ================= */
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(null);

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    setHint("");

    const targetIndex = Math.floor(Math.random() * countries.length);

    const spins = 8 * 360;
    const offset = segmentAngle / 2;

    const targetAngle =
      spins + (360 - targetIndex * segmentAngle - offset);

    let current = rotationRef.current;
    let velocity = 45 + Math.random() * 15;
    const friction = 0.985;

    const animate = () => {
      velocity *= friction;
      current += velocity;

      rotationRef.current = current;
      setRotation(current);

      if (velocity < 0.05) {
        cancelAnimationFrame(rafRef.current);

        const normalized =
          ((current % 360) + 360) % 360;

        const landedIndex = Math.floor(
          (360 - normalized) / segmentAngle
        ) % countries.length;

        const result = countries[landedIndex];

        setSelected(`${result.name} ${result.flag}`);
        setHint("perfect landing 🎯");

        playWinSound();
        burstConfetti(result.flag);

        setSpinning(false);
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  /* ================= TOUCH ================= */
  const startY = useRef(null);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (!startY.current) return;

    const diff = startY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 30) spinWheel();

    startY.current = null;
  };

  return (
    <div style={containerStyle}>
      {/* LOGO */}
      <div style={logoWrap}>
        <div style={logoGlow}>
          <div style={logoCircle}>
            <span style={{ ...logoText, fontSize: 22 }}>U</span>
          </div>
        </div>
        <p style={logoLabel}>UNION LUNCH</p>
      </div>

      <p style={subTitleStyle}>decision fatigue helper for overthinkers</p>

      {/* WHEEL */}
      <div
        style={wheelContainer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={pointerStyle}>▼</div>

        <div style={wheelStyle}>
          <div
            style={{
              ...wheelFace,
              transform: `rotate(${rotation}deg)`,
              background: conicGradient
            }}
          >
            {countries.map((c, i) => (
              <div
                key={i}
                style={{
                  ...labelContainer,
                  transform: `translateX(-50%) rotate(${i * segmentAngle}deg)`
                }}
              >
                <span style={labelStyle}>
                  {c.name} {c.flag}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...centerCapStyle, fontSize: 22 }}>U</div>
      </div>

      {/* BUTTON */}
      <button onClick={spinWheel} disabled={spinning} style={buttonStyle}>
        {spinning ? "spinning..." : "spin for lunch 🍽️"}
      </button>

      <p style={hintStyle}>{hint}</p>

      {/* RESULT */}
      <div style={resultBoxStyle}>
        <p style={resultLabelStyle}>THE WHEEL HAS SPOKEN</p>
        <h2 style={resultTextStyle}>{selected}</h2>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const conicGradient = `
conic-gradient(
  from -90deg,
  #60a5fa,
  #3b82f6,
  #8b5cf6,
  #22c55e,
  #facc15,
  #fb7185,
  #60a5fa
)
`;

const containerStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #0b1220)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Arial Black, sans-serif",
  textAlign: "center",
  padding: 20
};

const logoWrap = {
  marginBottom: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const logoGlow = {
  filter: "drop-shadow(0 0 12px #3b82f6) drop-shadow(0 0 30px #2563eb)"
};

const logoCircle = {
  width: 74,
  height: 74,
  borderRadius: "50%",
  border: "3px solid #3b82f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 0 25px #3b82f6 inset"
};

const logoText = {
  fontSize: 38,
  fontWeight: "900",
  color: "#93c5fd",
  textShadow: "0 0 10px #3b82f6"
};

const logoLabel = {
  marginTop: 6,
  fontSize: 12,
  letterSpacing: 4,
  color: "#93c5fd"
};

const subTitleStyle = {
  fontSize: 12,
  color: "#94a3b8",
  marginBottom: 20,
  letterSpacing: 2
};

const wheelContainer = {
  position: "relative",
  width: 340,
  height: 340,
  marginBottom: 25
};

const pointerStyle = {
  position: "absolute",
  top: -18,
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: 28
};

const wheelStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  overflow: "hidden",
  border: "8px solid rgba(147,197,253,0.25)",
  boxShadow: "0 0 40px rgba(59,130,246,0.25)"
};

const wheelFace = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  transition: "transform 4s cubic-bezier(0.12,0.7,0.12,1)"
};

const labelContainer = {
  position: "absolute",
  left: "50%",
  top: 0,
  height: "50%",
  transformOrigin: "bottom center"
};

const labelStyle = {
  fontSize: 9,
  writingMode: "vertical-rl",
  transform: "rotate(180deg) translateY(-6px)",
  color: "white"
};

const centerCapStyle = {
  position: "absolute",
  width: 56,
  height: 56,
  borderRadius: "50%",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  background: "radial-gradient(circle, #0b1220, #020617)",
  border: "2px solid #3b82f6",
  boxShadow:
    "0 0 12px #3b82f6, 0 0 30px #2563eb, inset 0 0 18px #3b82f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#93c5fd",
  fontWeight: "900"
};

const buttonStyle = {
  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  border: "none",
  padding: "14px 26px",
  borderRadius: 999,
  color: "white",
  fontWeight: "bold",
  boxShadow: "0 0 25px rgba(59,130,246,0.4)"
};

const hintStyle = {
  marginTop: 10,
  color: "#93c5fd",
  fontSize: 12
};

const resultBoxStyle = {
  marginTop: 20,
  padding: 16,
  borderRadius: 12,
  background: "rgba(59,130,246,0.08)",
  border: "1px solid rgba(59,130,246,0.2)"
};

const resultLabelStyle = {
  fontSize: 10,
  letterSpacing: 3,
  color: "#93c5fd"
};

const resultTextStyle = {
  fontSize: 22
};