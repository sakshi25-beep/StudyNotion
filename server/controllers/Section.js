const Section=require("../models/Section");
const Course=require("../models/Course");
exports.createSection=async(req,res)=>{
    try{
     //data fetch
     const  {sectionName,courseId}=req.body;

     //data validation
     if(!sectionName||!courseId){
       return res.status(400).json({
        success:false,
        message:'missing properties',
       });
     }
     //create section
     const newSection=await Section.create({sectionName});
     //update course with section objectid
     const updatedCourseDetails=await Course.findByIdAndUpdate(
        courseId,{
            $push:{
                courseContent:newSection._id,
            }
        },
        {new:true},
     ).populate({
      path:"courseContent",
      populate:{
        path:"subSection"
      },
     })
     .exec();
     // hw use populate to replace section /subsection both in the updatedcoursedetails
     //return response
     return res.status(200).json({
        success:true,
        message:'section created successfully',
        updatedCourseDetails,
     })

    }
    catch(error){
      return res.status(500).json({
        success:false,
        message:'unable to create section please try again',
        error:error.message
      })
    }
}
//update a section
exports.updateSection=async(req,res)=>{
    try{
   //data input
   const{sectionName,sectionId}=req.body;
   //validation
    if(!sectionName||!sectionId){
       return res.status(400).json({
        success:false,
        message:'missing properties',
       });
     }
   //update a data
   const section=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
   //return response
   return res.status(200).json({
    success:true,
    message:'section updated successfully'
   })
    }
    catch(error){
      return res.status(500).json({
        success:false,
        message:'unable to update section please try again',
        error:error.message,
      });
    }
}

// delete section
exports.deleteSection = async (req, res) => {
  try {
    // 1. req.params ki jagah req.body se data lein (kyunki POST request hai)
    const { sectionId, courseId } = req.body;

    // 2. Course ke courseContent array se section ki ID hatayein (findByIdAndUpdate use karein)
    await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: { courseContent: sectionId },
      },
      { new: true }
    );

    // 3. Section ko database se delete karein
    await Section.findByIdAndDelete(sectionId);

    // 4. Updated course details fetch karein with population taaki frontend/Redux sync rahe
    const updatedCourseDetails = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    // 5. Response return karein
    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete section please try again",
      error: error.message,
    });
  }
};