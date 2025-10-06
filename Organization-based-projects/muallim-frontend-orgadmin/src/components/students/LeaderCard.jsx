import { Carousel } from "antd";
import Image from "next/image";
import React, { useState } from "react";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
const LeaderCard = () => {
  const [dates, setDates] = useState([
    dayjs("2024-10-24"),
    dayjs("2024-10-30"),
  ]);
  return (
    <>
      <div className="w-full   bg-[#FFF3E7] rounded-t-xl px-6 pt-8 ">
        <h2 className="text-2xl font-bold text-gray-900">
          Student of the Week
        </h2>
        {/* date filter */}
        <div className=" border border-black p-1 rounded mt-4 ">
          <RangePicker
            value={dates}
            format={(value) =>
              value
                ? value.format("MMMM D YYYY").charAt(0).toUpperCase() +
                  value.format("MMMM D YYYY").slice(1)
                : ""
            }
            onChange={(value) => setDates(value)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              width: "100%",
              boxShadow: "none",
            }}
            separator="-"
            suffixIcon={
              <button className="text-gray-500 text-lg">
                <Image
                  src="/assets/img/Vector.svg"
                  alt="Student"
                  width={20}
                  height={20}
                />
              </button>
            }
          />
        </div>
      </div>
      <Carousel>
        <>
          <div className="flex justify-center items-end pt-20 bg-[#FFF3E7] px-6">
            {/* -------2nd ---------*/}
            <div className=" text-left leading-normal  bg-[#FEE1C0] rounded-l-lg h-[210px]   w-32 p-2 ">
              <div className="relative -top-9 left-1">
                <Image
                  src="/assets/img/leader2.png"
                  alt="Student"
                  width={50}
                  height={50}
                  className=" rounded-full mb-2"
                />
                <p className="text-[10px]  font-bold text-[#4C5361] text-left w-full">
                  Uthmaan Abdullah Al-Hilal
                </p>
                <p className="text-[10px] text-gray-700 text-left">
                  UQ7684685746
                </p>
              </div>
              <p className="text-[10px]  text-gray-600 font-bold  mb-1 ">
                5468 POINTS
              </p>
              <p className="text-5xl font-bold text-white w-full text-center">
                2
              </p>
            </div>
            {/* -----1st-------- */}

            <div className=" bg-[#FEC98D] leading-normal  rounded-t-lg  w-32 p-2 h-[260px] text-center">
              <div className="relative -top-9 ">
                <Image
                  src="/assets/img/leader1.png"
                  alt="Student"
                  width={50}
                  height={50}
                  className=" rounded-full mb-2 mx-auto"
                />
                <p className="text-[10px]  font-bold text-[#4C5361]  ">
                  Uthmaan Abdullah Al-Hilal
                </p>
                <p className="text-[10px] text-gray-700 ">UQ7684685746</p>
              </div>
              <p className="text-xs text-gray-600 font-bold mt-8 mb-1">
                5468 POINTS
              </p>
              <p className="text-5xl  font-bold text-white w-full ">1</p>
            </div>

            {/* ----------3rd-------- */}
            <div className="text-right leading-normal bg-[#FEE1C0] rounded-r-lg h-[200px]  w-32 p-2 ">
              <div className="relative -top-9 ">
                <Image
                  src="/assets/img/leader3.png"
                  alt="Student"
                  width={50}
                  height={50}
                  className=" rounded-full mb-2 ml-auto"
                />
                <p className="text-[10px] font-bold text-[#4C5361] ">
                  Uthmaan Abdullah Al-Hilal
                </p>
                <p className="text-[10px] text-gray-700 ">UQ7684685746</p>
              </div>
              <p className="text-[10px] text-gray-600 font-bold  mb-1 ">
                5468 POINTS
              </p>
              <p className="text-5xl font-bold text-white  w-full text-center ">
                3
              </p>
            </div>
          </div>

          <p className="text-gray-700 my-5 font-bold text-lg  text-center">
            Grade 5
          </p>
        </>
        <>
          <div className="flex justify-center items-end pt-20 bg-[#FFF3E7] px-6">
            {/* -------2nd ---------*/}
            <div className=" text-left leading-normal  bg-[#FEE1C0] rounded-l-lg h-[210px]   w-32 p-2 ">
              <div className="relative -top-9 left-1">
                <Image
                  src="/assets/img/leader2.png"
                  alt="Student"
                  width={50}
                  height={50}
                  className=" rounded-full mb-2"
                />
                <p className="text-[10px]  font-bold text-[#4C5361] text-left w-full">
                  Uthmaan Abdullah Al-Hilal
                </p>
                <p className="text-[10px] text-gray-700 text-left">
                  UQ7684685746
                </p>
              </div>
              <p className="text-[10px]  text-gray-600 font-bold  mb-1 ">
                5468 POINTS
              </p>
              <p className="text-5xl font-bold text-white w-full text-center">
                2
              </p>
            </div>
            {/* -----1st-------- */}

            <div className=" bg-[#FEC98D] leading-normal  rounded-t-lg  w-32 p-2 h-[260px] text-center">
              <div className="relative -top-9 ">
                <Image
                  src="/assets/img/leader1.png"
                  alt="Student"
                  width={50}
                  height={50}
                  className=" rounded-full mb-2 mx-auto"
                />
                <p className="text-[10px]  font-bold text-[#4C5361]  ">
                  Uthmaan Abdullah Al-Hilal
                </p>
                <p className="text-[10px] text-gray-700 ">UQ7684685746</p>
              </div>
              <p className="text-xs text-gray-600 font-bold mt-8 mb-1">
                5468 POINTS
              </p>
              <p className="text-5xl  font-bold text-white w-full ">1</p>
            </div>

            {/* ----------3rd-------- */}
            <div className="text-right leading-normal bg-[#FEE1C0] rounded-r-lg h-[200px]  w-32 p-2 ">
              <div className="relative -top-9 ">
                <Image
                  src="/assets/img/leader3.png"
                  alt="Student"
                  width={50}
                  height={50}
                  className=" rounded-full mb-2 ml-auto"
                />
                <p className="text-[10px] font-bold text-[#4C5361] ">
                  Uthmaan Abdullah Al-Hilal
                </p>
                <p className="text-[10px] text-gray-700 ">UQ7684685746</p>
              </div>
              <p className="text-[10px] text-gray-600 font-bold  mb-1 ">
                5468 POINTS
              </p>
              <p className="text-5xl font-bold text-white  w-full text-center ">
                3
              </p>
            </div>
          </div>

          <p className="text-gray-700 my-5 font-bold text-lg  text-center">
            Grade 6
          </p>
        </>
      </Carousel>
      <hr />
      <div className="p-6 text-center  ">
        <button className=" bg-black text-white py-4 px-8 rounded-lg  font-medium ">
          🏆 View Leaderboard
        </button>
      </div>
    </>
  );
};

export default LeaderCard;
