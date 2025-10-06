import ClassListItem from "@/components/ClassManagement/ClassListItem";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { useRouter } from "next/navigation";
import { useLazyGetClassesQuery } from "@/store/features/class-management/apiSlice";
import { Button, Tooltip } from "antd";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { ATTENDANCE_TYPE } from "@/constants/attendenceType";
import Link from "next/link";
import { ShareSvg } from "@/components/helpers/storeAllSvgs/SharesSvg";
import { PrintSvg } from "@/components/helpers/storeAllSvgs/PrintSvg";
const { EARLY_LEAVE, TARDY, ATTENDANCE, ABSENT, SICK_LEAVE, LEAVE } =
  ATTENDANCE_TYPE;

const ClassListTable = ({ attendanceDetailsDate }) => {
  const router = useRouter();
  // console.log(attendanceDetailsDate);
  // search
  const [queryString, setQueryString] = useState("");
  const [filterByClass, setfilterByClass] = useState("");
  // sort
  const [sort, setSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  // pagination
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const observer = useRef(null);
  const limit = 7;
  // class
  const [classes, setClasses] = useState([]);

  // Useing lazy query for better control
  const [getClass, { data: fetchClasses, isFetching: loadingClasses }] =
    useLazyGetClassesQuery();

  // Initial data fetch
  useEffect(() => {
    pageRef.current = 1;
    setHasMore(true);
    setClasses([]);

    getClass({
      page: 1,
      limit: limit,
      searchTerm: queryString,
      sort,
      sortOrder,
      filterByDate: attendanceDetailsDate,
    });
  }, [attendanceDetailsDate, queryString, sort, sortOrder]);

  useEffect(() => {
    if (!loadingClasses && fetchClasses) {
      setClasses((prev) =>
        pageRef.current === 1
          ? fetchClasses?.data || []
          : [...prev, ...(fetchClasses?.data || [])]
      );
      setHasMore(
        fetchClasses?.data?.length > 0 &&
          pageRef.current * limit < fetchClasses?.meta?.total
      );
    }
  }, [fetchClasses, loadingClasses]);

  const lastItemRef = useCallback(
    (node) => {
      if (loadingClasses || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingClasses) {
          if (classes.length < fetchClasses?.meta?.total) {
            pageRef.current += 1;
            getClass({
              page: pageRef.current,
              limit,
              searchTerm: queryString,
              sort,
              sortOrder,
              filterByDate: attendanceDetailsDate,
            });
          } else {
            setHasMore(false);
          }
        }
      });

      if (node) observer.current.observe(node);
    },
    [
      loadingClasses,
      hasMore,
      queryString,
      sort,
      sortOrder,
      classes.length,
      fetchClasses?.meta?.total,
      attendanceDetailsDate,
    ]
  );

  const debouncedSearch = useCallback(
    debounce((query) => {
      pageRef.current = 1;
      setHasMore(true);
      setClasses([]);
      getClass({
        searchTerm: query,
        page: 1,
        limit,
        sort,
        sortOrder,
        filterByDate: attendanceDetailsDate,
      });
    }, 500),
    [sort, sortOrder, attendanceDetailsDate][(sort, sortOrder)]
  );

  const searchHandler = (e) => {
    const newQuery = e.target.value;
    setQueryString(newQuery);
    debouncedSearch(newQuery);
  };

  const sortChangeHandler = (value) => {
    let newSort = "first_name";
    let newOrder = "asc";

    if (value === "az") {
      newSort = "class_name";
      newOrder = "asc";
    } else if (value === "za") {
      newSort = "class_name";
      newOrder = "desc";
    } else if (value === "newest") {
      newSort = "created_at";
      newOrder = "desc";
    } else if (value === "oldest") {
      newSort = "created_at";
      newOrder = "asc";
    }

    setSort(newSort);
    setSortOrder(newOrder);

    // Trigger new search with updated sort
    pageRef.current = 1;
    setHasMore(true);
    setClasses([]);
    getClass({
      searchTerm: queryString,
      page: 1,
      limit,
      sort: newSort,
      sortOrder: newOrder,
    });
  };

  const getAttendanceValue = (columns, type) => {
    const found = columns?.find(
      (col) => col.event_participation_aggregated_column_name_id?.name === type
    );
    return found ? found.value : 0;
  };

  return (
    <div className="card py-8 px-3 h-full shadow-custom-effect bg-white rounded-[12px] ">
      <div className="flex lg:flex-row flex-col pb-6 lg:justify-between items-start lg:items-center gap-2 border-b  border-primary-brand-100 ">
        <p className="text-4xl font-bold lg:ml-3 m-2 ">Attendance</p>
        <div className="right flex lg:flex-nowrap flex-wrap lg:justify-end items-center gap-3 ">
          {/* --------action btns----- */}
          {/* search box */}
          <div className="flex gap-4 items-center">
            <div className=" !h-[36px] xl:min-w-[190px]  rounded border border-primary-brand-500 relative">
              {/* search input */}
              <input
                value={queryString}
                onChange={(e) => searchHandler(e)}
                placeholder="Search..."
                type="text"
                className="w-full h-full pl-[40px] pr-5 text-primary-brand-900 placeholder:text-primary-brand-300 text-16 tracking-wide rounded"
              />
              {/* search icon */}
              <span className="absolute left-[10px] top-1/2 transform -translate-y-1/2 text-2xl font-light text-primary-brand-600">
                <IoSearch />
              </span>
            </div>
            <div className="">
              <SelectBox
                inputHeight="!h-[35px] !w-[190px]"
                handler={sortChangeHandler}
                placeholder="A-Z"
                list={[
                  { label: "Sort by A-Z", value: "az" },
                  { label: "Sort by Z-A", value: "za" },
                  { label: "Newest", value: "newest" },
                  { label: "Oldest", value: "oldest" },
                ]}
              />
            </div>

            <div className="flex gap-3">
              <button className="   " title="Share">
                <ShareSvg height={28} width={28} />
              </button>
              <button className="px-2   " title="Print">
                <PrintSvg height={30} width={30} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loadingClasses && classes.length === 0 ? (
        <div className="flex justify-center items-center mt-4">
          <span>
            <SvgLoader />
          </span>
        </div>
      ) : (
        <div className=" sm:overflow-auto ">
          <div
            className={`sm:block hidden ${
              classes && classes.length > 0 ? "overflow-auto h-[500px]" : ""
            }`}
          >
            <table className="w-full">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr className="text-gray-700 text-left">
                  <th className="px-4 py-6 font-semibold min-w-[200px]">
                    Class Name
                  </th>
                  <th className="px-4 py-6 font-semibold min-w-[124px]">
                    Class ID
                  </th>
                  <th className="px-4 py-6 font-semibold min-w-10">Students</th>
                  <th className="px-4 py-6 font-semibold min-w-10">Present</th>
                  <th className="px-4 py-6 font-semibold min-w-10">Sick</th>
                  <th className="px-4 py-6 font-semibold min-w-10">On Leave</th>
                  <th className="px-4 py-6 font-semibold min-w-10">
                    <div className="flex items-center gap-1">
                      Absent
                      <Tooltip title="In the last class" color="white">
                        <img
                          src="/assets/img/icons/help.svg"
                          className="w-5 h-5 "
                          alt="Help Icon"
                        />
                      </Tooltip>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {classes && classes.length > 0 ? (
                  classes.map((item, itemIndex) => {
                    const columns =
                      item.attendance_aggregated_data
                        ?.event_participation_aggregated_columns || [];

                    const absent = getAttendanceValue(columns, ABSENT);
                    const sick = getAttendanceValue(columns, SICK_LEAVE);
                    const earlyLeave = getAttendanceValue(columns, EARLY_LEAVE);
                    const leave = getAttendanceValue(columns, LEAVE);
                    const present = getAttendanceValue(columns, ATTENDANCE);
                    const tardy = getAttendanceValue(columns, TARDY);

                    return (
                      <tr
                        key={itemIndex}
                        ref={
                          itemIndex === classes.length - 1 ? lastItemRef : null
                        }
                        className="border-y border-primary-brand-100 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          router.push(
                            `/students/attendance/details/${
                              item.id
                            }?className=${encodeURIComponent(item.class_name)}`
                          )
                        }
                      >
                        <td className="px-4 py-6 font-bold">
                          {item?.class_name}{" "}
                        </td>

                        <td className="px-4 py-6">{item?.class_id}</td>
                        <td className="px-4 py-6">
                          {Number(
                            item?.class_aggregated_data?.total_boy_student || 0
                          ) +
                            Number(
                              item?.class_aggregated_data?.total_girl_student ||
                                0
                            )}
                        </td>
                        <td className="px-4 py-6">
                          {present + tardy + earlyLeave}
                        </td>
                        <td className="px-4 py-6">{sick}</td>
                        <td className="px-4 py-6">{leave}</td>
                        <td className="px-4 py-6">{absent}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-8 py-36 text-center text-gray-500 text-2xl"
                    >
                      <div className="flex flex-col items-center justify-center gap-8">
                        <div className="text-lg text-gray-500 max-w-xl">
                          {queryString
                            ? "No classes match your search."
                            : filterByClass
                            ? "No classes found for this department."
                            : "You haven't created any class yet. Please do so at your earliest convenience."}
                        </div>
                        <img
                          src="../../../../assets/img/icons/plus-square.svg"
                          alt="Create class icon"
                          className="w-24 h-24 opacity-60"
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* -----card for small device----------- */}
          <div className="sm:hidden visible ">
            {classes &&
              classes.length > 0 &&
              classes.map((item, itemIndex) => (
                <ClassListItem key={itemIndex} data={item} />
              ))}
          </div>

          {loadingClasses && classes.length > 0 && (
            <div className="flex justify-center ">
              <SvgLoader />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassListTable;
