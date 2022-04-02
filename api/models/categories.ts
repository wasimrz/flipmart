import { Types, Mongoose, Schema, Model, model, Document } from "mongoose";
const ObjectId = Types.ObjectId;

interface Icategories extends Document {
  name: String;
  image: String;
  description: String;
}

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Category: Model<Icategories> = model("Category", categorySchema);

export default Category;
