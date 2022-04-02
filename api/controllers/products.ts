import { RequestHandler } from "express";
import { errBuilder, isDef, successHandler } from "../helpers";
import * as Boom from "@hapi/boom";
import { isEmpty, capitalize, trim, map, forEach, find } from "lodash";
import config from "../../config/index";
import { isValidObjectId, ObjectId } from "mongoose";
import Category from "../models/categories";
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
import { getFilesAndFieldsFromRequest } from "../services";
import Product from "../models/products";
import ProductCategory from "../models/productCategories";
import ProductImage from "../models/productImages";

export const createAProduct: RequestHandler = async (req, res, next) => {
  try {
    const options: any = await getFilesAndFieldsFromRequest(req);
    //name price image category

    let fields = options.fields;
    let files = options.files;

    if (!isDef(fields.name) || isEmpty(fields.name)) {
      throw Boom.badRequest("Name Is Required");
    }
    if (!isDef(fields.price)) {
      throw Boom.badRequest("price is required");
    }
    if (!isValidObjectId(fields.category)) {
      throw Boom.badRequest("Valid category id required");
    }

    if (!isDef(files) || isEmpty(files)) {
      throw Boom.notFound("File needs to be uploaded");
    }

    interface product {
      name: string;
      price: number;
    }
    const productObject: product = {
      name: capitalize(fields.name),
      price: fields.price,
    };

    let savedProduct = await new Product({ ...productObject }).save();

    if (!isDef(savedProduct) || isEmpty(savedProduct)) {
      throw Boom.badRequest("Somenthing went wrong");
    }

    let isCategoryPresent = await Category.findOne({
      _id: fields.category,
    }).lean();
    if (!isDef(isCategoryPresent) || isEmpty(isCategoryPresent)) {
      throw Boom.badRequest("Category not found");
    }
    interface productCategory {
      product: ObjectId;
      category: string;
    }
    const productCategoryObject: productCategory = {
      product: savedProduct?._id,
      category: fields?.category,
    };

    let savedProductCategory = await new ProductCategory({
      ...productCategoryObject,
    }).save();

    if (!isDef(savedProductCategory) || isEmpty(savedProductCategory)) {
      throw Boom.badRequest(
        "something went wrong product category creation failed"
      );
    }

    let old_path = files.file.filepath;
    let file_name = `${Date.now()}-${files.file.originalFilename}`;
    console.log({ file_name });
    let new_path = path.join(__dirname, "../../public/files", file_name);

    //Moving file to new location
    fs.renameSync(old_path, new_path, (err: any) => {
      if (err) {
        throw Boom.badRequest("Something went wrong unable to move file");
      }
    });

    interface productImage {
      image: string;
      product: ObjectId;
    }
    const productImageObject: productImage = {
      product: savedProduct?._id,
      image: new_path,
    };

    let savedProductImage = await new ProductImage({
      ...productImageObject,
    }).save();
    if (!isDef(savedProductImage) || isEmpty(savedProductImage)) {
      throw Boom.badRequest("Something went wrong product image save failed");
    }

    return successHandler(
      res,
      {
        product: savedProduct,
        category: savedProductCategory,
        productImage: savedProductImage,
      },
      "Save product successfully"
    );
  } catch (error: any) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

export const updateAProduct: RequestHandler = async (req, res, next) => {
  try {
    let productId = req.params.productId;

    if (
      !isDef(productId) ||
      isEmpty(productId) ||
      !isValidObjectId(productId)
    ) {
      throw Boom.badRequest("Valid Product id required");
    }
    let isProductPresent = await Product.findOne({
      _id: productId,
    }).lean();

    if (!isDef(isProductPresent) || isEmpty(isProductPresent)) {
      throw Boom.badRequest("Product not found");
    }
    const options: any = await getFilesAndFieldsFromRequest(req);

    let fields = options.fields;
    let files = options.files;
    if (isDef(fields.name) && isEmpty(fields.name)) {
      throw Boom.badRequest("Name Is Required");
    }

    if (isDef(fields.category) && !isValidObjectId(fields.category)) {
      throw Boom.badRequest("Valid category id required");
    }

    if (isDef(fields.category) && !isEmpty(fields.category)) {
      let isCategoryPresent = await Category.findOne({
        _id: fields.category,
      }).lean();

      if (!isDef(isCategoryPresent) || isEmpty(isCategoryPresent)) {
        throw Boom.badRequest("Category not found");
      }
    }

    let productObject = {};

    if (isDef(fields.name) && !isEmpty(fields.name)) {
      productObject = {
        ...productObject,
        name: capitalize(fields?.name),
      };
    }
    if (isDef(fields.price)) {
      productObject = {
        ...productObject,
        price: fields?.price,
      };
    }
    let updatedProduct = null;
    if (isDef(productObject) && !isEmpty(productObject)) {
      updatedProduct = await Product.findOneAndUpdate(
        { _id: productId },
        { ...productObject },
        { new: true }
      );
    }

    let categoryObject = {};

    if (isDef(fields.category) && !isEmpty(fields.category)) {
      categoryObject = {
        ...categoryObject,
        category: fields.category,
      };
    }

    let updatedCategory = null;
    if (isDef(categoryObject) && !isEmpty(categoryObject)) {
      updatedCategory = await ProductCategory.findOneAndUpdate(
        {
          product: isProductPresent?._id,
        },
        { ...categoryObject },
        { new: true }
      );
    }
    let new_path = null;
    if (isDef(files?.file?.filepath)) {
      let productImage: any = await ProductImage.findOne({
        product: productId,
      }).lean();

      if (!isDef(productImage)) {
        throw Boom.badRequest("product image not found");
      }
      let old_path = files.file.filepath;
      let file_name = `${Date.now()}-${files.file.originalFilename}`;
      console.log({ file_name });
      new_path = path.join(__dirname, "../../public/files", file_name);

      //Moving file to new location
      fs.renameSync(old_path, new_path, (err: any) => {
        if (err) {
          throw Boom.badRequest("Something went wrong unable to move file");
        }
      });
      console.log({ productImage });
      let paths = [productImage.image];
      console.log(paths);
      dataDeleter(paths);
    }

    let productImageObject = {};

    if (isDef(files?.file?.filepath)) {
      productImageObject = {
        ...productImageObject,
        image: new_path,
      };
    }
    let updatedProductImage = null;

    if (isDef(productImageObject) && !isEmpty(productImageObject)) {
      updatedProductImage = await ProductImage.findOneAndUpdate(
        { product: isProductPresent?._id },
        { ...productImageObject },
        { new: true }
      );
    }

    if (
      isEmpty(productImageObject) &&
      isEmpty(productObject) &&
      isEmpty(categoryObject)
    ) {
      throw Boom.badRequest("Update data required");
    }

    let finalRes = {};

    if (isDef(updatedProduct)) {
      finalRes = { updatedProduct };
    }

    if (isDef(updatedCategory)) {
      finalRes = { ...finalRes, updatedCategory };
    }

    if (isDef(updatedProductImage)) {
      finalRes = { ...finalRes, updatedProductImage };
    }
    return successHandler(res, finalRes, "Update product successfully");
  } catch (error: any) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

export const getAllProduct: RequestHandler = async (req, res, next) => {
  try {
    let category = req.query.category;
    let productList: any = [];
    let findQuery = null;
    if (isDef(category)) {
      findQuery = { category: category?.toString() };
    } else {
      findQuery = {};
    }

    let productsCategories: any = await ProductCategory.find(
      findQuery
    ).populate([{ path: "product" }, { path: "category" }]);

    if (!isDef(productsCategories) || isEmpty(productsCategories)) {
      productsCategories = [];
    }
    let productIds = map(productsCategories, "product");

    let productImages = await ProductImage.find({
      product: { $in: productIds },
    });

    forEach(productsCategories, (productCategory) => {
      let result: any = find(productImages, function (image) {
        return (
          image.product.toString() === productCategory.product._id.toString()
        );
      });

      if (!isEmpty(result)) {
        productList.push({
          _id: productCategory?.product._id,
          name: productCategory?.product?.name,
          price: productCategory?.product?.price,
          category: productCategory?.category?.name,
          categoryId: productCategory?.category?._id,
          image: result.image,
        });
      }
    });

    return successHandler(res, productList, "Product fetched successfully");
  } catch (error: any) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

export const getAProduct: RequestHandler = async (req, res, next) => {
  try {
    let productId = req.params.productId;
    if (!isDef(productId) || isEmpty(productId)) {
      throw Boom.badRequest("Product id required");
    }

    let isProductPresent = await Product.findOne({ _id: productId }).lean();
    if (!isDef(isProductPresent) || isEmpty(isProductPresent)) {
      throw Boom.badRequest("Product not found");
    }

    let productDetails: any = await ProductCategory.findOne({
      product: productId,
    }).populate([{ path: "product" }, { path: "category" }]);

    let productImage: any = await ProductImage.findOne({
      product: productId,
    });

    let product = {
      _id: productDetails?.product?._id,
      name: productDetails?.product?.name,
      price: productDetails?.product?.price,
      category: productDetails?.category?.name,
      categoryId: productDetails?.category?._id,
      image: productImage.image,
    };
    return successHandler(res, { product }, "Product fetched successfully");
  } catch (error: any) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

export const deleteAProduct: RequestHandler = async (req, res, next) => {
  try {
    let productIds = req.body.productIds;
    if (!isDef(productIds) || isEmpty(productIds)) {
      throw Boom.badRequest("Product id required");
    }

    let existingProduct = await Product.find({
      _id: { $in: productIds },
    }).lean();
    if (!isDef(existingProduct) || isEmpty(existingProduct)) {
      throw Boom.badRequest("Product not found");
    }

    let existingProductImage = await ProductImage.find({
      product: { $in: productIds },
    }).lean();
    console.log({ existingProductImage });
    await Product.deleteMany({ _id: { $in: productIds } });
    await ProductCategory.deleteMany({ product: { $in: productIds } });
    await ProductImage.deleteMany({ product: { $in: productIds } });
    let images = map(existingProductImage, "image");
    dataDeleter(images);

    return successHandler(res, "Product deleted successfully");
  } catch (error: any) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

////////////////////////////
/////COMMON FUNCTION
///////////////////////////

function dataDeleter(data: any) {
  return Promise.all(
    map(
      data,
      (file: any) =>
        new Promise((res, rej) => {
          try {
            fs.unlink(file, (err: any) => {
              if (err) throw err;
            });
          } catch (err: any) {
            console.log(err.message);
          }
        })
    )
  );
}
