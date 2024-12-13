const express = require("express");
const router = express.Router();
const { getHome } = require("../controllers/index");
const {
  getGame,
  getGameList,
  getGameDetails,
  toggleGameStatus,
  scheduleGameDisable,
  disableAllGames,
  enableAllGames,
} = require("../controllers/game");

// Home routes
router.get("/", getHome);

// Game routes
router.get("/games", getGameList);
router.get("/game", getGame);
router.get("/game/:id", getGameDetails);
router.post("/game/:id/toggle-game-status", toggleGameStatus);
router.post("/game/:id/schedule-disable", scheduleGameDisable);
router.post("/games/disable-all", disableAllGames);
router.post("/games/enable-all", enableAllGames);

module.exports = router;
