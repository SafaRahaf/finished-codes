"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useGetStudentGuardianDetailsQuery } from "@/store/features/class-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import MoreInfoTab from "./MoreInfoTab";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { EditOutlined } from "@ant-design/icons";
import { BiEnvelope, BiMessageAltDetail, BiPhone } from "react-icons/bi";
import { getFullAddress } from "@/components/Location/GetFullLocation";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import { useSelector } from "react-redux";
import {
  getDecodedToken,
  getOrgShortName,
} from "@/utilities/helpers/getDecodedValus";

const ParentDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const { id } = params;
  const [parentInfo, setParentInfo] = useState({
    name: "",
    img: "",
    relation: "",
    uid: "",
    email: "",
    phone: "",
    location: "",
    occupation: "",
    fb: "https://www.facebook.com/ibrahim.jafrry",
    x: "https://www.x.com/ibrahim.jafrry",
    insta: "https://www.instagram.com/ibrahim.jafrry",
    in: "https://www.linkedin.com/ibrahim.jafrry",
  });
  const { data: guardianDetails, isFetching: guardianDetailsLoader } =
    useGetStudentGuardianDetailsQuery(id);

  const decoded = getDecodedToken();
  const orgShortName =
    useSelector((state) => state?.auth?.orgShortName) || getOrgShortName();
  useEffect(() => {
    if (guardianDetails && !guardianDetailsLoader) {
      const guardianData = guardianDetails?.data;
      console.log(guardianData);
      const data = {
        name: `${guardianData?.first_name} ${guardianData?.last_name}`,
        img: guardianData?.profile_picture,
        relation: guardianData?.people_type,
        uid: guardianData?.unique_id,
        occupation: guardianData?.occupation,
        email:
          guardianData?.user_id?.emails &&
          guardianData?.user_id?.emails.length &&
          (guardianData?.user_id?.emails.find(
            (item) => item?.email_type === "primary"
          )?.email ||
            guardianData?.user_id?.emails.find(
              (item) => item?.email_type === "general"
            )?.email ||
            guardianData?.user_id?.emails[0]?.email),
        phone:
          guardianData?.user_id?.mobiles &&
          guardianData?.user_id?.mobiles.length &&
          (guardianData?.user_id?.mobiles.find(
            (item) => item?.mobile_type === "primary"
          )?.mobile_no ||
            guardianData?.user_id?.mobiles.find(
              (item) => item?.mobile_type === "general"
            )?.mobile_no ||
            guardianData?.user_id?.mobiles[0]?.mobile_no),
        occupation: guardianData?.occupation,
        location: getFullAddress(guardianData?.location_id),
      };
      setParentInfo((prev) => ({
        ...prev,
        ...data,
      }));
    }
  }, [guardianDetails, guardianDetailsLoader]);

  return (
    <div>
      {guardianDetails && !guardianDetailsLoader ? (
        <>
          <p className="text-[#798295] text-14 flex items-center mt-2 font-bold">
            <Link href="/parents">
              <span className=" cursor-pointer">Parent Management</span>
            </Link>
            <span className="mx-3">
              <MdKeyboardArrowRight />
            </span>
            <span className="text-black font-bold">{parentInfo?.name}</span>
          </p>

          {/* Profile and Contact Section */}
          <div className="flex flex-col md:flex-row items-start gap-8 pl-2 mt-10">
            {/* Left: Profile Image and Info */}
            <div className="flex flex-col min-w-[260px] w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start ">
                <div className=" w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden bg-gray-100 border mx-auto sm:mx-0 ">
                  <img
                    src={
                      parentInfo.img
                        ? `${process.env.FILE_BROWSE_URL}${parentInfo.img}`
                        : DefaultProfile.src
                    }
                    alt={parentInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center sm:text-left mt-4 sm:mt-0">
                  <h2 className="text-[22px] sm:text-[24px] font-bold leading-tight mb-1">
                    {parentInfo.name}
                  </h2>
                  <div className="text-[#626A7C] font-medium mb-1">
                    {parentInfo?.relation?.charAt(0).toUpperCase() +
                      parentInfo.relation.slice(1)}
                  </div>
                  <div className="text-[#626A7C] text-sm">
                    ID - {orgShortName || decoded?.org_short_name}
                    {parentInfo.uid}
                  </div>
                </div>
              </div>
            </div>

            {/*  Contact Info and Edit Button */}
            <div className="flex-1 flex flex-col gap-2 min-w-[320px] relative w-full md:w-auto mt-4 md:mt-0 border-l-2">
              <div className="flex flex-col gap-1 ml-6">
                <div className="flex items-center gap-2">
                  <span className="text-[#626A7C] font-bold">Phone</span>
                  <span className="text-[#626A7C]">{parentInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#626A7C] font-bold">E-Mail</span>
                  <span className="text-[#626A7C]">{parentInfo.email}</span>
                </div>
              </div>
              <div className="flex gap-5 mt-2 ml-6">
                <BiPhone className="text-[#626A7C] text-xl" />
                <BiMessageAltDetail className="text-[#626A7C] text-xl" />
                <BiEnvelope className="text-[#626A7C] text-xl" />
                <FaWhatsapp className="text-[#626A7C] text-xl" />
              </div>
              <Link
                href={`/students/edit?id=${studentId}&editGuardian=true`}
                className="md:absolute md:top-0 md:right-0 bg-[#22252B] text-white font-medium rounded-lg px-6 py-2 flex items-center gap-2 shadow-sm mt-4 md:mt-0"
              >
                <span className="text-lg font-bold">
                  <EditOutlined />{" "}
                </span>{" "}
                Edit Information
              </Link>
            </div>
          </div>
          {/* More Information Card */}
          <MoreInfoTab moreInfo={parentInfo} />
        </>
      ) : (
        <div className="flex justify-center mt-2 ">
          <SvgLoader />
        </div>
      )}
    </div>
  );
};

export default ParentDetails;
