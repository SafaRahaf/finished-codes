"use client";
import InviteTeacher from "@/components/TeacherManagement/teachers/invite-teacher";
import Link from "next/link";
import React, { useState } from "react";

const CreateClass = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      {/* bradcrumb */}
      <div className="text-[#798295] text-14 flex items-center mt-3  font-bold">
        <Link href="/dashboard">Teacher Dashboard</Link>
        <span className="mx-3">
          <img src="/assets/img/icons/chevron.svg" alt="Chevron Icon" />
        </span>
        <Link href="/teachers">Teachers</Link>
        <span className="mx-3">
          <img src="/assets/img/icons/chevron.svg" alt="Chevron Icon" />
        </span>
        <span className="text-black font-bold">Add Teacher/Employee</span>
      </div>
      {/* bradcrumb */}
      <InviteTeacher setShowModal={setShowModal} />

      {showModal && (
        <>
          <div className="modal-bg" onClick={() => setShowModal(false)}></div>
          <div className="modal-body text-center">
            <img src="../../../../assets/img/icons/green-check.svg" alt="" />

            <p className="text-center text-lg text-[#798295]">
              An invitation to add a teacher/employee has been successfully sent
              via email. You will receive a notification when the user signs up.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="bg-black rounded-[8px] lg:px-[50px] px-[50px] py-3 text-white font-bold block mx-auto mt-10"
            >
              Okay, Understood
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateClass;
