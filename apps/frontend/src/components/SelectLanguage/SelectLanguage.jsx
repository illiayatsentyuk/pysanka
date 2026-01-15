import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import "./SelectLanguage.css";

const STATUS = {
  GOOD: "good",
  AVERAGE: "average",
  BAD: "bad",
  NOT_DONE: null,
};

async function getResults(token) {
  // Always return progress from localStorage as requested
  try {
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    return { progress };
  } catch (e) {
    console.error('Failed to load progress from localStorage:', e);
    return { progress: {} };
  }
}
async function getLetters(language) {
  try {
    const response = await fetch(
      "https://letters-back.vercel.app/letters",
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          language: language,
        }),
      },
    );
    const letters = await response.json();
    return letters.letters;
  } catch (e) {
    console.log(e);
    alert("Failed to get letters");
  }
}

export default function SelectLanguage() {
  const [selectedLanguage, setSelectedLanguage] = useState("ua");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [currentLetters, setCurrentLetters] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading
  const [results, setResults] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const searchParams = new URLSearchParams(location.search);
  let sketchOrNot = searchParams.get("sketch");
  if (!sketchOrNot) {
    sketchOrNot = "free";
  }

  useEffect(() => {
    const fetchData = async () => {
      const letters = await getLetters(selectedLanguage);
      setCurrentLetters(letters);
      setLoading(false);
    };
    fetchData();
  }, [selectedLanguage]);

  useEffect(() => {
    const fetchResults = async () => {
      const data = await getResults(token);
      setResults(data);
    };
    fetchResults();

    // Also listen for storage changes to update progress in real-time
    const handleStorageChange = async () => {
      if (!token) {
        const data = await getResults(token);
        setResults(data);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]);

  const handleStart = () => {
    if (sketchOrNot === "quick") {
      // Для quick режиму не потрібна літера - переходимо одразу
      navigate(`/quiz?language=${selectedLanguage}`);
      return;
    }

    if (selectedLetter !== null) {
      if (sketchOrNot === "free") {
        navigate(
          `/file-uploader?language=${selectedLanguage}&letter=${selectedLetter}`,
        );
      } else if (sketchOrNot === "upload") {
        navigate(
          `/file-uploader?language=${selectedLanguage}&letter=${selectedLetter}`,
        );
      } else {
        navigate(
          `/canvas?language=${selectedLanguage}&letter=${selectedLetter}&sketch=${sketchOrNot}`,
        );
      }
    } else {
      alert("Please select a letter");
    }
  };

  function handleLanguageChange(e) {
    setSelectedLanguage(() => {
      return e.target.value;
    });
  }

  const selectedLangLabel = {
    ua: <Trans i18nKey="SelectLanguagePage.options.ua">Українська</Trans>,
    en: <Trans i18nKey="SelectLanguagePage.options.en">Англійська</Trans>,
    jp: <Trans i18nKey="SelectLanguagePage.options.jp">Японська</Trans>,
  }[selectedLanguage];

  return (
    <section className="select-language">
      {sketchOrNot === "free" ? (
        <h1>Free Mode</h1>
      ) : sketchOrNot === "true" ? (
        <h1>Studying</h1>
      ) : sketchOrNot === "quick" ? (
        <h1>Quick Mode</h1>
      ) : sketchOrNot === "upload" ? (
        <h1>Upload File</h1>
      ) : (
        <h1>Testing</h1>
      )}
      <h2>
        <Trans i18nKey="SelectLanguagePage.title">Виберіть мову</Trans>
      </h2>
      <div className="select-language-container">
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
          <div className="select-language-container">
            <p>
              <Trans i18nKey="SelectLanguagePage.subtitle">
                Вибрана мова:{" "}
              </Trans>
              {selectedLangLabel}
            </p>
            {sketchOrNot === "quick" ? (
              // Для quick режиму показуємо кнопку одразу без вибору літер
              <div className="quick-mode-info">
                <p>
                  <Trans i18nKey="SelectLanguagePage.quickModeInfo">
                    В цьому режимі вам буде надано 6 випадкових літер для швидкого тестування
                  </Trans>
                </p>
                <button className="syledButton" onClick={handleStart}>
                  <Trans i18nKey="SelectLanguagePage.startButton">Почати</Trans>
                </button>
              </div>
            ) : (
              <>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <ul className="select-language-list">
                    {currentLetters.map((letter) => {
                      const status =
                        results.progress?.[selectedLanguage]?.[letter.letter]
                          ?.status ?? null;
                      let statusClass = "";

                      if (status === STATUS.GOOD) statusClass = "done";
                      else if (status === STATUS.AVERAGE) statusClass = "half-done";
                      else if (status === STATUS.BAD) statusClass = "poor";

                      return (
                        <li key={`${letter.id}-${letter.letter}`}>
                          <button
                            className={`select-language-button ${selectedLetter === letter.letter ? "active" : statusClass}`}
                            onClick={() => setSelectedLetter(letter.letter)}
                            onDoubleClick={() => handleStart()}
                          >
                            {letter.letter}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <button className="syledButton" onClick={handleStart}>
                  <Trans i18nKey="SelectLanguagePage.startButton">Почати</Trans>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
