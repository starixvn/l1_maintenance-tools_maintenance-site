const express = require("express");
const router = express.Router();
const { getHome } = require("../controllers/index");
const {
  getGame,
  getGameList,
  getGameDetails,
  toggleGameStatus,
} = require("../controllers/game");
const { getSettings, updateSettings } = require("../controllers/settings");
const { getReports, getStatistics } = require("../controllers/reports");

// Home routes
router.get("/", getHome);

// Game routes
router.get("/games", getGameList);
router.get("/game", getGame);
router.get("/game/:id", getGameDetails);
router.post("/game/:id/toggle-game-status", toggleGameStatus);

// Settings routes
router.get("/settings/general", getSettings);
router.get("/settings/security", getSettings);
router.post("/settings/:type", updateSettings);

// Report routes
router.get("/reports/activity", getReports);
router.get("/reports/statistics", getStatistics);

module.exports = router;
