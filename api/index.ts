import { pick } from "lodash";
import moment from "moment";
import { Request, Response, NextFunction } from "express";

/////////////////////////////
// API FUNCTIONS
/////////////////////////////
export const cors = function (req: Request, res: Response, next: NextFunction) {
  const request = pick(req, ["url", "method", "body", "headers"]);
  (request as any).timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");
  console.log("Incoming Request Object");
  console.log(request);

  //ADD DOMAIN OR IP HERE
  const allowedOrigins = ["http://localhost:3000"];
  const origin: string = req.headers.origin!;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-access-token, apikey, x-refresh-token"
  );
  next();
};
