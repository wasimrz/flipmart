import Boom from "@hapi/boom";
import config from "../../config";
import { Response } from "express";
import { omit, isNull, isUndefined } from "lodash";
import { isValidObjectId } from "mongoose";

const httpResp = (
  status: boolean,
  message: string,
  code: number,
  data: any,
  metadata?: any
) => {
  const response: any = {
    status: status,
    message: message,
    code: code,
    statusCode: code,
    data: data,
  };
  if (isDef(metadata)) {
    response.metadata = metadata;
  }
  return response;
};

const isDef = (param: any): boolean => {
  if (isNull(param) || isUndefined(param)) {
    return false;
  } else {
    return true;
  }
};

const errBuilder = (err: any) => {
  let final_error = err;

  if (err.isServer) {
    // log the error...
    // probably you don't want to log unauthorized access
    // or do you?
  }

  // Restructuring error data
  // If the error belongs to boom error (Check boom module: https://www.npmjs.com/package/boom)
  if (err.isBoom) {
    console.log("Boom old err");
    console.log(err);
    // err.output.statusCode = 400;
    err.output.payload.status = false;
    err.output.payload.code = err.output.statusCode;
    if (isDef(err.data)) {
      err.output.payload.data = err.data;
    }
    err.reformat();
    console.log("NEW err");
    console.log(err);
    final_error = err.output.payload;
    if (isDef(err.message) && final_error.statusCode == 500) {
      final_error.message = err.message;
    }

    // return res.status(err.output.statusCode).send(err.output.payload);
  } else {
    // If the error are other errors
    err.status = false;
    err.code = err.statusCode;
    if (!isDef(err.message) && isDef(err.type)) {
      err.message = err.type;
    }
  }

  return final_error;
};

const errHandler = (error: any, res: any) => {
  const resp = httpResp(false, "There is some error occured", 500, error);
  return res.status(resp.code).send(resp);
};

const successHandler = (
  res: Response,
  data: any,
  message?: string,
  metadata?: any
) => {
  message = message || "Operation successful";
  let resp;
  if (isDef(metadata)) {
    resp = httpResp(true, message, 200, data, metadata);
  } else {
    resp = httpResp(true, message, 200, data);
  }

  return res.status(resp.code).send(resp);
};

const isLiteralObject = (a: any) => {
  return !!a && a.constructor === Object;
};

// Converts all MongoIDs in the object to the plain string
const leanObject = (object: any) => {
  if (Array.isArray(object)) {
    let array = object;
    array = array.map((obj) => {
      return leanObject(obj);
    });
    return array;
  }
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      if (isDef(object[key])) {
        if (isValidObjectId(object[key]) && !isLiteralObject(object[key])) {
          object[key] = object[key].toString();
        }
        if (typeof object[key] == "object" && isLiteralObject(object[key])) {
          object[key] = leanObject(object[key]);
        }
      } else {
        object = omit(object, [key]);
      }
    }
  }
  return object;
};

export {
  config,
  httpResp,
  isDef,
  errBuilder,
  errHandler,
  successHandler,
  leanObject,
};
