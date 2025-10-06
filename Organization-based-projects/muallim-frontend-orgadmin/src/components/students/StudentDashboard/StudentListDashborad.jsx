import React, { useState, useEffect, useCallback, useRef } from "react";
import StudentListCard from "../StudentListCard";
import SelectBox from "../../common/Inputs/Input/SelectBox";
import SvgLoader from "../../ui/loaders/SvgLoader";
import siteConfig from "@/config";
import { useRouter } from "next/navigation";
import {
  getDecodedToken,
  getOrgShortName,
} from "@/utilities/helpers/getDecodedValus";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import { useSelector } from "react-redux";

const StudentListDashborad = ({
  StudentsByClass,
  searchHandler,
  fetchStudents,
  loadingStudents,
  queryString,
  lastItemRef,
  classes,
  setSelectedClass,
  queryStudentsLoading,
}) => {
  const router = useRouter();
  const decoded = getDecodedToken();
  const orgShortName =
    useSelector((state) => state.auth.orgShortName) || getOrgShortName();

  const NavigateToStudentDetails = (id) => {
    if (!id) return;
    router.push(`/students/details?id=${id}`);
  };

  return (
    <div className="py-8 lg:px-5 px-2 h-full shadow-custom-effect bg-white rounded-[12px]">
      <div className="flex xl:flex-row flex-col pb-6 justify-between items-center gap-2 border-b border-primary-brand-100">
        <div className="w-full">
          <label className="text-14 font-bold">Select grade/class</label>
          <SelectBox
            inputHeight="!h-[36px]"
            placeholder="Select Grade/Class"
            handler={(val) => setSelectedClass(val)}
            list={[{ label: "All Classes", value: "" }, ...classes]}
          />
        </div>
        <div className="w-full mt-9">
          <input
            type="text"
            placeholder="Search"
            className="w-full mb-2 border border-[#565555] rounded-[5px] px-4 py-1"
            value={queryString}
            onChange={(e) => searchHandler(e)}
          />
        </div>
      </div>

      <div className="overflow-y-scroll h-[500px]">
        {(loadingStudents || queryStudentsLoading) && !fetchStudents ? (
          <div className="flex justify-center mt-4">
            <SvgLoader />
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-700 text-left sticky bg-white top-0">
                    <th className="px-4 py-4 font-semibold">Student</th>
                    <th className=" font-semibold text-center">Student ID</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {StudentsByClass?.length > 0 &&
                    StudentsByClass.map((item, index) => (
                      <tr
                        key={index}
                        className="border-t border-primary-brand-100 cursor-pointer hover:bg-slate-50"
                        onClick={() => NavigateToStudentDetails(item?.id)}
                        ref={
                          index === StudentsByClass.length - 1
                            ? lastItemRef
                            : null
                        }
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img
                              className="rounded-full w-12 h-12 object-cover"
                              src={
                                item?.profile_picture
                                  ? siteConfig.FILE_BROWSE_URL +
                                    item?.profile_picture
                                  : DefaultProfile.src
                              }
                              width={56}
                              height={56}
                              alt="avatar"
                            />
                            <span>
                              <p className="">
                                {item?.first_name + " " + item?.last_name}
                              </p>
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          {orgShortName || decoded?.org_short_name}
                          {item?.unique_id || "-"}
                        </td>
                      </tr>
                    ))}
                  {!loadingStudents &&
                    !queryStudentsLoading &&
                    StudentsByClass.length === 0 && (
                      <tr className="pt-4">
                        <td colSpan={2} className="text-center">
                          No Students Found.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
              {(loadingStudents || queryStudentsLoading) &&
                StudentsByClass.length > 0 && (
                  <div className="pt-4 flex justify-center w-full">
                    <SvgLoader />
                  </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden block">
              {StudentsByClass?.length > 0 &&
                StudentsByClass.map((item, index) => (
                  <StudentListCard key={index} item={item} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentListDashborad;
