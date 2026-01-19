import { Logging as Dev } from '../logging/log.js';
import { LT } from "../logging/log.js";
import AppState from '../core/state.js';

const Nav = {
  NAV_STACK_VALUES: {
    CONFIRM: ["confirm"],
    LOGIN: ["confirm", "login"],
    HOME: ["confirm", "home"],
    DECK: ["confirm", "home", "deck"],
    CARD: ["confirm", "home", "deck", "card"],
  },

  currentHistoryIndex: -1,
  newHistoryIndex: 0,
  navigationStack: ["confirm"],

  navToHistory(stack, data) {
    this.navigationStack = this.NAV_STACK_VALUES[stack];
    data.index = (window.history.state?.index ?? 0) + 1;
    data.stack = stack;
    window.history.pushState(data, "", window.location.href);
    this.currentHistoryIndex = data.index;
    Dev.Log(LT.NAV, "push!", JSON.stringify(window.history.state))
  },
};

// induló állapot
Nav.navToHistory("confirm", {
  index: AppState.currentHistoryIndex,
  stack: "confirm",
});

export default Nav;
