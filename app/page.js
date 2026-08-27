"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
Wallet,
ArrowDownToLine,
ArrowUpFromLine,
TrendingUp,
TrendingDown,
Loader2,
Target,
ShieldCheck,
Brain,
BookOpenCheck,
Clock3,
CheckCircle2,
Flame,
ArrowUpRight,
NotebookPen,
ChartNoAxesCombined,
LayoutDashboard,
ClipboardCheck,
Trophy,
Zap,
CandlestickChart,
} from "lucide-react";

export default function Home() {
const [account, setAccount] = useState(null);
const [loading, setLoading] = useState(true);

// Fetch account information
useEffect(() => {
const getAccount = async () => {
try {
const res = await fetch("/api/account");

    if (!res.ok) {
      throw new Error("Failed to fetch account");
    }

    const data = await res.json();
    setAccount(data);
  } catch (error) {
    console.error("Account error:", error);
  } finally {
    setLoading(false);
  }
};

getAccount();

}, []);

// Format currency
const formatMoney = (value) => {
return Number(value || 0).toLocaleString(undefined, {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
});
};

return ( <main className="relative h-screen w-full overflow-hidden">
{/* Background Video */} <video
     className="absolute inset-0 h-full w-full object-cover"
     autoPlay
     loop
     muted
     playsInline
     preload="auto"
   > <source src="/video.mp4" type="video/mp4" />
Your browser does not support the video tag. </video>

```
  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-[#24012c52]" />

  {/* UI Layer */}
  <div className="relative z-10 m-2 flex h-11/12 flex-col rounded-2xl border-2 border-[#33445571] bg-[#45464528] p-4 backdrop-blur-sm">
    {/* Top Header */}
    <div className="flex w-full items-center justify-between p-4">
      {/* Logo */}
      <div className="inline-block">
        <h1 className="bg-linear-to-r from-[#72fc65] to-white bg-clip-text text-5xl font-bold text-transparent">
          Debian<span className="text-[#09ff00]">Fx</span>
        </h1>

        <div className="mt-2 h-0.75 w-full bg-[radial-gradient(circle,#72fc65_2px,transparent_2px)] bg-size-[8px_3px]" />
      </div>

      {/* Account Information */}
      <div className="flex w-2/3 items-center justify-end gap-3">
        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#72fc6540] bg-[#10151080] px-5 py-4 text-[#72fc65] backdrop-blur-md">
            <Loader2 className="animate-spin" size={20} />

            <span className="text-sm font-medium">
              Loading account...
            </span>
          </div>
        ) : (
          <>
            {/* Account Balance */}
            <div className="group relative min-w-[210px] overflow-hidden rounded-xl border border-[#72fc6540] bg-[#10151080] p-3 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc65] hover:shadow-[#72fc6530]">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#72fc6520] blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-[#72fc6540]" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Account Balance
                  </p>

                  <h2 className="mt-1 bg-linear-to-r from-[#72fc65] via-white to-[#72fc65] bg-clip-text text-2xl font-bold text-transparent">
                    ${formatMoney(account?.balance)}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6515] text-[#72fc65] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <Wallet size={22} />
                </div>
              </div>
            </div>

            {/* Deposits */}
            <div className="group flex h-[72px] w-[125px] flex-col justify-between rounded-xl border border-[#72fc6525] bg-[#ffffff08] p-2 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc6580] hover:bg-[#72fc6510]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  Deposits
                </span>

                <div className="rounded-md bg-[#72fc6515] p-1">
                  <ArrowDownToLine
                    size={15}
                    className="text-[#72fc65] transition-transform duration-300 group-hover:translate-y-1"
                  />
                </div>
              </div>

              <p className="text-base font-bold text-white">
                ${formatMoney(account?.deposits)}
              </p>
            </div>

            {/* Withdrawals */}
            <div className="group flex h-[72px] w-[125px] flex-col justify-between rounded-xl border border-orange-400/20 bg-[#ffffff08] p-2 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/70 hover:bg-orange-400/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  Withdrawals
                </span>

                <div className="rounded-md bg-orange-400/10 p-1">
                  <ArrowUpFromLine
                    size={15}
                    className="text-orange-400 transition-transform duration-300 group-hover:-translate-y-1"
                  />
                </div>
              </div>

              <p className="text-base font-bold text-white">
                ${formatMoney(account?.withdrawals)}
              </p>
            </div>

            {/* Profit and Loss */}
            <div className="flex flex-col gap-2">
              {/* Profit */}
              <div className="group flex h-[33px] w-[125px] items-center justify-between rounded-lg border border-[#72fc6530] bg-[#72fc650d] px-2 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#72fc6580] hover:bg-[#72fc6520]">
                <div className="flex items-center gap-1">
                  <TrendingUp
                    size={14}
                    className="text-[#72fc65] transition-transform duration-300 group-hover:-translate-y-1"
                  />

                  <span className="text-[10px] text-gray-400">
                    Profit
                  </span>
                </div>

                <span className="text-xs font-bold text-[#72fc65]">
                  +${formatMoney(account?.profits)}
                </span>
              </div>

              {/* Loss */}
              <div className="group flex h-[33px] w-[125px] items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-2 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-red-400/60 hover:bg-red-500/15">
                <div className="flex items-center gap-1">
                  <TrendingDown
                    size={14}
                    className="text-red-400 transition-transform duration-300 group-hover:translate-y-1"
                  />

                  <span className="text-[10px] text-gray-400">
                    Loss
                  </span>
                </div>

                <span className="text-xs font-bold text-red-400">
                  -${formatMoney(account?.losses)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    {/* Top Line */}
    <div className="m-1 w-full rounded-xl border-2 border-gray-600" />

    {/* Bottom Section */}
    <div className="mt-1 flex h-full w-full justify-between gap-3 rounded-2xl   p-3 pt-1">
      {/* Markets */}
      <div className="flex w-1/5 flex-col justify-between rounded-xl border border-gray-700 bg-black/20 p-2 ">
        <div className="mb-2 flex items-center gap-2 px-2">
          <CandlestickChart size={16} className="text-[#72fc65]" />

          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Markets
          </span>
        </div>

        <div className="group rounded-xl border border-gray-700 bg-linear-to-r from-[#06000e] to-gray-700 p-1 pl-3 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6580]">
          <span className="text-[14px] font-bold text-white/70">
            Gold vs US Dollar
          </span>

          <span className="block text-[10px] font-bold text-[#00ff6a]">
            XAUUSD
          </span>
        </div>

        <div className="group rounded-xl border border-gray-700 bg-linear-to-r from-[#06000e] to-gray-700 p-1 pl-3 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6580]">
          <span className="text-[14px] font-bold text-white/70">
            Constant Volatility of 75s
          </span>

          <span className="block text-[10px] font-bold text-[#00ff6a]">
            V 75s
          </span>
        </div>

        <div className="group rounded-xl border border-gray-700 bg-linear-to-r from-[#06000e] to-gray-700 p-1 pl-3 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6580]">
          <span className="text-[14px] font-bold text-white/70">
            Constant Volatility of 50s
          </span>

          <span className="block text-[10px] font-bold text-[#00ff6a]">
            V 50s
          </span>
        </div>

        <div className="group rounded-xl border border-gray-700 bg-linear-to-r from-[#06000e] to-gray-700 p-1 pl-3 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6580]">
          <span className="text-[14px] font-bold text-white/70">
            Constant Volatility of 25s
          </span>

          <span className="block text-[10px] font-bold text-[#00ff6a]">
            V 25s
          </span>
        </div>

        <div className="group rounded-xl border border-gray-700 bg-linear-to-r from-[#06000e] to-gray-700 p-1 pl-3 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6580]">
          <span className="text-[14px] font-bold text-white/70">
            Constant Volatility of 15s
          </span>

          <span className="block text-[10px] font-bold text-[#00ff6a]">
            V 15s
          </span>
        </div>

        <div className="group rounded-xl border border-gray-700 bg-linear-to-r from-[#06000e] to-gray-700 p-1 pl-3 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6580]">
          <span className="text-[14px] font-bold text-white/70">
            Skew Step 5 Up
          </span>

          <span className="block text-[10px] font-bold text-[#00ff6a]">
            Skew 5
          </span>
        </div>
      </div>

      {/* RULES UI */}
      <div className="group relative flex w-2/5 flex-col overflow-hidden rounded-xl border border-[#72fc6530] bg-[#06000e]/60 p-4 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[#72fc6580] hover:shadow-2xl hover:shadow-[#72fc6515]">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#72fc6515] blur-3xl transition-all duration-700 group-hover:scale-150" />

        {/* Header */}
        <div className="relative mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h2 className="text-sm font-bold tracking-wide text-white">
                Trading Rules
              </h2>

              <p className="text-[10px] text-gray-500">
                Discipline creates consistency
              </p>
            </div>
          </div>

          <Flame size={20} className="animate-pulse text-orange-400" />
        </div>

        {/* Procedures */}
        <div className="relative space-y-2">
          <div className="mb-2 flex items-center gap-2">
            <Clock3 size={14} className="text-[#72fc65]" />

            <span className="text-[10px] font-bold uppercase tracking-widest text-[#72fc65]">
              Daily Procedures
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-2.5 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6540] hover:bg-[#72fc6508]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#72fc6510] text-[#72fc65]">
              <Brain size={14} />
            </div>

            <div>
              <p className="text-xs font-semibold text-white/90">
                Analyze before trading
              </p>

              <p className="text-[10px] text-gray-500">
                Check structure, sessions and key levels.
              </p>
            </div>

            <CheckCircle2
              size={15}
              className="ml-auto text-[#72fc65]/40"
            />
          </div>

          {/* <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-2.5 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6540] hover:bg-[#72fc6508]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#72fc6510] text-[#72fc65]">
              <Target size={14} />
            </div>

            <div>
              <p className="text-xs font-semibold text-white/90">
                Trade only your setup
              </p>

              <p className="text-[10px] text-gray-500">
                No FOMO. Wait patiently for confirmation.
              </p>
            </div>

            <CheckCircle2
              size={15}
              className="ml-auto text-[#72fc65]/40"
            />
          </div> */}

          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-2.5 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6540] hover:bg-[#72fc6508]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#72fc6510] text-[#72fc65]">
              <ShieldCheck size={14} />
            </div>

            <div>
              <p className="text-xs font-semibold text-white/90">
                Protect your capital
              </p>

              <p className="text-[10px] text-gray-500">
                Respect risk and never revenge trade.
              </p>
            </div>

            <CheckCircle2
              size={15}
              className="ml-auto text-[#72fc65]/40"
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-2.5 transition-all duration-300 hover:translate-x-1 hover:border-[#72fc6540] hover:bg-[#72fc6508]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#72fc6510] text-[#72fc65]">
              <BookOpenCheck size={14} />
            </div>

            <div>
              <p className="text-xs font-semibold text-white/90">
                Journal every trade
              </p>

              <p className="text-[10px] text-gray-500">
                Record execution, reasoning and emotions.
              </p>
            </div>

            <CheckCircle2
              size={15}
              className="ml-auto text-[#72fc65]/40"
            />
          </div>
        </div>

        {/* Goal Reminder */}
        <div className="relative mt-4 overflow-hidden rounded-xl border border-[#72fc6540] bg-linear-to-r from-[#72fc6510] via-transparent to-[#72fc6508] p-3">
          <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-[#72fc6520] blur-xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#72fc6515] text-[#72fc65]">
              <Trophy size={18} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#72fc65]">
                Remember Your Goal
              </p>

              <p className="mt-1 text-xs leading-relaxed text-white/80">
                You are not here to chase trades. You are here to become a
                disciplined, consistent and profitable trader.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK LINKS UI */}
      <div className="group relative flex w-2/5 flex-col overflow-hidden rounded-xl border border-[#72fc6530] bg-[#06000e]/60 p-4 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[#72fc6580] hover:shadow-2xl hover:shadow-[#72fc6515]">
        <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-[#72fc6515] blur-3xl transition-all duration-700 group-hover:scale-150" />

        {/* Header */}
        <div className="relative mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Zap size={18} />
            </div>

            <div>
              <h2 className="text-sm font-bold tracking-wide text-white">
                Quick Access
              </h2>

              <p className="text-[10px] text-gray-500">
                Your trading workspace
              </p>
            </div>
          </div>

          <ArrowUpRight
            size={18}
            className="text-[#72fc65]/60 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>

        {/* Navigation Cards */}
        <div className="relative grid grid-cols-2 gap-3">
          <Link
            href="/journal"
            className="group/link relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc6570] hover:bg-[#72fc650d]"
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#72fc650d] to-transparent opacity-0 transition-opacity duration-300 group-hover/link:opacity-100" />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#72fc6510] text-[#72fc65] transition-all duration-300 group-hover/link:rotate-6 group-hover/link:scale-110">
                  <NotebookPen size={18} />
                </div>

                <ArrowUpRight
                  size={15}
                  className="text-gray-500 transition-all duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 group-hover/link:text-[#72fc65]"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">Journal</p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Record your trades
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/trades"
            className="group/link relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc6570] hover:bg-[#72fc650d]"
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#72fc650d] to-transparent opacity-0 transition-opacity duration-300 group-hover/link:opacity-100" />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#72fc6510] text-[#72fc65] transition-all duration-300 group-hover/link:scale-110">
                  <ChartNoAxesCombined size={18} />
                </div>

                <ArrowUpRight
                  size={15}
                  className="text-gray-500 transition-all duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 group-hover/link:text-[#72fc65]"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">Trades</p>

                <p className="mt-1 text-[10px] text-gray-500">
                  View trade history
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="group/link relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc6570] hover:bg-[#72fc650d]"
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#72fc650d] to-transparent opacity-0 transition-opacity duration-300 group-hover/link:opacity-100" />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#72fc6510] text-[#72fc65] transition-all duration-300 group-hover/link:scale-110">
                  <LayoutDashboard size={18} />
                </div>

                <ArrowUpRight
                  size={15}
                  className="text-gray-500 transition-all duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 group-hover/link:text-[#72fc65]"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">Dashboard</p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Track performance
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/review"
            className="group/link relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc6570] hover:bg-[#72fc650d]"
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#72fc650d] to-transparent opacity-0 transition-opacity duration-300 group-hover/link:opacity-100" />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#72fc6510] text-[#72fc65] transition-all duration-300 group-hover/link:-rotate-6 group-hover/link:scale-110">
                  <ClipboardCheck size={18} />
                </div>

                <ArrowUpRight
                  size={15}
                  className="text-gray-500 transition-all duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 group-hover/link:text-[#72fc65]"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">Review</p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Improve your strategy
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Motivation */}
        <div className="relative mt-4 flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-3">
          <TrendingUp
            size={16}
            className="animate-pulse text-[#72fc65]"
          />

          <p className="text-[11px] text-gray-400">
            Small improvements every day create long-term consistency.
          </p>
        </div>
      </div>
    </div>
  </div>
</main>


);
}
