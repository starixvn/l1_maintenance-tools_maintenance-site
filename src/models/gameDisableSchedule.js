const mongoose = require("mongoose");

const gameDisableScheduleSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameConfig",
      required: true,
    },
    environment: {
      type: String,
      required: true,
    },
    scheduleTime: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "game_disable_schedules",
    timestamps: true,
  }
);

const getModel = (connection) =>
  connection.model("GameDisableSchedule", gameDisableScheduleSchema);

module.exports = { gameDisableScheduleSchema, getModel };
