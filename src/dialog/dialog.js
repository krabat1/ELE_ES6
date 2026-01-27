import DOM from "../dom/dom.js";

const Dialog = {
  showDialog(message, buttons = []) {
    // 1. Alaphelyzet: töröljük a korábbi gombokat a separator után
    // Feltételezzük, hogy a gombok a .separator.bottom után vannak
    //const dialog = document.getElementById("dialogView");
    const separator = DOM.dialog.querySelector(".separator.bottom");

    // Minden gombot eltávolítunk, ami a separator után van
    let nextSibling = separator.nextElementSibling;
    while (nextSibling) {
      let toRemove = nextSibling;
      nextSibling = nextSibling.nextElementSibling;
      toRemove.remove();
    }

    // 2. Üzenet beállítása
    DOM.dialog.querySelector("p").textContent = message;

    // 3. Új gombok létrehozása a tömbből
    buttons.forEach((btnConfig) => {
      const button = document.createElement("button");
      button.textContent = btnConfig.text || "Gomb";

      // Osztály beállítása (alapértelmezett a 'blue')
      button.className = btnConfig.class || "blue";

      // Eseménykezelő hozzáadása
      if (typeof btnConfig.onclick === "function") {
        button.addEventListener("click", () => {
          btnConfig.onclick();
          // Opcionális: a gomb megnyomása után zárjuk be a dialógust?
          // dialog.close();
        });
      }

      // Gomb hozzáadása a DOM-hoz
      separator.after(button);
    });

    dialog.showModal();
  },
};

export default Dialog;
