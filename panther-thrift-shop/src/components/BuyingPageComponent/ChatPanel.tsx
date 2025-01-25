/**
 * ChatPanel.tsx
 *
 * This component displays a collapsible panel of conversations.
 * Users can click on a conversation to open it in the ChatBox.
 *
 * Dependencies:
 * - Firebase Firestore for fetching conversations.
 * - Tailwind CSS for styling.
 * - React state for managing open/close state.
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 */

"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ChatBox from "./ChatBox";

interface Conversation {
    id: string;
    buyer: string;
    seller: string;
    lastMessage: string;
}

interface ChatPanelProps {
    userEmail: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ userEmail }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeChats, setActiveChats] = useState<
        { conversationId: string; sellerEmail: string }[]
    >([]);

    // Fetch conversations from Firestore
    useEffect(() => {
        if (userEmail) {
            const q = query(
                collection(db, "conversations"),
                where("participants", "array-contains", userEmail)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const convos = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Conversation[];
                setConversations(convos);
            });

            return () => unsubscribe();
        }
    }, [userEmail]);

    // Open a chatbox
    const openChatBox = (conversationId: string, sellerEmail: string) => {
        if (!activeChats.find((chat) => chat.conversationId === conversationId)) {
            setActiveChats([...activeChats, { conversationId, sellerEmail }]);
        }
    };

    // Close a chatbox
    const closeChatBox = (conversationId: string) => {
        setActiveChats(activeChats.filter((chat) => chat.conversationId !== conversationId));
    };

    return (
        <>
            {/* Chat Panel */}
            <div
                className={`fixed left-0 top-0 h-full bg-white shadow-md z-50 ${
                    isOpen ? "w-64" : "w-0"
                } overflow-hidden transition-all duration-300`}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-[-15px] top-4 bg-blue-500 text-white rounded-full p-2"
                >
                    {isOpen ? "Close" : "Chats"}
                </button>

                {isOpen && (
                    <div className="p-4">
                        <h2 className="text-lg font-bold mb-4">Conversations</h2>
                        {conversations.length > 0 ? (
                            <ul className="space-y-2">
                                {conversations.map((conversation) => (
                                    <li
                                        key={conversation.id}
                                        className="cursor-pointer p-2 border-b hover:bg-gray-100"
                                        onClick={() =>
                                            openChatBox(
                                                conversation.id,
                                                conversation.buyer === userEmail
                                                    ? conversation.seller
                                                    : conversation.buyer
                                            )
                                        }
                                    >
                                        <p className="font-semibold">
                                            {conversation.buyer === userEmail
                                                ? conversation.seller
                                                : conversation.buyer}
                                        </p>
                                        <p className="text-sm text-gray-500">{conversation.lastMessage}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No conversations yet.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Floating "Chats" Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-16 left-4 bg-blue-500 text-white rounded-full p-3 shadow-lg"
                >
                    Chats
                </button>
            )}

            {/* Render Active ChatBoxes */}
            <div className="absolute bottom-4 left-72 flex gap-4">
                {activeChats.map((chat) => (
                    <ChatBox
                        key={chat.conversationId}
                        conversationId={chat.conversationId}
                        userEmail={userEmail}
                        sellerEmail={chat.sellerEmail}
                        onClose={() => closeChatBox(chat.conversationId)}
                    />
                ))}
            </div>
        </>
    );
};

export default ChatPanel;
