import { Logging as Dev } from '../logging/log.js';
import { LT } from "../logging/log.js";
import AppState from '../core/state.js';

export const NavState = {
  currentHistoryIndex: -1,
  newHistoryIndex: 0,
  navigationStack: ["confirm"],
}

const Nav = {
  NAV_STACK_VALUES: {
    CONFIRM: ["confirm"],
    LOGIN: ["confirm", "login"],
    HOME: ["confirm", "home"],
    DECK: ["confirm", "home", "deck"],
    CARD: ["confirm", "home", "deck", "card"],
  },



  navToHistory(stack, data) {
    this.navigationStack = this.NAV_STACK_VALUES[stack];
    data.stack = stack;
    
    data.index = (window.history.state?.index ?? 0) + 1;
    NavState.currentHistoryIndex = data.index;
    window.history.pushState(data, "", window.location.href);
    Dev.Log(LT.NAV, "push!", JSON.stringify(window.history.state), NavState)
  },
};

// induló állapot
//NavState.currentHistoryIndex = -1;
Nav.navToHistory("confirm", {
  index: NavState.currentHistoryIndex,
  stack: "confirm",
});

export default Nav;
