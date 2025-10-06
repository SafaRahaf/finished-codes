import React from "react";

const LeaveAndMoveListItem = ({ data }) => {
  return (
    <div className=" shadow-md rounded-lg my-4  bg-[#cbeeff49]">
      <div className=" p-3">
        <h2 className="font-semibold  text-black">{data.class_name}</h2>
        <p className="text-sm text-gray-600 mt-2">ID: {data.class_id}</p>
      </div>

      <div className="p-3 border-t border-gray-200">
        <p className="font-semibold text-sm">Students</p>
        <div className="flex justify-between text-sm text-gray-600 gap-2 flex-wrap">
          <p>
            Total{" "}
            {Number(data?.class_aggregated_data?.total_boy_student) +
              Number(data?.class_aggregated_data?.total_girl_student)}
          </p>
          <p>On Leave {" 0 "}</p>
          <p>Absent {" 0 "}</p>
        </div>
      </div>

      <div className="p-3 flex justify-between border-t border-gray-200">
        <p className="font-semibold text-sm">Alerts</p>
        <p className="text-sm text-gray-600">{"2"} to review</p>
      </div>

      <button className="w-full py-2 text-center text-white bg-[#9ca9f1] rounded-b-lg cursor-pointer">
        Class Details
      </button>
    </div>
  );
};

export default LeaveAndMoveListItem;
