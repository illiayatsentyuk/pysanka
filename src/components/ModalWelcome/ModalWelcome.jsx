import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trans } from "react-i18next";
import "./ModalWelcome.css";

export default function ModalWelcome({ onClose }) {
  const modalRef = useRef(null);
  const navigate = useNavigate();

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
            Для повноцінного використання додатку, будь ласка, увійдіть в систему
            або зареєструйтеся.
          </Trans>
        </p>
        <div className="welcome-buttons">
          <button
            className="welcome-button login-btn"
            onClick={() => {
              navigate("/auth");
              onClose();
            }}
          >
            <Trans i18nKey="welcomeModal.loginButton">Увійти</Trans>
          </button>
          <button className="welcome-button later-btn" onClick={onClose}>
            <Trans i18nKey="welcomeModal.laterButton">Пізніше</Trans>
          </button>
        </div>
      </div>
    </dialog>
  );
}