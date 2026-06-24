import { useState, useRef, useEffect } from "react";

const SYSTEM = `You are a senior metallurgical and materials engineer with 25+ years of experience, working as a consultant through Metal â€” a professional engineering consultation platform. You provide expert, peer-level advice to engineers and project managers.

Your expertise: material selection, failure analysis, manufacturing and fabrication processes (casting, forging, machining, welding, heat treatment, powder metallurgy), corrosion mechanisms and mitigation, mechanical and physical properties, and industry standards (ASTM, ISO, BS EN, ASME, API, NACE).

Tone: professional, precise, and direct â€” like a trusted colleague. Give specific alloy grades, standard references, and actionable recommendations. Do not use disclaimers. If something is outside your expertise, say so plainly.`;

const PLANS = [
  {
    id: "free",
    name: "Starter",
    price: "Free",
    icon: "ðŸª¨",
    features: ["5 consultations per month", "Material selection queries", "Basic project brief"],
    locked: ["Failure analysis reports", "Live engineer sessions"],
    popular: false,
  },
  {
    id: "pro",
    name: "Professional",
    price: "$49",
    icon: "âš™ï¸",
    features: ["Unlimited consultations", "Full material selection", "Failure analysis reports", "Manufacturing process advice"],
    locked: ["Live engineer sessions"],
    popular: true,
  },
  {
    id: "max",
    name: "Max",
    price: "$149",
    icon: "ðŸ†",
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
      elements.push(<div key={i} style={{display:"flex",gap:8,margin:"3px 0",fontSize:13,lineHeight:1.6}}><span style={{color:"#d4a017",fontWeight:700,flexShrink:0}}>â€¢</span><span dangerouslySetInnerHTML={{__html:content}}/></div>);
    } else if (line.trim()==="") {
      elements.push(<div key={i} style={{height:5}}/>);
    } else {
      const content = line.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
      elements.push(<div key={i} style={{fontSize:13,lineHeight:1.65,margin:"2px 0"}} dangerouslySetInnerHTML={{__html:content}}/>);
    }
  });
  return <div>{elements}</div>;
}

// â”€â”€ 100% FREE GROQ API ENGINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function callGroqFree(messages, systemPrompt) {
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

