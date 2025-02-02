/**
 * PopupAlert.tsx
 *
 * This file defines the PopupAlert component for the Panther Thrift Shop web application.
 * The PopupAlert component renders a modal-like overlay that displays a message along with a
 * "Close" button. It is used to show notifications, alerts, or error messages to the user.
 * When the "Close" button is clicked, the provided onClose callback is invoked to dismiss the alert.
 *
 * Key Features:
 * - Displays a centered overlay with a semi-transparent background.
 * - Shows a custom message passed via the `message` prop.
 * - Includes a "Close" button that triggers the onClose callback when clicked.
 *
 * Props:
 * - message (string): The alert message to be displayed.
 * - onClose (function): A callback function to handle closing/dismissing the alert.
 *
 * Dependencies:
 * - React for component creation and rendering.
 *
 * Author: Jayson Baya
 * Last Updated: February 2, 2025
 */


import React from "react";

interface PopupAlertProps {
    message: string;
    onClose: () => void;
}

const PopupAlert: React.FC<PopupAlertProps> = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md text-center">
                <p>{message}</p>
                <button
                    onClick={onClose}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default PopupAlert;
