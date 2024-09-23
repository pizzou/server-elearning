"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutByType = exports.editLayout = exports.createLayout = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const layout_model_1 = __importDefault(require("../models/layout.model"));
const cloudinary_1 = __importDefault(require("cloudinary"));
// create layout
exports.createLayout = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    const { type } = req.body;
    // Check if layout type already exists
    const isTypeExist = await layout_model_1.default.findOne({ type });
    if (isTypeExist) {
        return next(new ErrorHandler_1.default(`${type} already exists`, 400));
    }
    try {
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            // Upload image to Cloudinary
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "layout",
            });
            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                },
            };
            await layout_model_1.default.create(banner);
        }
        else if (type === "FAQ") {
            const { faq } = req.body;
            const faqItems = faq.map((item) => ({
                question: item.question,
                answer: item.answer,
            }));
            await layout_model_1.default.create({ type: "FAQ", faq: faqItems });
        }
        else if (type === "Categories") {
            const { categories } = req.body;
            const categoriesItems = categories.map((item) => ({
                title: item.title,
            }));
            await layout_model_1.default.create({
                type: "Categories",
                categories: categoriesItems,
            });
        }
        res.status(201).json({
            success: true,
            message: "Layout created successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Edit layout
exports.editLayout = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    const { type } = req.body;
    try {
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const bannerData = await layout_model_1.default.findOne({ type: "Banner" });
            // Check if the image is already a URL, else upload a new image
            const cloudinaryResponse = image.startsWith("https")
                ? bannerData
                : await cloudinary_1.default.v2.uploader.upload(image, {
                    folder: "layout",
                });
            const banner = {
                type: "Banner",
                image: {
                    public_id: image.startsWith("https")
                        ? bannerData.banner.image.public_id
                        : cloudinaryResponse?.public_id,
                    url: image.startsWith("https")
                        ? bannerData.banner.image.url
                        : cloudinaryResponse?.secure_url,
                },
                title,
                subTitle,
            };
            await layout_model_1.default.findByIdAndUpdate(bannerData._id, { banner });
        }
        else if (type === "FAQ") {
            const { faq } = req.body;
            const FaqItem = await layout_model_1.default.findOne({ type: "FAQ" });
            const faqItems = faq.map((item) => ({
                question: item.question,
                answer: item.answer,
            }));
            await layout_model_1.default.findByIdAndUpdate(FaqItem?._id, {
                type: "FAQ",
                faq: faqItems,
            });
        }
        else if (type === "Categories") {
            const { categories } = req.body;
            const categoriesData = await layout_model_1.default.findOne({
                type: "Categories",
            });
            const categoriesItems = categories.map((item) => ({
                title: item.title,
            }));
            await layout_model_1.default.findByIdAndUpdate(categoriesData?._id, {
                type: "Categories",
                categories: categoriesItems,
            });
        }
        res.status(200).json({
            success: true,
            message: "Layout updated successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get layout by type
exports.getLayoutByType = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { type } = req.params;
        console.log("Fetching layout for type:", type); // Log the type being requested
        const layout = await layout_model_1.default.findOne({ type });
        if (!layout) {
            console.log(`Layout of type ${type} not found`); // Log if layout is not found
            return next(new ErrorHandler_1.default(`Layout of type ${type} not found`, 404));
        }
        res.status(200).json({
            success: true,
            layout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
