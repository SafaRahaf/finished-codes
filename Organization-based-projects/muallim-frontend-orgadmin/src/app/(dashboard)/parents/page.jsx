"use client";
import AccessBtn from "@/components/ClassManagement/accessBtn";
import EventCard from "@/components/ClassManagement/eventCard";
import React, { useState, useEffect } from "react";
import { useLazyGetStudentGuardianListQuery } from "@/store/features/class-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import TeacherTopCard from "@/components/TeacherManagement/TeacherTopCard";
import Link from "next/link";
import { appointments, easyAccess, events } from "@/data/DashboardData";
import StudentListTable from "@/components/Parents/StudantTable";
import { useParentDashboardCountQuery } from "@/store/features/dashboard/apiSlice";

import { EmailAndPhoneType } from "@/constants/email&PhoneType";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import { Tooltip } from "antd";

const { PRIMARY, SECONDARY, GENERAL } = EmailAndPhoneType;

const Parents = () => {
  // dashboard matrix
  const [data, setData] = useState([
    {
      value: 0,
      title: "Total Classes",
      value1: 0,
      title1: "Complete",
      value2: 0,
      title2: "Incomplete",
      color1: "#60EC6E",
      color2: "#C3B091",
    },
    {
      value: 0,
      title: "Total Students",
      value1: 0,
      title1: "Boys",
      value2: 0,
      title2: "Girls",
      color1: "#9CB4CC",
      color2: "#C3B091",
    },
    {
      value: 0,
      title: "Parents",
      value1: 0,
      title1: "Connected",
      value2: 0,
      title2: "Not Connected",
      color1: "#18C629",
      color2: "#F95656",
    },
  ]);

  const { data: matrixData, isFetching: matrixDataFetching } =
    useParentDashboardCountQuery();

  useEffect(() => {
    if (!matrixDataFetching && matrixData) {
      const metricsArray = matrixData?.data?.aggregated_metrics || [];

      const metricsMap = Object.fromEntries(
        metricsArray.map((item) => [
          item.aggregated_column_name_id.name,
          item.value || 0,
        ])
      );

      const {
        total_completed_class = 0,
        total_incomplete_class = 0,
        total_boy_student = 0,
        total_student = 0,
        total_girl_student = 0,
        total_parent_connected_by_app = 0,
        total_parent_not_connected_by_app = 0,
      } = metricsMap;

      const updatedData = [
        {
          value: total_completed_class + total_incomplete_class,
          title: "Total Classes",
          value1: total_completed_class,
          title1: "Complete",
          value2: total_incomplete_class,
          title2: "Incomplete",
          color1: "#60EC6E",
          color2: "#C3B091",
        },
        {
          value: total_student,
          title: "Total Students",
          value1: total_boy_student,
          title1: "Boys",
          value2: total_girl_student,
          title2: "Girls",
          color1: "#9CB4CC",
          color2: "#C3B091",
        },
        {
          value:
            total_parent_connected_by_app + total_parent_not_connected_by_app,
          title: "Parents",
          value1: total_parent_connected_by_app,
          title1: "Connected",
          value2: total_parent_not_connected_by_app,
          title2: "Not Connected",
          color1: "#18C629",
          color2: "#F95656",
        },
      ];

      setData(updatedData);
    }
  }, [matrixData, matrixDataFetching]);

  // guardians
  const [appConnectionDataShow, setAppConnectionDataShow] = useState(false);
  const [guardianList, setGuardianList] = useState([]);
  const [guardianCount, setGuardianCount] = useState(false);
  const filter = true;
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [
    getStudentGuardianList,
    { data: guardianListFetch, isLoading: guardianListFetchLoader },
  ] = useLazyGetStudentGuardianListQuery();

  const appConnectionDataShowHandler = async (id) => {
    setSelectedStudent(id);
    setGuardianList([]);
    await getStudentGuardianList(id, filter);

    setAppConnectionDataShow(!appConnectionDataShow);
  };

  useEffect(() => {
    if (appConnectionDataShow) {
      if (guardianListFetch) {
        const list = guardianListFetch?.data;
        setGuardianCount(list && list.length ? true : false);
        setGuardianList(list && list.length ? list : []);
      }
    }
  }, [appConnectionDataShow]);

  const getMobileNumber = (guardian) => {
    const mobiles = guardian?.parent_id?.user_id?.mobiles || [];
    const mobileNumber =
      mobiles.find((m) => m?.mobile_type === PRIMARY)?.mobile_no ||
      mobiles.find((m) => m?.mobile_type === SECONDARY)?.mobile_no ||
      mobiles.find((m) => m?.mobile_type === GENERAL)?.mobile_no ||
      "";

    return mobileNumber || "N/A";
  };

  const legalGuardians = guardianList.filter((g) => g.is_legal_guardian);
  const emergencyContacts = guardianList.filter(
    (g) => g.is_guardian_emergency_contact
  );
  const otherRelatives = guardianList.filter(
    (g) => !g.is_legal_guardian && !g.is_guardian_emergency_contact
  );

  const renderGuardianRow = (guardian) => (
    <tr key={guardian.id} className="border-b">
      <td className="py-3">
        <div className="flex items-center gap-3">
          <img
            src={
              guardian?.parent_id?.profile_picture
                ? `${process.env.FILE_BROWSE_URL}${guardian?.parent_id?.profile_picture}`
                : DefaultProfile.src
            }
            width={56}
            height={56}
            alt="avatar"
            className="rounded-full w-12 h-12 object-cover "
          />
          <span className="text-sm md:text-base">
            <Link href={`/parents/${guardian?.id}`}>
              <p>
                {guardian?.parent_id?.first_name + " "}
                {guardian?.parent_id?.last_name || ""}
              </p>
            </Link>
          </span>
        </div>
      </td>
      <td className="py-3">
        {guardian?.your_relation_with_person?.charAt(0).toUpperCase() +
          guardian?.your_relation_with_person?.slice(1)}
      </td>
      <td className="py-3">{getMobileNumber(guardian)}</td>
      <td className="py-3">
        <Link
          href={`/parents/${guardian?.parent_id?.id}?studentId=${selectedStudent}`}
          className="font-bold underline"
        >
          View Details
        </Link>
      </td>
    </tr>
  );

  return (
    <div>
      {/* parents connected with app modal */}
      {appConnectionDataShow && (
        <>
          <div
            onClick={() => setAppConnectionDataShow(false)}
            className="custom-modal-bg fixed bg-white opacity-50 left-0 top-0 h-full w-full z-[2000]"
          ></div>

          <div className="custom-modal bg-white fixed top-1/2 left-1/2 px-6 md:px-10 py-6 md:py-8 rounded-[12px] translate-x-[-50%] translate-y-[-50%] w-[95%] max-w-[750px] z-[30000] border overflow-hidden">
            <h2 className="text-[24px] md:text-[30px] font-bold mt-2">
              Guardians Connected Via App
            </h2>
            <hr className="mt-4 mb-2 border-gray-200" />

            {!guardianListFetchLoader ? (
              <>
                {guardianListFetch && guardianList.length ? (
                  <div className="overflow-x-auto w-full ">
                    <table className="w-full min-w-[600px]">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3">Name</th>
                          <th className="text-left py-3">Relation</th>
                          <th className="text-left py-3">Phone</th>
                          <th className="text-left py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {legalGuardians.length > 0 && (
                          <>
                            <tr>
                              <td
                                colSpan={4}
                                className="py-2 text-xs font-bold uppercase text-gray-500"
                              >
                                Legal Guardian
                              </td>
                            </tr>
                            {legalGuardians.map(renderGuardianRow)}
                          </>
                        )}

                        {emergencyContacts.length > 0 && (
                          <>
                            <tr>
                              <td
                                colSpan={4}
                                className="py-2 text-xs font-bold uppercase text-gray-500"
                              >
                                Emergency Contact
                              </td>
                            </tr>
                            {emergencyContacts.map(renderGuardianRow)}
                          </>
                        )}

                        {otherRelatives.length > 0 && (
                          <>
                            <tr>
                              <td
                                colSpan={4}
                                className="py-2 text-xs font-bold uppercase text-gray-500"
                              >
                                Other Relatives
                              </td>
                            </tr>
                            {otherRelatives.map(renderGuardianRow)}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No guardians connected.</p>
                )}
              </>
            ) : (
              <div className="flex justify-center mt-5">
                <SvgLoader />
              </div>
            )}
          </div>
        </>
      )}
      {/* Top Panel */}
      <div className="grid lg:grid-cols-12 grid-cols-1 lg:gap-4 gap-y-4 ">
        <div className=" lg:col-span-9 h-full">
          <div
            className="card bg-[#E7F7FF] h-full flex justify-center items-center w-full rounded-[12px] class-card "
            style={{ backgroundImage: "url(../assets/img/caligraphy.svg)" }}
          >
            <div className="flex xl:flex-row flex-col justify-between items-center w-full lg:p-0 py-10">
              <div className="w-full grid lg:grid-cols-3  grid-cols-1 gap-8 lg:gap-0 items-center  ">
                {data.map((item, index) => (
                  <TeacherTopCard key={index} data={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 ">
          <div className="card  rounded-[12px]   bg-[#E7F7FF] p-4 pb-[6px] ">
            <p className="font-bold text-14 tracking-wider  ">Easy Access</p>

            <div className="my-[10px]  bg-[#CBEEFF] h-[2px] w-full "></div>

            <div className=" overflow-y-scroll h-[190px] pr-1 custom-scrollbar">
              {easyAccess.map((item, index) => (
                <AccessBtn
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  link={item.link}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* second panel */}
      <div className="mt-8 space-y-4">
        <div className="2xl:grid 2xl:grid-cols-12 xl:gap-4 md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0 xl:space-y-0">
          {/* Academic Calendar */}
          <div className="2xl:col-span-4 h-full pointer-events-none">
            <div className=" h-full py-8 lg:px-10 px-4 bg-[#E7F7FF] rounded-[12px] relative overflow-hidden ">
              <div
                className="absolute inset-0 rounded-[12px] "
                style={{
                  background:
                    "linear-gradient(180deg, rgba(231,247,255,0) 0%, #E7F7FF 65.92%)",
                }}
              />
              <p className="text-2xl lg:text-left text-center font-bold">
                Academic Calendar for Parents
              </p>

              <div className="line mt-6 mb-2 w-full h-[1px] bg-[#CBEEFF]"></div>
              <div className="flex lg:flex-row flex-col justify-between items-center">
                <p className="font-bold">Upcoming Events</p>
                <p className="text-xs">
                  Tue, 26 Mar 2024 | 13 Safar 1446 | 9:30 pm
                </p>
              </div>

              {/* events */}
              <div className="events mt-4 h-[440px] overflow-y-auto ">
                {events.map((item, index) => (
                  <EventCard
                    key={index}
                    color={item.color}
                    title={item.title}
                    date={item.date}
                    hijriDate={item.hijriDate}
                    time={item.time}
                  />
                ))}
              </div>

              <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 z-10 text-center pointer-events-auto w-full ">
                <p className="text-2xl font-bold text-black flex items-center gap-1 justify-center">
                  Coming Soon
                  <Tooltip
                    title="This section is not functional yet. The academic calendar will launch soon, allowing you to plan your year effectively."
                    color="white"
                  >
                    <img
                      src="/assets/img/icons/help.svg"
                      className="help"
                      alt="Help"
                    />
                  </Tooltip>
                </p>
              </div>
              {/* <div className=" absolute bottom-0 left-0 w-full bg-[#B6BFF0] rounded-b-[12px] px-6 py-8 flex justify-end items-center z-30">
              <Button
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-base"
                icon={<BookOutlined />}
                style={{
                  background: "#C9CDD5",
                  color: "#fff",
                  border: "none",
                  cursor: "inherit",
                }}
              >
                View Calendar
              </Button>
            </div> */}
            </div>
          </div>

          <div className="2xl:col-span-3 easy-access-items mb-6 sm:mb-0 relative pointer-events-none">
            <div
              className="absolute inset-0 rounded-[12px] "
              style={{
                background:
                  "linear-gradient(180deg, rgba(231,247,255,0) 0%, #FFF  65.92%)",
              }}
            />
            {/* Appointment Request Card */}
            <div className="card shadow rounded-[12px] bg-white h-full py-8 2xl:px-6 px-4  ">
              <p className="text-xl font-bold ">Appointment Request</p>

              <div className="h-[500px] overflow-y-auto mt-4 ">
                {appointments.map((item, index) => (
                  <div
                    key={index}
                    className={`mt-4 px-4 py-2 ${
                      index % 2 === 0 ? "bg-[#F1F3F5]" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{item.from}</p>
                    </div>
                    <p className="text-xs my-1">
                      Father of - {item.studentInfo}
                    </p>
                    <p className="text-xs font-bold">
                      Requested Time - {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 z-10 text-center pointer-events-auto w-full ">
              <p className="text-2xl font-bold text-black flex items-center gap-1 justify-center">
                Coming Soon
                <Tooltip
                  title="This section is not functional yet. The Subject Module will launch soon, allowing you to Manage all Subject Related to this Class."
                  color="white"
                >
                  <img
                    src="/assets/img/icons/help.svg"
                    className="help"
                    alt="Help"
                  />
                </Tooltip>
              </p>
            </div>
          </div>

          {/* Student List Table */}
          <div className="2xl:col-span-5 md:col-span-2 md:order-first 2xl:order-none h-full">
            <StudentListTable
              appConnectionDataShowHandler={appConnectionDataShowHandler}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parents;
