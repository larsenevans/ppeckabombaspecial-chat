"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

const navItems = [
  { label: "Prehľad", icon: LayoutDashboard, active: true },
  { label: "Registre rizík", icon: ShieldCheck },
  { label: "Dôkazy a dokumenty", icon: FileText },
  { label: "Kontrolné mechanizmy", icon: FileCheck2 },
]

const frameworks = [
  { label: "AI Act", value: "78 %", tone: "cyan", detail: "12 z 16 kontrol" },
  { label: "GDPR", value: "92 %", tone: "green", detail: "23 z 25 kontrol" },
  { label: "NIS2", value: "64 %", tone: "amber", detail: "9 z 14 kontrol" },
]

const activities = [
  { icon: FileCheck2, title: "DPIA pre HR Copilot aktualizované", detail: "Dôkaz #EV-1048 · dnes o 09:42", tone: "cyan" },
  { icon: AlertTriangle, title: "Nové riziko: chýba incident response playbook", detail: "NIS2 · vysoká priorita · včera", tone: "amber" },
  { icon: CheckCircle2, title: "Kontrola prístupov dokončená", detail: "GDPR · 18 používateľov · včera", tone: "green" },
]

export default function ChatPage() {
  const [activeNav, setActiveNav] = useState("Prehľad")
  const [query, setQuery] = useState("")
  const [showNotice, setShowNotice] = useState(false)

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100 selection:bg-cyan-400/30">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] border-r border-white/[0.07] bg-[#081522] lg:flex lg:flex-col">
        <div className="flex h-[72px] items-center gap-3 border-b border-white/[0.07] px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-[#07111f] shadow-[0_0_22px_rgba(34,211,238,.25)]"><ShieldCheck size={19} strokeWidth={2.5} /></div>
          <span className="text-[15px] font-semibold tracking-tight">Aegis<span className="text-cyan-300">.ai</span></span>
        </div>
        <div className="px-4 pt-6">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
          <button className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-left text-xs text-slate-200">
            <span className="flex items-center gap-2.5"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-400/20 text-[10px] font-bold text-indigo-200">AC</span> Acme Corp</span><ChevronDown size={14} className="text-slate-500" />
          </button>
        </div>
        <nav className="mt-7 px-3">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Navigácia</p>
          <div className="space-y-1">
            {navItems.map((item) => <button key={item.label} onClick={() => setActiveNav(item.label)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${activeNav === item.label ? "bg-cyan-400/10 font-medium text-cyan-200" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`}><item.icon size={16} />{item.label}{item.label === "Registre rizík" && <span className="ml-auto rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] text-amber-300">4</span>}</button>)}
          </div>
        </nav>
        <div className="mt-auto space-y-1 border-t border-white/[0.07] p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-slate-400 hover:text-slate-200"><Settings2 size={16} /> Nastavenia</button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-slate-400 hover:text-slate-200"><CircleHelp size={16} /> Centrum pomoci</button>
          <div className="mt-4 flex items-center gap-3 border-t border-white/[0.07] pt-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-indigo-500 text-[11px] font-bold text-white">MK</div><div className="min-w-0"><p className="truncate text-xs font-medium">Martina Kováčová</p><p className="text-[10px] text-slate-500">Compliance lead</p></div><MoreHorizontal size={15} className="ml-auto text-slate-500" /></div>
        </div>
      </aside>

      <section className="lg:pl-[248px]">
        <header className="flex h-[72px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8">
          <div><p className="text-xs text-slate-500">Utorok, 28. október 2026</p><h1 className="mt-1 text-lg font-semibold tracking-tight">Dobrý deň, Martina <span className="text-cyan-300">.</span></h1></div>
          <div className="flex items-center gap-2"><button onClick={() => setShowNotice(!showNotice)} className="relative rounded-lg p-2 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200" aria-label="Notifikácie"><Bell size={18} />{showNotice && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />}</button><button className="hidden items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300 px-3.5 py-2 text-xs font-semibold text-[#07111f] shadow-[0_0_18px_rgba(103,232,249,.12)] sm:flex"><Plus size={15} /> Nová kontrola</button></div>
        </header>

        <div className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-medium text-cyan-300">COMPLIANCE PULSE</p><h2 className="text-2xl font-semibold tracking-tight text-white">Stav regulačného súladu</h2><p className="mt-1.5 text-sm text-slate-400">Aegis monitoruje vaše povinnosti a upozorní vás skôr, než sa stanú problémom.</p></div><div className="flex items-center gap-2 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.6)]" /> Systém aktualizovaný pred 8 min</div></div>

          <div className="grid gap-4 md:grid-cols-3">{frameworks.map((f) => <div key={f.label} className="group rounded-xl border border-white/[0.08] bg-[#0c1b2b] p-5 transition hover:border-cyan-300/30"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-300">{f.label}</p><p className="mt-3 text-[30px] font-semibold tracking-tight text-white">{f.value}</p></div><span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${f.tone === "cyan" ? "bg-cyan-300/10 text-cyan-300" : f.tone === "green" ? "bg-emerald-300/10 text-emerald-300" : "bg-amber-300/10 text-amber-300"}`}>{f.tone === "cyan" ? "V dobrom stave" : f.tone === "green" ? "Vyhovuje" : "Vyžaduje pozornosť"}</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${f.tone === "cyan" ? "bg-cyan-300" : f.tone === "green" ? "bg-emerald-400" : "bg-amber-300"}`} style={{ width: f.value }} /></div><p className="mt-2 text-[11px] text-slate-500">{f.detail}</p></div>)}</div>

          <div className="mt-7 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-white/[0.08] bg-[#0c1b2b] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-white">Vyžaduje vašu pozornosť</h3><p className="mt-1 text-xs text-slate-500">4 otvorené položky s najvyššou prioritou</p></div><button className="text-xs font-medium text-cyan-300 hover:text-cyan-200">Zobraziť všetky <ArrowUpRight className="ml-1 inline" size={13} /></button></div><div className="mt-5 space-y-3"><div className="flex items-center gap-4 rounded-lg border border-amber-300/15 bg-amber-300/[0.05] p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-300/10 text-amber-300"><AlertTriangle size={17} /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-200">Chýba plán reakcie na bezpečnostný incident</p><p className="mt-1 text-xs text-slate-500">NIS2 · Článok 21 · termín o 12 dní</p></div><span className="hidden rounded-full bg-amber-300/10 px-2 py-1 text-[10px] font-semibold text-amber-300 sm:inline">VYSOKÁ</span></div><div className="flex items-center gap-4 rounded-lg border border-white/[0.07] p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-300/10 text-indigo-300"><FileText size={17} /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-200">Doplňte zdroj tréningových dát</p><p className="mt-1 text-xs text-slate-500">AI Act · Článok 10 · termín o 26 dní</p></div><span className="hidden rounded-full bg-indigo-300/10 px-2 py-1 text-[10px] font-semibold text-indigo-300 sm:inline">STREDNÁ</span></div></div></div>
            <div className="relative overflow-hidden rounded-xl border border-cyan-300/20 bg-gradient-to-br from-[#10283b] to-[#0b1a2a] p-5 sm:p-6"><div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" /><div className="relative"><div className="mb-5 flex items-center gap-2 text-cyan-300"><Sparkles size={16} /><span className="text-xs font-semibold uppercase tracking-wider">Aegis copilot</span></div><h3 className="max-w-[300px] text-lg font-semibold leading-snug text-white">Opýtajte sa na čokoľvek o vašom súlade.</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">Vysvetlím požiadavky, nájdem dôkazy a pripravím ďalší krok.</p><div className="mt-5 flex items-center gap-2 rounded-lg border border-white/[0.1] bg-[#081522]/70 p-2"><Search size={15} className="ml-1 text-slate-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setQuery("")} placeholder="Napr. Aké GDPR riziká máme?" className="min-w-0 flex-1 bg-transparent px-1 text-xs text-slate-200 outline-none placeholder:text-slate-600" /><button onClick={() => setQuery("")} className="rounded-md bg-cyan-300 px-3 py-1.5 text-[11px] font-semibold text-[#07111f]">Spýtať sa</button></div><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => setQuery("Zhrňte otvorené riziká")} className="rounded-full border border-white/[0.09] px-2.5 py-1 text-[10px] text-slate-400 hover:text-slate-200">Zhrnúť riziká</button><button onClick={() => setQuery("Čo sa zmenilo v AI Act?")} className="rounded-full border border-white/[0.09] px-2.5 py-1 text-[10px] text-slate-400 hover:text-slate-200">Čo sa zmenilo?</button></div></div></div>
          </div>

          <div className="mt-7 rounded-xl border border-white/[0.08] bg-[#0c1b2b] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-white">Posledná aktivita</h3><p className="mt-1 text-xs text-slate-500">Auditovateľná história vášho workspace</p></div><button className="text-xs font-medium text-cyan-300">Otvoriť audit log <ArrowUpRight className="ml-1 inline" size={13} /></button></div><div className="mt-5 grid gap-1 md:grid-cols-3">{activities.map((a) => <div key={a.title} className="flex gap-3 rounded-lg p-3 hover:bg-white/[0.03]"><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.tone === "cyan" ? "bg-cyan-300/10 text-cyan-300" : a.tone === "amber" ? "bg-amber-300/10 text-amber-300" : "bg-emerald-300/10 text-emerald-300"}`}><a.icon size={15} /></div><div><p className="text-xs font-medium leading-relaxed text-slate-200">{a.title}</p><p className="mt-1 text-[10px] text-slate-500">{a.detail}</p></div></div>)}</div></div>
          <footer className="mt-8 flex flex-col gap-2 border-t border-white/[0.07] pt-5 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span className="flex items-center gap-1.5"><LockKeyhole size={12} /> Všetky dáta sú šifrované a vysledovateľné</span><span className="flex items-center gap-3"><span>AI Act readiness v1.4</span><span>GDPR baseline</span><span>NIS2 pack</span></span></footer>
        </div>
      </section>
    </main>
  )
}
