import Link from "next/link";
import React from "react";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const TeacherListCard = ({ teacher }) => {
  return (
    <div className=" border rounded-lg my-4  ">
      <div className="flex justify-between items-center  p-3">
        <div className=" flex gap-3">
          <img
            src={
              teacher.profile_picture
                ? `${process.env.FILE_BROWSE_URL + teacher.profile_picture}`
                : DefaultProfile.src
            }
            alt=""
            className="w-[50px] h-[50px] rounded-full"
          />
          <div>
            <h2 className="font-semibold  ">
              {teacher.first_name + " " + teacher.last_name}
            </h2>
            <p className="text-12"> ID : {teacher.id}</p>
          </div>
        </div>
        {teacher?.people_orgs?.length > 0 && (
          <div className="flex items-center gap-2">
            <div
              className={`w-[10px] h-[10px] rounded-full ${
                teacher.people_orgs[0].status === "active"
                  ? "bg-[#60EC6E]"
                  : teacher.people_orgs[0].status === "casual leave"
                  ? "bg-[#B6BFF0]"
                  : teacher.people_orgs[0].status === "sick leave"
                  ? "bg-[#FDAE51]"
                  : "bg-gray-300"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-800">
              {teacher.people_orgs[0].status}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex justify-between border-t border-gray-200">
        <p className="font-semibold text-sm">Contact</p>
        <p className="text-sm text-gray-600">
          {(teacher?.user_id?.mobiles?.length &&
            teacher?.user_id?.mobiles?.find(
              (item) => item.mobile_type === "primary"
            )?.mobile_no) ||
            "-"}
        </p>
      </div>
      <div className="p-3 flex justify-between border-t border-gray-200">
        <p className="font-semibold text-sm">Designation</p>
        <div className="flex justify-between text-sm text-gray-600 gap-2 flex-wrap">
          <p>
            {" "}
            {teacher?.designation_employees.length &&
              teacher?.designation_employees.map(
                (designation) =>
                  designation?.designation_org_id?.designation_id?.designation
              )}
          </p>
        </div>
      </div>

      <Link href={`/teachers/lists/${teacher.id}`}>
        <button className="w-full py-2 text-center text-white bg-[#9ca9f1] rounded-b-lg cursor-pointer  border-[#9ca9f1]">
          View Profile
        </button>
      </Link>
    </div>
  );
};

export default TeacherListCard;
