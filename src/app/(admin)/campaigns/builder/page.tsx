"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

const models = [
    { id: 1, name: "Model 1", image: "/images/landing/hero-widget-1.png" },
    { id: 2, name: "Model 2", image: "/images/landing/hero-widget-2.png" },
    { id: 3, name: "Model 3", image: "/images/landing/showcase-card-image.png" },
    { id: 4, name: "Model 4", image: "/images/landing/hero-widget-1.png" },
    { id: 5, name: "Model 5", image: "/images/landing/hero-widget-2.png" },
    { id: 6, name: "Model 6", image: "/images/landing/showcase-card-image.png" },
];

const jewellery = [
    { id: 1, name: "Necklace Set", image: "/images/landing/hero-widget-1.png" },
    { id: 2, name: "Earrings", image: "/images/landing/hero-widget-2.png" },
    { id: 3, name: "Maang Tikka", image: "/images/landing/showcase-card-image.png" },
    { id: 4, name: "Bracelet", image: "/images/landing/hero-widget-1.png" },
    { id: 5, name: "Ring", image: "/images/landing/hero-widget-2.png" },
    { id: 6, name: "Anklet", image: "/images/landing/showcase-card-image.png" },
];

// Color combinations for different model + jewellery combinations
const colorCombinations: Record<string, string> = {
    "1_1": "from-green-500 to-green-700",
    "1_2": "from-teal-500 to-teal-700",
    "1_3": "from-emerald-500 to-emerald-700",
    "1_4": "from-lime-500 to-lime-700",
    "1_5": "from-green-600 to-teal-700",
    "1_6": "from-emerald-600 to-green-700",
    "2_1": "from-blue-500 to-blue-700",
    "2_2": "from-cyan-500 to-cyan-700",
    "2_3": "from-sky-500 to-sky-700",
    "2_4": "from-indigo-500 to-indigo-700",
    "2_5": "from-fuchsia-600 to-purple-800", // Model 2 + Jewellery 5 (Ring)
    "2_6": "from-violet-500 to-violet-700",
    "3_1": "from-orange-500 to-orange-700",
    "3_2": "from-amber-500 to-amber-700",
    "3_3": "from-yellow-500 to-yellow-700",
    "3_4": "from-red-500 to-red-700",
    "3_5": "from-rose-500 to-rose-700",
    "3_6": "from-pink-500 to-pink-700",
    "4_1": "from-slate-500 to-slate-700",
    "4_2": "from-gray-500 to-gray-700",
    "4_3": "from-zinc-500 to-zinc-700",
    "4_4": "from-neutral-500 to-neutral-700",
    "4_5": "from-stone-500 to-stone-700",
    "4_6": "from-slate-600 to-gray-700",
    "5_1": "from-red-500 to-orange-600",
    "5_2": "from-orange-500 to-red-600",
    "5_3": "from-rose-500 to-pink-600",
    "5_4": "from-pink-500 to-rose-600",
    "5_5": "from-red-600 to-rose-700",
    "5_6": "from-orange-600 to-red-700",
    "6_1": "from-indigo-500 to-purple-600",
    "6_2": "from-purple-500 to-indigo-600",
    "6_3": "from-violet-500 to-purple-600",
    "6_4": "from-purple-600 to-fuchsia-700",
    "6_5": "from-fuchsia-500 to-pink-600",
    "6_6": "from-violet-600 to-indigo-700",
};

const ITEMS_PER_PAGE = 3;

