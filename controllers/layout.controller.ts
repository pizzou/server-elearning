import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

// create layout
export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;

    // Check if layout type already exists
    const isTypeExist = await LayoutModel.findOne({ type });
    if (isTypeExist) {
      return next(new ErrorHandler(`${type} already exists`, 400));
    }

    try {
      if (type === "Banner") {
        const { image, title, subTitle } = req.body;

        // Upload image to Cloudinary
        const myCloud = await cloudinary.v2.uploader.upload(image, {
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

        await LayoutModel.create(banner);
      } else if (type === "FAQ") {
        const { faq } = req.body;
        const faqItems = faq.map((item: any) => ({
          question: item.question,
          answer: item.answer,
        }));

        await LayoutModel.create({ type: "FAQ", faq: faqItems });
      } else if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItems = categories.map((item: any) => ({
          title: item.title,
        }));

        await LayoutModel.create({
          type: "Categories",
          categories: categoriesItems,
        });
      }

      res.status(201).json({
        success: true,
        message: "Layout created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Edit layout
export const editLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;

    try {
      if (type === "Banner") {
        const { image, title, subTitle } = req.body;
        const bannerData: any = await LayoutModel.findOne({ type: "Banner" });

        // Check if the image is already a URL, else upload a new image
        const cloudinaryResponse = image.startsWith("https")
          ? bannerData
          : await cloudinary.v2.uploader.upload(image, {
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

        await LayoutModel.findByIdAndUpdate(bannerData._id, { banner });
      } else if (type === "FAQ") {
        const { faq } = req.body;
        const FaqItem = await LayoutModel.findOne({ type: "FAQ" });

        const faqItems = faq.map((item: any) => ({
          question: item.question,
          answer: item.answer,
        }));

        await LayoutModel.findByIdAndUpdate(FaqItem?._id, {
          type: "FAQ",
          faq: faqItems,
        });
      } else if (type === "Categories") {
        const { categories } = req.body;
        const categoriesData = await LayoutModel.findOne({
          type: "Categories",
        });

        const categoriesItems = categories.map((item: any) => ({
          title: item.title,
        }));

        await LayoutModel.findByIdAndUpdate(categoriesData?._id, {
          type: "Categories",
          categories: categoriesItems,
        });
      }

      res.status(200).json({
        success: true,
        message: "Layout updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get layout by type
export const getLayoutByType = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      console.log("Fetching layout for type:", type); // Log the type being requested

      const layout = await LayoutModel.findOne({ type });
      if (!layout) {
        console.log(`Layout of type ${type} not found`); // Log if layout is not found
        return next(new ErrorHandler(`Layout of type ${type} not found`, 404));
      }

      res.status(200).json({
        success: true,
        layout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

