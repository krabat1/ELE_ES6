import BASE_URL from "./config/config.js";
import { Logging as Dev } from "./logging/log.js";
import { LT } from "./logging/log.js";
import AppState from "./core/state.js";
import Nav from "./navigation/nav.js";
import { NavState } from "./navigation/nav.js";
import DeckList from "./deck_list/deck_list.js";
import Dialog from "./dialog/dialog.js";
import Card from "./card/card.js";
import Auth from "./auth/auth.js";
import UI from "./ui/ui.js";
import Deck from "./deck/deck.js";
import API from "./api/api.js";
import Security from "./security/security.js";
// importok

function loadStyles() {
  Dev.Log(LT.INIT, "loadStyles() fut");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${BASE_URL}src/styles/main.css`;
  document.head.appendChild(link);
  loadApp();
}

async function loadApp() {
  Dev.Log(LT.INIT, "loadApp() fut");
  const response = await fetch(`${BASE_URL}src/app.html`);
  const html = await response.text();
  document.getElementById("app").innerHTML = html;
  Dev.Log(LT.INIT, "#app loaded");

  login = document.querySelector("#login");
  emailField = document.querySelector("#email");
  passwordField = document.querySelector("#password");
  loginBtn = document.querySelector("#loginBtn");
  showPassInput = document.querySelector("#spw");
  loginError = document.querySelector("#loginError");
  home = document.getElementById("home");
  switchView = document.getElementById("switchView");
  dialog = document.getElementById("dialogView");
  init();
}

// dom elemek
let login,
  emailField,
  passwordField,
  showPassInput,
  loginBtn,
  loginError,
  home,
  switchView,
  dialog;

// event listenerek
function initEventListeners() {
  Dev.Log(LT.INIT, "initEventListeners() fut");
  showPassInput.onclick = () => {
    UI.showPass();
  };

  loginBtn.onclick = async function (event) {
    event.preventDefault();
    console.log("loginBtn.onclick");
    let email = emailField.value.trim();
    let password = passwordField.value.trim();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!email || !password) {
      document.getElementById("loginError").textContent =
        "\u2757 Kérlek töltsd ki mindkét mezőt.";
      return;
    }
    document.getElementById("loginError").textContent =
      "\uD83D\uDD0E Adatok ellenőrzése";
    const allowed = await Auth.checkLogin(email, password, timeZone);
    if (allowed) {
      AppState.userEmail = email;
      //hide("login");
      UI.hideAll("home");
      Nav.navToHistory("home", {});
    } else {
      Nav.navToHistory("login", {});
      // A response hibaüzeneteit a checkLogin() kezeli!
      //document.getElementById("loginError").textContent =
      //  "\u274C Helytelen email vagy jelszó.";
    }
  };

  document.getElementById("logOut").onclick = async (e) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const res = await fetch(
          `${accessAPI}?action=logout&token=${encodeURIComponent(token)}`,
        );

        const json = await res.json();
        if (!json.success) {
          console.error("logout API hiba:", json.error);
        }
      } catch (err) {
        console.error("logout API hiba", err);
      }
    }
    localStorage.removeItem(Auth.TOKEN_KEY);
    localStorage.removeItem(Auth.TOKEN_EXP_KEY);
    [emailField, passwordField, loginBtn].forEach((e) => {
      e.disabled = false;
    });
    [emailField, passwordField].forEach((e) => {
      e.value = "";
    });
    loginError.textContent = "\u2714\uFE0F  Kijelentkezés sikeres";
    UI.hideAll("login");
    Nav.navToHistory("login", {});
  };

  document.querySelector(".backHome").onclick = () => {
    // hide("deckView");
    backHome();
  };

  switchView.querySelector(".randomCard").onclick = () => {
    Card.fakeRandom();
  };

  document.getElementById("favoritesBtn").onclick = () => {
    UI.initView("switchView");
    switchView.querySelector("h2").textContent = "";
    Deck.openDeck("favs", "Kedvencek");
  };

  document.getElementById("dailyChallengeBtn").onclick = async () => {
    UI.initView("switchView");
    switchView.querySelector("h2").textContent = "";
    Deck.openDeck("takeFive", "Napi Minikihívás");
  };

  switchView.querySelector(".newTakeFive").onclick = async () => {
    switchView.querySelector(".newTakeFive").disabled = true;
    let takeFive = JSON.parse(localStorage.getItem("takeFive") || "[]");
    UI.initView("switchView", takeFive.length);
    try {
      const res = await fetch(`${API.deckAPI}?action=getRandomCards&count=5`);
      const json = await res.json();
      Dev.Log(LT.TAKE5, "takeFive JSON:", json);
      if (!json.success) {
        console.log("!json.success sajnos");
        return false;
      }
      if (json.success) {
        takeFive = json.data.cards;
        localStorage.setItem("takeFive", JSON.stringify(takeFive));
      } else {
        switchView.querySelector(".newTakeFive").disabled = false;
      }
    } catch (err) {
      Dialog.showDialog("Hiba a deck-list betöltésénél.");
      console.log(err);
      switchView.querySelector(".newTakeFive").disabled = false;
    }
    DeckList.takeFiveToDecks();
  };

  switchView.querySelector(".removeFav").onclick = () => {
    localStorage.setItem("favs", JSON.stringify([]));
    DeckList.favsToDecks();
  };

  window.onpopstate = function (event) {
    if (!event.state || !event.state.index) {
      Dev.Log(LT.NAV, "Nincs event.state vagy index!");
      return;
    }
    console.log(
      `state: ${JSON.stringify(event.state)}\n`,
      `currentHistoryIndex: ${NavState.currentHistoryIndex}`,
    );
    if (event.state.index < NavState.currentHistoryIndex) {
      console.log(
        `Hátra event.state.index:${event.state.index} < NavState.currentHistoryIndex${NavState.currentHistoryIndex}`,
      );
    } else {
      console.log(
        `Előre event.state.index:${event.state.index} > NavState.currentHistoryIndex${NavState.currentHistoryIndex}`,
      );
    }
    NavState.currentHistoryIndex = event.state.index;
    console.log(event.state.stack);
    const actions = {
      confirm: () => {
        //console.log(`X ${event.state.stack}`)
        let dialogButton1 = {
          text: "Igen",
          onclick: function () {
            Nav.navToHistory("login", {}); // forward stack levágása
            dialog.close();
            window.history.go(-3); // Tényleges kilépés az előzményekből
          },
        };
        let dialogButton2 = {
          text: "Nem",
          onclick: function () {
            // Visszaugrunk a HOME-ra, hogy legyen hova újra visszalépni
            //window.history.replaceState({ step: 'home' }, "");
            dialog.close();
          },
        };

        Dialog.showDialog("El akarod hagyni az alkalmazást?", [
          dialogButton1,
          dialogButton2,
        ]);
      },
      login: () => {
        //console.log(`X ${event.state.stack}`)
        UI.hideAll("login");
        dialog.close();
      },
      home: () => {
        //console.log(`X ${event.state.stack}`);
        backHome(false);
      },
      deck: () => {
        //console.log(`X ${JSON.stringify(event.state)}`);
        //ha nincs megnyitva a pakli
        if (AppState.currentDeck.slug !== event.state.deck_slug) {
          UI.initView("switchView");
          switchView.querySelector("h2").textContent = "";
          console.log(
            "deckA " + AppState.currentDeck.slug,
            event.state.deck_slug,
          );
          Deck.openDeck(event.state.deck_slug, event.state.niceText);
        } else {
          console.log("deckB ");
          UI.hideAll("switchView");
          if (
            switchView.querySelector(".grid").classList.contains("cardView")
          ) {
            switchView.querySelector(".grid").classList.remove("cardView");
          }
        }
      },
      card: () => {
        //console.log(`X ${JSON.stringify(event.state)}`);
        //ha nincs megnyitva a pakli
        if (AppState.currentDeck.slug !== event.state.deck_slug) {
          UI.initView("switchView");
          switchView.querySelector("h2").textContent = "";
          console.log(
            "cardA " + AppState.currentDeck.slug,
            event.state.deck_slug,
          );
          Deck.openDeck(event.state.deck_slug, event.state.niceText);
        } else {
          console.log("cardB ");
          UI.hideAll("switchView");
          // ha nincs kártya megnyitva
          if (
            !switchView.querySelector(".grid").classList.contains("cardView")
          ) {
            console.log("cardB A");
            //switchView.querySelector('.grid').classList.add('cardView');
            Deck.showCardNew({
              pushToHistory: false,
              cardNumber: event.state.cardNumber /*, cardData:cardData*/,
            });
          } else {
            console.log("cardB B");
            switchView
              .querySelector(`[data-card-number="${event.state.cardNumber}"]`)
              .scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
                container: "all",
              });
          }
        }
      },
    };
    actions[event.state.stack]();
  };
  Security.initSecurityListeners();
}





// ui?
function backHome(pushToHistory = true) {
  UI.hideAll("home");
  switchView.querySelector(".grid").removeAttribute("id");
  pushToHistory
    ? Nav.navToHistory("home", {})
    : console.log("no pushToHistory");
  switchView.querySelector(".grid").classList.remove("cardView");
  AppState.currentDeck = [];
  console.log(AppState);
}

// Inicializálás
// Alkalmazás indítása

async function init() {
  Dev.Log(LT.INIT, "init() fut");
  [emailField, passwordField, loginBtn].forEach((e) => {
    e.disabled = true;
  });
  Nav.navToHistory("login", {});
  //timeZoneField.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  loginError.textContent = "\u231B Bejelentkezés ellenőrzése...";
  DeckList.loadDecks(); // gyorsabb ha már most
  await new Promise((resolve) => setTimeout(resolve, 1000));
  //console.log('bejelentkezés ellenőrzése')
  const ok = await Auth.tryAutoLogin();
  if (ok) {
    // már be vagyunk lépve, tölthetjük a deckek listáját
    UI.hideAll("home"); // vagy ami nálatok a főnézet
    Nav.navToHistory("home", {});
    //loadDecks();
    console.log("decks betöltve?", AppState.decks.length > 0);
  } else {
    // mutasd a login modalt/formot
    [emailField, passwordField, loginBtn].forEach((e) => {
      e.disabled = false;
    });
    UI.hideAll("login");
    Nav.navToHistory("login", {});
    AppState.decks = [];
  }
  initEventListeners();
}

document.addEventListener("DOMContentLoaded", loadStyles());
