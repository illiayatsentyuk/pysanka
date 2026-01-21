import { Outlet, Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import languagesImage from "../../../assets/languages.svg";
import question from "../../../assets/question-svgrepo-com.svg";
import { useNavigate, useLocation } from "react-router-dom";
import "../Layouts.css";

export default function UserLayout() {
  const burgerMenuRef = useRef(null);
  const navLinksRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = location.pathname.split("/")[1];
  const sketch = searchParams.get("sketch");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  const toggleMenu = () => {
    burgerMenuRef.current.classList.toggle("active");
    navLinksRef.current.classList.toggle("active");
  };

  function handleDropdownMenuClick() {
    dropdownMenuRef.current.classList.toggle("active");
  }
  return (
    <main>
      <nav className="navbar">
        <Link className="navbar-logo" to="/">
          Lettera
        </Link>

        <ul className="nav-links" id="nav-links" ref={navLinksRef}>
          <Link className="nav-links-item" to="/select-language?sketch=true">
            <li
              onClick={toggleMenu}
              className={sketch === "true" ? "current" : ""}
            >
              <Trans i18nKey="NavBar.list.StudyPage">Навчання</Trans>
            </li>
          </Link>
          <Link className="nav-links-item" to="/select-language?sketch=false">
            <li
              onClick={toggleMenu}
              className={sketch === "false" ? "current" : ""}
            >
              <Trans i18nKey="NavBar.list.ReviewPage">Тестування</Trans>
            </li>
          </Link>
          <Link className="nav-links-item" to="/select-language?sketch=free">
            <li
              onClick={toggleMenu}
              className={
                sketch === "free"
                  ? "current"
                  : mode === "file-uploader"
                    ? "current"
                    : ""
              }
            >
              <Trans i18nKey="NavBar.list.ComparePage">Вільний режим</Trans>
            </li>
          </Link>
          <Link className="nav-links-item" to="/quiz-select-language">
            <li
              onClick={toggleMenu}
              className={mode === "quiz" || mode === "quiz-select-language" ? "current" : ""}
            >
              <Trans i18nKey="NavBar.list.QuizPage">Quiz</Trans>
            </li>
          </Link>
        </ul>
        <div className="languages-doc-container">
          <div
            className="burger-menu"
            id="burger-menu"
            ref={burgerMenuRef}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="select-language-wrapper" ref={dropdownRef}>
            <div className="dropdown-container">
              <button
                className="dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
              >
                <img src={languagesImage} alt="Language selector" />
              </button>
              <div className={`dropdown-menu ${isOpen ? "active" : ""}`}>
                <button
                    className={i18n.language === "ua" ? "active-language" : ""}
                    onClick={() => {
                      changeLanguage("ua");
                      setIsOpen(false);
                    }}
                  >
                  Українська 
                </button>
                <button
                  className={i18n.language === "en" ? "active-language" : ""}
                  onClick={() => {
                    changeLanguage("en");
                    setIsOpen(false);
                  }}
                >
                  English
                </button>
                <button
                  className={i18n.language === "ro" ? "active-language" : ""}
                  onClick={() => {
                    changeLanguage("ro");
                    setIsOpen(false);
                  }}
                >
                  Română
                </button>

                <button
                  className={i18n.language === "ch" ? "active-language" : ""}
                  onClick={() => {
                    changeLanguage("ch");
                    setIsOpen(false);
                  }}
                >
                  中文
                </button>
                <button
                  className={i18n.language === "fr" ? "active-language" : ""}
                  onClick={() => {
                    changeLanguage("fr");
                    setIsOpen(false);
                  }}
                >
                  Français
                </button>
                <button
                  className={i18n.language === "jp" ? "active-language" : ""}
                  onClick={() => {
                    changeLanguage("jp");
                    setIsOpen(false);
                  }}
                >
                  日本語
                </button>
                <button
                  className={i18n.language === "es" ? "active-language" : ""}
                  onClick={() => {
                    changeLanguage("es");
                    setIsOpen(false);
                  }}
                >
                  Español
                </button>
                <button
                  className={i18n.language === "de" ? "active-language" : ""}
                  onClick={() => {
                    changeLanguage("de");
                    setIsOpen(false);
                  }}
                >
                  Deutsch
                </button>
              </div>
            </div>
          </div>
          <a
            href="https://docs.google.com/document/d/1rCVxcG4-D7zVxg4Mc-E9Cs4ZfaS8KuyTwaBcuxzsc60/edit?usp=sharing"
            target="_blank"
          >
            
            <img
              src={question}
              alt="question"
              style={{
                filter: "brightness(0) invert(1)",
                width: "30px",
                height: "30px",
              }}
            />
          </a>
        </div>
      </nav>
      <Outlet />
    </main>
  );
}
