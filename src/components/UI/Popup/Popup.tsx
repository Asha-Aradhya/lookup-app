import React from 'react';
import styles from './Popup.module.scss';

interface PopupProps {
    message: string;
    onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ message, onClose }) => {
    return (
        <div className={styles.popup}>
            <div className={styles.popupContent}>
                <p>{message}</p>
                <button className={styles.closeButton} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default Popup;