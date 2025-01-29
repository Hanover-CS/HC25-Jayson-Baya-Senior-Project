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
import { getData } from "@/lib/dbHandler"; // Use abstraction layer
import ChatBox from "./ChatBox";

interface Conversation extends Record<string, unknown>{
    id: string;
    buyer: string;
    seller: string;
    lastMessage: string;
    participants: string[];
}

interface ChatPanelProps {
    userEmail: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ userEmail }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeChats, setActiveChats] = useState<{ conversationId: string; sellerEmail: string }[]>([]);

    // Fetch conversations for the logged-in user
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const convos = await getData<Conversation>("conversations", [
                    { field: "participants", operator: "array-contains", value: userEmail },
                ]);
                setConversations(convos);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        if (userEmail) {
            fetchConversations();
        }
    }, [userEmail]);

    // Open a chatbox for a conversation
    const openChat = (conversationId: string, sellerEmail: string) => {
        if (!activeChats.find((chat) => chat.conversationId === conversationId)) {
            setActiveChats((prevChats) => [...prevChats, { conversationId, sellerEmail }]);
        }
    };

    // Close a chatbox
    const closeChat = (conversationId: string) => {
        setActiveChats((prevChats) =>
            prevChats.filter((chat) => chat.conversationId !== conversationId)
        );
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
                                {conversations.map((conversation) => {
                                    const isBuyer = conversation.buyer === userEmail;
                                    const otherParticipant = isBuyer
                                        ? conversation.seller
                                        : conversation.buyer;

                                    return (
                                        <li
                                            key={conversation.id}
                                            className="cursor-pointer p-2 border-b hover:bg-gray-100"
                                            onClick={() => openChat(conversation.id, otherParticipant)}
                                        >
                                            <p className="font-semibold">{otherParticipant}</p>
                                            <p className="text-sm text-gray-500">
                                                {conversation.lastMessage}
                                            </p>
                                        </li>
                                    );
                                })}
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

            {/* Active ChatBoxes */}
            {activeChats.map((chat) => (
                <ChatBox
                    key={chat.conversationId}
                    conversationId={chat.conversationId}
                    userEmail={userEmail}
                    sellerEmail={chat.sellerEmail}
                    onClose={() => closeChat(chat.conversationId)}
                />
            ))}
        </>
    );
};

export default ChatPanel;
