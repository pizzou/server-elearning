"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the FAQ schema
const faqSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});
// Define the Category schema
const categorySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
});
// Define the BannerImage schema
const bannerImageSchema = new mongoose_1.Schema({
    public_id: { type: String, required: true },
    url: { type: String, required: true },
});
// Define the Layout schema
const layoutSchema = new mongoose_1.Schema({
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
const LayoutModel = (0, mongoose_1.model)("Layout", layoutSchema);
exports.default = LayoutModel;
