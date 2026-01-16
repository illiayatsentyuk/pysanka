import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { LuPenTool, LuFileText, LuFileCheck, LuUpload } from "react-icons/lu";
import "./MainPage.css";

export default function Main() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <section className="main-page">
      <h1 className="main-page-title">
        <Trans i18nKey="MainPage.title">Lettera</Trans>
      </h1>
      <p className="main-page-slogan">
        <Trans i18nKey="MainPage.slogan">Застосунок, що вчить писати літери</Trans>
      </p>
      <h2 className="main-page-choose-mode">
        <Trans i18nKey="MainPage.chooseMode">Оберіть режим</Trans>
      </h2>

      <div className="mode-cards">
        <div className="mode-card">
          <div className="mode-icon">
            <LuPenTool />
          </div>
          <h3 className="mode-card-title">
            <Trans i18nKey="MainPage.studySection.title">Навчання</Trans>
          </h3>
          <p className="mode-card-description">
            <Trans i18nKey="MainPage.studySection.description">
              Навчіться писати літери, обводячи їх за трафаретом
            </Trans>
          </p>
          <button
            className="mode-card-button"
            onClick={() => navigate("/select-language?sketch=true")}
          >
            <Trans i18nKey="MainPage.startButton">Почати навчання →</Trans>
          </button>
        </div>

        <div className="mode-card">
          <div className="mode-icon">
            <LuFileText />
          </div>
          <h3 className="mode-card-title">
            <Trans i18nKey="MainPage.compareSection.title">Вільний</Trans>
          </h3>
          <p className="mode-card-description">
            <Trans i18nKey="MainPage.compareSection.description">
              Навчіться писати літери, обводячи їх за трафаретом
            </Trans>
          </p>
          <button
            className="mode-card-button"
            onClick={() => navigate("/select-language?sketch=free")}
          >
            <Trans i18nKey="MainPage.startButton">Почати навчання →</Trans>
          </button>
        </div>

        <div className="mode-card">
          <div className="mode-icon">
            <LuFileCheck />
          </div>
          <h3 className="mode-card-title">
            <Trans i18nKey="MainPage.reviewSection.title">Тестування</Trans>
          </h3>
          <p className="mode-card-description">
            <Trans i18nKey="MainPage.reviewSection.description">
              Навчіться писати літери, обводячи їх за трафаретом
            </Trans>
          </p>
          <button
            className="mode-card-button"
            onClick={() => navigate("/select-language?sketch=false")}
          >
            <Trans i18nKey="MainPage.startButton">Почати навчання →</Trans>
          </button>
          
        </div>


      </div>
    </section>
  );
}
