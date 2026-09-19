import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
    addMessage,
    getCurrentShop,
    getMessages,
    getShops,
} from "../data/catalog";

function MessagesPage() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentShop = getCurrentShop();
    const shops = getShops();
    const [searchParams] = useSearchParams();
    const [messages, setMessages] = useState(() => getMessages());
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [draft, setDraft] = useState("");

    const isShopAdmin = currentUser?.role === "shop-admin";
    const visibleMessages = messages.filter((message) =>
        isShopAdmin
            ? message.shopId === currentShop?.id
            : message.customerId === currentUser?.id
    );
    const conversations = useMemo(() => {
        const grouped = new Map();

        visibleMessages.forEach((message) => {
            if (!grouped.has(message.conversationId)) {
                grouped.set(message.conversationId, []);
            }
            grouped.get(message.conversationId).push(message);
        });

        return [...grouped.entries()]
            .map(([id, thread]) => ({
                id,
                messages: thread,
                shopName: thread[0].shopName,
                customerName: thread[0].customerName,
                latest: thread[thread.length - 1],
            }))
            .sort((first, second) =>
                second.latest.createdAt.localeCompare(first.latest.createdAt)
            );
    }, [visibleMessages]);

    const requestedShopId = searchParams.get("shopId");
    const requestedShopName = searchParams.get("shopName");
    const requestedShop = shops.find(
        (shop) => shop.id === requestedShopId || shop.name === requestedShopId
    );
    const requestedShopKey = requestedShop?.id || requestedShopId;
    const requestedConversationId = requestedShopKey
        ? `${requestedShopKey}:${currentUser?.id}`
        : null;
    const selectedConversation = conversations.find(
        (conversation) => conversation.id === selectedConversationId
    ) || conversations.find(
        (conversation) => conversation.id === requestedConversationId
    ) || (requestedShopKey ? null : conversations[0]);

    useEffect(() => {
        function syncMessages() {
            setMessages(getMessages());
        }

        window.addEventListener("messages:updated", syncMessages);
        return () => window.removeEventListener("messages:updated", syncMessages);
    }, []);

    function sendMessage(event) {
        event.preventDefault();
        const text = draft.trim();

        if (!text || !currentUser) {
            return;
        }

        const conversation = selectedConversation;
        const shopId = isShopAdmin
            ? currentShop?.id
            : conversation?.messages[0]?.shopId || requestedShopKey;
        const shopName = isShopAdmin
            ? currentShop?.name
            : conversation?.messages[0]?.shopName || requestedShopName || "Shop";
        const customerId = isShopAdmin
            ? conversation?.messages[0]?.customerId
            : currentUser.id;
        const customerName = isShopAdmin
            ? conversation?.messages[0]?.customerName
            : currentUser.name;
        const conversationId = conversation?.id || `${shopId}:${customerId}`;

        if (!shopId || !customerId) {
            return;
        }

        const updatedMessages = addMessage({
            conversationId,
            shopId,
            shopName,
            customerId,
            customerName,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            text,
        });
        setMessages(updatedMessages);
        setSelectedConversationId(conversationId);
        setDraft("");
    }

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-4xl font-bold text-gray-900">Messages</h1>
            <p className="mt-2 text-gray-600">
                {isShopAdmin ? "Chat with your customers." : "Chat with shops about their gowns."}
            </p>

            <div className="mt-8 grid min-h-140 overflow-hidden rounded-2xl border border-pink-200 bg-white shadow-sm md:grid-cols-[260px_1fr]">
                <aside className="border-b border-pink-200 bg-pink-50 p-3 md:border-b-0 md:border-r">
                    <h2 className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-pink-600">
                        Conversations
                    </h2>
                    <div className="space-y-1">
                        {conversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                type="button"
                                onClick={() => setSelectedConversationId(conversation.id)}
                                className={`w-full rounded-lg px-3 py-3 text-left ${selectedConversation?.id === conversation.id ? "bg-pink-600 text-white" : "text-pink-600 hover:bg-pink-100"}`}
                            >
                                <span className="block truncate font-semibold">
                                    {isShopAdmin ? conversation.customerName : conversation.shopName}
                                </span>
                                <span className="mt-1 block truncate text-xs opacity-75">
                                    {conversation.latest.text}
                                </span>
                            </button>
                        ))}
                        {!conversations.length && (
                            <p className="px-3 py-4 text-sm text-gray-500">
                                No conversations yet.
                            </p>
                        )}
                    </div>
                </aside>

                <section className="flex min-h-140 flex-col">
                    <div className="border-b border-pink-200 px-5 py-4">
                        <h2 className="font-bold text-gray-900">
                            {selectedConversation
                                ? isShopAdmin
                                    ? selectedConversation.customerName
                                    : selectedConversation.shopName
                                : requestedShopName || "Select a conversation"}
                        </h2>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-pink-50/30 p-5">
                        {selectedConversation?.messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.senderId === currentUser?.id ? "bg-pink-600 text-white" : "bg-white text-gray-900 ring-1 ring-pink-200"}`}>
                                    {isShopAdmin && (
                                        <p className="mb-1 text-xs font-semibold opacity-70">
                                            {message.senderName}
                                        </p>
                                    )}
                                    <p>{message.text}</p>
                                    <time className="mt-1 block text-xs opacity-70">
                                        {new Date(message.createdAt).toLocaleString()}
                                    </time>
                                </div>
                            </div>
                        ))}
                        {!selectedConversation && (
                            <p className="text-center text-sm text-gray-500">
                                Start a conversation with a shop from a product page.
                            </p>
                        )}
                    </div>

                    <form onSubmit={sendMessage} className="flex gap-3 border-t border-pink-200 p-4">
                        <input
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            placeholder="Write a message..."
                            className="min-w-0 flex-1 rounded-lg border border-pink-200 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-200"
                            disabled={!selectedConversation && !requestedShopKey}
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                            disabled={!draft.trim()}
                        >
                            Send
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}

export default MessagesPage;
