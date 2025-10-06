import { Dropdown, Space } from "antd";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RightOutlined } from "@ant-design/icons";

const Schedule = ({ peopleId, data }) => {
  const ClassInfo = data?.class_people?.map((item) => item?.class_id);

  const dropdownItems = [
    {
      key: "1",
      label: (
        <Link className="cursor-pointer text-base p-1" href="#">
          Edit Schedule <RightOutlined className="text-sm" />
        </Link>
      ),
    },
  ];

  const formatUTCToLocal = (utcTime) => {
    if (!utcTime) return "N/A";

    let date;
    // Case 1: if the API gives only time like "14:00:00"
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(utcTime)) {
      // attach today’s date + "Z" to treat as UTC
      const today = new Date().toISOString().split("T")[0];
      date = new Date(`${today}T${utcTime}Z`);
    } else {
      // Case 2: already a valid datetime string
      date = new Date(utcTime);
    }

    if (isNaN(date)) return "N/A";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className=" py-6 px-6 rounded-[15px] shadow-custom-effect border border-slate-100  my-6 ">
      <div className="flex justify-between items-center gap-3 ">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <BsThreeDotsVertical
                className="cursor-pointer "
                size="26px"
                color="#4C5361"
              />
            </Space>
          </a>
        </Dropdown>
      </div>
      <div className="grid mt-5 lg:grid-row-2 grid-row-1 gap-3 text-16 h-48 overflow-y-scroll">
        <div className="item flex flex-col gap-2 lg:pr-3 lg:border-r-2 border-[#E7F7FF]">
          <p className="flex flex-col justify-start items-start gap-1">
            <span className="font-bold text-black">Class Days :</span>
            <span className="font-normal text-[#626A7C]">
              {/* show class days here */}
              {ClassInfo &&
                [
                  ...new Set(
                    ClassInfo.flatMap((item) =>
                      item?.class_days?.map((dayObj) => dayObj.day)
                    ).filter(Boolean)
                  ),
                ].map(
                  (day, idx, arr) =>
                    `${day.charAt(0).toUpperCase() + day.slice(1)}${
                      idx < arr.length - 1 ? ", " : ""
                    }`
                )}
            </span>
          </p>
        </div>
        <hr />
        <div className="item flex flex-col gap-2">
          {ClassInfo &&
            ClassInfo?.map((item, i) => (
              <div
                className="flex flex-col justify-start items-start gap-1"
                key={i}
              >
                <span className="font-bold text-black">{item?.class_name}</span>
                <span className="font-normal text-[#626A7C]">
                  {item?.class_days && item.class_days.length > 0 ? (
                    item.class_days.map((dayObj, idx) => (
                      <div key={idx}>
                        <span style={{ fontWeight: 500 }}>
                          {dayObj.day.charAt(0).toUpperCase() +
                            dayObj.day.slice(1)}
                        </span>
                        {": "}
                        <span>
                          {dayObj.check_in
                            ? formatUTCToLocal(dayObj.check_in)
                            : "N/A"}{" "}
                          -{" "}
                          {dayObj.check_out
                            ? formatUTCToLocal(dayObj.check_out)
                            : "N/A"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span>No schedule</span>
                  )}
                  {/* {item?.class_days && item.class_days.length > 0 ? (
                    item.class_days.map((dayObj, idx) => (
                      <div key={idx}>
                        <span style={{ fontWeight: 500 }}>
                          {dayObj.day.charAt(0).toUpperCase() +
                            dayObj.day.slice(1)}
                        </span>
                        {": "}
                        <span>
                          {dayObj.check_in ? dayObj.check_in : "N/A"} -{" "}
                          {dayObj.check_out ? dayObj.check_out : "N/A"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span>No schedule</span>
                  )} */}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
