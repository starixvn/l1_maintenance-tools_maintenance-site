const { connectDB, DB_CONFIGS } = require("../config/database");
const { getModel: getGameModel } = require("../models/gameConfig");
const { getModel: getScheduleModel } = require("../models/gameDisableSchedule");
const schedule = require("node-schedule");

const ENVIRONMENTS = Object.keys(DB_CONFIGS);
const scheduleJobs = new Map(); // Store scheduled jobs in memory

// Schedule management functions
const handleScheduleCleanup = async (
  jobKey,
  GameDisableSchedule,
  gameId,
  env
) => {
  // Cancel existing job
  if (scheduleJobs.has(jobKey)) {
    scheduleJobs.get(jobKey).cancel();
    scheduleJobs.delete(jobKey);
  }

  // Deactivate existing schedules
  await GameDisableSchedule.updateMany(
    { gameId, environment: env },
    { isActive: false }
  );
};

const createScheduleRule = (scheduleTime, timezone) => {
  const [hours, minutes] = scheduleTime.split(":").map(Number);
  const rule = new schedule.RecurrenceRule();
  rule.hour = hours;
  rule.minute = minutes;
  rule.tz = timezone;
  return rule;
};

const createDisableJob = async (id, env) => {
  const connection = await connectDB(env);
  const GameConfig = getGameModel(connection);

  const game = await GameConfig.findById(id);
  if (game && game.enabled) {
    game.enabled = false;
    await game.save();
    console.log(`Scheduled disable executed for game ${game.name} in ${env}`);
  }
};

const setupScheduleJob = (rule, id, env, jobKey) => {
  const job = schedule.scheduleJob(rule, async function () {
    try {
      await createDisableJob(id, env);
    } catch (error) {
      console.error("Schedule execution error:", error);
    }
  });

  scheduleJobs.set(jobKey, job);
};

// Main controller method
exports.scheduleGameDisable = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleTime, timezone, env } = req.body;
    console.log(req.body);

    const connection = await connectDB(env);
    const GameConfig = getGameModel(connection);
    const GameDisableSchedule = getScheduleModel(connection);

    // Validate game exists
    const gameConfig = await GameConfig.findById(id);
    if (!gameConfig) {
      return res.status(404).json({
        status: "error",
        message: "Game not found",
      });
    }

    const jobKey = `${env}-${id}`;

    // Clean up existing schedules
    await handleScheduleCleanup(jobKey, GameDisableSchedule, id, env);

    // Handle schedule clearing
    if (!scheduleTime) {
      return res.json({
        status: "success",
        message: "Schedule cleared successfully",
      });
    }

    // Create new schedule in database
    await GameDisableSchedule.create({
      gameId: id,
      environment: env,
      scheduleTime,
      timezone,
      isActive: true,
    });

    // Set up new schedule
    const rule = createScheduleRule(scheduleTime, timezone);
    setupScheduleJob(rule, id, env, jobKey);

    res.json({
      status: "success",
      message: `Game scheduled to disable daily at ${scheduleTime}`,
      data: { scheduleTime },
    });
  } catch (error) {
    console.error("Error scheduling game disable:", error);
    res.status(500).json({
      status: "error",
      message: "Error scheduling game disable",
      error: error.message,
    });
  }
};

// Initialize schedules on server start
exports.initializeSchedules = async () => {
  try {
    for (const env of ENVIRONMENTS) {
      const connection = await connectDB(env);
      const GameDisableSchedule = getScheduleModel(connection);

      const activeSchedules = await GameDisableSchedule.find({
        environment: env,
        isActive: true,
      });

      for (const scheduleConfig of activeSchedules) {
        const { gameId, scheduleTime, timezone } = scheduleConfig;
        const jobKey = `${env}-${gameId}`;

        const rule = createScheduleRule(scheduleTime, timezone);
        setupScheduleJob(rule, gameId, env, jobKey);
      }
    }
    console.log("Game disable schedules initialized");
  } catch (error) {
    console.error("Error initializing schedules:", error);
  }
};

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
    const statusFilter = req.query.status;
    const connection = await connectDB(selectedEnv);
    const GameConfig = getGameModel(connection);
    const GameDisableSchedule = getScheduleModel(connection);

    let query = {};
    if (statusFilter === "enabled") {
      query.enabled = true;
    } else if (statusFilter === "disabled") {
      query.enabled = false;
    }

    const gameConfigs = await GameConfig.find(query)
      .select("name type enabled botenabled gameId")
      .sort({ gameId: 1 });

    // Fetch schedules for all games
    const schedules = await GameDisableSchedule.find({
      environment: selectedEnv,
      isActive: true,
    });

    // Create a map of game ID to schedule time
    const scheduleMap = new Map(
      schedules.map((schedule) => [
        schedule.gameId.toString(),
        schedule.scheduleTime,
      ])
    );

    const formattedGames = gameConfigs.map((game) => ({
      id: game._id,
      gameId: game.gameId,
      title: game.name.toUpperCase(),
      botenabled: game.botenabled,
      enabled: game.enabled,
      type: game.type,
      scheduledDisableTime: scheduleMap.get(game._id.toString()) || "",
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
    const GameConfig = getGameModel(connection);

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

// Add new controller method for disabling all games
exports.disableAllGames = async (req, res) => {
  try {
    const { env } = req.body;

    const connection = await connectDB(env);
    const GameConfig = getGameModel(connection);

    // Update all enabled games to disabled
    const result = await GameConfig.updateMany(
      { enabled: true },
      { enabled: false }
    );

    res.json({
      status: "success",
      message: `Disabled ${result.modifiedCount} games successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error disabling all games:", error);
    res.status(500).json({
      status: "error",
      message: "Error disabling all games",
      error: error.message,
    });
  }
};

// Add new controller method for enabling all games
exports.enableAllGames = async (req, res) => {
  try {
    const { env } = req.body;

    const connection = await connectDB(env);
    const GameConfig = getGameModel(connection);

    // Update all disabled games to enabled
    const result = await GameConfig.updateMany(
      { enabled: false },
      { enabled: true }
    );

    res.json({
      status: "success",
      message: `Enabled ${result.modifiedCount} games successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error enabling all games:", error);
    res.status(500).json({
      status: "error",
      message: "Error enabling all games",
      error: error.message,
    });
  }
};
