/**
 * ChatBox.tsx
 *
 * This file defines the `ChatBox` component for the Panther Thrift Shop web application.
 * The `ChatBox` serves as an individual chat window where users (buyers and sellers) can
 * send and receive messages in real-time. It is integrated with Firestore to enable real-time
 * updates of conversations.
 *
 * Key Features:
 * - Displays the conversation thread between buyer and seller.
 * - Supports real-time messaging with Firestore integration.
 * - Simple and responsive UI, including a message list, input field, and send button.
 * - Allows closing the chatbox dynamically.
 *
 * Dependencies:
 * - Firebase Firestore for managing messages.
 * - `Timestamp` from Firebase for displaying message times.
 *
 * Props:
 * - `conversationId`: The unique ID of the conversation.
 * - `userEmail`: The email of the logged-in user.
 * - `sellerEmail`: The email of the seller in the conversation.
 * - `onClose`: Callback function to close the chatbox.
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { addData, getData } from "@/lib/dbHandler"; // Import dbHandler functions

interface ChatBoxProps {
    conversationId: string; // Conversation ID
    userEmail: string; // Current user's email
    sellerEmail: string; // Seller's email
    onClose: () => void; // Close the chatbox
}

interface Message extends Record<string, unknown>{
    id: string;
    text: string;
    sender: string;
    recipient: string;
    timestamp: string;
    conversationId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ conversationId, userEmail, sellerEmail, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [isSending, setIsSending] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages for the conversation
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const fetchedMessages = await getData<Message>("messages", [{
                    field: "conversationId",
                    operator: "==",
                    value: conversationId
                }]);
                setMessages(fetchedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [conversationId]);

    // Scroll to the bottom of messages on update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle sending a new message
    const sendMessage = async () => {
        if (newMessage.trim() === "" || isSending) return;

        setIsSending(true);

        const messageData: Message = {
            id: `${conversationId}-${Date.now()}`, // Generate a unique ID
            text: newMessage,
            sender: userEmail,
            recipient: sellerEmail,
            timestamp: new Date().toISOString(),
            conversationId,
        };

        try {
            await addData<Message>("messages", messageData);
            setNewMessage(""); // Clear input field
            // Update the local state to include the new message
            setMessages((prevMessages) => [...prevMessages, messageData]);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-16 bg-white shadow-lg rounded-lg w-80 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-blue-500 text-white rounded-t-lg">
                <h3>{sellerEmail}</h3>
                <button onClick={onClose} className="text-lg font-bold">
                    ✕
                </button>
            </div>

            {/* Message List */}
            <div className="p-4 h-64 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 ${
                            msg.sender === userEmail ? "text-right" : "text-left"
                        }`}
                    >
                        <p
                            className={`inline-block px-3 py-2 rounded-lg ${
                                msg.sender === userEmail
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-800"
                            }`}
                        >
                            {msg.text}
                        </p>
                        <p className="text-xs text-gray-400">
                            {new Date(msg.timestamp).toLocaleString()}
                        </p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex items-center p-2 border-t">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-grow px-3 py-2 border rounded-lg"
                    disabled={isSending}
                />
                <button
                    onClick={sendMessage}
                    className={`ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ${
                        isSending ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isSending}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
