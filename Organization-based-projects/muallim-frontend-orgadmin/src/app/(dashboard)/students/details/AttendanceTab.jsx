"use client";
import AllAttendanceSummeryChart from "@/components/attendance/AllAttendanceSummeryChart";
import Schedule from "@/components/students/StudentDetails/Schedule";
import AttendanceTable from "@/components/attendance/AttendanceTable";

const AttendanceTab = ({ peopleId, data }) => {
  return (
    <div className="mt-3 ">
      <div className="grid  justify-between lg:grid-cols-12  grid-cols-1 items-start gap-4 ">
        <div className="left  2xl:col-span-4 xl:col-span-5  lg:col-span-6 w-full ">
          <AllAttendanceSummeryChart
            peopleId={peopleId}
            summeryFor={"student"}
          />
          <Schedule peopleId={peopleId} data={data} />
        </div>
        <div className="right 2xl:col-span-8 xl:col-span-7 lg:col-span-6 w-full">
          <AttendanceTable summaryDetailsFor={"student"} peopleId={peopleId} />
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;
