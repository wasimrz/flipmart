import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import morgan from "morgan";

import bodyParser from "body-parser";
import express, { Request, Response, NextFunction } from "express";
import config from "./config/index";
import Boom from "@hapi/boom";
const app = express();
import * as api from "./api/index";

import { isDef, errBuilder } from "./api/helpers/index";

//DB Connect
const connection = require("./config/connection");
connection();

//ROUTES
import categoryRoutes from "./routes/categories";
import productRoutes from "./routes/products";
const apiRoutes = express.Router();

//BODY-PARSER

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

////////////////////////////////////////
// server static files////////////////
///////////////////////////////////////
const publicDir = `${__dirname}/public`;
const tmpDir = `${__dirname}/public/tmp`;
const filesDir = `${__dirname}/public/files`;
const logsDir = `${__dirname}/logs`;

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
app.use("/public/files", express.static(path.join(__dirname, "public/files")));
app.use("/public/tmp", express.static(path.join(__dirname, "public/tmp")));
app.set("trust proxy", true);
app.use(morgan("combined"));
// log only 4xx and 5xx responses to console
app.use(
  morgan("dev", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);

// log all requests to access.log
app.use(
  morgan("common", {
    stream: fs.createWriteStream(path.join(__dirname, "logs", "access.log"), {
      flags: "a",
    }),
  })
);

//CORS
apiRoutes.use(api.cors);
apiRoutes.use("/product", productRoutes);
apiRoutes.use("/category", categoryRoutes);

app.use("/api", apiRoutes);
// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const final_error = errBuilder(err);
  console.log("final_error");
  console.log(final_error);
  return res.status(final_error.statusCode).send(final_error);
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log("server listening to port:", port);
});
