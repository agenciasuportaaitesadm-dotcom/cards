// Utilitário leve para recortar imagens no navegador a partir da área
// selecionada (react-easy-crop) e exportar um Blob JPEG já enquadrado.

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });

/**
 * Recorta a imagem para a área informada (em pixels da imagem original),
 * limitando a maior dimensão a `maxSize` para manter o arquivo leve,
 * preservando a proporção do recorte (sem deformar).
 */
export async function getCroppedBlob(imageSrc, cropPixels, maxSize = 1280) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let { width, height } = cropPixels;
  const largest = Math.max(width, height);
  const scale = largest > maxSize ? maxSize / largest : 1;

  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    width,
    height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob falhou"))),
      "image/jpeg",
      0.9
    );
  });
}