// â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CHART COMPONENTS â€” accurate SVG-plotted metallurgical diagrams
// Each chart receives the SAME values driving the sliders, so the
// marker shown on the chart always matches the numeric readout.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// ---------- IRON-CARBON PHASE DIAGRAM ----------
// Key points: Eutectoid 0.77%C/723Â°C Â· Eutectic 4.30%C/1147Â°C
// Peritectic 0.17%C/1493Â°C Â· A3 at 0%C = 912Â°C Â· Acm from eutectoid to eutectic
const IC_X_MIN = 0.01, IC_X_MAX = 6.67;
const IC_PLOT_X0 = 70, IC_PLOT_X1 = 610;
function icXToPx(c) {
  const cc = Math.max(IC_X_MIN, Math.min(IC_X_MAX, c));
  const logMin = Math.log10(IC_X_MIN), logMax = Math.log10(IC_X_MAX);
  const frac = (Math.log10(cc) - logMin) / (logMax - logMin);
  return IC_PLOT_X0 + frac * (IC_PLOT_X1 - IC_PLOT_X0);
}
const IC_T_MIN = 300, IC_T_MAX = 1600;
const IC_PLOT_Y0 = 40, IC_PLOT_Y1 = 460;
function icTToPx(t) {
  const tt = Math.max(IC_T_MIN, Math.min(IC_T_MAX, t));
  const frac = (tt - IC_T_MIN) / (IC_T_MAX - IC_T_MIN);
  return IC_PLOT_Y1 - frac * (IC_PLOT_Y1 - IC_PLOT_Y0);
}
function icPath(pts) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${icXToPx(p.c).toFixed(1)} ${icTToPx(p.t).toFixed(1)}`).join(" ");
}
const IC_PURE_FE_MELT = { c: 0, t: 1538 };
const IC_PERITECTIC_L = { c: 0.10, t: 1493 };
const IC_PERITECTIC_G = { c: 0.17, t: 1493 };
const IC_PERITECTIC_D = { c: 0.53, t: 1493 };
const IC_AUSTENITE_MAX = { c: 2.11, t: 1147 };
const IC_EUTECTIC = { c: 4.30, t: 1147 };
const IC_FE3C_MELT = { c: 6.67, t: 1227 };
const IC_A3_TOP = { c: 0, t: 912 };
const IC_EUTECTOID = { c: 0.77, t: 723 };
const IC_SOLVUS_ROOM = { c: 0.008, t: 300 };
const IC_ALPHA_MAX = { c: 0.022, t: 723 };

function IronCarbonChart({ carbon, temp }) {
  const markerX = icXToPx(carbon);
  const markerY = icTToPx(temp);
  const tGrid = [400, 600, 723, 912, 1147, 1493, 1538];
  const cGrid = [0.01, 0.1, 0.77, 1, 2, 2.11, 4.3, 6.67];

  return (
    <svg viewBox="0 0 680 520" width="100%" style={{ display: "block" }}>
      <rect x={IC_PLOT_X0} y={IC_PLOT_Y0} width={IC_PLOT_X1 - IC_PLOT_X0} height={IC_PLOT_Y1 - IC_PLOT_Y0} fill="#fcfcfb" stroke={S.border2} strokeWidth="1" />
      {tGrid.map((t) => (
        <g key={t}>
          <line x1={IC_PLOT_X0} y1={icTToPx(t)} x2={IC_PLOT_X1} y2={icTToPx(t)} stroke={S.border} strokeWidth="0.5" strokeDasharray={t === 723 || t === 1147 || t === 1493 ? "0" : "3,3"} />
          <text x={IC_PLOT_X0 - 8} y={icTToPx(t)} fontSize="10" fill={S.text2} textAnchor="end" dominantBaseline="central">{t}Â°C</text>
        </g>
      ))}
      {cGrid.map((c) => (
        <g key={c}>
          <line x1={icXToPx(c)} y1={IC_PLOT_Y0} x2={icXToPx(c)} y2={IC_PLOT_Y1} stroke={S.border} strokeWidth="0.5" strokeDasharray={c === 0.77 || c === 4.3 ? "0" : "3,3"} />
          <text x={icXToPx(c)} y={IC_PLOT_Y1 + 16} fontSize="10" fill={S.text2} textAnchor="middle">{c}%</text>
        </g>
      ))}

      <path d={icPath([IC_PURE_FE_MELT, IC_PERITECTIC_L])} fill="none" stroke={S.steel} strokeWidth="1.5" />
      <path d={icPath([IC_PERITECTIC_D, IC_AUSTENITE_MAX, IC_EUTECTIC])} fill="none" stroke={S.steel} strokeWidth="1.5" />
      <path d={icPath([IC_EUTECTIC, IC_FE3C_MELT])} fill="none" stroke={S.steel} strokeWidth="1.5" />
      <path d={icPath([IC_PERITECTIC_L, IC_PERITECTIC_D])} fill="none" stroke={S.steel} strokeWidth="1.5" />
      <path d={icPath([IC_PURE_FE_MELT, { c: 0.02, t: 1495 }, IC_PERITECTIC_G])} fill="none" stroke={S.steel} strokeWidth="1" strokeDasharray="2,2" />
      <path d={icPath([IC_PERITECTIC_G, IC_AUSTENITE_MAX])} fill="none" stroke={S.steel} strokeWidth="1" strokeDasharray="2,2" />
      <path d={icPath([IC_AUSTENITE_MAX, IC_EUTECTIC, IC_FE3C_MELT])} fill="none" stroke={S.gold} strokeWidth="1.5" />
      <path d={icPath([IC_A3_TOP, IC_EUTECTOID])} fill="none" stroke={S.steel} strokeWidth="1.5" />
      <path d={icPath([IC_EUTECTOID, IC_AUSTENITE_MAX])} fill="none" stroke={S.steel} strokeWidth="1.5" />
      <path d={icPath([{ c: 0.008, t: 723 }, { c: 6.67, t: 723 }])} fill="none" stroke={S.gold} strokeWidth="1.5" />
      <path d={icPath([IC_ALPHA_MAX, IC_SOLVUS_ROOM])} fill="none" stroke={S.steel} strokeWidth="1" strokeDasharray="2,2" />
      <line x1={icXToPx(6.67)} y1={icTToPx(1227)} x2={icXToPx(6.67)} y2={IC_PLOT_Y1} stroke={S.steel} strokeWidth="1" />

      {[IC_EUTECTOID, IC_EUTECTIC, IC_PERITECTIC_G, IC_A3_TOP, IC_AUSTENITE_MAX].map((p, i) => (
        <circle key={i} cx={icXToPx(p.c)} cy={icTToPx(p.t)} r="3" fill="#b23b3b" />
      ))}

      <text x={icXToPx(0.15)} y={icTToPx(1100)} fontSize="11" fill={S.steel} textAnchor="middle">Î³</text>
      <text x={icXToPx(0.05)} y={icTToPx(800)} fontSize="10" fill={S.steel} textAnchor="middle">Î±+Î³</text>
      <text x={icXToPx(0.3)} y={icTToPx(650)} fontSize="11" fill={S.steel} textAnchor="middle">Î±+Feâ‚ƒC</text>
      <text x={icXToPx(0.02)} y={icTToPx(450)} fontSize="10" fill={S.steel} textAnchor="middle">Î±</text>
      <text x={icXToPx(1.5)} y={icTToPx(950)} fontSize="11" fill={S.steel} textAnchor="middle">Î³+Feâ‚ƒC</text>
      <text x={icXToPx(0.02)} y={icTToPx(1480)} fontSize="9" fill={S.text2} textAnchor="middle">Î´</text>
      <text x={icXToPx(0.4)} y={icTToPx(1560)} fontSize="9" fill={S.text2} textAnchor="middle">Liquid</text>
      <text x={icXToPx(5.3)} y={icTToPx(1000)} fontSize="10" fill={S.text2} textAnchor="middle">Feâ‚ƒC+Ledeburite</text>
      <text x={icXToPx(0.77)} y={icTToPx(723) - 10} fontSize="9.5" fill="#b23b3b" textAnchor="middle" fontWeight="700">Eutectoid 0.77%/723Â°C</text>
      <text x={icXToPx(4.3)} y={icTToPx(1147) - 10} fontSize="9.5" fill="#b23b3b" textAnchor="middle" fontWeight="700">Eutectic 4.3%/1147Â°C</text>
      <text x={icXToPx(0.17)} y={icTToPx(1493) - 10} fontSize="9" fill="#b23b3b" textAnchor="middle" fontWeight="700">Peritectic 0.17%/1493Â°C</text>

      <text x={(IC_PLOT_X0 + IC_PLOT_X1) / 2} y={500} fontSize="11" fill={S.text2} textAnchor="middle">Carbon content (wt% C, log scale)</text>
      <text x={18} y={(IC_PLOT_Y0 + IC_PLOT_Y1) / 2} fontSize="11" fill={S.text2} textAnchor="middle" transform={`rotate(-90 18 ${(IC_PLOT_Y0 + IC_PLOT_Y1) / 2})`}>Temperature (Â°C)</text>

      <line x1={markerX} y1={IC_PLOT_Y0} x2={markerX} y2={markerY} stroke={S.goldMid} strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <line x1={IC_PLOT_X0} y1={markerY} x2={markerX} y2={markerY} stroke={S.goldMid} strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <circle cx={markerX} cy={markerY} r="7" fill="#fff" stroke={S.goldMid} strokeWidth="2.5" />
      <circle cx={markerX} cy={markerY} r="2.5" fill={S.goldMid} />
    </svg>
  );
}

// ---------- ELLINGHAM DIAGRAM ----------
const EL_PLOT_X0 = 70, EL_PLOT_X1 = 610, EL_PLOT_Y0 = 40, EL_PLOT_Y1 = 380;
const EL_T_MIN = 0, EL_T_MAX = 1600;
const EL_G_MIN = -1300, EL_G_MAX = -100;
function elXToPx(tC) { return EL_PLOT_X0 + ((tC - EL_T_MIN) / (EL_T_MAX - EL_T_MIN)) * (EL_PLOT_X1 - EL_PLOT_X0); }
function elYToPx(g) { return EL_PLOT_Y1 - ((g - EL_G_MIN) / (EL_G_MAX - EL_G_MIN)) * (EL_PLOT_Y1 - EL_PLOT_Y0); }
const EL_LINES = {
  Cu: { name: "Cu/Cuâ‚‚O", dH: -338, dS: -0.14, color: "#d4a017" },
  Fe: { name: "Fe/FeO", dH: -544, dS: -0.13, color: S.steel },
  Al: { name: "Al/Alâ‚‚Oâ‚ƒ", dH: -1117, dS: -0.21, color: "#7f3fa0" },
};
const EL_CO_LINE = { dH: -565, dS: 0.17 };
function elGAt(line, tC) { return line.dH - (tC + 273.15) * line.dS; }

function EllinghamChart({ metal, temp }) {
  const tGrid = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600];
  const markerLine = EL_LINES[metal];
  const markerX = elXToPx(temp);
  const markerY = elYToPx(elGAt(markerLine, temp));

  return (
    <svg viewBox="0 0 680 420" width="100%" style={{ display: "block" }}>
      <rect x={EL_PLOT_X0} y={EL_PLOT_Y0} width={EL_PLOT_X1 - EL_PLOT_X0} height={EL_PLOT_Y1 - EL_PLOT_Y0} fill="#fcfcfb" stroke={S.border2} strokeWidth="1" />
      {tGrid.map((t) => (
        <g key={t}>
          <line x1={elXToPx(t)} y1={EL_PLOT_Y0} x2={elXToPx(t)} y2={EL_PLOT_Y1} stroke={S.border} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={elXToPx(t)} y={EL_PLOT_Y1 + 16} fontSize="10" fill={S.text2} textAnchor="middle">{t}Â°</text>
        </g>
      ))}
      {[-200, -400, -600, -800, -1000, -1200].map((g) => (
        <g key={g}>
          <line x1={EL_PLOT_X0} y1={elYToPx(g)} x2={EL_PLOT_X1} y2={elYToPx(g)} stroke={S.border} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={EL_PLOT_X0 - 8} y={elYToPx(g)} fontSize="10" fill={S.text2} textAnchor="end" dominantBaseline="central">{g}</text>
        </g>
      ))}
      {Object.entries(EL_LINES).map(([key, line]) => {
        const y0 = elYToPx(elGAt(line, EL_T_MIN));
        const y1 = elYToPx(elGAt(line, EL_T_MAX));
        return (
          <g key={key}>
            <line x1={EL_PLOT_X0} y1={y0} x2={EL_PLOT_X1} y2={y1} stroke={line.color} strokeWidth={key === metal ? 2.5 : 1.3} opacity={key === metal ? 1 : 0.55} />
            <text x={EL_PLOT_X1 + 4} y={y1} fontSize="10" fill={line.color} dominantBaseline="central">{line.name}</text>
          </g>
        );
      })}
      <line x1={EL_PLOT_X0} y1={elYToPx(elGAt(EL_CO_LINE, EL_T_MIN))} x2={EL_PLOT_X1} y2={elYToPx(elGAt(EL_CO_LINE, EL_T_MAX))} stroke="#999" strokeWidth="1.3" strokeDasharray="5,3" />
      <text x={EL_PLOT_X1 + 4} y={elYToPx(elGAt(EL_CO_LINE, EL_T_MAX))} fontSize="9.5" fill="#999" dominantBaseline="central">2CO+Oâ‚‚â†’2COâ‚‚</text>
      <text x={(EL_PLOT_X0 + EL_PLOT_X1) / 2} y={405} fontSize="11" fill={S.text2} textAnchor="middle">Temperature (Â°C)</text>
      <text x={18} y={(EL_PLOT_Y0 + EL_PLOT_Y1) / 2} fontSize="11" fill={S.text2} textAnchor="middle" transform={`rotate(-90 18 ${(EL_PLOT_Y0 + EL_PLOT_Y1) / 2})`}>Î”GÂ° (kJ/mol Oâ‚‚)</text>
      <line x1={markerX} y1={EL_PLOT_Y0} x2={markerX} y2={markerY} stroke="#b23b3b" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <line x1={EL_PLOT_X0} y1={markerY} x2={markerX} y2={markerY} stroke="#b23b3b" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <circle cx={markerX} cy={markerY} r="7" fill="#fff" stroke="#b23b3b" strokeWidth="2.5" />
      <circle cx={markerX} cy={markerY} r="2.5" fill="#b23b3b" />
    </svg>
  );
}

// ---------- TTT/CCT DIAGRAM ----------
const TC_PLOT_X0 = 70, TC_PLOT_X1 = 610, TC_PLOT_Y0 = 40, TC_PLOT_Y1 = 380;
const TC_LOG_MIN = -1, TC_LOG_MAX = 5;
const TC_T_MIN = 100, TC_T_MAX = 800;
function tcXToPx(sec) { return TC_PLOT_X0 + ((Math.log10(sec) - TC_LOG_MIN) / (TC_LOG_MAX - TC_LOG_MIN)) * (TC_PLOT_X1 - TC_PLOT_X0); }
function tcYToPx(t) { return TC_PLOT_Y1 - ((t - TC_T_MIN) / (TC_T_MAX - TC_T_MIN)) * (TC_PLOT_Y1 - TC_PLOT_Y0); }
const TC_ALLOY_CURVES = {
  "1045": {
    Ms: 220, Mf: 80,
    pearliteStart: [[723, 80],[680,8],[620,2],[560,1.1],[520,1.4],[480,4],[440,20]],
    pearliteFinish: [[723,1200],[680,60],[620,12],[560,6],[520,8],[480,30],[440,160]],
  },
  "4140": {
    Ms: 295, Mf: 150,
    pearliteStart: [[723,300],[680,30],[620,7],[560,4],[520,5],[480,15],[440,70]],
    bainiteFinish: [[480,400],[440,1200],[400,3500]],
  },
};
function tcPathFromList(list) {
  return list.map((p, i) => `${i === 0 ? "M" : "L"} ${tcXToPx(p[1]).toFixed(1)} ${tcYToPx(p[0]).toFixed(1)}`).join(" ");
}
function tcCoolingPath(medium) {
  if (medium === "Furnace") return [[723,1],[650,5],[550,40],[450,300],[350,1500],[250,8000]];
  if (medium === "Oil") return [[723,0.3],[650,1.2],[550,5],[450,18],[350,45],[250,90],[150,160]];
  return [[723,0.05],[650,0.12],[550,0.3],[450,0.6],[350,1],[250,1.6],[150,2.2]];
}

function TttCctChart({ alloy, coolingMedia }) {
  const data = TC_ALLOY_CURVES[alloy];
  const tGrid = [200, 300, 400, 500, 600, 723];
  const timeGrid = [0.1, 1, 10, 100, 1000, 10000, 100000];
  const path = tcCoolingPath(coolingMedia);

  return (
    <svg viewBox="0 0 680 420" width="100%" style={{ display: "block" }}>
      <rect x={TC_PLOT_X0} y={TC_PLOT_Y0} width={TC_PLOT_X1 - TC_PLOT_X0} height={TC_PLOT_Y1 - TC_PLOT_Y0} fill="#fcfcfb" stroke={S.border2} strokeWidth="1" />
      {timeGrid.map((t) => (
        <g key={t}>
          <line x1={tcXToPx(t)} y1={TC_PLOT_Y0} x2={tcXToPx(t)} y2={TC_PLOT_Y1} stroke={S.border} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={tcXToPx(t)} y={TC_PLOT_Y1 + 16} fontSize="9.5" fill={S.text2} textAnchor="middle">{t}</text>
        </g>
      ))}
      {tGrid.map((t) => (
        <g key={t}>
          <line x1={TC_PLOT_X0} y1={tcYToPx(t)} x2={TC_PLOT_X1} y2={tcYToPx(t)} stroke={S.border} strokeWidth="0.5" strokeDasharray={t === 723 ? "0" : "3,3"} />
          <text x={TC_PLOT_X0 - 8} y={tcYToPx(t)} fontSize="10" fill={S.text2} textAnchor="end" dominantBaseline="central">{t}Â°</text>
        </g>
      ))}
      <line x1={TC_PLOT_X0} y1={tcYToPx(723)} x2={TC_PLOT_X1} y2={tcYToPx(723)} stroke={S.gold} strokeWidth="1.3" />
      <text x={TC_PLOT_X0 + 4} y={tcYToPx(723) - 6} fontSize="9.5" fill={S.gold}>A1 = 723Â°C</text>
      <path d={tcPathFromList(data.pearliteStart)} fill="none" stroke={S.steel} strokeWidth="1.5" />
      <text x={tcXToPx(2.2)} y={tcYToPx(560) - 8} fontSize="9.5" fill={S.steel}>Ps (start)</text>
      {data.pearliteFinish && (
        <>
          <path d={tcPathFromList(data.pearliteFinish)} fill="none" stroke={S.steel} strokeWidth="1.5" strokeDasharray="2,2" />
          <text x={tcXToPx(12)} y={tcYToPx(560) + 14} fontSize="9.5" fill={S.steel}>Pf (finish)</text>
        </>
      )}
      {data.bainiteFinish && (
        <>
          <path d={tcPathFromList(data.bainiteFinish)} fill="none" stroke="#b8860b" strokeWidth="1.5" strokeDasharray="2,2" />
          <text x={tcXToPx(800)} y={tcYToPx(420)} fontSize="9.5" fill="#b8860b">Bainite</text>
        </>
      )}
      <line x1={TC_PLOT_X0} y1={tcYToPx(data.Ms)} x2={TC_PLOT_X1} y2={tcYToPx(data.Ms)} stroke="#b23b3b" strokeWidth="1" strokeDasharray="4,3" />
      <text x={TC_PLOT_X0 + 4} y={tcYToPx(data.Ms) - 6} fontSize="9.5" fill="#b23b3b">Ms = {data.Ms}Â°C</text>
      <line x1={TC_PLOT_X0} y1={tcYToPx(data.Mf)} x2={TC_PLOT_X1} y2={tcYToPx(data.Mf)} stroke="#b23b3b" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <text x={TC_PLOT_X0 + 4} y={tcYToPx(data.Mf) - 6} fontSize="9.5" fill="#b23b3b" opacity="0.7">Mf = {data.Mf}Â°C</text>
      <text x={(TC_PLOT_X0 + TC_PLOT_X1) / 2} y={405} fontSize="11" fill={S.text2} textAnchor="middle">Time, seconds (log scale)</text>
      <text x={18} y={(TC_PLOT_Y0 + TC_PLOT_Y1) / 2} fontSize="11" fill={S.text2} textAnchor="middle" transform={`rotate(-90 18 ${(TC_PLOT_Y0 + TC_PLOT_Y1) / 2})`}>Temperature (Â°C)</text>
      <path d={tcPathFromList(path)} fill="none" stroke="#2980b9" strokeWidth="2.5" />
      {path.map((p, i) => (
        <circle key={i} cx={tcXToPx(p[1])} cy={tcYToPx(p[0])} r={i === path.length - 1 ? 6 : 2.5} fill={i === path.length - 1 ? "#fff" : "#2980b9"} stroke="#2980b9" strokeWidth={i === path.length - 1 ? 2.5 : 0} />
      ))}
      <text x={tcXToPx(path[path.length-1][1])} y={tcYToPx(path[path.length-1][0]) - 12} fontSize="10" fontWeight="700" fill="#2980b9" textAnchor="middle">{coolingMedia} quench path</text>
    </svg>
  );
}

// ---------- STRESS-STRAIN CURVE ----------
const SS_PLOT_X0 = 70, SS_PLOT_X1 = 610, SS_PLOT_Y0 = 40, SS_PLOT_Y1 = 380;

function StressStrainChart({ modulusGPa, currentStress, currentStrainPct }) {
  const E = modulusGPa;
  const yieldStrainPct = 0.2;
  const yieldStress = (E * 1000) * (yieldStrainPct / 100);
  const utsStress = yieldStress * 1.35;
  const utsStrainPct = 12;
  const fractureStrainPct = 18;
  const fractureStress = utsStress * 0.82;

  const maxStrainAxis = Math.max(fractureStrainPct, currentStrainPct * 1.15, 5);
  const maxStressAxis = Math.max(utsStress, currentStress) * 1.2;

  function xToPx(strainPct) { return SS_PLOT_X0 + (strainPct / maxStrainAxis) * (SS_PLOT_X1 - SS_PLOT_X0); }
  function yToPx(stress) { return SS_PLOT_Y1 - (stress / maxStressAxis) * (SS_PLOT_Y1 - SS_PLOT_Y0); }

  const elasticEnd = { strain: yieldStrainPct, stress: yieldStress };
  const utsPt = { strain: utsStrainPct, stress: utsStress };
  const fracturePt = { strain: fractureStrainPct, stress: fractureStress };

  const plasticPath = `M ${xToPx(elasticEnd.strain)} ${yToPx(elasticEnd.stress)}
    C ${xToPx(elasticEnd.strain + 3)} ${yToPx(yieldStress * 1.05)},
      ${xToPx(utsPt.strain - 4)} ${yToPx(utsStress * 0.97)},
      ${xToPx(utsPt.strain)} ${yToPx(utsPt.stress)}
    C ${xToPx(utsPt.strain + 3)} ${yToPx(utsStress * 0.95)},
      ${xToPx(fracturePt.strain - 1)} ${yToPx(fracturePt.stress * 1.05)},
      ${xToPx(fracturePt.strain)} ${yToPx(fracturePt.stress)}`;

  const strainAxisTicks = [0, maxStrainAxis * 0.25, maxStrainAxis * 0.5, maxStrainAxis * 0.75, maxStrainAxis].map((v) => +v.toFixed(1));
  const stressAxisTicks = [0, maxStressAxis * 0.25, maxStressAxis * 0.5, maxStressAxis * 0.75, maxStressAxis].map((v) => Math.round(v));

  const markerX = xToPx(Math.min(currentStrainPct, maxStrainAxis));
  const markerY = yToPx(Math.min(currentStress, maxStressAxis));

  return (
    <svg viewBox="0 0 680 420" width="100%" style={{ display: "block" }}>
      <rect x={SS_PLOT_X0} y={SS_PLOT_Y0} width={SS_PLOT_X1 - SS_PLOT_X0} height={SS_PLOT_Y1 - SS_PLOT_Y0} fill="#fcfcfb" stroke={S.border2} strokeWidth="1" />
      {strainAxisTicks.map((v) => (
        <g key={v}>
          <line x1={xToPx(v)} y1={SS_PLOT_Y0} x2={xToPx(v)} y2={SS_PLOT_Y1} stroke={S.border} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={xToPx(v)} y={SS_PLOT_Y1 + 16} fontSize="10" fill={S.text2} textAnchor="middle">{v}%</text>
        </g>
      ))}
      {stressAxisTicks.map((v) => (
        <g key={v}>
          <line x1={SS_PLOT_X0} y1={yToPx(v)} x2={SS_PLOT_X1} y2={yToPx(v)} stroke={S.border} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={SS_PLOT_X0 - 8} y={yToPx(v)} fontSize="10" fill={S.text2} textAnchor="end" dominantBaseline="central">{v}</text>
        </g>
      ))}
      <line x1={xToPx(0)} y1={yToPx(0)} x2={xToPx(elasticEnd.strain)} y2={yToPx(elasticEnd.stress)} stroke={S.steel} strokeWidth="2" />
      <path d={plasticPath} fill="none" stroke={S.steel} strokeWidth="2" />
      <circle cx={xToPx(elasticEnd.strain)} cy={yToPx(elasticEnd.stress)} r="3.5" fill={S.gold} />
      <text x={xToPx(elasticEnd.strain) + 6} y={yToPx(elasticEnd.stress) - 6} fontSize="9.5" fill={S.gold}>Yield {Math.round(yieldStress)} MPa</text>
      <circle cx={xToPx(utsPt.strain)} cy={yToPx(utsPt.stress)} r="3.5" fill="#b23b3b" />
      <text x={xToPx(utsPt.strain)} y={yToPx(utsPt.stress) - 10} fontSize="9.5" fill="#b23b3b" textAnchor="middle">UTS {Math.round(utsStress)} MPa</text>
      <circle cx={xToPx(fracturePt.strain)} cy={yToPx(fracturePt.stress)} r="3" fill={S.text2} />
      <text x={xToPx(fracturePt.strain)} y={yToPx(fracturePt.stress) + 16} fontSize="9.5" fill={S.text2} textAnchor="middle">Fracture</text>
      <text x={(SS_PLOT_X0 + SS_PLOT_X1) / 2} y={405} fontSize="11" fill={S.text2} textAnchor="middle">Strain (%)</text>
      <text x={18} y={(SS_PLOT_Y0 + SS_PLOT_Y1) / 2} fontSize="11" fill={S.text2} textAnchor="middle" transform={`rotate(-90 18 ${(SS_PLOT_Y0 + SS_PLOT_Y1) / 2})`}>Engineering stress (MPa)</text>
      <line x1={markerX} y1={SS_PLOT_Y0} x2={markerX} y2={markerY} stroke="#2980b9" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <line x1={SS_PLOT_X0} y1={markerY} x2={markerX} y2={markerY} stroke="#2980b9" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <circle cx={markerX} cy={markerY} r="7" fill="#fff" stroke="#2980b9" strokeWidth="2.5" />
      <circle cx={markerX} cy={markerY} r="2.5" fill="#2980b9" />
    </svg>
  );
}

// ---------- POURBAIX DIAGRAM ----------
const PB_PLOT_X0 = 70, PB_PLOT_X1 = 610, PB_PLOT_Y0 = 40, PB_PLOT_Y1 = 380;
const PB_PH_MIN = 0, PB_PH_MAX = 14;
const PB_E_MIN = -1.5, PB_E_MAX = 1.5;
function pbXToPx(ph) { return PB_PLOT_X0 + ((ph - PB_PH_MIN) / (PB_PH_MAX - PB_PH_MIN)) * (PB_PLOT_X1 - PB_PLOT_X0); }
function pbYToPx(e) { return PB_PLOT_Y1 - ((e - PB_E_MIN) / (PB_E_MAX - PB_E_MIN)) * (PB_PLOT_Y1 - PB_PLOT_Y0); }
function pbRegionPaths(metal) {
  const phs = Array.from({ length: 29 }, (_, i) => PB_PH_MIN + i * 0.5);
  if (metal === "Fe") {
    const immunityLine = phs.map((ph) => [ph, -0.6 - 0.059 * ph]);
    return { immunityLine, passivBox: { x0: 4, x1: 12, yTop: 0.77, yBottomFn: (ph) => -0.6 - 0.059 * ph } };
  }
  if (metal === "Cu") {
    const immunityLine = phs.map((ph) => [ph, 0.34 - 0.059 * ph]);
    return { immunityLine, passivBox: { x0: 6, x1: 13, yTop: PB_E_MAX, yBottomFn: (ph) => 0.34 - 0.059 * ph } };
  }
  const immunityLine = phs.map((ph) => [ph, -0.76]);
  return { immunityLine, passivBox: { x0: 8.5, x1: 11.5, yTop: PB_E_MAX, yBottomFn: () => -0.76 } };
}

function PourbaixChart({ metal, ph, potential }) {
  const { immunityLine, passivBox } = pbRegionPaths(metal);
  const phGrid = [0, 2, 4, 6, 7, 8, 10, 12, 14];
  const eGrid = [-1.5, -1, -0.5, 0, 0.5, 1, 1.23, 1.5];
  const immunityPath = "M " + immunityLine.map(([phv, e]) => `${pbXToPx(phv).toFixed(1)} ${pbYToPx(Math.max(PB_E_MIN, e)).toFixed(1)}`).join(" L ");
  const markerX = pbXToPx(ph);
  const markerY = pbYToPx(potential);
  const labelE = metal === "Zn" ? -0.76 : (metal === "Fe" ? -0.6 - 0.059 * 2 : 0.34 - 0.059 * 2);

  return (
    <svg viewBox="0 0 680 420" width="100%" style={{ display: "block" }}>
      <rect x={PB_PLOT_X0} y={PB_PLOT_Y0} width={PB_PLOT_X1 - PB_PLOT_X0} height={PB_PLOT_Y1 - PB_PLOT_Y0} fill="#fcfcfb" stroke={S.border2} strokeWidth="1" />
      {phGrid.map((v) => (
        <g key={v}>
          <line x1={pbXToPx(v)} y1={PB_PLOT_Y0} x2={pbXToPx(v)} y2={PB_PLOT_Y1} stroke={S.border} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={pbXToPx(v)} y={PB_PLOT_Y1 + 16} fontSize="10" fill={S.text2} textAnchor="middle">{v}</text>
        </g>
      ))}
      {eGrid.map((v) => (
        <g key={v}>
          <line x1={PB_PLOT_X0} y1={pbYToPx(v)} x2={PB_PLOT_X1} y2={pbYToPx(v)} stroke={S.border} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={PB_PLOT_X0 - 8} y={pbYToPx(v)} fontSize="10" fill={S.text2} textAnchor="end" dominantBaseline="central">{v}</text>
        </g>
      ))}
      <line x1={PB_PLOT_X0} y1={pbYToPx(1.23)} x2={PB_PLOT_X1} y2={pbYToPx(1.23)} stroke="#999" strokeWidth="1" strokeDasharray="5,3" />
      <text x={PB_PLOT_X1 - 4} y={pbYToPx(1.23) - 5} fontSize="9" fill="#999" textAnchor="end">Oâ‚‚ evolution</text>
      <line x1={PB_PLOT_X0} y1={pbYToPx(0)} x2={PB_PLOT_X1} y2={pbYToPx(0)} stroke="#999" strokeWidth="1" strokeDasharray="5,3" />
      <text x={PB_PLOT_X1 - 4} y={pbYToPx(0) - 5} fontSize="9" fill="#999" textAnchor="end">Hâ‚‚ evolution</text>
      <rect
        x={pbXToPx(passivBox.x0)}
        y={pbYToPx(passivBox.yTop)}
        width={pbXToPx(passivBox.x1) - pbXToPx(passivBox.x0)}
        height={pbYToPx(passivBox.yBottomFn((passivBox.x0 + passivBox.x1) / 2)) - pbYToPx(passivBox.yTop)}
        fill="#2980b9" opacity="0.08" stroke="#2980b9" strokeWidth="1" strokeDasharray="3,2"
      />
      <text x={pbXToPx((passivBox.x0 + passivBox.x1) / 2)} y={pbYToPx(passivBox.yTop) + 16} fontSize="10" fill="#2980b9" textAnchor="middle" fontWeight="600">Passivation</text>
      <path d={immunityPath} fill="none" stroke="#27ae60" strokeWidth="2" />
      <text x={pbXToPx(2)} y={pbYToPx(labelE) + 16} fontSize="10" fill="#27ae60" fontWeight="600">Immunity (below line)</text>
      <text x={(PB_PLOT_X0 + PB_PLOT_X1) / 2} y={405} fontSize="11" fill={S.text2} textAnchor="middle">pH</text>
      <text x={18} y={(PB_PLOT_Y0 + PB_PLOT_Y1) / 2} fontSize="11" fill={S.text2} textAnchor="middle" transform={`rotate(-90 18 ${(PB_PLOT_Y0 + PB_PLOT_Y1) / 2})`}>Potential, E (V vs SHE)</text>
      <line x1={markerX} y1={PB_PLOT_Y0} x2={markerX} y2={markerY} stroke="#b23b3b" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <line x1={PB_PLOT_X0} y1={markerY} x2={markerX} y2={markerY} stroke="#b23b3b" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <circle cx={markerX} cy={markerY} r="7" fill="#fff" stroke="#b23b3b" strokeWidth="2.5" />
      <circle cx={markerX} cy={markerY} r="2.5" fill="#b23b3b" />
    </svg>
  );
}

// ---------- JOMINY HARDENABILITY CURVE ----------
const JM_PLOT_X0 = 70, JM_PLOT_X1 = 610, JM_PLOT_Y0 = 40, JM_PLOT_Y1 = 380;
const JM_D_MIN = 0, JM_D_MAX = 20;
const JM_H_MIN = 0, JM_H_MAX = 70;
function jmXToPx(d) { return JM_PLOT_X0 + ((d - JM_D_MIN) / (JM_D_MAX - JM_D_MIN)) * (JM_PLOT_X1 - JM_PLOT_X0); }
function jmYToPx(h) { return JM_PLOT_Y1 - ((h - JM_H_MIN) / (JM_H_MAX - JM_H_MIN)) * (JM_PLOT_Y1 - JM_PLOT_Y0); }
function jmBuildSmoothPath(points) {
  const extended = [
    points[0],
    ...points,
    { d: points[points.length - 1].d + 8, h: Math.max(10, points[points.length - 1].h - 4) },
  ];
  let path = `M ${jmXToPx(extended[0].d)} ${jmYToPx(extended[0].h)}`;
  for (let i = 0; i < extended.length - 1; i++) {
    const p0 = extended[Math.max(0, i - 1)];
    const p1 = extended[i];
    const p2 = extended[i + 1];
    const p3 = extended[Math.min(extended.length - 1, i + 2)];
    const cp1x = p1.d + (p2.d - p0.d) / 6;
    const cp1y = p1.h + (p2.h - p0.h) / 6;
    const cp2x = p2.d - (p3.d - p1.d) / 6;
    const cp2y = p2.h - (p3.h - p1.h) / 6;
    path += ` C ${jmXToPx(cp1x).toFixed(1)} ${jmYToPx(cp1y).toFixed(1)}, ${jmXToPx(cp2x).toFixed(1)} ${jmYToPx(cp2y).toFixed(1)}, ${jmXToPx(p2.d).toFixed(1)} ${jmYToPx(p2.h).toFixed(1)}`;
  }
  return path;
}

function JominyChart({ j1, j4, j8, j16 }) {
  const points = [
    { d: 1, h: j1, label: "J1" },
    { d: 4, h: j4, label: "J4" },
    { d: 8, h: j8, label: "J8" },
    { d: 16, h: j16, label: "J16" },
  ];
  const path = jmBuildSmoothPath(points);
  const dGrid = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  const hGrid = [0, 10, 20, 30, 40, 50, 60, 70];

  return (
    <svg viewBox="0 0 680 420" width="100%" style={{ display: "block" }}>
      <rect x={JM_PLOT_X0} y={JM_PLOT_Y0} width={JM_PLOT_X1 - JM_PLOT_X0} height={JM_PLOT_Y1 - JM_PLOT_Y0} fill="#fcfcfb" stroke={S.border2} strokeWidth="1" />
      {dGrid.map((v) => (
        <g key={v}>
          <line x1={jmXToPx(v)} y1={JM_PLOT_Y0} x2={jmXToPx(v)} y2={JM_PLOT_Y1} stroke={S.border} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={jmXToPx(v)} y={JM_PLOT_Y1 + 16} fontSize="10" fill={S.text2} textAnchor="middle">{v}</text>
        </g>
      ))}
      {hGrid.map((v) => (
        <g key={v}>
          <line x1={JM_PLOT_X0} y1={jmYToPx(v)} x2={JM_PLOT_X1} y2={jmYToPx(v)} stroke={S.border} strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={JM_PLOT_X0 - 8} y={jmYToPx(v)} fontSize="10" fill={S.text2} textAnchor="end" dominantBaseline="central">{v}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke={S.steel} strokeWidth="2.5" />
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={jmXToPx(p.d)} cy={jmYToPx(p.h)} r="5" fill="#fff" stroke={S.gold} strokeWidth="2.5" />
          <text x={jmXToPx(p.d)} y={jmYToPx(p.h) - 12} fontSize="10" fontWeight="700" fill={S.gold} textAnchor="middle">{p.label}: {p.h}</text>
        </g>
      ))}
      <text x={(JM_PLOT_X0 + JM_PLOT_X1) / 2} y={405} fontSize="11" fill={S.text2} textAnchor="middle">Distance from quenched end (1/16 in)</text>
      <text x={18} y={(JM_PLOT_Y0 + JM_PLOT_Y1) / 2} fontSize="11" fill={S.text2} textAnchor="middle" transform={`rotate(-90 18 ${(JM_PLOT_Y0 + JM_PLOT_Y1) / 2})`}>Hardness (HRC)</text>
    </svg>
  );
}

// â”€â”€ Landing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Landing({ onSelect }) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1.5rem 1rem", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: S.steel,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1rem", fontSize: 26,
        }}>ðŸ”©</div>
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
                  <span style={{ color: S.goldMid, fontWeight: 700, flexShrink: 0 }}>âœ“</span>{f}
                </li>
              ))}
              {p.locked.map((f) => (
                <li key={f} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start", opacity: 0.4 }}>
                  <span style={{ flexShrink: 0 }}>âœ•</span>{f}
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

// â”€â”€ Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to Metal. I'm your dedicated materials engineering consultant. Whether you need help with material selection, failure analysis, manufacturing processes, corrosion assessment, or heat treatment â€” describe your challenge and I'll provide expert guidance backed by industry standards." },
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
            <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: m.role === "user" ? S.bg2 : S.steel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{m.role === "user" ? "ðŸ‘¤" : "ðŸ”©"}</div>
            <div style={{ maxWidth: "76%", padding: "8px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.6, background: m.role === "user" ? S.steel : S.bg2, color: m.role === "user" ? "#fff" : S.text, border: m.role === "user" ? "none" : `0.5px solid ${S.border}` }}>{m.role === "user" ? m.content : renderMarkdown(m.content)}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: S.steel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>ðŸ”©</div>
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
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Describe your materials engineering challengeâ€¦" style={{ flex: 1, padding: "8px 12px", borderRadius: S.radiusMd, border: `0.5px solid ${S.border2}`, fontSize: 13, outline: "none", background: S.bg }} />
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
- Operating temperature: ${form.temp || "not stated"}Â°C
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
        <div style={{ gridColumn: "1/-1" }}>{field("Component / application", inp("component", "e.g. Pressure vessel in Hâ‚‚S environment at 250Â°C"))}</div>
        {field("Operating temperature (Â°C)", inp("temp", "e.g. 250"))}
        {field("Loading & environment", inp("load", "e.g. cyclic fatigue, saline"))}
        <div style={{ gridColumn: "1/-1" }}>{field("Standards & constraints", <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Applicable standards (ASME, API, ASTMâ€¦), weight limits, budget, existing materialsâ€¦" style={{ padding: "8px 10px", borderRadius: S.radiusMd, border: `0.5px solid ${S.border2}`, fontSize: 13, resize: "vertical", minHeight: 70 }} />)}</div>
      </div>
      <button onClick={submit} disabled={loading} style={{ width: "100%", padding: 10, background: loading ? S.text3 : S.steel, color: "#fff", border: "none", borderRadius: S.radiusMd, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Generating assessmentâ€¦" : "Generate engineering assessment"}</button>
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
      <div style={{ fontSize: 36, marginBottom: 10 }}>ðŸ”’</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 6 }}>Available on Max plan</div>
      <div style={{ fontSize: 13, color: S.text2, lineHeight: 1.6, marginBottom: "1.25rem", maxWidth: 360, margin: "0 auto 1.25rem" }}>Book a live one-on-one session with a certified metallurgical engineer. Get an in-depth review of your project, failure investigation support, or a professional second opinion.</div>
    </div>
  );

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden" }}>
      <div style={{ background: S.steel, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>ðŸ‘¨â€ðŸ”¬</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Dr. Adewale Okafor, FIMMM</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>PhD Materials Science Â· 22 yrs experience Â· CEng</div>
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
        {confirmed && (<div style={{ marginTop: 10, background: S.goldLight, border: `0.5px solid #e8d5a3`, borderRadius: S.radiusMd, padding: "10px 14px", fontSize: 13, color: S.text, textAlign: "center" }}>ðŸŽ‰ Session reserved for <strong>{SLOTS[selected].day} at {SLOTS[selected].time}</strong>. An email invitation has been generated.</div>)}
      </div>
    </div>
  );
}

