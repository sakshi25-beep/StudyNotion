const SubSection=require("../models/SubSection");
const Section=require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


exports.createSubSection = async (req, res) => {
    try {
        // Fetch data from req.body
        const { sectionId, title, description } = req.body;
        // Extract files
        const video = req.files?.videoFile;

        // Validation (timeDuration ko optional kar diya hai)
        if (!sectionId || !title || !description || !video) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // Upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // Create a sub section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration || "0"}`, // Cloudinary se duration lein ya default "0" rakhein
            description: description,
            videoUrl: uploadDetails.secure_url,
        });

        // Update section with the subsection objectID and populate
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {
                $push: {
                    subSection: subSectionDetails._id,
                }
            },
            { new: true }
        ).populate("subSection");

        // Return response
        return res.status(200).json({
            success: true,
            message: 'Sub Section created Successfully',
            updatedSection,
        });
    } catch (error) {
        console.error("ERROR IN CREATE SUBSECTION:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
//hw update subsection
exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, title, description, timeDuration } = req.body;
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // Update fields if provided
        if (title !== undefined) {
            subSection.title = title;
        }
        if (description !== undefined) {
            subSection.description = description;
        }
        if (timeDuration !== undefined) {
            subSection.timeDuration = timeDuration;
        }

        // Check if a new video file is uploaded
        if (req.files && req.files.videoFile !== undefined) {
            const video = req.files.videoFile;
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = timeDuration || subSection.timeDuration;
        }

        await subSection.save();

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            subSection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the subsection",
            error: error.message,
        });
    }
};
//hw delete sub section
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body; // or req.params

        // 1. Remove subsection reference from Section schema
        await Section.findByIdAndUpdate(
            sectionId,
            {
                $pull: { subSection: subSectionId },
            },
            { new: true }
        );

        // 2. Delete the subsection document itself
        await SubSection.findByIdAndDelete(subSectionId);

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the subsection",
            error: error.message,
        });
    }
};