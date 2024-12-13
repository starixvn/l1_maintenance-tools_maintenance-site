const { connectDB, DB_CONFIGS } = require("../config/database");
const { getModel } = require("../models/gameConfig");

const ENVIRONMENTS = Object.keys(DB_CONFIGS);

exports.getGame = (req, res) => {
  res.render("pages/game", {
    title: "Game Page",
    gameTitle: "Welcome to the Game",
  });
};

exports.playGame = (req, res) => {
  res.json({
    status: "success",
    message: "Game action received",
    data: req.body,
  });
};

exports.getGameList = async (req, res) => {
  try {
    const selectedEnv = req.query.env || "SG-LOCAL0";
    const statusFilter = req.query.status; // 'enabled', 'disabled', or undefined for all
    const connection = await connectDB(selectedEnv);
    const GameConfig = getModel(connection);

    // Build query based on status filter
    let query = {};
    if (statusFilter === "enabled") {
      query.enabled = true;
    } else if (statusFilter === "disabled") {
      query.enabled = false;
    }

    const gameConfigs = await GameConfig.find(query)
      .select("name type enabled botenabled gameId")
      .sort({ gameId: 1 });

    const formattedGames = gameConfigs.map((game) => ({
      id: game._id,
      gameId: game.gameId,
      title: game.name.toUpperCase(),
      botenabled: game.botenabled,
      enabled: game.enabled,
      type: game.type,
    }));

    res.render("pages/game-list", {
      title: "Games List",
      games: formattedGames,
      environments: ENVIRONMENTS,
      currentEnv: selectedEnv,
      currentStatus: statusFilter || "all",
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching games",
      error: error.message,
    });
  }
};

// Update the game list view to show more details
exports.getGameDetails = async (req, res) => {
  try {
    const gameConfig = await GameConfig.findById(req.params.id);
    if (!gameConfig) {
      return res.status(404).json({
        status: "error",
        message: "Game not found",
      });
    }

    res.json({
      status: "success",
      data: {
        name: gameConfig.name,
        type: gameConfig.type,
        enabled: gameConfig.enabled,
        minbet: gameConfig.minbet,
        maxbet: gameConfig.maxbet,
        disabled_message: gameConfig.disabled_message,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching game details",
      error: error.message,
    });
  }
};

// Add new controller method for toggling schedule
exports.toggleGameStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { disabled } = req.body;
    const { env } = req.query;

    const connection = await connectDB(env);
    const GameConfig = getModel(connection);

    const gameConfig = await GameConfig.findById(id);
    if (!gameConfig) {
      return res.status(404).json({
        status: "error",
        message: "Game not found",
      });
    }

    gameConfig.enabled = !disabled;
    await gameConfig.save();

    res.json({
      status: "success",
      message: `Game ${!disabled ? "enabled" : "disabled"} successfully`,
      data: {
        enabled: gameConfig.enabled,
      },
    });
  } catch (error) {
    console.error("Error toggling game status:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating game status",
      error: error.message,
    });
  }
};
