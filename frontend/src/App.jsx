import { useState } from 'react'
import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux"; 
import './App.css'

import Home from "./pages/Home"
import Navbar from "./componenets/Common/Navbar"
import Login from './pages/login';
import Signup from './pages/Signup';
import OpenRoute from "./componenets/core/Auth/OpenRoute";
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import VerifyEmail from './pages/VerifyEmail';
import About from './pages/About';
import PrivateRoute from "./componenets/core/Auth/PrivateRoute"
import MyProfile from './componenets/core/Dashboard/MyProfile';
import Dashboard from './pages/Dashboard';
import Settings from './componenets/core/Dashboard/Settings';
import EnrolledCourses from './componenets/core/Dashboard/EnrolledCourses';
import Cart from "./componenets/core/Dashboard/Cart"
import AddCourse from "./componenets/core/Dashboard/AddCourse";
import EditCourse from "./componenets/core/Dashboard/EditCourse"
import Contact from './pages/Contact';
import Instructor from "./componenets/core/Dashboard/Instructor"
import CourseDetails from './pages/CourseDetails';
import MyCourses from "./componenets/core/Dashboard/MyCourses"
import ViewCourse from "./pages/ViewCourse"; 
import VideoDetails from "./componenets/core/ViewCourse/VideoDetails"; 
import Error from "./pages/Error"; 
import { ACCOUNT_TYPE } from "./utils/constants"; 
import Catalog from './pages/Catalog';

function App() {
  const { user } = useSelector((state) => state.profile); 

  return (
    <div className='flex min-h-screen w-screen flex-col bg-richblack-900 font-inter'>
      <Navbar />
      <Routes>
        {/* Baaki saare routes wahi rahenge jo aapne likhe hain */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
         <Route path="catalog/:catalogName" element={<Catalog />} />
        {/* Open Routes */}
        <Route path="login" element={<OpenRoute><Login /></OpenRoute>} />
        <Route path="forgot-password" element={<OpenRoute><ForgotPassword /></OpenRoute>} />
        <Route path="update-password/:id" element={<OpenRoute><UpdatePassword /></OpenRoute>} />
        <Route path="signup" element={<OpenRoute><Signup /></OpenRoute>} />
        <Route path="verify-email" element={<OpenRoute><VerifyEmail /></OpenRoute>} />

        {/* Private Dashboard Routes */}
       <Route element={<PrivateRoute><Dashboard /></PrivateRoute>}>
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/settings" element={<Settings />} />
          <Route path="dashboard/instructor" element={<Instructor />} />
          <Route path="dashboard/my-courses" element={<MyCourses />} />
          <Route path="dashboard/add-course" element={<AddCourse />} />
          <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
          <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
          <Route path="dashboard/cart" element={<Cart />} />
        </Route>

         

         

        {/* View Course Routes */}
        <Route element={<PrivateRoute><ViewCourse /></PrivateRoute>}>
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <Route path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId" element={<VideoDetails />} />
          )}
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  )
}

export default App