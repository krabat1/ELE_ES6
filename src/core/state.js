import { isLocal } from "../config/config.js";

const AppState = {
  userEmail: "",
  decks: [],
  trainings: [],
  currentDeck: {},
  currentCard: {},
  currentStock: [],
  currentWaste: [],
  playerStates: {},
};
if (isLocal) window.AppState = AppState;

export default AppState;
