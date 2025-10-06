import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
function InputFullDate({
  handler,
  label,
  isRequired,
  className,
  error,
  defaultValue,
  futureDate = true,
  dailyView = false,
  zIndexStyle,
}) {
  // defaultValue is 2014-10-20
  const initialDate = defaultValue ? dayjs(defaultValue) : null;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  useEffect(() => {
    if (defaultValue) {
      setSelectedDate(dayjs(defaultValue)); // Set initial value from defaultValue prop
    } else {
      setSelectedDate(null); // Clear the date when defaultValue is empty
    }
  }, [defaultValue]);

  const onChange = (date) => {
    if (date) {
      setSelectedDate(date);
      !dailyView
        ? handler && handler(date.format("YYYY-MM-DD"))
        : handler && handler(date.toDate());
    } else {
      !dailyView ? console.log("No date selected") : handler && handler(null);
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
          value={selectedDate}
          placeholder="Select Date"
          format="MMM D YYYY"
          className={`custom-date-full-input inline-block placeholder:text-[#9BA3AF] text-black w-full ${
            !dailyView ? "!h-[45px] !mt-1" : "!h-[35px] !mt-0"
          }`}
          onChange={onChange}
          allowClear={false}
          popupClassName="custom-date-full-input"
          popupStyle={zIndexStyle ? { zIndex: 99999999 } : {}}
          disabledDate={futureDate ? disableFutureDates : false}
        />
        {error && <p className="text-danger-700 text-sm">{error}</p>}
      </div>
      <style>{`
      .custom-date-full-input.ant-picker{
         padding:0 !important;
         border-color: transparent !important;
      }
      .custom-date-full-input .ant-picker-input{
      width:100% !important;      
      height:100% !important;
      border:1px solid ${error ? "#D80808" : "#798295"} !important;
      border-radius:4px !important;
      padding:0 1rem !important;
      overflow:hidden !important;
      }
      .custom-date-full-input .ant-picker-input:focus-within{
       outline:2px solid #1d4ed8 !important;
      }
        .custom-date-full-input.ant-picker-outlined:focus-within{
            box-shadow:none!important;
        }
        .custom-date-full-input .ant-picker-input{
        height:100% !important;
        }
       
      `}</style>
    </>
  );
}

export default InputFullDate;
