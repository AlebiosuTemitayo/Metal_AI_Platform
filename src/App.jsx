import { useState, useRef, useEffect } from "react";

const SYSTEM = `You are a senior metallurgical and materials engineer with 25+ years of experience, working as a consultant through Metal — a professional engineering consultation platform. You provide expert, peer-level advice to engineers and project managers.

Your expertise: material selection, failure analysis, manufacturing and fabrication processes (casting, forging, machining, welding, heat treatment, powder metallurgy), corrosion mechanisms and mitigation, mechanical and physical properties, and industry standards (ASTM, ISO, BS EN, ASME, API, NACE).

Tone: professional, precise, and direct — like a trusted colleague. Give specific alloy grades, standard references, and actionable recommendations. Do not use disclaimers. If something is outside your expertise, say so plainly.`;

const PLANS = [
  {
    id: "free",
    name: "Starter",
    price: "Free",
    icon: "🪨",
    features: ["5 consultations per month", "Material selection queries", "Basic project brief"],
    locked: ["Failure analysis reports", "Live engineer sessions"],
    popular: false,
  },
  {
    id: "pro",
    name: "Professional",
    price: "$49",
    icon: "⚙️",
    features: ["Unlimited consultations", "Full material selection", "Failure analysis reports", "Manufacturing process advice"],
    locked: ["Live engineer sessions"],
    popular: true,
  },
  {
    id: "max",
    name: "Max",
    price: "$149",
    icon: "🏆",
    features: ["Everything in Professional", "Priority response", "Detailed PDF reports", "Live sessions with a certified metallurgical engineer", "Dedicated support"],
    locked: [],
    popular: false,
  },
];

const SLOTS = [
  { day: "Mon 2 Jun", time: "10:00 AM" },
  { day: "Mon 2 Jun", time: "2:00 PM" },
  { day: "Tue 3 Jun", time: "9:00 AM" },
  { day: "Wed 4 Jun", time: "11:00 AM" },
  { day: "Thu 5 Jun", time: "3:00 PM" },
  { day: "Fri 6 Jun", time: "10:00 AM" },
];

