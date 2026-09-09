"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  BookOpenCheck,
  CandlestickChart,
  ChevronDown,
  CircleDollarSign,
  ClipboardPenLine,
  Clock3,
  FileImage,
  FileText,
  ImagePlus,
  Loader2,
  Save,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";

import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/javascript";

export default function JournalPage() {
  const [formData, setFormData] = useState({
    symbol: "",
    direction: "",
    entry: "",
    sl: "",
    tp: "",
    rr: "",
    session: "",
    image: "",
    notes: "",
    total: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  /*
   * EXECUTION CHECKLIST
   *
   * Each item is worth 20%.
   */
  const executionItems = [
    "HTF POI Mitigated",
    "LTF shift structure",
    "LTF POI mitigated",
    "Engulfing after mitigation",
    "HTF & LTF Alligned",
  ];

  const [checkedItems, setCheckedItems] = useState([]);

  /*
   * Execution rate is automatically calculated.
   *
   * 1 checked  = 20%
   * 2 checked  = 40%
   * 3 checked  = 60%
   * 4 checked  = 80%
   * 5 checked  = 100%
   */
  const executionRate = checkedItems.length * 20;

  /*
   * Toggle execution checklist item.
   */
  const toggleExecutionItem = (index) => {
    setCheckedItems((prev) => {
      if (prev.includes(index)) {
        return prev.filter((item) => item !== index);
      }

      return [...prev, index];
    });
  };

  /*
   * Clean up preview URL when component is destroyed.
   */
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /*
   * Handle normal inputs.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * Select image.
   */
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    /*
     * Only allow images.
     */
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    /*
     * 25MB maximum.
     */
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Image must be smaller than 25MB.");
      return;
    }

    /*
     * Remove previous preview.
     */
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);

    /*
     * Image URL is only populated after ImageKit upload.
     */
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));

    setImageProgress(0);
  };

  /*
   * Remove selected image.
   */
  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");
    setImageProgress(0);

    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  /*
   * Upload image to ImageKit.
   */
  const uploadImageToImageKit = async () => {
    if (!selectedImage) {
      throw new Error("Please select a trade image.");
    }

    try {
      setUploadingImage(true);
      setImageProgress(0);

      /*
       * Get secure ImageKit authentication parameters.
       */
      const authResponse = await fetch("/api/upload-auth", {
        method: "GET",
        cache: "no-store",
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => null);

        throw new Error(
          errorData?.error ||
            `ImageKit authentication failed (${authResponse.status})`
        );
      }

      const auth = await authResponse.json();

      /*
       * Upload selected image.
       */
      const response = await upload({
        file: selectedImage,
        fileName: selectedImage.name,

        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
        publicKey: auth.publicKey,

        useUniqueFileName: true,

        /*
         * Store trade images inside /trades.
         */
        folder: "/trades",

        /*
         * Upload progress.
         */
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

      /*
       * Save returned ImageKit URL.
       */
      setFormData((prev) => ({
        ...prev,
        image: response.url,
      }));

      setImageProgress(100);

      return response.url;
    } catch (error) {
      console.error("ImageKit upload error:", error);

      if (error instanceof ImageKitAbortError) {
        throw new Error("Image upload was cancelled.");
      }

      if (error instanceof ImageKitInvalidRequestError) {
        throw new Error(
          `Invalid ImageKit request: ${error.message}`
        );
      }

      if (error instanceof ImageKitUploadNetworkError) {
        throw new Error(
          `Image upload network error: ${error.message}`
        );
      }

      if (error instanceof ImageKitServerError) {
        throw new Error(
          `ImageKit server error: ${error.message}`
        );
      }

      throw new Error(
        error?.message || "Failed to upload image."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  /*
   * Reset the entire form.
   */
  const resetForm = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData({
      symbol: "",
      direction: "",
      entry: "",
      sl: "",
      tp: "",
      rr: "",
      session: "",
      image: "",
      notes: "",
      total: "",
    });

    setSelectedImage(null);
    setImagePreview("");
    setImageProgress(0);

    /*
     * Reset execution checklist.
     */
    setCheckedItems([]);
  };

  /*
   * Save trade.
   */
  const handleSaveTrade = async (e) => {
    e.preventDefault();

    /*
     * Validate required model fields.
     */

    if (!formData.symbol) {
      toast.error("Please enter a symbol.");
      return;
    }

    if (!formData.direction) {
      toast.error("Please select a direction.");
      return;
    }

    if (!formData.entry) {
      toast.error("Please enter an entry price.");
      return;
    }

    if (!formData.sl) {
      toast.error("Please enter a stop loss.");
      return;
    }

    if (!formData.tp) {
      toast.error("Please enter a take profit.");
      return;
    }

    if (!formData.rr) {
      toast.error("Please enter the risk/reward.");
      return;
    }

    if (!formData.session) {
      toast.error("Please select a session.");
      return;
    }

    /*
     * At least one execution condition must be checked.
     */
    if (checkedItems.length === 0) {
      toast.error("Please complete the execution checklist.");
      return;
    }

    if (!formData.total) {
      toast.error("Please enter the total.");
      return;
    }

    if (!selectedImage && !formData.image) {
      toast.error("Please upload a trade image.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image;

      /*
       * Upload image first if it has not already
       * been uploaded.
       */
      if (selectedImage && !imageUrl) {
        imageUrl = await uploadImageToImageKit();
      }

      if (!imageUrl) {
        throw new Error("Trade image upload failed.");
      }

      /*
       * Build final payload.
       *
       * trimEnd() only.
       *
       * Direction -> uppercase
       * Session   -> uppercase
       * Symbol    -> uppercase
       *
       * Execution rate is calculated automatically.
       *
       * Result is automatically PENDING.
       */
      const tradeData = {
        symbol: formData.symbol
          .trimEnd()
          .toUpperCase(),

        direction: formData.direction
          .trimEnd()
          .toUpperCase(),

        entry: Number(formData.entry),

        sl: Number(formData.sl),

        tp: Number(formData.tp),

        rr: Number(formData.rr),

        session: formData.session
          .trimEnd()
          .toUpperCase(),

        executionRate: executionRate,

        image: imageUrl,

        notes: formData.notes.trimEnd(),

        total: Number(formData.total),

        /*
         * Always create new journal entries
         * with PENDING result.
         */
        result: "PENDING",
      };

      console.log("TRADE DATA:", tradeData);

      /*
       * Save trade to MongoDB.
       */
      const response = await fetch("/api/trade", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(tradeData),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to save trade."
        );
      }

      toast.success(
        "Trade journaled successfully 🟢",
        {
          style: {
            background: "#101510",
            color: "#fff",
            border:
              "1px solid rgba(114,252,101,0.35)",
          },
        }
      );

      resetForm();
    } catch (error) {
      console.error("Trade save error:", error);

      toast.error(
        error.message || "Failed to save trade ❌",
        {
          style: {
            background: "#160909",
            color: "#fff",
            border:
              "1px solid rgba(248,113,113,0.35)",
          },
        }
      );
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
        <source
          src="/video.mp4"
          type="video/mp4"
        />
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
                        Record your execution and trade data.
                      </p>
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 rounded-lg border border-[#72fc6525] bg-[#72fc6508] px-3 py-2 md:flex">
                    <CircleDollarSign
                      size={14}
                      className="text-[#72fc65]"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#72fc65]">
                      Trade Record
                    </span>
                  </div>
                </div>

                {/* FORM GRID */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                  {/* SYMBOL */}
                  <div>
                    <label className={labelClass}>
                      <CandlestickChart
                        size={14}
                        className="text-[#72fc65]"
                      />
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
                      <TrendingUp
                        size={14}
                        className="text-[#72fc65]"
                      />
                      Direction *
                    </label>

                    <div className="relative">
                      <select
                        name="direction"
                        value={formData.direction}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none`}
                      >
                        <option value="">
                          Select direction
                        </option>

                        <option value="BUY">
                          BUY
                        </option>

                        <option value="SELL">
                          SELL
                        </option>
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
                      <Clock3
                        size={14}
                        className="text-[#72fc65]"
                      />
                      Session *
                    </label>

                    <div className="relative">
                      <select
                        name="session"
                        value={formData.session}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none`}
                      >
                        <option value="">
                          Select session
                        </option>

                        <option value="ASIA">
                          Asia
                        </option>

                        <option value="LONDON">
                          London
                        </option>

                        <option value="NEW YORK">
                          New York
                        </option>

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
                      <Target
                        size={14}
                        className="text-[#72fc65]"
                      />
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
                      <ShieldAlert
                        size={14}
                        className="text-red-400"
                      />
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
                      <TrendingUp
                        size={14}
                        className="text-[#72fc65]"
                      />
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

                  {/* TOTAL */}
                  <div>
                    <label className={labelClass}>
                      <CircleDollarSign
                        size={14}
                        className="text-[#72fc65]"
                      />
                      Total *
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      name="total"
                      value={formData.total}
                      onChange={handleChange}
                      placeholder="30"
                      className={inputClass}
                    />
                  </div>

                  {/* EXECUTION RATE DISPLAY */}
                  <div>
                    <label className={labelClass}>
                      <TrendingUp
                        size={14}
                        className="text-[#72fc65]"
                      />
                      Execution Rate
                    </label>

                    <div className="flex min-h-[50px] w-full items-center justify-between rounded-xl border border-[#72fc6530] bg-[#72fc6508] px-4 py-3 backdrop-blur-md">
                      <span className="text-xs text-gray-500">
                        Checklist
                      </span>

                      <span className="text-lg font-bold text-[#72fc65]">
                        {executionRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* IMAGE PICKER */}
                <div className="mt-5">
                  <label className={labelClass}>
                    <FileImage
                      size={14}
                      className="text-[#72fc65]"
                    />
                    Trade Image *
                  </label>

                  {!imagePreview ? (
                    <label className="group/image flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/20 px-6 py-10 transition-all duration-300 hover:border-[#72fc6570] hover:bg-[#72fc6508]">

                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] transition-all duration-300 group-hover/image:scale-110 group-hover/image:rotate-3">
                        <ImagePlus size={25} />
                      </div>

                      <p className="text-sm font-semibold text-white">
                        Select trade screenshot
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, JPEG or WEBP
                      </p>

                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-400 transition group-hover/image:border-[#72fc6540] group-hover/image:text-[#72fc65]">
                        <Upload size={14} />
                        Choose Image
                      </div>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-[#72fc6530] bg-black/40">

                      {/* IMAGE */}
                      <img
                        src={imagePreview}
                        alt="Selected trade"
                        className="max-h-[420px] w-full object-contain"
                      />

                      {/* IMAGE ACTIONS */}
                      <div className="absolute left-3 right-3 top-3 flex items-center justify-between">

                        <div className="max-w-[80%] truncate rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-md">
                          {selectedImage?.name}
                        </div>

                        <button
                          type="button"
                          onClick={removeImage}
                          disabled={
                            uploadingImage ||
                            loading
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/30 bg-black/70 text-red-400 backdrop-blur-md transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <X size={17} />
                        </button>
                      </div>

                      {/* UPLOAD STATUS */}
                      {uploadingImage && (
                        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-black/80 p-3 backdrop-blur-xl">

                          <div className="mb-2 flex items-center justify-between">

                            <div className="flex items-center gap-2">
                              <Loader2
                                size={14}
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

                      {/* UPLOADED STATUS */}
                      {!uploadingImage &&
                        formData.image && (
                          <div className="absolute bottom-3 left-3 rounded-xl border border-[#72fc6540] bg-[#101510dd] px-3 py-2 backdrop-blur-xl">

                            <div className="flex items-center gap-2">

                              <div className="h-2 w-2 rounded-full bg-[#72fc65] shadow-lg shadow-[#72fc65]" />

                              <span className="text-xs font-semibold text-[#72fc65]">
                                Image uploaded
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* NOTES */}
                <div className="mt-5">
                  <label className={labelClass}>
                    <FileText
                      size={14}
                      className="text-[#72fc65]"
                    />
                    Trade Notes
                  </label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Describe why you entered the trade, confirmation, market structure and anything you learned..."
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={
                      loading ||
                      uploadingImage
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-400 transition-all duration-300 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear Form
                  </button>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      uploadingImage
                    }
                    className="group/btn relative overflow-hidden rounded-xl border border-[#72fc6570] bg-[#72fc6515] px-6 py-3 text-sm font-bold text-[#72fc65] shadow-lg shadow-[#72fc6510] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#72fc65] hover:bg-[#72fc6525] hover:shadow-[#72fc6525] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />

                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
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

            {/* EXECUTION CHECKLIST SIDE PANEL */}
            <aside className="flex flex-col gap-5">

              {/* EXECUTION CHECKLIST */}
              <div className="group relative overflow-hidden rounded-2xl border border-[#72fc6530] bg-[#06000e]/65 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#72fc6580] hover:shadow-2xl hover:shadow-[#72fc6510]">

                {/* Glow */}
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#72fc6515] blur-3xl transition-transform duration-700 group-hover:scale-150" />

                <div className="relative">

                  {/* HEADER */}
                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#72fc6540] bg-[#72fc6510] text-[#72fc65] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                      <ClipboardPenLine size={21} />
                    </div>

                    <div>
                      <h3 className="font-bold text-white">
                        Execution Checklist
                      </h3>

                      <p className="text-[10px] text-gray-500">
                        Confirm your trading process
                      </p>
                    </div>
                  </div>

                  {/* EXECUTION RATE */}
                  <div className="mt-5 rounded-xl border border-[#72fc6530] bg-[#72fc6508] p-4">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                          Execution Rate
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {checkedItems.length} of 5 completed
                        </p>
                      </div>

                      <div className="text-2xl font-bold text-[#72fc65]">
                        {executionRate}%
                      </div>
                    </div>

                    {/* PROGRESS LINE */}
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">

                      <div
                        className="h-full bg-[#72fc65] shadow-lg shadow-[#72fc65] transition-all duration-500"
                        style={{
                          width: `${executionRate}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* TICKERS */}
                  <div className="mt-5 space-y-3">

                    {executionItems.map(
                      (item, index) => {
                        const checked =
                          checkedItems.includes(index);

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() =>
                              toggleExecutionItem(index)
                            }
                            className={`group/item relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-all duration-300 ${
                              checked
                                ? "border-[#72fc6560] bg-[#72fc6510]"
                                : "border-white/5 bg-white/[0.03] hover:translate-x-1 hover:border-[#72fc6540]"
                            }`}
                          >

                            {/* CHECK BOX */}
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                                checked
                                  ? "border-[#72fc65] bg-[#72fc6520] text-[#72fc65] shadow-lg shadow-[#72fc6515]"
                                  : "border-white/10 bg-black/20 text-gray-600 group-hover/item:border-[#72fc6540] group-hover/item:text-[#72fc65]"
                              }`}
                            >
                              {checked ? (
                                <Check
                                  size={16}
                                  strokeWidth={3}
                                />
                              ) : (
                                <span className="text-[10px] font-bold">
                                  {index + 1}
                                </span>
                              )}
                            </div>

                            {/* TEXT */}
                            <div className="min-w-0 flex-1">

                              <p
                                className={`text-xs font-semibold transition-colors duration-300 ${
                                  checked
                                    ? "text-[#72fc65]"
                                    : "text-white"
                                }`}
                              >
                                {item}
                              </p>

                              <p className="mt-0.5 text-[10px] text-gray-600">
                                {checked
                                  ? "Confirmed"
                                  : "Click to confirm"}
                              </p>
                            </div>

                            {/* 20% */}
                            <span
                              className={`shrink-0 text-[10px] font-bold transition-colors duration-300 ${
                                checked
                                  ? "text-[#72fc65]"
                                  : "text-gray-600"
                              }`}
                            >
                              20%
                            </span>

                            {/* ACTIVE LINE */}
                            {checked && (
                              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#72fc65] shadow-lg shadow-[#72fc65]" />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* COMPLETION MESSAGE */}
                  <div
                    className={`mt-4 rounded-xl border p-3 text-center transition-all duration-500 ${
                      executionRate === 100
                        ? "border-[#72fc6560] bg-[#72fc6510]"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-semibold transition-colors duration-500 ${
                        executionRate === 100
                          ? "text-[#72fc65]"
                          : "text-gray-500"
                      }`}
                    >
                      {executionRate === 100
                        ? "Perfect execution — all rules confirmed."
                        : "Follow the rules. Execute the plan."}
                    </p>
                  </div>
                </div>
              </div>

              {/* EXECUTION SUMMARY */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">

                <div className="mb-4 flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#72fc6510] text-[#72fc65]">
                    <TrendingUp size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Execution Data
                    </h3>

                    <p className="text-[10px] text-gray-500">
                      Calculated automatically
                    </p>
                  </div>
                </div>

                <div className="space-y-2">

                  {/* EXECUTION */}
                  <div className="flex items-center justify-between rounded-lg border border-[#72fc6520] bg-[#72fc6508] px-3 py-2">

                    <span className="text-[10px] uppercase tracking-wider text-gray-400">
                      Execution Rate
                    </span>

                    <span className="text-sm font-bold text-[#72fc65]">
                      {executionRate}%
                    </span>
                  </div>

                  {/* CHECKED */}
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">

                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Conditions
                    </span>

                    <span className="text-xs font-bold text-white">
                      {checkedItems.length} / 5
                    </span>
                  </div>

                  {/* TOTAL */}
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">

                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Total
                    </span>

                    <span className="text-xs font-bold text-white">
                      {formData.total || "—"}
                    </span>
                  </div>

                  {/* SYMBOL */}
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">

                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Symbol
                    </span>

                    <span className="text-xs font-bold text-white">
                      {formData.symbol || "—"}
                    </span>
                  </div>

                  {/* DIRECTION */}
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

                  {/* SESSION */}
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">

                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Session
                    </span>

                    <span className="max-w-[170px] truncate text-xs font-bold text-white">
                      {formData.session || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* IMAGE STATUS */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">

                <div className="mb-4 flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#72fc6510] text-[#72fc65]">
                    <FileImage size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Trade Image
                    </h3>

                    <p className="text-[10px] text-gray-500">
                      ImageKit upload
                    </p>
                  </div>
                </div>

                {!selectedImage ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-center">

                    <FileImage
                      size={24}
                      className="mx-auto text-gray-600"
                    />

                    <p className="mt-3 text-xs text-gray-500">
                      No image selected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">

                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={imagePreview}
                        alt="Trade preview"
                        className="max-h-52 w-full object-contain bg-black"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">

                      <span className="text-[10px] uppercase tracking-wider text-gray-500">
                        Status
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          formData.image
                            ? "text-[#72fc65]"
                            : uploadingImage
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }`}
                      >
                        {formData.image
                          ? "UPLOADED"
                          : uploadingImage
                          ? "UPLOADING"
                          : "READY"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}