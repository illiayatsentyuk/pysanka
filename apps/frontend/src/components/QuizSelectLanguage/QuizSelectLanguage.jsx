import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import "./QuizSelectLanguage.css";

export default function QuizSelectLanguage() {
  const [selectedLanguage, setSelectedLanguage] = useState("ua");
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleLanguageChange(e) {
    setSelectedLanguage(e.target.value);
  }

  const handleStart = () => {
    navigate(`/quiz?language=${selectedLanguage}`);
  };

  const selectedLangLabel = {
    ua: <Trans i18nKey="SelectLanguagePage.options.ua">Українська</Trans>,
    en: <Trans i18nKey="SelectLanguagePage.options.en">Англійська</Trans>,
    jp: <Trans i18nKey="SelectLanguagePage.options.jp">Японська</Trans>,
  }[selectedLanguage];

  return (
    <section className="quiz-select-language">
      <div className="quiz-select-language-header">
        <h1>
          <Trans i18nKey="quizPage.title">Quiz Mode</Trans>
        </h1>
        <p className="mode-hint">
          <Trans i18nKey="quizPage.description">
            You will be given 6 random letters to write. Each letter has a time limit.
          </Trans>
        </p>
      </div>
      <h2>
        <Trans i18nKey="SelectLanguagePage.title">Виберіть мову</Trans>
      </h2>
      <div className="quiz-select-language-container">
        <select
          name="language"
          id="language"
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          <option value="ua">
            <Trans i18nKey="SelectLanguagePage.options.ua">Українська</Trans>
          </option>
          <option value="en">
            <Trans i18nKey="SelectLanguagePage.options.en">Англійська</Trans>
          </option>
          <option value="jp">
            <Trans i18nKey="SelectLanguagePage.options.jp">Японська</Trans>
          </option>
        </select>
        {selectedLanguage && (
          <div className="quiz-select-language-info">
            <p>
              <Trans i18nKey="SelectLanguagePage.subtitle">
                Вибрана мова:{" "}
              </Trans>
              {selectedLangLabel}
            </p>
            <button className="syledButton" onClick={handleStart}>
              <Trans i18nKey="quizPage.startQuiz">Start Quiz</Trans>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
