import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";

const UI = {
  show(elem) {
    document.getElementById(elem).style.display = "block";
  },
  hide(elem) {
    document.getElementById(elem).style.display = "none";
  },
  hideAll(except = undefined) {
    document.querySelectorAll(".view").forEach((elem) => {
      this.hide(elem.getAttribute("id"));
    });
    if (except) this.show(except);
  },
  initView(id, length = undefined) {
    Dev.log(LT.UI, `initView(${id}, ${length})`)
    const view = document.getElementById(id);
    const grid = view.querySelector(".grid");
    const loader = view.querySelector(".loader");
    loader.removeAttribute("style");
    //grid.innerHTML = "";
    while (grid.firstChild) {
      grid.removeChild(grid.lastChild);
    }
    if (length) {
      grid.className = "grid";
      grid.classList.add(`total${length}`);
    }
  },

  showPass() {
    var x = document.getElementById("password");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  },

  //showDialog(message, buttons) {
  // jelenlegi kód
  //}
};

export default UI;
