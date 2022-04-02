import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import config from "./index";

const mongoUri = process.env.MONGO_URI ?? config.mongoUri;

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "flipmart",
};
export = () => {
  mongoose
    .connect(mongoUri, mongoOptions)
    .then((resp) => {
      console.log(
        "Conncted to Database: " + mongoUri + "/" + mongoOptions.dbName
      );
    })
    .catch((err) => {
      console.log("error", err);
    });

  mongoose.connection.on(
    "error",
    console.error.bind(console, "connection error:")
  );
};
