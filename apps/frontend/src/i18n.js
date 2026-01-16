import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  // load translation using http -> see /public/locales
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: "en",
    debug: true,
  });

export default i18n;

// i18n.on("languageChanged", (lng) => {
//   try {
//     const token = localStorage.getItem("token");
//     const headers = {
//       "Content-Type": "application/json",
//     };
//     if (token) {
//       headers["Authorization"] = `Bearer ${token}`;
//     }
//     // Fire-and-forget; no blocking/await required for UI responsiveness
//     fetch(`${import.meta.env.VITE_API_URL}/setLanguage`, {
//       method: "POST",
//       headers,
//       body: JSON.stringify({ language: lng }),
//     }).catch(() => {
//       // silently ignore network errors for this non-critical telemetry
//     });
//   } catch (_) {
//     // ignore
//   }
// });