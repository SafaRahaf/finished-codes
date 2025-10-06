import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
function InputDateRangePicker({
  handler,
  label,
  isRequired,
  className,
  error,
  defaultValue,
  futureDate = true,
}) {
  // defaultValue is 2014-10-20
  const initialDate = defaultValue
    ? [dayjs(defaultValue[0]), dayjs(defaultValue[1])]
    : "";
  const [selectedDate, setSelectedDate] = useState(initialDate);
  useEffect(() => {
    if (defaultValue) {
      setSelectedDate([
        defaultValue[0] ? dayjs(defaultValue[0]) : "",
        defaultValue[1] ? dayjs(defaultValue[1]) : "",
      ]); // Set initial value from defaultValue prop
    } else {
      setSelectedDate(""); // Clear the date when defaultValue is empty
    }
  }, [defaultValue]);

  const onChange = (date) => {
    if (date) {
      setSelectedDate(date);
      const payload = date.map((d) => (d ? dayjs(d).format("YYYY-MM-DD") : ""));
      handler && handler(payload);
    } else {
      setSelectedDate("");
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

        <RangePicker
          value={selectedDate}
          placeholder="Select Date"
          className={`custom-date-input inline-block !mt-1 placeholder:text-[#9BA3AF] text-black w-full !h-[45px]`}
          onChange={onChange}
          allowClear={false}
          popupClassName="custom-month-dropdown"
          disabledDate={futureDate ? disableFutureDates : false}
          format="MMM D YYYY"
        />
      </div>
      {/* 
      .custom-date-input .ant-picker-input{
      width:100% !important;      
      height:100% !important;
      border:1px solid #798295 !important;
      border-radius:4px !important;
      padding:0 1rem !important;
      overflow:hidden !important;
      }
      */}
      <style>{`
      .custom-date-input.ant-picker{
          width:100% !important;      
      border:1px solid #798295 !important;
      border-radius:4px !important;
      overflow:hidden !important;
      }
        .custom-date-input.ant-picker-outlined:focus-within{
            box-shadow:none!important;
        }
        .custom-date-input .ant-picker-input{
        height:100% !important;
        }
       
  .custom-date-input .ant-picker-active-bar{
   display: none !important; /* Hide the year and navigation buttons */
  }
      `}</style>
    </>
  );
}

export default InputDateRangePicker;
