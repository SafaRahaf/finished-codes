import { Dropdown, Space } from "antd";
import React from "react";
import { useRouter } from "next/navigation";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RightOutlined } from "@ant-design/icons";
import { daysOfWeekFull } from "@/constants/daysOfFullWeek";

const Schedule = ({ data, peopleId }) => {
  const schedules = data?.employee_schedules || [];
  const router = useRouter();

  const formatTime = (time) => {
    if (!time) return "";

    // Create a Date in UTC using today's date + time
    const [h, m] = time.split(":");
    const utcDate = new Date(Date.UTC(1970, 0, 1, h, m));

    // Convert to local string
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(utcDate);
  };

  const capitalize = (day) => day.charAt(0).toUpperCase() + day.slice(1);

  const formatDayRange = (days) => {
    if (!days.length) return [];

    const dayIndexMap = days.map((day) => ({
      day,
      index: daysOfWeekFull.indexOf(day),
    }));

    // Sort days by index in the week
    dayIndexMap.sort((a, b) => a.index - b.index);

    const ranges = [];
    let tempGroup = [dayIndexMap[0]];

    for (let i = 1; i < dayIndexMap.length; i++) {
      const curr = dayIndexMap[i];
      const prev = dayIndexMap[i - 1];

      if (curr.index === prev.index + 1) {
        tempGroup.push(curr);
      } else {
        ranges.push(tempGroup);
        tempGroup = [curr];
      }
    }
    ranges.push(tempGroup);

    return ranges.map((group) => {
      if (group.length === 1) {
        return capitalize(group[0].day);
      } else if (group.length === 2) {
        return `${capitalize(group[0].day)}, ${capitalize(group[1].day)}`;
      } else {
        return `${capitalize(group[0].day)}–${capitalize(
          group[group.length - 1].day
        )}`;
      }
    });
  };

  const navigateToEditPage = () => {
    if (peopleId) {
      router.push(`/teachers/update/${peopleId}?editSchedule=true`);
    }
  };

  const dropdownItems = [
    {
      key: "1",
      label: (
        <button
          className="cursor-pointer text-base p-1"
          onClick={navigateToEditPage}
        >
          Edit Schedule <RightOutlined className="text-sm" />
        </button>
      ),
    },
  ];

  // Filter only valid weekdays
  const workdaySchedules = schedules.filter((s) =>
    daysOfWeekFull.includes(s.day?.toLowerCase())
  );

  // Group by time range
  const groupedByTime = schedules.reduce((acc, item) => {
    const key = `${item.check_in}-${item.check_out}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.day?.toLowerCase());
    return acc;
  }, {});

  return (
    <div className="py-6 px-6 rounded-[15px] shadow-custom-effect border border-slate-100 my-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <BsThreeDotsVertical
                className="cursor-pointer"
                size="26px"
                color="#4C5361"
              />
            </Space>
          </a>
        </Dropdown>
      </div>

      {/* Schedule Info */}
      <div className="gap-4 h-44 overflow-y-scroll">
        {/* Workday Section */}
        <div className="w-full">
          <p className="text-base flex flex-wrap gap-2 pb-2">
            <span className="font-bold text-black">
              {workdaySchedules.length > 1 ? "Workdays:" : "Workday:"}
            </span>
            <span className="text-[#626A7C]">
              {workdaySchedules.length
                ? [
                    ...new Set(workdaySchedules.map((s) => capitalize(s.day))),
                  ].join(", ")
                : "N/A"}
            </span>
          </p>
        </div>
        <hr className="py-1" />
        <div className="w-full pt-2 lg:pt-0">
          {Object.entries(groupedByTime).map(([timeKey, days], idx) => {
            const [checkIn, checkOut] = timeKey.split("-");
            const timeRange = `${formatTime(checkIn)} - ${formatTime(
              checkOut
            )}`;
            const dayRanges = formatDayRange(days);

            const AddSpace = (dayRanges) => {
              return dayRanges.join(" ");
            };

            const MakeComaIntoHyphen = (dayRanges) => {
              return AddSpace(dayRanges).split(", ").join("-");
            };

            const FinalResult = (dayRanges) =>
              MakeComaIntoHyphen(dayRanges).split(" ").join(", ");

            // console.log(FinalResult(dayRanges));
            return (
              <div key={idx} className="mb-2 text-base">
                {/* {dayRanges.map((range, i) => ( */}
                <div className="mb-2 flex flex-wrap">
                  <p className="font-bold text-black pr-2">
                    {FinalResult(dayRanges)}:{" "}
                  </p>
                  <p className="text-[#626A7C]">{timeRange}</p>
                </div>
                {/* ))} */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
