import { isLocal } from "../config/config.js";

const AppState = {
  userEmail: "",
  type: 'guest',
  access: 'demo',
  decks: [],
  trainings: [],
  currentDeck: {},
  currentCard: {},
  currentStock: [],
  currentWaste: [],
  playerStates: {},
  trainingStates: {},
};
if (isLocal) window.AppState = AppState;

export default AppState;
