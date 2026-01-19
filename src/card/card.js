import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";
import AppState from "../core/state.js";
import Deck from "../deck/deck.js";
import Nav from "../navigation/nav.js";
import DeckList from "../deck_list/deck_list.js";
import Dialog from "../dialog/dialog.js";

const Card = {
  fakeRandom() {
    if (AppState.currentDeck.cards.length > 0) {
      let k;
      let isCardView = switchView
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
          switchView.querySelector(".grid").classList.add("cardView");
          //navTo History('card',{deck:currentDeck.slug, cardNumber:k});
          Nav.navToHistory("card", {
            deck_slug: AppState.currentDeck.slug,
            deck_niceText: AppState.currentDeck.niceText,
            cardNumber: k,
            sign: "c",
          });
        }
        switchView.querySelector(`[data-card-number="${k}"]`).scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
          container: "all",
        });
        //showCard(currentDeck[randomNum]);
        AppState.currentStock.splice(randomNum, 1);
        AppState.currentWaste.push(randomNum);
        AppState.currentCard = JSON.parse(
          switchView.querySelector(`[data-card-number="${k}"] .cardimg`).dataset
            .cardData,
        );
      }
      console.log(
        k,
        AppState.currentStock.length,
        AppState.currentWaste.length,
      );
    } else {
      Dialog.showDialog("Előbb válassz ki kedvenc kártyákat!");
    }
  },

  /**
   * hozzáadás a kedvencekhez
   */
  addToFavs(event) {
    let favs = JSON.parse(localStorage.getItem("favs") || "[]");
    Dev.Log(LT.FAVS, 'addToFavs',favs);
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
    Dev.Log(LT.FAVS, 'favToTrash',favs);
    // megkeressük az indexét a kártyának a kedvencekben
    const index = favs.findIndex((fav) => {
      if (!fav.internalID || !AppState.currentCard.internalID) {
        console.log("nincs ilyen tulajdonság!");
        return false;
      }
      return fav.internalID === AppState.currentCard.internalID;
    });
    // ha megtaláltuk, és csak akkor, töröljük
    Dev.Log(LT.FAVS, 'index',index);
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
};
export default Card;
