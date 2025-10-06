"use client";
import AddNewStudent from "@/components/students/add-student";
import { MdKeyboardArrowRight } from "react-icons/md";

const AddStudent = () => {
  return (
    <div>
      <p className="text-[#798295] text-14 flex items-center mt-6 font-bold">
        <a href="/students">Student Directory</a>
        <span className="mx-3">
          <MdKeyboardArrowRight />
        </span>
        <a href="/students/list">Students</a>
        <span className="mx-3">
          <MdKeyboardArrowRight />
        </span>
        <span className="text-black font-bold">Add Student</span>
      </p>
      <AddNewStudent />
    </div>
  );
};

export default AddStudent;
