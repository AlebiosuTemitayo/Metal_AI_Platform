# Metal — AI Metallurgical & Materials Engineering Platform 🔩

Metal is a modern, responsive React-based Software-as-a-Service (SaaS) application designed for professional metallurgical engineers, asset integrity managers, and industrial project leaders. The platform delivers instant, peer-level engineering consultations and structured technical assessments aligned with global manufacturing and asset standards.

---

## 🚀 Key Features

*   **Expert AI Consultant Persona:** Powered by a customized LLM engine trained to think like a senior materials engineer with 25+ years of industry experience. Answers address asset selection, manufacturing workflows, and failure analysis without generic AI disclaimers.
*   **Structured Project Intake Engine:** A custom template input form that maps industrial boundaries (operating temperatures, cyclic fatigue loading, sour gas environment severity) and formats them into formal engineering briefs.
*   **Industry Code Compliance:** System constraints optimize responses against international code benchmarks including **ASTM, ISO, ASME, API, and NACE**.
*   **Tiered Subscription Monetization:** Includes a fully responsive pricing page featuring Starter (Free), Professional, and Max tiers to demonstrate a complete commercial SaaS user flow.
*   **Human-In-The-Loop Integration:** Built-in scheduling and booking framework allowing premium "Max" tier subscribers to instantly book real-time sessions with certified consulting engineers.
*   **Custom Rich Text Parsing:** Utilizes a custom lightweight markdown parser designed to render dense engineering specifications, formulas, and structural lists cleanly with an industrial aesthetic.

---

## 🛠️ Technical Stack

*   **Frontend Core:** React 18+ (Hooks, Context, dynamic rendering)
*   **Build Environment:** Vite (Ultra-fast compilation and building)
*   **AI Inference Layer:** Groq API SDK Framework (`llama3-70b-8192` engineering reasoning engine)
*   **Styling:** Modular CSS-in-JS layout configuration optimized for enterprise environments

---

## 📦 Local Installation Guide

To preview or run this application locally on your computer, ensure you have [Node.js](https://nodejs.org) installed, then execute these commands in your terminal:

```bash
# 1. Clone or download this project folder
cd Metal-AI-Platform

# 2. Install required React and Vite dependencies
npm install

# 3. Create an environment variable file (.env) in the root directory and add your key:
VITE_GROQ_API_KEY=your_secret_groq_api_key_here

# 4. Spin up the local development web server
npm run dev
```

---

## ☁️ Production Deployment (Vercel)

This application is fully optimized for one-click serverless deployment on **Vercel**:

1. Compress the project folder into a `.zip` file.
2. Upload or drag-and-drop the files onto your Vercel Dashboard dashboard.
3. Under **Project Settings -> Environment Variables**, configure your secure keys:
    *   **Name:** `VITE_GROQ_API_KEY`
    *   **Value:** `[Your Secret Free Groq Key]`
4. Click **Deploy**. Vercel will bundle the code and host your site online 24/7 for free.
