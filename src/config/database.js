const mongoose = require("mongoose");

const connections = {};

const DB_CONFIGS = {
  "SG-LOCAL0": {
    uri: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39100,10.10.50.13:39100,10.10.50.14:39100/?replicaSet=L1Local&appName=maintenance",
    dbName: "minigame",
  },
  "SG-LOCAL1": {
    uri: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39101,10.10.50.13:39101,10.10.50.14:39101/?replicaSet=L1pLocal&appName=maintenance",
    dbName: "minigame",
  },
  "SG-LOCAL2": {
    uri: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39102,10.10.50.13:39102,10.10.50.14:39102/?replicaSet=L1ppLocal&appName=maintenance",
    dbName: "minigame",
  },
  "SG-LOCAL3": {
    uri: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39103,10.10.50.13:39103,10.10.50.14:39103/?replicaSet=L1pppLocal&appName=maintenance",
    dbName: "minigame",
  },
  "VG-LOCAL0": {
    uri: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39200,10.10.50.13:39200,10.10.50.14:39200/?replicaSet=L2Local&appName=maintenance",
    dbName: "minigame",
  },
  "VG-LOCAL1": {
    uri: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39201,10.10.50.13:39201,10.10.50.14:39201/?replicaSet=L2pLocal&appName=maintenance",
    dbName: "minigame",
  },
  "VG-LOCAL2": {
    uri: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39202,10.10.50.13:39202,10.10.50.14:39202/?replicaSet=L2ppLocal&appName=maintenance",
    dbName: "minigame",
  },
  "SxD-LOCAL0": {
    uri: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39300,10.10.50.13:39300,10.10.50.14:39300/?replicaSet=GNLocal0&appName=maintenance",
    dbName: "minigame",
  },
  "SxD-LOCAL1": {
    uri: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39301,10.10.50.13:39301,10.10.50.14:39301/?replicaSet=GNLocal1&appName=maintenance",
    dbName: "minigame",
  },
  "HD-LOCAL0": {
    uri: "mongodb://hotdog_backend:HotdogBackend@10.10.50.12:39400,10.10.50.13:39400,10.10.50.14:39400/?replicaSet=SPLocal0&appName=maintenance",
    dbName: "hotdog_minigame",
  },
  // DEV: {
  //   uri: "mongodb://localhost:27017/",
  //   dbName: "minigame",
  // },
};

const connectDB = async (environment = "SG-LOCAL1") => {
  try {
    if (connections[environment]) {
      return connections[environment];
    }

    const config = DB_CONFIGS[environment];
    if (!config) {
      throw new Error(`No configuration found for environment: ${environment}`);
    }

    const connection = await mongoose.createConnection(config.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: config.dbName,
    });

    connections[environment] = connection;
    console.log(`MongoDB Connected to ${environment} (${config.dbName})`);
    return connection;
  } catch (error) {
    console.error(`Error connecting to ${environment}:`, error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, connections, DB_CONFIGS };