// ðŸ—ºï¸ STANDALONE METALLURGICAL ENGINE: CAT 1 DIAGRAM 1 â€” IRON-CARBON
function IronCarbonCalculations() {
  const [c, setC] = useState(0.4);
  const [t, setT] = useState(700);

  let phaseText = "";
  let alpha = 0;
  let fe3c = 0;
  let gamma = 0;

  if (t <= 723) {
    const aLim = 0.022;
    const cLim = 6.67;
    const boundedC = Math.max(aLim, Math.min(cLim, c));
    alpha = ((cLim - boundedC) / (cLim - aLim)) * 100;
    fe3c = ((boundedC - aLim) / (cLim - aLim)) * 100;
    phaseText = boundedC < 0.77
      ? "Hypoeutectoid Steel: Proeutectoid Ferrite (Î±) + Pearlite Grains"
      : boundedC === 0.77 ? "Eutectoid Steel: 100% Pearlite"
      : "Hypereutectoid Steel: Primary Cementite (Feâ‚ƒC) Networks + Pearlite";
  } else if (t <= 1147) {
    if (c <= 0.77) {
      gamma = 100;
      phaseText = "Fully Austenitized Solid Field (Î³-Iron Structural Lattice)";
    } else if (c <= 2.11) {
      gamma = ((2.11 - c) / (2.11 - 0.77)) * 100;
      fe3c = 100 - gamma;
      phaseText = "Austenite Matrix (Î³) with secondary Cementite precipitation";
    } else {
      phaseText = c < 4.30
        ? "Hypoeutectic Cast Iron: Austenite (Î³) + Ledeburite"
        : c === 4.30 ? "Eutectic Cast Iron: 100% Ledeburite"
        : "Hypereutectic Cast Iron: Primary Cementite + Ledeburite";
    }
  } else {
    phaseText = c < 0.53 ? "Liquid + Î´-Ferrite / Austenite region" : "Liquid + Austenite region";
  }

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>ðŸ“Š Iron-Carbon Phase Diagram (Lever Rule)</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1rem" }}>Full equilibrium diagram, 0â€“6.67% C. Adjust sliders â€” the marker below moves live on the real diagram.</div>

      <div style={{ marginBottom: "1.25rem", borderRadius: S.radiusMd, overflow: "hidden", border: `1px solid ${S.border}` }}>
        <IronCarbonChart carbon={c} temp={t} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
            <span>Carbon Composition: <strong>{c.toFixed(2)}% C</strong></span>
            <span style={{ color: S.text3 }}>Full range: 0.01â€“6.67%</span>
          </div>
          <input type="range" min="0.01" max="6.67" step="0.01" value={c} onChange={(e) => setC(parseFloat(e.target.value))} style={{ width: "100%", accentColor: S.steel }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
            <span>Target Temperature: <strong>{t}Â°C</strong></span>
            <span style={{ color: t > 723 ? S.gold : "#4caf50", fontSize: 11 }}>{t > 723 ? "Above A1 (723Â°C)" : "Below A1 (723Â°C)"}</span>
          </div>
          <input type="range" min="300" max="1600" step="5" value={t} onChange={(e) => setT(parseInt(e.target.value))} style={{ width: "100%", accentColor: S.goldMid }} />
        </div>
      </div>

      {t <= 1147 && (
        <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Calculated Phase Fractions (Lever Rule)</div>
          {t <= 723 ? (
            <>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Ferrite (Î±-Iron Phase)</span><strong>{alpha.toFixed(1)}%</strong></div>
                <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${alpha}%`, height: "100%", background: S.steel }} /></div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Cementite (Feâ‚ƒC Carbide)</span><strong>{fe3c.toFixed(1)}%</strong></div>
                <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${fe3c}%`, height: "100%", background: S.goldMid }} /></div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Austenite (Î³-Phase Matrix)</span><strong>{gamma.toFixed(1)}%</strong></div>
                <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${gamma}%`, height: "100%", background: S.gold }} /></div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span>Cementite (Feâ‚ƒC)</span><strong>{fe3c.toFixed(1)}%</strong></div>
                <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${fe3c}%`, height: "100%", background: S.text2 }} /></div>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ fontSize: 12, fontStyle: "italic", color: S.steel, textAlign: "center", borderTop: `0.5px solid ${S.border}`, paddingTop: 8, marginTop: 4 }}>
        ðŸ’¡ Matrix State: <strong>{phaseText}</strong>
      </div>
    </div>
  );
}

