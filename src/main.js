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
import Descriptions from "./descriptions/descriptions.js";
import DOM from "./dom/dom.js";
import { showDOM } from "./dom/dom.js";
// importok

function loadStyles() {
  Dev.log(LT.INIT, "loadStyles() fut");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${BASE_URL}src/styles/main.css`;
  document.head.appendChild(link);
  loadApp();
}

async function loadApp() {
  Dev.log(LT.INIT, "loadApp() fut");
  const response = await fetch(`${BASE_URL}src/app.html`);
  const html = await response.text();
  document.getElementById("app").innerHTML = html;

  DOM.login = document.querySelector("#login");
  DOM.emailField = document.querySelector("#email");
  DOM.passwordField = document.querySelector("#password");
  DOM.loginBtn = document.querySelector('[data-action="login"]');
  DOM.showPassInput = document.querySelector('[data-action="showPass"]');
  DOM.loginError = document.querySelector("#loginError");
  DOM.home = document.getElementById("home");
  DOM.switchView = document.getElementById("switchView");
  DOM.dialog = document.getElementById("dialogView");
  showDOM()
  init();
}

// dom elemek
/*let login,
  emailField,
  passwordField,
  showPassInput,
  loginBtn,
  loginError,
  home,
  switchView,
  dialog;*/

// event listenerek
function initEventListeners() {
  Dev.log(LT.INIT, "initEventListeners() fut");
  window.addEventListener('click', function(event){

    // const action = event.target.dataset.action;
    // Megkeressük a legközelebbi gombot, amin van 'data-action'
    const btn = event.target.closest('[data-action]');

    // Ha nem gombra (vagy gomb belsejére) kattintottak, kilépünk
    if (!btn) return;

    // Most már biztosan a gombtól kérjük le az adatokat
    const { action, id } = btn.dataset;

    // CONFIRM

    // ...itt épp nincs

    // LOGIN

    if (action === 'showPass') {
      UI.showPass();
    }

    if (action === 'login') {
      Auth.login(event);
    }

    // HOME (DECK-LIST)

    if (action === 'openTake5') {
      Deck.openTake5()
    }

    if (action === 'openFavs') {
      Deck.openFavs()
    }

    if (action === 'logout') {
      Auth.logout();
    }

    // DECK

    if (action === 'backHome') {
      backHome();
    }

    if (action === 'fakeRandom') {
      Card.fakeRandom();
    }

    if (action === 'loadDesc') {
      const slug = switchView.querySelector('.grid').getAttribute('id');
      Descriptions.loadDesc(slug)
    }
    
    if (action === 'closeDesc') {
      Descriptions.closeDesc()
    }

    // DECK / FAVORITES

    if (action === 'removeFav') {
      localStorage.setItem("favs", JSON.stringify([]));
      DeckList.favsToDecks();
    }

    // DECK / TAKE5
  
    if (action === 'newTakeFive') {
      Deck.newTakeFive()
    }

    // CARD / CARD-TOP

    // CARD / CARD-BOTTOM

    // CARD / LEFT-RIGHT

  });

  window.onpopstate = function (event) {
    if (!event.state || !event.state.index) {
      Dev.log(LT.NAV, "Nincs event.state vagy index!");
      return;
    }
    Dev.log(
      LT.NAV,
      "onpopstate",
      { _event_state: event.state },
      { _NavState_currentHistoryIndex: NavState.currentHistoryIndex },
    );
    if (event.state.index < NavState.currentHistoryIndex) {
      Dev.log(
        LT.NAV,
        `Hátra: event.state.index:${event.state.index} < NavState.currentHistoryIndex${NavState.currentHistoryIndex}`,
      );
    } else {
      Dev.log(
        LT.NAV,
        `Előre: event.state.index:${event.state.index} > NavState.currentHistoryIndex${NavState.currentHistoryIndex}`,
      );
    }
    NavState.currentHistoryIndex = event.state.index;
    //console.log(event.state.stack);
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
          DOM.switchView.querySelector("h2").textContent = "";
          Dev.log(
            LT.NAV,
            "Másik deck ",
            { _AppState_currentDeck_slug: AppState.currentDeck.slug },
            { _event_state_deck__slug: event.state.deck_slug },
          );
          Deck.openDeck(event.state.deck_slug, event.state.niceText);
        } else {
          Dev.log(LT.NAV, "Ugyanaz a deck ");
          UI.hideAll("switchView");
          if (
            DOM.switchView.querySelector(".grid").classList.contains("cardView")
          ) {
            DOM.switchView.querySelector(".grid").classList.remove("cardView");
          }
        }
      },
      card: () => {
        //console.log(`X ${JSON.stringify(event.state)}`);
        //ha nincs megnyitva a pakli
        if (AppState.currentDeck.slug !== event.state.deck_slug) {
          UI.initView("switchView");
          DOM.switchView.querySelector("h2").textContent = "";
          Dev.log(
            LT.NAV,
            "Másik deck kártyája ",
            { _AppState_currentDeck_slug: AppState.currentDeck.slug },
            { _event_state_deck__slug: event.state.deck_slug },
          );
          Deck.openDeck(event.state.deck_slug, event.state.niceText);
        } else {
          Dev.log(LT.NAV, "Ugyanannak a decknek a kártyája ");
          UI.hideAll("switchView");
          // ha nincs kártya megnyitva
          if (
            !DOM.switchView.querySelector(".grid").classList.contains("cardView")
          ) {
            Dev.log(LT.NAV, "Nincs kártya megnyitva");
            //switchView.querySelector('.grid').classList.add('cardView');
            Deck.showCardNew({
              pushToHistory: false,
              cardNumber: event.state.cardNumber /*, cardData:cardData*/,
            });
          } else {
            Dev.log(LT.NAV, "Meg van nyitva kártya ");
            DOM.switchView
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
  DOM.switchView.querySelector(".grid").removeAttribute("id");
  pushToHistory
    ? Nav.navToHistory("home", {})
    : Dev.log(LT.NAV, "no pushToHistory");
  DOM.switchView.querySelector(".grid").classList.remove("cardView");
  AppState.currentDeck = [];
  //console.log(AppState);
}

// Inicializálás
// Alkalmazás indítása

async function init() {
  Dev.log(LT.INIT, "init() fut");
  [DOM.emailField, DOM.passwordField, DOM.loginBtn].forEach((e) => {
    e.disabled = true;
  });
  Nav.navToHistory("login", {});
  //timeZoneField.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  DOM.loginError.textContent = "\u231B Bejelentkezés ellenőrzése...";
  Dev.log(LT.INIT, "deckek betöltése");
  DeckList.loadDecks(); // gyorsabb ha már most
  await new Promise((resolve) => setTimeout(resolve, 1000));
  //console.log('bejelentkezés ellenőrzése')
  const ok = await Auth.tryAutoLogin();
  if (ok) {
    // már be vagyunk lépve, tölthetjük a deckek listáját
    UI.hideAll("home"); // vagy ami nálatok a főnézet
    Nav.navToHistory("home", {});
    Dev.log(LT.INIT, "deckek betöltve?", AppState.decks.length > 0);
  } else {
    // mutasd a login modalt/formot
    [DOM.emailField, DOM.passwordField, DOM.loginBtn].forEach((e) => {
      e.disabled = false;
    });
    UI.hideAll("login");
    Nav.navToHistory("login", {});
    AppState.decks = [];
  }
  initEventListeners();
}

document.addEventListener("DOMContentLoaded", loadStyles());
