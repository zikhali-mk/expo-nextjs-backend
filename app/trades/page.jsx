"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CandlestickChart,
  CheckCircle2,
  CircleDollarSign,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
  Clock3,
  BarChart3,
  ListFilter,
  CalendarDays,
  Activity,
  ChevronRight,
  Inbox,
} from "lucide-react";

export default function TradesPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [resultFilter, setResultFilter] = useState("ALL");
  const [sessionFilter, setSessionFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchTrades = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const res = await fetch("/api/trade", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch trades");
      }

      const data = await res.json();

      setTrades(data.trades || []);
    } catch (error) {
      console.error("Trade fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const result = String(trade.result || "").toUpperCase();
      const session = String(trade.session || "").toUpperCase();
      const symbol = String(trade.symbol || "").toUpperCase();

      const normalizedResult =
        result === "LOSE" ? "LOSS" : result;

      const normalizedFilter =
        resultFilter === "LOSE" ? "LOSS" : resultFilter;

      const matchResult =
        normalizedFilter === "ALL" ||
        normalizedResult === normalizedFilter;

      const matchSession =
        sessionFilter === "ALL" ||
        session === sessionFilter;

      const matchSearch =
        symbol.includes(search.toUpperCase()) ||
        String(trade.direction || "")
          .toUpperCase()
          .includes(search.toUpperCase());

      return matchResult && matchSession && matchSearch;
    });
  }, [trades, resultFilter, sessionFilter, search]);

  const getResultStyle = (result) => {
    const value = String(result || "").toUpperCase();

    if (value === "WIN") {
      return {
        icon: CheckCircle2,
        text: "text-[#72fc65]",
        bg: "bg-[#72fc6510]",
        border: "border-[#72fc6530]",
      };
    }

    if (value === "LOSS" || value === "LOSE") {
      return {
        icon: XCircle,
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/25",
      };
    }

    return {
      icon: Clock3,
      text: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/25",
    };
  };

  const totalTrades = trades.length;

  const wins = trades.filter(
    (trade) =>
      String(trade.result || "").toUpperCase() === "WIN"
  ).length;

  const losses = trades.filter((trade) => {
    const result = String(trade.result || "").toUpperCase();

    return result === "LOSS" || result === "LOSE";
  }).length;

  const winRate =
    totalTrades > 0
      ? ((wins / totalTrades) * 100).toFixed(1)
      : 0;

  const resultFilters = ["ALL", "WIN", "LOSS"];

  const sessionFilters = [
    "ALL",
    "LONDON",
    "NEW YORK",
    "ASIA",
  ];

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#06000e]">
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

      {/* EXTRA DEPTH */}
      <div className="absolute inset-0 bg-linear-to-br from-[#06000e]/40 via-transparent to-black/70" />

      {/* MAIN GLASS CONTAINER */}
      <div className="relative z-10 m-2 flex h-[calc(100vh-16px)] flex-col overflow-hidden rounded-2xl border-2 border-[#33445571] bg-[#45464528] p-4 backdrop-blur-sm">
        {/* ================= HEADER ================= */}

        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            {/* BACK */}
            <Link
              href="/"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-gray-400 transition-all duration-300 hover:-translate-x-1 hover:border-[#72fc6580] hover:bg-[#72fc6510] hover:text-[#72fc65]"
            >
              <ArrowLeft
                size={19}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
            </Link>

            {/* TITLE */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] shadow-lg shadow-[#72fc6510]">
                <CandlestickChart size={22} />
              </div>

              <div>
                <h1 className="bg-linear-to-r from-[#72fc65] via-white to-[#72fc65] bg-clip-text text-2xl font-bold text-transparent">
                  Trade History
                </h1>

                <p className="mt-0.5 text-xs text-gray-400">
                  Track, analyze and improve your trading performance.
                </p>
              </div>
            </div>
          </div>

          {/* REFRESH */}
          <button
            onClick={() => fetchTrades(true)}
            disabled={refreshing}
            className="group flex items-center gap-2 rounded-xl border border-[#72fc6530] bg-[#10151080] px-4 py-2.5 text-sm font-semibold text-[#72fc65] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#72fc6580] hover:bg-[#72fc6510] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={`transition-transform duration-500 group-hover:rotate-180 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            <span className="hidden sm:block">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </header>

        {/* ================= CONTENT ================= */}

        <div className="flex-1 overflow-y-auto py-5 pr-1">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
            {/* ================= STATS ================= */}

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {/* TOTAL */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#06000e]/60 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc6540] hover:shadow-xl hover:shadow-[#72fc650d]">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#72fc6510] blur-2xl transition-transform duration-500 group-hover:scale-150" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Total Trades
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {totalTrades}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#72fc6510] text-[#72fc65] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <BarChart3 size={20} />
                  </div>
                </div>
              </div>

              {/* WINS */}
              <div className="group relative overflow-hidden rounded-2xl border border-[#72fc6525] bg-[#06000e]/60 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc6580]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Winning Trades
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#72fc65]">
                      {wins}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#72fc6510] text-[#72fc65] transition-transform duration-300 group-hover:-translate-y-1">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>

              {/* LOSSES */}
              <div className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-[#06000e]/60 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-red-400/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Losing Trades
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-400">
                      {losses}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition-transform duration-300 group-hover:translate-y-1">
                    <TrendingDown size={20} />
                  </div>
                </div>
              </div>

              {/* WIN RATE */}
              <div className="group relative overflow-hidden rounded-2xl border border-yellow-400/20 bg-[#06000e]/60 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Win Rate
                    </p>

                    <p className="mt-2 text-2xl font-bold text-yellow-400">
                      {winRate}%
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <Trophy size={20} />
                  </div>
                </div>
              </div>
            </section>

            {/* ================= FILTERS ================= */}

            <section className="group relative overflow-hidden rounded-2xl border border-[#72fc6525] bg-[#06000e]/65 p-5 backdrop-blur-xl transition-all duration-500 hover:border-[#72fc6550]">
              <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-[#72fc650d] blur-3xl transition-transform duration-700 group-hover:scale-150" />

              <div className="relative">
                {/* FILTER HEADER */}
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]">
                      <ListFilter size={19} />
                    </div>

                    <div>
                      <h2 className="font-bold text-white">
                        Filter Trades
                      </h2>

                      <p className="text-[10px] text-gray-500">
                        Narrow down your trading history.
                      </p>
                    </div>
                  </div>

                  {/* SEARCH */}
                  <div className="relative w-full lg:w-72">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search symbol..."
                      className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-gray-600 focus:border-[#72fc65] focus:bg-[#72fc6508] focus:ring-2 focus:ring-[#72fc6510]"
                    />
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {/* RESULT FILTER */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Activity size={14} className="text-[#72fc65]" />

                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Trade Result
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {resultFilters.map((item) => {
                        const active = resultFilter === item;

                        return (
                          <button
                            key={item}
                            onClick={() => setResultFilter(item)}
                            className={`rounded-lg border px-4 py-2 text-xs font-bold transition-all duration-300 ${
                              active
                                ? "border-[#72fc6580] bg-[#72fc6515] text-[#72fc65] shadow-lg shadow-[#72fc6510]"
                                : "border-white/10 bg-white/[0.03] text-gray-400 hover:-translate-y-0.5 hover:border-[#72fc6540] hover:text-white"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SESSION FILTER */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Clock3 size={14} className="text-[#72fc65]" />

                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Trading Session
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {sessionFilters.map((item) => {
                        const active = sessionFilter === item;

                        return (
                          <button
                            key={item}
                            onClick={() => setSessionFilter(item)}
                            className={`rounded-lg border px-4 py-2 text-xs font-bold transition-all duration-300 ${
                              active
                                ? "border-[#72fc6580] bg-[#72fc6515] text-[#72fc65] shadow-lg shadow-[#72fc6510]"
                                : "border-white/10 bg-white/[0.03] text-gray-400 hover:-translate-y-0.5 hover:border-[#72fc6540] hover:text-white"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= TRADE LIST ================= */}

            <section className="rounded-2xl border border-white/10 bg-[#06000e]/45 p-4 backdrop-blur-xl">
              {/* LIST HEADER */}
              <div className="mb-4 flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#72fc6510] text-[#72fc65]">
                    <CandlestickChart size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-white">
                      Your Trades
                    </h2>

                    <p className="text-[10px] text-gray-500">
                      Showing {filteredTrades.length} of {totalTrades} trades
                    </p>
                  </div>
                </div>

                <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[10px] text-gray-500 sm:flex">
                  <Filter size={13} className="text-[#72fc65]" />

                  Filters Active
                </div>
              </div>

              {/* LOADING */}
              {loading ? (
                <div className="flex min-h-[350px] flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-[#72fc6520]" />

                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#72fc6540] bg-[#72fc6510]">
                      <Loader2
                        size={24}
                        className="animate-spin text-[#72fc65]"
                      />
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-gray-400">
                    Loading your trades...
                  </p>
                </div>
              ) : filteredTrades.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex min-h-[350px] flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gray-500">
                    <Inbox size={28} />
                  </div>

                  <h3 className="mt-5 font-bold text-white">
                    No trades found
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                    There are no trades matching your current filters. Try
                    changing the filters or add a new trade to your journal.
                  </p>

                  <Link
                    href="/journal"
                    className="mt-5 rounded-xl border border-[#72fc6540] bg-[#72fc6510] px-5 py-3 text-sm font-bold text-[#72fc65] transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc65] hover:bg-[#72fc6520]"
                  >
                    Add New Trade
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredTrades.map((trade, index) => {
                    const resultStyle = getResultStyle(trade.result);
                    const ResultIcon = resultStyle.icon;

                    const direction =
                      String(trade.direction || "").toUpperCase();

                    const isBuy = direction === "BUY";

                    return (
                      <Link
                        href={`/trade/${trade._id}`}
                        key={trade._id}
                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc6560] hover:bg-[#72fc6508] hover:shadow-xl hover:shadow-black/20"
                        style={{
                          animationDelay: `${index * 40}ms`,
                        }}
                      >
                        {/* HOVER GLOW */}
                        <div className="absolute -left-20 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-[#72fc650d] blur-3xl opacity-0 transition-all duration-500 group-hover:opacity-100" />

                        <div className="relative grid items-center gap-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                          {/* SYMBOL */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-[#72fc65] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                              <CandlestickChart size={20} />
                            </div>

                            <div>
                              <p className="text-base font-bold text-white">
                                {trade.symbol || "Unknown"}
                              </p>

                              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-500">
                                <CalendarDays size={11} />

                                {trade.createdAt
                                  ? new Date(
                                      trade.createdAt
                                    ).toLocaleDateString()
                                  : "No date"}
                              </div>
                            </div>
                          </div>

                          {/* DIRECTION */}
                          <div className="flex items-center justify-between md:block">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                              Direction
                            </p>

                            <div
                              className={`mt-1 flex items-center gap-1 text-sm font-bold ${
                                isBuy
                                  ? "text-[#72fc65]"
                                  : "text-red-400"
                              }`}
                            >
                              {isBuy ? (
                                <TrendingUp size={15} />
                              ) : (
                                <TrendingDown size={15} />
                              )}

                              {direction || "—"}
                            </div>
                          </div>

                          {/* RESULT */}
                          <div className="flex items-center justify-between md:block">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                              Result
                            </p>

                            <div
                              className={`mt-1 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${resultStyle.border} ${resultStyle.bg} ${resultStyle.text}`}
                            >
                              <ResultIcon size={13} />

                              <span className="text-xs font-bold">
                                {trade.result || "PENDING"}
                              </span>
                            </div>
                          </div>

                          {/* SESSION */}
                          <div className="flex items-center justify-between md:block">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                              Session
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white/80">
                              <Clock3
                                size={14}
                                className="text-[#72fc65]"
                              />

                              {trade.session || "—"}
                            </div>
                          </div>

                          {/* OPEN */}
                          <div className="flex justify-end">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-gray-500 transition-all duration-300 group-hover:border-[#72fc6540] group-hover:bg-[#72fc6510] group-hover:text-[#72fc65]">
                              <ChevronRight
                                size={19}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* BOTTOM STATUS */}
        <div className="mt-3 flex shrink-0 items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#72fc65]" />

            <span className="text-[10px] text-gray-500">
              Trade journal synchronized
            </span>
          </div>

          <Link
            href="/journal"
            className="group flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#72fc65]/70 transition-colors duration-300 hover:text-[#72fc65]"
          >
            New Trade

            <ArrowUpRight
              size={13}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </main>
  );
}