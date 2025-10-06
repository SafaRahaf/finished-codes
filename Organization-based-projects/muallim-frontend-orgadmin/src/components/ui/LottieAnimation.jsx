import dynamic from "next/dynamic";
import React from "react";
import SvgLoader from "./loaders/SvgLoader";

// Dynamically import Lottie with no SSR to avoid document access issues
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex justify-center items-center">
      <SvgLoader />
    </div>
  ),
});

const LottieAnimation = ({
  animationData,
  className = "",
  style = {},
  loop = false,
}) => {
  return (
    <div className={className} style={style}>
      <Lottie animationData={animationData} loop={loop} />
    </div>
  );
};

export default LottieAnimation;
