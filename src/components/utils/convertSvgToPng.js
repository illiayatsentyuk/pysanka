async function convertSvgToPng(svgPath) {
  try {
    const response = await fetch(svgPath);
    const svgText = await response.text();
    const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const pngBase64 = canvas.toDataURL("image/png").split(",")[1];
        URL.revokeObjectURL(svgUrl);
        resolve(pngBase64);
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(svgUrl);
        reject(error);
      };

      img.src = svgUrl;
    });
  } catch (error) {
    console.error("Error converting SVG to PNG:", error);
    return null;
  }
}
export default convertSvgToPng;
