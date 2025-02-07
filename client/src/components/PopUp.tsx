import React from "react";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root"); // Important for accessibility

interface PopupProps {
  isOpen: boolean;
  message?: string;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ isOpen, message, onClose }) => {
    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
                content: { padding: "20px", borderRadius: "10px", width: "300px", margin: "auto" },
            }}
            >
            <h2>Notification</h2>
            <p>{message}</p>
            <button onClick={onClose}>Close</button>
        </ReactModal>
    );
};

export default Popup;