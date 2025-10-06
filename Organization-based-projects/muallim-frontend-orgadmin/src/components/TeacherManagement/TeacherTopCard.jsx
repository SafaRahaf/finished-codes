import React from "react";

const TeacherTopCard = ({ data }) => {
  return (
    <div className="lg:border-r-2 last:border-r-0  border-white  px-6  ">
      <h2 className="text-[48px] block pb-2 font-bold">{data.value}</h2>
      <h4 className="text-[22px] text-[#2C3333] my-5">{data.title}</h4>
      <div className="flex xl:flex-row flex-wrap justify-start xl:items-start gap-4 lg:gap-2  text-[#080D1C] ">
        <div className="flex justify-start  items-center gap-2 text-12 ">
          <div
            className="circle text-xs w-[12px] h-[12px] rounded-full "
            style={{ background: data.color1 }}
          ></div>
          <span>
            {data.value1} {data.title1}
          </span>
        </div>
        <div className="flex justify-start  items-center gap-2  text-12 ">
          <div
            className="circle text-xs w-[12px] h-[12px] rounded-full "
            style={{ background: data.color2 }}
          ></div>
          <span>
            {data.value2} {data.title2}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeacherTopCard;
