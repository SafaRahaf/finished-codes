import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
function InputDate({
  handler,
  label,
  isRequired,
  className,
  error,
  defaultValue,
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
  const onChange = (date, dateString) => {
    if (date) {
      setSelectedDate(date);
      handler && handler(dateString);
    } else {
      console.log("No date selected");
    }
  };
  return (
    <>
      <div>
        <div className={`grid ${className || ""}`}>
          {label && (
            <label className="text-14 font-bold capitalize">
              {label} {isRequired && <sup className="text-danger-700">*</sup>}
            </label>
          )}

          <DatePicker
            value={selectedDate}
            placeholder="Select Date"
            className={`custom-date-input inline-block !mt-1 placeholder:text-[#9BA3AF] text-black w-full !h-[45px]`}
            onChange={onChange}
            allowClear={false}
            popupClassName="custom-month-dropdown"
            popupStyle={{ zIndex: 9999 }}
          />
        </div>
        {error && <p className="text-danger-700 text-sm">{error}</p>}
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

export default InputDate;
