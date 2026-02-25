"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const models = [
    { id: 1, name: "Model 1", image: "/images/campaign/model_1.png" },
    { id: 2, name: "Model 2", image: "/images/campaign/model_2.png" },
    { id: 3, name: "Model 3", image: "/images/landing/showcase-card-image.png" },
    { id: 4, name: "Model 4", image: "/images/landing/hero-widget-1.png" },
    { id: 5, name: "Model 5", image: "/images/landing/hero-widget-2.png" },
    { id: 6, name: "Model 6", image: "/images/landing/showcase-card-image.png" },
];

const jewellery = [
    { id: 1, name: "Necklace Set", image: "/images/campaign/jewellery_1.png" },
    { id: 2, name: "Necklace Set", image: "/images/campaign/jewellery_2.png" },
    { id: 3, name: "Maang Tikka", image: "/images/landing/showcase-card-image.png" },
    { id: 4, name: "Bracelet", image: "/images/landing/hero-widget-1.png" },
    { id: 5, name: "Ring", image: "/images/landing/hero-widget-2.png" },
    { id: 6, name: "Anklet", image: "/images/landing/showcase-card-image.png" },
];

const infusedImageByCombination: Record<string, string> = {
    "1_1": "/images/campaign/model_1_jewellery_1.png",
    "2_1": "/images/campaign/model_2_jewellery_1.png",
    "2_2": "/images/campaign/model_2_jewellery_2.png",
};

const ITEMS_PER_PAGE = 3;