// ðŸ—ºï¸ STANDALONE METALLURGICAL ENGINE: CAT 1 DIAGRAM 2 (ELLINGHAM)
function EllinghamCalculations() {
  const [metal, setMetal] = useState("Fe");
  const [temp, setTemp] = useState(800);

  const values = {
    Cu: { name: "Copper Oxide (2Cu2O)", dH: -338, dS: -0.14 },
    Fe: { name: "Iron Oxide (2FeO)", dH: -544, dS: -0.13 },
    Al: { name: "Aluminum Oxide (2/3 Al2O3)", dH: -1117, dS: -0.21 }
  }[metal];

  const T_Kelvin = temp + 273.15;
  const deltaG = values.dH - (T_Kelvin * values.dS);
  const deltaG_CO = -565 + (T_Kelvin * 0.17);
  const isReducibleByCarbon = deltaG_CO < deltaG;

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>ðŸ“Š Ellingham Diagram & Reduction Predictor</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1rem" }}>Real Î”GÂ° vs T lines for each oxide system. The marker tracks your selected metal and temperature.</div>

      <div style={{ marginBottom: "1.25rem", borderRadius: S.radiusMd, overflow: "hidden", border: `1px solid ${S.border}` }}>
        <EllinghamChart metal={metal} temp={temp} />
      </div>

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
            <span>Furnace Heat: <strong>{temp}Â°C</strong></span>
          </div>
          <input type="range" min="0" max="1600" step="10" value={temp} onChange={(e) => setTemp(parseInt(e.target.value))} style={{ width: "100%", accentColor: S.steel }} />
        </div>
      </div>

      <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Calculated Thermodynamic Potentials</div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
            <span>Î”GÂ° of {values.name}:</span>
            <strong style={{ color: deltaG < -600 ? "#c0392b" : S.steel }}>{deltaG.toFixed(0)} kJ/mol Oâ‚‚</strong>
          </div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (Math.abs(deltaG) / 1200) * 100)}%`, height: "100%", background: "#2c3e50" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: `0.5px solid ${S.border}`, paddingTop: 6, marginTop: 2 }}>
          <span>Carbon Reduction Potential (2CO â†’ 2COâ‚‚):</span>
          <strong>{deltaG_CO.toFixed(0)} kJ/mol Oâ‚‚</strong>
        </div>
      </div>

      <div style={{ fontSize: 12, fontStyle: "italic", color: isReducibleByCarbon ? "#27ae60" : "#d35400", textAlign: "center", borderTop: `0.5px solid ${S.border}`, paddingTop: 8, marginTop: 4, fontWeight: 600 }}>
        {isReducibleByCarbon
          ? `âœ… Thermodynamically Feasible: Carbon/CO can reduce this oxide to pure metal at ${temp}Â°C.`
          : `âŒ Extraction Blocked: Oxide layer is too stable. Requires a stronger reducing agent or electrolysis.`}
      </div>
    </div>
  );
}

// ðŸ—ºï¸ STANDALONE METALLURGICAL ENGINE: CAT 1 DIAGRAM 3 (TTT/CCT)
function TttCctCalculations() {
  const [alloy, setAlloy] = useState("1045");
  const [coolingMedia, setCoolingMedia] = useState("Oil");

  let coolingRateText = "";
  let structureText = "";
  let finalHardnessText = "";
  let microstructures = { pearlite: 0, bainite: 0, martensite: 0 };

  if (coolingMedia === "Furnace") {
    coolingRateText = "Very Slow Continuous Cooling (~0.1Â°C/s) - Follows CCT Equilibrium Paths";
    microstructures = { pearlite: 100, bainite: 0, martensite: 0 };
    structureText = "100% Coarse Pearlite grains matrix. Uniformly soft, stress-relieved structural state.";
    finalHardnessText = alloy === "1045" ? "15 HRC (Soft)" : "22 HRC (Medium-Soft)";
  } else if (coolingMedia === "Oil") {
    coolingRateText = "Moderate Industrial Quench (~25Â°C/s) - Crosses the Pearlite Nose Boundary";
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
    coolingRateText = "Severe Liquid Water Quench (~120Â°C/s) - Completely Bypasses the Transformation Nose";
    microstructures = { pearlite: 0, bainite: 0, martensite: 100 };
    structureText = "100% Fully Untempered Body-Centered Tetragonal (BCT) Martensite structure. Maximum internal lattice strain.";
    finalHardnessText = alloy === "1045" ? "58 HRC (Very Hard / Brittle)" : "64 HRC (Maximum Brittle Hardness)";
  }

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>ðŸ“Š TTT / CCT Transformation Diagram</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1rem" }}>Real nose-shaped transformation curves with your cooling path plotted on top.</div>

      <div style={{ marginBottom: "1.25rem", borderRadius: S.radiusMd, overflow: "hidden", border: `1px solid ${S.border}` }}>
        <TttCctChart alloy={alloy} coolingMedia={coolingMedia} />
      </div>

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
          ðŸ”¬ <strong>Phase Lattice Matrix:</strong> {structureText}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: S.text3, textTransform: "uppercase" }}>Estimated Hardness</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: S.gold }}>{finalHardnessText}</div>
        </div>
      </div>
    </div>
  );
}

// ðŸŽ›ï¸ UPGRADED METALLURGICAL ENGINE: CAT 2 DIAGRAM 1 (STRESS-STRAIN SOLVER)
function StressStrainCalculations() {
  const [solveMode, setSolveMode] = useState("extension");
  const [diameter, setDiameter] = useState(12.7);
  const [gaugeLength, setGaugeLength] = useState(50.0);
  const [load, setLoad] = useState(45);
  const [extension, setExtension] = useState(0.15);
  const [knownModulus, setKnownModulus] = useState(200);

  const radius = diameter / 2;
  const originalArea = Math.PI * Math.pow(radius, 2);
  const engineeringStress = (load * 1000) / originalArea;

  let activeStrain = 0;
  let activeExtension = 0;
  let activeModulus = 0;

  if (solveMode === "extension") {
    activeExtension = extension;
    activeStrain = extension / gaugeLength;
    activeModulus = (activeStrain > 0) ? (engineeringStress / activeStrain) / 1000 : 0;
  } else {
    activeModulus = knownModulus;
    activeStrain = (knownModulus > 0) ? engineeringStress / (knownModulus * 1000) : 0;
    activeExtension = activeStrain * gaugeLength;
  }

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>ðŸ“Š Engineering Stress-Strain Curve</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1.25rem" }}>Real elastic + plastic curve shape for the active modulus. Marker tracks your calculated stress/strain point.</div>

      <div style={{ marginBottom: "1.25rem", borderRadius: S.radiusMd, overflow: "hidden", border: `1px solid ${S.border}` }}>
        <StressStrainChart modulusGPa={activeModulus || 1} currentStress={engineeringStress} currentStrainPct={activeStrain * 100} />
      </div>

      <div style={{ marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: S.goldMid, textTransform: "uppercase" }}>Target Calculation Priority</label>
        <select value={solveMode} onChange={(e) => setSolveMode(e.target.value)} style={{ padding: "8px 10px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13, background: S.bg2, fontWeight: 600, color: S.text }}>
          <option value="extension">Solve For Modulus (Extension data is Given)</option>
          <option value="modulus">Solve For Extension (Young's Modulus is Given)</option>
        </select>
      </div>

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

      <div style={{ background: S.bg2, borderRadius: S.radiusMd, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>Calculated Tensile Specimen Mechanics</div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
            <span>Calculated Engineering Stress:</span>
            <strong>{engineeringStress.toFixed(1)} MPa (N/mmÂ²)</strong>
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

// ðŸŽ›ï¸ STANDALONE METALLURGICAL ENGINE: CAT 2 DIAGRAM 2 (POURBAIX CALCULATOR)
function PourbaixCalculations() {
  const [metal, setMetal] = useState("Fe");
  const [ph, setPh] = useState(7.0);
  const [potential, setPotential] = useState(0.0);

  let stabilityState = "";
  let chemicalSpecies = "";
  let statusColor = "";
  let badgeEmoji = "";

  if (metal === "Fe") {
    if (potential < -0.6 - (0.059 * ph)) {
      stabilityState = "Immunity (ðŸ‘‘ Safe)";
      chemicalSpecies = "Pure Elemental Iron (Feâ° solid matrix)";
      statusColor = "#27ae60";
      badgeEmoji = "ðŸ‘‘";
    } else if (ph < 4.0 || (ph >= 4.0 && ph < 9.0 && potential > 0.77)) {
      stabilityState = "Active Corrosion (âš ï¸ High Risk)";
      chemicalSpecies = "Soluble Aqueous Ions (FeÂ²âº / FeÂ³âº dissolution)";
      statusColor = "#c0392b";
      badgeEmoji = "âš ï¸";
    } else if (ph >= 4.0 && ph <= 12.0 && potential >= -0.6 && potential <= 0.77) {
      stabilityState = "Passivation (ðŸ›¡ï¸ Protected Oxide)";
      chemicalSpecies = "Adherent Protective Film (Feâ‚‚Oâ‚ƒ / Feâ‚ƒOâ‚„ Magnetite)";
      statusColor = "#2980b9";
      badgeEmoji = "ðŸ›¡ï¸";
    } else {
      stabilityState = "Alkaline Corrosion (âš ï¸ High Risk)";
      chemicalSpecies = "Soluble Ferrate Complex Ions (HFeOâ‚‚â» / FeOâ‚„Â²â»)";
      statusColor = "#e67e22";
      badgeEmoji = "âš ï¸";
    }
  } else if (metal === "Cu") {
    if (potential < 0.34 - (0.059 * ph)) {
      stabilityState = "Immunity (ðŸ‘‘ Safe)";
      chemicalSpecies = "Pure Elemental Copper (Cuâ° solid matrix)";
      statusColor = "#27ae60";
      badgeEmoji = "ðŸ‘‘";
    } else if (ph < 6.0 || ph > 13.0) {
      stabilityState = "Active Acidic/Alkaline Corrosion (âš ï¸ High Risk)";
      chemicalSpecies = "Soluble Copper Gilded Salts (CuÂ²âº / CuOâ‚‚Â²â»)";
      statusColor = "#c0392b";
      badgeEmoji = "âš ï¸";
    } else {
      stabilityState = "Passivation (ðŸ›¡ï¸ Protected Oxide)";
      chemicalSpecies = "Cupric/Cuprous Passive Mineral Scale (Cuâ‚‚O / CuO)";
      statusColor = "#2980b9";
      badgeEmoji = "ðŸ›¡ï¸";
    }
  } else {
    if (potential < -0.76) {
      stabilityState = "Immunity (ðŸ‘‘ Safe)";
      chemicalSpecies = "Pure Solid Zinc Coating (Znâ° sacrificial crystal)";
      statusColor = "#27ae60";
      badgeEmoji = "ðŸ‘‘";
    } else if (ph >= 8.5 && ph <= 11.5) {
      stabilityState = "Passivation (ðŸ›¡ï¸ Protected Zinc Scale)";
      chemicalSpecies = "Zinc Hydroxide Passive Crust (Zn(OH)â‚‚ solid)";
      statusColor = "#2980b9";
      badgeEmoji = "ðŸ›¡ï¸";
    } else {
      stabilityState = "Rapid Galvanic Corrosion (âš ï¸ High Risk)";
      chemicalSpecies = "Highly Soluble Zincates (ZnÂ²âº / ZnOâ‚‚Â²â» weeping matrix)";
      statusColor = "#c0392b";
      badgeEmoji = "âš ï¸";
    }
  }

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>ðŸ“Š Pourbaix (Potential-pH) Diagram</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1rem" }}>Real stability region boundaries. Marker tracks your pH/potential point.</div>

      <div style={{ marginBottom: "1.25rem", borderRadius: S.radiusMd, overflow: "hidden", border: `1px solid ${S.border}` }}>
        <PourbaixChart metal={metal} ph={ph} potential={potential} />
      </div>

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

// ðŸŽ›ï¸ STANDALONE METALLURGICAL ENGINE: CAT 2 DIAGRAM 3 (JOMINY PROFILE)
function JominyCalculations() {
  const [alloy, setAlloy] = useState("4140");
  const [j1, setJ1] = useState(55);
  const [j4, setJ4] = useState(52);
  const [j8, setJ8] = useState(45);
  const [j16, setJ16] = useState(35);

  const maxPotentialHRC = alloy === "4140" ? 60 : 55;
  const expectedTailHRC = alloy === "4140" ? 30 : 15;
  const hardnessDrop = Math.max(0, j1 - j16);

  const structuralAssessment = hardnessDrop < 15
    ? "High Deep-Hardening Profile: Excellent alloy response. Suitable for heavy industrial transmission gears and deep-hardened shafts."
    : "Shallow Hardening Profile: Rapid cooling required. Hardness drops severely away from tip. Restricted to thin-walled structural sheets.";

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${S.border}`, borderRadius: S.radiusMd, padding: "1.25rem", marginTop: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 2 }}>ðŸ“Š Jominy End-Quench Hardenability Curve</div>
      <div style={{ fontSize: 12, color: S.text2, marginBottom: "1.25rem" }}>Real smooth curve through your 4 lab checkpoints. Adjust the number inputs to reshape the curve.</div>

      <div style={{ marginBottom: "1.25rem", borderRadius: S.radiusMd, overflow: "hidden", border: `1px solid ${S.border}` }}>
        <JominyChart j1={j1} j4={j4} j8={j8} j16={j16} />
      </div>

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

      {(j1 > maxPotentialHRC || j16 < expectedTailHRC) && (
        <div style={{ background: "rgba(178,59,59,0.08)", border: "0.5px solid #b23b3b", color: "#b23b3b", padding: 8, borderRadius: 6, fontSize: 11, marginBottom: 10, fontWeight: 500 }}>
          âš ï¸ <strong>Anomalous Lab Reading Detected:</strong> Data trends violate typical carbon martensitic transformation constraints for standard {alloy} chemistry bounds. Please verify physical indent dimensions.
        </div>
      )}

      <div style={{ fontSize: 12, fontStyle: "italic", color: S.steel, borderTop: `0.5px solid ${S.border}`, paddingTop: 8, marginTop: 4 }}>
        ðŸ”¬ <strong>Depth Hardenability Assessment:</strong> {structuralAssessment}
      </div>
    </div>
  );
}

