"use client";

import { Tabs } from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";
// import "../../../../components/Print-PDF-Download/print/print.css";
import "@/components/Print-PDF-Download/print/print.css";

import { MdKeyboardArrowRight } from "react-icons/md";
import DailyViewSheet from "@/components/students/StudentAttendance/DailyViewSheet";
import MonthlyViewSheet from "@/components/students/StudentAttendance/MonthlyViewSheet";
import { useParams, useSearchParams } from "next/navigation";
import { useClassDashboardCountQuery } from "@/store/features/dashboard/apiSlice";

const Attendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("daily");

  const params = useParams();
  const searchParams = useSearchParams();

  const classId = params.id;
  const className = searchParams.get("className");

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewTypeChange = (type) => {
    setViewType(type);
  };

  return (
    <div className="">
      {/* breadcrumb--------- */}
      <div className="flex justify-between items-center  my-4 no-print">
        <p className="text-[#798295] text-14 flex items-center font-bold ">
          <Link href="/students">Student Management</Link>
          <span className="md:mx-3">
            <MdKeyboardArrowRight />
          </span>
          <Link href="/students/attendance" className="text-[#798295]">
            Attendance Dashboard
          </Link>
          <span className="md:mx-3">
            <MdKeyboardArrowRight />
          </span>
          <Link href="/students/attendance/details" className="text-black">
            Attendance Sheet
          </Link>
        </p>
      </div>

      {/* Tabs: Monthly & Daily View */}
      <Tabs
        defaultActiveKey="daily"
        className="custom-tabs"
        destroyInactiveTabPane
        onChange={handleViewTypeChange}
      >
        <Tabs.TabPane tab="Daily View" key="daily">
          {/* daily view tab page */}
          <div key="daily-view">
            <DailyViewSheet
              currentDate={currentDate}
              onDateChange={handleDateChange}
              className={className}
              classId={classId}
            />
          </div>
        </Tabs.TabPane>{" "}
        <Tabs.TabPane tab="Monthly View" key="monthly">
          {/* monthly view tab page */}
          <div key="monthly-view">
            <MonthlyViewSheet
              currentDate={currentDate}
              onDateChange={handleDateChange}
              className={className}
              classId={classId}
            />
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};
export default Attendance;
