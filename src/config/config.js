// config.js
export const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

//const BASE_URL = isLocal
//  ? "./" // Helyi futtatásnál relatív út
//  : "https://cdn.jsdelivr.net/gh/felhasznalo/repo@hash/"; // Bloggeren a CDN
// Bloggeren manuélisan behívod a scriptet.

const BASE_URL = "./";

export default BASE_URL;