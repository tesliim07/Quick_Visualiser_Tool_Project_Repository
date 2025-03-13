import React from "react";
import ReactModal from "react-modal";
import axios from 'axios';
import {useState} from 'react';

ReactModal.setAppElement("#root"); // Important for accessibility

interface PopupProps {
  isOpen: boolean;
  onNo: () => void;
  file_name: string;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onNo, file_name }) => {

    const [message, setMessage] = useState<string>("Are you sure?");

    const revertToOriginalDataset = async () => {
        try {
            const response = await axios.delete(`http://localhost:5000/revertToOriginalDataset/${file_name}`);
            if (response.status === 200) {
                setMessage("Reverted to original dataset");
            }
        } catch (error) {
            console.error("Error reverting to original dataset:", error);
            setMessage("Error reverting to original dataset");
        }
    }

    return (
        <ReactModal
            isOpen={isOpen}
            // onRequestClose={onClose}
            onRequestClose={onNo}
            style={{
                overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
                content: { padding: "20px", borderRadius: "10px", width: "300px", margin: "auto" },
            }}
            >
            {message === "Are you sure?" ? <div>
                <h2>Notification</h2>
                <p>{message}</p>
                <button onClick={revertToOriginalDataset}>Yes</button>
                <button onClick={onNo}>No</button> 
            </div> : 
            <div>
                <h2>Notification</h2>
                <p>{message}</p>
                <button onClick={onNo}>Close</button>
            </div>}
        </ReactModal>
    );
};

export default Popup;