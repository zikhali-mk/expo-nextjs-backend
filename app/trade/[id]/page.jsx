"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

import {
  ArrowLeft,
  CalendarDays,
  CandlestickChart,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  PencilLine,
  RefreshCw,
  Save,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Trash2,
  TriangleAlert,
  Trophy,
  Upload,
  X,
  XCircle,
  Activity,
} from "lucide-react";

import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/javascript";

export default function TradeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [trade, setTrade] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [result, setResult] = useState("PENDING");
  const [total, setTotal] = useState("");

  // ==========================================
  // IMAGE STATE
  // ==========================================

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);

  // ==========================================
  // FETCH TRADE
  // ==========================================

  const fetchTrade = useCallback(
    async (isRefresh = false) => {
      if (!id) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(`/api/trade/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load trade."
          );
        }

        const tradeData = data.trade;

        setTrade(tradeData);

        const tradeResult = String(
          tradeData.result || "PENDING"
        ).toUpperCase();

        setResult(
          ["WIN", "LOSE", "PENDING"].includes(tradeResult)
            ? tradeResult
            : "PENDING"
        );

        setTotal(
          Math.abs(
            Number(tradeData.total || 0)
          ).toString()
        );
      } catch (error) {
        console.error("Failed to fetch trade:", error);

        toast.error(
          error.message || "Failed to load trade."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchTrade();
  }, [fetchTrade]);

  // ==========================================
  // CLEAN IMAGE PREVIEW
  // ==========================================

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ==========================================
  // IMAGE SELECT
  // ==========================================

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Image must be smaller than 25MB.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
    setImageProgress(0);

    // Immediately upload after selection
    await uploadTradeImage(file);
  };

  // ==========================================
  // UPLOAD IMAGE TO IMAGEKIT
  // ==========================================

  const uploadTradeImage = async (file) => {
    if (!file || !id) return;

    try {
      setUploadingImage(true);
      setImageProgress(0);

      // ----------------------------------------
      // STEP 1 - GET IMAGEKIT AUTH
      // ----------------------------------------

      const authResponse = await fetch("/api/upload-auth", {
        method: "GET",
        cache: "no-store",
      });

      if (!authResponse.ok) {
        const errorData = await authResponse
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.error ||
            `ImageKit authentication failed (${authResponse.status})`
        );
      }

      const auth = await authResponse.json();

      // ----------------------------------------
      // STEP 2 - UPLOAD TO IMAGEKIT
      // ----------------------------------------

      const response = await upload({
        file,
        fileName: file.name,

        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
        publicKey: auth.publicKey,

        useUniqueFileName: true,

        // Store trade screenshots here
        folder: "/trades",

        onProgress: (event) => {
          if (event.total) {
            const percentage = Math.round(
              (event.loaded / event.total) * 100
            );

            setImageProgress(percentage);
          }
        },
      });

      console.log("IMAGEKIT UPLOAD RESPONSE:", response);
      console.log("IMAGE URL:", response.url);

      if (!response.url) {
        throw new Error(
          "ImageKit did not return an image URL."
        );
      }

      // ----------------------------------------
      // STEP 3 - SAVE IMAGE URL TO TRADE
      // ----------------------------------------

      const tradeResponse = await fetch(
        `/api/trade/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: response.url,
          }),
        }
      );

      const tradeData = await tradeResponse.json();

      if (!tradeResponse.ok) {
        throw new Error(
          tradeData.message ||
            "Image uploaded, but trade could not be updated."
        );
      }

      // ----------------------------------------
      // STEP 4 - UPDATE LOCAL TRADE
      // ----------------------------------------

      setTrade((prev) => ({
        ...prev,
        image: response.url,
      }));

      setImageProgress(100);

      toast.success(
        "Trade screenshot uploaded successfully 🟢"
      );

      // Clear temporary picker state
      setSelectedImage(null);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview("");
    } catch (error) {
      console.error(
        "Trade image upload error:",
        error
      );

      if (error instanceof ImageKitAbortError) {
        toast.error("Image upload was cancelled.");
      } else if (
        error instanceof ImageKitInvalidRequestError
      ) {
        toast.error(
          `Invalid ImageKit request: ${error.message}`
        );
      } else if (
        error instanceof ImageKitUploadNetworkError
      ) {
        toast.error(
          `Image upload network error: ${error.message}`
        );
      } else if (
        error instanceof ImageKitServerError
      ) {
        toast.error(
          `ImageKit server error: ${error.message}`
        );
      } else {
        toast.error(
          error?.message ||
            "Failed to upload trade image."
        );
      }

      // Remove failed temporary preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setSelectedImage(null);
      setImagePreview("");
      setImageProgress(0);
    } finally {
      setUploadingImage(false);
    }
  };

  // ==========================================
  // ACCOUNT CHANGE CALCULATION
  // ==========================================

  const calculateAccountChanges = (
    oldResult,
    oldTotal,
    newResult,
    newTotal
  ) => {
    const oldAmount = Math.abs(
      Number(oldTotal || 0)
    );

    const newAmount = Math.abs(
      Number(newTotal || 0)
    );

    let profitChange = 0;
    let lossChange = 0;

    // Remove old result
    if (oldResult === "WIN") {
      profitChange -= oldAmount;
    }

    if (oldResult === "LOSE") {
      lossChange -= oldAmount;
    }

    // Apply new result
    if (newResult === "WIN") {
      profitChange += newAmount;
    }

    if (newResult === "LOSE") {
      lossChange += newAmount;
    }

    const balanceChange =
      profitChange - lossChange;

    return {
      profitChange,
      lossChange,
      balanceChange,
    };
  };

  // ==========================================
  // UPDATE TRADE + ACCOUNT
  // ==========================================

  const updateTrade = async () => {
    if (updating || deleting) return;

    if (
      !["WIN", "LOSE", "PENDING"].includes(result)
    ) {
      toast.error(
        "Please select WIN, LOSE, or PENDING."
      );

      return;
    }

    const newTotal =
      result === "PENDING"
        ? 0
        : Math.abs(Number(total));

    if (
      (result === "WIN" || result === "LOSE") &&
      (total === "" ||
        Number.isNaN(Number(total)) ||
        Number(total) <= 0)
    ) {
      toast.error(
        "Please enter a valid amount greater than 0."
      );

      return;
    }

    const oldResult = String(
      trade?.result || "PENDING"
    ).toUpperCase();

    const oldTotal = Math.abs(
      Number(trade?.total || 0)
    );

    const {
      profitChange,
      lossChange,
    } = calculateAccountChanges(
      oldResult,
      oldTotal,
      result,
      newTotal
    );

    // Nothing changed
    if (
      oldResult === result &&
      oldTotal === newTotal
    ) {
      toast("No changes were made.");
      return;
    }

    try {
      setUpdating(true);

      // ----------------------------------------
      // STEP 1 - UPDATE TRADE
      // ----------------------------------------

      const tradeResponse = await fetch(
        `/api/trade/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            result,
            total: newTotal,
          }),
        }
      );

      const tradeData =
        await tradeResponse.json();

      if (!tradeResponse.ok) {
        throw new Error(
          tradeData.message ||
            "Failed to update trade."
        );
      }

      // ----------------------------------------
      // STEP 2 - UPDATE ACCOUNT
      // ----------------------------------------

      const accountPayload = {};

      if (profitChange !== 0) {
        accountPayload.profit = profitChange;
      }

      if (lossChange !== 0) {
        accountPayload.loss = lossChange;
      }

      if (
        Object.keys(accountPayload).length > 0
      ) {
        const accountResponse = await fetch(
          "/api/account",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              accountPayload
            ),
          }
        );

        const accountData =
          await accountResponse.json();

        if (!accountResponse.ok) {
          throw new Error(
            accountData.message ||
              "Trade updated but account update failed."
          );
        }
      }

      toast.success(
        "Trade and account updated successfully 🟢"
      );

      await fetchTrade();
    } catch (error) {
      console.error(
        "Trade/account update error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to update trade."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // DELETE TRADE + REVERSE ACCOUNT
  // ==========================================

  const deleteTrade = async () => {
    if (deleting || updating) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        trade?.symbol || "this trade"
      }?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const oldResult = String(
        trade?.result || "PENDING"
      ).toUpperCase();

      const oldTotal = Math.abs(
        Number(trade?.total || 0)
      );

      // ----------------------------------------
      // STEP 1 - DELETE TRADE
      // ----------------------------------------

      const tradeResponse = await fetch(
        `/api/trade/${id}`,
        {
          method: "DELETE",
        }
      );

      const tradeData =
        await tradeResponse.json();

      if (!tradeResponse.ok) {
        throw new Error(
          tradeData.message ||
            "Failed to delete trade."
        );
      }

      // ----------------------------------------
      // STEP 2 - REVERSE ACCOUNT
      // ----------------------------------------

      const accountPayload = {};

      if (
        oldResult === "WIN" &&
        oldTotal > 0
      ) {
        accountPayload.profit = -oldTotal;
      }

      if (
        oldResult === "LOSE" &&
        oldTotal > 0
      ) {
        accountPayload.loss = -oldTotal;
      }

      if (
        Object.keys(accountPayload).length > 0
      ) {
        const accountResponse = await fetch(
          "/api/account",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              accountPayload
            ),
          }
        );

        const accountData =
          await accountResponse.json();

        if (!accountResponse.ok) {
          throw new Error(
            accountData.message ||
              "Trade deleted but account reversal failed."
          );
        }
      }

      toast.success(
        "Trade deleted and account updated."
      );

      setTimeout(() => {
        router.push("/trades");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Delete error:", error);

      toast.error(
        error.message ||
          "Failed to delete trade."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#06000e]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source
            src="/video.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-[#24012c85]" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-[#72fc6520]" />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#72fc6550] bg-[#06000e]/70 text-[#72fc65] backdrop-blur-xl">
              <Loader2
                size={28}
                className="animate-spin"
              />
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            Loading trade details...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!trade) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06000e]">
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 flex max-w-md flex-col items-center rounded-2xl border border-white/10 bg-[#06000e]/75 p-8 text-center backdrop-blur-xl">
          <TriangleAlert
            size={42}
            className="text-yellow-400"
          />

          <h1 className="mt-4 text-xl font-bold text-white">
            Trade not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            This trade may have been deleted or
            the link is no longer valid.
          </p>

          <Link
            href="/trades"
            className="mt-6 flex items-center gap-2 rounded-xl border border-[#72fc6540] bg-[#72fc6510] px-5 py-3 text-sm font-bold text-[#72fc65] transition-all hover:-translate-y-1 hover:border-[#72fc65]"
          >
            <ArrowLeft size={16} />
            Back to Trades
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // RESULT HELPERS
  // ==========================================

  const normalizedResult = String(
    trade?.result || "PENDING"
  ).toUpperCase();

  const isWin = normalizedResult === "WIN";
  const isLose = normalizedResult === "LOSE";

  const executionRate = Math.min(
    100,
    Math.max(
      0,
      Number(trade?.executionRate || 0)
    )
  );

  const hasTradeImage =
    Boolean(trade?.image) &&
    String(trade.image).toUpperCase() !==
      "PENDING";

  const displayTotal =
    normalizedResult === "PENDING"
      ? "—"
      : isWin
        ? `+$${Math.abs(
            Number(trade?.total || 0)
          ).toFixed(2)}`
        : `-$${Math.abs(
            Number(trade?.total || 0)
          ).toFixed(2)}`;

  const resultStyles = isWin
    ? {
        text: "text-[#72fc65]",
        bg: "bg-[#72fc6510]",
        border: "border-[#72fc6540]",
        icon: CheckCircle2,
      }
    : isLose
      ? {
          text: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          icon: XCircle,
        }
      : {
          text: "text-yellow-400",
          bg: "bg-yellow-400/10",
          border: "border-yellow-400/30",
          icon: Clock3,
        };

  const ResultIcon = resultStyles.icon;

  // ==========================================
  // DETAIL ROW
  // ==========================================

  const DetailRow = ({
    icon: Icon,
    label,
    value,
    valueClass = "text-white",
  }) => (
    <div className="flex items-center justify-between border-b border-white/5 py-3">
      <div className="flex items-center gap-3">
        <Icon
          size={15}
          className="text-gray-500"
        />

        <span className="text-xs font-medium text-gray-500">
          {label}
        </span>
      </div>

      <span
        className={`text-right text-sm font-bold ${valueClass}`}
      >
        {value ?? "—"}
      </span>
    </div>
  );

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06000e]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0b0f0b",
            color: "#ffffff",
            border:
              "1px solid rgba(114,252,101,0.25)",
          },
        }}
      />

      {/* VIDEO BACKGROUND */}

      <video
        className="fixed inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source
          src="/video.mp4"
          type="video/mp4"
        />
      </video>

      <div className="fixed inset-0 bg-[#24012c52]" />

      <div className="fixed inset-0 bg-linear-to-br from-[#06000e]/35 via-transparent to-black/75" />

      {/* MAIN GLASS CONTAINER */}

      <div className="relative z-10 m-2 flex min-h-[calc(100vh-16px)] flex-col overflow-hidden rounded-2xl border-2 border-[#33445571] bg-[#45464528] p-4 backdrop-blur-sm">

        {/* HEADER */}

        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/trades"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-gray-400 transition-all duration-300 hover:-translate-x-1 hover:border-[#72fc6580] hover:bg-[#72fc6510] hover:text-[#72fc65]"
            >
              <ArrowLeft
                size={19}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] shadow-lg shadow-[#72fc6510]">
                <CandlestickChart size={22} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="bg-linear-to-r from-[#72fc65] via-white to-[#72fc65] bg-clip-text text-2xl font-bold text-transparent">
                    {trade.symbol}
                  </h1>

                  <span
                    className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${resultStyles.border} ${resultStyles.bg} ${resultStyles.text}`}
                  >
                    {normalizedResult}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-gray-400">
                  Trade Details & Performance
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchTrade(true)}
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
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>
        </header>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto py-5 pr-1">
          <div className="mx-auto grid w-full max-w-7xl gap-5 xl:grid-cols-[1.2fr_0.8fr]">

            {/* ==================================
                LEFT SIDE
            ================================== */}

            <div className="flex flex-col gap-5">

              {/* TRADE DETAILS */}

              <section className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#06000e]/65 p-5 backdrop-blur-xl transition-all duration-500 hover:border-[#72fc6545]">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#72fc650d] blur-3xl transition-transform duration-700 group-hover:scale-125" />

                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]">
                      <FileText size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Trade Details
                      </h2>

                      <p className="text-xs text-gray-500">
                        Execution and trade information.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-x-8 md:grid-cols-2">
                    <DetailRow
                      icon={
                        String(
                          trade.direction
                        ).toUpperCase() ===
                        "BUY"
                          ? TrendingUp
                          : TrendingDown
                      }
                      label="Direction"
                      value={trade.direction}
                      valueClass={
                        String(
                          trade.direction
                        ).toUpperCase() ===
                        "BUY"
                          ? "text-[#72fc65]"
                          : "text-red-400"
                      }
                    />

                    <DetailRow
                      icon={Target}
                      label="Entry"
                      value={trade.entry}
                    />

                    <DetailRow
                      icon={ShieldAlert}
                      label="Stop Loss"
                      value={trade.sl}
                      valueClass="text-red-400"
                    />

                    <DetailRow
                      icon={TrendingUp}
                      label="Take Profit"
                      value={trade.tp}
                      valueClass="text-[#72fc65]"
                    />

                    <DetailRow
                      icon={CircleDollarSign}
                      label="Risk / Reward"
                      value={
                        trade.rr
                          ? `1:${trade.rr}`
                          : "—"
                      }
                      valueClass="text-[#72fc65]"
                    />

                    <DetailRow
                      icon={Clock3}
                      label="Session"
                      value={trade.session}
                    />

                    <DetailRow
                      icon={Activity}
                      label="Execution Rate"
                      value={`${executionRate}%`}
                      valueClass="text-[#72fc65]"
                    />

                    <DetailRow
                      icon={CircleDollarSign}
                      label="Total"
                      value={
                        normalizedResult ===
                        "PENDING"
                          ? "—"
                          : `$${Math.abs(
                              Number(
                                trade.total ||
                                  0
                              )
                            ).toFixed(2)}`
                      }
                    />

                    <DetailRow
                      icon={CalendarDays}
                      label="Date"
                      value={
                        trade.createdAt
                          ? new Date(
                              trade.createdAt
                            ).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "—"
                      }
                    />
                  </div>
                </div>
              </section>

              {/* EXECUTION RATE */}

              <section className="group relative overflow-hidden rounded-2xl border border-[#72fc6525] bg-[#06000e]/65 p-5 backdrop-blur-xl transition-all duration-500 hover:border-[#72fc6555]">
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#72fc650d] blur-3xl transition-transform duration-700 group-hover:scale-125" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]">
                        <Target size={21} />
                      </div>

                      <div>
                        <h2 className="font-bold text-white">
                          Execution Rate
                        </h2>

                        <p className="text-[10px] text-gray-500">
                          How closely the trade followed your plan.
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#72fc65]">
                        {executionRate}%
                      </p>

                      <p className="text-[9px] uppercase tracking-widest text-gray-500">
                        Execution
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-[#72fc65] transition-all duration-700"
                        style={{
                          width: `${executionRate}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {[20, 40, 60, 80, 100].map(
                      (value) => (
                        <div
                          key={value}
                          className={`rounded-lg border py-2 text-center text-[9px] font-bold transition-all ${
                            executionRate >= value
                              ? "border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]"
                              : "border-white/5 bg-white/[0.02] text-gray-600"
                          }`}
                        >
                          {value}%
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>

              {/* ==================================
                  TRADE IMAGE
              ================================== */}

              <section className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#06000e]/65 p-5 backdrop-blur-xl transition-all duration-500 hover:border-[#72fc6545]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]">
                    <ImageIcon size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Trade Image
                    </h2>

                    <p className="text-xs text-gray-500">
                      Chart captured during the trade.
                    </p>
                  </div>
                </div>

                {/* ==================================
                    IMAGE EXISTS
                ================================== */}

                {hasTradeImage ? (
                  <div className="overflow-hidden rounded-2xl border border-[#72fc6530] bg-black/40">
                    <img
                      src={trade.image}
                      alt={`${trade.symbol} trade chart`}
                      className="max-h-[600px] w-full object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                    />
                  </div>
                ) : (
                  /* ==================================
                     IMAGE NOT POSTED -> PICKER
                  ================================== */

                  <div className="space-y-4">
                    {!imagePreview ? (
                      <label
                        className={`group/image flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/20 px-6 py-12 transition-all duration-300 hover:border-[#72fc6570] hover:bg-[#72fc6508] ${
                          uploadingImage
                            ? "pointer-events-none opacity-60"
                            : ""
                        }`}
                      >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] transition-all duration-300 group-hover/image:scale-110 group-hover/image:rotate-3">
                          <ImagePlus size={28} />
                        </div>

                        <p className="text-sm font-semibold text-white">
                          Select trade screenshot
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, JPEG or WEBP
                        </p>

                        <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-400 transition group-hover/image:border-[#72fc6540] group-hover/image:text-[#72fc65]">
                          <Upload size={14} />
                          Choose Image
                        </div>

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleImageSelect}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative overflow-hidden rounded-2xl border border-[#72fc6530] bg-black/40">
                        <img
                          src={imagePreview}
                          alt="Selected trade screenshot"
                          className="max-h-[500px] w-full object-contain"
                        />

                        {/* UPLOAD STATUS */}

                        {uploadingImage && (
                          <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-black/80 p-4 backdrop-blur-xl">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Loader2
                                  size={15}
                                  className="animate-spin text-[#72fc65]"
                                />

                                <span className="text-xs font-semibold text-white">
                                  Uploading to ImageKit...
                                </span>
                              </div>

                              <span className="text-xs font-bold text-[#72fc65]">
                                {imageProgress}%
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full bg-[#72fc65] transition-all duration-200"
                                style={{
                                  width: `${imageProgress}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!uploadingImage &&
                      !hasTradeImage && (
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-xs text-yellow-400">
                          <Clock3 size={14} />
                          Screenshot has not been posted yet
                        </div>
                      )}

                    {uploadingImage && (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-[#72fc6525] bg-[#72fc6508] px-4 py-3 text-xs text-[#72fc65]">
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                        Saving screenshot to this trade...
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* TRADE NOTES */}

              {trade.notes && (
                <section className="group rounded-2xl border border-white/10 bg-[#06000e]/65 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#72fc6540]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#72fc6510] text-[#72fc65] transition-transform duration-300 group-hover:rotate-3">
                      <FileText size={18} />
                    </div>

                    <div>
                      <h3 className="font-bold text-white">
                        Trade Notes
                      </h3>

                      <p className="text-[10px] text-gray-500">
                        Your trade reasoning
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-gray-400">
                    {trade.notes}
                  </p>
                </section>
              )}
            </div>

            {/* ==================================
                RIGHT SIDE
            ================================== */}

            <aside className="flex flex-col gap-5">

              {/* PERFORMANCE */}

              <section className="group relative overflow-hidden rounded-2xl border border-[#72fc6525] bg-[#06000e]/70 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#72fc6560]">
                <div
                  className={`absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150 ${
                    isWin
                      ? "bg-[#72fc6515]"
                      : isLose
                        ? "bg-red-500/10"
                        : "bg-yellow-400/10"
                  }`}
                />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${resultStyles.bg} ${resultStyles.text}`}
                    >
                      <Activity size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-white">
                        Performance
                      </h2>

                      <p className="text-[10px] text-gray-500">
                        Trade outcome
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Result
                    </p>

                    <div
                      className={`mt-2 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 ${resultStyles.border} ${resultStyles.bg} ${resultStyles.text}`}
                    >
                      <ResultIcon size={18} />

                      <span className="text-lg font-bold">
                        {normalizedResult}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Total P/L
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      {isWin ? (
                        <TrendingUp
                          size={22}
                          className="text-[#72fc65]"
                        />
                      ) : isLose ? (
                        <TrendingDown
                          size={22}
                          className="text-red-400"
                        />
                      ) : (
                        <Clock3
                          size={22}
                          className="text-yellow-400"
                        />
                      )}

                      <span
                        className={`text-3xl font-bold ${
                          isWin
                            ? "text-[#72fc65]"
                            : isLose
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {displayTotal}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-[#72fc6525] bg-[#72fc6508] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Trophy
                        size={16}
                        className="text-[#72fc65]"
                      />

                      <span className="text-xs text-gray-400">
                        Risk / Reward
                      </span>
                    </div>

                    <span className="text-sm font-bold text-[#72fc65]">
                      {trade.rr
                        ? `1:${trade.rr}`
                        : "—"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-[#72fc6525] bg-[#72fc6508] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Target
                        size={16}
                        className="text-[#72fc65]"
                      />

                      <span className="text-xs text-gray-400">
                        Execution Rate
                      </span>
                    </div>

                    <span className="text-sm font-bold text-[#72fc65]">
                      {executionRate}%
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon
                        size={16}
                        className={
                          hasTradeImage
                            ? "text-[#72fc65]"
                            : "text-yellow-400"
                        }
                      />

                      <span className="text-xs text-gray-400">
                        Screenshot
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        hasTradeImage
                          ? "text-[#72fc65]"
                          : "text-yellow-400"
                      }`}
                    >
                      {hasTradeImage
                        ? "UPLOADED"
                        : "PENDING"}
                    </span>
                  </div>
                </div>
              </section>

              {/* EDIT PERFORMANCE */}

              <section className="rounded-2xl border border-white/10 bg-[#06000e]/70 p-5 backdrop-blur-xl transition-all duration-500 hover:border-[#72fc6540]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65]">
                    <PencilLine size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Edit Performance
                    </h2>

                    <p className="text-[10px] text-gray-500">
                      Update the trade outcome.
                    </p>
                  </div>
                </div>

                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Result
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    "WIN",
                    "LOSE",
                    "PENDING",
                  ].map((item) => {
                    const active =
                      result === item;

                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() =>
                          setResult(item)
                        }
                        className={`rounded-xl border px-2 py-3 text-xs font-bold transition-all duration-300 ${
                          active
                            ? item === "WIN"
                              ? "border-[#72fc6580] bg-[#72fc6515] text-[#72fc65]"
                              : item === "LOSE"
                                ? "border-red-400/60 bg-red-500/10 text-red-400"
                                : "border-yellow-400/60 bg-yellow-400/10 text-yellow-400"
                            : "border-white/10 bg-white/[0.03] text-gray-500 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Total Profit / Loss
                  </label>

                  <div className="relative">
                    <CircleDollarSign
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72fc65]"
                    />

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={total}
                      onChange={(e) =>
                        setTotal(
                          e.target.value
                        )
                      }
                      placeholder="100"
                      disabled={
                        result === "PENDING"
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-gray-600 focus:border-[#72fc65] focus:bg-[#72fc6508] focus:ring-2 focus:ring-[#72fc6510] disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </div>
                </div>

                <button
                  onClick={updateTrade}
                  disabled={
                    updating || deleting
                  }
                  className="group relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#72fc6570] bg-[#72fc6515] px-5 py-3.5 text-sm font-bold text-[#72fc65] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#72fc65] hover:bg-[#72fc6525] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {updating ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save
                        size={17}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                      Update Trade
                    </>
                  )}
                </button>
              </section>

              {/* DELETE */}

              <section className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-5 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                    <Trash2 size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Delete Trade
                    </h3>

                    <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                      This action permanently
                      removes this trade from your
                      journal and reverses its effect
                      on your account.
                    </p>
                  </div>
                </div>

                <button
                  onClick={deleteTrade}
                  disabled={
                    deleting || updating
                  }
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2
                        size={17}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                      Delete Trade
                    </>
                  )}
                </button>
              </section>
            </aside>
          </div>
        </div>

        {/* BOTTOM STATUS */}

        <div className="mt-3 flex shrink-0 items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#72fc65]" />

            <span className="text-[10px] text-gray-500">
              Viewing trade #
              {String(id).slice(-6)}
            </span>
          </div>

          <Link
            href="/trades"
            className="group flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#72fc65]/70 transition-colors duration-300 hover:text-[#72fc65]"
          >
            All Trades

            <ChevronRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </main>
  );
}

