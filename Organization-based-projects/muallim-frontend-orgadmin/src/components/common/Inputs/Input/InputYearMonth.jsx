import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

function InputYearMonth({
  handler,
  label,
  isRequired,
  className,
  error,
  defaultValue,
}) {
  // Convert defaultValue to dayjs object
  const initialDate = defaultValue ? dayjs(defaultValue) : null;
  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    if (defaultValue) {
      setSelectedDate(dayjs(defaultValue));
    } else {
      setSelectedDate(null); // Clear the date when defaultValue is empty
    }
  }, [defaultValue]);

  const onChange = (date, dateString) => {
    setSelectedDate(date);
    if (date) {
      handler(date.year(), date.month() + 1, date);
    }
  };

  const disableFutureDates = (current) => {
    // Disables months after the current month
    return current && current > dayjs().endOf("month");
  };

  return (
    <div className={`grid ${className || ""}`}>
      {label && (
        <label className="text-14 font-bold capitalize">
          {label} {isRequired && <sup className="text-danger-700">*</sup>}
        </label>
      )}
      <DatePicker
        value={selectedDate}
        placeholder="YYYY-MM"
        className="custom-yearmonth-input inline-block placeholder:text-[#9BA3AF] text-black w-full !h-[35px]"
        onChange={onChange}
        picker="month"
        allowClear={false}
        popupClassName="custom-yearmonth-dropdown"
        disabledDate={disableFutureDates}
        format="YYYY MMM"
      />
      <style>{`
        .custom-yearmonth-input.ant-picker{
          padding:0 !important;
          border-color: transparent !important;
        }
        .custom-yearmonth-input .ant-picker-input{
          width:100% !important;      
          height:100% !important;
          border:1px solid #798295 !important;
          border-radius:4px !important;
          padding:0 1rem !important;
          overflow:hidden !important;
        }
        .custom-yearmonth-input .ant-picker-input:focus-within{
          outline:2px solid #1d4ed8 !important;
        }
        .custom-yearmonth-input.ant-picker-outlined:focus-within{
          box-shadow:none!important;
        }
        .custom-yearmonth-input .ant-picker-input{
          height:100% !important;
        }
      `}</style>
    </div>
  );
}

export default InputYearMonth;
