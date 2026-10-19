const User=require("../models/User");
const OTP=require("../models/otp");
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const Profile=require("../models/Profile");
require("dotenv").config();
//send otp
exports.sendOTP=async(req,res)=>{
    try{
       //fetch email
       
       const {email}=req.body;
       //check if user already exist
       const checkUserPresent=await User.findOne({email});
       //if user already exist, then return response
       if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:'User already registered',
        })
       }
       //generate otp

       var otp =otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
       });
       console.log("otp generated:",otp);

       //check unique otp or not
       let result=await OTP.findOne({otp:otp});
       while(result){
        otp=otpGenerator(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
        });
        result=await OTP.findOne({otp:otp});
       }
       const otpPayload ={email,otp};

       //create an entry for otp
       const otpBody= await OTP.create(otpPayload);
       console.log(otpBody);
       //return response successful
       res.status(200).json({
        success:true,
        message:'OTP Sent Successfully',
        otp,
       });

    }
    catch(error){
     console.log(error);
     return res.status(500).json({
        success:false,
        message:error.message,
     })
    }
  
}

//signup
exports.signUp=async(req,res)=>{
    //data fetch from request ki body
    try{
        const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    }= req.body;
    //validate kro
    if(!firstName||!lastName||!email||!password||!confirmPassword||!otp){
        return res.status(403).json({
            success:false,
            message:"all fields are required",
        })
    }
    //2 password match krlo
    if(password!== confirmPassword){
        return res.status(400).json({
            success:false,
            message:'password and ConfirmPassword value does not match,please try again'
        });
    }
    //check user already exist or not
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:'user is already registered',
        });
    }
    //find most recent otp stored for the user
    const recentOtp=await OTP.findOne({email}).sort({createdAt:-1});
console.log(recentOtp);
//validate otp
if(!recentOtp){
    //OTP not found
    return res.status(400).json({
     success:false,
     message:'OTP Not Found',
    })
} else if(otp!==recentOtp.otp){
        //invalid otp
        return res.status(400).json({
            success:false,
            message:"Invalid OTP"
        })
    }
    //hash password
    const hashedPassword=await bcrypt.hash(password,10);

    //entry created in db
    const profileDetails=await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });
    const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
       image: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`

    })
      //return response
      return res.status(200).json({
        success:true,
        message:'user is registered successfully',
        user,
      });
    }
    catch(error){
      console.log(error); 
     return res.status(500).json({
        success:false,
        message:"User cannot be registered please try again",
      })
    }
  

}
//login
exports.login= async(req,res)=>{
    try{
     //get data from request ki body
     const {email,password}=req.body;
     //validation
     if(!email||!password){
        return res.status(403).json({
            success:false,
            message:'ALL Fields are required,please try again ',

        });
     }
     //user check exist or not
     const user=await User.findOne({email}).populate("additionalDetails");
      if(!user){
        return res.status(401).json({
            success:false,
            message:"User is not registered , please signup first",
        });
      }
     // generate jwt after password matching
     if(await bcrypt.compare(password,user.password)){
        const payload={
            email:user.email,
            id:user._id,
            accountType:user.accountType,
        }
      const token =jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:"2h",
      });
      user.token=token;
      user.password=undefined;
       // create cookie and send response
       const options={
        expires:new Date(Date.now()+3*24*60*60*1000),
        httpOnly:true,
       };
       res.cookie("token",token,options).status(200).json({
        success:true,
        token,
        user,
        message:'logged in successfully',
       });
     }
     else{
        return res.status(401).json({
            success:false,
            message:'password is incorrect',
        });
     }
    
    }
    catch(error){
      console.log(error);
      return res.status(500).json({
        success:false,
        message:'Login Failure please try again',
      });
    }
}
// changepassword
exports.changePassword=async(req,res)=>{
    try{
      //get data from req body
      const{oldPassword,newPassword,confirmPassword}=req.body;
      const userId=req.user.id;
      //validation
      if(!oldPassword||!confirmPassword||!newPassword){
        return res.status(403).json({
            success:false,
            message:"all fields are required",
        });
      }
      if(newPassword!==confirmPassword){
         return res.status(403).json({
            success:false,
            message:"new passowrd and confirm password do not match",
        });
      }
      //find user
      const userDetails=await User.findById(userId);
      //4.match old password with hashed password n db
      const isPasswordMatch=await bcrypt.compare(oldPassword,userDetails.password);
       if(!isPasswordMatch){
        return res.status(401).json({
           
                success:false,
                message:"old password is incorrect",

           
        });
       }
       //hashed password and update in db
       const encryptedPassword=await bcrypt.hash(newPassword,10);
       const updatedUserDetails=await User.findByIdAndUpdate(
        userId,
            { password: encryptedPassword },
            { new: true }
       );
       //send mail
       try {
            await mailSender(
                updatedUserDetails.email,
                "Password Updated Successfully",
                "Your password has been changed successfully."
            );
        } catch (emailErr) {
            console.log("Error sending email:", emailErr);
        }
       return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch(error){
      console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
        });
    }
    
   
}