const CampaignBuilderPage = () => {
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState<number | null>(null);
    const [selectedJewellery, setSelectedJewellery] = useState<number | null>(null);
    const [modelPage, setModelPage] = useState(0);
    const [jewelleryPage, setJewelleryPage] = useState(0);
    const [message, setMessage] = useState(
        "Elegance that Dazzles. Shine Bright with Our Exclusive Jewellery Collection.",
    );
    const [channels, setChannels] = useState({
        whatsapp: true,
        sms: true,
        email: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
    const [previewImageFailed, setPreviewImageFailed] = useState(false);

    const hasSelection = selectedModel != null && selectedJewellery != null;
    const isModel2Jewellery1Preview = selectedModel === 2 && selectedJewellery === 1;

    const previewImageSrc = useMemo(() => {
        if (!hasSelection) {
            return "";
        }
        const key = `${selectedModel}_${selectedJewellery}`;
        return infusedImageByCombination[key] || `/api/images/row_1_${selectedModel}_row_2_${selectedJewellery}`;
    }, [hasSelection, selectedJewellery, selectedModel]);

    const generatedPreviewSrc = useMemo(() => {
        if (!hasSelection) {
            return "";
        }
        return `/api/images/row_1_${selectedModel}_row_2_${selectedJewellery}`;
    }, [hasSelection, selectedJewellery, selectedModel]);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        setPreviewImageFailed(false);
    }, [previewImageSrc]);

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
                    <h1 className="text-base-content text-3xl font-bold">Campaign Generator</h1>

                    {/* 1. Choose a Model */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base-content text-xl font-bold">1. Choose a Model</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setModelPage((p) => Math.max(0, p - 1))}
                                    disabled={modelPage === 0}
                                    className="btn btn-circle btn-sm btn-ghost">
                                    <span className="iconify lucide--chevron-left size-5" />
                                </button>
                                <span className="text-base-content/60 flex items-center text-sm">
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
                                            ? "border-primary bg-white"
                                            : "border-base-300 hover:border-base-400 bg-white"
                                    }`}>
                                    <div className="aspect-square overflow-hidden bg-white">
                                        {model.id <= 2 ? (
                                            <img
                                                src={model.image}
                                                alt={model.name}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        ) : (
                                            <div className="p-4">
                                                <div className="flex h-full flex-col justify-between">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {model.name}
                                                    </span>
                                                    <div className="rounded-lg bg-slate-100 p-2">
                                                        <div className="h-2 w-full rounded bg-slate-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white p-2 text-center">
                                        <span
                                            className={`font-semibold ${selectedModel === model.id ? "text-primary" : "text-base-content"}`}>
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
                            <h2 className="text-base-content text-xl font-bold">2. Select Jewellery</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setJewelleryPage((p) => Math.max(0, p - 1))}
                                    disabled={jewelleryPage === 0}
                                    className="btn btn-circle btn-sm btn-ghost">
                                    <span className="iconify lucide--chevron-left size-5" />
                                </button>
                                <span className="text-base-content/60 flex items-center text-sm">
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
                                            ? "border-primary bg-white"
                                            : "border-base-300 hover:border-base-400 bg-white"
                                    }`}>
                                    <div className="aspect-square overflow-hidden bg-white">
                                        {item.id <= 2 ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className={`object-contain object-center ${
                                                    item.id === 1 ? "h-[92%] w-[125%]" : "h-full w-full"
                                                }`}
                                            />
                                        ) : (
                                            <div className="p-4">
                                                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white p-2 text-center">
                                        <span
                                            className={`font-semibold ${selectedJewellery === item.id ? "text-primary" : "text-base-content"}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Enter Campaign Message */}
                    <div>
                        <h2 className="text-base-content mb-4 text-xl font-bold">3. Enter Campaign Message</h2>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="textarea textarea-bordered w-full text-lg"
                        />
                    </div>

                    {/* 4. Campaign Audience */}
                    <div>
                        <h2 className="text-base-content mb-4 text-xl font-bold">4. Campaign Audience</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body p-4">
                                    <p className="text-base-content/60 text-sm font-medium">New Users</p>
                                    <p className="text-base-content text-3xl font-bold">812</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body p-4">
                                    <p className="text-base-content/60 text-sm font-medium">Returning Users</p>
                                    <p className="text-base-content text-3xl font-bold">3,715</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body p-4">
                                    <p className="text-base-content/60 text-sm font-medium">Total Selected</p>
                                    <p className="text-base-content text-3xl font-bold">4,527</p>
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
                                disabled={
                                    isLoading || !hasSelection || !Object.values(channels).some(Boolean) || toast.show
                                }
                                className="btn btn-primary mt-6 w-full py-3 text-lg">
                                {isLoading ? (
                                    <span className="iconify lucide--loader-2 size-5 animate-spin" />
                                ) : (
                                    "Launch Campaign"
                                )}
                            </button>

                            {/* Success Message */}
                            {toast.show && (
                                <div className="text-success mt-4 flex items-center gap-2">
                                    <span className="iconify lucide--check-circle size-5" />
                                    <span className="font-medium">Campaign sent to total (4,527) customers.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Generated Preview */}
                <div>
                    <h2 className="text-base-content mb-4 text-2xl font-bold">Generated Preview</h2>
                    <div className="sticky top-6">
                        <div className="card border border-slate-200 bg-slate-100 shadow-lg transition-all duration-500">
                            <div className="card-body p-6">
                                <h3 className="mb-4 text-xl font-bold text-slate-800">Generated Campaign Preview</h3>

                                {/* Preview Content */}
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    {hasSelection ? (
                                        <>
                                            <div className="mb-4 overflow-hidden rounded-xl bg-slate-50">
                                                <img
                                                    src={previewImageFailed ? generatedPreviewSrc : previewImageSrc}
                                                    alt={`Preview for model ${selectedModel} and jewellery ${selectedJewellery}`}
                                                    className={`h-[540px] w-full ${
                                                        isModel2Jewellery1Preview
                                                            ? "object-contain object-center"
                                                            : "object-cover object-center"
                                                    }`}
                                                    onError={() => setPreviewImageFailed(true)}
                                                />
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-lg text-slate-700 italic">{message.split(".")[0]}</p>
                                                <p className="mt-1 text-slate-600">
                                                    {message.split(".").slice(1).join(".")}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-[540px] rounded-xl border border-dashed border-slate-300 bg-slate-50" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignBuilderPage;
