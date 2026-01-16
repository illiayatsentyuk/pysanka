import { useEffect, useRef, useState } from "react";
import ResultModal from "../ResultModal/ResultModal.jsx";
import { useTranslation, Trans } from "react-i18next";
import fileImg from "../../assets/upload-file-svgrepo-com.svg";
import "./FileUploader.css";
import { useLocation, useNavigate } from "react-router-dom";
import arrow from "../../assets/right-arrow-svgrepo-com.svg";
import audioImage from "../../assets/audio-svgrepo-com.svg";
import convertSvgToPng from "../utils/convertSvgToPng.js";
import * as React from "react";
import "../Canvas/Canvas.css";

export default function FileUploader() {
  const ethalonFileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [ethalonFile, setEthalonFile] = useState(null);
  const resultModalRef = useRef(null);
  const [modalText, setModalText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [letterImage, setLetterImage] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [base64Ethalon, setBase64Ethalon] = useState(null);
  const [nextLetter, setNextLetter] = useState(null);
  const [prevLetter, setPrevLetter] = useState(null);
  const [userLanguage, setUserLanguage] = useState(
    localStorage.getItem('i18nextLng') || 'en'
  );
  const { t, i18n } = useTranslation();
  const searchParams = new URLSearchParams(location.search);
  const letter = searchParams.get("letter");
  const language = searchParams.get("language");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Відстежуємо зміни мови
  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLang = localStorage.getItem('i18nextLng') || 'en';
      setUserLanguage(currentLang);
    };

    handleLanguageChange();
    window.addEventListener('storage', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    if (letter === null || language === null || !letter || !language) {
      return navigate(`/select-language?sketch=free`);
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
      .then(async (data) => {
        console.log(data);
        const base64 = data.image;

        // Convert base64 SVG to PNG
        const pngBase64 = await convertSvgToPng(
          `data:image/svg+xml;base64,${base64}`,
        );
        if (pngBase64) {
          setLetterImage(`data:image/png;base64,${pngBase64}`);
        }

        setIsLoading(false);
        setBase64Ethalon(base64);
        setNextLetter(data.nextLetter);
        setPrevLetter(data.prevLetter);
      })
      .catch((e) => {
        console.log(e);
        return navigate(`/select-language?sketch=free`);
      });
  }, [letter, language, navigate]);

  function handleInputChange(e) {
    setEthalonFile(URL.createObjectURL(ethalonFileInputRef.current.files[0]));
  }

  function handleClearFiles(e) {
    const buttonId = e.target.id;

    if (buttonId === "mefile1-clear-button") {
      setEthalonFile(null);
      if (ethalonFileInputRef.current) {
        ethalonFileInputRef.current.value = "";
      }
    }
  }

  async function handleSendFiles() {
    setIsLoading(true);

    const userFile = ethalonFileInputRef.current.files[0];

    if (!userFile) {
      alert("Будь ласка завантаж файл");
      setIsLoading(false);
      return;
    }

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String);
        };
        reader.onerror = (err) => reject(err);
      });

    try {
      const userBase64 = await toBase64(userFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}sendImages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ethalonImage: letterImage,
            userImage: userBase64,
            letter: letter,
            language: language,
            systemLanguage: userLanguage,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setModalText(data.percents);
      setAdvice(data.result.advice);
    } catch (error) {
      console.error("Error sending files:", error);
      setModalText("Error occurred while sending files.");
    } finally {
      resultModalRef.current.open();
      setIsLoading(false);
    }
  }

  let button;
  if (!isLoading) {
    button = (
      <button
        disabled={isLoading}
        className="file-uploader-button"
        onClick={handleSendFiles}
      >
        <Trans i18nKey="comparePage.startButtonNotLoading">Поріняти</Trans>
      </button>
    );
  } else {
    button = (
      <button
        disabled={isLoading}
        className="file-uploader-button"
        onClick={handleSendFiles}
      >
        <Trans i18nKey="comparePage.startButtonLoading">Порівнюємо ...</Trans>
      </button>
    );
  }

  const handleArrowClick = (direction) => {
    if (direction === "next" && nextLetter) {
      setEthalonFile(null);
      if (ethalonFileInputRef.current) {
        ethalonFileInputRef.current.value = "";
      }
      navigate(`/file-uploader?letter=${nextLetter}&language=${language}`);
    } else if (direction === "prev" && prevLetter) {
      setEthalonFile(null);
      if (ethalonFileInputRef.current) {
        ethalonFileInputRef.current.value = "";
      }
      navigate(`/file-uploader?letter=${prevLetter}&language=${language}`);
    }
  };

  return (
    <div className="file-uploader">
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader-spinner"></div>
        </div>
      )}
      <ResultModal ref={resultModalRef} result={modalText} advice={advice} />
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
      <div className="file-uploader-sections">
        {/* Еталонна буква для порівняння */}
        {letterImage && (
          <div className="file-uploader-section">
            <h2 className="file-section-title">
              <Trans i18nKey="comparePage.ethalonLetter.title">Еталонна буква</Trans>
            </h2>
            <div className="ethalon-letter-container">
              <img
                src={letterImage}
                alt={`Letter ${letter}`}
                className="ethalon-letter-image"
              />
            </div>
          </div>
        )}

        {/* Файл користувача */}
        <div className="file-uploader-section">
          <h2 className="file-section-title">
            <Trans i18nKey="comparePage.userFile.title">Ваш файл</Trans>
          </h2>
          <label className="file-label">
            <span className="file-icon">+</span>
            <span className="file-label-text">
              <Trans i18nKey="comparePage.inputText">Завантажити</Trans>
            </span>
            <input
              className="file-input"
              id="FileInput"
              name="ethalonFile"
              type="file"
              accept="image/*"
              ref={ethalonFileInputRef}
              onChange={handleInputChange}
              style={{ display: "none" }}
            />
          </label>
          {ethalonFile && (
            <>
              <div className="uploaded-file-preview">
                <img
                  src={ethalonFile}
                  alt="Uploaded file"
                  className="uploaded-file-image"
                />
              </div>
              <button
                onClick={handleClearFiles}
                className="clear-button"
                id="mefile1-clear-button"
              >
                <Trans i18nKey="comparePage.clearButton">Очистити</Trans>
              </button>
            </>
          )}
        </div>
      </div>
      {button && (
        <div className="file-uploader-submit">
          {button}
        </div>
      )}
    </div>
  );
}