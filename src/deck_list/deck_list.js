import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";
import Dialog from "../dialog/dialog.js";
import API from "../api/api.js";
import AppState from "../core/state.js";
import UI from "../ui/ui.js";
import Deck from "../deck/deck.js";

const DeckList = {

  /**
   * Ez kell egyáltalán?
   */
  async loadDeck_NO(slug) {
    //console.log('kártyák betöltése ('+slug+')')
    const res = await fetch(
      `${deckAPI}?action=getDeck&slug=${encodeURIComponent(slug)}`,
    );
    const json = await res.json();
    if (!json.success) {
      console.log("!json.success sajnos");
      console.log(json);
      return false;
    }
    let result = [];
    if (json.success) {
      //console.log('from loadDeck',json)
      json.data.cards.forEach((e) => {
        result.push({
          imageUrl: e.imageUrl,
          title: e.title,
        });
      });
      return result;
    }
  },

  async loadDecks() {
    Dev.Log(LT.DECKS, "Paklik listájának betöltése");
    try {
      const res = await fetch(`${API.deckAPI}?action=getDeckIndex`);
      const data = await res.json();

      if (!data.success) {
        console.log("!data.success sajnos");
        return false;
      }
      //console.log(data);
      AppState.decks = data.data;
      //console.log("decks", AppState.decks);
      Dev.Log(LT.DECKS, `Ezt kaptuk:`, data);
      Dev.Log(LT.DECKS, `decks:`, AppState.decks);

      /*
          
          const deckPromises = data.data.map((deck) => {
            // A loadDeck Promise-t ad vissza. Ez elkezdi a kártyák betöltését.
            const cardsPromise = loadDeck(deck.slug);

            // Visszaadunk egy objektumot, ami a deck adatai mellett a KÁRTYÁK PROMISE-át is tartalmazza.
            return {
              title: deck.niceText,
              image: deck.imageUrl,
              slug: deck.slug,
              cardsPromise: cardsPromise // A PROMISE-t tároljuk ideiglenesen
            };
          });

          // 2. Összegyűjtjük az összes kártya betöltésére vonatkozó Promise-t
          const card
          Promises = deckPromises.map(deck => deck.cardsPromise);

          // 3. Megvárjuk, hogy AZ ÖSSZES kártya betöltése befejeződjön.
          const resolvedCardsArrays = await Promise.all(cardLoadingPromises); 
          // A resolvedCardsArrays most egy tömb, ami a kártya tömböket tartalmazza.

          // 4. Kombináljuk az eredeti deck adatokat a feloldott kártya tömbökkel.
          decks = deckPromises.map((deck, index) => ({
            title: deck.title,
            image: deck.image,
            slug: deck.slug,
            // Az "index" megegyezik a Promise-ban lévő pozícióval
            cards: resolvedCardsArrays[index] 
          }));
          
          //console.log('minden pakli kártyája betöltve')

          */
      UI.initView("home", AppState.decks.length);

      AppState.decks.forEach((deck) => {
        if (deck.length === 0) return;
        const div = document.createElement("div");
        div.className = "card loading";

        const niceTextPara = document.createElement("p");
        niceTextPara.textContent = deck.niceText;
        div.appendChild(niceTextPara);

        const deckImg = document.createElement("img");
        deckImg.className = "deckimg";
        deckImg.setAttribute("src", deck.imageUrl);
        deckImg.setAttribute("alt", deck.niceText);
        deckImg.onload = function (event) {
          DeckList.handleImageLoad(this);
        };
        div.appendChild(deckImg);

        const protect = document.createElement("div");
        protect.className = "protect";
        div.appendChild(protect);

        /*div.innerHTML = `
              <p>${deck.niceText}</p>
              <img class="deckimg" src="${deck.imageUrl}" alt="${deck.niceText}" onload="this.handleImageLoad(this);">
              <div class="protect"></div>`;*/

        div.onclick = () => {
          UI.initView("switchView");
          switchView.querySelector("h2").textContent = "";
          Deck.openDeck(deck.slug, deck.niceText);
        };
        home.querySelector(".loader").setAttribute("style", "display:none");
        home.querySelector(".grid").appendChild(div);
      });
      // itt belemegy a napi minikihívás meg a kedvencek, ha lesz
      let favs = JSON.parse(localStorage.getItem("favs") || "[]");
      AppState.decks.push({
        slug: "favs",
        imageUrl: "",
        niceText: "Kedvencek",
        descLink: "",
        cards: favs,
      });
      let takeFive = JSON.parse(localStorage.getItem("takeFive") || "[]");
      AppState.decks.push({
        slug: "takeFive",
        imageUrl: "",
        niceText: "Napi Minikihívás",
        descLink: "",
        cards: takeFive,
      });
    } catch (err) {
      //alert("Hiba a deck-list betöltésénél.");
      Dialog.showDialog("Hiba a deck-list betöltésénél.");
      console.log(err);
    }
  },

  /**
   * Eltávolítja a 'loading' osztályt a kép szülőjéről.
   * Ezt a függvényt hívja meg az img tag onload eseménye.
   * @param {HTMLImageElement} imgElement - A betöltődött img elem.
   */
  handleImageLoad(imgElement) {
    // A this helyett most az átadott argumentumot (imgElement) használjuk.
    //const parentDiv = imgElement.parentNode;

    // A .closest() használata is működne, de a szülő (parentNode) is jó itt.
    const parentDiv = imgElement.closest(".loading");

    if (parentDiv && parentDiv.classList.contains("loading")) {
      parentDiv.classList.remove("loading");
      parentDiv.classList.add("loaded");
    }
  },

  takeFiveToDecks() {
    let takeFive = JSON.parse(localStorage.getItem("takeFive") || "[]");
    const index2 = AppState.decks.findIndex((deck) => {
      if (!deck.slug) {
        console.log("nincs ilyen tulajdonság!");
        return false;
      }
      return deck.slug === "takeFive";
    });
    if (index2 > -1) {
      AppState.decks[index2].cards = takeFive;
      if (switchView.querySelector("h2").textContent === "Napi Minikihívás") {
        UI.initView("switchView");
        switchView.querySelector("h2").textContent = "";
        Deck.openDeck("takeFive", "Napi Minikihívás");
      }
      /*if(favs.length == 0){
            switchView.querySelector(".grid").classList.remove('cardView');
          }*/
    }
    switchView.querySelector(".newTakeFive").disabled = false;
  },

  favsToDecks() {
    let favs = JSON.parse(localStorage.getItem("favs") || "[]");
    const index2 = AppState.decks.findIndex((deck) => {
      if (!deck.slug) {
        console.log("nincs ilyen tulajdonság!");
        return false;
      }
      return deck.slug === "favs";
    });
    if (index2 > -1) {
      AppState.decks[index2].cards = favs;
      if (switchView.querySelector("h2").textContent === "Kedvencek") {
        //UI.initView("switchView");
        switchView.querySelector("h2").textContent = "";
        Deck.openDeck("favs", "Kedvencek");
      }
      if (favs.length == 0) {
        console.log('favs.length',favs.length)
        switchView.querySelector(".grid").classList.remove("cardView");
      }
    }
  },
};

export default DeckList;
