import { isLocal } from "../config/config.js";

const LT = {
  // LT = LogType
  INIT: "init",
  EVENT: "event",
  UI: "ui",
  NAV: "nav",
  DECKS: "decks",
  DECK: "deck",
  CARD: "card",
  TAKEFIVE: "takeFive",
  FAVS: "favs",
  SEC: "sec",
  API: "api",
  AUTH: "auth",
  ERROR: "error",
  DOM: "dom",
  OBSERVE: "observe",
  SYNC: "sync",
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
    init: 2,
    event: 2,
    ui: 2,
    nav: 2,
    decks: 2,
    deck: 2,
    card: 2,
    takeFive: 2,
    favs: 2,
    sec: 2,
    api: 2,
    auth: 2,
    error: 2,
    dom: 2,
    observe: 2,
    sync: 2,
  },

  log(category, message, ...details) {
    // 1. ELŐSZŰRÉS: Ha nem local, vagy a kategória 0 (semmi), azonnal álljunk le!
    const level = this.loggingConfig[category];
    //if (!isLocal || level === 0 || level === undefined) return;
    if (!isLocal || level === 0) return;

    // 4. Ellenőrizzük, hogy a kategória létezik-e a konfigurációban
    if (!(category in this.loggingConfig) || level === undefined) {
      //console.warn(`[System] Ismeretlen log kategória: "${category}"`);
      this.log(LT.ERROR, `[System] Ismeretlen log kategória: "${category}"`);
      return;
    }

    // 2. HIBA DETEKTÁLÁSA
    // Megnézzük, hogy a kategória 'error'-e, vagy van-e Error objektum a részletekben
    let isError =
      category === "error" ||
      details.some((d) => d instanceof Error) ||
      message instanceof Error;

    // 3. SZINT-SZŰRÉS: Ha 1-es szinten vagyunk (csak hiba), de nincs hiba -> kilépés
    if (level === 1 && !isError) return;

    // 5. CSAK MOST futtatjuk a nehéz műveleteket (Stack Trace)

    const timestamp = new Date().toLocaleTimeString();
    const stack = new Error().stack;
    // Kinyerjük a hívási helyet (Stack Trace)
    const stackLines = stack.split("\n");
    // A stack[0] maga az Error, stack[1] a devLog helye, stack[2] a hívó helye
    // Böngészőfüggő lehet a formátum, a legtöbb modern böngészőben a 3. sor kell
    const callerLine = stackLines[2]
      ? stackLines[2].trim().replace("at", "@")
      : "Ismeretlen hely";

    const method = isError ? "error" : "log";
    const categoryColor = isError ? "#ff4747" : "#2196F3"; // Szebb piros és kék
    const errorTag = isError ? " ERROR" : "";

    const count = details.length > 0 ? `[${details.length}]` : "";

    // Formázott megjelenítés: [Kategória] Időpont - Üzenet
    /*console[method](
        `%c[${category.toUpperCase()}${errorTag}] %c${timestamp}\n%c${callerLine}:`,
        `color: ${categoryColor};; font-weight: bold`,
        "color: gray",
        "color: orangered; font-style: italic",
      );
      console[method](message);
      details.forEach((detail) => console[method](detail));
      console[method](
        `%c[${category.toUpperCase()}:END]--------`,
        `color: ${categoryColor};; font-weight: bold`, 
      )*/

    // 5. MEGJELENÍTÉS (Egyetlen csoportba zárva, hogy ne szemetelje tele a konzolt)
    console.groupCollapsed(
      `%c[${category.toUpperCase()}${errorTag}] %c${timestamp} %c${count} ${message}`,
      `color: ${categoryColor}; font-weight: bold;`,
      "color: gray; font-weight: normal;",
      "color: inherit; font-weight: bold;",
    );

    console[method](
      `%c📌${callerLine}`,
      "color: orangered; font-style: italic;white-space: norap;",
    );

    //if (details.length > 0) {
    //  console[method]("Részletek:", ...details);
    //}

    details.forEach((detail) => console[method](detail));

    console.groupEnd();
  },
  v(varObj) {
    return [Object.keys(Object.keys(varObj))[0], varObj];
  },
};

export { Logging, LT };