function Dashboard({ plan, onBack }) {
  const [tab, setTab] = useState(() => {
    return localStorage.getItem("METAL_ACTIVE_TAB") || "consult";
  });

  const [labCategory, setLabCategory] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState(null);
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
      {!localStorage.getItem("LOCAL_GROQ_KEY") && (
        <div style={{ background: S.goldLight, border: `1px solid ${S.goldMid}`, borderRadius: S.radiusMd, padding: 12, marginBottom: 15, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: S.text, fontWeight: 500 }}>ðŸ”‘ Input Groq Key to Activate AI Core:</span>
          <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} placeholder="gsk_..." style={{ flex: 1, padding: "5px 10px", fontSize: 12, borderRadius: 4, border: `1px solid ${S.border2}` }} />
          <button onClick={saveLocalKey} style={{ background: S.steel, color: "#fff", border: "none", padding: "5px 12px", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save Key</button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: `0.5px solid ${S.border}`, marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: S.steel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>ðŸ”©</div>
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
          { id: "lab", label: "ðŸ”¬ Metallurgical Lab" },
        ].map((t) => (
          <button key={t.id} onClick={() => { localStorage.setItem("METAL_ACTIVE_TAB", t.id); setTab(t.id); }} style={{ flex: 1, padding: 9, borderRadius: S.radiusMd, border: `0.5px solid ${tab === t.id ? S.steel : S.border2}`, background: tab === t.id ? S.steel : S.bg, color: tab === t.id ? "#fff" : t.locked ? S.text3 : S.text2, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{t.locked && "ðŸ”’ "}{t.label}</button>
        ))}
      </div>
      <div style={{ display: tab === "consult" ? "block" : "none" }}><Chat /></div>
      <div style={{ display: tab === "brief" ? "block" : "none" }}><Brief /></div>
      <div style={{ display: tab === "eng" ? "block" : "none" }}><EngineerPanel plan={plan} /></div>

      {tab === "lab" && (
        <div style={card}>
          {!labCategory && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: S.steel, marginBottom: 4 }}>ðŸ”¬ Metallurgical Laboratory Suite</div>
              <div style={{ fontSize: 13, color: S.text2, marginBottom: "1.25rem" }}>Select an analytical module branch directory to explore core engineering diagrams.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div onClick={() => setLabCategory("constant")} style={{ border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, padding: 14, background: S.bg2, cursor: "pointer" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>ðŸ›‘</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>Category 1</div>
                  <div style={{ fontSize: 12, color: S.text2, marginTop: 2, fontWeight: 500 }}>Constant Value reference maps. Fixed thermodynamic structural bounds.</div>
                </div>
                <div onClick={() => setLabCategory("input")} style={{ border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, padding: 14, background: S.bg2, cursor: "pointer" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>ðŸŽ›ï¸</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>Category 2</div>
                  <div style={{ fontSize: 12, color: S.text2, marginTop: 2, fontWeight: 500 }}>Input Value graphs. Dynamic environmental lab calculators.</div>
                </div>
              </div>
            </div>
          )}
          {labCategory && !selectedGraph && (
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <button onClick={() => setLabCategory(null)} style={{ background: "none", border: "none", color: S.goldMid, fontWeight: 700, cursor: "pointer", fontSize: 13, padding: 0 }}>â† Back to Lab Suite</button>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: S.steel, marginBottom: 10 }}>
                {labCategory === "constant" ? "ðŸ›‘ Category 1: Fixed Reference Maps Collection" : "ðŸŽ›ï¸ Category 2: Dynamic Lab Data Calculators Collection"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {labCategory === "constant" ? (
                  <>
                    <button onClick={() => setSelectedGraph("iron-carbon")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>â€¢ The Iron-Carbon Phase Diagram</button>
                    <button onClick={() => setSelectedGraph("ellingham")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>â€¢ Ellingham Oxidation Stability Diagrams</button>
                    <button onClick={() => setSelectedGraph("ttt-cct")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>â€¢ TTT / CCT Transformation Curves</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setSelectedGraph("stress-strain")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>â€¢ 1. Engineering Stress-Strain Curves (Tensile Testing)</button>
                    <button onClick={() => setSelectedGraph("pourbaix")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>â€¢ 2. Pourbaix (Potential-pH) Corrosion Diagrams</button>
                    <button onClick={() => setSelectedGraph("jominy")} style={{ width: "100%", padding: 12, background: "#fff", border: `1px solid ${S.border2}`, borderRadius: S.radiusMd, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>â€¢ 3. Jominy Hardenability Curves</button>
                  </>
                )}
              </div>
            </div>
          )}
          {selectedGraph && (
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <button onClick={() => setSelectedGraph(null)} style={{ background: "none", border: "none", color: S.goldMid, fontWeight: 700, cursor: "pointer", fontSize: 13, padding: 0 }}>â† Back to Collection</button>
              </div>
              {selectedGraph === "iron-carbon" && <IronCarbonCalculations />}
              {selectedGraph === "ellingham" && <EllinghamCalculations />}
              {selectedGraph === "ttt-cct" && <TttCctCalculations />}
              {selectedGraph === "stress-strain" && <StressStrainCalculations />}
              {selectedGraph === "pourbaix" && <PourbaixCalculations />}
              {selectedGraph === "jominy" && <JominyCalculations />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ðŸ”‘ PHASE 1 PRODUCTION ROUTER: INITIAL MARKETING SPLASH PAGE -> AUTH TERMINAL -> CORE WORKSPACE
export default function App() {
  const [userSession, setUserSession] = useState(() => {
    return localStorage.getItem("METAL_ACTIVE_USER") || null;
  });

  const [viewMode, setViewMode] = useState("splash");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please fill out all structural parameters.");
      return;
    }
    const userIdentifier = isSignUp ? (fullname.trim() || email.split("@")[0]) : email.split("@")[0];
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

  if (userSession) {
    const cachedPlan = localStorage.getItem("METAL_ACTIVE_PLAN") || "pro";
    return <Dashboard plan={cachedPlan} onBack={handleSignOut} />;
  }

  if (viewMode === "splash") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1.5rem", position: "relative", overflow: "hidden", fontFamily: "system-ui, sans-serif", background: "linear-gradient(135deg, #11161b 0%, #202b36 50%, #0d1114 100%)" }}>
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "60%", height: "60%", background: "linear-gradient(45deg, rgba(127,140,141,0.15), transparent)", transform: "rotate(15deg)", clipPath: "polygon(0 0, 100% 20%, 80% 100%, 0 80%)" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "50%", height: "60%", background: "linear-gradient(225deg, rgba(212,160,23,0.08), transparent)", transform: "rotate(-10deg)", clipPath: "polygon(20% 0, 100% 40%, 70% 100%, 0 100%)" }} />
        <div style={{ position: "relative", zIndex: 10, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 24, padding: "3rem 2rem", maxWidth: 460, width: "100%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", textAlign: "center" }}>
          <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 1.5rem auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ position: "absolute", width: "100%", height: "100%", transform: "rotate(45deg)" }} viewBox="0 0 100 100">
              <ellipse cx="50" cy="50" rx="45" ry="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <ellipse cx="50" cy="50" rx="45" ry="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" style={{ transform: "rotate(60deg)", transformOrigin: "50px 50px" }} />
              <ellipse cx="50" cy="50" rx="45" ry="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" style={{ transform: "rotate(120deg)", transformOrigin: "50px 50px" }} />
            </svg>
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
          <button onClick={() => setViewMode("auth")} style={{ position: "relative", width: "100%", padding: "14px", borderRadius: 12, background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#ffffff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}>
            Get Started
          </button>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 18, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
            ðŸ”’ Secure Academic & Enterprise Layer
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f7f7f5", fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
      <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "2rem", maxWidth: 400, width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <button onClick={() => setViewMode("splash")} style={{ background: "none", border: "none", color: S.text2, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}>â† Return</button>
          <span style={{ fontSize: 20 }}>ðŸ”©</span>
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" style={{ padding: "8px 12px", borderRadius: S.radiusMd, border: `1px solid ${S.border2}`, fontSize: 13 }} required />
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
