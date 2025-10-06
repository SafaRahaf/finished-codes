import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
function InputDateMonth({
  handler,
  label,
  isRequired,
  className,
  error,
  defaultValue,
}) {
  const initialDate = defaultValue ? dayjs().month(defaultValue - 1) : null;
  const [selectedMonth, setSelectedMonth] = useState(initialDate);
  useEffect(() => {
    if (defaultValue) {
      setSelectedMonth(dayjs().month(defaultValue - 1)); // Set initial value from defaultValue prop
    } else {
      setSelectedMonth(null); // Clear the date when defaultValue is empty
    }
  }, [defaultValue]);
  const onChange = (date, dateString) => {
    if (date) {
      setSelectedMonth(date);
      const monthNumber = date.month() + 1; // Moment.js returns months from 0 (Jan = 0, Feb = 1)
      handler("mm", monthNumber >= 10 ? `${monthNumber}` : `0${monthNumber}`);
    } else {
      console.log("No date selected");
    }
  };

  return (
    <>
      <div className={`grid ${className || ""}`}>
        {label && (
          <label className="text-14 font-bold capitalize">
            {label} {isRequired && <sup className="text-danger-700">*</sup>}
          </label>
        )}

        <DatePicker
          value={selectedMonth}
          placeholder="MM"
          className={`custom-date-input inline-block !mt-1 placeholder:text-[#9BA3AF] text-black w-full !h-[45px]`}
          onChange={onChange}
          picker="month"
          allowClear={false}
          popupClassName="custom-month-dropdown"
          format="MMM"
        />
      </div>
      <style>{`
      .custom-date-input.ant-picker{
         padding:0 !important;
         border-color: transparent !important;
      }
      .custom-date-input .ant-picker-input{
      width:100% !important;      
      height:100% !important;
      border:1px solid #798295 !important;
      border-radius:4px !important;
      padding:0 1rem !important;
      overflow:hidden !important;
      }
      .custom-date-input .ant-picker-input:focus-within{
       outline:2px solid #1d4ed8 !important;
      }
        .custom-date-input.ant-picker-outlined:focus-within{
            box-shadow:none!important;
        }
        .custom-date-input .ant-picker-input{
        height:100% !important;
        }
        .custom-month-dropdown .ant-picker-header {
  display: none !important; /* Hide the year and navigation buttons */
}
      `}</style>
    </>
  );
}

export default InputDateMonth;
