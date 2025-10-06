"use client";
import { Tabs } from "antd";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGetTeacherDetailsQuery } from "@/store/features/teacher-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import ClassAndSubjectTab from "./ClassAndSubjectTab";
import AttendanceTab from "./AttendanceTab";
import MoreInfoTab from "./MoreInfoTab";
import { MdKeyboardArrowRight } from "react-icons/md";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import {
  FacebookSvg,
  InstaSvg,
  LinkdinSvg,
  PlusSvg,
  Tiktok,
  TwitterSvg,
} from "@/components/helpers/storeAllSvgs";
import UserAccessControlModal from "@/components/UserManagment/UserAccessControlModal";
import usePeopleData from "@/hooks/usePeopleData";
import {
  getDecodedToken,
  getOrgShortName,
} from "@/utilities/helpers/getDecodedValus";
import { useSelector } from "react-redux";

const TeacherDetails = () => {
  const peopleData = usePeopleData();
  // teacher id
  const params = useParams();
  const { id } = params;
  const decoded = getDecodedToken();
  const orgShortName =
    useSelector((state) => state.auth.orgShortName) || getOrgShortName();

  const [teacherInfo, setTeacherInfo] = useState({
    contact: null,
    name: "",
    img: null,
    designation: "",
    uid: "",
    email: "",
    phone: "",
    fb: "https://www.facebook.com/ibrahim.jafrry",
    x: "https://www.x.com/ibrahim.jafrry",
    insta: "https://www.instagram.com/ibrahim.jafrry",
    in: "https://www.linkedin.com/ibrahim.jafrry",
    status: 1,
    tabs: [
      "Class & Subjects",
      "Leave & Movements",
      "Attendance",
      "Salary",
      "More Information",
    ],
    classes: [],
  });
  const [teacherMoreInfo, setTeacherMoreInfo] = useState();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isAccessPermissonModalOpen, setIsAccessPermissonModalOpen] =
    useState(false);
  const onChange = (key) => {
    // console.log(key);
  };

  const items = [
    {
      key: "1",
      label: <span className="text-black text-18 ">Assigned Class</span>,
      children: <div>Stay tuned — this section will be here shortly!</div>,
      // <ClassAndSubjectTab data={teacherInfo?.classes} />,
    },

    {
      key: "2",
      label: <span className="text-black text-18 ">Attendance</span>,
      children: (
        <AttendanceTab
          peopleId={id}
          data={teacherMoreInfo ? teacherMoreInfo : null}
        />
      ),
    },
    {
      key: "3",
      label: <span className="text-black text-18 ">More Information</span>,
      children: <MoreInfoTab data={teacherMoreInfo ? teacherMoreInfo : null} />,
    },
  ];

  //  teacher details
  const { data: teacherFetch, isFetching } = useGetTeacherDetailsQuery(id);

  useEffect(() => {
    if (teacherFetch) {
      const teacher = teacherFetch?.data;
      const teacherMoreInfoDataFromApi = {
        name: `${teacher?.first_name} ${teacher?.last_name}`,
        bio: teacher?.bio,
        designation_employees:
          teacher?.designation_employees?.designation_org_id?.designation_id
            ?.designation,
        dob: teacher?.dob,
        gender: teacher?.gender,
        email:
          teacher?.user_id?.emails?.length &&
          teacher?.user_id?.emails.find(
            (item) => item?.email_type === "primary"
          )?.email,
        phone:
          teacher?.user_id?.mobiles?.length &&
          teacher?.user_id?.mobiles.find(
            (item) => item?.mobile_type === "primary"
          )?.mobile_no,
        joiningDate: teacher?.designation_employees?.joining_date,
        people_identification:
          teacher?.people_identification &&
          teacher?.people_identification.length
            ? teacher?.people_identification
            : [],
        address: teacher?.location,
        people_educations:
          teacher?.people_educations && teacher?.people_educations.length
            ? teacher?.people_educations
            : [],
        people_experiences:
          teacher?.people_experiences && teacher?.people_experiences.length
            ? teacher?.people_experiences
            : [],
        people_medical_information: teacher?.people_medical_information,
        employee_schedules:
          teacher?.employee_schedules && teacher?.employee_schedules.length
            ? teacher?.employee_schedules
            : [],
        employee_responsibilities:
          teacher?.employee_responsibilities &&
          teacher?.employee_responsibilities.length
            ? teacher?.employee_responsibilities
            : [],
        payment_infos: teacher?.payment_infos?.[0],
        location: teacher?.location,
        significant_medical_history:
          teacher?.people_medical_information?.significant_medical_history,
      };
      setTeacherMoreInfo(teacherMoreInfoDataFromApi);
      setTeacherInfo((prev) => ({
        ...prev,
        name: `${teacher?.first_name} ${teacher?.last_name}`,
        img: teacher?.profile_picture
          ? `${process.env.FILE_BROWSE_URL + teacher?.profile_picture}`
          : null,
        designation:
          teacher?.designation_employees?.designation_org_id?.designation_id
            ?.designation,
        uid: teacher?.unique_id,
        status: teacher?.user_id?.status === "active" ? 1 : 0,
        phone:
          teacher?.user_id?.mobiles
            ?.filter((item) => item?.mobile_type === "primary")
            .map((item) => item?.mobile_no)
            .join(", ") || null,

        email:
          teacher?.user_id?.emails
            ?.filter((item) => item?.email_type === "primary")
            .map((item) => item?.email)
            .join(", ") || null,
        classes: teacher?.class_subject?.assigned_class?.length
          ? teacher?.class_subject?.assigned_class?.map((classItem) => ({
              name: classItem?.class_people?.people_type_id?.type_name,
              sub_id: classItem?.class_id,
              students:
                Number(classItem?.class_aggregated_data?.total_boy_student) +
                Number(classItem?.class_aggregated_data?.total_girl_student),
              sub: classItem?.class_name,
              attendance_percentage:
                classItem?.class_aggregated_data?.attendance_percentage,
              date_time: classItem?.class_days,
            }))
          : [],
        contact: teacher?.contact_details,
      }));
    }
  }, [teacherFetch]);
  // Handle modal

  const openAccessControlModal = (userId) => {
    setSelectedUserId(userId);
    setIsAccessPermissonModalOpen(true);
  };

  if (!isFetching) {
    return (
      <div className="pt-3 ">
        <p className="text-[#798295] tracking-wider text-14 flex items-center font-bold">
          <Link href="/teachers">Teacher Management</Link>
          <span className="mx-3">
            <MdKeyboardArrowRight />
          </span>

          <Link href="/teachers/lists">Teachers</Link>
          <span className="mx-3">
            <MdKeyboardArrowRight />
          </span>

          <span className="text-black font-bold">{teacherInfo.name}</span>
        </p>

        <div className="mt-8 ">
          <div className="grid  mb-[60px] lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2 items-center">
            <div className="flex gap-6 justify-start lg:items-start 2xl:items-center   ">
              <div className="w-[144px] h-[144px] lg:w-20 lg:h-20 2xl:w-[144px] 2xl:h-[144px]  overflow-hidden rounded-full bg-gray-50 ">
                <img
                  src={teacherInfo?.img ? teacherInfo?.img : DefaultProfile.src}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className=" flex-1">
                <h3 className="text-3xl lg:text-20 2xl:text-3xl  font-bold">
                  {teacherInfo.name}
                </h3>
                <p className="text-[#626A7C] pt-3 lg:pt-0 font-bold">
                  {teacherInfo.designation}
                </p>
                <p className="text-[#626A7C]">
                  ID - {orgShortName || decoded?.org_short_name}
                  {teacherInfo.uid}
                </p>{" "}
                {teacherInfo.status === 1 ? (
                  <div className="flex justify-start items-center gap-2">
                    <div className=" bg-[#60EC6E] w-[16px] h-[16px] rounded-full"></div>
                    <span>Active</span>
                  </div>
                ) : teacherInfo.status === 2 ? (
                  <div className="flex justify-start items-center gap-2">
                    <div className=" bg-[#B6BFF0] w-[16px] h-[16px] rounded-full"></div>
                    <span>Casual Leave</span>
                  </div>
                ) : (
                  <div className="flex justify-start items-center gap-2">
                    <div className=" bg-[#FDAE51] w-[16px] h-[16px] rounded-full"></div>
                    <span>Sick Leave</span>
                  </div>
                )}
              </div>
            </div>

            <div className="">
              <div className="border-l-2 border-[#C9CDD5] pl-8">
                <p className="text-[#626A7C]">
                  <span className="font-bold mr-4">Phone</span>
                  <span>{teacherInfo.phone}</span>
                </p>
                <p className="text-[#626A7C]">
                  <span className="font-bold mr-4">E-Mail</span>
                  <span>{teacherInfo.email}</span>
                </p>

                <div className="flex mt-5 justify-start items-center gap-6">
                  {teacherInfo?.contact && teacherInfo?.contact.length
                    ? teacherInfo?.contact.map((item, key) => (
                        <Link
                          key={key}
                          href={item?.contact}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item?.contact_type_id?.type_name
                            ?.toLowerCase()
                            .trim() === "facebook" && <FacebookSvg />}
                          {item?.contact_type_id?.type_name
                            ?.toLowerCase()
                            .trim() === "X (Twitter)" && <TwitterSvg />}
                          {item?.contact_type_id?.type_name
                            ?.toLowerCase()
                            .trim() === "instagram" && <InstaSvg />}
                          {item?.contact_type_id?.type_name
                            ?.toLowerCase()
                            .trim() === "linkedin" && <LinkdinSvg />}
                          {item?.contact_type_id?.type_name
                            ?.toLowerCase()
                            .trim() === "tiktok" && <Tiktok />}
                        </Link>
                      ))
                    : ""}
                </div>
              </div>
            </div>

            <div className="flex lg:justify-end  lg:mb-20 mt-10 lg:mt-0 justify-center">
              <div className="flex lg:flex-wrap justify-end   gap-4 ">
                <button
                  onClick={() => openAccessControlModal(id)}
                  className="btn btn-primary bg-[#fff] px-[20px] py-[9px] rounded-[8px] flex justify-center items-center text-[#22252B] border-[#22252B] border gap-2"
                >
                  Role Management
                </button>
                <Link
                  href={`/teachers/update/${id}`}
                  className="btn  btn-primary bg-[#22252B] px-[36px] py-[9px] rounded-[8px] flex justify-center items-center text-white gap-2"
                >
                  <PlusSvg />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
          {isAccessPermissonModalOpen && (
            <UserAccessControlModal
              userId={selectedUserId}
              modalAction={setIsAccessPermissonModalOpen}
            />
          )}
          <Tabs
            className=""
            defaultActiveKey="1"
            items={items}
            onChange={onChange}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-center  mt-10">
        <SvgLoader />
      </div>
    );
  }
};

export default TeacherDetails;
