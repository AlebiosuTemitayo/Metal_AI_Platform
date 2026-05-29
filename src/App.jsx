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

function Dashboard({ plan, onBack }) {
  const [tab, setTab] = useState("consult");
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

          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: 9, borderRadius: S.radiusMd, border: `0.5px solid ${tab === t.id ? S.steel : S.border2}`, background: tab === t.id ? S.steel : S.bg, color: tab === t.id ? "#fff" : t.locked ? S.text3 : S.text2, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{t.locked && "🔒 "}{t.label}</button>
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

                            {selectedGraph === "iron-carbon" && (
                <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>📊 Equilibrium Phase Calculator (Lever Rule)</div>
                  <div style={{ fontSize: 12, color: S.text2, marginBottom: "1rem" }}>Adjust parameters to dynamically track microstructural component weight fractions.</div>

                  {/* Internal state controls nested for this sub-view */}
                  {(() => {
                    // We use local state variables dynamically linked to global window objects for persistence
                    if (window.localCarbon === undefined) window.localCarbon = 0.4;
                    if (window.localTemp === undefined) window.localTemp = 700;
                    
                    const [c, setC] = useState(window.localCarbon);
                    const [t, setT] = useState(window.localTemp);

                    const handleC = (val) => { window.localCarbon = val; setC(val); };
                    const handleT = (val) => { window.localTemp = val; setT(val); };

                    // Lever Rule Math Formulas
                    let phaseText = "";
                    let alpha = 0;
                    let fe3c = 0;
                    let gamma = 0;

                    if (t <= 727) {
                      const aLim = 0.022;
                      const cLim = 6.67;
                      const boundedC = Math.max(aLim, Math.min(cLim, c));
                      alpha = ((cLim - boundedC) / (cLim - aLim)) * 100;
                      fe3c = ((boundedC - aLim) / (cLim - aLim)) * 100;
                      phaseText = boundedC < 0.76 
                        ? `Hypoeutectoid Steel: Proeutectoid Ferrite (α) + Pearlite Grains` 
                        : `Hypereutectoid Steel: Primary Cementite (Fe₃C) Networks + Pearlite`;
                    } else {
                      if (c <= 0.76) {
                        gamma = 100;
                        phaseText = "Fully Austenitized Solid Field (γ-Iron Structural Lattice)";
                      } else {
                        gamma = ((6.67 - c) / (6.67 - 0.76)) * 100;
                        fe3c = ((c - 0.76) / (6.67 - 0.76)) * 100;
                        phaseText = "Austenite Matrix (γ) with secondary Cementite precipitation";
                      }
                    }

                    return (
                      <>
                        {/* Sliders panel layout */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
                              <span>Carbon Composition: <strong>{c}% C</strong></span>
                              <span style={{ color: S.text3 }}>Max steel constraint: 2.0%</span>
                            </div>
                            <input type="range" min="0.03" max="2.0" step="0.01" value={c} onChange={(e) => handleC(parseFloat(e.target.value))} style={{ width: "100%", accentColor: S.steel }} />
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
                              <span>Target Temperature: <strong>{t}°C</strong></span>
                              <span style={{ color: t > 727 ? S.gold : "#4caf50", fontSize: 11 }}>{t > 727 ? "Above A1 Eutectoid Line" : "Below A1 Eutectoid Line"}</span>
                            </div>
                            <input type="range" min="400" max="1000" step="10" value={t} onChange={(e) => handleT(parseInt(e.target.value))} style={{ width: "100%", accentColor: S.goldMid }} />
                          </div>
                        </div>

                        {/* Real-time Graph Display Bars */}
                        <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Calculated Structural Volumes</div>
                          {t <= 727 ? (
                            <>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Ferrite (α-Iron Phase)</span><strong>{alpha.toFixed(1)}%</strong></div>
                                <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${alpha}%`, height: "100%", background: S.steel }} /></div>
                              </div>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Cementite (Fe₃C Carbide)</span><strong>{fe3c.toFixed(1)}%</strong></div>
                                <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${fe3c}%`, height: "100%", background: S.goldMid }} /></div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Austenite (γ-Phase Matrix)</span><strong>{gamma.toFixed(1)}%</strong></div>
                                <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${gamma}%`, height: "100%", background: S.gold }} /></div>
                              </div>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Boundary Cementite (Fe₃C)</span><strong>{fe3c.toFixed(1)}%</strong></div>
                                <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${fe3c}%`, height: "100%", background: S.text2 }} /></div>
                              </div>
                            </>
                          )}
                        </div>

                        <div style={{ fontSize: 12, fontStyle: "italic", color: S.steel, textAlign: "center", borderTop: `0.5px solid ${S.border}`, paddingTop: 8, marginTop: 4 }}>
                          💡 Matrix State: <strong>{phaseText}</strong>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {selectedGraph === "ellingham" && (
                <div style={{ background: S.bg2, padding: 15, borderRadius: S.radiusMd, border: `1px solid ${S.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.steel }}>📊 Ellingham Oxidation Stability Workspace</div>
                  <div style={{ fontSize: 13, color: S.text2, marginTop: 4 }}>Welcome to the Ellingham Free Energy calculator. Coming soon: Pyrometallurgical reduction stability vectors.</div>
                </div>
              )}
              {selectedGraph === "ttt-cct" && (
                <div style={{ background: S.bg2, padding: 15, borderRadius: S.radiusMd, border: `1px solid ${S.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.steel }}>📊 TTT / CCT Kinetic Transformation Workspace</div>
                  <div style={{ fontSize: 13, color: S.text2, marginTop: 4 }}>Welcome to the Time-Temperature phase maps. Coming soon: Martensitic cooling transformation paths.</div>
                </div>
              )}
              {selectedGraph === "stress-strain" && (
                <div style={{ background: S.bg2, padding: 15, borderRadius: S.radiusMd, border: `1px solid ${S.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.steel }}>📊 Tensile Stress-Strain Plotter Workspace</div>
                  <div style={{ fontSize: 13, color: S.text2, marginTop: 4 }}>Welcome to the Mechanical Tensile testing deck. Coming soon: ASTM E8 raw lab data calculation rows.</div>
                </div>
              )}
              {selectedGraph === "pourbaix" && (
                <div style={{ background: S.bg2, padding: 15, borderRadius: S.radiusMd, border: `1px solid ${S.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.steel }}>📊 Pourbaix Electrochemical Corrosion Workspace</div>
                  <div style={{ fontSize: 13, color: S.text2, marginTop: 4 }}>Welcome to the pH-Potential stability grid. Coming soon: Active passivation boundary shifts.</div>
                </div>
              )}
              {selectedGraph === "jominy" && (
                <div style={{ background: S.bg2, padding: 15, borderRadius: S.radiusMd, border: `1px solid ${S.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.steel }}>📊 Jominy End-Quench Hardenability Workspace</div>
                  <div style={{ fontSize: 13, color: S.text2, marginTop: 4 }}>Welcome to the Depth-of-Hardening ledger. Coming soon: Rockwell HRC manual entry coordinate matrices.</div>
                </div>
              )}
            </div>
          )}


        </div>
      )}
    </div>
  );
}

export default function App() {
  const [plan, setPlan] = useState(null);
  if (!plan) return <Landing onSelect={setPlan} />;
  return <Dashboard plan={plan} onBack={() => setPlan(null)} />;
}
