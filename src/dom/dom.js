import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";

// https://css-tricks.com/named-element-ids-can-be-referenced-as-javascript-globals/

const DOM = {
  login: null,
  emailField: null,
  passwordField: null,
  showPassInput: null,
  loginBtn: null,
  loginError: null,
  home: null,
  switchView: null,
  dialog: null,
};
export function showDOM(){
  const domElements = Object.keys(DOM);
  domElements.forEach((el) => {
    const isMissing = DOM[el] ?? true;
    if (isMissing === true) {
      Dev.log(LT.DOM, new Error(`DOM.${el} <- NOT EXIST`), DOM[el]);
    } else {
      Dev.log(LT.DOM, `DOM.${el}`, DOM[el]);
    }
  })
}
export default DOM;
