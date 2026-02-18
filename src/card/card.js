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
          console.log('cardView class added')
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
    document.querySelectorAll('.card.media').forEach((card)=>{
        this.unLoadVideo(card.querySelector('iframe'), null)
    })
    Object.keys(AppState.playerStates).forEach(id => {
      const state = AppState.playerStates[id];
      
      if (state.instance) {
        // Itt mégis kell a destroy, de csak nézetváltáskor!
        if (typeof state.instance.destroy === 'function') {
          try {
            state.instance.destroy();
          } catch (e) {
            // Ha már törlődött a DOM-ból, itt elkapjuk a hibát
            Dev.log(LT.CARD, 'Video Stop Error', {id}, {e})
          }
        }
        state.instance = null;
      }
    });
    if(el === null){
      AppState.currentCard = {};
      DOM.currentCard = null;
      return;
    }
    DOM.currentCard = el;
    const cardDataString = el.querySelector('.cardimg').dataset.cardData;
    AppState.currentCard = JSON.parse(cardDataString); // ✅ OBJECT
    Dev.log(LT.CARD, `setCurrentCard(): ${from}`, DOM.currentCard, AppState.currentCard)

  },
  loadVideo(iframe){
    const id = iframe.id
    const state = AppState.playerStates[id] || (AppState.playerStates[id] = { lastTime: 0 });
    const lastTime = state?.lastTime ?? 0;
    const startParam = lastTime > 0 ? `&start=${Math.floor(lastTime)}` : "";      
    //const startParam = state.lastTime > 0 ? `&start=${Math.floor(state.lastTime)}` : "";

    const src = `https://www.youtube.com/embed/${AppState.currentCard.mediaID}?enablejsapi=1${startParam}`      
    iframe.setAttribute("src",src)
    state.instance = new YT.Player(id, {
      events: {
        'onReady': (event) => {
            // Itt jelezhetjük, hogy a lejátszó készen áll
            state.isReady = true;
            // Opcionális: automatikus indítás kinyitáskor
            // event.target.playVideo();
        },
        'onStateChange': (event) => {
          // YT.PlayerState.ENDED értéke 0
          if (event.data === YT.PlayerState.ENDED) {
            event.target.seekTo(0); // Visszaugrik az elejére
            event.target.pauseVideo(); // Megállítja, mielőtt újraindulna
            state.lastTime = state.instance.getCurrentTime();
          }
          if (event.data === YT.PlayerState.PAUSED) {
            state.lastTime = state.instance.getCurrentTime();
          }
        }
      }
    });
    
  },
  unLoadVideo(iframe, target){
    const id = iframe.id
    const state = AppState.playerStates[id] || (AppState.playerStates[id] = { lastTime: 0 });
    
    /**
     * Ha nem a kártyán zárjuk be a videót, külön be kell zárni.
    */
    if(target === null && iframe.closest('details').hasAttribute('open')){
      //iframe.closest('details').querySelector('summary').click() BAAAD
      iframe.closest('details').open = false; 
      //iframe.closest('details').removeAttribute('open');
      //iframe.closest('details').toggleAttribute("open");
    }

    if (state.instance) {
      // Megnézzük, hogy az API már csatlakozott-e és van-e getCurrentTime metódusa
      if (typeof state.instance.getCurrentTime === 'function') {
        try {
          state.lastTime = state.instance.getCurrentTime();
        } catch (e) {
          console.log("Még nem lehetett lekérdezni az időt.");
        }
      }

      // A biztonságos törlés:
      //if (typeof state.instance.destroy === 'function') {
        // state.instance.destroy();
      //}
      
      state.instance = null; // Kiürítjük a referenciát
      state.isReady = false;
    }

    iframe.setAttribute("src","")
  }
};

if(isLocal) window.Card = Card

export default Card;
