import {
  AttendanceSuccessSvg,
  BookReadSvg,
  BooksSvg,
  PerformanceNoteSvg,
  TimeClockSvg,
} from "@/components/helpers/storeAllSvgs";
import usePeopleData from "@/hooks/usePeopleData";
import moment from "moment";
import React from "react";

const ClassAndSubjectTab = ({ data }) => {
  const peopleData = usePeopleData();

  return (
    <div className="grid mt-3 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 ">
      {data?.map((item, index) => (
        <div
          key={index}
          className="shadow-lg rounded-[12px] xl:border-r border-white  shadow-custom-effect"
        >
          <div className="p-6 pb-2  border-b mb-4 ">
            <h2 className="text-[24px] block pb-2 font-bold">{item?.name}</h2>
            <div className=" flex items-center gap-4">
              <p className="text-18">{item?.sub}</p>
              <p className="text-12">
                ID - {peopleData?.org_short_name + item?.sub_id}
              </p>
            </div>
          </div>

          <div className="p-6 pt-0 flex flex-col space-y-2  ">
            <p className="text-sm flex justify-start items-center gap-1">
              <BookReadSvg />
              <span>Students - {item?.students}</span>
            </p>

            <p className="text-sm flex justify-start items-center gap-1">
              <AttendanceSuccessSvg />
              <span>Attendance - {item?.attendance_percentage}%</span>
            </p>

            <div className=" text-sm text-gray-800">
              <div className="flex items-center gap-2 mb-5">
                <TimeClockSvg />
                <p className="text-gray-600">Day & Time </p>
              </div>
              <div>
                {item?.date_time?.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-1">
                    <p className=" font-bold capitalize ">{item?.day}</p>
                    <p className=" text-gray-600">
                      {moment(item?.check_in, "HH:mm:ss").format("hh:mm A")}
                      <span className="mx-2 font-bold">to</span>
                      {moment(item?.check_out, "HH:mm:ss").format("hh:mm A")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassAndSubjectTab;
