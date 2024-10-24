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
