import { useRef, useEffect } from "react";
import { Trans } from "react-i18next";
import "./ModalWelcome.css";

export default function ModalWelcome({ onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    modalRef.current?.showModal();
  }, []);

  return (
    <dialog ref={modalRef} className="welcome-modal">
      <div className="welcome-content">
        <h2>
          <Trans i18nKey="welcomeModal.title">
            Ласкаво просимо до Lettera!
          </Trans>
        </h2>
        <p>
          <Trans i18nKey="welcomeModal.description">
            Ласкаво просимо до Lettera! Почніть навчання прямо зараз.
          </Trans>
        </p>
        <div className="welcome-buttons">
          <button className="welcome-button later-btn" onClick={onClose}>
            <Trans i18nKey="welcomeModal.laterButton">Почати</Trans>
          </button>
        </div>
      </div>
    </dialog>
  );
}