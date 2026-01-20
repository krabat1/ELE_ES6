
/**********************
 * AUTOMATIKUS BELÉPTETÉS
 * tryAutoLogin() hívásával
 **********************/
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Belépéskor hozzáadunk egy extra állapotot
  /*window.history.replaceState({ step: 'confirm' }, "");
        whatState()
        window.history.replaceState({ step: 'home' }, "");
        whatState()*/


});

/**********************
 * tryAutoLogin()
 * RETURN: boolean
 **********************/

/**********************************
 * EGYES RÉTEGEK MUTATÁSA/ELREJTÉSE
 * show(), hide(), hideAll()
 **********************************/

/**************************
 * DIALOG (alert() HELYETT)
 * showDialog()
 **************************/

/************************************
 * checkLogin()
 * token + lejárat a localStorage-ben
 ************************************/

/*******************************
 * PASSWORD SZÖVEGMEZŐ FELFEDÉSE
 *******************************/

/*******************************
 * KATTINTÁS: BEJELENTKEZÉS GOMB
 *******************************/

/*******************************
 * KATTINTÁS: KIJELENTKEZÉS GOMB
 *******************************/

/* 
      csak switchView esetén használandó
      */

/********************************************
 * PAKLI LETÖLTÉSE, loadDecks() SEGÉDFÜGGVÉNYE
 ********************************************/


/*******************************
 * PAKLIK LISTÁJÁNAK BETÖLTÉSE
 *******************************/

/********************************
 * PAKLI BETÖLTÉSE GRIDBE, API-BÓL
 ********************************/


/**********************************
 * KATTINTÁS:
 * deckView-ből Home nézetre vissza
 **********************************/

/**********************************
 * EGY KÁRTYA MUTATÁSA/elrejtése
 * (cardView réteg)
 **********************************/


function whatState() {
  console.log(
    `state: ${JSON.stringify(window.history.state)}\n`,
    `currentHistoryIndex: ${currentHistoryIndex}`
  );
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



//};

/**********************************
 * KATTINTÁS: cardView-TOOLBAR
 * Hozzáadás a kedvencekhez
 **********************************/
//document.getElementById("favCard").onclick = () => {
//};


/*******************
 * Kedvencek törlése
 *******************/



/**********************************
 * KATTINTÁS: Napi Minikihívás
 * RÉTEG: dailyView
 **********************************/





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



/* 🔒 Globális másolásvédelem */

// ===============================
// SECURITY BLOCK START
// ===============================



// ===============================
// SECURITY BLOCK END
// ===============================
