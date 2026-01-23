import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";
import AppState from "../core/state.js";

export const NavState = {
  currentHistoryIndex: -1,
  newHistoryIndex: 0,
  navigationStack: ["confirm"],
};

const Nav = {
  NAV_STACK_VALUES: {
    CONFIRM: ["confirm"],
    LOGIN: ["confirm", "login"],
    HOME: ["confirm", "home"],
    DECK: ["confirm", "home", "deck"],
    CARD: ["confirm", "home", "deck", "card"],
  },

  navToHistory(stack, data) {
    NavState.navigationStack = this.NAV_STACK_VALUES[stack.toUpperCase()];
    data.stack = stack;

    data.index = (window.history.state?.index ?? 0) + 1;
    NavState.currentHistoryIndex = data.index;
    window.history.pushState(data, "", window.location.href);
    const estack = new Error().stack;
    const stackLines = estack.split("\n");
    let callerLine = stackLines[2] ? stackLines[2].trim() : "ismeretlen";

    Dev.log(
      LT.NAV,
      `pushState!(${stack})`,
      `📍${callerLine}`,
      { _windowHistoryState: window.history.state },
      { NavState },
    );
  },
};

// induló állapot
//NavState.currentHistoryIndex = -1;
Nav.navToHistory("confirm", {
  index: NavState.currentHistoryIndex,
  stack: "confirm",
});

export default Nav;
