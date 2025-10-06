"use client";
import React from "react";
import Link from "next/link";
function page() {
  const [timer, setTimer] = React.useState(600);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  return (
    <div>
      <p className="text-14">
        We sent a verification code to <b>+1 85* ***-**23.</b> Check your email
        and enter the code.
      </p>

      <div className="mt-8 mb-6">
        <div className="flex justify-center items-center gap-6">
          <input
            type="text"
            className="border-[1px] rounded-[4px] border-[#949BAA] h-[60px] w-[60px] text-center"
          />
          <input
            type="text"
            className="border-[1px] rounded-[4px] border-[#949BAA] h-[60px] w-[60px] text-center"
          />
          <input
            type="text"
            className="border-[1px] rounded-[4px] border-[#949BAA] h-[60px] w-[60px] text-center"
          />
          <input
            type="text"
            className="border-[1px] rounded-[4px] border-[#949BAA] h-[60px] w-[60px] text-center"
          />
          <input
            type="text"
            className="border-[1px] rounded-[4px] border-[#949BAA] h-[60px] w-[60px] text-center"
          />
          <input
            type="text"
            className="border-[1px] rounded-[4px] border-[#949BAA] h-[60px] w-[60px] text-center"
          />
        </div>
      </div>

      <div className="flex mt-4 justify-between items-center gap-2">
        <span className="text-14 font-bold">{formatTime(timer)}</span>
        <Link href="/" className="underline text-14 font-bold">
          Resend Code
        </Link>
      </div>

      <div className="mt-10 text-center">
        <button className="btn btn-black bg-black text-white rounded-[8px] py-[12px] px-[200px] text-lg font-bold inline-block mx-auto">
          Verify
        </button>
      </div>
    </div>
  );
}

export default page;
