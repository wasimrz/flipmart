import * as dotenv from "dotenv";
dotenv.config();

const mongo_port: string = process.env.MONGO_PORT ?? "27017";

// CONFIG File
const commonConfig = {
  mongoUri: process.env.MONGO_URI,
  dbName: "shop",
};

let localConfig = {
  baseApi: "https://localhost:3010/api",
  port: "3010",
  mongoUri: process.env.MONGO_URI,
  dbName: "shop",
};

let stagingConfig = {
  //staging config here
};

let prodConfig = {
  //product config here
};

localConfig = {
  ...commonConfig,
  ...localConfig,
};

stagingConfig = {
  ...commonConfig,
  ...stagingConfig,
};

prodConfig = {
  ...commonConfig,
  ...prodConfig,
};

const env: string = process.env.NODE_ENV ?? "";
console.log("env");
console.log(env);

let config: any = null;
if (env == "local") {
  config = localConfig;
}

if (env == "staging") {
  config = stagingConfig;
}

if (env == "prod") {
  config = prodConfig;
}

config.env = env;
export default config;
