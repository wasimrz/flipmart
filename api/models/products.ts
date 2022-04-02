import { Types, Mongoose, Schema, Model, model, Document } from "mongoose";
const ObjectId = Types.ObjectId;

interface IProduct extends Document {
  price: Number;
  name: String;
  ctreatedAt: String;
}

const productSchema = new Schema(
  {
    price: { type: Number },
    name: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> = model("Product", productSchema);
export default Product;
