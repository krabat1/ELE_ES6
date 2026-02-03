import DOM from "../dom/dom.js";

const Dialog = {
  showDialog(message) {
    this.clearDialog();
    DOM.dialog.querySelector(".dialogText").textContent = message;
    DOM.dialog.showModal();
  },
  clearDialog() {
    DOM.dialog.querySelector(".dialogText").textContent = "";
    while (DOM.dialog.querySelector(".dialogButtons").firstChild) {
      //await new Promise((resolve) => setTimeout(resolve, 5));
      DOM.dialog
        .querySelector(".dialogButtons")
        .removeChild(DOM.dialog.querySelector(".dialogButtons").lastChild);
      switchView.scrollIntoView({ behavior: "smooth" });
    }
  },
};

export default Dialog;
