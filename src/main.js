import BASE_URL from "./config/config.js";
import { Logging as Dev } from "./logging/log.js";
import { LT } from "./logging/log.js";
// importok

async function loadApp() {
  const response = await fetch(`${BASE_URL}src/app.html`);
  const html = await response.text();
  document.getElementById("app").innerHTML = html;
  Dev.Log(LT.INIT, "#app loaded",LT.INIT,LT.INIT);
}
loadApp();

// dom elemek
const emailField = document.querySelector("#email");
const passwordField = document.querySelector("#password");
const loginBtn = document.querySelector("#loginBtn");
const loginError = document.querySelector("#loginError");
const dialog = document.getElementById("dialogView");
// event listenerek
// html betöltése az app-ba
// Inicializálás
// Alkalmazás indítása
