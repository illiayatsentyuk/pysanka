import Canvas from "./components/Canvas/Canvas.jsx";
import UserLayout from "./components/Layouts/UserLayout/UserLayout.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage/MainPage.jsx";
import FileUploader from "./components/FileUploader/FileUploader.jsx";
import SelectLanguage from "./components/SelectLanguage/SelectLanguage.jsx";
import AuthElement from "./components/Auth/AuthElement.jsx";
import GuseLayout from "./components/Layouts/GuestLayout/GuestLayout.jsx";
import NotFound from "./components/404/404.jsx";
import Quiz from "./components/Quiz/Quiz.jsx";
import { useEffect, useState } from "react";

export default function App() {
  const [isLogedIn, setIsLoggedIn] = useState(null); // null = перевірка, true/false = результат
  const [isChecking, setIsChecking] = useState(true); // новий стан для відстеження перевірки

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Якщо токена немає взагалі - одразу встановлюємо false
    if (!token) {
      setIsLoggedIn(false);
      setIsChecking(false);
      return;
    }

    // Перевіряємо токен на сервері
    fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.message === "Authenticated") {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          // Видаляємо невалідний токен
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        }
      })
      .catch((error) => {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
        // Видаляємо токен при помилці
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  // Показуємо лоадер поки перевіряємо авторизацію
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'white'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #87CEEB',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  // Після перевірки показуємо відповідні роути
  if (isLogedIn) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index path="/" element={<MainPage />} />
            <Route path="canvas" element={<Canvas />} />
            <Route path="file-uploader" element={<FileUploader />} />
            <Route path="select-language" element={<SelectLanguage />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuseLayout />}>
          <Route index path="/" element={<MainPage />} />
          <Route path="/auth" element={<AuthElement />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}