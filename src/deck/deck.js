import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";
import AppState from "../core/state.js";
import UI from "../ui/ui.js";
import Nav from "../navigation/nav.js";
import API from "../api/api.js";
import { isTouchDevice } from "../config/config.js";
import DeckList from "../deck_list/deck_list.js";
import Card from "../card/card.js";
import Descriptions from "../descriptions/descriptions.js";
import DOM from "../dom/dom.js";
import { isLocal } from "../config/config.js";

const Deck = {
  async openDeck(deck_slug, deck_niceText) {
    DOM.switchView.querySelector(".grid").setAttribute("id", deck_slug);
    if (deck_slug === DeckList.take5_base.slug) {
      // "takeFive"
      this.removeNewTake5Buttons();
      this.addNewTake5Button();
    } else {
      this.removeNewTake5Buttons();
    }
    if (deck_slug === DeckList.favs_base.slug) {
      // "favs"
      this.removeRemoveFavButton();

      const removeFavButton = document.createElement("button");
      removeFavButton.className = "red";
      removeFavButton.dataset.action = "removeFav";
      removeFavButton.innerText = "Kedvencek törlése";
      DOM.switchView.querySelector("#topActions").appendChild(removeFavButton);
    } else {
      this.removeRemoveFavButton();
    }
    Descriptions.removeButtons();

    // nézzük meg a decks objektumot, nincs e már benne,
    // ha benne van ne töltsük be újra, hanem dolgozzunk abból,
    // ha nincs benne töltsük be, mentsük a decksbe és dolgozzunk abból.
    const downloaded = AppState.decks.some((deck) => {
      return deck.slug === deck_slug && deck.hasOwnProperty("cards");
    });
    //console.log("downloaded", downloaded);
    Dev.log(LT.DECK, `A pakli le van töltve? >${downloaded}< (downloaded)`);
    //hideAll("deckView");
    UI.hideAll("switchView");
    Nav.navToHistory("deck", {
      deck_slug: deck_slug,
      deck_niceText: deck_niceText,
    });
    const index = AppState.decks.findIndex((deck) => deck.slug === deck_slug);
    if (!downloaded) {
      try {
        Dev.log(LT.API, `deckAPI/getDeck (${deck_slug})`);
        const res = await fetch(
          `${API.deckAPI}?action=getDeck&slug=${encodeURIComponent(deck_slug)}`,
        );
        const json = await res.json();
        if (!json.success) {
          Dev.log(
            LT.API,
            new Error(
              `deckAPI/getDeck (${deck_slug}, ${json.error}) sikertelen`,
            ),
          );
          //console.log("!json.success sajnos");
          return false;
        }
        if (json.success) {
          const deck = json.data;
          Dev.log(LT.API, `deckAPI/getDeck (${deck_slug}) letöltve`, { deck });
          //console.log("deck", deck);
          if (index > -1) {
            /**
             * MIÉRT NEM ????????????
             * AppState.decks[index] = deck;
             */
            AppState.decks[index].cards = deck.cards;
          }
        }
      } catch (err) {
        Dev.log(LT.DECKS, new Error("Hiba a deck megnyitásánál"), { err });
        //Dialog.showDialog(
        //  'Hiba a kártyák lekérésénél, próbáld meg újra az "Új leosztás\n gombbal.',
        //);
      }
    }

    // desclink gomb beillesztése/eltávolítása
    const dlink = AppState.decks[index].descLink;
    Dev.log(LT.DECK, "descLink", dlink, typeof dlink);

    if (AppState.decks[index].descLink !== "") {
      const elementExists = DOM.switchView.querySelectorAll(
        '[data-action="loadDesc"]',
      );
      if (elementExists.length === 0) {
        Descriptions.addButton();
      }
    } else if (AppState.decks[index].descLink === "") {
      Descriptions.removeButtons();
    }

    UI.initView("switchView", AppState.decks[index].cards.length);

    AppState.currentDeck = AppState.decks[index];
    AppState.currentStock = [];
    AppState.currentWaste = [];

    DOM.switchView.querySelector("h2").textContent = deck_niceText;

    // kedvencekben van-e? megállapításához
    let favs = JSON.parse(localStorage.getItem("favs") || "[]");

    Dev.log(LT.DECK, `create >deck< DOM elements (cards)`);

    if (deck_slug === "takeFive" && AppState.currentDeck.cards.length === 0) {
      Deck.newTakeFive();
    }

    for (let i = 1; i <= AppState.currentDeck.cards.length; i++) {
      let cardIndex = i - 1;

      let cardNumber = i.toString();
      if (cardNumber < 10) {
        cardNumber = cardNumber.padStart(2, "0");
      }
      const cardData = AppState.currentDeck.cards[cardIndex];
      const cardHolder = document.createElement("div");
      cardHolder.dataset.cardNumber = cardNumber;
      cardHolder.className = "card loading";

      const prev = document.createElement("div");
      prev.className = "prev";
      if (i > 1 && !isTouchDevice) {
        prev.classList.add("on");
        let prevCardNumber = (i - 1).toString(); // k
        if (prevCardNumber < 10) {
          prevCardNumber = prevCardNumber.padStart(2, "0");
        }
        prev.dataset.action = "prevCard";
        prev.dataset.prevCardNumber = prevCardNumber;
      }
      cardHolder.appendChild(prev);

      const cardMiddle = document.createElement("div");
      cardMiddle.className = "cardMiddle";
      const cardTop = document.createElement("div");
      cardTop.className = "cardTop";
      const favClose = document.createElement("div");
      favClose.className = "fav-close";
      if (favs.some((fav) => fav.internalID === cardData.internalID)) {
        favClose.classList.add("show-trash");
      }

      const trash = document.createElement("span");
      const fav = document.createElement("span");
      const random = document.createElement("span");
      const close = document.createElement("span");
      trash.className = "trash";
      fav.className = "fav";
      random.className = "random";
      close.className = "close";

      trash.setAttribute("title", "Törlés a kedvencekből");
      fav.setAttribute("title", "Hozzáadás a kedvencekhez");
      random.setAttribute("title", "Húzok egy kártyát");
      close.setAttribute("title", "Bezárás");

      trash.appendChild(document.createElement("span"));
      fav.appendChild(document.createElement("span"));
      random.appendChild(document.createElement("span"));
      close.appendChild(document.createElement("span"));

      trash.dataset.action = "favToTrash";
      fav.dataset.action = "addToFavs";
      random.dataset.action = "fakeRandom";
      close.dataset.action = "closeCard";
      // close.dataset.j = j

      favClose.appendChild(trash);
      favClose.appendChild(fav);
      favClose.appendChild(random);
      favClose.appendChild(close);
      cardTop.appendChild(favClose);
      cardMiddle.appendChild(cardTop);

      const cardBottom = document.createElement("div");
      cardBottom.className = "cardBottom";
      cardBottom.dataset.action = "showCard";
      //cardBottom.dataset.j = j

      const cardImg = document.createElement("img");
      cardImg.className = "cardimg";
      cardImg.dataset.cardData = JSON.stringify(cardData);
      cardImg.setAttribute("src", cardData.imageUrl);
      cardImg.setAttribute("alt", cardData.title);
      cardImg.onload = function (event) {
        DeckList.handleImageLoad(event.target);
      };
      cardImg.dataset.cardData = JSON.stringify(cardData);
      const protect = document.createElement("div");
      protect.className = "protect";
      cardBottom.appendChild(cardImg);
      cardBottom.appendChild(protect);
      cardMiddle.appendChild(cardBottom);
      cardHolder.appendChild(cardMiddle);

      const next = document.createElement("div");
      next.className = "next";
      if (i < AppState.currentDeck.cards.length && !isTouchDevice) {
        next.classList.add("on");
        let nextCardNumber = (i + 1).toString(); //k
        if (nextCardNumber < 10) {
          nextCardNumber = nextCardNumber.padStart(2, "0");
        }
        next.dataset.action = "nextCard";
        next.dataset.nextCardNumber = nextCardNumber;
        next.dataset.i = i;
      }

      cardHolder.appendChild(next);
      DOM.switchView.querySelector(".grid").appendChild(cardHolder);
    }
    Dev.log(
      LT.DECK,
      `append >deck< DOM elements (cards) to .grid`,
      DOM.switchView.querySelector(".grid"),
    );
    DOM.switchView
      .querySelector(".loader")
      .setAttribute("style", "display: none");
  },

  showCardNew({
    pushToHistory = true,
    cardNumber = undefined /*, cardData = {}*/,
  }) {
    if (!cardNumber) Dev.log(LT.DECK, new Error("cardNumber"), { cardNumber });
    if (DOM.switchView.querySelector(".grid").classList.contains("cardView")) {
      DOM.switchView.querySelector(".grid").classList.remove("cardView");
      pushToHistory
        ? Nav.navToHistory("deck", {
            deck_slug: AppState.currentDeck.slug,
            deck_niceText: AppState.currentDeck.niceText,
          })
        : Dev.log(LT.DECK, "no pushToHistory");
      //AppState.currentCard = {};
      //DOM.currentCard = null;
      Card.setCurrentCard(null, "showCardNew() - reset");
    } else {
      DOM.switchView.querySelector(".grid").classList.add("cardView");
      if (cardNumber) {
        //console.log('sign a '+ JSON.stringify(currentDeck))
        pushToHistory
          ? Nav.navToHistory("card", {
              deck_slug: AppState.currentDeck.slug,
              deck_niceText: AppState.currentDeck.niceText,
              cardNumber: cardNumber,
              sign: "a",
            })
          : Dev.log(LT.CARD, "no pushToHistory");
        DOM.switchView
          .querySelector(`[data-card-number="${cardNumber}"]`)
          .scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
            container: "all",
          });
      } else {
        Dev.log(LT.DECK, "no cardNumber", arguments);
        pushToHistory
          ? Nav.navToHistory("card", {
              deck_slug: AppState.currentDeck.slug,
              deck_niceText: AppState.currentDeck.niceText,
              cardNumber: "01",
              sign: "b",
            })
          : Dev.log(LT.NAV, "no pushToHistory");
      }

      let currentCardElem = DOM.switchView.querySelector(
        `[data-card-number="${cardNumber}"]`,
      );
      //let currentCardElemData = currentCardElem.dataset.cardData
      //AppState.currentCard = JSON.parse(currentCardElemData);
      //DOM.currentCard = currentCardElem.closest('.card');
      Card.setCurrentCard(currentCardElem, "showCardNew()");
      //Dev.log(LT.DOM, 'DOM.currentCard', DOM.currentCard)
    }
  },
  removeRemoveFavButton() {
    const elementExists = DOM.switchView.querySelectorAll(
      '[data-action="removeFav"]',
    );
    if (elementExists.length > 0) {
      elementExists.forEach((el) => {
        el.remove();
      });
    }
  },
  async newTakeFive() {
    Dev.log(LT.EVENT, `newTakeFive.onclick`);
    DOM.switchView.querySelector('[data-action="newTakeFive"]').disabled = true;
    let takeFive = JSON.parse(localStorage.getItem("takeFive") || "[]");
    UI.initView("switchView", takeFive.length);
    try {
      Dev.log(LT.AUTH, "deckAPI/getRandomCards");
      const res = await fetch(`${API.deckAPI}?action=getRandomCards&count=5`);
      const json = await res.json();
      Dev.log(LT.TAKE5, "takeFive JSON:", json);
      if (!json.success) {
        Dev.log(
          LT.API,
          new Error(`deckAPI/getRandomCards (${json.error}) sikertelen`),
        );
        //console.log("!json.success sajnos");
        return false;
      }
      if (json.success) {
        takeFive = json.data.cards;
        localStorage.setItem("takeFive", JSON.stringify(takeFive));
      } else {
        DOM.switchView.querySelector(".newTakeFive").disabled = false;
      }
    } catch (err) {
      Dev.log(LT.DECKS, new Error("Hiba a kártyák lekérésénél"), { err });
      Dialog.showDialog(
        'Hiba a kártyák lekérésénél, próbáld meg újra az "Új leosztás\n gombbal.',
      );
      //console.log(err);
      DOM.switchView.querySelector(".newTakeFive").disabled = false;
    }
    DeckList.takeFiveToDecks();
  },
  devRemoveTakeFive() {
    localStorage.setItem("takeFive", JSON.stringify([]));
    DeckList.takeFiveToDecks();
  },
  addNewTake5Button() {
    const newTake5Button = document.createElement("button");
    newTake5Button.className = "orange";
    //descButton.className = "blue description";
    //descButton.setAttribute("id", "description2");
    newTake5Button.innerText = "Új leosztás";
    newTake5Button.dataset.action = "newTakeFive";
    DOM.switchView.querySelector("#topActions").appendChild(newTake5Button);
  },
  removeNewTake5Buttons() {
    const elementExists = switchView.querySelectorAll(
      '[data-action="newTakeFive"]',
    );
    if (elementExists.length > 0) {
      elementExists.forEach((el) => {
        el.remove();
      });
    }
  },
  openTake5() {
    Dev.log(LT.EVENT, `dailyChallengeBtn.onclick`);
    UI.initView("switchView");
    DOM.switchView.querySelector("h2").textContent = "";
    this.openDeck("takeFive", "Napi Minikihívás");
  },
  openFavs() {
    Dev.log(LT.EVENT, `favoritesBtn.onclick`);
    UI.initView("switchView");
    DOM.switchView.querySelector("h2").textContent = "";
    this.openDeck("favs", "Kedvencek");
  },
};

if (isLocal) window.Deck = Deck;

export default Deck;
