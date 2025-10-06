import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
function InputYear({
  handler,
  label,
  isRequired,
  className,
  error,
  defaultValue,
}) {
  const initialDate = defaultValue ? dayjs(defaultValue) : null;
  const [selectedMonth, setSelectedMonth] = useState(initialDate);
  useEffect(() => {
    if (defaultValue) {
      setSelectedMonth(dayjs(defaultValue)); // Set initial value from defaultValue prop
    } else {
      setSelectedMonth(null); // Clear the date when defaultValue is empty
    }
  }, [defaultValue]);
  const onChange = (date, dateString) => {
    if (date) {
      setSelectedMonth(date);
      handler(dateString);
    } else {
      console.log("No date selected");
    }
  };
  const disableFutureDates = (current) => {
    // Can not select days after today
    return current && current > dayjs().endOf("day");
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
          placeholder="YYYY"
          className={`custom-year-input inline-block !mt-1 placeholder:text-[#9BA3AF] text-black w-full !h-[45px]`}
          onChange={onChange}
          picker="year"
          allowClear={false}
          popupClassName="custom-year-input"
          disabledDate={disableFutureDates}
        />
      </div>
      <style>{`
      .custom-year-input.ant-picker{
         padding:0 !important;
         border-color: transparent !important;
      }
      .custom-year-input .ant-picker-input{
      width:100% !important;      
      height:100% !important;
      border:1px solid #798295 !important;
      border-radius:4px !important;
      padding:0 1rem !important;
      overflow:hidden !important;
      }
      .custom-year-input .ant-picker-input:focus-within{
       outline:2px solid #1d4ed8 !important;
      }
        .custom-year-input.ant-picker-outlined:focus-within{
            box-shadow:none!important;
        }
        .custom-year-input .ant-picker-input{
        height:100% !important;
        }

      `}</style>
    </>
  );
}

export default InputYear;
