/**
 * Modal.tsx
 *
 * This file defines the `Modal` component for the Panther Thrift Shop web application.
 * The `Modal` component provides a reusable pop-up dialog box that displays content
 * over the current page. It is used to show additional information or interactive elements
 * without navigating away from the current view. The modal can be closed by clicking
 * the close button or implementing custom onClose behavior.
 *
 * Key Features:
 * - Displays a modal overlay with a semi-transparent background.
 * - Centers the content and provides a close button.
 * - Supports custom content via `children` prop for flexibility.
 * - Responsive design using Tailwind CSS.
 *
 * Dependencies:
 * - Tailwind CSS for styling.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 */

import React from "react";
import { ReactNode } from "react";

interface ModalProps {
    onClose: () => void;
    children: ReactNode;
}

const Modal = ({ onClose, children }: ModalProps) => {
    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg relative max-w-lg w-full">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                >
                    &times;
                </button>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
