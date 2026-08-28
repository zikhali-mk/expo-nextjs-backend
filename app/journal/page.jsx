"use client";

import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  BookOpenCheck,
  CandlestickChart,
  ChevronDown,
  CircleDollarSign,
  ClipboardPenLine,
  Clock3,
  Loader2,
  Save,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Brain,
  FileText,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function JournalPage() {
  const [formData, setFormData] = useState({
    symbol: "",
    direction: "",
    entry: "",
    sl: "",
    tp: "",
    rr: "",
    session: "",
    result: "PENDING",
    setup: "",
    notes: "",
    psychology: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      symbol: "",
      direction: "",
      entry: "",
      sl: "",
      tp: "",
      rr: "",
      session: "",
      result: "PENDING",
      setup: "",
      notes: "",
      psychology: "",
    });
  };

  const handleSaveTrade = async (e) => {
    e.preventDefault();

    if (
      !formData.symbol ||
      !formData.direction ||
      !formData.entry ||
      !formData.sl ||
      !formData.tp ||
      !formData.rr ||
      !formData.session ||
      !formData.setup
    ) {
      toast.error("Please fill in all required trade fields.");

      return;
    }

    const tradeData = {
      symbol: formData.symbol.toUpperCase(),
      direction: formData.direction,
      entry: Number(formData.entry),
      sl: Number(formData.sl),
      tp: Number(formData.tp),
      rr: Number(formData.rr),
      session: formData.session,
      result: formData.result || "PENDING",
      setup: formData.setup,
      notes: formData.notes,
      psychology: formData.psychology,
    };

    setLoading(true);

    const saveTradePromise = fetch("/api/trade", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(tradeData),
    }).then(async (res) => {
      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to save trade");
      }

      return data;
    });

    toast.promise(
      saveTradePromise,
      {
        loading: "Saving your trade...",
        success: "Trade journaled successfully 🟢",
        error: (err) => err.message || "Failed to save trade ❌",
      },
      {
        style: {
          background: "#101510",
          color: "#fff",
          border: "1px solid rgba(114,252,101,0.35)",
        },
      }
    );

    try {
      await saveTradePromise;

      resetForm();
    } catch (error) {
      console.error("Trade save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none backdrop-blur-md transition-all duration-300 placeholder:text-gray-500 hover:border-[#72fc6540] focus:border-[#72fc65] focus:bg-[#72fc6508] focus:ring-2 focus:ring-[#72fc6515]";

  const labelClass =
    "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400";

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#06000e]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />

      {/* VIDEO BACKGROUND */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-[#24012c52]" />

      {/* EXTRA GRADIENT */}
      <div className="absolute inset-0 bg-linear-to-br from-[#06000e]/30 via-transparent to-black/60" />

      {/* MAIN UI */}
      <div className="relative z-10 m-2 flex h-[calc(100vh-16px)] flex-col overflow-hidden rounded-2xl border-2 border-[#33445571] bg-[#45464528] p-4 backdrop-blur-sm">
        {/* HEADER */}
        <header className="flex shrink-0 items-center justify-between gap-6 border-b border-white/10 pb-4">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-gray-400 transition-all duration-300 hover:-translate-x-1 hover:border-[#72fc6580] hover:bg-[#72fc6510] hover:text-[#72fc65]"
            >
              <ArrowLeft
                size={19}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] shadow-lg shadow-[#72fc6510]">
                  <BookOpenCheck size={22} />
                </div>

                <div>
                  <h1 className="bg-linear-to-r from-[#72fc65] via-white to-[#72fc65] bg-clip-text text-2xl font-bold text-transparent">
                    Trade Journal
                  </h1>

                  <p className="mt-0.5 text-xs text-gray-400">
                    Every trade becomes data for improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="hidden items-center gap-3 lg:flex">
            <div className="group flex items-center gap-3 rounded-xl border border-[#72fc6530] bg-[#10151080] px-4 py-2.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#72fc6580]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#72fc6510] text-[#72fc65] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <Sparkles size={16} />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                  Journal Mode
                </p>

                <p className="text-xs font-semibold text-white">
                  Stay disciplined
                </p>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]">
              <CandlestickChart size={20} />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto py-5 pr-1">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 xl:grid-cols-[1fr_330px]">
            {/* FORM */}
            <form
              onSubmit={handleSaveTrade}
              className="group relative overflow-hidden rounded-2xl border border-[#72fc6530] bg-[#06000e]/65 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-500 hover:border-[#72fc6555]"
            >
              {/* Glow */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#72fc6512] blur-3xl transition-transform duration-700 group-hover:scale-125" />

              <div className="relative">
                {/* FORM HEADER */}
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]">
                      <ClipboardPenLine size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-white">
                        New Trade
                      </h2>

                      <p className="text-xs text-gray-500">
                        Record your execution, reasoning and psychology.
                      </p>
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 rounded-lg border border-[#72fc6525] bg-[#72fc6508] px-3 py-2 md:flex">
                    <CheckCircle2 size={14} className="text-[#72fc65]" />

                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#72fc65]">
                      Ready
                    </span>
                  </div>
                </div>

                {/* FORM GRID */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* SYMBOL */}
                  <div>
                    <label className={labelClass}>
                      <CandlestickChart size={14} className="text-[#72fc65]" />
                      Symbol *
                    </label>

                    <input
                      type="text"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleChange}
                      placeholder="XAUUSD"
                      className={inputClass}
                    />
                  </div>

                  {/* DIRECTION */}
                  <div>
                    <label className={labelClass}>
                      <TrendingUp size={14} className="text-[#72fc65]" />
                      Direction *
                    </label>

                    <div className="relative">
                      <select
                        name="direction"
                        value={formData.direction}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none`}
                      >
                        <option value="">Select direction</option>
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </div>

                  {/* SESSION */}
                  <div>
                    <label className={labelClass}>
                      <Clock3 size={14} className="text-[#72fc65]" />
                      Session *
                    </label>

                    <div className="relative">
                      <select
                        name="session"
                        value={formData.session}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none`}
                      >
                        <option value="">Select session</option>
                        <option value="ASIA">Asia</option>
                        <option value="LONDON">London</option>
                        <option value="NEW YORK">New York</option>
                        <option value="LONDON / NEW YORK">
                          London / New York
                        </option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </div>

                  {/* ENTRY */}
                  <div>
                    <label className={labelClass}>
                      <Target size={14} className="text-[#72fc65]" />
                      Entry *
                    </label>

                    <input
                      type="number"
                      step="any"
                      name="entry"
                      value={formData.entry}
                      onChange={handleChange}
                      placeholder="3350.25"
                      className={inputClass}
                    />
                  </div>

                  {/* STOP LOSS */}
                  <div>
                    <label className={labelClass}>
                      <ShieldAlert size={14} className="text-red-400" />
                      Stop Loss *
                    </label>

                    <input
                      type="number"
                      step="any"
                      name="sl"
                      value={formData.sl}
                      onChange={handleChange}
                      placeholder="3345.00"
                      className={inputClass}
                    />
                  </div>

                  {/* TAKE PROFIT */}
                  <div>
                    <label className={labelClass}>
                      <TrendingUp size={14} className="text-[#72fc65]" />
                      Take Profit *
                    </label>

                    <input
                      type="number"
                      step="any"
                      name="tp"
                      value={formData.tp}
                      onChange={handleChange}
                      placeholder="3365.00"
                      className={inputClass}
                    />
                  </div>

                  {/* RISK REWARD */}
                  <div>
                    <label className={labelClass}>
                      <CircleDollarSign
                        size={14}
                        className="text-[#72fc65]"
                      />
                      Risk Reward *
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      name="rr"
                      value={formData.rr}
                      onChange={handleChange}
                      placeholder="3"
                      className={inputClass}
                    />
                  </div>

                  {/* RESULT */}
                  <div>
                    <label className={labelClass}>
                      <TrendingDown size={14} className="text-yellow-400" />
                      Result
                    </label>

                    <div className="relative">
                      <select
                        name="result"
                        value={formData.result}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="WIN">WIN</option>
                        <option value="LOSS">LOSS</option>
                        <option value="BREAKEVEN">BREAKEVEN</option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </div>

                  {/* SETUP */}
                  <div>
                    <label className={labelClass}>
                      <Target size={14} className="text-[#72fc65]" />
                      Setup *
                    </label>

                    <input
                      type="text"
                      name="setup"
                      value={formData.setup}
                      onChange={handleChange}
                      placeholder="Liquidity Sweep"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* PSYCHOLOGY */}
                <div className="mt-4">
                  <label className={labelClass}>
                    <Brain size={14} className="text-purple-400" />
                    Psychology
                  </label>

                  <input
                    type="text"
                    name="psychology"
                    value={formData.psychology}
                    onChange={handleChange}
                    placeholder="Calm, patient and disciplined"
                    className={inputClass}
                  />
                </div>

                {/* NOTES */}
                <div className="mt-4">
                  <label className={labelClass}>
                    <FileText size={14} className="text-[#72fc65]" />
                    Trade Notes
                  </label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Describe why you entered the trade, confirmation, market structure and anything you learned..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-400 transition-all duration-300 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear Form
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group/btn relative overflow-hidden rounded-xl border border-[#72fc6570] bg-[#72fc6515] px-6 py-3 text-sm font-bold text-[#72fc65] shadow-lg shadow-[#72fc6510] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#72fc65] hover:bg-[#72fc6525] hover:shadow-[#72fc6525] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />

                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Saving Trade...
                        </>
                      ) : (
                        <>
                          <Save
                            size={17}
                            className="transition-transform duration-300 group-hover/btn:scale-110"
                          />
                          Save Trade
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </form>

            {/* SIDE PANEL */}
            <aside className="flex flex-col gap-5">
              {/* JOURNALING REMINDER */}
              <div className="group relative overflow-hidden rounded-2xl border border-[#72fc6530] bg-[#06000e]/65 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#72fc6580] hover:shadow-2xl hover:shadow-[#72fc6510]">
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#72fc6515] blur-3xl transition-transform duration-700 group-hover:scale-150" />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                      <BookOpenCheck size={21} />
                    </div>

                    <div>
                      <h3 className="font-bold text-white">
                        Journal Reminder
                      </h3>

                      <p className="text-[10px] text-gray-500">
                        Turn experience into data
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6540]">
                      <p className="text-xs font-semibold text-white">
                        Record the facts
                      </p>

                      <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                        Capture your entry, stop loss, target and trade setup
                        accurately.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6540]">
                      <p className="text-xs font-semibold text-white">
                        Be honest about psychology
                      </p>

                      <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                        Your emotional state is part of your trading data.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6540]">
                      <p className="text-xs font-semibold text-white">
                        Focus on execution
                      </p>

                      <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                        A good trade can lose and a bad trade can win.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRADE PREVIEW */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#72fc6510] text-[#72fc65]">
                    <Target size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Trade Preview
                    </h3>

                    <p className="text-[10px] text-gray-500">
                      Your current journal entry
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Symbol
                    </span>

                    <span className="text-xs font-bold text-white">
                      {formData.symbol || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Direction
                    </span>

                    <span
                      className={`text-xs font-bold ${
                        formData.direction === "BUY"
                          ? "text-[#72fc65]"
                          : formData.direction === "SELL"
                          ? "text-red-400"
                          : "text-gray-500"
                      }`}
                    >
                      {formData.direction || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Entry
                    </span>

                    <span className="text-xs font-bold text-white">
                      {formData.entry || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[#72fc6520] bg-[#72fc6508] px-3 py-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">
                      Risk / Reward
                    </span>

                    <span className="text-sm font-bold text-[#72fc65]">
                      {formData.rr ? `1:${formData.rr}` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Result
                    </span>

                    <span
                      className={`text-xs font-bold ${
                        formData.result === "WIN"
                          ? "text-[#72fc65]"
                          : formData.result === "LOSS"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {formData.result}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}