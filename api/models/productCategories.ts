import { Types, Mongoose, Schema, Model, model, Document } from "mongoose";
const ObjectId = Types.ObjectId;

interface IProductcategories extends Document {
  product: Types.ObjectId;
  category: Types.ObjectId;
}

const productCategorySchema = new Schema(
  {
    product: { type: ObjectId, ref: "Product" },
    category: { type: ObjectId, ref: "Category" },
  },
  {
    timestamps: true,
  }
);

const ProductCategory: Model<IProductcategories> = model(
  "ProductCategory",
  productCategorySchema
);
productCategorySchema.index({ category: 1 });
export default ProductCategory;
