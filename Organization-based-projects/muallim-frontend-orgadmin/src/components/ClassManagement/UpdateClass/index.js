"use client";
import React, { useState } from "react";
import ClassTypes from "./ClassTypes";
import ClassGrade from "./ClassGrade";
import SuperVisor from "./SuperVisor";
import AttendenceUpdate from "./AttendenceUpdate";
import { useUpdateClassMutation } from "@/store/features/class-management/apiSlice";

function UpdateClass({ classDetails, classId }) {
  // default
  const [activeTab, setActiveTab] = useState(2);
  const [updateClass, { isLoading: createClassLoading, error }] =
    useUpdateClassMutation();

  return (
    <>
      <div className="mt-8">
        <div className="lg:w-[872px] xl:w-[924px]  2xl:w-[1008px]   shadow-custom-effect rounded-[12px] mx-auto  ">
          <div className="card-header sm:p-12  sm:pb-6 px-5 py-4">
            <h2 className="sm:text-2xl text-xl font-bold">Edit Class</h2>
          </div>
          <div className="w-full  border-t-2 border-[#E4E6EA] lg:flex">
            <div
              v
              className="item-left lg:w-[270px] xl:w-[332px] w-full  bg-[#E7F7FF] py-6 xl:px-6  px-2"
            >
              <ul className="flex lg:flex-col flex-row flex-wrap lg:gap-3 gap-1 ">
                {/* <li>
                    <button
                      onClick={() => setActiveTab(1)}
                      type="button"
                      className={`text-xs text-start w-full leading-[18px] font-bold text-primary-brand-900 py-[13px] px-4 rounded-lg hover:bg-accentb transition-all duration-300 ease-in-out uppercase ${
                        activeTab === 1 ? "bg-accentb" : ""
                      }`}
                    >
                      class type
                    </button>
                  </li> */}
                <li>
                  <button
                    onClick={() => setActiveTab(2)}
                    type="button"
                    className={`text-xs text-start w-full leading-[18px] font-bold text-primary-brand-900 py-[13px] px-4 rounded-lg hover:bg-accentb transition-all duration-300 ease-in-out uppercase ${
                      activeTab === 2 ? "bg-accentb" : ""
                    }`}
                  >
                    Class Details
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab(3)}
                    type="button"
                    className={`text-xs text-start w-full leading-[18px] font-bold text-primary-brand-900 py-[13px] px-4 rounded-lg hover:bg-accentb transition-all duration-300 ease-in-out uppercase ${
                      activeTab === 3 ? "bg-accentb" : ""
                    }`}
                  >
                    Supervisor
                  </button>
                </li>
                {/* <li>
                    <button
                      onClick={() => setActiveTab(4)}
                      type="button"
                      className={`text-xs text-start w-full leading-[18px] font-bold text-primary-brand-900 py-[13px] px-4 rounded-lg hover:bg-accentb transition-all duration-300 ease-in-out uppercase ${
                        activeTab === 4 ? "bg-accentb" : ""
                      }`}
                    >
                      Student
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab(5)}
                      type="button"
                      className={`text-xs text-start w-full leading-[18px] font-bold text-primary-brand-900 py-[13px] px-4 rounded-lg hover:bg-accentb transition-all duration-300 ease-in-out uppercase ${
                        activeTab === 5 ? "bg-accentb" : ""
                      }`}
                    >
                      Subject
                    </button>
                  </li> */}
                {/* <li>
                    <button
                      onClick={() => setActiveTab(6)}
                      type="button"
                      className={`text-xs text-start w-full leading-[18px] font-bold text-primary-brand-900 py-[13px] px-4 rounded-lg hover:bg-accentb transition-all duration-300 ease-in-out uppercase ${
                        activeTab === 6 ? "bg-accentb" : ""
                      }`}
                    >
                      Attendance
                    </button>
                  </li> */}
              </ul>
            </div>
            <div className="flex-1">
              <div className="w-full md:px-[48px] md:py-6 p-3.5">
                {
                  // activeTab === 1 ? (
                  //   <ClassTypes
                  //     createClassLoading={createClassLoading}
                  //     classId={classId}
                  //     updateHandler={updateClass}
                  //     oldType={classDetails?.class_type_org_id?.class_type_id}
                  //   />
                  // ) :
                  activeTab === 2 ? (
                    <ClassGrade
                      createClassLoading={createClassLoading}
                      classId={classId}
                      updateHandler={updateClass}
                      oldDataSets={classDetails}
                    />
                  ) : activeTab === 3 ? (
                    <SuperVisor
                      createClassLoading={createClassLoading}
                      classId={classId}
                      updateHandler={updateClass}
                      oldDataSets={classDetails}
                    />
                  ) : (
                    <div className="flex justify-center]">
                      <p>Please select any option</p>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpdateClass;
