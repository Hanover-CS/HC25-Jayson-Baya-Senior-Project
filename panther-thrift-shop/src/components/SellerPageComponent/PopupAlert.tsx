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
