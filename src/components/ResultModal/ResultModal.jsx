import { useImperativeHandle, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import "./ResultModal.css";

export default function ResultModal({ ref, result, description, advice }) {
  const dialog = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current.showModal();
      },
    };
  });

  return (
    <dialog ref={dialog} className="result-modal">
      <div className="result-content">
        <div className="result-header">
          <h2>
            <Trans i18nKey="resultModal.title">Ваша відповідь:</Trans>
          </h2>
          <div className="result-percentage">
            <strong>{result}%</strong>
          </div>
        </div>

        <div className="tips-section">
          <h3>
            <Trans i18nKey="resultModal.description">Поради:</Trans>
          </h3>
          <div className="tips-content">{advice}</div>
        </div>

        <form
          method="dialog"
          onClick={() => navigate(location.pathname + location.search)}
        >
          <button>
            <Trans i18nKey="resultModal.continueButton">Продовжити</Trans>
          </button>
        </form>
      </div>
    </dialog>
  );
}
