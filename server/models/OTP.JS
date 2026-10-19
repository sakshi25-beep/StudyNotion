const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
      
        
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60,
    }
});

// Function -> to send email
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email, 
            "Verification Email from StudyNotion", 
            `Your OTP is: ${otp}`
        );
        console.log("Email sent Successfully:", mailResponse);
    } catch (error) {
        console.log("error occured while sending mails:", error);
        throw error;
    }
}

// Yahan 'next' ko hata diya gaya hai kyunki async function khud promise handle karta hai
OTPSchema.pre("save", async function() {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
});

const OTP = mongoose.models.OTP || mongoose.model("otp", OTPSchema);
module.exports = OTP;