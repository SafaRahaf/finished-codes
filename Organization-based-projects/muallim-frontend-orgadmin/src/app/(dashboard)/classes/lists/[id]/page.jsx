"use client";
import moment from "moment";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import React, { useState, useEffect } from "react";
import { Dropdown, message, Tooltip } from "antd";
import { RightOutlined } from "@ant-design/icons";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import AccessBtn from "@/components/ClassManagement/accessBtn";
import HifzModal from "@/components/ClassManagement/hifz-modal";
import ClassSubjectList from "@/components/ClassManagement/ClassSubjectList";
import ClassStudentsTable from "@/components/ClassManagement/StudentAssignedIntoClassTable";
import {
  useDeleteClassMutation,
  useGetClassQuery,
} from "@/store/features/class-management/apiSlice";
import { easyAccess } from "@/data/DashboardData";
import { daysOfWeekFull } from "@/constants/daysOfFullWeek";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const ClassDetails = () => {
  const [hifz, setHifz] = useState(false);
  const params = useParams();
  const { id } = params;

  // class data form api
  const [classDetails, setClassDetails] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [confirmStep, setConfirmStep] = useState(1);
  const {
    data: getClassData,
    isFetching: loadingClassData,
    refetch: refetchClassData,
  } = useGetClassQuery(id);

  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  const [localStudentCounts, setLocalStudentCounts] = useState({
    totalBoys: 0,
    totalGirls: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    // fetch data from api
    if (!loadingClassData && getClassData) {
      // console.log(getClassData?.data);
      setClassDetails(getClassData?.data);

      // Initialize local counts
      const boys = Number(
        getClassData?.data?.class_aggregated_data?.total_boy_student || 0
      );
      const girls = Number(
        getClassData?.data?.class_aggregated_data?.total_girl_student || 0
      );
      setLocalStudentCounts({
        totalBoys: boys,
        totalGirls: girls,
        totalStudents: boys + girls,
      });
    }
  }, [getClassData, loadingClassData]);

  // handle hifz modal
  const handleHifzModal = () => {
    setHifz(true);
  };

  const handleDeleteClass = async () => {
    try {
      await deleteClass(classDetails?.id).unwrap();
      setDeleteConfirmModal(false);
      message.success("Class deleted successfully");
      router.push("/classes/lists");
    } catch (error) {
      console.log(error);
    }
  };

  const dropdownItems = [
    {
      key: "1",
      label: (
        <Link
          className="cursor-pointer text-base p-1"
          href={`/classes/update/${id}`}
        >
          Edit Class <RightOutlined className="text-sm" />
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link
          className="cursor-pointer text-base p-1"
          href="#"
          onClick={() => setDeleteConfirmModal(true)}
        >
          Delete <RightOutlined className="text-sm" />
        </Link>
      ),
    },
  ];

  // const studentsOnClass = StudentsByClass?.map((stdnt) => stdnt.unique_id);

  const getTeacherSupervisors = classDetails?.class_people?.filter(
    (item) => item?.people_type_id?.type_name === "Supervisor"
  );

  const getSupervisorImage = getTeacherSupervisors?.map(
    (item) => item?.people_id?.profile_picture
  );

  const getDayShort = (day) => day.charAt(0).toUpperCase() + day.slice(1, 3);

  const groupConsecutiveDays = (days) => {
    const indexes = days
      .map((d) => daysOfWeekFull.indexOf(d.day))
      .sort((a, b) => a - b);
    const grouped = [];

    let temp = [indexes[0]];
    for (let i = 1; i < indexes.length; i++) {
      if (indexes[i] === indexes[i - 1] + 1) {
        temp.push(indexes[i]);
      } else {
        grouped.push([...temp]);
        temp = [indexes[i]];
      }
    }
    if (temp.length) grouped.push(temp);

    return grouped.map((group) => {
      if (group.length === 1) return getDayShort(daysOfWeekFull[group[0]]);
      return `${getDayShort(daysOfWeekFull[group[0]])} - ${getDayShort(
        daysOfWeekFull[group[group.length - 1]]
      )}`;
    });
  };

  // Create functions to update counts
  const updateStudentCounts = (addedBoys = 0, addedGirls = 0) => {
    setLocalStudentCounts((prev) => ({
      totalBoys: prev.totalBoys + addedBoys,
      totalGirls: prev.totalGirls + addedGirls,
      totalStudents: prev.totalStudents + addedBoys + addedGirls,
    }));
  };

  return (
    <div>
      {getClassData && !loadingClassData ? (
        <>
          <div className="grid lg:grid-cols-12 grid-cols-1 gap-4">
            {/* Main Card */}
            <div className=" lg:col-span-9 h-full ">
              <div className="bg-[#E7F7FF] rounded-[16px] px-8  flex flex-col h-full relative">
                {/* Header Row */}
                <div className="flex justify-between items-start my-6 ">
                  <div className="flex items-center">
                    <h2 className="text-3xl font-bold mr-4">
                      {classDetails?.class_name}
                    </h2>
                    <span className="bg-[#22252B] text-white text-xs px-3 py-1 rounded-full capitalize">
                      {classDetails?.mode}
                    </span>
                  </div>
                  <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
                    <a onClick={(e) => e.preventDefault()}>
                      <PiDotsThreeVerticalBold
                        className="cursor-pointer"
                        size="26px"
                      />
                    </a>
                  </Dropdown>
                </div>

                <div className="grid md:grid-cols-4 grid-cols-1 mb-6">
                  {/* Homeroom Teacher & Supervisor */}
                  <div className="flex flex-col justify-between flex-1 pr-8  border-r-white border-r-2">
                    <div>
                      <p className="font-bold mb-2">Homeroom Teacher</p>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={
                            classDetails?.home_room_teacher_id?.profile_picture
                              ? `${process.env.FILE_BROWSE_URL}${classDetails?.home_room_teacher_id?.profile_picture}`
                              : DefaultProfile.src
                          }
                          className="w-14 h-14 rounded-full"
                          alt=""
                        />
                        <div className="flex flex-col min-w-0">
                          <Tooltip
                            title={
                              (classDetails?.home_room_teacher_id?.first_name ||
                                "") +
                              " " +
                              (classDetails?.home_room_teacher_id?.last_name ||
                                "")
                            }
                            placement="topLeft"
                            color="#fff"
                          >
                            <p className=" font-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] cursor-pointer">
                              {classDetails?.home_room_teacher_id?.first_name +
                                " " +
                                classDetails?.home_room_teacher_id?.last_name}
                            </p>
                          </Tooltip>
                          <p className="text-sm text-[#626A7C]">
                            ID - {classDetails?.class_id}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold mb-2">Supervisor</p>
                      {getSupervisorImage?.length > 0 ? (
                        <div className="flex items-center">
                          {getSupervisorImage?.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={
                                item
                                  ? `${process.env.FILE_BROWSE_URL}${item}`
                                  : DefaultProfile.src
                              }
                              className={`w-10 h-10 rounded-full border-2 border-white ${
                                idx > 0 ? "-ml-3" : ""
                              }`}
                              alt=""
                            />
                          ))}
                          {getSupervisorImage?.length > 3 && (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex justify-center items-center text-lg text-white font-bold -ml-3">
                              +
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-[#626A7C]">
                          No supervisor assigned
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Students */}
                  <div className="flex flex-col justify-center items-center flex-1  border-r-white border-r-2">
                    <h2 className="text-5xl font-bold">
                      {localStudentCounts.totalStudents}
                    </h2>
                    <p className="text-lg mt-2">
                      {localStudentCounts.totalStudents > 1
                        ? "Students"
                        : "Student"}
                    </p>
                  </div>

                  {/* Subjects */}
                  <div className="flex flex-col justify-center items-center flex-1  border-r-white border-r-2">
                    <h2 className="text-5xl font-bold">
                      {classDetails?.class_aggregated_data?.total_subject}
                    </h2>
                    <p className="text-lg mt-2">
                      {Number(
                        classDetails?.class_aggregated_data?.total_subject
                      ) > 1
                        ? "Subjects"
                        : "Subject"}
                    </p>
                  </div>

                  {/* Check In & Out */}
                  <div className="flex flex-col justify-center flex-1 pl-8">
                    <h2 className=" font-bold mb-2">Check In & Check Out</h2>
                    <div className="space-y-1">
                      {(() => {
                        if (!classDetails?.class_days?.length) return null;

                        // Step 1: Group by check_in-check_out
                        const timeGroups = {};
                        classDetails.class_days.forEach((day) => {
                          const timeKey = `${day.check_in}-${day.check_out}`;
                          if (!timeGroups[timeKey]) {
                            timeGroups[timeKey] = [];
                          }
                          timeGroups[timeKey].push(day);
                        });

                        // Step 2: Render each time group
                        return Object.entries(timeGroups).map(
                          ([timeKey, days]) => {
                            const [checkIn, checkOut] = timeKey.split("-");

                            // Step 3: Sort days by weekday
                            days.sort(
                              (a, b) =>
                                daysOfWeekFull.indexOf(a.day) -
                                daysOfWeekFull.indexOf(b.day)
                            );

                            // Step 4: Group day display labels
                            const dayGroups = groupConsecutiveDays(days);

                            return (
                              <div key={timeKey} className="flex flex-col">
                                <span className="font-bold text-sm">
                                  {dayGroups.join(", ")}
                                </span>
                                <span className="text-sm text-[#626A7C]">
                                  {moment
                                    .utc(checkIn, "HH:mm:ss")
                                    .local()
                                    .format("hh:mm A")}{" "}
                                  -{" "}
                                  {moment
                                    .utc(checkOut, "HH:mm:ss")
                                    .local()
                                    .format("hh:mm A")}
                                </span>
                              </div>
                            );
                          }
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Easy Access */}
            <div className=" lg:col-span-3 ">
              <div className="  rounded-[12px]   bg-[#E7F7FF] px-6 pt-4  h-full ">
                <p className="font-bold text-14 tracking-wider  ">
                  Easy Access
                </p>

                <div className="my-2    bg-[#CBEEFF] h-[1px] w-full "></div>

                <div className=" overflow-y-scroll h-[212px] pr-1 custom-scrollbar mb-1 ">
                  {easyAccess.map((item, index) => {
                    return (
                      <AccessBtn
                        key={index}
                        icon={item.icon}
                        title={item.title}
                        link={item.link}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* second part */}
          <div className="grid 2xl:grid-cols-12 grid-cols-1 mt-8 gap-y-4 2xl:gap-4 ">
            <div className="col-span-5 h-full">
              <ClassStudentsTable
                classId={id}
                refetchClassData={refetchClassData}
                updateStudentCounts={updateStudentCounts}
              />
            </div>
            <div className="col-span-7 h-full">
              <ClassSubjectList
                id={id}
                standAloneSubjects={classDetails?.class_subjects}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center">
          <SvgLoader />
        </div>
      )}

      {hifz && <HifzModal setHifz={setHifz} />}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center text-red-600 gap-2 font-semibold text-16">
              <img
                src="/assets/img/icons/red warning.png"
                alt="Warning"
                className="w-5 h-5"
              />
              Delete Class?
            </div>
            <hr />
            {confirmStep === 1 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 my-1">
                    {classDetails?.class_name}
                  </h2>
                  <p className="text-12 text-gray-500 font-bold">
                    Class ID - {classDetails?.class_id}
                  </p>
                </div>
                <p className="text-16 text-gray-700">
                  Would you like to proceed with the deletion of the class?
                </p>
                <hr />
                <div className="flex justify-between  pt-1">
                  <button
                    onClick={() => setDeleteConfirmModal(false)}
                    className="border border-gray-400 px-4 py-2 rounded-md text-16 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setConfirmStep(2)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-16 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {confirmStep === 2 && (
              <>
                <p className="text-16 text-gray-700">
                  Upon executing the deletion process, all associated data will
                  be irrevocably erased. It is important to note that the
                  specific class in question presently accommodates a total of{" "}
                  <strong>{localStudentCounts.totalStudents} students</strong>.
                  Therefore, we urge you to make your decision with careful
                  consideration.
                </p>
                <hr />
                <div className="flex justify-between gap-3 pt-2">
                  <button
                    onClick={() => setDeleteConfirmModal(false)}
                    className="border border-gray-400 px-4 py-2 rounded-md text-16 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteClass()}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-16 font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetails;
