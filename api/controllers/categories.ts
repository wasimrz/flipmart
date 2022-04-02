import { RequestHandler } from "express";
import { errBuilder, isDef, successHandler } from "../helpers";
import * as Boom from "@hapi/boom";
import { isEmpty, capitalize, trim } from "lodash";
import config from "../../config/index";
import { isValidObjectId } from "mongoose";
import Category from "../models/categories";
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
import { getFilesAndFieldsFromRequest } from "../services";

export const createCategories: RequestHandler = async (req, res, next) => {
  try {
    const options: any = await getFilesAndFieldsFromRequest(req);

    let fields = options.fields;
    let files = options.files;
    if (!isDef(fields.name) || isEmpty(fields.name)) {
      throw Boom.badRequest("Name Is Required");
    }
    if (!isDef(fields.description) || isEmpty(fields.description)) {
      throw Boom.badRequest("Description is required");
    }

    if (!isDef(files) || isEmpty(files)) {
      throw Boom.notFound("File needs to be uploaded");
    }
    let isCategoryPresent = await Category.findOne({
      name: capitalize(fields.name),
      deleted: false,
    });

    if (isDef(isCategoryPresent) || !isEmpty(isCategoryPresent)) {
      throw Boom.badRequest("Category already exist");
    }
    interface category {
      name: string;
      description: string;
      image: string;
    }
    const categoryObject: category = {
      name: capitalize(fields.name),
      description: fields.description,
      image: files.file.filepath,
    };

    const savedCategory = await new Category({ ...categoryObject }).save();

    if (!isDef(savedCategory) || isEmpty(savedCategory)) {
      throw Boom.badRequest("Somenthing went wrong");
    }

    return successHandler(res, savedCategory, "Save category successfully");
  } catch (error: any) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};
