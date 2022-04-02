import { Types, Mongoose, Schema, Model, model, Document } from "mongoose";
const ObjectId = Types.ObjectId;

interface IProductImages extends Document {
  product: Types.ObjectId;
  image: String;
}

const productImageSchema = new Schema(
  {
    product: { type: ObjectId, ref: "Product" },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

const ProductImage: Model<IProductImages> = model(
  "ProductImage",
  productImageSchema
);
export default ProductImage;
