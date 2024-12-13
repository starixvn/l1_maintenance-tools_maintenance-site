const mongoose = require("mongoose");

const gameConfigSchema = new mongoose.Schema(
  {
    type: Number,
    name: String,
    enabled: Boolean,
    botenabled: Boolean,
    minbet: Number,
    maxbet: Number,
    disabledround: Number,
    bot_maxbet: Number,
    hour_maxbot: [Number],
    disabled_message: String,
    choices_maxbet: {
      even: Number,
      odd: Number,
      red3: Number,
      white3: Number,
      red4: Number,
      white4: Number,
      red2: Number,
    },
    odds: {
      even: Number,
      odd: Number,
      red3: Number,
      white3: Number,
      red4: Number,
      white4: Number,
      red2: Number,
    },
    delayStartTime: Number,
    enableFreeBet: Boolean,
    slotsConfig: mongoose.Schema.Types.Mixed,
    siteExclusions: mongoose.Schema.Types.Mixed,
    smartBotEnabled: Boolean,
    smartBotGroupRatio: Number,
    exchangeReload: Boolean,
    reloadExchange: Boolean,
    randomMode: Number,
    gameId: Number,
    time: Date,
  },
  {
    collection: "game_configs",
  }
);

const getModel = (connection) =>
  connection.model("GameConfig", gameConfigSchema);

module.exports = { gameConfigSchema, getModel };
