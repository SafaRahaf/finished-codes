"use client";
import UpdateClass from "@/components/ClassManagement/UpdateClass";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { useGetClassQuery } from "@/store/features/class-management/apiSlice";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

function page() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [classDetails, setClassDetails] = useState(null);
  const { data: getClassData, isFetching: loadingClassData } =
    useGetClassQuery(id);
  useEffect(() => {
    // fetch data from api
    if (!loadingClassData && getClassData) {
      setClassDetails(getClassData);
    }
  }, [getClassData, loadingClassData]);

  return (
    <div>
      {/* bradcrumb */}
      <div className="flex justify-start items-center gap-4 mb-6">
        <Link href="/classes">Class Management</Link>
        <img src="/assets/img/icons/chevron.svg" alt="Chevron Icon" />
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/classes/lists/${id}`;
          }}
        >
          {getClassData?.data?.class_name || "Class"}
        </Link>
        <img src="/assets/img/icons/chevron.svg" alt="Chevron Icon" />
        <Link href="">Edit Class</Link>
      </div>
      {getClassData && !loadingClassData ? (
        <UpdateClass classId={id} classDetails={classDetails} />
      ) : (
        <div className="flex justify-center">
          <SvgLoader />
        </div>
      )}
    </div>
  );
}

export default page;
