"use client";
import Schedule from "@/components/TeacherManagement/teacherProfile/Schedule";
import AttendanceSummaryChart from "@/components/TeacherManagement/teacherProfile/AttendanceSummaryChart";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import AllAttendanceSummeryChart from "@/components/attendance/AllAttendanceSummeryChart";

const AttendanceTab = ({ peopleId, data }) => {
  return (
    <div className="mt-3 ">
      <div className="grid  justify-between lg:grid-cols-12  grid-cols-1 items-start gap-4 ">
        <div className="left  2xl:col-span-4 xl:col-span-5  lg:col-span-6 w-full ">
          {/* <AttendanceSummaryChart peopleId={peopleId} /> */}
          <AllAttendanceSummeryChart
            peopleId={peopleId}
            summeryFor={"teacher"}
          />
          <Schedule data={data} peopleId={peopleId} />
        </div>
        <div className="right 2xl:col-span-8 xl:col-span-7 lg:col-span-6 w-full">
          <AttendanceTable peopleId={peopleId} summaryDetailsFor="teacher" />
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;
