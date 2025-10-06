"use client";
import AddNewClass from "@/components/ClassManagement/add-class";
import Link from "next/link";
import React from "react";

const CreateClass = () => {
  return (
    <div>
      {/* bradcrumb */}
      <div className="flex justify-start items-center gap-4">
        <Link href="/classes">Class Management</Link>
        <img src="/assets/img/icons/chevron.svg" alt="Chevron Icon" />
        <Link href="">All Classes</Link>
      </div>
      {/* bradcrumb */}
      <AddNewClass />
    </div>
  );
};

export default CreateClass;
