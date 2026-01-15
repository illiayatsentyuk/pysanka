import { useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import "./404.css";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="not-found-container">
      <h2 className="not-found-error">
        <Trans i18nKey="404Page.error">Error</Trans>
      </h2>
      <h1 className="not-found-code">404</h1>
      <h3 className="not-found-title">
        <Trans i18nKey="404Page.title">
          This page is outside of the universe.
        </Trans>
      </h3>
      <p className="not-found-description">
        <Trans i18nKey="404Page.description">
          The page you are trying to access doesn't exist or has been moved. Try
          going back to our homepage.
        </Trans>
      </p>
      <button className="syledButton" onClick={() => navigate("/")}>
        <Trans i18nKey="404Page.homeButton">Go to home</Trans>
      </button>
    </div>
  );
}
