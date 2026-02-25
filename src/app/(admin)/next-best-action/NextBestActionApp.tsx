"use client";

import { useEffect, useMemo, useState } from "react";

type SessionStatus = "active" | "idle" | "offline";

type UserEvent = {
    id: string;
    event_type: string;
    jewellery_id?: string;
    jewelry_name?: string;
    jewelry_category?: string;
    price?: number;
    image_url?: string;
    attire_id?: string;
    attire_name?: string;
    generation_time_ms?: number;
    channel?: string;
    destination?: string;
    jeweler_id?: string;
    jeweler_name?: string;
    share_status?: string;
    message_sid?: string;
    duration_seconds?: number;
    items_tried?: number;
    items_shared?: number;
    sale_made?: boolean;
    sale_amount?: number;
    purchased_items?: string[];
    notes?: string;
    next_best_action_summary?: string;
    timestamp: string;
    session_id: string;
};

type UserSession = {
    id: string;
    status: SessionStatus;
    started_at: string;
    last_activity_at: string;
    events: UserEvent[];
};

type SessionUser = {
    id: string;
    name: string;
    email_id: string;
    mob_number: string;
    avatar: string;
    sessions: UserSession[];
};

type SessionRecommendation = {
    title: string;
    summary: string;
    objective: string;
    offer: string;
    urgency: string;
    outreach: string;
    confidence: number;
    cta: string;
};

type ApiEvent = {
    event_id: string;
    event_type: string;
    timestamp: string;
    jewellery_id?: string;
    jewelry_id?: string;
    jewelry_name?: string;
    jewelry_category?: string;
    price?: number;
    image_url?: string;
    attire_id?: string;
    attire_name?: string;
    generation_time_ms?: number;
    channel?: string;
    destination?: string;
    jeweler_id?: string;
    jeweler_name?: string;
    share_status?: string;
    message_sid?: string;
    duration_seconds?: number;
    items_tried?: number;
    items_shared?: number;
    sale_made?: boolean;
    sale_amount?: number;
    purchased_items?: string[];
    notes?: string;
    next_best_action_summary?: string;
};

type ApiSession = {
    session_id: string;
    user_name: string;
    email_id: string;
    mob_number: string;
    started_at: string;
    last_event_at: string;
    events: ApiEvent[];
};

type ApiSessionsResponse = {
    ok: boolean;
    sessions?: ApiSession[];
};

const jewelleryPlaceholders = [
    "/images/jewellery/100.jpg",
    "/images/jewellery/101.jpg",
    "/images/jewellery/102.jpg",
    "/images/jewellery/best-seller.jpg",
];

const avatarPool = [
    "/images/avatars/1.png",
    "/images/avatars/2.png",
    "/images/avatars/3.png",
    "/images/avatars/4.png",
    "/images/avatars/5.png",
    "/images/avatars/6.png",
    "/images/avatars/7.png",
    "/images/avatars/8.png",
    "/images/avatars/9.png",
    "/images/avatars/10.png",
];

const emptySession: UserSession = {
    id: "no-session",
    status: "offline",
    started_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
    events: [],
};

function toEpoch(timestamp: string) {
    return new Date(timestamp).getTime();
}

