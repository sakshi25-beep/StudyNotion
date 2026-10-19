import React from "react";

const Stats = [
  { count: "5K", label: "Active Students" },
  { count: "10+", label: "Mentors" },
  { count: "200+", label: "Courses" },
  { count: "50+", label: "Awards" },
];

const StatsComponent = () => {
  return (
    <div className="bg-richblack-700 w-full py-6">
      {/* Stats Container */}
      <div className="w-11/12 max-w-maxContent text-white mx-auto">
        {/* Grid setup */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center items-center justify-center">
          {Stats.map((data, index) => {
            return (
              <div className="flex flex-col py-6 items-center justify-center" key={index}>
                <h1 className="text-[30px] font-bold text-richblack-5">
                  {data.count}
                </h1>
                <h2 className="font-semibold text-[16px] text-richblack-200">
                  {data.label}
                </h2>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsComponent;