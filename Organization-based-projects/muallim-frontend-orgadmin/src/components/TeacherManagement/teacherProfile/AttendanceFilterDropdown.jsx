"use client";
import { message } from "antd";
import React, { useEffect, useState } from "react";

const AttendanceFilterDropdown = ({
  setStartDate,
  setEndDate,
  setStartFullMonth,
  setEndFullMonth,
  resetFilterHandler,
  dynamicButtonText = true,
}) => {
  const [showList, setShowList] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedStart, setSelectedStart] = useState({
    year: null,
    month: null,
  });
  const [selectedEnd, setSelectedEnd] = useState({ year: null, month: null });
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const componentStateResetHandler = () => {
    setSelectedYear(null);
    setSelectedStart({ year: null, month: null });
    setSelectedEnd({ year: null, month: null });
    setIsSelectingStart(true);
    setShowList(false);
    setErrorMessage("");
    resetFilterHandler();
  };

  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  const years = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthMap = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  useEffect(() => {
    if (
      selectedStart.year &&
      selectedStart.month &&
      selectedEnd.year &&
      selectedEnd.month
    ) {
      const startDate = `${selectedStart.year}-${
        monthMap[selectedStart.month]
      }-01`;
      const lastDayOfMonth = new Date(
        selectedEnd.year,
        parseInt(monthMap[selectedEnd.month]),
        0
      ).getDate();
      const endDate = `${selectedEnd.year}-${
        monthMap[selectedEnd.month]
      }-${lastDayOfMonth}`;

      setStartFullMonth(`${selectedStart.month} ${selectedStart.year}`);
      setEndFullMonth(`${selectedEnd.month} ${selectedEnd.year}`);
      setStartDate(startDate);
      setEndDate(endDate);
    }
  }, [selectedStart, selectedEnd]);

  const handleMonthSelect = (year, month) => {
    if (isSelectingStart) {
      setSelectedStart({ year, month });
      setIsSelectingStart(false);
      setErrorMessage("");
    } else {
      const startDate = new Date(
        selectedStart.year,
        parseInt(monthMap[selectedStart.month]) - 1,
        1
      );
      const endDate = new Date(year, parseInt(monthMap[month]) - 1, 1);

      if (endDate < startDate) {
        setErrorMessage("End date cannot be before start date");
        message.error("End date cannot be before start date");
        return;
      }

      // if (year !== selectedStart.year) {
      //   setErrorMessage("Please select dates from the same year");
      //   return;
      // }

      setSelectedEnd({ year, month });
      setShowList(false);
      setSelectedYear(null);
      setErrorMessage("");
    }
  };

  const getDisplayText = () => {
    if (errorMessage) {
      return errorMessage;
    }
    if (
      selectedStart?.year &&
      selectedStart?.month &&
      selectedEnd?.year &&
      selectedEnd?.month
    ) {
      return selectedStart.month === selectedEnd.month
        ? `${selectedStart.month} ${selectedStart.year}`
        : `${selectedStart.month} ${selectedStart.year} - ${selectedEnd.month} ${selectedEnd.year}`;
    }
    return "Select Months";
  };

  return (
    <div className="w-full relative">
      {/* <div
        className="flex flex-row items-center justify-between w-100% border border-gray-300 rounded-md p-2.5 bg-white cursor-pointer"
        onClick={() => {
          setShowList(!showList);
          setIsSelectingStart(true);
          setSelectedYear(null);
        }}
      >
        <span className="text-base text-gray-700">{getDisplayText()}</span>
        <span className="text-lg text-gray-700">{showList ? "▲" : "▼"}</span>
      </div> */}
      <button
        type="button"
        onClick={() => {
          setShowList(!showList);
          setIsSelectingStart(true);
          setSelectedYear(null);
          setErrorMessage("");
        }}
        className={`w-auto h-[36px] flex items-center justify-between gap-12 border border-gray-600 rounded pr-2 pl-2 py-2 overflow-hidden ${
          errorMessage ? "border-red-500" : ""
        }`}
      >
        <span className={`text-sm ${errorMessage ? "text-red-500" : ""}`}>
          {dynamicButtonText ? getDisplayText() : "Filter"}
        </span>
        <img
          src="/assets/img/icons/filter.svg"
          alt="Filter icon"
          className="w-4 h-4 object-contain"
        />
      </button>

      {showList && (
        <div className="w-[212px] bg-white border border-gray-300 rounded-md mt-1 p-2.5 absolute top-[40px] right-0 z-10">
          {!selectedYear ? (
            <div>
              <div className="text-base font-bold text-center mb-2.5">
                Select Year
              </div>
              {years.map((year) => (
                <div
                  key={year}
                  className="p-3 border-b border-gray-200 last:border-b-0 cursor-pointer"
                  onClick={() => setSelectedYear(year)}
                >
                  <div className="text-base text-center">{year}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div
                className="p-2.5 mb-1.5 cursor-pointer text-blue-500 text-base"
                onClick={() => {
                  componentStateResetHandler();
                }}
              >
                ← Back to Years
              </div>
              <div className="text-base font-bold text-center mb-2.5">
                Select {isSelectingStart ? "Start" : "End"} Month
              </div>
              <div className="w-full max-h-[300px] overflow-y-auto">
                {months.map((month, index) => {
                  if (selectedYear === currentYear && index > currentMonthIndex)
                    return null;

                  const isStartSelected =
                    selectedStart.year === selectedYear &&
                    selectedStart.month === month;
                  const isEndSelected =
                    selectedEnd.year === selectedYear &&
                    selectedEnd.month === month;

                  return (
                    <div
                      key={`${selectedYear}-${month}`}
                      className="p-3 border-b border-gray-200 last:border-b-0 cursor-pointer"
                      onClick={() => handleMonthSelect(selectedYear, month)}
                    >
                      <div className="flex items-center">
                        <div
                          className={`h-4 w-4 rounded-full border-2 mr-2.5 ${
                            isStartSelected
                              ? "border-green-500 bg-green-500"
                              : isEndSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        />
                        <span className="text-base">{month}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceFilterDropdown;
