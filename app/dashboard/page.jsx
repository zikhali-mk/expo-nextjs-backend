"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CandlestickChart,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  DollarSign,
  Flame,
  Loader2,
  PieChart as PieChartIcon,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wallet,
  Brain,
  Percent,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  const [trades, setTrades] = useState([]);
  const [account, setAccount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [tradesResponse, accountResponse] = await Promise.all([
        fetch("/api/trade", {
          cache: "no-store",
        }),

        fetch("/api/account", {
          cache: "no-store",
        }),
      ]);

      const tradesData = await tradesResponse.json();
      const accountData = await accountResponse.json();

      if (!tradesResponse.ok) {
        throw new Error(
          tradesData.message || "Failed to load trades."
        );
      }

      if (!accountResponse.ok) {
        throw new Error(
          accountData.message || "Failed to load account."
        );
      }

      setTrades(tradesData.trades || []);
      setAccount(accountData || null);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================================
  // NORMALIZE TRADES
  // ============================================================

  const normalizedTrades = useMemo(() => {
    return trades.map((trade) => {
      const result = String(
        trade.result || "PENDING"
      ).toUpperCase();

      const amount = Math.abs(
        Number(trade.total || 0)
      );

      const profitLoss =
        result === "WIN"
          ? amount
          : result === "LOSE"
          ? -amount
          : 0;

      return {
        ...trade,
        result,
        amount,
        profitLoss,
        dateObject: trade.createdAt
          ? new Date(trade.createdAt)
          : new Date(0),
      };
    });
  }, [trades]);

  // ============================================================
  // SORTED TRADES
  // ============================================================

  const chronologicalTrades = useMemo(() => {
    return [...normalizedTrades].sort(
      (a, b) =>
        a.dateObject.getTime() -
        b.dateObject.getTime()
    );
  }, [normalizedTrades]);

  const latestTrades = useMemo(() => {
    return [...normalizedTrades].sort(
      (a, b) =>
        b.dateObject.getTime() -
        a.dateObject.getTime()
    );
  }, [normalizedTrades]);

  // ============================================================
  // BASIC STATS
  // ============================================================

  const totalTrades = normalizedTrades.length;

  const wins = normalizedTrades.filter(
    (trade) => trade.result === "WIN"
  ).length;

  const losses = normalizedTrades.filter(
    (trade) => trade.result === "LOSE"
  ).length;

  const pending = normalizedTrades.filter(
    (trade) => trade.result === "PENDING"
  ).length;

  const closedTrades = wins + losses;

  const winRate =
    closedTrades > 0
      ? (wins / closedTrades) * 100
      : 0;

  const lossRate =
    closedTrades > 0
      ? (losses / closedTrades) * 100
      : 0;

  // ============================================================
  // PROFIT / LOSS
  // ============================================================

  const totalProfit = normalizedTrades
    .filter((trade) => trade.result === "WIN")
    .reduce(
      (sum, trade) => sum + trade.amount,
      0
    );

  const totalLoss = normalizedTrades
    .filter((trade) => trade.result === "LOSE")
    .reduce(
      (sum, trade) => sum + trade.amount,
      0
    );

  const netProfit = totalProfit - totalLoss;

  // ============================================================
  // ACCOUNT VALUES
  // ============================================================

  const balance = Number(
    account?.balance || 0
  );

  const deposits = Number(
    account?.deposits || 0
  );

  const withdrawals = Number(
    account?.withdrawals || 0
  );

  const accountProfits = Number(
    account?.profits || 0
  );

  const accountLosses = Number(
    account?.losses || 0
  );

  // ============================================================
  // LAST SUNDAY
  // ============================================================

  const lastSunday = useMemo(() => {
    const now = new Date();

    const sunday = new Date(now);

    sunday.setHours(0, 0, 0, 0);

    sunday.setDate(
      sunday.getDate() - sunday.getDay()
    );

    return sunday;
  }, []);

  // ============================================================
  // WEEKLY TRADES
  // ============================================================

  const weeklyTrades = useMemo(() => {
    return chronologicalTrades.filter(
      (trade) =>
        trade.dateObject >= lastSunday
    );
  }, [chronologicalTrades, lastSunday]);

  const weeklyWins = weeklyTrades.filter(
    (trade) => trade.result === "WIN"
  ).length;

  const weeklyLosses = weeklyTrades.filter(
    (trade) => trade.result === "LOSE"
  ).length;

  const weeklyPending = weeklyTrades.filter(
    (trade) => trade.result === "PENDING"
  ).length;

  const weeklyProfit = weeklyTrades
    .filter((trade) => trade.result === "WIN")
    .reduce(
      (sum, trade) => sum + trade.amount,
      0
    );

  const weeklyLoss = weeklyTrades
    .filter((trade) => trade.result === "LOSE")
    .reduce(
      (sum, trade) => sum + trade.amount,
      0
    );

  const weeklyNet = weeklyProfit - weeklyLoss;

  const weeklyWinRate =
    weeklyWins + weeklyLosses > 0
      ? (weeklyWins /
          (weeklyWins + weeklyLosses)) *
        100
      : 0;

  // ============================================================
  // LINE CHART
  //
  // IMPORTANT:
  //
  // We calculate cumulative P/L from LAST SUNDAY.
  //
  // WIN  = positive amount
  // LOSE = negative amount
  //
  // Therefore:
  //
  //     positive values -> ABOVE zero
  //     negative values -> BELOW zero
  //
  // This fixes the upside-down chart problem.
  // ============================================================

  const lineChartData = useMemo(() => {
    let runningProfit = 0;

    return weeklyTrades.map((trade, index) => {
      runningProfit += trade.profitLoss;

      return {
        index: index + 1,

        // Actual individual trade result
        tradePL: trade.profitLoss,

        // Cumulative account performance
        value: Number(
          runningProfit.toFixed(2)
        ),

        date: trade.dateObject.toLocaleDateString(
          undefined,
          {
            day: "2-digit",
            month: "short",
          }
        ),

        time: trade.dateObject.toLocaleTimeString(
          undefined,
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),

        symbol: trade.symbol || "Trade",

        result: trade.result,
      };
    });
  }, [weeklyTrades]);

  // ============================================================
  // SESSION ANALYSIS
  // ============================================================

  const sessions = [
    "LONDON",
    "NEW YORK",
    "ASIA",
  ];

  const sessionData = sessions.map(
    (session) => {
      const sessionTrades =
        normalizedTrades.filter(
          (trade) =>
            String(
              trade.session || ""
            ).toUpperCase() === session
        );

      const sessionWins =
        sessionTrades.filter(
          (trade) =>
            trade.result === "WIN"
        ).length;

      const sessionLosses =
        sessionTrades.filter(
          (trade) =>
            trade.result === "LOSE"
        ).length;

      const sessionPL =
        sessionTrades.reduce(
          (sum, trade) =>
            sum + trade.profitLoss,
          0
        );

      return {
        session,
        trades: sessionTrades.length,
        wins: sessionWins,
        losses: sessionLosses,
        profit: Number(
          sessionPL.toFixed(2)
        ),
      };
    }
  );

  const bestSession = [...sessionData]
    .filter((session) => session.trades > 0)
    .sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return b.profit - a.profit;
    })[0];

  // ============================================================
  // PIE DATA
  // ============================================================

  const pieData = [
    {
      name: "Wins",
      value: wins,
    },
    {
      name: "Losses",
      value: losses,
    },
  ].filter((item) => item.value > 0);

  // ============================================================
  // DAILY / TRADE PERFORMANCE DATA
  // ============================================================

  const barChartData = sessions.map((session) => {
  const sessionName = String(session?.session || "UNKNOWN");

  return {
    name:
      sessionName === "NEW YORK"
        ? "NY"
        : sessionName === "LONDON"
        ? "LON"
        : sessionName === "ASIA"
        ? "ASIA"
        : sessionName.charAt(0) +
          sessionName.slice(1).toLowerCase(),

    trades: Number(session?.count || 0),
  };
});

  // ============================================================
  // FORMATTERS
  // ============================================================

  const money = (value) => {
    const number = Number(value || 0);

    return `$${Math.abs(number).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const signedMoney = (value) => {
    const number = Number(value || 0);

    if (number > 0) {
      return `+$${number.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    }

    if (number < 0) {
      return `-$${Math.abs(number).toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    }

    return "$0.00";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050009] text-white">
        <div className="absolute inset-0 bg-linear-to-br from-[#24012c] via-[#08000d] to-black" />

        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#72fc6510] blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-[#72fc6515]" />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#72fc6550] bg-black/50 text-[#72fc65] backdrop-blur-xl">
              <Loader2
                size={28}
                className="animate-spin"
              />
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            Loading trading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050009] text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-linear-to-br from-[#22002c] via-[#08000d] to-black" />

        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="absolute right-0 top-80 h-96 w-96 rounded-full bg-[#72fc65]/5 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {/* PAGE CONTAINER */}
      <div className="relative z-10 mx-2 my-2 flex min-h-[calc(100vh-16px)] flex-col overflow-hidden rounded-2xl border-2 border-[#33445571] bg-[#45464520] p-4 backdrop-blur-sm md:p-5">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-5 flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] shadow-lg shadow-[#72fc6505]">
              <BarChart3 size={23} />
            </div>

            <div>
              <h1 className="bg-linear-to-r from-[#72fc65] via-white to-[#72fc65] bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                Trading Dashboard
              </h1>

              <p className="text-xs text-gray-500">
                Your trading performance intelligence system
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="group flex items-center gap-2 rounded-xl border border-[#72fc6530] bg-black/20 px-4 py-2.5 text-sm font-semibold text-[#72fc65] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#72fc6580] hover:bg-[#72fc6510] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : "transition-transform duration-500 group-hover:rotate-180"
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </header>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mx-auto max-w-7xl space-y-5">
            {/* =================================================
                TOP STAT CARDS
            ================================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* BALANCE */}
              <StatCard
                icon={Wallet}
                title="Account Balance"
                value={money(balance)}
                subtitle="Current account equity"
                iconClass="text-[#72fc65]"
                iconBg="bg-[#72fc6510]"
                border="border-[#72fc6525]"
              />

              {/* NET PROFIT */}
              <StatCard
                icon={
                  netProfit >= 0
                    ? TrendingUp
                    : TrendingDown
                }
                title="Net Performance"
                value={signedMoney(netProfit)}
                subtitle="Based on recorded trades"
                valueClass={
                  netProfit >= 0
                    ? "text-[#72fc65]"
                    : "text-red-400"
                }
                iconClass={
                  netProfit >= 0
                    ? "text-[#72fc65]"
                    : "text-red-400"
                }
                iconBg={
                  netProfit >= 0
                    ? "bg-[#72fc6510]"
                    : "bg-red-500/10"
                }
                border={
                  netProfit >= 0
                    ? "border-[#72fc6525]"
                    : "border-red-500/20"
                }
              />

              {/* WIN RATE */}
              <StatCard
                icon={Target}
                title="Win Rate"
                value={`${winRate.toFixed(1)}%`}
                subtitle={`${wins} wins / ${losses} losses`}
                iconClass="text-purple-400"
                iconBg="bg-purple-500/10"
                border="border-purple-400/20"
              />

              {/* TRADES */}
              <StatCard
                icon={CandlestickChart}
                title="Total Trades"
                value={totalTrades}
                subtitle={`${pending} pending`}
                iconClass="text-yellow-400"
                iconBg="bg-yellow-400/10"
                border="border-yellow-400/20"
              />
            </div>

            {/* =================================================
                ACCOUNT OVERVIEW
            ================================================== */}

            <section className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#06000e]/70 p-5 backdrop-blur-xl transition-all duration-500 hover:border-[#72fc6535]">
              <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#72fc6508] blur-3xl transition-transform duration-700 group-hover:scale-125" />

              <div className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]">
                    <CircleDollarSign size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Account Overview
                    </h2>

                    <p className="text-xs text-gray-500">
                      Current financial state
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <AccountItem
                    label="Balance"
                    value={money(balance)}
                    icon={Wallet}
                    valueClass="text-[#72fc65]"
                  />

                  <AccountItem
                    label="Deposits"
                    value={money(deposits)}
                    icon={ArrowDownRight}
                    valueClass="text-white"
                  />

                  <AccountItem
                    label="Withdrawals"
                    value={money(withdrawals)}
                    icon={ArrowUpRight}
                    valueClass="text-red-400"
                  />

                  <AccountItem
                    label="Account Profit"
                    value={signedMoney(
                      accountProfits
                    )}
                    icon={TrendingUp}
                    valueClass="text-[#72fc65]"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                MAIN CHART + WIN LOSS
            ================================================== */}

            <div className="grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">
              {/* WEEKLY LINE CHART */}

              <section className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#06000e]/70 p-5 backdrop-blur-xl transition-all duration-500 hover:border-[#72fc6540]">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#72fc6508] blur-3xl transition-transform duration-700 group-hover:scale-125" />

                <div className="relative">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]">
                        <Activity size={21} />
                      </div>

                      <div>
                        <h2 className="font-bold text-white">
                          Weekly Equity Curve
                        </h2>

                        <p className="text-xs text-gray-500">
                          Cumulative P/L from last Sunday
                        </p>
                      </div>
                    </div>

                    <div
                      className={`rounded-xl border px-3 py-2 text-sm font-bold ${
                        weeklyNet >= 0
                          ? "border-[#72fc6530] bg-[#72fc6510] text-[#72fc65]"
                          : "border-red-500/30 bg-red-500/10 text-red-400"
                      }`}
                    >
                      {signedMoney(weeklyNet)}
                    </div>
                  </div>

                  <div className="h-[320px] w-full">
                    {lineChartData.length > 0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <AreaChart
                          data={lineChartData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: -15,
                            bottom: 5,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="profitGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#72fc65"
                                stopOpacity={0.35}
                              />

                              <stop
                                offset="100%"
                                stopColor="#72fc65"
                                stopOpacity={0}
                              />
                            </linearGradient>

                            <linearGradient
                              id="lossGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#ef4444"
                                stopOpacity={0}
                              />

                              <stop
                                offset="100%"
                                stopColor="#ef4444"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            stroke="rgba(255,255,255,0.06)"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="date"
                            tick={{
                              fill: "#6b7280",
                              fontSize: 10,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            tick={{
                              fill: "#6b7280",
                              fontSize: 10,
                            }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) =>
                              `$${value}`
                            }
                            domain={[
                              "auto",
                              "auto",
                            ]}
                          />

                          <Tooltip
                            content={
                              <WeeklyTooltip />
                            }
                          />

                          {/* POSITIVE AREA */}
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#72fc65"
                            strokeWidth={3}
                            fill="url(#profitGradient)"
                            fillOpacity={1}
                            connectNulls
                            activeDot={{
                              r: 6,
                              strokeWidth: 2,
                              stroke: "#72fc65",
                              fill: "#06000e",
                            }}
                          />

                          {/* ZERO LINE IS IMPORTANT.
                              It visually establishes that:
                              above = profit
                              below = loss
                          */}
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center">
                        <Activity
                          size={38}
                          className="text-gray-700"
                        />

                        <p className="mt-3 text-sm text-gray-500">
                          No trades recorded since Sunday.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CHART LEGEND */}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#72fc65]" />

                        <span className="text-[10px] text-gray-500">
                          Profit / Positive
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-400" />

                        <span className="text-[10px] text-gray-500">
                          Loss / Negative
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-gray-600">
                      Latest trade → right side
                    </span>
                  </div>
                </div>
              </section>

              {/* WIN / LOSS PIE */}

              <section className="rounded-2xl border border-white/10 bg-[#06000e]/70 p-5 backdrop-blur-xl transition-all duration-500 hover:border-purple-400/30">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <PieChartIcon size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Win vs Loss
                    </h2>

                    <p className="text-xs text-gray-500">
                      Closed trade distribution
                    </p>
                  </div>
                </div>

                <div className="relative h-[230px]">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={5}
                          stroke="none"
                        >
                          {pieData.map(
                            (entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={
                                  index === 0
                                    ? "#72fc65"
                                    : "#ef4444"
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            background:
                              "#09000f",
                            border:
                              "1px solid rgba(255,255,255,0.1)",
                            borderRadius:
                              "12px",
                            color: "#fff",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      No closed trades yet.
                    </div>
                  )}

                  {closedTrades > 0 && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {winRate.toFixed(0)}%
                      </span>

                      <span className="text-[10px] uppercase tracking-widest text-gray-500">
                        Win Rate
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MiniResult
                    label="Wins"
                    value={wins}
                    percentage={`${winRate.toFixed(
                      1
                    )}%`}
                    color="green"
                  />

                  <MiniResult
                    label="Losses"
                    value={losses}
                    percentage={`${lossRate.toFixed(
                      1
                    )}%`}
                    color="red"
                  />
                </div>
              </section>
            </div>

            {/* =================================================
                WEEKLY SUMMARY
            ================================================== */}

            <section className="rounded-2xl border border-[#72fc6520] bg-[#06000e]/70 p-5 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#72fc6510] text-[#72fc65]">
                  <CalendarDays size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-white">
                    This Week
                  </h2>

                  <p className="text-xs text-gray-500">
                    Performance since Sunday
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <SummaryBox
                  label="Trades"
                  value={weeklyTrades.length}
                  icon={CandlestickChart}
                />

                <SummaryBox
                  label="Wins"
                  value={weeklyWins}
                  icon={TrendingUp}
                  valueClass="text-[#72fc65]"
                />

                <SummaryBox
                  label="Losses"
                  value={weeklyLosses}
                  icon={TrendingDown}
                  valueClass="text-red-400"
                />

                <SummaryBox
                  label="Win Rate"
                  value={`${weeklyWinRate.toFixed(
                    1
                  )}%`}
                  icon={Percent}
                  valueClass="text-purple-400"
                />

                <SummaryBox
                  label="Net P/L"
                  value={signedMoney(weeklyNet)}
                  icon={DollarSign}
                  valueClass={
                    weeklyNet >= 0
                      ? "text-[#72fc65]"
                      : "text-red-400"
                  }
                />
              </div>
            </section>

            {/* =================================================
                SESSION PERFORMANCE
            ================================================== */}

            <div className="grid gap-5 xl:grid-cols-2">
              {/* SESSION BARS */}

              <section className="rounded-2xl border border-white/10 bg-[#06000e]/70 p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <Clock3 size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Trading Sessions
                    </h2>

                    <p className="text-xs text-gray-500">
                      Session activity and performance
                    </p>
                  </div>
                </div>

                <div className="h-[250px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={barChartData}
                      margin={{
                        top: 10,
                        right: 5,
                        left: -20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: "#777",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{
                          fill: "#777",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          background:
                            "#09000f",
                          border:
                            "1px solid rgba(255,255,255,0.1)",
                          borderRadius:
                            "12px",
                          color: "#fff",
                        }}
                        formatter={(value) => [
                          signedMoney(value),
                          "P/L",
                        ]}
                      />

                      <Bar
                        dataKey="profit"
                        radius={[
                          7,
                          7,
                          0,
                          0,
                        ]}
                        fill="#72fc65"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* SESSION DETAILS */}

              <section className="rounded-2xl border border-white/10 bg-[#06000e]/70 p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#72fc6510] text-[#72fc65]">
                    <Layers3 size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Session Breakdown
                    </h2>

                    <p className="text-xs text-gray-500">
                      Detailed session statistics
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sessionData.map(
                    (session) => {
                      const percentage =
                        totalTrades > 0
                          ? (session.trades /
                              totalTrades) *
                            100
                          : 0;

                      return (
                        <div
                          key={session.session}
                          className="rounded-xl border border-white/5 bg-black/20 p-4 transition-all duration-300 hover:border-[#72fc6530] hover:bg-[#72fc6508]"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div>
                              <span className="text-sm font-bold text-white">
                                {session.session}
                              </span>

                              <p className="text-[10px] text-gray-600">
                                {session.trades} trades
                              </p>
                            </div>

                            <span
                              className={`text-sm font-bold ${
                                session.profit >=
                                0
                                  ? "text-[#72fc65]"
                                  : "text-red-400"
                              }`}
                            >
                              {signedMoney(
                                session.profit
                              )}
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-purple-500 transition-all duration-700"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <div className="mt-2 flex justify-between text-[10px] text-gray-600">
                            <span>
                              Wins:{" "}
                              {session.wins}
                            </span>

                            <span>
                              Losses:{" "}
                              {session.losses}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#72fc6520] bg-[#72fc6508] p-3">
                  <Trophy
                    size={16}
                    className="text-[#72fc65]"
                  />

                  <span className="text-xs text-gray-400">
                    Best Session:
                  </span>

                  <span className="text-xs font-bold text-[#72fc65]">
                    {bestSession?.session ||
                      "N/A"}
                  </span>
                </div>
              </section>
            </div>

            {/* =================================================
                PERFORMANCE METRICS
            ================================================== */}

            <section className="rounded-2xl border border-white/10 bg-[#06000e]/70 p-5 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  <Trophy size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-white">
                    Performance Metrics
                  </h2>

                  <p className="text-xs text-gray-500">
                    Your complete trading statistics
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                  icon={TrendingUp}
                  label="Gross Profit"
                  value={money(totalProfit)}
                  color="green"
                />

                <Metric
                  icon={TrendingDown}
                  label="Gross Loss"
                  value={`-${money(
                    totalLoss
                  )}`}
                  color="red"
                />

                <Metric
                  icon={ShieldCheck}
                  label="Closed Trades"
                  value={closedTrades}
                  color="purple"
                />

                <Metric
                  icon={Flame}
                  label="Pending Trades"
                  value={pending}
                  color="yellow"
                />
              </div>
            </section>

            {/* =================================================
                RECENT TRADES
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#06000e]/70 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#72fc6510] text-[#72fc65]">
                    <CandlestickChart size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Recent Trades
                    </h2>

                    <p className="text-xs text-gray-500">
                      Latest activity
                    </p>
                  </div>
                </div>

                <Link
                  href="/trades"
                  className="group flex items-center gap-1 text-xs font-bold text-[#72fc65] transition-all hover:gap-2"
                >
                  View All
                  <ChevronRight
                    size={14}
                  />
                </Link>
              </div>

              {latestTrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14">
                  <CandlestickChart
                    size={40}
                    className="text-gray-700"
                  />

                  <p className="mt-3 text-sm text-gray-500">
                    No trades recorded yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {latestTrades
                    .slice(0, 8)
                    .map((trade) => {
                      const isWin =
                        trade.result ===
                        "WIN";

                      const isLoss =
                        trade.result ===
                        "LOSE";

                      return (
                        <Link
                          href={`/trades/${trade._id}`}
                          key={trade._id}
                          className="group flex flex-col gap-3 px-5 py-4 transition-all duration-300 hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                isWin
                                  ? "bg-[#72fc6510] text-[#72fc65]"
                                  : isLoss
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-yellow-400/10 text-yellow-400"
                              }`}
                            >
                              {isWin ? (
                                <TrendingUp
                                  size={18}
                                />
                              ) : isLoss ? (
                                <TrendingDown
                                  size={18}
                                />
                              ) : (
                                <Clock3
                                  size={18}
                                />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  {trade.symbol ||
                                    "Trade"}
                                </span>

                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                    isWin
                                      ? "bg-[#72fc6510] text-[#72fc65]"
                                      : isLoss
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-yellow-400/10 text-yellow-400"
                                  }`}
                                >
                                  {trade.result}
                                </span>
                              </div>

                              <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-600">
                                <span>
                                  {trade.direction ||
                                    "—"}
                                </span>

                                <span>
                                  •
                                </span>

                                <span>
                                  {formatDate(
                                    trade.createdAt
                                  )}
                                </span>

                                <span>
                                  {formatTime(
                                    trade.createdAt
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-5 sm:justify-end">
                            <div className="text-right">
                              <span
                                className={`text-sm font-bold ${
                                  isWin
                                    ? "text-[#72fc65]"
                                    : isLoss
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {trade.result ===
                                "PENDING"
                                  ? "—"
                                  : signedMoney(
                                      trade.profitLoss
                                    )}
                              </span>

                              <p className="text-[10px] text-gray-600">
                                {trade.session ||
                                  "No session"}
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="text-gray-700 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#72fc65]"
                            />
                          </div>
                        </Link>
                      );
                    })}
                </div>
              )}
            </section>

            {/* =================================================
                WEEKLY REVIEW
            ================================================== */}

            <section className="relative overflow-hidden rounded-2xl border border-[#72fc6520] bg-[#06000e]/70 p-5 backdrop-blur-xl">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#72fc6508] blur-3xl" />

              <div className="relative flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#72fc6510] text-[#72fc65]">
                  <Brain size={22} />
                </div>

                <div className="flex-1">
                  <h2 className="font-bold text-white">
                    Weekly Review
                  </h2>

                  <p className="mt-1 text-sm leading-relaxed text-gray-400">
                    {weeklyTrades.length ===
                    0
                      ? "No trades have been recorded this week. Focus on waiting for high-quality setups rather than forcing trades."
                      : weeklyWinRate >= 60
                      ? "Strong execution week. Your win rate is healthy. Continue following your trading plan and avoid unnecessary trades."
                      : weeklyWinRate >=
                        50
                      ? "Balanced week. Keep reviewing your entries and focus on maintaining discipline and consistent risk management."
                      : "This week needs review. Focus on identifying repeated mistakes, emotional decisions, and trades that did not meet your setup criteria."}
                  </p>
                </div>

                <div className="rounded-xl border border-[#72fc6520] bg-[#72fc6508] px-4 py-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                    Weekly Result
                  </p>

                  <p
                    className={`mt-1 text-lg font-bold ${
                      weeklyNet >= 0
                        ? "text-[#72fc65]"
                        : "text-red-400"
                    }`}
                  >
                    {signedMoney(
                      weeklyNet
                    )}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="mt-4 flex shrink-0 items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#72fc65]" />

            <span className="text-[10px] text-gray-600">
              Trading analytics system online
            </span>
          </div>

          <span className="hidden text-[10px] text-gray-700 sm:block">
            Last Sunday →{" "}
            {lastSunday.toLocaleDateString(
              undefined,
              {
                day: "2-digit",
                month: "short",
              }
            )}
          </span>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  iconClass,
  iconBg,
  border,
  valueClass = "text-white",
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${border} bg-[#06000e]/70 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#72fc6540]`}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/[0.02] blur-2xl transition-transform duration-700 group-hover:scale-150" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconClass}`}
          >
            <Icon size={19} />
          </div>

          <ArrowUpRight
            size={15}
            className="text-gray-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#72fc65]"
          />
        </div>

        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
          {title}
        </p>

        <p
          className={`mt-1 text-2xl font-bold ${valueClass}`}
        >
          {value}
        </p>

        <p className="mt-1 text-[10px] text-gray-600">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// ACCOUNT ITEM
// ============================================================

function AccountItem({
  label,
  value,
  icon: Icon,
  valueClass = "text-white",
}) {
  return (
    <div className="group rounded-xl border border-white/5 bg-black/20 p-4 transition-all duration-300 hover:border-[#72fc6525] hover:bg-[#72fc6508]">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-gray-600 transition-colors group-hover:text-[#72fc65]"
        />

        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 text-lg font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// MINI RESULT
// ============================================================

function MiniResult({
  label,
  value,
  percentage,
  color,
}) {
  const green = color === "green";

  return (
    <div
      className={`rounded-xl border p-3 ${
        green
          ? "border-[#72fc6520] bg-[#72fc6508]"
          : "border-red-500/20 bg-red-500/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500">
          {label}
        </span>

        <span
          className={`text-[10px] font-bold ${
            green
              ? "text-[#72fc65]"
              : "text-red-400"
          }`}
        >
          {percentage}
        </span>
      </div>

      <p
        className={`mt-1 text-xl font-bold ${
          green
            ? "text-[#72fc65]"
            : "text-red-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// SUMMARY BOX
// ============================================================

function SummaryBox({
  label,
  value,
  icon: Icon,
  valueClass = "text-white",
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-4 transition-all duration-300 hover:border-[#72fc6525] hover:bg-[#72fc6505]">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-gray-600"
        />

        <span className="text-[10px] uppercase tracking-wider text-gray-600">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 text-xl font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// METRIC
// ============================================================

function Metric({
  icon: Icon,
  label,
  value,
  color,
}) {
  const classes = {
    green: "text-[#72fc65] bg-[#72fc6510]",
    red: "text-red-400 bg-red-500/10",
    purple:
      "text-purple-400 bg-purple-500/10",
    yellow:
      "text-yellow-400 bg-yellow-400/10",
  };

  return (
    <div className="group rounded-xl border border-white/5 bg-black/20 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${classes[color]}`}
        >
          <Icon size={15} />
        </div>

        <span className="text-[10px] uppercase tracking-wider text-gray-600">
          {label}
        </span>
      </div>

      <p
        className={`mt-3 text-xl font-bold ${
          classes[color].split(" ")[0]
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// CUSTOM WEEKLY TOOLTIP
// ============================================================

function WeeklyTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const data = payload[0].payload;

  const positive =
    Number(data.value) >= 0;

  return (
    <div className="min-w-44 rounded-xl border border-white/10 bg-[#09000f]/95 p-3 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-5">
        <span className="text-xs font-bold text-white">
          {data.symbol}
        </span>

        <span
          className={`text-xs font-bold ${
            data.result === "WIN"
              ? "text-[#72fc65]"
              : data.result === "LOSE"
              ? "text-red-400"
              : "text-yellow-400"
          }`}
        >
          {data.result}
        </span>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex justify-between gap-5">
          <span className="text-[10px] text-gray-500">
            Trade P/L
          </span>

          <span
            className={`text-[10px] font-bold ${
              data.tradePL >= 0
                ? "text-[#72fc65]"
                : "text-red-400"
            }`}
          >
            {data.tradePL >= 0
              ? "+"
              : "-"}
            $
            {Math.abs(
              data.tradePL
            ).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between gap-5">
          <span className="text-[10px] text-gray-500">
            Cumulative
          </span>

          <span
            className={`text-[10px] font-bold ${
              positive
                ? "text-[#72fc65]"
                : "text-red-400"
            }`}
          >
            {data.value >= 0
              ? "+"
              : "-"}
            $
            {Math.abs(
              data.value
            ).toFixed(2)}
          </span>
        </div>

        <div className="mt-2 border-t border-white/5 pt-2 text-[9px] text-gray-600">
          {data.date} • {data.time}
        </div>
      </div>
    </div>
  );
}