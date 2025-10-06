import siteConfig from "@/config";
import React from "react";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const StudentListCard = ({ item }) => {
  return (
    <div className=" shadow-md rounded-lg my-4  bg-[#cbeeff49] ">
      <div className=" p-3 text-center items-center py-6">
        <div className="flex justify-center">
          <img
            className="rounded-full "
            src={
              item?.profile_picture
                ? siteConfig.FILE_BROWSE_URL + item?.profile_picture
                : DefaultProfile.src
            }
            width={60}
            height={60}
            alt="avatar"
          />
        </div>
        <div className="">
          <h2 className="font-semibold  text-black text-xl">
            {item?.first_name + " " + item?.last_name}
          </h2>
          <p className=" text-gray-600 mt-2">ID: {item?.id}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentListCard;
