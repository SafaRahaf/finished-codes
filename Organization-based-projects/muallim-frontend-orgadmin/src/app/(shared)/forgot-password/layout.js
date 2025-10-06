"use client";
import React from "react";

function layout({ children }) {
  return (
    <div className="card w-full md:p-[48px] shadow-authpage  p-8 rounded-[12px] relative z-50 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="md:text-30 text-2xl font-bold my-0 p-0">
          Reset Password
        </h3>
        <p className="font-bold md:block hidden">Step 1/3</p>
      </div>

      <div className="line bg-[#e4e6ea] w-full h-[1px] my-6"></div>
      {children}
    </div>
  );
}

export default layout;
