import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";
import AppState from "../core/state.js";
import Deck from "../deck/deck.js";
import Nav from "../navigation/nav.js";
import DeckList from "../deck_list/deck_list.js";
import Dialog from "../dialog/dialog.js";
import DOM from "../dom/dom.js";
import { isLocal } from "../config/config.js";


const Card = {
  fakeRandom() {
    if (AppState.currentDeck.cards.length > 0) {
      let k;
      let isCardView = DOM.switchView
        .querySelector(".grid")
        .classList.contains("cardView");
      if (
        AppState.currentStock.length == 0 &&
        AppState.currentWaste.length == 0
      ) {
        AppState.currentStock = [
          ...Array(AppState.currentDeck.cards.length).keys(),
        ];
      }
      if (
        AppState.currentStock.length == 0 &&
        AppState.currentWaste.length == AppState.currentDeck.cards.length
      ) {
        //console.log('RESET(1)')
        AppState.currentStock = [
          ...Array(AppState.currentDeck.cards.length).keys(),
        ];
        AppState.currentWaste = [];

        // Ne dobja ki a random az aktuális kártyát!
        const index = AppState.currentDeck.cards.findIndex((card) => {
          if (!card.internalID || !AppState.currentCard.internalID) {
            //console.log('nincs ilyen tulajdonság!')
            return false;
          }
          return card.internalID === AppState.currentCard.internalID;
        });
        if (index > -1) {
          AppState.currentStock.splice(index, 1);
          AppState.currentWaste.push(index);
        }
      }

      if (AppState.currentStock.length > 0) {
        const randomNum = Math.floor(
          Math.random() * AppState.currentStock.length,
        );
        k = (AppState.currentStock[randomNum] + 1).toString();
        if (k < 10) {
          k = k.padStart(2, "0");
        }
        if (!isCardView) {
          DOM.switchView.querySelector(".grid").classList.add("cardView");
          //navTo History('card',{deck:currentDeck.slug, cardNumber:k});
        }
        DOM.switchView.querySelector(`[data-card-number="${k}"]`).scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
          container: "all", 
        });
        Nav.navToHistory("card", {
          deck_slug: AppState.currentDeck.slug,
          deck_niceText: AppState.currentDeck.niceText,
          cardNumber: k,
          sign: "c",
        });
        //showCard(currentDeck[randomNum]);
        AppState.currentStock.splice(randomNum, 1);
        AppState.currentWaste.push(randomNum);
        //AppState.currentCard = JSON.parse(
        //  DOM.switchView.querySelector(`[data-card-number="${k}"] .cardimg`).dataset
        //    .cardData,
        //);
        this.setCurrentCard(DOM.switchView.querySelector(`[data-card-number="${k}"]`), 'fakeRandom()');
      }
      Dev.log(
        LT.CARD,
        `${k} - Stock:${AppState.currentStock.length} Waste:${AppState.currentWaste.length},`,
      );
    } else {
      if( AppState.currentDeck.slug == 'favs'){
        Dialog.showDialog("Előbb válassz ki kedvenc kártyákat!");
      }else if(AppState.currentDeck.slug == 'takeFive'){
        Dialog.showDialog("Előbb kérj új leosztást!");
      }
    }
  },

  /**
   * hozzáadás a kedvencekhez
   */
  addToFavs(event) {
    let favs = JSON.parse(localStorage.getItem("favs") || "[]");
    Dev.log(LT.FAVS, "addToFavs", AppState.currentCard, favs);
    // NEM ellenőrizzük hogy már kedvenc-e!
    favs.push(AppState.currentCard);
    localStorage.setItem("favs", JSON.stringify(favs));
    //showDialog("Hozzáadva a kedvencekhez!", "blue", "Bezárás", "hide('cardView'); dialog.close();");
    event.target.closest(".fav-close").classList.add("show-trash");
    DeckList.favsToDecks();
  },

  /**
   * törlés a kedvencekből
   */
  favToTrash(event) {
    let favs = JSON.parse(localStorage.getItem("favs") || "[]");
    Dev.log(LT.FAVS, "favToTrash", AppState.currentCard, favs);
    // megkeressük az indexét a kártyának a kedvencekben
    const index = favs.findIndex((fav) => {
      if (!fav.internalID || !AppState.currentCard.internalID) {
        Dev.log(LT.FAVS, "favToTrash: nincs ilyen tulajdonság!");
        return false;
      }
      return fav.internalID === AppState.currentCard.internalID;
    });
    // ha megtaláltuk, és csak akkor, töröljük
    Dev.log(LT.FAVS, "index", index);
    if (index > -1) {
      favs.splice(index, 1); // 2nd parameter - csak egy elemet törlünk
      //showDialog("Törölve a kedvencekből!", "blue", "Bezárás", "hide('cardView'); dialog.close();");
      // Ha épp a kedvencekben vagyunk, újra kell renderelni

      // NÉZD ÁT
      /*if( currentDeckTitle === 'Kedvenc kártyáim' ){
            const grid = favView.querySelector(".grid");
            // újrarendereljük a kártyákat, már a törölt kártya nélkül
            grid.innerHTML = "";
            grid.setAttribute('class', `grid total${favs.length}`);
            favs.forEach((card) => {
              const div = document.createElement("div");
              div.className = "card";
              div.innerHTML = `
                <img src="${card.imageUrl}" alt="${card.title}">
                <div class="protect"></div>`;
              div.onclick = () => showCard(card);
              grid.appendChild(div);
            });
            // elrejtjük a kártyanézetet mert töröltük
            hide("cardView");
          }else{
            event.target.closest(".fav-close").classList.toggle('show-trash');
            //toolbar.classList.toggle('show-trash')
          }*/
    }
    localStorage.setItem("favs", JSON.stringify(favs));
    event.target.closest(".fav-close").classList.remove("show-trash");
    DeckList.favsToDecks();
  },
  prevCard(prevCardNumber,e){
    DOM.switchView.querySelector(`[data-card-number="${prevCardNumber}"]`).scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
      container: "all",
    });
    this.setCurrentCard(e.target.closest('.card').previousElementSibling, 'prev_card')
    //AppState.currentCard = AppState.currentDeck.cards[i - 2];
    //DOM.currentCard = e.target.closest('.card').previousElementSibling

    //Dev.log(LT.CARD, 'DOM.currentCard', DOM.currentCard)
    Nav.navToHistory("card", {
      deck_slug: AppState.currentDeck.slug,
      deck_niceText: AppState.currentDeck.niceText,
      cardNumber: prevCardNumber,
      sign: "prevC",
    });
  },
  nextCard(nextCardNumber,e){
    DOM.switchView.querySelector(`[data-card-number="${nextCardNumber}"]`).scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
      container: "all",
    });
    this.setCurrentCard(e.target.closest('.card').nextElementSibling, 'next card')
    //AppState.currentCard = AppState.currentDeck.cards[i];
    //DOM.currentCard = e.target.closest('.card').nextElementSibling
    //Dev.log(LT.CARD, 'DOM.currentCard', AppState.currentCard ,DOM.currentCard)
    Nav.navToHistory("card", {
      deck_slug: AppState.currentDeck.slug,
      deck_niceText: AppState.currentDeck.niceText,
      cardNumber: nextCardNumber,
      sign: "nextC",
    });
  },
  setCurrentCard(el, from){
    if(el === null){
      AppState.currentCard = {};
      DOM.currentCard = null;
      return;
    }
    DOM.currentCard = el;
    //AppState.currentCard = el.closest("[data-card-data]").dataset.cardData;
    AppState.currentCard = el.querySelector('.cardimg').dataset.cardData;
    Dev.log(LT.CARD, `setCurrentCard(): ${from}`, DOM.currentCard, AppState.currentCard)
  },
};

if(isLocal) window.Card = Card

export default Card;
