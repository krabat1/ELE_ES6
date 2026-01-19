import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";
import AppState from "../core/state.js";
import UI from "../ui/ui.js";
import Nav from "../navigation/nav.js";
import API from "../api/api.js";
import { isTouchDevice } from "../config/config.js";
import DeckList from "../deck_list/deck_list.js";
import Card from "../card/card.js";

const Deck = {
  async openDeck(deck_slug, deck_niceText) {
    //currentDeckSlug = deck_slug;
    switchView.querySelector(".grid").setAttribute("id", deck_slug);
    if (deck_slug === "takeFive") {
      switchView.querySelector(".newTakeFive").removeAttribute("style");
    } else {
      switchView
        .querySelector(".newTakeFive")
        .setAttribute("style", "display: none;");
    }
    if (deck_slug === "favs") {
      switchView.querySelector(".removeFav").removeAttribute("style");
    } else {
      switchView
        .querySelector(".removeFav")
        .setAttribute("style", "display: none;");
    }
    switchView
      .querySelector(".description")
      .setAttribute("style", "display: none;");

    // nézzük meg a decks objektumot, nincs e már benne,
    // ha benne van ne töltsük be újra, hanem dolgozzunk abból,
    // ha nincs benne töltsük be, mentsük a decksbe és dolgozzunk abból.
    const downloaded = AppState.decks.some((deck) => {
      //if(deck.slug !== deck_slug){console.log('-slug',deck.slug,deck_slug)}
      //else{console.log('+slug',deck.slug,deck_slug)}
      //if(deck.hasOwnProperty('cards')){console.log('van cards')}
      return deck.slug === deck_slug && deck.hasOwnProperty("cards");
    });
    console.log("downloaded", downloaded);
    //hideAll("deckView");
    UI.hideAll("switchView");
    Nav.navToHistory("deck", {
      deck_slug: deck_slug,
      deck_niceText: deck_niceText,
    });
    const index = AppState.decks.findIndex((deck) => deck.slug === deck_slug);
    if (!downloaded) {
      const res = await fetch(
        `${API.deckAPI}?action=getDeck&slug=${encodeURIComponent(deck_slug)}`
      );
      const json = await res.json();
      if (!json.success) {
        console.log("!json.success sajnos");
        return false;
      }
      if (json.success) {
        const deck = json.data;
        console.log("deck", deck);
        if (index > -1) {
          /**
           * MIÉRT NEM ????????????
           * AppState.decks[index] = deck;
           */
          AppState.decks[index].cards = deck.cards;
          console.log("decks", AppState.decks);
          if (AppState.decks[index].descLink !== "") {
            switchView.querySelector(".description").removeAttribute("style");
            switchView.querySelector(".description").onclick = () => {
              window.open(AppState.decks[index].descLink, "_blank");
            };
          }
        }
      }
    }

    UI.initView("switchView", AppState.decks[index].cards.length);
    //window.history.replaceState({ step: 'deck' }, "");
    //whatState()
    //console.log("openDeck pushState: deck");

    //currentDeck = decks[index].cards;
    AppState.currentDeck = AppState.decks[index];
    AppState.currentStock = [];
    AppState.currentWaste = [];

    switchView.querySelector("h2").textContent = deck_niceText;
    //currentDeckTitle = deck_niceText;
    AppState.currentDeckTitle = AppState.currentDeck.niceText;

    // kedvencekben van-e? megállapításához
    let favs = JSON.parse(localStorage.getItem("favs") || "[]");

    for (let i = 1; i <= AppState.currentDeck.cards.length; i++) {
      let j = i.toString();
      if (j < 10) {
        j = j.padStart(2, "0");
      }
      const cardData = AppState.currentDeck.cards[i - 1];
      //console.log('x',cardData);
      const cardHolder = document.createElement("div");
      cardHolder.dataset.cardNumber = j;
      cardHolder.className = "card loading";

      const prev = document.createElement("div");
      prev.className = "prev";
      if (i > 1 && !isTouchDevice) {
        prev.classList.add("on");
        let k = (i - 1).toString();
        if (k < 10) {
          k = k.padStart(2, "0");
        }
        prev.onclick = (e) => {
          switchView.querySelector(`[data-card-number="${k}"]`).scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
            container: "all",
          });
          AppState.currentCard = AppState.currentDeck.cards[i - 2];
          Nav.navToHistory("card", {
            deck_slug: AppState.currentDeck.slug,
            deck_niceText: AppState.currentDeck.niceText,
            cardNumber: k,
            sign: "prevC",
          });
          //console.log('currentCard',currentCard.title)
        };
      }
      cardHolder.appendChild(prev);

      const cardMiddle = document.createElement("div");
      cardMiddle.className = "cardMiddle";
      const cardTop = document.createElement("div");
      cardTop.className = "cardTop";
      const favClose = document.createElement("div");
      favClose.className = "fav-close";
      if (favs.some((fav) => fav.internalID === cardData.internalID)) {
        //console.log('A kártya már a kedvencekben van')
        //cardHolder.querySelector(".fav-close").classList.add("show-trash");
        favClose.classList.add("show-trash");
      } else {
        //console.log('A kártya nincs a kedvencekben')
        //cardHolder.querySelector(".fav-close").classList.remove("show-trash");
      }

      const trash = document.createElement("span");
      const fav = document.createElement("span");
      const random = document.createElement("span");
      const close = document.createElement("span");
      trash.className = 'trash';
      fav.className = 'fav';
      random.className = 'random';
      close.className = 'close';


      trash.setAttribute("title", "Törlés a kedvencekből");
      fav.setAttribute("title", "Hozzáadás a kedvencekhez");
      random.setAttribute("title", "Húzok egy kártyát");
      close.setAttribute("title", "Bezárás");

      trash.appendChild(document.createElement('span'))
      fav.appendChild(document.createElement('span'))
      random.appendChild(document.createElement('span'))
      close.appendChild(document.createElement('span'))

      trash.onclick = function (event) {
        Card.favToTrash(event);
      };
      fav.onclick = function (event) {
        Card.addToFavs(event);
      };
      random.onclick = function (event) {
        Card.fakeRandom();
      };
      close.onclick = (event) => {
        this.showCardNew({ pushToHistory: true, cardNumber: j });
      };



      favClose.appendChild(trash);
      favClose.appendChild(fav);
      favClose.appendChild(random);
      favClose.appendChild(close);
      cardTop.appendChild(favClose);
      cardMiddle.appendChild(cardTop);

      const cardBottom = document.createElement("div");
      cardBottom.className = "cardBottom";
      cardBottom.onclick = (event) => {
        this.showCardNew({
          pushToHistory: true,
          cardNumber: j /*, cardData:cardData*/,
        });
      };
      const cardImg = document.createElement("img");
      cardImg.className = "cardimg";
      cardImg.setAttribute("src", cardData.imageUrl);
      cardImg.setAttribute("alt", cardData.title);
      cardImg.onload = function (event) {
        DeckList.handleImageLoad(event.target);
      };
      //cardImg.setAttribute('data-card-data', JSON.stringify(cardData).replace(/"/g, "&quot;"))
      cardImg.dataset.cardData = JSON.stringify(cardData)/*.replace(
        /"/g,
        "&quot;"
      )*/;
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
        let k = (i + 1).toString();
        if (k < 10) {
          k = k.padStart(2, "0");
        }
        next.onclick = (e) => {
          switchView.querySelector(`[data-card-number="${k}"]`).scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
            container: "all",
          });
          AppState.currentCard = AppState.currentDeck.cards[i];
          Nav.navToHistory("card", {
            deck_slug: AppState.currentDeck.slug,
            deck_niceText: AppState.currentDeck.niceText,
            cardNumber: k,
            sign: "nextC",
          });
          //console.log('currentCard',currentCard.title)
        };
      }
      cardHolder.appendChild(next);
      Dev.Log(LT.DECK, cardHolder)


      /*cardHolder.innerHTML = `
          	<div class="prev">
      </div>
          	<div class="cardMiddle">
            	<div class="cardTop">
                	<div class="fav-close">
          <span class="trash" id="trashCard" title="Törlés a kedvencekből"><span></span></span>
          <span class="fav" id="favCard" title="Hozzáadás a kedvencekhez"><span></span></span>
          <span class="random" id="randomCard" title="Húzok egy kártyát"><span></span></span>
          <span class="close" id="closeCard" title="Bezárás"><span></span></span>
      </div>

      </div>
            	<div class="cardBottom">
                  <img class="cardimg" src="${cardData.imageUrl}" alt="${cardData.title}" data-card-data="${JSON.stringify(cardData).replace(/"/g, "&quot;")}" onload="handleImageLoad(this);">
                  <div class="protect"></div>
      </div>
      </div>
          	<div class="next">
      </div>
            `;*/

      /*cardHolder.querySelector(".cardBottom").onclick = () => {
        showCardNew({
          pushToHistory: true,
          cardNumber: j,
        });
        console.log("showCardNew", j);
      };*/

      /*if (i > 1 && !isTouchDevice) {
        cardHolder.querySelector(".prev").classList.add("on");
        let k = (i - 1).toString();
        if (k < 10) {
          k = k.padStart(2, "0");
        }
        cardHolder.querySelector(".prev").onclick = (e) => {
          switchView.querySelector(`[data-card-number="${k}"]`).scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
            container: "all",
          });
          currentCard = currentDeck.cards[i - 2];
          navToHistory("card", {
            deck_slug: currentDeck.slug,
            deck_niceText: currentDeck.niceText,
            cardNumber: k,
            sign: "prevC",
          });
          //console.log('currentCard',currentCard.title)
        };
      }*/
      /*if (i < AppState.currentDeck.cards.length && !isTouchDevice) {
        cardHolder.querySelector(".next").classList.add("on");
        let k = (i + 1).toString();
        if (k < 10) {
          k = k.padStart(2, "0");
        }
        cardHolder.querySelector(".next").onclick = (e) => {
          switchView.querySelector(`[data-card-number="${k}"]`).scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
            container: "all",
          });
          currentCard = currentDeck.cards[i];
          navToHistory("card", {
            deck_slug: currentDeck.slug,
            deck_niceText: currentDeck.niceText,
            cardNumber: k,
            sign: "nextC",
          });
          //console.log('currentCard',currentCard.title)
        };
      }*/
      // kedvencekben van-e?
      /*let favs = JSON.parse(localStorage.getItem("favs") || "[]");

      if (favs.some((fav) => fav.internalID === cardData.internalID)) {
        //console.log('A kártya már a kedvencekben van')
        cardHolder.querySelector(".fav-close").classList.add("show-trash");
      } else {
        //console.log('A kártya nincs a kedvencekben')
        cardHolder.querySelector(".fav-close").classList.remove("show-trash");
      }*/

      /*cardHolder.querySelector(".close").onclick = () => {
        showCardNew({ pushToHistory: true, cardNumber: j });
      };
      cardHolder.querySelector(".fav").onclick = (event) => {
        addToFavs(event);
      };
      cardHolder.querySelector(".random").onclick = (event) => {
        fakeRandom();
      };
      cardHolder.querySelector(".trash").onclick = (event) => {
        favToTrash(event);
      };*/
      switchView.querySelector(".grid").appendChild(cardHolder);

      //teszt
      //switchView.querySelector('.grid').classList.add('cardView');
    }
    Dev.Log(LT.DECK, switchView.querySelector(".grid"));
    switchView.querySelector(".loader").setAttribute("style", "display: none");
  },

  showCardNew({
    pushToHistory = true,
    cardNumber = undefined /*, cardData = {}*/,
  }) {
    if (switchView.querySelector(".grid").classList.contains("cardView")) {
      switchView.querySelector(".grid").classList.remove("cardView");
      pushToHistory
        ? Nav.navToHistory("deck", {
            deck_slug: AppState.currentDeck.slug,
            deck_niceText: AppState.currentDeck.niceText,
          })
        : console.log("no pushToHistory");
      AppState.currentCard = {};
    } else {
      switchView.querySelector(".grid").classList.add("cardView");
      if (cardNumber) {
        //console.log('sign a '+ JSON.stringify(currentDeck))
        pushToHistory
          ? Nav.navToHistory("card", {
              deck_slug: AppState.currentDeck.slug,
              deck_niceText: AppState.currentDeck.niceText,
              cardNumber: cardNumber,
              sign: "a",
            })
          : console.log("no pushToHistory");
        switchView
          .querySelector(`[data-card-number="${cardNumber}"]`)
          .scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
            container: "all",
          });
      } else {
        pushToHistory
          ? Nav.navToHistory("card", {
              deck_slug: AppState.currentDeck.slug,
              deck_niceText: AppState.currentDeck.niceText,
              cardNumber: "01",
              sign: "b",
            })
          : console.log("no pushToHistory");
      };
      AppState.currentCard = JSON.parse(
        switchView.querySelector(`[data-card-number="${cardNumber}"] .cardimg`)
          .dataset.cardData
      );
      //console.log('currentCard',currentCard.title);
    }
  },

};

export default Deck;
