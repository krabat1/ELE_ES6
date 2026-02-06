// config.js
export const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.pathname.includes("teszt");

export const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

//const BASE_URL = isLocal
//  ? "./" // Helyi futtatásnál relatív út
//  : "https://cdn.jsdelivr.net/gh/felhasznalo/repo@hash/"; // Bloggeren a CDN
// Bloggeren manuálisan behívod a scriptet.

// Ha a config.js a /src/config/ mappában van, 
// akkor a "../../" visszalép a projekt gyökerébe.
// A .href kinyeri a tiszta URL szöveget.
const scriptPath = import.meta.url;
const BASE_URL = new URL("../../", scriptPath).href; // 

export default BASE_URL;