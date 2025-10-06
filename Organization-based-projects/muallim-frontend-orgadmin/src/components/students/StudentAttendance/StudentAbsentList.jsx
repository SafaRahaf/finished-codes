import React, { useEffect, useRef, useState, useCallback } from "react";
import { useGetAbsentStudentsQuery } from "@/store/features/class-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import nextConfig from "../../../../next.config.mjs";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const StudentAbsentList = ({ startDate, endDate }) => {
  const LIMIT = 6;
  const [page, setPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // Fetch data for the current page
  const { data, isFetching } = useGetAbsentStudentsQuery({
    startDate,
    endDate,
    limit: LIMIT,
    page,
  });

  // Append new students when data changes
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setStudents(data.data);
      } else {
        setStudents((prev) => [...prev, ...data.data]);
      }
      // If less than limit returned, no more data
      setHasMore(data.data.length === LIMIT);
    }
  }, [data, page]);

  // Reset when date changes
  useEffect(() => {
    setPage(1);
    setStudents([]);
    setHasMore(true);
  }, [startDate, endDate]);

  // Infinite scroll handler
  const listRef = useRef();
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isFetching || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="item bg-white shadow-custom-effect xl:px-6 xl:pt-8 xl:pb-4 rounded-xl mt-5">
      <h3 className="font-bold mb-4 text-2xl">Absent Students</h3>
      <div className="h-[240px] overflow-y-auto" ref={listRef}>
        <table className="min-w-full text-left text-base ">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="py-2 px-2 font-semibold ">Student</th>
              <th className="py-2 px-2 font-semibold ">Student ID</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && !isFetching ? (
              <tr>
                <td colSpan={2} className="py-4 px-2 text-center text-gray-400">
                  No absent students
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="border-y last:border-b-0">
                  <td className="py-4 px-2 flex items-center gap-3">
                    <img
                      src={
                        student.people_id?.profile_picture
                          ? `${
                              process.env.FILE_BROWSE_URL +
                              student?.people_id?.profile_picture
                            }`
                          : DefaultProfile.src
                      }
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span>
                      {student.people_id?.first_name || ""}{" "}
                      {student.people_id?.last_name || ""}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    {student.people_id?.unique_id || ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isFetching && (
        <div colSpan={3} className="py-4 flex justify-center text-gray-400">
          <SvgLoader />
        </div>
      )}
    </div>
  );
};

export default StudentAbsentList;
