import Canvas from "./components/Canvas/Canvas.jsx";
import UserLayout from "./components/Layouts/UserLayout/UserLayout.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage/MainPage.jsx";
import FileUploader from "./components/FileUploader/FileUploader.jsx";
import SelectLanguage from "./components/SelectLanguage/SelectLanguage.jsx";
import NotFound from "./components/404/404.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index path="/" element={<MainPage />} />
          <Route path="canvas" element={<Canvas />} />
          <Route path="file-uploader" element={<FileUploader />} />
          <Route path="select-language" element={<SelectLanguage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}