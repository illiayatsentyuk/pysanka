import * as React from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ResultModal from "../ResultModal/ResultModal.jsx";
import convertSvgToPng from "../utils/convertSvgToPng.js";
import arrow from "../../assets/right-arrow-svgrepo-com.svg";
import { useTranslation, Trans } from "react-i18next";
import "./Canvas.css";

const style = {
  border: "3px solid rgb(184, 184, 184)",

};

const STATUS = {
  GOOD: "good",
  AVERAGE: "average",
  BAD: "bad",
  NOT_DONE: null,
};

// Функція для озвучування букви
const speakLetter = (letter, language) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(letter);

    // Мапінг мов для SpeechSynthesis
    const langMap = {
      'ua': 'uk-UA',
      'en': 'en-US',
      'jp': 'ja-JP',
      'ro': 'ro-RO',
      'ch': 'zh-CN',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'de': 'de-DE'
    };

    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Ваш браузер не підтримує озвучування тексту');
  }
};

const generateGridSvg = (width, height, letterBase64 = null, showGrid = true) => {
  const lineOpacity = 0.2;
  const slantOpacity = 0.1;
  const slantInterval = 60;

  const lines = [
    { y: 40, opacity: 0.15 },
    { y: 80, opacity: 0.4 },
    { y: 160, opacity: 0.1 },
    { y: 240, opacity: 0.4 },
    { y: 280, opacity: 0.15 }
  ];

  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  if (showGrid) {
    for (let x = -height; x < width + height; x += slantInterval) {
      const x1 = x;
      const y1 = 0;
      const x2 = x - height * Math.tan((115 - 90) * Math.PI / 180);
      const y2 = height;
      svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#cbd5e0" stroke-width="1.5" stroke-opacity="0.6" />`;
    }

    lines.forEach(line => {
      svgContent += `<line x1="0" y1="${line.y}" x2="${width}" y2="${line.y}" stroke="black" stroke-width="2" stroke-opacity="${line.opacity}" />`;
    });
  }

  if (letterBase64) {
    const letterDataUrl = `data:image/svg+xml;base64,${letterBase64}`;
    svgContent += `<image href="${letterDataUrl}" x="0" y="0" width="${width}" height="${height}" />`;
  }

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
};

