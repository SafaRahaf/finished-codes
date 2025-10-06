"use client";

import DailyViewSheet from "@/components/TeacherManagement/TeacherAttendance/DailyViewSheet";
import MonthlyViewSheet from "@/components/TeacherManagement/TeacherAttendance/MonthlyViewSheet";
import { Tabs } from "antd";
import Link from "next/link";
import React, { useState } from "react";
import "../../../../components/Print-PDF-Download/print/print.css";
import { MdKeyboardArrowRight } from "react-icons/md";
import moment from "moment";

const Attendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("monthly");

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
          <Link href="/teachers">Teacher Management</Link>
          <span className="md:mx-3">
            <MdKeyboardArrowRight />
          </span>
          <Link href="/teachers/attendance" className="text-black">
            Attendance Sheet
          </Link>
        </p>
      </div>

      {/* Tabs: Monthly & Daily View */}
      <Tabs
        defaultActiveKey="monthly"
        className="custom-tabs"
        destroyInactiveTabPane
        onChange={handleViewTypeChange}
      >
        <Tabs.TabPane tab="Monthly View" key="monthly">
          {/* monthly view tab page */}
          <div key="monthly-view">
            <MonthlyViewSheet
              currentDate={currentDate}
              onDateChange={handleDateChange}
            />
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Daily View" key="daily">
          {/* daily view tab page */}
          <div key="daily-view">
            <DailyViewSheet
              currentDate={currentDate}
              onDateChange={handleDateChange}
            />
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};
export default Attendance;
