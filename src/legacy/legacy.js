      const deckAPI = "https://script.google.com/macros/s/AKfycbz52MID0rSzmTDfeSibWaLIkfExme9GArSrc_AZyi8Q7iuo0oR9WAds-H1miyRyHb5rHA/exec";

      const accessAPI = "https://script.google.com/macros/s/AKfycbx2wKd2HxYyAEpzt93hi7PJLXSXdZr4okKp0LfkHVQ9zNqT8ZFEFgLRnQJBivnjj3nINg/exec"
      
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
      
      const emailField = document.querySelector('#email')
      const passwordField = document.querySelector('#password')
      //const timeZoneField = document.getElementById('user-timezone')
      const loginBtn = document.querySelector('#loginBtn')
      const loginError = document.querySelector("#loginError")

      //const toolbar = document.querySelector('.fav-close');
      const dialog = document.getElementById('dialogView');

      let userEmail = "";
      let decks = [];
      let currentDeck = [];
      let currentDeckSlug = '';
      let currentCard = {};
      let currentStock = [];
      let currentWaste = [];
      let currentDeckTitle = '';
      
      const home = document.getElementById('home')
      //const deckView = document.getElementById('deckView')
      //const dailyView = document.getElementById('dailyView')
      //const favView = document.getElementById('favView')
      const switchView = document.getElementById('switchView')
      //const cardView = document.getElementById('cardView')
    
      
      const NAV_STACK_VALUES = {
        CONFIRM: ['confirm'],
        LOGIN: ['confirm','login'],
        HOME: ['confirm','home'],
        DECK: ['confirm','home','deck'],
        CARD: ['confirm','home','deck','card']
      };
      let currentHistoryIndex = -1;
      let newHistoryIndex = 0;
      let navigationStack = ['confirm'];
      navToHistory( 'confirm', {index:currentHistoryIndex, stack:'confirm'} )
      
      /*
      {
        "internalID": "10001",
          "imageUrl": "https://blogger.googleusercontent.com/img/...",
            "title": "Ismerd fel!",
              "tags": [
                "memorizálás",
                "tipp"
              ],
                "level": 1
      }
      */

      
      
      function navToHistory( stack, data ){
        navigationStack = NAV_STACK_VALUES[stack]
        data.index = (window.history.state?.index ?? 0) + 1;
        data.stack = stack;
        window.history.pushState(data, '', window.location.href);
        currentHistoryIndex = data.index;
        console.log('push! ' + JSON.stringify(window.history.state))
      }

      /**********************
       * AUTOMATIKUS BELÉPTETÉS
       * tryAutoLogin() hívásával
       **********************/
      document.addEventListener('DOMContentLoaded', async () => {
        [emailField,passwordField,loginBtn].forEach((e) => { e.disabled = true; })
        navToHistory('login',{})
        //timeZoneField.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
        loginError.textContent = "\u231B Bejelentkezés ellenőrzése...";
        loadDecks(); // gyorsabb ha már most
        //console.log('bejelentkezés ellenőrzése')
        const ok = await tryAutoLogin();
        if (ok) {
          // már be vagyunk lépve, tölthetjük a deckek listáját
          hideAll("home"); // vagy ami nálatok a főnézet
          navToHistory('home',{})
          //loadDecks();
          console.log('decks betöltve?', decks.length > 0)
        } else {
          // mutasd a login modalt/formot
          [emailField,passwordField,loginBtn].forEach((e) => { e.disabled = false; })
          hideAll("login");
          navToHistory('login',{})
          decks = [];
        }
        
        // 1. Belépéskor hozzáadunk egy extra állapotot
        /*window.history.replaceState({ step: 'confirm' }, "");
        whatState()
        window.history.replaceState({ step: 'home' }, "");
        whatState()*/


        window.onpopstate = function (event) {
          if(!event.state || !event.state.index) return;
          console.log(
            `state: ${JSON.stringify(event.state)}\n`,`currentHistoryIndex: ${currentHistoryIndex}`
          )
          if(event.state.index < currentHistoryIndex){
          	console.log('Hátra');
          }else{
          	console.log('Előre');
          }
          currentHistoryIndex = event.state.index;
          console.log(event.state.stack);
          const actions = {
            'confirm': () => {
              //console.log(`X ${event.state.stack}`)
              let dialogButton1 = { 
                text: 'Igen', 
                onclick: function() { 
                  navToHistory('login',{}) // forward stack levágása
                  dialog.close();
                  window.history.go(-3); // Tényleges kilépés az előzményekből
                } 
              };
              let dialogButton2 = { 
                text: 'Nem', 
                onclick: function() { 
                  // Visszaugrunk a HOME-ra, hogy legyen hova újra visszalépni
                  //window.history.replaceState({ step: 'home' }, ""); 
                  dialog.close(); 
                } 
              };

            showDialog("El akarod hagyni az alkalmazást?", [dialogButton1, dialogButton2]);
            },
            'login': () => {
              //console.log(`X ${event.state.stack}`)
              hideAll('login')
              dialog.close();
            },
            'home': () => {
              //console.log(`X ${event.state.stack}`);
              backHome(false);
            },
            'deck': () => {
              //console.log(`X ${JSON.stringify(event.state)}`);
              //ha nincs megnyitva a pakli
              if(currentDeck.slug !== event.state.deck_slug){
                initView('switchView')
                switchView.querySelector("h2").textContent = '';
                console.log('deckA '+currentDeck.slug,event.state.deck_slug)
                openDeck(event.state.deck_slug, event.state.niceText);
              }else{
                console.log('deckB ')
                hideAll('switchView');
                if(switchView.querySelector('.grid').classList.contains('cardView')){
                  switchView.querySelector('.grid').classList.remove('cardView');
                }
              }
            },
            'card': () => {
              //console.log(`X ${JSON.stringify(event.state)}`);
              //ha nincs megnyitva a pakli
              if(currentDeck.slug !== event.state.deck_slug){
                initView('switchView')
                switchView.querySelector("h2").textContent = '';
                console.log('cardA '+currentDeck.slug,event.state.deck_slug)
                openDeck(event.state.deck_slug,event.state.niceText);
              }else{
                console.log('cardB ')
                hideAll('switchView');
                // ha nincs kártya megnyitva
                if(!switchView.querySelector('.grid').classList.contains('cardView')){
                  console.log('cardB A')
                  //switchView.querySelector('.grid').classList.add('cardView');
                  showCardNew({pushToHistory: false, cardNumber: event.state.cardNumber/*, cardData:cardData*/});
                }else{
                  console.log('cardB B')
                  switchView.querySelector(`[data-card-number="${event.state.cardNumber}"]`).scrollIntoView({ behavior: "smooth", block: "center", inline: "center", container: "all" });
                }
              }
            }
          };
          actions[event.state.stack]();

          /*const step = event.state ? event.state.step : null;

          console.log("Megérkeztünk ide:", step, window.history.state.step);

          if (!step || step === 'confirm') {
            // Ha a confirm-re értünk (tehát a HOME-ról léptünk vissza)

            

          } else if (step === 'home') {
            // A DECK-ről léptünk vissza a HOME-ra
            console.log("Vissza a listához");
            backHome(true); // Ez jeleníti meg a listát és rejti el a paklit

          } else if (step === 'deck') {
            // A kártyáról (amit te nem teszel a history-ba külön) léptünk vissza a DECK-re
            // VAGY az 'előre' gombbal jöttünk ide a Home-ról.
            console.log("Vissza a paklihoz");
            showCardNew(true); // Ez rejti el a kártyát és mutatja a paklit
          }*/
        };
      });
      
      /**********************
       * tryAutoLogin()
       * RETURN: boolean
       **********************/
      async function tryAutoLogin() {
        const token = localStorage.getItem(TOKEN_KEY);
        const exp = Number(localStorage.getItem(TOKEN_EXP_KEY) || 0);
        const now = Date.now();

        if (!token || !exp || now > exp) {
          // nincs vagy lejárt token → marad a login UI
          loginError.textContent = "\u2757 Bejelentkezés szükséges";
          await new Promise(resolve => setTimeout(resolve, 1000));
          return false;
        }

        try {
          const res = await fetch(
            `${accessAPI}?action=verifyToken&token=${encodeURIComponent(token)}`
          );

          const json = await res.json();
          if (json.success && json.data && json.data.valid) {
            // token érvényes → user be van lépve
            loginError.textContent = "\u2714\uFE0F Bejelentkezve";
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
          } else {
            // invalid/expired → töröljük
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(TOKEN_EXP_KEY);
            console.log( json.data.error );
            loginError.textContent = "\u2757 Bejelentkezés szükséges";
            await new Promise(resolve => setTimeout(resolve, 1000));
            return false;
          }
        } catch (e) {
          console.error('verifyToken error', e);
          loginError.textContent = "\u2757 Bejelentkezés szükséges";
          await new Promise(resolve => setTimeout(resolve, 1000));
          return false;
        }
      }
      
      /**********************************
       * EGYES RÉTEGEK MUTATÁSA/ELREJTÉSE
       * show(), hide(), hideAll()
       **********************************/
      function show(elem) {
        document.getElementById(elem).style.display = "block";
      }
      function hide(elem) {
        document.getElementById(elem).style.display = "none";
      }
      function hideAll(except = undefined) {
        document.querySelectorAll('.view').forEach((elem) => {
          hide(elem.getAttribute('id'));
        })
        if(except) show(except);
      }
      
      /**************************
       * DIALOG (alert() HELYETT)
       * showDialog()
       **************************/
      function showDialog(message, buttons = []) {
        // 1. Alaphelyzet: töröljük a korábbi gombokat a separator után
        // Feltételezzük, hogy a gombok a .separator.bottom után vannak
        const separator = dialog.querySelector(".separator.bottom");

        // Minden gombot eltávolítunk, ami a separator után van
        let nextSibling = separator.nextElementSibling;
        while (nextSibling) {
          let toRemove = nextSibling;
          nextSibling = nextSibling.nextElementSibling;
          toRemove.remove();
        }

        // 2. Üzenet beállítása
        dialog.querySelector("p").textContent = message;

        // 3. Új gombok létrehozása a tömbből
        buttons.forEach(btnConfig => {
          const button = document.createElement('button');
          button.textContent = btnConfig.text || 'Gomb';

          // Osztály beállítása (alapértelmezett a 'blue')
          button.className = btnConfig.class || 'blue';

          // Eseménykezelő hozzáadása
          if (typeof btnConfig.onclick === 'function') {
            button.addEventListener('click', () => {
              btnConfig.onclick();
              // Opcionális: a gomb megnyomása után zárjuk be a dialógust?
              // dialog.close(); 
            });
          }

          // Gomb hozzáadása a DOM-hoz
          separator.after(button);
        });

        dialog.showModal();
      }

      /************************************
       * checkLogin()
       * token + lejárat a localStorage-ben
       ************************************/
      const TOKEN_KEY = 'ele_cards_token';
      const TOKEN_EXP_KEY = 'ele_cards_token_exp';

      async function checkLogin(email, password, timeZone) {
        
        try {
          const res = await fetch(
            `${accessAPI}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&clientTimeZone=${encodeURIComponent(timeZone)}`
          );

          const json = await res.json();
          console.log(json)

          if (!json.success) {
            console.warn('login failed:', json.error);
            switch(json.error) {
            case "Subscription expired":
                document.getElementById("loginError").textContent = "\u274C Sajnáljuk, az előfizetésed lejárt.";
              break;
            case "Invalid expire date":
                document.getElementById("loginError").textContent = "\u274C Adatbázis hiba történt a dátummal. Már értesítettük a rendszergazdát!";
              break;
            case "Invalid email or password": 
                document.getElementById("loginError").textContent = "\u274C Helytelen e-mail cím vagy jelszó.";
              break;
            case "Missing email or password": 
                document.getElementById("loginError").textContent = "\u274C Hiányzó e-mail cím vagy jelszó.";
              break;
            default:
              showNotification("Ismeretlen hiba történt: " + json.error);
          }

            return false;
          }

          const { token, expiredAt } = json.data || {};
          if (!token) return false;

          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(TOKEN_EXP_KEY, String(expiredAt));

          return true;
        } catch (err) {
          console.error('login error', err);
          return false;
        }
      }
      
      /*******************************
       * PASSWORD SZÖVEGMEZŐ FELFEDÉSE
       *******************************/
      function showPass() {
        var x = document.getElementById("password");
        if (x.type === "password") {
          x.type = "text";
        } else {
          x.type = "password";
        }
      }
      
      /*******************************
       * KATTINTÁS: BEJELENTKEZÉS GOMB
       *******************************/
      loginBtn.onclick = async (event) => {
        event.preventDefault();
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
        const allowed = await checkLogin(email, password, timeZone);
        if (allowed) {
          userEmail = email;
          //hide("login");
          hideAll("home");
          navToHistory('home',{})
        } else {
          navToHistory('login',{})
          // A response hibaüzeneteit a checkLogin() kezeli!
          //document.getElementById("loginError").textContent =
          //  "\u274C Helytelen email vagy jelszó.";
        }
      };
      
      /*******************************
       * KATTINTÁS: KIJELENTKEZÉS GOMB
       *******************************/
      document.getElementById("logOut").onclick = async (e) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if(token){
          try {
            const res = await fetch(
              `${accessAPI}?action=logout&token=${encodeURIComponent(token)}`
            );
            
            const json = await res.json();
            if (!json.success) {
              console.error('logout API hiba:', json.error);
            }
          } catch (err) {
            console.error('logout API hiba', err);
          }
        }
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXP_KEY);
        [emailField,passwordField,loginBtn].forEach((e) => { e.disabled = false; });
        [emailField,passwordField].forEach((e) => { e.value = ''; });
        loginError.textContent = "\u2714\uFE0F  Kijelentkezés sikeres";
        hideAll('login');
        navToHistory('login',{})
      };
      
      
      
      /* 
      csak switchView esetén használandó
      */
      function initView(id, length = undefined){
        const view = document.getElementById(id);
        const grid = view.querySelector(".grid");
        const loader = view.querySelector(".loader");
        loader.removeAttribute('style');
        //grid.innerHTML = "";
        while (grid.firstChild) {
          grid.removeChild(grid.lastChild);
        }
        if(length){
          grid.className = "grid";
          grid.classList.add(`total${length}`)
        };
      }

       /********************************************
       * PAKLI LETÖLTÉSE, loadDecks() SEGÉDFÜGGVÉNYE
       ********************************************/
      async function loadDeck(slug){
        //console.log('kártyák betöltése ('+slug+')')
        const res = await fetch(`${deckAPI}?action=getDeck&slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (!json.success) {
          console.log("!json.success sajnos")
          console.log(json)
          return false;
        }
        let result = []
        if (json.success) {
          //console.log('from loadDeck',json)
          json.data.cards.forEach((e) => {
            result.push({
              imageUrl:e.imageUrl,
              title: e.title, 
            })
          })
          return result
        }
      }
      
      
      /*******************************
       * PAKLIK LISTÁJÁNAK BETÖLTÉSE
       *******************************/
      async function loadDecks() {
        console.log('Paklik listájának betöltése')
        try {
          const res = await fetch(`${deckAPI}?action=getDeckIndex`);
          const data = await res.json();
          
          if (!data.success) {
            console.log("!data.success sajnos")
            return false;
          }
          console.log(data)
          decks = data.data
          console.log('decks',decks)

          
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
          initView('home', decks.length)
          
          decks.forEach((deck) => {
            if (deck.length === 0) return;
            const div = document.createElement("div");
            div.className = "card loading";
            div.innerHTML = `
              <p>${deck.niceText}</p>
              <img class="deckimg" src="${deck.imageUrl}" alt="${deck.niceText}" onload="handleImageLoad(this);">
              <div class="protect"></div>`;
            div.onclick = () => {
              initView('switchView')
              switchView.querySelector("h2").textContent = '';
              openDeck(deck.slug,deck.niceText);
            }
            home.querySelector('.loader').setAttribute('style','display:none');
            home.querySelector('.grid').appendChild(div);
          });
          // itt belemegy a napi minikihívás meg a kedvencek, ha lesz
          let favs = JSON.parse(localStorage.getItem("favs") || "[]");
          decks.push({
            "slug": "favs",
            "imageUrl": "",
            "niceText": "Kedvencek",
            "descLink": "",
            "cards": favs
          })
          let takeFive = JSON.parse(localStorage.getItem("takeFive") || "[]");
          decks.push({
            "slug": "takeFive",
            "imageUrl": "",
            "niceText": "Napi Minikihívás",
            "descLink": "",
            "cards": takeFive
          })
          
        } catch (err) {
          //alert("Hiba a deck-list betöltésénél.");
          showDialog("Hiba a deck-list betöltésénél.");
          console.log(err);
        }
      }

      /********************************
       * PAKLI BETÖLTÉSE GRIDBE, API-BÓL
       ********************************/
      async function openDeck(deck_slug,deck_niceText) {
        //currentDeckSlug = deck_slug;
        switchView.querySelector('.grid').setAttribute('id', deck_slug);
        if(deck_slug === 'takeFive'){
          switchView.querySelector('.newTakeFive').removeAttribute('style')
        }else{
          switchView.querySelector('.newTakeFive').setAttribute('style','display: none;')
        }
        if(deck_slug === 'favs'){
          switchView.querySelector('.removeFav').removeAttribute('style')
        }else{
          switchView.querySelector('.removeFav').setAttribute('style','display: none;')
        }
        switchView.querySelector('.description').setAttribute('style','display: none;')
        
        // nézzük meg a decks objektumot, nincs e már benne,
        // ha benne van ne töltsük be újra, hanem dolgozzunk abból,
        // ha nincs benne töltsük be, mentsük a decksbe és dolgozzunk abból.
        const downloaded = decks.some(
          deck => {
            //if(deck.slug !== deck_slug){console.log('-slug',deck.slug,deck_slug)}
            //else{console.log('+slug',deck.slug,deck_slug)}
            //if(deck.hasOwnProperty('cards')){console.log('van cards')}
            return deck.slug === deck_slug && deck.hasOwnProperty('cards')
          }
        );
        console.log('downloaded',downloaded)
        //hideAll("deckView");
        hideAll("switchView");
        navToHistory('deck',{deck_slug:deck_slug, deck_niceText:deck_niceText})      
        const index = decks.findIndex(deck => deck.slug === deck_slug);
        if(!downloaded){
          const res = await fetch(`${deckAPI}?action=getDeck&slug=${encodeURIComponent(deck_slug)}`);
          const json = await res.json();
          if (!json.success) {
            console.log("!json.success sajnos")
            return false;
          }
          if (json.success) {
            const deck = json.data;
            console.log('deck',deck)
            if( index > -1 ){
              decks[index].cards = deck.cards;
              console.log('decks',decks)
              if(decks[index].descLink !== ''){
                switchView.querySelector('.description').removeAttribute('style')
                switchView.querySelector('.description').onclick = () => {window.open(decks[index].descLink, '_blank')}
              }
            }
          }
        }
        
        initView('switchView', decks[index].cards.length)
        //window.history.replaceState({ step: 'deck' }, "");
        //whatState()
        console.log('openDeck pushState: deck')
        
        //currentDeck = decks[index].cards;
        currentDeck = decks[index];
        currentStock = [];
        currentWaste = [];

        switchView.querySelector("h2").textContent = deck_niceText;
        //currentDeckTitle = deck_niceText;
        currentDeckTitle = currentDeck.niceText;

        for(let i=1; i <= currentDeck.cards.length; i++){
          let j = i.toString();
          if (j < 10) {
            j = j.padStart(2, "0");
          }
          const cardData = currentDeck.cards[i-1];
          //console.log('x',cardData);
          const cardHolder = document.createElement("div");
          cardHolder.dataset.cardNumber = j;
          cardHolder.className = "card loading";
          cardHolder.innerHTML = `
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
                  <img class="cardimg" src="${cardData.imageUrl}" alt="${cardData.title}" data-card-data="${JSON.stringify(cardData).replace(/"/g, '&quot;')}" onload="handleImageLoad(this);">
                  <div class="protect"></div>
      </div>
      </div>
          	<div class="next">
      </div>
            `;
          cardHolder.querySelector('.cardBottom').onclick = () => {
            showCardNew({pushToHistory: true, cardNumber: j/*, cardData:cardData*/});
            console.log('showCardNew', j);
          }
          if(i > 1 && !isTouchDevice){
            cardHolder.querySelector('.prev').classList.add('on');
            let k = (i-1).toString(); 
            if (k < 10) { k = k.padStart(2, "0"); }
            cardHolder.querySelector('.prev').onclick = (e) => {
              switchView.querySelector(`[data-card-number="${k}"]`).scrollIntoView({ behavior: "smooth", block: "center", inline: "center", container: "all" });
              currentCard = currentDeck.cards[i-2]
              navToHistory('card',{deck_slug:currentDeck.slug,deck_niceText:currentDeck.niceText, cardNumber:k, sign: 'prevC'});
              //console.log('currentCard',currentCard.title)
            }
          }
          if(i < currentDeck.cards.length && !isTouchDevice){
            cardHolder.querySelector('.next').classList.add('on');
            let k = (i+1).toString(); 
            if (k < 10) { k = k.padStart(2, "0"); }
            cardHolder.querySelector('.next').onclick = (e) => {
              switchView.querySelector(`[data-card-number="${k}"]`).scrollIntoView({ behavior: "smooth", block: "center", inline: "center", container: "all" });
              currentCard = currentDeck.cards[i];
              navToHistory('card',{deck_slug:currentDeck.slug,deck_niceText:currentDeck.niceText, cardNumber:k, sign: 'nextC'});
              //console.log('currentCard',currentCard.title)
            }
          }
          // kedvencekben van-e?
          let favs = JSON.parse(localStorage.getItem("favs") || "[]");

          if (favs.some( fav => fav.internalID === cardData.internalID)){
            //console.log('A kártya már a kedvencekben van')
            cardHolder.querySelector('.fav-close').classList.add('show-trash');
          }else{
            //console.log('A kártya nincs a kedvencekben')
            cardHolder.querySelector('.fav-close').classList.remove('show-trash');
          }
          
          cardHolder.querySelector('.close').onclick = () => {
          	showCardNew({pushToHistory: true, cardNumber: j});
          }
          cardHolder.querySelector('.fav').onclick = (event) => {
          	addToFavs(event);
          }
          cardHolder.querySelector('.random').onclick = (event) => {
          	fakeRandom();
          }
          cardHolder.querySelector('.trash').onclick = (event) => {
          	favToTrash(event)
          }


          
          
          
          switchView.querySelector('.grid').appendChild(cardHolder);

          //teszt
          //switchView.querySelector('.grid').classList.add('cardView');
        }
        switchView.querySelector('.loader').setAttribute('style', 'display: none')
      }

      /**********************************
       * KATTINTÁS:
       * deckView-ből Home nézetre vissza
       **********************************/
      document.querySelector(".backHome").onclick = () => {
        // hide("deckView");
        backHome();
      };
      
      function backHome(pushToHistory = true){
        hideAll("home");
        pushToHistory ? navToHistory('home',{}) : console.log('no pushToHistory') ;
        switchView.querySelector('.grid').classList.remove('cardView');
        currentDeck = [];
      }


      /**********************************
       * EGY KÁRTYA MUTATÁSA/elrejtése
       * (cardView réteg)
       **********************************/
      function showCardNew({pushToHistory = true, cardNumber = undefined/*, cardData = {}*/}) {
        if(switchView.querySelector('.grid').classList.contains('cardView')){
          switchView.querySelector('.grid').classList.remove('cardView');
          pushToHistory ? navToHistory('deck',{deck_slug:currentDeck.slug, deck_niceText:currentDeck.niceText}) : console.log('no pushToHistory');
          currentCard = {};

        }else{ 
          switchView.querySelector('.grid').classList.add('cardView');
          if(cardNumber){
            //console.log('sign a '+ JSON.stringify(currentDeck))
            pushToHistory ? navToHistory('card',{deck_slug:currentDeck.slug,deck_niceText:currentDeck.niceText, cardNumber:cardNumber, sign: 'a'}) : console.log('no pushToHistory');
            switchView.querySelector(`[data-card-number="${cardNumber}"]`).scrollIntoView({ behavior: "smooth", block: "center", inline: "center", container: "all" });
          }else{
            pushToHistory ? navToHistory('card',{deck_slug:currentDeck.slug,deck_niceText:currentDeck.niceText, cardNumber:'01', sign: 'b'}) : console.log('no pushToHistory');
          }
          currentCard = JSON.parse(switchView.querySelector(`[data-card-number="${cardNumber}"] .cardimg`).dataset.cardData);
          //console.log('currentCard',currentCard.title);

        }
      }
      
      function whatState(){
        console.log(`state: ${JSON.stringify(window.history.state)}\n`, `currentHistoryIndex: ${currentHistoryIndex}`)
      }
      
      /*function showCard(data) {
        currentCard = data;
        let favs = JSON.parse(localStorage.getItem("favs") || "[]");
        
        // Itt (csak itt) ellenőrizzük hogy a kedvencekben van-e a kártya
        
        if (favs.some( fav => fav.internalID === data.internalID)){
          console.log('A kártya már a kedvencekben van')
          toolbar.classList.add('show-trash');
        }else{
          console.log('A kártya nincs a kedvencekben')
          toolbar.classList.remove('show-trash');
        }
        
        // beállítjuk az attribútumokat
        
        document.getElementById("cardImage").src = data.imageUrl;
        document.getElementById("cardImage").alt = data.title;
        document.getElementById("cardImage").dataset.dataCard = JSON.stringify(data);
        //document.getElementById("cardImage").onload = "handleImageLoad(this);";
        show("cardView");
      }*/

      /**********************************
       * KATTINTÁS: RANDOM KÁRTYA HÚZÁSA
       * a pakli legyen a currentDeck változóban
       **********************************/     
      switchView.querySelector(".randomCard").onclick = () => {
        fakeRandom()
      };

      
      
      function fakeRandom(){
        if( currentDeck.cards.length > 0 ){
          let k;
          let isCardView = switchView.querySelector('.grid').classList.contains('cardView');
          if(currentStock.length == 0 && currentWaste.length == 0){
            currentStock = [...Array(currentDeck.cards.length).keys()];
          }
          if(currentStock.length == 0 && currentWaste.length == currentDeck.cards.length){
            //console.log('RESET(1)')
            currentStock = [...Array(currentDeck.cards.length).keys()];
            currentWaste = [];

            // Ne dobja ki a random az aktuális kártyát!
            const index = currentDeck.cards.findIndex((card) => {
              if (!card.internalID || !currentCard.internalID) {
                //console.log('nincs ilyen tulajdonság!')
                return false;
              }
              return card.internalID === currentCard.internalID
            });
            if (index > -1) {
              currentStock.splice(index, 1);
              currentWaste.push(index);
            }
          }

          if(currentStock.length > 0){
            const randomNum = Math.floor(Math.random() * currentStock.length);
            k = (currentStock[randomNum]+1).toString()
            if (k < 10) { k = k.padStart(2, "0"); }
            if(!isCardView){
              switchView.querySelector('.grid').classList.add('cardView');
              //navTo History('card',{deck:currentDeck.slug, cardNumber:k});
              navToHistory('card',{deck_slug:currentDeck.slug, deck_niceText:currentDeck.niceText, cardNumber:k, sign: 'c'})
            }
            switchView.querySelector(`[data-card-number="${k}"]`).scrollIntoView({ behavior: "smooth", block: "center", inline: "center", container: "all" });
            //showCard(currentDeck[randomNum]);
            currentStock.splice(randomNum, 1);
            currentWaste.push(randomNum);
            currentCard = JSON.parse(switchView.querySelector(`[data-card-number="${k}"] .cardimg`).dataset.cardData);
          }
          console.log(k, currentStock.length, currentWaste.length);
        }else{
            showDialog("Előbb válassz ki kedvenc kártyákat!")
        }
      }

      /*****************************
       * KATTINTÁS: cardView-TOOLBAR
       * kártya bezárása
       *****************************/     
      /*document.getElementById("closeCard").onclick = () => {
        hide("cardView");
        cardView.querySelector('.card-container').classList.add('loading')
        cardView.querySelector('.card-container').classList.remove('loaded')
      };
      cardView.querySelector('.protect').onclick = () => {
        console.log('ez egy .protect.onclick')
        hide("cardView");
        cardView.querySelector('.card-container').classList.add('loading')
        cardView.querySelector('.card-container').classList.remove('loaded')
      };*/
      
  /*          function handleImageLoad(imgElement) {
        // A this helyett most az átadott argumentumot (imgElement) használjuk.
        const parentDiv = imgElement.parentNode; 

        // A .closest() használata is működne, de a szülő (parentNode) is jó itt.
        // const parentDiv = imgElement.closest('.grid-item'); 

        if (parentDiv && parentDiv.classList.contains('loading')) {
          parentDiv.classList.remove('loading');
        }
      }
  */
      /*****************************
       * KATTINTÁS: cardView-TOOLBAR
       * törlés a kedvencekből
       *****************************/     
      //document.getElementById("trashCard").onclick = () => {
      function favToTrash(event){
        let favs = JSON.parse(localStorage.getItem("favs") || "[]");
        // megkeressük az indexét a kártyának a kedvencekben
        const index = favs.findIndex((fav) => {
          if (!fav.internalID || !currentCard.internalID) {
            console.log('nincs ilyen tulajdonság!')
            return false;
          }
          return fav.internalID === currentCard.internalID
        });
        // ha megtaláltuk, és csak akkor, töröljük
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
		favsToDecks();
      }
      
      function favsToDecks(){
        let favs = JSON.parse(localStorage.getItem("favs") || "[]");
        const index2 = decks.findIndex((deck) => {
          if (!deck.slug) {
            console.log('nincs ilyen tulajdonság!')
            return false;
          }
          return deck.slug === 'favs'
        });
        if (index2 > -1) {
          decks[index2].cards = favs;
          if(switchView.querySelector('h2').textContent === 'Kedvencek'){
            initView('switchView')
            switchView.querySelector("h2").textContent = '';
            openDeck('favs','Kedvencek');
          }
          if(favs.length == 0){
            switchView.querySelector(".grid").classList.remove('cardView');
          }
        }
      }
      //};


      /**********************************
       * KATTINTÁS: cardView-TOOLBAR
       * Hozzáadás a kedvencekhez
       **********************************/     
      //document.getElementById("favCard").onclick = () => {
      //};
      function addToFavs(event){
        let favs = JSON.parse(localStorage.getItem("favs") || "[]");
        // NEM ellenőrizzük hogy már kedvenc-e!
        favs.push(currentCard)
        localStorage.setItem("favs", JSON.stringify(favs));
        //showDialog("Hozzáadva a kedvencekhez!", "blue", "Bezárás", "hide('cardView'); dialog.close();");
        event.target.closest(".fav-close").classList.toggle('show-trash');
        favsToDecks();
      }
      
      /*******************
       * Kedvencek törlése
       *******************/
      
      switchView.querySelector(".removeFav").onclick = () => {
        localStorage.setItem("favs", JSON.stringify([]));
        favsToDecks();
      }
      

      /**********************************
       * KATTINTÁS: Napi Minikihívás
       * RÉTEG: dailyView
       **********************************/
      document.getElementById("dailyChallengeBtn").onclick = async () => {
        initView('switchView')
        switchView.querySelector("h2").textContent = '';
        openDeck('takeFive','Napi Minikihívás');
      }

      switchView.querySelector(".newTakeFive").onclick = async () => {
        switchView.querySelector(".newTakeFive").disabled = true;
        let takeFive = JSON.parse(localStorage.getItem("takeFive") || "[]");
        initView('switchView', takeFive.length)
        try{
          const res = await fetch(`${deckAPI}?action=getRandomCards&count=5`);
          const json = await res.json();
          if (!json.success) {
            console.log("!json.success sajnos")
            return false;
          }
          if (json.success) {
            takeFive = json.data.cards;
            localStorage.setItem("takeFive", JSON.stringify(takeFive));

          }else{
            switchView.querySelector(".newTakeFive").disabled = false;
          }
        }catch(err){
          showDialog("Hiba a deck-list betöltésénél.");
          console.log(err);
          switchView.querySelector(".newTakeFive").disabled = false;
        }
        takeFiveToDecks()


      };

      function takeFiveToDecks(){
        let takeFive = JSON.parse(localStorage.getItem("takeFive") || "[]");
        const index2 = decks.findIndex((deck) => {
          if (!deck.slug) {
            console.log('nincs ilyen tulajdonság!')
            return false;
          }
          return deck.slug === 'takeFive'
        });
        if (index2 > -1) {
          decks[index2].cards = takeFive;
          if(switchView.querySelector('h2').textContent === 'Napi Minikihívás'){
            initView('switchView')
            switchView.querySelector("h2").textContent = '';
            openDeck('takeFive','Napi Minikihívás');
          }
          /*if(favs.length == 0){
            switchView.querySelector(".grid").classList.remove('cardView');
          }*/
        }
        switchView.querySelector(".newTakeFive").disabled = false;
      }

      
      /**********************************
       * KATTINTÁS: Kedvencek megnyitása
       * RÉTEG: deckView
       **********************************/    
      /*document.getElementById("randomFav").onclick = () => {
        const favs = JSON.parse(localStorage.getItem("favs") || "[]");
        if( favs.length > 0 ){
          const randomNum = Math.floor(Math.random() * favs.length);
          showCard(favs[randomNum]);
        }
      }*/
      
      document.getElementById("favoritesBtn").onclick = () => {
        initView('switchView')
        switchView.querySelector("h2").textContent = '';
        openDeck('favs','Kedvencek');

        
        /*const favs = JSON.parse(localStorage.getItem("favs") || "[]");
		currentDeck= favs;
        //for( let i=0; i< favs.length; i++){
        //  if(!favs[i].imageUrl || !favs[i].title){
        //    favs.splice(i, 1);
        //  }
        //}
        //localStorage.setItem("favs", JSON.stringify(favs));
        
        if (favs.length === 0) {
          showDialog("Még nincsenek kedvencek!");
          return;
        }
        //hide("home");
        hideAll("favView")
        currentDeckTitle = "Kedvenc kártyáim";
        toolbar.classList.add('show-trash')
        initView('favView', favs.length)
        favs.forEach((card) => {
          const div = document.createElement("div");
          div.className = "card loading";
          div.innerHTML = `
            <img class="cardimg" src="${card.imageUrl}" alt="${card.title}" data-card-data="${JSON.stringify(card)}" onload="handleImageLoad(this);">
            <div class="protect"></div>`;
          div.onclick = () => showCard(card);
          favView.querySelector(".loader").setAttribute('style','display:none')
          favView.querySelector(".grid").appendChild(div);
        });*/
      };
      
      /**
       * Eltávolítja a 'loading' osztályt a kép szülőjéről.
       * Ezt a függvényt hívja meg az img tag onload eseménye.
       * @param {HTMLImageElement} imgElement - A betöltődött img elem.
       */
      function handleImageLoad(imgElement) {
        // A this helyett most az átadott argumentumot (imgElement) használjuk.
        //const parentDiv = imgElement.parentNode; 

        // A .closest() használata is működne, de a szülő (parentNode) is jó itt.
         const parentDiv = imgElement.closest('.loading'); 

        if (parentDiv && parentDiv.classList.contains('loading')) {
          parentDiv.classList.remove('loading');
          parentDiv.classList.add('loaded');
        }
      }
      



      /* 🔒 Globális másolásvédelem */
      document.addEventListener("contextmenu", (e) => {
        if (
          e.target.tagName === "IMG" ||
          e.target.classList.contains("protect")
        )
          e.preventDefault();
      });

      document.addEventListener("dragstart", (e) => {
        if (e.target.tagName === "IMG") e.preventDefault();
      });
      // ===============================
      // SECURITY BLOCK START
      // ===============================

      // 1. Jobb klikk tiltása
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });

      // 2. Kép húzásának (drag) tiltása
      document.addEventListener("dragstart", (e) => {
        if (e.target.tagName === "IMG") {
          e.preventDefault();
        }
      });

      // 3. Szöveg kijelölés tiltása
      document.addEventListener("selectstart", (e) => {
        e.preventDefault();
      });

      // 4. Másolás tiltása (CTRL+C, mobil copy, stb.)
      document.addEventListener("copy", (e) => {
        e.preventDefault();
      });

      // 5. Mobil hosszan nyomás → képletöltés tiltása
      document.addEventListener("touchstart", (e) => {
        // Ha képre nyom hosszan, tiltjuk
        if (e.target.tagName === "IMG") {
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        }
      });

      // 6. Még erősebb védelem: minden IMG fölé átlátszó réteg
      document.querySelectorAll("img").forEach((img) => {
        const wrapper = document.createElement("div");
        //wrapper.style.position = "relative";
        //wrapper.style.display = "flex";
        wrapper.className = "wrapper";

        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "transparent";
        overlay.style.zIndex = "10";

        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        wrapper.appendChild(overlay); 
      });

      // ===============================
      // SECURITY BLOCK END
      // ===============================
      

      