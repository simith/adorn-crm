import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CHAT_RESPONSE = {
    campaign: {
        name: "Diwali Jewellery Campaign",
        title: "Elegance That Dazzles",
        image_link: "/images/jewellery/100.jpg",
    },
    customer: {
        name: "Rajesh Sharma",
        phone: "+91 98765 32109",
        last_seen: "just now",
        avatar: "/images/avatars/3.png",
    },
    chat: [
        {
            sender: "customer",
            message: "Hi, what is the price of this jewellery set?",
            time: "3 minutes ago",
        },
        {
            sender: "business",
            message: "Hello Rajesh, thank you for your interest in our jewellery set.",
            time: "9 minutes ago",
        },
        {
            sender: "business",
            message: "The price of this exclusive jewellery set is ₹85,000.",
            time: "just now",
        },
        {
            sender: "business",
            message:
                "We have a special offer right now: you can get it at 15% off which brings the price down to ₹72,250.",
            time: "just now",
        },
        {
            sender: "customer",
            message: "Great, that's a good offer. Is the set available for immediate delivery?",
            time: "3 minutes ago",
        },
    ],
    campaign_stats: {
        responses: 4,
        views: 5720,
        sent: 9452,
        status: "Best Ag30",
    },
};

export async function GET() {
    const response = NextResponse.json(CHAT_RESPONSE);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}
