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
  scheduleAllGames,
  clearAllSchedules,
} = require("../controllers/game");
const getClientIP = require("../middleware/getClientIP");

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Home routes
router.get("/", getGameList);

// Game routes
router.get("/games", getGameList);
router.get("/game", getGame);
router.get("/game/:id", getGameDetails);
router.post("/game/:id/toggle-game-status", getClientIP, toggleGameStatus);
router.post("/game/:id/schedule-disable", getClientIP, scheduleGameDisable);
router.post("/games/disable-all", getClientIP, disableAllGames);
router.post("/games/enable-all", getClientIP, enableAllGames);
router.post("/games/schedule-all", getClientIP, scheduleAllGames);
router.post("/games/clear-all-schedules", getClientIP, clearAllSchedules);

module.exports = router;
