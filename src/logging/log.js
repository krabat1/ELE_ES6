import { isLocal } from "../config/config.js";

const LT = {
  // LT = LogType
  INIT: "init",
  NAV: "nav",
  DECKS: "decks",
  DECK: "deck",
  TAKE5: "take5",
  FAVS: "favs",
  SEC: "sec",
  API: "api",
  AUTH: "auth",
};

const Logging = {
  /**
   * 0: semmi,
   * 1: csak hiba,
   * 2: minden
   *
   * simple
   * devLog(LT.AUTH, 'Felhasználó belépett');
   *
   * send data
   * devLog(LT.AUTH, 'Felhasználó belépett', { id: 42 });
   */

  loggingConfig: {
    init: 0,
    nav: 1,
    decks: 0,
    deck: 0,
    take5: 0,
    favs: 0,
    sec: 1,
    auth: 0,
    api: 0,
    //ui: true,
    //globals: true,
  },

  Log(category, message, ...details) {
    // Ellenőrizzük, hogy a kategória létezik-e a konfigurációban
    if (!(category in this.loggingConfig)) {
      console.warn(`[System] Ismeretlen log kategória: "${category}"`);
      return;
    }

    // Kinyerjük a hívási helyet (Stack Trace)
    const stack = new Error().stack;
    const stackLines = stack.split("\n");
    // A stack[0] maga az Error, stack[1] a devLog helye, stack[2] a hívó helye
    // Böngészőfüggő lehet a formátum, a legtöbb modern böngészőben a 3. sor kell
    const callerLine = stackLines[2] ? stackLines[2].trim().replace("at", "@") : "Ismeretlen hely";

    // Ha az adott kategória be van kapcsolva, mehet a log
    if (!!this.loggingConfig[category]) {
      const timestamp = new Date().toLocaleTimeString();
      // Formázott megjelenítés: [Kategória] Időpont - Üzenet
      console.log(
        `%c[${category.toUpperCase()}] %c${timestamp}\n%c${callerLine}:`,
        "color: blue; font-weight: bold",
        "color: gray",
        "color: orangered; font-style: italic",
      );
      console.log(message);
      details.forEach((detail) => console.log(detail));
      console.log(
        `%c[${category.toUpperCase()}:END]--------`,
        "color: blue; font-weight: bold", 
      )
    }
  },
};

export { Logging, LT };
