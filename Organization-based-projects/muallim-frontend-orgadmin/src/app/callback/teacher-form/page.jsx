import AddNewTeacher from "@/components/TeacherManagement/teachers/add-teacher";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import React, { Suspense } from "react";

const TeacherForm = ({ searchParams }) => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex justify-center items-center">
          <span>
            <SvgLoader className="text-primary-brand-default" />
          </span>
        </div>
      }
    >
      <AddNewTeacher
        token={searchParams.token}
        header_token={searchParams.header_token}
      />
    </Suspense>
  );
};

export default TeacherForm;