function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  lines.forEach((line, i) => {
    if (/^### (.+)/.test(line)) {
      elements.push(<div key={i} style={{fontSize:13,fontWeight:700,color:"#1e2d3d",margin:"12px 0 3px"}}>{line.replace(/^### /,"")}</div>);
    } else if (/^## (.+)/.test(line)) {
      elements.push(<div key={i} style={{fontSize:14,fontWeight:700,color:"#1e2d3d",margin:"16px 0 5px",borderBottom:"0.5px solid rgba(0,0,0,0.1)",paddingBottom:3}}>{line.replace(/^## /,"")}</div>);
    } else if (/^# (.+)/.test(line)) {
      elements.push(<div key={i} style={{fontSize:15,fontWeight:700,color:"#1e2d3d",margin:"16px 0 8px"}}>{line.replace(/^# /,"")}</div>);
    } else if (/^[-*] (.+)/.test(line)) {
      const content = line.replace(/^[-*] /,"").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
      elements.push(<div key={i} style={{display:"flex",gap:8,margin:"3px 0",fontSize:13,lineHeight:1.6}}><span style={{color:"#d4a017",fontWeight:700,flexShrink:0}}>•</span><span dangerouslySetInnerHTML={{__html:content}}/></div>);
    } else if (line.trim()==="") {
      elements.push(<div key={i} style={{height:5}}/>);
    } else {
      const content = line.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
      elements.push(<div key={i} style={{fontSize:13,lineHeight:1.65,margin:"2px 0"}} dangerouslySetInnerHTML={{__html:content}}/>);
    }
  });
  return <div>{elements}</div>;
}

// ── 100% FREE GROQ API ENGINE ──────────────────────────────
async function callGroqFree(messages, systemPrompt) {
  // Checks Vercel environment variables OR local browser session memory
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem("LOCAL_GROQ_KEY");

  if (!apiKey) {
    throw new Error("API Key setup missing.");
  }

  const formattedMessages = [
    { role: "system", content: systemPrompt || SYSTEM },
    ...messages
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: formattedMessages,
      temperature: 0.2,
      max_tokens: 1200
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content || "";
}


// ── Styles ──────────────────────────────────────────────
const S = {
  steel: "#1e2d3d",
  steelHover: "#162230",
  gold: "#b8860b",
  goldMid: "#d4a017",
  goldLight: "#fdf6e3",
  border: "rgba(0,0,0,0.09)",
  border2: "rgba(0,0,0,0.15)",
  bg: "#ffffff",
  bg2: "#f7f7f5",
  text: "#1a1a1a",
  text2: "#6b6b6b",
  text3: "#aaaaaa",
  radius: 12,
  radiusMd: 8,
};

const card = {
  background: S.bg,
  border: `0.5px solid ${S.border2}`,
  borderRadius: S.radius,
  padding: "1.25rem",
};

// ── Landing ──────────────────────────────────────────────
function Landing({ onSelect }) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1.5rem 1rem", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: S.steel,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1rem", fontSize: 26,
        }}>🔩</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: S.text, letterSpacing: -0.5 }}>Metal</div>
        <div style={{ fontSize: 14, color: S.text2, marginTop: 4 }}>
          Professional Metallurgical &amp; Materials Engineering Consultation
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.25rem" }}>
        {PLANS.map((p) => (
          <div key={p.id} style={{
            ...card,
            position: "relative",
            border: p.popular ? `2px solid ${S.goldMid}` : `0.5px solid ${S.border2}`,
            display: "flex", flexDirection: "column",
          }}>
            {p.popular && (
              <div style={{
                position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                background: S.goldMid, color: "#fff", fontSize: 11, fontWeight: 600,
                padding: "2px 12px", borderRadius: 999, whiteSpace: "nowrap",
              }}>Most popular</div>
            )}
            <div style={{ fontSize: 22, marginBottom: 8 }}>{p.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{p.name}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: S.text, margin: "4px 0 12px" }}>
              {p.price} <span style={{ fontSize: 12, fontWeight: 400, color: S.text2 }}>/mo</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 12, color: S.text2, flex: 1 }}>
              {p.features.map((f) => (
                <li key={f} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
                  <span style={{ color: S.goldMid, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
              {p.locked.map((f) => (
                <li key={f} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start", opacity: 0.4 }}>
                  <span style={{ flexShrink: 0 }}>✕</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => onSelect(p.id)} style={{
              width: "100%", padding: "9px 0", marginTop: 14,
              background: p.popular ? S.goldMid : S.bg2,
              color: p.popular ? "#fff" : S.text,
              border: p.popular ? "none" : `0.5px solid ${S.border2}`,
              borderRadius: S.radiusMd, fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}>
              {p.id === "free" ? "Get started free" : `Choose ${p.name}`}
            </button>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: S.text3 }}>
        All plans include full access to our expert consultation system. No setup fees.
      </div>
    </div>
  );
}

// ── Chat ─────────────────────────────────────────────────
function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to Metal. I'm your dedicated materials engineering consultant. Whether you need help with material selection, failure analysis, manufacturing processes, corrosion assessment, or heat treatment — describe your challenge and I'll provide expert guidance backed by industry standards." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const history = useRef([]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput(""); setError(""); setLoading(true);
    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    const updatedHistory = [...history.current, userMsg];
    history.current = updatedHistory;
    try {
      const reply = await callGroqFree(updatedHistory, SYSTEM);
      const assistantMsg = { role: "assistant", content: reply };
      history.current = [...updatedHistory, assistantMsg];
      setMessages((m) => [...m, assistantMsg]);
    } catch (e) {
      setError("AI core is connecting. Verify your API key variable is configured.");
    }
    setLoading(false);
  }

  return (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
      <div ref={listRef} style={{ height: 320, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 8, flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: m.role === "user" ? S.bg2 : S.steel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{m.role === "user" ? "👤" : "🔩"}</div>
            <div style={{ maxWidth: "76%", padding: "8px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.6, background: m.role === "user" ? S.steel : S.bg2, color: m.role === "user" ? "#fff" : S.text, border: m.role === "user" ? "none" : `0.5px solid ${S.border}` }}>{m.role === "user" ? m.content : renderMarkdown(m.content)}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: S.steel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔩</div>
            <div style={{ padding: "10px 14px", borderRadius: 12, background: S.bg2, border: `0.5px solid ${S.border}`, display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: S.steel, animation: "blink 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        {error && <div style={{ fontSize: 12, color: "#c0392b", padding: "6px 10px", background: "#fdf0ef", borderRadius: S.radiusMd }}>{error}</div>}
      </div>
      <div style={{ display: "flex", gap: 8, padding: 10, borderTop: `0.5px solid ${S.border}` }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Describe your materials engineering challenge…" style={{ flex: 1, padding: "8px 12px", borderRadius: S.radiusMd, border: `0.5px solid ${S.border2}`, fontSize: 13, outline: "none", background: S.bg }} />
        <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "0 16px", background: loading ? S.text3 : S.steel, color: "#fff", border: "none", borderRadius: S.radiusMd, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>Send</button>
      </div>
      <style>{`@keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }`}</style>
    </div>
  );
}

function Brief() {
  const [form, setForm] = useState({ industry: "Oil & Gas", scope: "Material selection", component: "", temp: "", load: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.component.trim()) { alert("Please describe the component or application."); return; }
    setLoading(true); setResult(""); setError("");
    const prompt = `Engineering assessment request:
- Industry: ${form.industry}
- Scope: ${form.scope}
- Component/application: ${form.component}
- Operating temperature: ${form.temp || "not stated"}°C
- Loading & environment: ${form.load || "not stated"}
- Standards & constraints: ${form.notes || "none stated"}

Provide a structured engineering assessment: executive summary, recommended material(s) with specific grades and specifications, key properties justifying the selection, applicable standards, fabrication and process recommendations, and risk considerations.`;
    try {
      const reply = await callGroqFree([{ role: "user", content: prompt }], SYSTEM);
      setResult(reply);
    } catch (e) {
      setError("Assessment calculation failed.");
    }
    setLoading(false);
  }

  const field = (label, el) => (<div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={{ fontSize: 12, color: S.text2 }}>{label}</label>{el}</div>);
  const inp = (k, placeholder, type = "text") => (<input type={type} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} style={{ padding: "8px 10px", borderRadius: S.radiusMd, border: `0.5px solid ${S.border2}`, fontSize: 13 }} />);
  const sel = (k, opts) => (<select value={form[k]} onChange={(e) => set(k, e.target.value)} style={{ padding: "8px 10px", borderRadius: S.radiusMd, border: `0.5px solid ${S.border2}`, fontSize: 13 }}>{opts.map((o) => <option key={o}>{o}</option>)}</select>);

  return (
    <div style={card}>
      <div style={{ fontSize: 15, fontWeight: 600, color: S.text, marginBottom: 3 }}>Project brief</div>
      <div style={{ fontSize: 13, color: S.text2, marginBottom: "1.25rem" }}>Submit your project details for a structured engineering assessment.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {field("Industry / sector", sel("industry", ["Aerospace", "Oil & Gas", "Automotive", "Construction", "Marine", "Power generation", "Medical devices", "Other"]))}
        {field("Scope of assessment", sel("scope", ["Material selection", "Failure analysis", "Manufacturing process", "Corrosion assessment", "Heat treatment", "Welding & joining"]))}
        <div style={{ gridColumn: "1/-1" }}>{field("Component / application", inp("component", "e.g. Pressure vessel in H₂S environment at 250°C"))}</div>
        {field("Operating temperature (°C)", inp("temp", "e.g. 250"))}
        {field("Loading & environment", inp("load", "e.g. cyclic fatigue, saline"))}
        <div style={{ gridColumn: "1/-1" }}>{field("Standards & constraints", <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Applicable standards (ASME, API, ASTM…), weight limits, budget, existing materials…" style={{ padding: "8px 10px", borderRadius: S.radiusMd, border: `0.5px solid ${S.border2}`, fontSize: 13, resize: "vertical", minHeight: 70 }} />)}</div>
      </div>
      <button onClick={submit} disabled={loading} style={{ width: "100%", padding: 10, background: loading ? S.text3 : S.steel, color: "#fff", border: "none", borderRadius: S.radiusMd, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Generating assessment…" : "Generate engineering assessment"}</button>
      {error && <div style={{ marginTop: 10, fontSize: 13, color: "#c0392b", padding: "8px 12px", background: "#fdf0ef", borderRadius: S.radiusMd }}>{error}</div>}
      {result && (<div style={{ marginTop: 14, background: S.bg2, border: `0.5px solid ${S.border2}`, borderRadius: S.radius, padding: "1rem 1.25rem" }}><div style={{ fontSize: 11, fontWeight: 600, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Engineering assessment</div><div style={{ fontSize: 13, color: S.text, lineHeight: 1.7 }}>{renderMarkdown(result)}</div></div>)}
    </div>
  );
}

function EngineerPanel({ plan }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  if (plan !== "max") return (
    <div style={{ ...card, textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 6 }}>Available on Max plan</div>
      <div style={{ fontSize: 13, color: S.text2, lineHeight: 1.6, marginBottom: "1.25rem", maxWidth: 360, margin: "0 auto 1.25rem" }}>Book a live one-on-one session with a certified metallurgical engineer. Get an in-depth review of your project, failure investigation support, or a professional second opinion.</div>
    </div>
  );

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden" }}>
      <div style={{ background: S.steel, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>👨‍🔬</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Dr. Adewale Okafor, FIMMM</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>PhD Materials Science · 22 yrs experience · CEng</div>
        </div>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#4caf50", flexShrink: 0 }} />
      </div>
      <div style={{ padding: "1.25rem" }}>
        <div style={{ fontSize: 13, color: S.text2, lineHeight: 1.6, marginBottom: "1.25rem" }}>Specialist in high-temperature alloys, corrosion engineering, and failure analysis. Previously with Shell Global Solutions and TWI. Available for project reviews, expert witness work, and technical due diligence.</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Available slots this week</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
          {SLOTS.map((s, i) => (
            <div key={i} onClick={() => { setSelected(i); setConfirmed(false); }} style={{ border: `0.5px solid ${selected === i ? S.goldMid : S.border2}`, background: selected === i ? S.goldLight : S.bg, borderRadius: S.radiusMd, padding: 10, textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 11, color: S.text2, marginBottom: 2 }}>{s.day}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{s.time}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { if (selected === null) { alert("Please select a time slot."); return; } setConfirmed(true); }} style={{ width: "100%", padding: 10, background: S.goldMid, color: "#fff", border: "none", borderRadius: S.radiusMd, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Confirm booking</button>
        {confirmed && (<div style={{ marginTop: 10, background: S.goldLight, border: `0.5px solid #e8d5a3`, borderRadius: S.radiusMd, padding: "10px 14px", fontSize: 13, color: S.text, textAlign: "center" }}>🎉 Session reserved for <strong>{SLOTS[selected].day} at {SLOTS[selected].time}</strong>. An email invitation has been generated.</div>)}
      </div>
    </div>
  );
}

// 🗺️ STANDALONE METALLURGICAL ENGINE: CAT 1 DIAGRAM 1 (FULL PHASE DIAGRAM)
function IronCarbonCalculations() {
  const [c, setC] = useState(0.77);
  const [t, setT] = useState(723);

  // Expanded Thermodynamic Phase Field Classifier Matrix
  let phaseText = "";
  let alpha = 0;
  let fe3c = 0;
  let gamma = 0;
  let liquid = 0;

  // Exact Lever Rule & Phase Region Structural Identification
  if (t <= 723) {
    const aLim = 0.022;
    const cLim = 6.67;
    const boundedC = Math.max(aLim, Math.min(cLim, c));
    alpha = ((cLim - boundedC) / (cLim - aLim)) * 100;
    fe3c = ((boundedC - aLim) / (cLim - aLim)) * 100;
    
    if (c <= 0.77) {
      phaseText = "Hypoeutectoid Steel: α-Ferrite + Pearlite Matrix";
    } else if (c <= 2.06) {
      phaseText = "Hypereutectoid Steel: Pearlite + Secondary Cementite (Fe₃C)";
    } else {
      phaseText = "White Cast Iron: Ledeburite II Structure + Cementite Networks";
    }
  } else if (t <= 1147) {
    if (c <= 0.022) {
      phaseText = "Stable α-Ferrite Solid Solution Domain";
    } else if (c <= 0.77) {
      phaseText = "Two-Phase Field: Proeutectoid α-Ferrite + Austenite (γ)";
    } else if (c <= 2.06) {
      phaseText = "Austenite (γ) Matrix + Proeutectoid Cementite Network";
    } else {
      // Cast iron eutectic field lever split
      gamma = ((6.67 - c) / (6.67 - 2.06)) * 100;
      fe3c = ((c - 2.06) / (6.67 - 2.06)) * 100;
      phaseText = "Cast Iron Field: Austenite (γ) + Ledeburite I + Fe₃C";
    }
  } else {
    // High temperature liquid boundaries
    if (c <= 2.06) {
      phaseText = "Fully Austenitized Solid Solution Field (γ-Matrix)";
    } else {
      phaseText = "Liquid Phase (L) + Primary Crystals Precipitation Field";
    }
  }

  // 📈 TEXTBOOK GEOMETRIC ALIGNMENT MATRIX (0 to 6.67% C, 0 to 1600°C)
  // Maps values perfectly to the full-scale SVG grid dimensions
  const markerX = (c / 6.67) * 100;
  const markerY = 80 - (t / 1600) * 80;

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>📊 Full-Scale Iron-Carbon Phase Diagram Grid</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1rem" }}>Comprehensive system tracking steel and cast iron eutectic invariants.</div>

      {/* Inputs Configuration Matrix */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
            <span>Carbon Composition: <strong style={{ color: S.steel }}>{c.toFixed(2)} wt% C</strong></span>
            <span style={{ color: c > 2.06 ? S.goldMid : S.text3, fontSize: 11 }}>{c > 2.06 ? "Cast Iron Field" : "Steel Field"}</span>
          </div>
          <input type="range" min="0.00" max="6.67" step="0.01" value={c} onChange={(e) => setC(parseFloat(e.target.value))} style={{ width: "100%", accentColor: S.steel }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
            <span>Target Temperature: <strong style={{ color: "#dc3545" }}>{t}°C</strong></span>
            <span style={{ color: t > 723 ? S.gold : "#4caf50", fontSize: 11 }}>{t > 723 ? `Above A1 Invariant (${t-723}°C)` : "Below A1 Eutectoid line"}</span>
          </div>
          <input type="range" min="0" max="1600" step="10" value={t} onChange={(e) => setT(parseInt(e.target.value))} style={{ width: "100%", accentColor: S.goldMid }} />
        </div>
      </div>

      {/* 🎨 THE FULL TEXTBOOK VECTOR PHASE PLOT */}
      <div style={{ background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 8, padding: "20px 14px 8px 8px", marginBottom: "1.25rem", position: "relative" }}>
        <div style={{ position: "absolute", top: 6, left: 10, fontSize: 9, fontWeight: 700, color: "#adb5bd", textTransform: "uppercase" }}>T [°C] vs Composition (wt% C) Full Range</div>
        
        <svg viewBox="0 0 100 80" style={{ width: "100%", height: "240px", overflow: "visible", marginTop: 10 }}>
          {/* Axis Labels and Guidelines */}
          <line x1="0" y1="0" x2="0" y2="80" stroke="#333" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#333" strokeWidth="0.5" />
          
          {/* A1 Invariant Line at Exact 723°C */}
          <line x1="0" y1="43.8" x2="100" y2="43.8" stroke="#6c757d" strokeWidth="0.4" strokeDasharray="1 1" />
          <text x="1" y="42.5" fontSize="2.5" fill="#212529" fontWeight="bold">A1: 723°C</text>

          {/* Eutectic Line at 1147°C (E-C-F Line) */}
          <line x1="30.9" y1="22.6" x2="100" y2="22.6" stroke="#dc3545" strokeWidth="0.4" strokeDasharray="1 1" />
          <text x="32" y="21.5" fontSize="2.5" fill="#dc3545" fontWeight="bold">Eutectic: 1147°C</text>

          {/* Core Phase Boundary Lines matching your textbook image */}
          {/* Liquidus lines tracking from pure melting point 1538°C down through eutectic */}
          <path d="M 0,3.1 Q 30,10 64.5,22.6" fill="none" stroke="#212529" strokeWidth="0.6" />
          <line x1="64.5" y1="22.6" x2="100" y2="15.0" stroke="#212529" strokeWidth="0.6" />

          {/* Solidus line defining Austenite boundaries */}
          <path d="M 0,10.4 Q 15,15 30.9,22.6" fill="none" stroke="#212529" strokeWidth="0.6" />
          {/* A3 and Acm boundaries */}
          <path d="M 0,34.5 Q 6,40 11.5,43.8" fill="none" stroke="#212529" strokeWidth="0.6" />
          <path d="M 11.5,43.8 Q 20,32 30.9,22.6" fill="none" stroke="#212529" strokeWidth="0.6" />

          {/* Phase Field Identifiers Alignment Matrix */}
          <text x="50" y="8" fontSize="4.5" fill="#495057" textAnchor="middle">liquid (L)</text>
          <text x="18" y="24" fontSize="4.5" fill="#495057" textAnchor="middle">austenite (γ)</text>
          <text x="10" y="60" fontSize="3.5" fill="#6c757d" textAnchor="middle">α + pearlite</text>
          <text x="30" y="60" fontSize="3.5" fill="#6c757d" textAnchor="middle">pearlite + Fe₃C</text>
          <text x="75" y="40" fontSize="4" fill="#495057" textAnchor="middle">ledeburite + Fe₃C</text>

          {/* Strategic Invariant Intersection Markers */}
          <circle cx="11.5" cy="43.8" r="0.8" fill="#dc3545" /> {/* Eutectoid point S */}
          <circle cx="64.5" cy="22.6" r="0.8" fill="#dc3545" /> {/* Eutectic point C */}

          {/* 🎯 ACTIVE GRAPH TRACKING CROSSHAIR CURVE MARKER */}
          <line x1={markerX} y1="0" x2={markerX} y2="80" stroke="rgba(220, 53, 69, 0.2)" strokeWidth="0.4" />
          <line x1="0" y1={markerY} x2="100" y2={markerY} stroke="rgba(220, 53, 69, 0.2)" strokeWidth="0.4" />
          <circle cx={markerX} cy={markerY} r="1.5" fill="#dc3545" stroke="#fff" strokeWidth="0.4" />
        </svg>

        {/* Boundary Limits Ticks Layout */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#6c757d", fontWeight: 600, padding: "4px 2px 0 2px", borderTop: "1px solid #dee2e6" }}>
          <span>0.0% C</span>
          <span>0.77% S'</span>
          <span>2.06% E</span>
          <span>4.30% C'</span>
          <span>6.67% Fe₃C</span>
        </div>
      </div>

      {/* Volumetric Calculations Data Block */}
      <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Phase Content Profiles</div>
        {t <= 723 ? (
          <>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Ferrite (α-Iron Proportion)</span><strong>{alpha.toFixed(1)}%</strong></div>
              <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${alpha}%`, height: "100%", background: S.steel }} /></div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Cementite (Fe₃C Boundary Carbide)</span><strong>{fe3c.toFixed(1)}%</strong></div>
              <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${fe3c}%`, height: "100%", background: S.goldMid }} /></div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: S.text }}>
            Phase concentrations variable depending on local field equilibrium calculations above the eutectoid line.
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, fontStyle: "italic", color: S.steel, textAlign: "center", borderTop: `0.5px solid ${S.border}`, paddingTop: 8, marginTop: 4 }}>
        🔬 Microstructure State: <strong>{phaseText}</strong>
      </div>
    </div>
  );
}


// 🗺️ STANDALONE METALLURGICAL ENGINE: CAT 1 DIAGRAM 2 (ELLINGHAM)
function EllinghamCalculations() {
  const [metal, setMetal] = useState("Fe");
  const [temp, setTemp] = useState(800); // °C

  // Thermodynamic Reference Constants (Standard Free Energy Equations: dG = dH - T*dS)
  // Approximations for metal oxide formations per mole of O2
  const values = {
    Cu: { name: "Copper Oxide (2Cu2O)", dH: -338, dS: -0.14 },
    Fe: { name: "Iron Oxide (2FeO)", dH: -544, dS: -0.13 },
    Al: { name: "Aluminum Oxide (2/3 Al2O3)", dH: -1117, dS: -0.21 }
  }[metal];

  const T_Kelvin = temp + 273.15;
  const deltaG = values.dH - (T_Kelvin * values.dS); // kJ/mol O2

  // Carbon Monoxide reducing line approximation (2CO + O2 -> 2CO2)
  const deltaG_CO = -565 + (T_Kelvin * 0.17);

  // Pyrometallurgical metallurgical rule: Metal can be reduced if the CO line is LOWER than the Metal Oxide line
  const isReducibleByCarbon = deltaG_CO < deltaG;

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>📊 Ellingham Thermodynamics & Reduction Predictor</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1rem" }}>Select a metallurgical element to calculate Gibbs Free Energy ($\Delta G$) stability boundaries.</div>

      {/* Selector Panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Target Metal Oxide System</label>
          <select value={metal} onChange={(e) => setMetal(e.target.value)} style={{ padding: "6px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff" }}>
            <option value="Cu">Copper System (Low Stability)</option>
            <option value="Fe">Iron System (Medium Stability)</option>
            <option value="Al">Aluminum System (Refractory Stability)</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
            <span>Furnace Heat: <strong>{temp}°C</strong></span>
          </div>
          <input type="range" min="100" max="1500" step="50" value={temp} onChange={(e) => setTemp(parseInt(e.target.value))} style={{ width: "100%", accentColor: S.steel }} />
        </div>
      </div>

      {/* Thermochemical Outputs Panel */}
      <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Calculated Thermodynamic Potentials</div>
        
        <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
              <span>ΔG° of {values.name}:</span>
              <strong style={{ color: deltaG < -600 ? "#c0392b" : S.steel }}>{deltaG.toFixed(0)} kJ/mol O₂</strong>
            </div>
            <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (Math.abs(deltaG) / 1200) * 100)}%`, height: "100%", background: "#2c3e50" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: `0.5px solid ${S.border}`, paddingTop: 6, marginTop: 2 }}>
            <span>Carbon Reduction Potential (2CO → 2CO₂):</span>
            <strong>{deltaG_CO.toFixed(0)} kJ/mol O₂</strong>
          </div>

      </div>

      <div style={{ fontSize: 12, fontStyle: "italic", color: isReducibleByCarbon ? "#27ae60" : "#d35400", textAlign: "center", borderTop: `0.5px solid ${S.border}`, paddingTop: 8, marginTop: 4, fontWeight: 600 }}>
        {isReducibleByCarbon 
          ? `✅ Thermodynamically Feasible: Carbon/CO can reduce this oxide to pure metal at ${temp}°C.` 
          : `❌ Extraction Blocked: Oxide layer is too stable. Requires a stronger reducing agent or electrolysis.`}
      </div>
    </div>
  );
}
// 🗺️ STANDALONE METALLURGICAL ENGINE: CAT 1 DIAGRAM 3 (TTT/CCT)
function TttCctCalculations() {
  const [alloy, setAlloy] = useState("1045");
  const [coolingMedia, setCoolingMedia] = useState("Oil");

  // Heat Treatment Simulation Calculations
  let coolingRateText = "";
  let structureText = "";
  let finalHardnessText = "";
  let microstructures = { pearlite: 0, bainite: 0, martensite: 0 };

  if (coolingMedia === "Furnace") {
    coolingRateText = "Very Slow Continuous Cooling (~0.1°C/s) - Follows CCT Equilibrium Paths";
    microstructures = { pearlite: 100, bainite: 0, martensite: 0 };
    structureText = "100% Coarse Pearlite grains matrix. Uniformly soft, stress-relieved structural state.";
    finalHardnessText = alloy === "1045" ? "15 HRC (Soft)" : "22 HRC (Medium-Soft)";
  } else if (coolingMedia === "Oil") {
    coolingRateText = "Moderate Industrial Quench (~25°C/s) - Crosses the Pearlite Nose Boundary";
    if (alloy === "1045") {
      microstructures = { pearlite: 45, bainite: 15, martensite: 40 };
      structureText = "Mixed Microstructure: Fine Pearlite nodes + Acicular Bainite + Tempered Martensite shards.";
      finalHardnessText = "42 HRC (Medium Hard)";
    } else {
      microstructures = { pearlite: 10, bainite: 20, martensite: 70 };
      structureText = "High Alloy Shift: Pearlite nose avoided. Dominated by highly distorted Martensite matrices.";
      finalHardnessText = "54 HRC (Hard)";
    }
  } else {
    coolingRateText = "Severe Liquid Water Quench (~120°C/s) - Completely Bypasses the Transformation Nose";
    microstructures = { pearlite: 0, bainite: 0, martensite: 100 };
    structureText = "100% Fully Untempered Body-Centered Tetragonal (BCT) Martensite structure. Maximum internal lattice strain.";
    finalHardnessText = alloy === "1045" ? "58 HRC (Very Hard / Brittle)" : "64 HRC (Maximum Brittle Hardness)";
  }

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>📊 Isothermal TTT & Continuous CCT Quench Simulator</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1rem" }}>Select an engineering alloy composition and model real-world thermal cooling paths.</div>

      {/* Inputs Configuration Selection panel Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Steel Chemistry Designation</label>
          <select value={alloy} onChange={(e) => setAlloy(e.target.value)} style={{ padding: "6px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff" }}>
            <option value="1045">AISI 1045 (Medium Carbon Steel)</option>
            <option value="4140">AISI 4140 (Chromoly Low-Alloy Steel)</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Severe Quenching Medium</label>
          <select value={coolingMedia} onChange={(e) => setCoolingMedia(e.target.value)} style={{ padding: "6px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff" }}>
            <option value="Furnace">Furnace Cooling (Annealing)</option>
            <option value="Oil">Industrial Oil Bath (Medium Quench)</option>
            <option value="Water">Agitated Water Jet (Severe Quench)</option>
          </select>
        </div>
      </div>

      {/* Transformation Kinetics Outputs Panel */}
      <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Calculated Kinetic Transformation Metrics</div>
        
        <div style={{ fontSize: 12, marginBottom: 4 }}>
          Velocity Profile: <span style={{ fontWeight: 600, color: S.steel }}>{coolingRateText}</span>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}><span>Pearlite Component Volume (Soft)</span><strong>{microstructures.pearlite}%</strong></div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${microstructures.pearlite}%`, height: "100%", background: S.steel }} /></div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}><span>Bainite Component Volume (Intermediate)</span><strong>{microstructures.bainite}%</strong></div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${microstructures.bainite}%`, height: "100%", background: S.goldMid }} /></div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}><span>Martensite Component Volume (Brittle Hard)</span><strong>{microstructures.martensite}%</strong></div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${microstructures.martensite}%`, height: "100%", background: "#b23b3b" }} /></div>
        </div>
      </div>

      <div style={{ borderTop: `0.5px solid ${S.border}`, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: S.text2, maxWidth: "75%" }}>
          🔬 <strong>Phase Lattice Matrix:</strong> {structureText}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: S.text3, textTransform: "uppercase" }}>Estimated Hardness</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: S.gold }}>{finalHardnessText}</div>
        </div>
      </div>
    </div>
  );
}
// 🎛️ UPGRADED METALLURGICAL ENGINE: CAT 2 DIAGRAM 1 (STRESS-STRAIN SOLVER)
function StressStrainCalculations() {
  const [solveMode, setSolveMode] = useState("extension"); // "extension" or "modulus"
  const [diameter, setDiameter] = useState(12.7); // mm
  const [gaugeLength, setGaugeLength] = useState(50.0); // mm
  const [load, setLoad] = useState(45); // kN
  
  // Independent variable inputs based on active mode choice
  const [extension, setExtension] = useState(0.15); // mm (used in Mode A)
  const [knownModulus, setKnownModulus] = useState(200); // GPa (used in Mode B)

  // 1. Core Geometrical Calculation (ASTM E8 Area)
  const radius = diameter / 2;
  const originalArea = Math.PI * Math.pow(radius, 2); // mm²
  const engineeringStress = (load * 1000) / originalArea; // MPa

  // 2. Multi-Mode Algorithmic Routing Matrix
  let activeStrain = 0;
  let activeExtension = 0;
  let activeModulus = 0;

  if (solveMode === "extension") {
    // Mode A: Extension is given, calculate Modulus & Strain naturally
    activeExtension = extension;
    activeStrain = extension / gaugeLength;
    activeModulus = (activeStrain > 0) ? (engineeringStress / activeStrain) / 1000 : 0;
  } else {
    // Mode B: Extension is missing! Back-calculate using user's inputted Modulus
    activeModulus = knownModulus;
    // Strain = Stress / Elasticity (Convert GPa down to MPa first)
    activeStrain = (knownModulus > 0) ? engineeringStress / (knownModulus * 1000) : 0;
    // Extension = Strain * Original Gauge Length
    activeExtension = activeStrain * gaugeLength;
  }

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>📊 Engineering Stress-Strain Multi-Mode Solver</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1.25rem" }}>Toggle calculation priorities to reverse-engineer missing laboratory extensometer vectors.</div>

      {/* 🔄 MODE TOGGLE DROPDOWN SWITCH */}
      <div style={{ marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: S.goldMid, textTransform: "uppercase" }}>Target Calculation Priority</label>
        <select value={solveMode} onChange={(e) => setSolveMode(e.target.value)} style={{ padding: "8px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: S.bg2, fontWeight: 600, color: S.text }}>
          <option value="extension">Solve For Modulus (Extension data is Given)</option>
          <option value="modulus">Solve For Extension (Young's Modulus is Given)</option>
        </select>
      </div>

      {/* Laboratory Specimen Dimensional Matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Specimen Diameter (mm)</label>
          <input type="number" step="0.1" min="1" value={diameter} onChange={(e) => setDiameter(parseFloat(e.target.value) || 0)} style={{ padding: "6px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Initial Gauge Length (mm)</label>
          <input type="number" step="0.5" min="1" value={gaugeLength} onChange={(e) => setGaugeLength(parseFloat(e.target.value) || 0)} style={{ padding: "6px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Applied Pulling Load (kN)</label>
          <input type="range" min="5" max="120" step="1" value={load} onChange={(e) => setLoad(parseInt(e.target.value))} style={{ width: "100%", accentColor: S.steel }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: S.steel }}>{load} kN</span>
        </div>

        {/* 🎛️ DYNAMIC INPUT RENDERING CHANGER */}
        {solveMode === "extension" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Input Extensometer Extension (mm)</label>
            <input type="range" min="0.01" max="1.5" step="0.01" value={extension} onChange={(e) => setExtension(parseFloat(e.target.value))} style={{ width: "100%", accentColor: S.steel }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: S.steel }}>{extension} mm</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Input Known Alloy Modulus (E in GPa)</label>
            <input type="number" step="5" min="10" value={knownModulus} onChange={(e) => setKnownModulus(parseFloat(e.target.value) || 0)} style={{ padding: "6px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff", fontWeight: 600 }} />
            <span style={{ fontSize: 11, color: S.text3 }}>e.g. Aluminum ~70, Steel ~200, Copper ~110</span>
          </div>
        )}
      </div>

      {/* Output Presentation Results Panel */}
      <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Calculated Tensile Specimen Mechanics</div>
        
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
            <span>Calculated Engineering Stress:</span>
            <strong>{engineeringStress.toFixed(1)} MPa (N/mm²)</strong>
          </div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (engineeringStress / 800) * 100)}%`, height: "100%", background: S.steel }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: `0.5px solid ${S.border}`, paddingTop: 8, marginTop: 4 }}>
          <span>{solveMode === "modulus" ? "Predicted Extension (Back-Calculated):" : "Extensometer Extension:"}</span>
          <strong style={{ color: S.steel }}>{activeExtension.toFixed(4)} mm</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span>Extensometer Strain Yield:</span>
          <strong>{(activeStrain * 100).toFixed(3)} % Elongation</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span>Modulus of Elasticity (Young's Modulus E):</span>
          <strong style={{ color: S.gold }}>{activeModulus.toFixed(1)} GPa</strong>
        </div>
      </div>
    </div>
  );
}
// 🎛️ STANDALONE METALLURGICAL ENGINE: CAT 2 DIAGRAM 2 (POURBAIX CALCULATOR)
function PourbaixCalculations() {
  const [metal, setMetal] = useState("Fe");
  const [ph, setPh] = useState(7.0); // 0 to 14
  const [potential, setPotential] = useState(0.0); // Eh (Volts)

  // Electrochemical Matrix Logic (Nernst-based Phase Approximations)
  let stabilityState = "";
  let chemicalSpecies = "";
  let statusColor = "";
  let badgeEmoji = "";

  if (metal === "Fe") {
    // Iron Pourbaix Phase Bounds
    if (potential < -0.6 - (0.059 * ph)) {
      stabilityState = "Immunity (👑 Safe)";
      chemicalSpecies = "Pure Elemental Iron (Fe⁰ solid matrix)";
      statusColor = "#27ae60"; // Green
      badgeEmoji = "👑";
    } else if (ph < 4.0 || (ph >= 4.0 && ph < 9.0 && potential > 0.77)) {
      stabilityState = "Active Corrosion (⚠️ High Risk)";
      chemicalSpecies = "Soluble Aqueous Ions (Fe²⁺ / Fe³⁺ dissolution)";
      statusColor = "#c0392b"; // Red
      badgeEmoji = "⚠️";
    } else if (ph >= 4.0 && ph <= 12.0 && potential >= -0.6 && potential <= 0.77) {
      stabilityState = "Passivation (🛡️ Protected Oxide)";
      chemicalSpecies = "Adherent Protective Film (Fe₂O₃ / Fe₃O₄ Magnetite)";
      statusColor = "#2980b9"; // Blue
      badgeEmoji = "🛡️";
    } else {
      stabilityState = "Alkaline Corrosion (⚠️ High Risk)";
      chemicalSpecies = "Soluble Ferrate Complex Ions (HFeO₂⁻ / FeO₄²⁻)";
      statusColor = "#e67e22"; // Orange
      badgeEmoji = "⚠️";
    }
  } else if (metal === "Cu") {
    // Copper Pourbaix Phase Bounds
    if (potential < 0.34 - (0.059 * ph)) {
      stabilityState = "Immunity (👑 Safe)";
      chemicalSpecies = "Pure Elemental Copper (Cu⁰ solid matrix)";
      statusColor = "#27ae60";
      badgeEmoji = "👑";
    } else if (ph < 6.0 || ph > 13.0) {
      stabilityState = "Active Acidic/Alkaline Corrosion (⚠️ High Risk)";
      chemicalSpecies = "Soluble Copper Gilded Salts (Cu²⁺ / CuO₂²⁻)";
      statusColor = "#c0392b";
      badgeEmoji = "⚠️";
    } else {
      stabilityState = "Passivation (🛡️ Protected Oxide)";
      chemicalSpecies = "Cupric/Cuprous Passive Mineral Scale (Cu₂O / CuO)";
      statusColor = "#2980b9";
      badgeEmoji = "🛡️";
    }
  } else {
    // Zinc Pourbaix Phase Bounds
    if (potential < -0.76) {
      stabilityState = "Immunity (👑 Safe)";
      chemicalSpecies = "Pure Solid Zinc Coating (Zn⁰ sacrificial crystal)";
      statusColor = "#27ae60";
      badgeEmoji = "👑";
    } else if (ph >= 8.5 && ph <= 11.5) {
      stabilityState = "Passivation (🛡️ Protected Zinc Scale)";
      chemicalSpecies = "Zinc Hydroxide Passive Crust (Zn(OH)₂ solid)";
      statusColor = "#2980b9";
      badgeEmoji = "🛡️";
    } else {
      stabilityState = "Rapid Galvanic Corrosion (⚠️ High Risk)";
      chemicalSpecies = "Highly Soluble Zincates (Zn²⁺ / ZnO₂²⁻ weeping matrix)";
      statusColor = "#c0392b";
      badgeEmoji = "⚠️";
    }
  }

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>📊 Pourbaix Electrochemical Stability Engine</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1rem" }}>Simulate pH solutions and electrical voltage potentials to calculate structural corrosion maps.</div>

      {/* Control Input Matrix Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Target Mechanical Alloy</label>
          <select value={metal} onChange={(e) => setMetal(e.target.value)} style={{ padding: "6px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff", fontWeight: 500 }}>
            <option value="Fe">Structural Iron / Carbon Steel</option>
            <option value="Cu">Industrial Copper Piping</option>
            <option value="Zn">Galvanized Sacrificial Zinc</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 }}>
            <span>Environmental Acidity: <strong>pH {ph.toFixed(1)}</strong></span>
          </div>
          <input type="range" min="0" max="14" step="0.1" value={ph} onChange={(e) => setPh(parseFloat(e.target.value))} style={{ width: "100%", accentColor: S.steel }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 }}>
            <span>Electrochemical Voltage Potential (E_h vs SHE): <strong>{potential > 0 ? `+${potential.toFixed(2)}` : potential.toFixed(2)} V</strong></span>
            <span style={{ color: potential > 1.23 || potential < 0.0 ? "#b23b3b" : "#27ae60", fontSize: 10 }}>
              {potential > 1.23 ? "Oxygen Evolution Zone" : potential < 0.0 ? "Hydrogen Evolution Zone" : "Water Stable Window"}
            </span>
          </div>
          <input type="range" min="-1.5" max="1.5" step="0.05" value={potential} onChange={(e) => setPotential(parseFloat(e.target.value))} style={{ width: "100%", accentColor: S.goldMid }} />
        </div>
      </div>

      {/* Real-time Aqueous Stability Assessment Report */}
      <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Calculated Corrosion Assessment</div>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `0.5px solid ${S.border}`, paddingBottom: 6 }}>
          <span style={{ fontSize: 12, color: S.text2 }}>Thermodynamic State:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: statusColor, display: "flex", alignItems: "center", gap: 4 }}>
            {badgeEmoji} {stabilityState}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingTop: 2 }}>
          <span>Equilibrium Surface Product:</span>
          <strong style={{ color: S.steel, textAlign: "right" }}>{chemicalSpecies}</strong>
        </div>

        {/* Dynamic Risk Bar Gauge */}
        <div style={{ marginTop: 4 }}>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ 
              width: stabilityState.includes("Immunity") ? "33%" : stabilityState.includes("Passivation") ? "66%" : "100%", 
              height: "100%", 
              background: statusColor 
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
// 🎛️ STANDALONE METALLURGICAL ENGINE: CAT 2 DIAGRAM 3 (JOMINY PROFILE)
function JominyCalculations() {
  const [alloy, setAlloy] = useState("4140");
  
  // Standard laboratory test point entries (Rockwell HRC)
  const [j1, setJ1] = useState(55);  // 1/16"
  const [j4, setJ4] = useState(52);  // 4/16"
  const [j8, setJ8] = useState(45);  // 8/16"
  const [j16, setJ16] = useState(35); // 16/16"

  // Theoretical standard reference ranges for validation checks
  const maxPotentialHRC = alloy === "4140" ? 60 : 55;
  const expectedTailHRC = alloy === "4140" ? 30 : 15;

  // Structural Engineering Calculations
  const hardnessDrop = Math.max(0, j1 - j16);
  
  // High-hardenability alloys maintain their hardness deep into the bar (Lower Slope drop-off coefficient)
  const structuralAssessment = hardnessDrop < 15 
    ? "High Deep-Hardening Profile: Excellent alloy response. Suitable for heavy industrial transmission gears and deep-hardened shafts."
    : "Shallow Hardening Profile: Rapid cooling required. Hardness drops severely away from tip. Restricted to thin-walled structural sheets.";

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>📊 Jominy End-Quench Hardenability Profile Ledger</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1.25rem" }}>Input Rockwell C (HRC) laboratory measurements to profile cross-sectional depth-of-hardening slopes.</div>

      {/* Chemistry Selection Option Panel */}
      <div style={{ marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: S.steel, textTransform: "uppercase" }}>Batch Steel Composition</label>
        <select value={alloy} onChange={(e) => {
          setAlloy(e.target.value);
          if (e.target.value === "1045") { setJ1(50); setJ4(35); setJ8(22); setJ16(15); }
          else { setJ1(55); setJ4(52); setJ8(45); setJ16(35); }
        }} style={{ padding: "8px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: S.bg2, fontWeight: 600, color: S.text }}>
          <option value="4140">AISI 4140 Chromoly Steel (High Depth Capability)</option>
          <option value="1045">AISI 1045 Plain Carbon Steel (Shallow Depth Capability)</option>
        </select>
      </div>

      {/* Manual Data Entry Matrix Grid Checkpoints */}
      <div style={{ fontSize: 11, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Laboratory Specimen Checkpoint Entries</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: S.text2 }}>J1 (1/16")</label>
          <input type="number" min="5" max="70" value={j1} onChange={(e) => setJ1(parseInt(e.target.value) || 0)} style={{ padding: "6px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff", textAlign: "center", fontWeight: 700 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: S.text2 }}>J4 (4/16")</label>
          <input type="number" min="5" max="70" value={j4} onChange={(e) => setJ4(parseInt(e.target.value) || 0)} style={{ padding: "6px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff", textAlign: "center", fontWeight: 700 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: S.text2 }}>J8 (8/16")</label>
          <input type="number" min="5" max="70" value={j8} onChange={(e) => setJ8(parseInt(e.target.value) || 0)} style={{ padding: "6px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff", textAlign: "center", fontWeight: 700 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: S.text2 }}>J16 (16/16")</label>
          <input type="number" min="5" max="70" value={j16} onChange={(e) => setJ16(parseInt(e.target.value) || 0)} style={{ padding: "6px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: "#fff", textAlign: "center", fontWeight: 700 }} />
        </div>
      </div>

      {/* Dynamic Hardenability Plot Representation Bars */}
      <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Calculated Cross-Sectional Hardness Curve Drop-offs</div>
        
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}><span>Tip Boundary Hardness (J1)</span><strong>{j1} HRC</strong></div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${(j1 / 70) * 100}%`, height: "100%", background: "#b23b3b" }} /></div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}><span>Intermediate Core (J4)</span><strong>{j4} HRC</strong></div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${(j4 / 70) * 100}%`, height: "100%", background: S.steel }} /></div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}><span>Deep Core Checkpoint (J8)</span><strong>{j8} HRC</strong></div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${(j8 / 70) * 100}%`, height: "100%", background: S.steel }} /></div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}><span>Air Cooled Tail End (J16)</span><strong>{j16} HRC</strong></div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${(j16 / 70) * 100}%`, height: "100%", background: S.goldMid }} /></div>
        </div>
      </div>

      {/* Metallurgical Integrity Warning Checks */}
      {(j1 > maxPotentialHRC || j16 < expectedTailHRC) && (
        <div style={{ background: "rgba(178,59,59,0.08)", border: "0.5px solid #b23b3b", color: "#b23b3b", padding: 8, borderRadius: 6, fontSize: 11, marginBottom: 10, fontWeight: 500 }}>
          ⚠️ <strong>Anomalous Lab Reading Detected:</strong> Data trends violate typical carbon martensitic transformation constraints for standard {alloy} chemistry bounds. Please verify physical indent dimensions.
        </div>
      )}

      <div style={{ fontSize: 12, fontStyle: "italic", color: S.steel, borderTop: `0.5px solid ${S.border}`, paddingTop: 8, marginTop: 4 }}>
        🔬 <strong>Depth Hardenability Assessment:</strong> {structuralAssessment}
      </div>
    </div>
  );
}

function Dashboard({ plan, onBack }) {
  // Read cache matrix to check if user has a persistent open view state saved
const [tab, setTab] = useState(() => {
  return localStorage.getItem("METAL_ACTIVE_TAB") || "consult";
});

  const [labCategory, setLabCategory] = useState(null); // <── PASTE THIS: Tracks "constant" or "input" choice
  const [selectedGraph, setSelectedGraph] = useState(null); // Tracks the open graph page
  const [tempKey, setTempKey] = useState("");
  const planInfo = PLANS.find((p) => p.id === plan);
  const tc = { free: { bg: "#f0f0f0", color: "#888" }, pro: { bg: "#e8f4fd", color: "#1a6fa0" }, max: { bg: S.goldLight, color: S.gold } }[plan];

  const saveLocalKey = () => {
    if(!tempKey.trim().startsWith("gsk_")) { alert("Please enter a valid Groq key starting with gsk_"); return; }
    localStorage.setItem("LOCAL_GROQ_KEY", tempKey.trim());
    alert("API Configuration Saved! Refreshing window...");
    window.location.reload();
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1rem 0", maxWidth: 700, margin: "0 auto" }}>
      {/* 🛠️ SECURE CLIENT CONFIGURATION MODAL BAR */}
      {!localStorage.getItem("LOCAL_GROQ_KEY") && (
        <div style={{ background: S.goldLight, border: `1px solid ${S.goldMid}`, borderRadius: S.radiusMd, padding: 12, marginBottom: 15, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: S.text, fontWeight: 500 }}>🔑 Input Groq Key to Activate AI Core:</span>
          <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} placeholder="gsk_..." style={{ flex: 1, padding: "5px 10px", fontSize: 12, borderRadius: 4, border: `1px solid ${S.border2}` }} />
          <button onClick={saveLocalKey} style={{ background: S.steel, color: "#fff", border: "none", padding: "5px 12px", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save Key</button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: `0.5px solid ${S.border}`, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: S.steel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔩</div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 600, color: S.text }}>Metal</span>
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: tc.bg, color: tc.color }}>{planInfo.name}</span>
          </div>
        </div>
        <div onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 7, background: S.bg2, border: `0.5px solid ${S.border}`, borderRadius: 999, padding: "4px 12px 4px 4px", cursor: "pointer", fontSize: 13, color: S.text }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#e8ebed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: S.steel }}>EN</div>
          Sign out
        </div>
      </div>
     <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
  {[
    { id: "consult", label: "Consultation" },
    { id: "brief", label: "Project brief" },
    { id: "eng", label: "Book engineer", locked: plan !== "max" },
    { id: "lab", label: "🔬 Metallurgical Lab" }, // <── PASTE THIS EXPLICIT FOURTH LINE RIGHT HERE
  ].map((t) => (

        <button key={t.id} onClick={() => { localStorage.setItem("METAL_ACTIVE_TAB", t.id); setTab(t.id); }} style={{ flex: 1, padding: 9, borderRadius: S.radiusMd, border: `0.5px solid ${tab === t.id ? S.steel : S.border2}`, background: tab === t.id ? S.steel : S.bg, color: tab === t.id ? "#fff" : t.locked ? S.text3 : S.text2, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{t.locked && "🔒 "}{t.label}</button>
        ))}
      </div>
           <div style={{ display: tab === "consult" ? "block" : "none" }}><Chat /></div>
      <div style={{ display: tab === "brief" ? "block" : "none" }}><Brief /></div>
      <div style={{ display: tab === "eng" ? "block" : "none" }}><EngineerPanel plan={plan} /></div>

      {/* 🔬 INTERACTIVE METALLURGICAL LAB WORKSPACE SCREEN */}
      {tab === "lab" && (
        <div style={card}>
          {/* VIEW LEVEL 1: THE TWO CATEGORIES MASTER HOMEPAGE */}
          {!labCategory && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: S.steel, marginBottom: 4 }}>🔬 Metallurgical Laboratory Suite</div>
              <div style={{ fontSize: 13, color: S.text2, marginBottom: "1.25rem" }}>Select an analytical module branch directory to explore core engineering diagrams.</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Left Clickable Card: Category 1 */}
                <div onClick={() => setLabCategory("constant")} style={{ border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, padding: 14, background: S.bg2, cursor: "pointer" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🛑</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>Category 1</div>
                  <div style={{ fontSize: 12, color: S.text2, marginTop: 2, fontWeight: 500 }}>Constant Value reference maps. Fixed thermodynamic structural bounds.</div>
                </div>

                {/* Right Clickable Card: Category 2 */}
                <div onClick={() => setLabCategory("input")} style={{ border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, padding: 14, background: S.bg2, cursor: "pointer" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🎛️</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>Category 2</div>
                  <div style={{ fontSize: 12, color: S.text2, marginTop: 2, fontWeight: 500 }}>Input Value graphs. Dynamic environmental lab calculators.</div>
                </div>
              </div>
              </div>
               )}
                    {/* VIEW LEVEL 2: COLLECTION PAGES LISTING THE GRAPH NAMES UNDER SELECTED CATEGORY */}
          {labCategory && !selectedGraph && (
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <button onClick={() => setLabCategory(null)} style={{ background: "none", border: "none", color: S.goldMid, fontWeight: 700, cursor: "pointer", fontSize: 13, padding: 0 }}>← Back to Lab Suite</button>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 10 }}>
                {labCategory === "constant" ? "🛑 Category 1: Fixed Reference Maps Collection" : "🎛️ Category 2: Dynamic Lab Data Calculators Collection"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {labCategory === "constant" ? (
                  <>
                    <button onClick={() => setSelectedGraph("iron-carbon")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>• The Iron-Carbon Phase Diagram</button>
                    <button onClick={() => setSelectedGraph("ellingham")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>• Ellingham Oxidation Stability Diagrams</button>
                    <button onClick={() => setSelectedGraph("ttt-cct")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>• TTT / CCT Transformation Curves</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setSelectedGraph("stress-strain")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>• 1. Engineering Stress-Strain Curves (Tensile Testing)</button>
                    <button onClick={() => setSelectedGraph("pourbaix")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>• 2. Pourbaix (Potential-pH) Corrosion Diagrams</button>
                    <button onClick={() => setSelectedGraph("jominy")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>• 3. Jominy Hardenability Curves</button>
                  </>
                )}
              </div>
            </div>
          )}
                    {/* VIEW LEVEL 3: INDIVIDUAL WEBPAGES FOR EACH OF THE SIX SPECIFIC GRAPH WORKSPACES */}
          {selectedGraph && (
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <button onClick={() => setSelectedGraph(null)} style={{ background: "none", border: "none", color: S.goldMid, fontWeight: 700, cursor: "pointer", fontSize: 13, padding: 0 }}>← Back to Collection</button>
              </div>

              {selectedGraph === "iron-carbon" && <IronCarbonCalculations />}

                            {/* ✅ MOUNT DYNAMIC THERMODYNAMIC EXTRACTION GRAPH CALCULATOR */}
              {selectedGraph === "ellingham" && <EllinghamCalculations />}

                           {/* ✅ MOUNT DYNAMIC KINETICS COOLING TRANSFORMATION CALCULATOR */}
              {selectedGraph === "ttt-cct" && <TttCctCalculations />}

                            {/* ✅ MOUNT DYNAMIC LABORATORY TENSILE TEST DATA PLOTTER ENGINE */}
              {selectedGraph === "stress-strain" && <StressStrainCalculations />}

                            {/* ✅ MOUNT DYNAMIC INTERACTIVE POURBAIX STABILITY CALCULATOR */}
              {selectedGraph === "pourbaix" && <PourbaixCalculations />}

                            {/* ✅ MOUNT DYNAMIC INTERACTIVE JOMINY HARDENABILITY PROFILE PROFILE LEDGER */}
              {selectedGraph === "jominy" && <JominyCalculations />}

            </div>
          )}


        </div>
      )}
    </div>
  );
}

// 🔑 PHASE 1 PRODUCTION ROUTER: INITIAL MARKETING SPLASH PAGE -> AUTH TERMINAL -> CORE WORKSPACE
export default function App() {
  // Check browser cache for existing active login tokens on initial page load
  const [userSession, setUserSession] = useState(() => {
    return localStorage.getItem("METAL_ACTIVE_USER") || null;
  });

  // Inner-app routing states
  const [viewMode, setViewMode] = useState("splash"); // "splash" (Initial interface) or "auth" (Login page)
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");

  // Handle account profile processing or secure sandbox logins
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please fill out all structural parameters.");
      return;
    }

    // Capture user profile handle identifier string
    const userIdentifier = isSignUp ? (fullname.trim() || email.split("@")[0]) : email.split("@")[0];
    
    // Lock active session securely into local persistent hardware cache
    localStorage.setItem("METAL_ACTIVE_USER", userIdentifier);
    localStorage.setItem("METAL_ACTIVE_PLAN", isSignUp ? "pro" : "max");
    
    setUserSession(userIdentifier);
  };

  const handleSignOut = () => {
    localStorage.removeItem("METAL_ACTIVE_USER");
    localStorage.removeItem("METAL_ACTIVE_PLAN");
    localStorage.removeItem("METAL_ACTIVE_TAB");
    window.location.reload();
  };

  // IF USER IS FULLY LOGGED IN: RENDERS ACTIVE REPLICA INTERFACE & CALCULATOR GRID
  if (userSession) {
    const cachedPlan = localStorage.getItem("METAL_ACTIVE_PLAN") || "pro";
    return <Dashboard plan={cachedPlan} onBack={handleSignOut} />;
  }

    // 🗺️ STAGE 1: UPGRADED HIGH-END METALLURGICAL INDUSTRIAL INTERFACE VIEW
  if (viewMode === "splash") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1.5rem", position: "relative", overflow: "hidden", fontFamily: "system-ui, sans-serif", background: "linear-gradient(135deg, #11161b 0%, #202b36 50%, #0d1114 100%)" }}>
        
        {/* Abstract Geometrical Metal Facet Shards Background Layer */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "60%", height: "60%", background: "linear-gradient(45deg, rgba(127,140,141,0.15), transparent)", transform: "rotate(15deg)", clipPath: "polygon(0 0, 100% 20%, 80% 100%, 0 80%)" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "50%", height: "60%", background: "linear-gradient(225deg, rgba(212,160,23,0.08), transparent)", transform: "rotate(-10deg)", clipPath: "polygon(20% 0, 100% 40%, 70% 100%, 0 100%)" }} />

        {/* 💻 Glassmorphic Screen Container Panel */}
        <div style={{ position: "relative", zIndex: 10, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 24, padding: "3rem 2rem", maxWidth: 460, width: "100%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", textAlign: "center" }}>
          
          {/* ⚛️ Layered Atomic Metal Ingot Vector Emblem */}
          <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 1.5rem auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Outer Atomic Orbital Electron Rings */}
            <svg style={{ position: "absolute", width: "100%", height: "100%", transform: "rotate(45deg)" }} viewBox="0 0 100 100">
              <ellipse cx="50" cy="50" rx="45" ry="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <ellipse cx="50" cy="50" rx="45" ry="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" style={{ transform: "rotate(60deg)", transformOrigin: "50px 50px" }} />
              <ellipse cx="50" cy="50" rx="45" ry="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" style={{ transform: "rotate(120deg)", transformOrigin: "50px 50px" }} />
            </svg>
            {/* Inner Premium Polished Steel Structural Ingot Inset */}
            <div style={{ position: "relative", zIndex: 2, width: 44, height: 26, background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #475569 100%)", borderRadius: 4, transform: "rotate(-15deg) skewX(-20deg)", boxShadow: "5px 5px 15px rgba(0,0,0,0.3), inset 1px 1px 0px rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "90%", height: "2px", background: "rgba(255,255,255,0.3)", position: "absolute", top: 2, transform: "rotate(1deg)" }} />
            </div>
          </div>
          
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#ffffff", margin: "0 0 6px 0", letterSpacing: "0.5px" }}>Metal AI Platform</h1>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#d4a017", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 1.25rem 0" }}>Core Intelligence Terminal</p>
          
          <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: "1.6", margin: "0 0 2.25rem 0", padding: "0 8px" }}>
            Cloud access node for your senior metallurgical engineering consultant. 
            Providing high-velocity access to active microstructural lookup maps, phase kinetics simulators, and dynamic laboratory analytics tools.
          </p>

          {/* ⚡ Frost-Glass Action Interactive Trigger Button */}
          <button onClick={() => setViewMode("auth")} style={{ position: "relative", width: "100%", padding: "14px", borderRadius: 12, background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#ffffff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}>
            Get Started
          </button>

          <div style={{ fontSize: 10, color: "#64748b", marginTop: 18, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
            🔒 Secure Academic & Enterprise Layer
          </div>
        </div>
      </div>
    );
  }


  // 🔑 STAGE 2: TERMINAL SIGN-IN WEB INTERFACE ACCOUNT FORM PORTAL
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f7f7f5", fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
      <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "2rem", maxWidth: 400, width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <button onClick={() => setViewMode("splash")} style={{ background: "none", border: "none", color: S.text2, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}>← Return</button>
          <span style={{ fontSize: 20 }}>🔩</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: S.steel, margin: "0 0 4px 0" }}>
            {isSignUp ? "Create Research Credentials" : "Terminal Identity Verification"}
          </h2>
          <p style={{ fontSize: 12, color: S.text3, margin: 0 }}>Initialize secure microchip socket connection gateway</p>
        </div>

        <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isSignUp && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Full Professional Name</label>
              <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Dr. Jane Doe" style={{ padding: "8px 12px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13 }} required />
            </div>
          )}
          
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Academic / Enterprise Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="metallurgist@university.edu" style={{ padding: "8px 12px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13 }} required />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: S.text2 }}>Secure Key Access Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ padding: "8px 12px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13 }} required />
          </div>

          <button type="submit" style={{ background: S.steel, color: "#ffffff", border: "none", padding: "10px", borderRadius: S.radiusMd, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 6 }}>
            {isSignUp ? "Generate Research Account" : "Initialize Secure Terminal Sign-In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.25rem", borderTop: `0.5px solid ${S.border}`, paddingTop: "1rem" }}>
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: "none", border: "none", color: S.goldMid, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {isSignUp ? "Already registered? Access secure terminal" : "Need credentials? Request client sandbox profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
