import Switcher from "@/components/common/Inputs/Buttons/Switch";
import React from "react";

function AttendenceUpdate() {
  return (
    <>
      <div className="w-full mb-32">
        <div className="flex justify-start items-center gap-8">
          <p className="text-sm font-bold">Subject wise Attendance</p>
          {/* switch */}
          <Switcher />
        </div>
        <p className="mt-4">
          If you add subject wise attendance teacher will be able to roll call
          for every subject.
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn bg-[#22252B] py-[13px] px-[24px] font-bold text-lg rounded-[8px] text-white"
        >
          Save Changes
        </button>
      </div>
    </>
  );
}

export default AttendenceUpdate;
