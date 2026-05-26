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
  // Reads the hidden api key from Vercel's environment setup
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("API Key setup missing. Please read instructions.");
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
      model: "llama3-70b-8192", // High-tier free open-source reasoning engine
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
