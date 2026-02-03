import BASE_URL from "../config/config.js";
import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";
import DOM from "../dom/dom.js";

const Descriptions = {
  description: document.querySelector("#description"),
  async loadDesc(slug) {
    const fileName = `${slug}.html`;
    const response = await fetch(`${BASE_URL}src/descriptions/${fileName}`);
    const html = await response.text();
    description.innerHTML = html;

    const p = document.createElement("p");
    p.setAttribute("style", "text-align: center;");
    const closeButt = document.createElement("button");
    closeButt.className = "yellow";
    closeButt.setAttribute("style", "color: black;");
    closeButt.dataset.action = "closeDesc";
    closeButt.innerText = "✖ Bezárás";
    p.appendChild(closeButt);
    description.appendChild(p);
  },
  /*addButton() {
    const descButton = document.createElement("button");
    descButton.className = "blue";
    //descButton.className = "blue description";
    //descButton.setAttribute("id", "description2");
    descButton.innerText = "Leírás";
    descButton.dataset.action = "loadDesc";
    DOM.switchView.querySelector("#topActions").appendChild(descButton);
  },
  removeButtons() {
    const elementExists = DOM.switchView.querySelectorAll(
      '[data-action="loadDesc"]',
    );
    if (elementExists.length > 0) {
      elementExists.forEach((el) => {
        el.remove();
      });
    }
    this.closeDesc()
  },*/
  async closeDesc() {
    while (description.firstChild) {
      //await new Promise((resolve) => setTimeout(resolve, 5));
      description.removeChild(description.lastChild);
      switchView.scrollIntoView({ behavior: "smooth" });
    }
  },
};

export default Descriptions;
