import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";
import DOM from "../dom/dom.js";
import AppState from "../core/state.js";
import Card from "../card/card.js";

const Observe = {
  timeoutId: null,

  latestElement: null,

  ioDebounce(newElement, delay) {
    this.latestElement = newElement;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      Card.setCurrentCard(this.latestElement, "OBSERVER");
    }, delay);
  },

  startMutationObserve() {
    const mutationTarget = DOM.switchView.querySelector(".grid");

    // Run on change
    const mutationCallback = (mutationList, mo) => {
      for (const mutation of mutationList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const classNameMatch = mutationTarget.className.includes("cardView");
          if (classNameMatch) {
            // start intersectionObserver
            const intersectionTargets =
              DOM.switchView.querySelectorAll(".cardimg");
            intersectionTargets.forEach((el) => {
              io.observe(el);
            });
            Dev.log(LT.OBSERVE, `CARD OBSERVE ${classNameMatch}`);
          } else {
            // end intersectionObserver
            io.disconnect();
            // const intersectionTargets = DOM.switchView.querySelectorAll(".cardimg");
            // intersectionTargets.forEach((el) => {
            //   io.unobserve(el);
            // });
            Dev.log(LT.OBSERVE, `CARD OBSERVE ${classNameMatch}`);
          }
        }
      }
    };

    const intersectionCallback = (entries) => {
      entries.forEach((entry) => {
        // console.log( `A ${entry.target.closest(".card").dataset.cardNumber} kártya ${entry.intersectionRatio * 100}%-a látszik.`,);
        if (entry.isIntersecting) {
          this.ioDebounce(entry.target.closest(".card"), 500);
          // do something
        } else {
          //console.log(`💨 A ${entry.target.closest(".card").dataset.cardNumber} elem kiment a látómezőből.`,);
        }
      });
    };

    // IntersectionObserver instance
    const io = new IntersectionObserver(intersectionCallback, {
      threshold: 0.6,
      root: null,
    });

    // MutationObserver instance
    const mo = new MutationObserver(mutationCallback);

    // 4. Beállítjuk a figyelést (csak az attribútumok, azon belül is csak a class érdekel)
    const moConfig = {
      attributes: true,
      attributeFilter: ["class"],
    };

    // 5. Elindítjuk a folyamatot
    mo.observe(mutationTarget, moConfig);
    Dev.log(LT.OBSERVE, `GRID OBSERVE STARTED`);
  },
};
export default Observe;
