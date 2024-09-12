import { Schema, model, Document } from "mongoose";

// Define the FAQ interface
export interface FaqItem extends Document {
  question: string;
  answer: string;
}

// Define the Category interface
export interface Category extends Document {
  title: string;
}

// Define the BannerImage interface
export interface BannerImage extends Document {
  public_id: string;
  url: string;
}

// Define the main Layout interface
interface Layout extends Document {
  type: string;
  faq?: FaqItem[]; // Optional field
  categories?: Category[]; // Optional field
  banner?: {
    image: BannerImage;
    title: string;
    subTitle: string;
  }; // Optional field
}

// Define the FAQ schema
const faqSchema = new Schema<FaqItem>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

// Define the Category schema
const categorySchema = new Schema<Category>({
  title: { type: String, required: true },
});

// Define the BannerImage schema
const bannerImageSchema = new Schema<BannerImage>({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
});

// Define the Layout schema
const layoutSchema = new Schema<Layout>({
  type: { type: String, required: true }, // The type field is always required
  faq: [faqSchema], // Array of FAQs
  categories: [categorySchema], // Array of Categories
  banner: {
    image: bannerImageSchema,
    title: { type: String, required: true },
    subTitle: { type: String, required: true },
  },
});

// Create and export the Layout model
const LayoutModel = model<Layout>("Layout", layoutSchema);

export default LayoutModel;