const CampaignBuilderPage = () => {
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState(1);
    const [selectedJewellery, setSelectedJewellery] = useState(1);
    const [modelPage, setModelPage] = useState(0);
    const [jewelleryPage, setJewelleryPage] = useState(0);
    const [message, setMessage] = useState("Elegance that Dazzles. Shine Bright with Our Exclusive Jewellery Collection.");
    const [channels, setChannels] = useState({
        whatsapp: true,
        sms: true,
        email: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

    // Get color based on selected combination
    const previewGradient = useMemo(() => {
        const key = `${selectedModel}_${selectedJewellery}`;
        return colorCombinations[key] || "from-green-500 to-green-700";
    }, [selectedModel, selectedJewellery]);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const toggleChannel = (channel: keyof typeof channels) => {
        setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
    };

    const handleLaunch = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setToast({ show: true, message: "Campaign sent to total (4,527) customers." });
            // Navigate after showing toast
            setTimeout(() => {
                router.push("/campaigns/view");
            }, 2000);
        }, 1500);
    };

    const totalModelPages = Math.ceil(models.length / ITEMS_PER_PAGE);
    const totalJewelleryPages = Math.ceil(jewellery.length / ITEMS_PER_PAGE);

    const visibleModels = models.slice(modelPage * ITEMS_PER_PAGE, (modelPage + 1) * ITEMS_PER_PAGE);
    const visibleJewellery = jewellery.slice(jewelleryPage * ITEMS_PER_PAGE, (jewelleryPage + 1) * ITEMS_PER_PAGE);

    return (
        <div className="mt-6 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left Panel - Campaign Generator */}
                <div className="space-y-8">
                    <h1 className="text-3xl font-bold text-base-content">Campaign Generator</h1>

                    {/* 1. Choose a Model */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-base-content">1. Choose a Model</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setModelPage((p) => Math.max(0, p - 1))}
                                    disabled={modelPage === 0}
                                    className="btn btn-circle btn-sm btn-ghost">
                                    <span className="iconify lucide--chevron-left size-5" />
                                </button>
                                <span className="flex items-center text-sm text-base-content/60">
                                    {modelPage + 1} / {totalModelPages}
                                </span>
                                <button
                                    onClick={() => setModelPage((p) => Math.min(totalModelPages - 1, p + 1))}
                                    disabled={modelPage === totalModelPages - 1}
                                    className="btn btn-circle btn-sm btn-ghost">
                                    <span className="iconify lucide--chevron-right size-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {visibleModels.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => setSelectedModel(model.id)}
                                    className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                                        selectedModel === model.id
                                            ? "border-primary bg-primary/10"
                                            : "border-base-300 hover:border-base-400"
                                    }`}>
                                    <div className="aspect-square bg-linear-to-br from-blue-400 to-blue-600 p-4">
                                        <div className="flex h-full flex-col justify-between">
                                            <span className="text-sm font-medium text-white">{model.name}</span>
                                            <div className="rounded-lg bg-white/20 p-2">
                                                <div className="h-2 w-full rounded bg-white/30" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-base-100 p-2 text-center">
                                        <span className={`font-semibold ${selectedModel === model.id ? "text-primary" : "text-base-content"}`}>
                                            {selectedModel === model.id ? "Selected" : model.name}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Select Jewellery */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-base-content">2. Select Jewellery</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setJewelleryPage((p) => Math.max(0, p - 1))}
                                    disabled={jewelleryPage === 0}
                                    className="btn btn-circle btn-sm btn-ghost">
                                    <span className="iconify lucide--chevron-left size-5" />
                                </button>
                                <span className="flex items-center text-sm text-base-content/60">
                                    {jewelleryPage + 1} / {totalJewelleryPages}
                                </span>
                                <button
                                    onClick={() => setJewelleryPage((p) => Math.min(totalJewelleryPages - 1, p + 1))}
                                    disabled={jewelleryPage === totalJewelleryPages - 1}
                                    className="btn btn-circle btn-sm btn-ghost">
                                    <span className="iconify lucide--chevron-right size-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {visibleJewellery.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedJewellery(item.id)}
                                    className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                                        selectedJewellery === item.id
                                            ? "border-primary bg-primary/10"
                                            : "border-base-300 hover:border-base-400"
                                    }`}>
                                    <div className="aspect-square bg-linear-to-br from-green-400 to-green-600 p-4">
                                        <span className="text-sm font-medium text-white">{item.name}</span>
                                    </div>
                                    <div className="bg-base-100 p-2 text-center">
                                        <span className={`font-semibold ${selectedJewellery === item.id ? "text-primary" : "text-base-content"}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Enter Campaign Message */}
                    <div>
                        <h2 className="mb-4 text-xl font-bold text-base-content">3. Enter Campaign Message</h2>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="textarea textarea-bordered w-full text-lg"
                        />
                    </div>

                    {/* 4. Campaign Audience */}
                    <div>
                        <h2 className="mb-4 text-xl font-bold text-base-content">4. Campaign Audience</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body p-4">
                                    <p className="text-base-content/60 text-sm font-medium">New Users</p>
                                    <p className="text-3xl font-bold text-base-content">812</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body p-4">
                                    <p className="text-base-content/60 text-sm font-medium">Returning Users</p>
                                    <p className="text-3xl font-bold text-base-content">3,715</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body p-4">
                                    <p className="text-base-content/60 text-sm font-medium">Total Selected</p>
                                    <p className="text-3xl font-bold text-base-content">4,527</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Send On */}
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body p-4">
                            <h3 className="mb-4 text-lg font-semibold">Send On</h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => toggleChannel("whatsapp")}
                                    className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-all ${
                                        channels.whatsapp
                                            ? "border-green-500 bg-green-50 text-green-700"
                                            : "border-base-300 bg-base-100"
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={channels.whatsapp}
                                        onChange={() => {}}
                                        className="checkbox checkbox-sm checkbox-success"
                                    />
                                    <span className="iconify lucide--message-circle size-5" />
                                    <span>WhatsApp</span>
                                </button>
                                <button
                                    onClick={() => toggleChannel("sms")}
                                    className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-all ${
                                        channels.sms
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-base-300 bg-base-100"
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={channels.sms}
                                        onChange={() => {}}
                                        className="checkbox checkbox-sm checkbox-primary"
                                    />
                                    <span className="iconify lucide--message-square size-5" />
                                    <span>Text Message</span>
                                </button>
                                <button
                                    onClick={() => toggleChannel("email")}
                                    className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-all ${
                                        channels.email
                                            ? "border-red-500 bg-red-50 text-red-700"
                                            : "border-base-300 bg-base-100"
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={channels.email}
                                        onChange={() => {}}
                                        className="checkbox checkbox-sm checkbox-error"
                                    />
                                    <span className="iconify lucide--mail size-5" />
                                    <span>Email</span>
                                </button>
                            </div>

                            {/* Launch Campaign Button */}
                            <button
                                onClick={handleLaunch}
                                disabled={isLoading || !Object.values(channels).some(Boolean) || toast.show}
                                className="btn btn-primary mt-6 w-full py-3 text-lg">
                                {isLoading ? (
                                    <span className="iconify lucide--loader-2 size-5 animate-spin" />
                                ) : (
                                    "Launch Campaign"
                                )}
                            </button>

                            {/* Success Message */}
                            {toast.show && (
                                <div className="mt-4 flex items-center gap-2 text-success">
                                    <span className="iconify lucide--check-circle size-5" />
                                    <span className="font-medium">Campaign sent to total (4,527) customers.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Generated Preview */}
                <div>
                    <h2 className="mb-4 text-2xl font-bold text-base-content">Generated Preview</h2>
                    <div className="sticky top-6">
                        <div className={`card bg-linear-to-br ${previewGradient} shadow-lg transition-all duration-500`}>
                            <div className="card-body p-6">
                                <h3 className="mb-4 text-xl font-bold text-white">Generated Campaign Preview</h3>
                                
                                {/* Preview Content */}
                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                                    <div className="flex items-start gap-4">
                                        <div className="size-20 rounded-full bg-white/20" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">Model {selectedModel}</p>
                                            <p className="text-white/80">{jewellery.find((j) => j.id === selectedJewellery)?.name}</p>
                                            <p className="mt-1 text-xs text-white/60">
                                                Endpoint: /images/row_1_{selectedModel}_row_2_{selectedJewellery}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <p className="text-lg italic text-white/90">{message.split(".")[0]}</p>
                                        <p className="mt-1 text-white/80">{message.split(".").slice(1).join(".")}</p>
                                    </div>
                                    
                                    <p className="mt-4 text-sm text-white/60">Sample Watermark</p>
                                </div>

                                {/* Preview Footer */}
                                <div className="mt-4 rounded-lg bg-white/10 p-3 backdrop-blur">
                                    <p className="text-center text-sm text-white/90">{message}</p>
                                    <p className="mt-2 text-center text-xs text-white/60">Sample Watermark</p>
                                </div>

                                <p className="mt-4 text-sm text-white/80">
                                    GET /images/row_1_{selectedModel}_row_2_{selectedJewellery}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignBuilderPage;
