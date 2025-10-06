"use client";
import LottieAnimation from "@/components/ui/LottieAnimation";
import animationData from "./../../../../public/assets/lottie/commin_soon.json";
import React from "react";

const Branch = () => {
  return (
    <div className="w-full mt-20 flex justify-center items-center">
      <div style={{ width: "600px", height: "600px" }}>
        <LottieAnimation animationData={animationData} />
      </div>
    </div>
  );
};

export default Branch;