function hashString(value: string) {
    return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function avatarForUser(userKey: string) {
    return avatarPool[hashString(userKey) % avatarPool.length];
}

function statusFromLastActivity(timestamp: string): SessionStatus {
    const deltaMinutes = Math.max(0, Math.floor((Date.now() - toEpoch(timestamp)) / 60000));

    if (deltaMinutes <= 15) return "active";
    if (deltaMinutes <= 60) return "idle";
    return "offline";
}

function mapApiSessionsToUsers(sessions: ApiSession[]): SessionUser[] {
    const byUser = new Map<string, SessionUser>();

    sessions.forEach((session) => {
        const key = session.email_id?.trim().toLowerCase() || session.mob_number || session.user_name;

        const mappedSession: UserSession = {
            id: session.session_id,
            status: statusFromLastActivity(session.last_event_at),
            started_at: session.started_at,
            last_activity_at: session.last_event_at,
            events: [...(session.events || [])]
                .map((event, index) => ({
                    id: event.event_id || `${session.session_id}_${index}`,
                    event_type: event.event_type,
                    jewellery_id: event.jewellery_id || event.jewelry_id,
                    jewelry_name: event.jewelry_name,
                    jewelry_category: event.jewelry_category,
                    price: event.price,
                    image_url: event.image_url,
                    attire_id: event.attire_id,
                    attire_name: event.attire_name,
                    generation_time_ms: event.generation_time_ms,
                    channel: event.channel,
                    destination: event.destination,
                    jeweler_id: event.jeweler_id,
                    jeweler_name: event.jeweler_name,
                    share_status: event.share_status,
                    message_sid: event.message_sid,
                    duration_seconds: event.duration_seconds,
                    items_tried: event.items_tried,
                    items_shared: event.items_shared,
                    sale_made: event.sale_made,
                    sale_amount: event.sale_amount,
                    purchased_items: event.purchased_items,
                    notes: event.notes,
                    next_best_action_summary: event.next_best_action_summary,
                    timestamp: event.timestamp,
                    session_id: session.session_id,
                }))
                .sort((a, b) => toEpoch(a.timestamp) - toEpoch(b.timestamp)),
        };

        if (!byUser.has(key)) {
            byUser.set(key, {
                id: key,
                name: session.user_name || "Unknown User",
                email_id: session.email_id || "N/A",
                mob_number: session.mob_number || "N/A",
                avatar: avatarForUser(key),
                sessions: [mappedSession],
            });
            return;
        }

        byUser.get(key)!.sessions.push(mappedSession);
    });

    return [...byUser.values()]
        .map((user) => ({
            ...user,
            sessions: [...user.sessions].sort((a, b) => toEpoch(b.last_activity_at) - toEpoch(a.last_activity_at)),
        }))
        .sort((a, b) => {
            const aLatest = a.sessions[0]?.last_activity_at || "";
            const bLatest = b.sessions[0]?.last_activity_at || "";
            return toEpoch(bLatest) - toEpoch(aLatest);
        });
}

function formatRelativeTime(timestamp: string) {
    const deltaMs = Date.now() - toEpoch(timestamp);
    const minutes = Math.max(1, Math.floor(deltaMs / 60000));

    if (minutes < 60) {
        return `${minutes} mins ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hrs ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
}

function formatAbsoluteTime(timestamp: string) {
    return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function dayOrdinal(day: number) {
    if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
    if (day % 10 === 1) return `${day}st`;
    if (day % 10 === 2) return `${day}nd`;
    if (day % 10 === 3) return `${day}rd`;
    return `${day}th`;
}

function sessionLabelFromTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = dayOrdinal(date.getDate());
    const time = date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    return `Session on ${month} ${day}, ${time}`;
}

function statusBadge(status: SessionStatus) {
    if (status === "active") return "badge-success";
    if (status === "idle") return "badge-warning";
    return "badge-neutral";
}

function statusDot(status: SessionStatus) {
    if (status === "active") return "bg-success";
    if (status === "idle") return "bg-warning";
    return "bg-base-content/30";
}

function jewelleryImageForEvent(event: UserEvent) {
    const source = event.jewellery_id || event.id;
    return jewelleryPlaceholders[hashString(source) % jewelleryPlaceholders.length];
}

function firstName(fullName: string) {
    return fullName.split(" ")[0] || fullName;
}

function toProfessionalProductCode(rawId?: string) {
    const value = (rawId || "").trim();
    if (!value) return "";

    const match = /^([a-zA-Z]+)[_-]?(\d+)$/.exec(value);
    if (!match) {
        return value.toUpperCase().replaceAll("_", "-");
    }

    const [, prefixRaw, numberRaw] = match;
    const prefix = prefixRaw.toLowerCase();
    const number = numberRaw.padStart(3, "0");
    const mappedPrefix =
        prefix === "necklace"
            ? "NCK"
            : prefix === "earring" || prefix === "earing"
              ? "EAR"
              : prefix === "ring"
                ? "RNG"
                : prefix === "bracelet"
                  ? "BRC"
                  : prefix === "pendant"
                    ? "PND"
                    : prefix === "mangalsutra"
                      ? "MGL"
                      : prefix.slice(0, 3).toUpperCase();
    return `${mappedPrefix}-${number}`;
}

function replaceProductIdsInText(text?: string) {
    const value = (text || "").trim();
    if (!value) return "";

    return value.replace(/\b([a-zA-Z]+)[_-](\d{1,4})\b/g, (_full, prefix, number) =>
        toProfessionalProductCode(`${String(prefix)}_${String(number)}`),
    );
}

function userStatus(user: SessionUser): SessionStatus {
    if (user.sessions.some((session) => session.status === "active")) {
        return "active";
    }

    if (user.sessions.some((session) => session.status === "idle")) {
        return "idle";
    }

    return "offline";
}

function userLastActivity(user: SessionUser) {
    return user.sessions[0]?.last_activity_at;
}

function eventSummary(event: UserEvent) {
    const item = event.jewelry_name || toProfessionalProductCode(event.jewellery_id) || "a jewellery item";

    if (event.event_type === "start_session") {
        return "Customer started a new browsing session.";
    }
    if (event.event_type === "jewellery_selected" || event.event_type === "jewelry_selected") {
        return `Customer selected ${item} for try-on.`;
    }
    if (event.event_type === "image_generated" || event.event_type === "image.generated") {
        const attire = event.attire_name || event.attire_id || "selected attire";
        return `Try-on image generated for ${item} with ${attire}.`;
    }
    if (event.event_type === "image_shared" || event.event_type === "image.shared") {
        const channel = event.channel || "share channel";
        const target = event.destination || "customer destination";
        return `Try-on image for ${item} shared via ${channel} to ${target}.`;
    }
    if (event.event_type === "session_ended" || event.event_type === "session.ended") {
        if (event.sale_made) {
            const amount = typeof event.sale_amount === "number" ? ` Rs ${event.sale_amount.toLocaleString()}` : "";
            return `Session ended with a sale.${amount}`;
        }
        return "Session ended without a sale.";
    }
    if (event.event_type === "view") {
        return `Customer viewed ${item}.`;
    }
    if (event.event_type === "wishlist") {
        return `Customer shortlisted ${item} to wishlist.`;
    }
    if (event.event_type === "add_to_cart") {
        return `Customer added ${item} to cart, indicating strong purchase intent.`;
    }
    if (event.event_type === "purchase") {
        return `Customer completed purchase for ${item}.`;
    }
    if (event.event_type === "share") {
        return "Customer shared the product for external consideration.";
    }

    return `Customer triggered ${event.event_type.replaceAll("_", " ")}.`;
}

function eventTypeLabel(eventType: string) {
    if (eventType === "jewellery_selected" || eventType === "jewelry_selected") {
        return "Jewellery Selected";
    }
    if (eventType === "image_generated" || eventType === "image.generated") {
        return "Image Generated";
    }
    if (eventType === "image_shared" || eventType === "image.shared") {
        return "Image Shared";
    }
    if (eventType === "session_ended" || eventType === "session.ended") {
        return "Session Ended";
    }

    return eventType.replaceAll("_", " ");
}

function buildSessionRecommendation(
    user: SessionUser,
    session: UserSession,
    events: UserEvent[],
): SessionRecommendation {
    const sessionLabel = sessionLabelFromTimestamp(session.started_at);
    const hasPurchase = events.some(
        (event) =>
            event.event_type === "purchase" ||
            ((event.event_type === "session_ended" || event.event_type === "session.ended") && event.sale_made),
    );
    const hasCart = events.some((event) => event.event_type === "add_to_cart");
    const hasWishlist = events.some((event) => event.event_type === "wishlist");
    const hasShare = events.some(
        (event) =>
            event.event_type === "share" || event.event_type === "image_shared" || event.event_type === "image.shared",
    );
    const viewCount = events.filter((event) => event.event_type === "view").length;
    const preferredJewellery =
        [...events].reverse().find((event) => event.jewelry_name || event.jewellery_id)?.jewelry_name ||
        toProfessionalProductCode([...events].reverse().find((event) => event.jewellery_id)?.jewellery_id) ||
        "highlighted item";
    const contactName = firstName(user.name);

    if (hasPurchase) {
        return {
            title: "Post-Purchase Upsell Opportunity",
            summary: `${user.name} has completed a purchase in ${sessionLabel}. This is the highest-value window to drive add-on conversion.`,
            objective: "Increase average order value with a coordinated follow-up offer.",
            offer: `Position a matching piece for ${preferredJewellery} plus a premium care plan as a curated bundle.`,
            urgency: "Reach out within 24 hours while buying confidence is still high.",
            outreach: `Hi ${contactName}, excellent choice on ${preferredJewellery}. I shortlisted two matching pieces that complete the look and qualify for a priority styling slot this week.`,
            confidence: 92,
            cta: "Send cross-sell bundle recommendation",
        };
    }

    if (hasCart) {
        return {
            title: "Cart Conversion Play",
            summary: `${user.name} added ${preferredJewellery} to cart in ${sessionLabel} but has not checked out yet, indicating strong intent with light hesitation.`,
            objective: "Remove decision friction and close checkout in-session.",
            offer: `Offer assisted checkout with a limited-time incentive on ${preferredJewellery}.`,
            urgency: "Target contact in the next 30 minutes before intent decays.",
            outreach: `Hi ${contactName}, I can reserve ${preferredJewellery} for you and share a quick checkout link with priority delivery confirmation. Would you like me to proceed?`,
            confidence: 88,
            cta: "Trigger assisted checkout follow-up",
        };
    }

    if (hasWishlist || hasShare || viewCount > 1) {
        return {
            title: "High-Intent Nurture Campaign",
            summary: `${user.name} has repeated engagement signals in ${sessionLabel}, indicating consideration-stage buying intent.`,
            objective: "Convert browsing momentum into a guided buying decision.",
            offer: `Share a personalized shortlist centered on ${preferredJewellery}, including style and price alternatives.`,
            urgency: "Schedule outreach today to keep the decision window warm.",
            outreach: `Hi ${contactName}, based on your recent activity, I prepared a curated shortlist around ${preferredJewellery} with similar options across budgets. Happy to walk you through the best pick.`,
            confidence: 79,
            cta: "Send personalized shortlist",
        };
    }

    return {
        title: "Discovery Follow-Up",
        summary: `${user.name} has early exploration signals in ${sessionLabel} and needs guided recommendations to progress.`,
        objective: "Move from discovery to shortlist creation.",
        offer: "Provide a quick assisted consultation with top-selling starter options.",
        urgency: "Follow up before end of day to maintain session recall.",
        outreach: `Hi ${contactName}, I noticed you explored a few collections. I can share 3 best-selling options tailored to your style and budget in one quick message.`,
        confidence: 64,
        cta: "Initiate guided consultation",
    };
}

export const NextBestActionApp = () => {
    const [users, setUsers] = useState<SessionUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [search, setSearch] = useState("");
    const [showActiveList, setShowActiveList] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadSessions() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch("/api_events", { cache: "no-store" });
                if (!response.ok) {
                    throw new Error(`Failed to fetch sessions: ${response.status}`);
                }

                const payload = (await response.json()) as ApiSessionsResponse;
                const mappedUsers = mapApiSessionsToUsers(payload.sessions || []);

                if (!active) return;

                setUsers(mappedUsers);
                const firstUser = mappedUsers[0];
                setSelectedUserId((current) =>
                    mappedUsers.some((user) => user.id === current) ? current : firstUser?.id || "",
                );
                setSelectedSessionId((current) => {
                    const sessionStillExists = mappedUsers.some((user) =>
                        user.sessions.some((session) => session.id === current),
                    );
                    return sessionStillExists ? current : firstUser?.sessions[0]?.id || "";
                });
            } catch (fetchError) {
                if (!active) return;
                setError(fetchError instanceof Error ? fetchError.message : "Failed to load sessions");
                setUsers([]);
                setSelectedUserId("");
                setSelectedSessionId("");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadSessions();

        return () => {
            active = false;
        };
    }, []);

    const activeSessions = useMemo(
        () =>
            users.flatMap((user) =>
                user.sessions
                    .filter((session) => session.status === "active")
                    .map((session) => ({
                        sessionId: session.id,
                        userName: user.name,
                        lastSeen: session.last_activity_at,
                    })),
            ),
        [users],
    );

    const filteredUsers = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return users;
        }

        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(searchValue) ||
                user.id.toLowerCase().includes(searchValue) ||
                user.email_id.toLowerCase().includes(searchValue) ||
                user.mob_number.toLowerCase().includes(searchValue),
        );
    }, [search, users]);

    const selectedUser =
        filteredUsers.find((user) => user.id === selectedUserId) ??
        users.find((user) => user.id === selectedUserId) ??
        filteredUsers[0] ??
        users[0] ??
        null;

    const sessionsForSelectedUser = useMemo(() => {
        if (!selectedUser) return [];

        return [...selectedUser.sessions].sort((a, b) => toEpoch(b.last_activity_at) - toEpoch(a.last_activity_at));
    }, [selectedUser]);

    const selectedSession =
        sessionsForSelectedUser.find((session) => session.id === selectedSessionId) ??
        sessionsForSelectedUser[0] ??
        emptySession;

    const orderedEvents = useMemo(
        () => [...selectedSession.events].sort((a, b) => toEpoch(a.timestamp) - toEpoch(b.timestamp)),
        [selectedSession],
    );

    const recommendation = useMemo(() => {
        if (!selectedUser) {
            return {
                title: "No Active Session",
                summary: "No user session is available to generate a recommendation.",
                objective: "Wait for new customer session activity.",
                offer: "N/A",
                urgency: "No immediate action.",
                outreach: "No outreach required.",
                confidence: 0,
                cta: "No action",
            } satisfies SessionRecommendation;
        }

        return buildSessionRecommendation(selectedUser, selectedSession, orderedEvents);
    }, [orderedEvents, selectedSession, selectedUser]);

    const sessionEndedSummary = useMemo(() => {
        return [...orderedEvents]
            .reverse()
            .find(
                (event) =>
                    (event.event_type === "session_ended" || event.event_type === "session.ended") &&
                    event.next_best_action_summary,
            )?.next_best_action_summary;
    }, [orderedEvents]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="bg-base-200/60 h-[calc(100vh-200px)] animate-pulse rounded-lg lg:col-span-4" />
                <div className="bg-base-200/60 h-[calc(100vh-200px)] animate-pulse rounded-lg lg:col-span-8" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="border-error/30 bg-error/10 text-error-content rounded-lg border p-4 text-sm">
                Failed to load session data from `/api_events`: {error}
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="border-base-300 bg-base-100 rounded-lg border border-dashed p-8 text-center">
                <p className="text-lg font-semibold">No session data found</p>
                <p className="text-base-content/60 mt-1 text-sm">
                    Start a session via `/api_events` with `event_type: "start_session"` to populate this page.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5 xl:col-span-4 2xl:col-span-3">
                <div className="card bg-base-100 h-full overflow-hidden border border-gray-200 shadow-sm">
                    <div className="border-base-200 bg-base-100 border-b px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-base font-semibold">Users</h2>
                            <button
                                className="btn btn-outline btn-xs gap-1.5"
                                onClick={() => setShowActiveList((value) => !value)}>
                                <span className="iconify lucide--list size-3.5" />
                                Active Sessions
                                <span className="badge badge-success badge-xs">{activeSessions.length}</span>
                            </button>
                        </div>
                        <label className="input input-sm mt-3 flex items-center gap-2">
                            <span className="iconify lucide--search text-base-content/50 size-4" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                type="search"
                                className="grow"
                                placeholder="Search by user / email / mobile"
                                aria-label="Search users"
                            />
                        </label>
                        {showActiveList && (
                            <div className="border-base-200 bg-base-50 mt-3 rounded-lg border p-3">
                                <p className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
                                    Active Right Now
                                </p>
                                <ul className="mt-2 space-y-2">
                                    {activeSessions.map((session) => (
                                        <li
                                            key={session.sessionId}
                                            className="flex items-center justify-between gap-2 text-sm">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{session.userName}</p>
                                                <p className="text-base-content/60 truncate text-xs">
                                                    {sessionLabelFromTimestamp(session.lastSeen)}
                                                </p>
                                            </div>
                                            <span className="text-base-content/60 text-xs">
                                                {formatRelativeTime(session.lastSeen)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="h-[calc(100vh_-_510px)] min-h-[12rem] overflow-y-auto p-2">
                        {filteredUsers.map((user) => {
                            const lastActivity = userLastActivity(user);
                            const status = userStatus(user);

                            return (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        setSelectedUserId(user.id);
                                        setSelectedSessionId(user.sessions[0]?.id || "");
                                    }}
                                    className={`mb-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                                        selectedUser?.id === user.id ? "bg-base-200" : "hover:bg-base-200/70"
                                    }`}>
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="bg-base-200 size-10 rounded-full object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-medium">{user.name}</p>
                                            <span className="text-base-content/60 text-xs">
                                                {user.sessions.length} sessions
                                            </span>
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-2">
                                            <span className={`inline-block size-2 rounded-full ${statusDot(status)}`} />
                                            <span className="text-base-content/60 truncate text-xs">
                                                {lastActivity ? formatRelativeTime(lastActivity) : "No activity"}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                        {filteredUsers.length === 0 && (
                            <p className="text-base-content/60 px-2 py-4 text-sm">No users found.</p>
                        )}
                    </div>
                    <div className="border-base-200 bg-base-100 border-y px-4 py-2">
                        <p className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
                            Sessions for {selectedUser?.name || "Selected User"}
                        </p>
                    </div>
                    <div className="h-[calc(100vh_-_510px)] min-h-[12rem] overflow-y-auto p-2">
                        {sessionsForSelectedUser.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => setSelectedSessionId(session.id)}
                                className={`mb-1 w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                                    selectedSession.id === session.id
                                        ? "border-primary/40 bg-primary/10"
                                        : "border-base-200 hover:bg-base-200/70"
                                }`}>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium">
                                        {sessionLabelFromTimestamp(session.started_at)}
                                    </p>
                                    <span className={`badge ${statusBadge(session.status)} badge-soft badge-sm`}>
                                        {session.status}
                                    </span>
                                </div>
                                <div className="text-base-content/60 mt-1 flex items-center justify-between gap-2 text-xs">
                                    <span>{session.events.length} events</span>
                                    <span>{formatRelativeTime(session.last_activity_at)}</span>
                                </div>
                            </button>
                        ))}
                        {sessionsForSelectedUser.length === 0 && (
                            <p className="text-base-content/60 px-2 py-4 text-sm">No sessions for this user.</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-7 xl:col-span-8 2xl:col-span-9">
                <div className="card bg-base-100 overflow-hidden border border-gray-200 shadow-sm">
                    <div className="border-base-200 flex items-center justify-between gap-3 border-b px-4 py-3">
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold">{selectedUser?.name || "Unknown User"}</h3>
                            <p className="text-base-content/60 text-sm">
                                {sessionLabelFromTimestamp(selectedSession.started_at)}
                            </p>
                        </div>
                        <span className={`badge ${statusBadge(selectedSession.status)} badge-soft`}>
                            {selectedSession.status}
                        </span>
                    </div>
                    <div className="border-base-200 from-base-200/70 to-base-100 border-b bg-gradient-to-r px-4 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold tracking-wide">Next Best Action Recommendation</p>
                            <span className="badge badge-primary badge-soft">
                                Confidence {recommendation.confidence}%
                            </span>
                        </div>
                        {sessionEndedSummary && (
                            <div className="border-primary/35 ring-primary/15 mt-3 rounded-lg border bg-white p-3 ring-1">
                                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                                    Adorn AI Recommendation
                                </p>
                                <p className="text-base-content text-base leading-relaxed font-normal">
                                    {replaceProductIdsInText(sessionEndedSummary)}
                                </p>
                            </div>
                        )}
                        <h4 className="mt-2 text-lg font-semibold">{recommendation.title}</h4>
                        <p className="text-base-content/70 mt-1 text-sm">{recommendation.summary}</p>
                        <div className="border-base-300 bg-base-100 mt-3 rounded-lg border p-3">
                            <p className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
                                Suggested Outreach Message
                            </p>
                            <p className="mt-1 text-sm leading-relaxed">{recommendation.outreach}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-base-content/70 text-xs">{recommendation.urgency}</p>
                            <button className="btn btn-primary btn-sm">{recommendation.cta}</button>
                        </div>
                    </div>
                    <div className="bg-base-100 px-4 py-4">
                        <ol className="border-base-200 relative border-s ps-5">
                            {orderedEvents.map((event) => (
                                <li key={event.id} className="ms-1 mb-5">
                                    <span className="border-base-100 bg-primary absolute -start-1.5 mt-2 size-3 rounded-full border-2" />
                                    <div className="border-base-200 bg-base-100 rounded-lg border p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-medium capitalize">{eventTypeLabel(event.event_type)}</p>
                                            <span className="text-base-content/60 text-xs">
                                                {formatRelativeTime(event.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-base-content/70 mt-1 text-sm">{eventSummary(event)}</p>
                                        {(event.event_type === "view" ||
                                            event.event_type === "jewellery_selected" ||
                                            event.event_type === "jewelry_selected" ||
                                            event.event_type === "image_generated" ||
                                            event.event_type === "image.generated" ||
                                            event.event_type === "image_shared" ||
                                            event.event_type === "image.shared") && (
                                            <div className="border-base-200 bg-base-50 mt-3 flex items-center gap-3 rounded-lg border p-2">
                                                <img
                                                    src={event.image_url || jewelleryImageForEvent(event)}
                                                    alt={event.jewelry_name || event.jewellery_id || "Jewellery item"}
                                                    className="size-14 rounded-md object-cover"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-base-content/60 flex items-center gap-1 text-xs font-semibold tracking-wide uppercase">
                                                        {event.event_type === "view"
                                                            ? "Viewed Jewellery"
                                                            : event.event_type === "jewellery_selected" ||
                                                                event.event_type === "jewelry_selected"
                                                              ? "Jewellery Selected"
                                                              : event.event_type === "image_generated" ||
                                                                  event.event_type === "image.generated"
                                                                ? "Image Generated"
                                                                : "Image Shared"}
                                                        {(event.event_type === "image_shared" ||
                                                            event.event_type === "image.shared") &&
                                                            event.channel === "whatsapp" && (
                                                                <span className="iconify ri--whatsapp-fill size-4 text-[#25d366]" />
                                                            )}
                                                    </p>
                                                    <p className="truncate text-sm font-medium">
                                                        {event.jewelry_name ||
                                                            event.jewellery_id ||
                                                            "Item code unavailable"}
                                                    </p>
                                                    {(event.event_type === "image_shared" ||
                                                        event.event_type === "image.shared") &&
                                                        event.destination && (
                                                            <p className="text-base-content/60 truncate text-xs">
                                                                To: {event.destination}
                                                            </p>
                                                        )}
                                                    {event.attire_name && (
                                                        <p className="text-base-content/60 truncate text-xs">
                                                            Attire: {event.attire_name}
                                                        </p>
                                                    )}
                                                    {typeof event.price === "number" &&
                                                        Number.isFinite(event.price) && (
                                                            <p className="text-base-content/60 text-xs">
                                                                Rs {event.price.toLocaleString()}
                                                            </p>
                                                        )}
                                                    {typeof event.generation_time_ms === "number" &&
                                                        Number.isFinite(event.generation_time_ms) && (
                                                            <p className="text-base-content/60 text-xs">
                                                                Generated in {event.generation_time_ms} ms
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        )}
                                        {(event.event_type === "session_ended" ||
                                            event.event_type === "session.ended") &&
                                            event.notes && (
                                                <div className="border-base-200 bg-base-50 mt-3 rounded-lg border p-2">
                                                    <p className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
                                                        Session Notes
                                                    </p>
                                                    <p className="mt-1 text-sm">{event.notes}</p>
                                                </div>
                                            )}
                                        <div className="text-base-content/70 mt-2 flex flex-wrap gap-2 text-xs">
                                            <span className="badge badge-outline badge-sm">
                                                {sessionLabelFromTimestamp(selectedSession.started_at)}
                                            </span>
                                            <span className="badge badge-outline badge-sm">
                                                Jewellery:{" "}
                                                {event.jewellery_id
                                                    ? toProfessionalProductCode(event.jewellery_id)
                                                    : "N/A"}
                                            </span>
                                            {event.jewelry_category && (
                                                <span className="badge badge-outline badge-sm">
                                                    Category: {event.jewelry_category}
                                                </span>
                                            )}
                                            {event.attire_id && (
                                                <span className="badge badge-outline badge-sm">
                                                    Attire: {event.attire_id}
                                                </span>
                                            )}
                                            {(event.event_type === "image_shared" ||
                                                event.event_type === "image.shared") && (
                                                <span className="badge badge-outline badge-sm">
                                                    Channel: {event.channel || "N/A"}
                                                </span>
                                            )}
                                            {event.share_status && (
                                                <span className="badge badge-outline badge-sm">
                                                    Share Status: {event.share_status}
                                                </span>
                                            )}
                                            {typeof event.duration_seconds === "number" &&
                                                Number.isFinite(event.duration_seconds) && (
                                                    <span className="badge badge-outline badge-sm">
                                                        Duration: {event.duration_seconds}s
                                                    </span>
                                                )}
                                            {typeof event.items_tried === "number" &&
                                                Number.isFinite(event.items_tried) && (
                                                    <span className="badge badge-outline badge-sm">
                                                        Items Tried: {event.items_tried}
                                                    </span>
                                                )}
                                            {typeof event.items_shared === "number" &&
                                                Number.isFinite(event.items_shared) && (
                                                    <span className="badge badge-outline badge-sm">
                                                        Items Shared: {event.items_shared}
                                                    </span>
                                                )}
                                            {typeof event.sale_made === "boolean" && (
                                                <span className="badge badge-outline badge-sm">
                                                    Sale Made: {event.sale_made ? "Yes" : "No"}
                                                </span>
                                            )}
                                            {typeof event.sale_amount === "number" &&
                                                Number.isFinite(event.sale_amount) && (
                                                    <span className="badge badge-outline badge-sm">
                                                        Sale Amount: Rs {event.sale_amount.toLocaleString()}
                                                    </span>
                                                )}
                                            {event.purchased_items && event.purchased_items.length > 0 && (
                                                <span className="badge badge-outline badge-sm">
                                                    Purchased:{" "}
                                                    {event.purchased_items
                                                        .map((item) => toProfessionalProductCode(item))
                                                        .join(", ")}
                                                </span>
                                            )}
                                            <span className="badge badge-outline badge-sm">
                                                {formatAbsoluteTime(event.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {orderedEvents.length === 0 && (
                                <li className="ms-1">
                                    <div className="border-base-300 bg-base-100 text-base-content/60 rounded-lg border border-dashed p-4 text-sm">
                                        No events found for this session.
                                    </div>
                                </li>
                            )}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};
