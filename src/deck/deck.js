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
  isTraining: false,
  async openDeck(deck_slug, deck_niceText, appStateSource) {
    DOM.switchView.querySelector(".grid").setAttribute("id", deck_slug);
    if (deck_slug === DeckList.takeFive_base.slug) {
      // "takeFive"
      UI.toggleButton({
        parent: DOM.switchView.querySelector("#topActions"),
        action: "newTakeFive",
        config: {
          className: "orange",
          text: "Új leosztás",
        }
      })
    } else {
      UI.toggleButton({
        parent: DOM.switchView.querySelector("#topActions"),
        action: "newTakeFive",
        // no config -> DELETE
      })
    }
    if (deck_slug === DeckList.favs_base.slug) {
      // "favs"
      UI.toggleButton({
        parent: DOM.switchView.querySelector("#topActions"), 
        action: "removeFav",
        config: {
          className: "red",
          text: "Kedvencek törlése",
        },
      })
    } else {
      UI.toggleButton({
        parent: DOM.switchView.querySelector("#topActions"), 
        action: "removeFav",
        // no config -> DELETE
      })
    }
    // Ez itt kell?
    UI.toggleButton({
      parent: DOM.switchView.querySelector("#topActions"),
      action: "loadDesc"
      // no config -> DELETE
    })

    // nézzük meg a decks objektumot, nincs e már benne,
    // ha benne van ne töltsük be újra, hanem dolgozzunk abból,
    // ha nincs benne töltsük be, mentsük a decksbe és dolgozzunk abból.

    /*const downloaded = AppState.decks.some((deck) => {
      return deck.slug === deck_slug && deck.hasOwnProperty("cards");
    });*/

    //console.log("downloaded", downloaded);
    /*Dev.log(LT.DECK, `A pakli le van töltve? >${downloaded}< (downloaded)`);*/
    //hideAll("deckView");
    UI.hideAll("switchView");
    Nav.navToHistory("deck", {
      deck_slug: deck_slug,
      deck_niceText: deck_niceText,
    });
    const index = appStateSource.findIndex((deck) => deck.slug === deck_slug);
    /*if (!downloaded) {
      try {
        Dev.log(LT.API, `❗❗ Már le kéne legyen töltve! >:( (${deck_slug})`);
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
             * Válasz: Mert a deck objektum több property-t tartalmaz, te csak a cards-ot akarod frissíteni.
             *//*
            AppState.decks[index].cards = deck.cards;
          }
        }
      } catch (err) {
        Dev.log(LT.DECKS, new Error("Hiba a deck megnyitásánál"), { err });
        //Dialog.showDialog(
        //  'Hiba a kártyák lekérésénél, próbáld meg újra az "Új leosztás\n gombbal.',
        //);
      }
    }*/

    // desclink gomb beillesztése/eltávolítása
    //const dlink = AppState.decks[index].descLink;
    //Dev.log(LT.DECK, "descLink", dlink, typeof dlink);

    if (appStateSource[index] 
      &&
      appStateSource[index].descLink !== "") {
      const elementExists = DOM.switchView.querySelectorAll(
        '[data-action="loadDesc"]',
      );
      if (elementExists.length === 0) {
        UI.toggleButton({
          parent: DOM.switchView.querySelector("#topActions"),
          action: "loadDesc",
          config: {
            className: "blue",
            text: "Leírás",
          }
        })
      }
    } else if (appStateSource[index].descLink === "") {
      UI.toggleButton({
        parent: DOM.switchView.querySelector("#topActions"),
        action: "loadDesc",
        // no config -> DELETE
      })
    }

    UI.initView("switchView", appStateSource[index].cards.length);

    AppState.currentDeck = appStateSource[index];
    AppState.currentStock = [];
    AppState.currentWaste = [];

      Dev.log(LT.TRAINING, `...selectedTrainingDay_2 ${AppState.trainingStates[AppState.currentDeck.slug]}`)

    if( AppState.currentDeck.cards[0].hasOwnProperty("day") ){
      const max = AppState.currentDeck.cards.reduce((acc, val) => {
        return acc.day > val ? acc.day : val;
      });
      AppState.currentDeck.trainingDaysMax = max.day;
      this.isTraining = (max.day > 0)
      Dev.log(LT.TRAINING, 'TRAINING! DAYS:', max.day)
    }else{
      this.isTraining = false
      AppState.currentDeck.trainingDaysMax = 0;
      Dev.log(LT.TRAINING, 'NOT TRAINING!')
    }

    if( this.isTraining ){
      const selectHolder = document.createElement('div')
      selectHolder.className = "daySelectDiv"
      const prevButton = document.createElement('button')
      //prevButton.setAttribute("onClick","prev()")
      prevButton.className = "red"
      prevButton.innerText = "< Előző"
      prevButton.dataset.action = "prev-day"
      const nextButton = document.createElement('button')
      //nextButton.setAttribute("onClick","next()")
      nextButton.className = "green"
      nextButton.innerText = "Következő >"
      nextButton.dataset.action = "next-day"
      const label = document.createElement("label")
      label.setAttribute("for","daySelect")
      label.innerText = "Alkalom: "
      const select = document.createElement("select")
      select.dataset.day = "day"
      select.className ="daySelect"
      for(let i = 1 ; i <= AppState.currentDeck.trainingDaysMax; i++){
        const option = document.createElement('option')
        if(AppState.trainingStates[AppState.currentDeck.slug]
          &&
          i == AppState.trainingStates[AppState.currentDeck.slug]
        ){
          option.selected = true
        }
        option.setAttribute("value", i)
        option.innerText = `${i}. nap`
        select.appendChild(option)
      }
      selectHolder.appendChild(prevButton)
      selectHolder.appendChild(label)
      selectHolder.appendChild(select)
      selectHolder.appendChild(nextButton)

      if(!DOM.switchView.querySelector(".daySelectDiv")){
        DOM.switchView.querySelector(".grid").parentNode.insertBefore(selectHolder, DOM.switchView.querySelector(".grid"))
      }

      if(!AppState.trainingStates[AppState.currentDeck.slug]){
        AppState.trainingStates[AppState.currentDeck.slug] = 1
      }
    }else if( document.querySelector('.daySelectDiv') ){
      document.querySelector('.daySelectDiv')
      .parentNode
      .removeChild(document.querySelector('.daySelectDiv'))
      Dev.log(LT.TRAINING, 'SELECT REMOVED')
    }

    


    /*<div class="daySelectDiv">
  <button onclick="prev()" class="red">Prev</button>
  <label for="daySelect">Alkalom: </label>
  <select class="daySelect"> 
    <option value="1" selected>1</option>  
    <option value="2">2</option>*/

    //DOM.switchView.querySelector("h2").textContent = deck_niceText;
    const heading = DOM.switchView.querySelector("h2");
    // Tisztítsuk meg az elemet 
    heading.textContent = '';
    // Csomópontok létrehozása és hozzáadása
    heading.append(
      document.createTextNode(deck_niceText),
    );

    let subtitle_added = false


    // kedvencekben van-e? megállapításához
    let favs = JSON.parse(localStorage.getItem("favs") || "[]");

    Dev.log(LT.DECK, `create >deck< DOM elements (cards)`);

    if (deck_slug === "takeFive" && AppState.currentDeck.cards.length === 0) {
      Deck.newTakeFive();
    }

    for (let i = 1; i <= AppState.currentDeck.cards.length; i++) {
      let cardIndex = i - 1;
      Dev.log(LT.TRAINING, 'DEBUG',
        {isTraining: this.isTraining},
        {x: AppState.currentDeck.cards[cardIndex].day},
        {y: AppState.trainingStates[AppState.currentDeck.slug]}
      )

      if(

        (this.isTraining 
        && 
        AppState.currentDeck.cards[cardIndex].day == AppState.trainingStates[AppState.currentDeck.slug]) 
        || 
        !this.isTraining
      ){
        Dev.log(LT.TRAINING, `isTraining ${this.isTraining}`)

        if(!subtitle_added 
          && AppState.currentDeck.cards[cardIndex].hasOwnProperty('dayName') 
          && AppState.currentDeck.cards[cardIndex].dayName != ''){
          heading.append(
            document.createElement("br"),
            document.createTextNode(AppState.currentDeck.cards[cardIndex].dayName)
          );
          subtitle_added = true
        }

        let cardNumber = i.toString();
        if (cardNumber < 10) {
          cardNumber = cardNumber.padStart(2, "0");
        }
        const cardData = AppState.currentDeck.cards[cardIndex];
        const cardHolder = document.createElement("div");
        cardHolder.dataset.cardNumber = cardNumber;
        cardHolder.className = "card loading";
        if(AppState.currentDeck.cards[cardIndex].mediaID !== ''){
          cardHolder.classList.add("media")
        }

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
        
        let mediaHolder = '' 
        if(AppState.currentDeck.cards[cardIndex].mediaID !== ''){
          mediaHolder = document.createElement('div')
          mediaHolder.className = "media-holder"
          const details = document.createElement('details')
          const summary = document.createElement('summary')
          summary.setAttribute("aria-label",`Play video: ${AppState.currentDeck.cards[cardIndex].mediaID}`)

          const svgPlay = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          svgPlay.setAttribute("class","play-circle")
          svgPlay.setAttribute("xmlns","http://www.w3.org/2000/svg")
          svgPlay.setAttribute("height","48px")
          svgPlay.setAttributeNS(null, "viewBox","0 -960 960 960")
          svgPlay.setAttribute("width","48px")
          svgPlay.setAttribute("fill","#1f1f1f")  
          svgPlay.dataset.action = "mediaPlay"
          const pathPlay = document.createElementNS("http://www.w3.org/2000/svg", 'path')
          pathPlay.setAttribute("d","m383-310 267-170-267-170v340Zm97 230q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z")
          svgPlay.appendChild(pathPlay)
          summary.appendChild(svgPlay)
          
          const svgCancel = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          svgCancel.setAttribute("class","cancel-circle")
          svgCancel.setAttribute("xmlns","http://www.w3.org/2000/svg")
          svgCancel.setAttribute("height","48px")
          svgCancel.setAttributeNS(null, "viewBox","0 -960 960 960")
          svgCancel.setAttribute("width","48px")
          svgCancel.setAttribute("fill","#1f1f1f")  
          svgCancel.dataset.action = "mediaCancel"
          const pathCancel = document.createElementNS("http://www.w3.org/2000/svg", 'path')
          pathCancel.setAttribute("d","m330-288 150-150 150 150 42-42-150-150 150-150-42-42-150 150-150-150-42 42 150 150-150 150 42 42ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z")
          svgCancel.appendChild(pathCancel)
          summary.appendChild(svgCancel)
          details.appendChild(summary) 

          const iframe = document.createElement('iframe')
          iframe.setAttribute("id", AppState.currentDeck.cards[cardIndex].mediaID)
          iframe.setAttribute("src", "")
          iframe.setAttribute("frameborder", "0")
          iframe.setAttribute("title", AppState.currentDeck.cards[cardIndex].mediaTitle)
          iframe.setAttribute("allow","accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture")
          iframe.setAttribute("allowfullscreen","true")
          iframe.setAttribute("autoplay","true")
          iframe.setAttribute("referrerpolicy","strict-origin-when-cross-origin")
          details.appendChild(iframe)
          mediaHolder.appendChild(details)
          // iframe.setAttribute("","")
          // `https://www.youtube.com/embed/${AppState.currentDeck.cards[cardIndex].mediaID}?enablejsapi=1`
        }

        const protect = document.createElement("div");
        protect.className = "protect";
        cardBottom.appendChild(protect);
        cardBottom.appendChild(cardImg);
        if(AppState.currentDeck.cards[cardIndex].mediaID !== ''){
          cardBottom.appendChild(mediaHolder);
        }
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
    caller = 'unknown'
  }) {
    Dev.log(LT.CARD, 'showCardNew caller',{caller})
    if (!cardNumber) Dev.log(LT.DECK, new Error("cardNumber"), { cardNumber });
    if (DOM.switchView.querySelector(".grid").classList.contains("cardView")) {
      //console.log('showCardNew remove .cardView')
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
      //console.log('showCardNew add .cardView')
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
  /*removeRemoveFavButton() {
    const elementExists = DOM.switchView.querySelectorAll(
      '[data-action="removeFav"]',
    );
    if (elementExists.length > 0) {
      elementExists.forEach((el) => {
        el.remove();
      });
    }
  },*/
  async newTakeFive() {
    Dev.log(LT.EVENT, `newTakeFive.onclick`);
    DOM.switchView.querySelector('[data-action="newTakeFive"]').disabled = true;
    let takeFive = JSON.parse(localStorage.getItem("takeFive") || "[]");
    UI.initView("switchView", takeFive.length);
    try {
      Dev.log(LT.AUTH, "deckAPI/getRandomCards");
      const res = await fetch(`${API.deckAPI}?action=getRandomCards&count=5`);
      const json = await res.json();
      Dev.log(LT.TAKEFIVE, "takeFive JSON:", json);
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
  /*addNewTake5Button() {
    const newTake5Button = document.createElement("button");
    newTake5Button.className = "orange";
    //descButton.className = "blue description";
    //descButton.setAttribute("id", "description2");
    newTake5Button.innerText = "Új leosztás";
    newTake5Button.dataset.action = "newTakeFive";
    DOM.switchView.querySelector("#topActions").appendChild(newTake5Button);
  },*/
  /*removeNewTake5Buttons() {
    const elementExists = switchView.querySelectorAll(
      '[data-action="newTakeFive"]',
    );
    if (elementExists.length > 0) {
      elementExists.forEach((el) => {
        el.remove();
      });
    }
  },*/
  openTakeFive() {
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

  disableButton(){
    const selectDiv = document.querySelector(".daySelectDiv")
    const select = selectDiv.querySelector(".daySelect")
    const prevDay = selectDiv.querySelector('[data-action="prev-day"]')
    const nextDay = selectDiv.querySelector('[data-action="next-day"]')
    // Ha az első elemnél vagyunk (index 0), a Prev gomb tiltva van
    prevDay.disabled = (select.selectedIndex === 0);
    
    // Ha az utolsó elemnél vagyunk, a Next gomb tiltva van
    nextDay.disabled = (select.selectedIndex === select.options.length - 1);
    }
};

if (isLocal) window.Deck = Deck;

export default Deck;