export default function Canvas() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const searchParams = new URLSearchParams(location.search);
  const sketchOrNot = searchParams.get("sketch") === "true";
  const letter = searchParams.get("letter");
  const language = searchParams.get("language");

  const [letterImage, setLetterImage] = useState(null);
  const [nextLetter, setNextLetter] = useState(null);
  const [prevLetter, setPrevLetter] = useState(null);
  const [result, setResult] = useState(null);
  const [description, setDescription] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);
  const resultModalRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [styles, setStyles] = useState({
    border: "3px solid rgb(184, 184, 184)",
  });
  const [userLanguage, setUserLanguage] = useState(
    localStorage.getItem('i18nextLng')
  );
  const [showGrid, setShowGrid] = useState(false);
  const [base64Letter, setBase64Letter] = useState(null);
  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLang = localStorage.getItem('i18nextLng');
      setUserLanguage(currentLang);
    };

    handleLanguageChange();
    window.addEventListener('storage', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
    };
  }, []);

  let sendButton = (
    <button
      disabled={isLoading}
      className="canvas-container-button"
      onClick={onSendCanvas}
    >
      <Trans i18nKey="canvasPage.sendButtonInactive">Відправити</Trans>
    </button>
  );
  let clearCanvasButton = (
    <button
      disabled={isLoading}
      className="canvas-container-button"
      onClick={() => {
        canvasRef.current.clearCanvas();
      }}
    >
      <Trans i18nKey="canvasPage.clearCanvasButton">Очистити</Trans>
    </button>
  );

  if (isLoading)
    sendButton = (
      <button
        disabled={isLoading}
        className="canvas-container-button"
        onClick={onSendCanvas}
      >
        <Trans i18nKey="canvasPage.sendButtonActive">Відправляємо...</Trans>
      </button>
    );
  useEffect(() => {
    if (sketchOrNot === null || letter === null || language === null) {
      if (sketchOrNot === null) {
        navigate(`/`);
      } else {
        navigate(`/select-language?sketch=${sketchOrNot}`);
      }
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}letter`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        language: language,
        letter: letter,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setBase64Letter(data.image);
        setLoading(false);
        setNextLetter(data.nextLetter);
        setPrevLetter(data.prevLetter);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [letter, language, navigate]);

  useEffect(() => {
    if (!loading) {
      const isUA = language === 'ua';
      const shouldRenderGrid = isUA && showGrid;

      const gridWithLetter = generateGridSvg(
        300,
        300,
        sketchOrNot ? base64Letter : null,
        shouldRenderGrid
      );

      setLetterImage(gridWithLetter);
    }
  }, [showGrid, base64Letter, loading, language, sketchOrNot]);

  const handleArrowClick = (direction) => {
    if (direction === "next") {
      setLoading(true);
      canvasRef.current.clearCanvas();
      navigate(
        `/canvas?letter=${nextLetter}&language=${language}&sketch=${sketchOrNot}`,
      );
    } else if (direction === "prev") {
      setLoading(true);
      canvasRef.current.clearCanvas();
      navigate(
        `/canvas?letter=${prevLetter}&language=${language}&sketch=${sketchOrNot}`,
      );
    }
  };

  // Helper function to save progress to localStorage
  const saveProgressToLocalStorage = (language, letter, percents) => {
    try {
      const progressKey = 'userProgress';
      let progress = JSON.parse(localStorage.getItem(progressKey) || '{}');

      if (!progress[language]) {
        progress[language] = {};
      }

      let status = 'bad';
      if (percents > 30 && percents < 70) {
        status = 'average';
      } else if (percents >= 70) {
        status = 'good';
      }

      progress[language][letter] = { status };
      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage:', e);
    }
  };

  function onSendCanvas() {
    setIsLoading(true);
    setStyles((prevStyles) => {
      return { ...prevStyles, pointerEvents: "none" };
    });

    canvasRef.current
      .exportImage("png")
      .then(async (data) => {
        const userPicture = data;
        const ethalonImage = await convertSvgToPng(letterImage);

        if (!ethalonImage) {
          console.error("Failed to convert SVG to PNG");
          return;
        }

        const resp = await fetch(
          `${import.meta.env.VITE_API_URL}sendImages`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              userImage: userPicture,
              ethalonImage: `data:image/png;base64,${ethalonImage}`,
              language: language,
              letter: letter,
              systemLanguage: userLanguage
            }),
          },
        );
        const response = await resp.json();
        setResult(() => {
          const newValue = response.percents;
          setStyles(styles);
          setAdvice(response.result.advice);
          resultModalRef.current.open();
          setIsLoading(false);

          // Save progress to localStorage
          if (response.percents !== undefined) {
            saveProgressToLocalStorage(language, letter, response.percents);
          }

          return newValue;
        });
      })
      .catch((e) => {
        console.log(e);
        alert("Failed to process the canvas image. Please try again.");
        setIsLoading(false);
      });
  }

  return (
    <section className="canvas-container">
      {(isLoading || loading) && (
        <div className="loader-overlay">
          <div className="loader-spinner"></div>
        </div>
      )}
      <ResultModal ref={resultModalRef} result={result} advice={advice} />
      <div className="canvas-navigation">
        <div className="nav-arrow-left">
          <span className="nav-letter">{prevLetter}</span>
          <button
            className="nav-arrow-button"
            disabled={isLoading || !prevLetter}
            onClick={() => handleArrowClick("prev")}
          >
            <img
              src={arrow}
              alt="arrow"
              className="arrow-left"
            />
          </button>
        </div>
        <div className="canvas-main-letter">{letter}</div>
        <div className="nav-arrow-right">
          <button
            className="nav-arrow-button"
            disabled={isLoading || !nextLetter}
            onClick={() => handleArrowClick("next")}
          >
            <img
              src={arrow}
              alt="arrow"
              className="arrow-right"
            />
          </button>
          <span className="nav-letter">{nextLetter}</span>
        </div>
      </div>
      <p className="mode-hint" style={{ textAlign: 'center', marginTop: '10px' }}>
        {sketchOrNot ? (
          <Trans i18nKey="NavBar.list.StudyHint">(напишіть літеру по наданому шаблону)</Trans>
        ) : (
          <Trans i18nKey="NavBar.list.ReviewHint">(напишіть літеру без шаблону)</Trans>
        )}
      </p>
      {/* <div className="canvas-word-to-speach-container">
        <button
          className="canvas-word-to-speach-button"
          onClick={() => speakLetter(letter, language)}
          disabled={isLoading}
          title="Озвучити букву"
        > <Trans i18nKey="canvasPage.wordToSpeachButton">Як звучить буква?</Trans>
        </button>
      </div> */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="canvas-wrapper-container">
          <div className="canvas-wrapper">
            <ReactSketchCanvas
              style={styles}
              width="300px"
              height="300px"
              strokeWidth={7}
              strokeColor="blue"
              backgroundImage={letterImage}
              ref={canvasRef}
            />
          </div>
          {language === 'ua' && (
            <div className="canvas-options">
              <label className="grid-toggle">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                <span className="toggle-text">
                  {t("canvasPage.showGrid")}
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      <div className="canvas-buttons">
        {sendButton}
        {clearCanvasButton}
      </div>
    </section>
  );
}