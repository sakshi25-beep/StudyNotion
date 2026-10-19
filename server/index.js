const express = require("express");
const app = express();

// 1. Sabse pehle dotenv ko yahan rakhein
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 4000;

// 2. Ab baaki saare requires likhein
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactRoute = require("./routes/Contact");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");

//DATABASE connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3001",
        credentials: true,
    })
);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
);
//cloudinary connection 
cloudinaryConnect();

//
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactRoute);

//default route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: 'your server is up and running....'
    });
});

//activate the server
app.listen(PORT, () => {
    console.log(`app is running at ${PORT}`);
});