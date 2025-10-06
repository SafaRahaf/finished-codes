import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { Button, Pagination, Tooltip } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import {
  useGetClassSubjectsQuery,
  useLazyGetClassSubjectsQuery,
} from "@/store/features/class-management/apiSlice";

function ClassSubjectList({ id, standAloneSubjects }) {
  const [queryString, setQueryString] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 5;
  const [SubjectsByClass, setSubjectsByClass] = useState([]);
  const { data: fetchSubjects, isFetching: loadingSubjects } =
    useGetClassSubjectsQuery({
      id: id,
      page: currentPage,
      limit: limit,
      searchTerm: queryString,
    });
  const [
    getClassSubjects,
    { data: queryDataSubjects, isFetching: querySubjectsLoading },
  ] = useLazyGetClassSubjectsQuery();

  useEffect(() => {
    if (fetchSubjects && !loadingSubjects) {
      setSubjectsByClass(fetchSubjects?.data);
      setTotalPages(fetchSubjects?.meta?.total);
    }
  }, [fetchSubjects, loadingSubjects]);
  useEffect(() => {
    if (queryDataSubjects && !querySubjectsLoading) {
      setClasses(queryDataSubjects?.data);
      setTotalPages(queryDataSubjects?.meta?.total);
    }
  }, [queryDataSubjects]);

  // change page
  const handleChangePage = (page) => {
    setCurrentPage(page);
  };
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      getClassSubjects({ id: id, searchTerm: query, page: currentPage, limit });
    }, 500),
    [currentPage, limit]
  );

  // Handle input change
  const searchHandler = (e) => {
    const newQuery = e.target.value;
    setQueryString(newQuery);
    debouncedSearch(newQuery);
  };
  return (
    <div className="card lg:py-8 lg:px-6 p-5 lg:mt-0 mt-10 h-full shadow-lg bg-white rounded-[12px] relative pointer-events-none">
      <div
        className="absolute inset-0 rounded-[12px] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.00) 0%, #FFF 65.92%)",
        }}
      />
      <div className="flex lg:flex-row flex-col mb-6 justify-between lg:items-center items-start gap-2">
        <p className="text-2xl font-bold text-gray-500">Subjects</p>
        <div className="right flex justify-end items-center gap-[8px]">
          <Button style={{ background: "gray" }} size="large">
            <div className="text-sm bg-gray text-white flex space-x-3 items-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 7H9V1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V7H1C0.734784 7 0.48043 7.10536 0.292893 7.29289C0.105357 7.48043 0 7.73478 0 8C0 8.26522 0.105357 8.51957 0.292893 8.70711C0.48043 8.89464 0.734784 9 1 9H7V15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16C8.26522 16 8.51957 15.8946 8.70711 15.7071C8.89464 15.5196 9 15.2652 9 15V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7Z"
                  fill="white"
                />
              </svg>
              <span>Add Subject</span>
            </div>
          </Button>
        </div>
      </div>

      <div className="table-responsive overflow-x-auto">
        {/* {loadingSubjects && !fetchSubjects ? (
          <div className="flex justify-center mt-4">
            <span>
              <SvgLoader />
            </span>
          </div>
        ) : ( */}
        <div className="w-full overflow-x-auto  ">
          <table className="w-full overflow-hidden">
            <thead>
              <tr className="text-gray-700 text-left">
                <th className="px-4 py-6 font-semibold min-w-[200px]">
                  Subject Name
                </th>
                <th className="px-4 py-6 font-semibold min-w-[124px]">
                  Teacher
                </th>
                <th className="px-4 py-6 font-semibold min-w-10">Day</th>
                <th className="px-4 py-6 font-semibold min-w-10">Time</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {/* {SubjectsByClass &&
                SubjectsByClass.length > 0 &&
                SubjectsByClass.map((item, itemIndex) => (
                  <tr
                    key={itemIndex}
                    className="border-t border-primary-brand-100"
                  >
                    <td className="px-4 py-6">
                      {item?.people_id?.first_name +
                        " " +
                        item?.people_id?.last_name}
                    </td>
                    <td className="px-4 py-6">{item?.attendance_parentage}</td>
                    <td className="px-4 py-6">{item?.performance_parentage}</td>
                    <td className="px-4 py-6">{item?.performance_parentage}</td>
                  </tr>
                ))} */}
              {/* dummy data just for MVP  */}
              <tr className="border-y border-primary-brand-100">
                <td className="px-4 py-6">Islamic History</td>
                <td className="px-4 py-6">Mahmullah Hasan</td>
                <td className="px-4 py-6">Mon - Fri</td>
                <td className="px-4 py-6">8.00 am</td>
              </tr>
              <tr className="border-y border-primary-brand-100">
                <td className="px-4 py-6">Islamic History</td>
                <td className="px-4 py-6">Mahmullah Hasan</td>
                <td className="px-4 py-6">Mon - Fri</td>
                <td className="px-4 py-6">8.00 am</td>
              </tr>
              <tr className="border-y border-primary-brand-100">
                <td className="px-4 py-6">Islamic History</td>
                <td className="px-4 py-6">Mahmullah Hasan</td>
                <td className="px-4 py-6">Mon - Fri</td>
                <td className="px-4 py-6">8.00 am</td>
              </tr>
            </tbody>
          </table>
          {/* Pagination Component */}
          {/* <div className="flex justify-end mt-4">
              <Pagination
                current={currentPage}
                total={Math.ceil(totalPages / limit)}
                pageSize={limit}
                onChange={handleChangePage}
                showSizeChanger={false}
              />
            </div> */}
        </div>
        {/* )} */}
      </div>

      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-10 ">
        <p className="text-xl font-bold text-black flex items-center gap-1 px-4 py-2">
          Coming Soon
          <Tooltip
            title="This section is not functional yet. The Subject Module will launch soon, allowing you to Manage all Subject Related to this Class.


"
            color="white"
          >
            <img
              src="/assets/img/icons/help.svg"
              className="help w-5 h-5 cursor-pointer pointer-events-auto"
              alt="Help"
            />
          </Tooltip>
        </p>
      </div>
    </div>
  );
}

export default ClassSubjectList;
