import React, { useState, useEffect } from "react";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
function InputTimePicker({
  handler,
  label,
  isRequired,
  className,
  error,
  defaultValue,
  specificDayDisabled,
}) {
  const initialDate = defaultValue ? defaultValue : null;
  const [selectedValue, setSelectedValue] = useState(initialDate);
  useEffect(() => {
    if (defaultValue) {
      setSelectedValue(defaultValue); // Set initial value from defaultValue prop
    } else {
      setSelectedValue(null); // Clear the value when defaultValue is empty
    }
  }, [defaultValue]);
  const onChange = (time, value) => {
    handler(value);
    setSelectedValue(value);
  };
  const disableSpecificTime = (hour) => {
    if (specificDayDisabled) {
      const disabledTime = dayjs(specificDayDisabled, "hh:mm A");
      if (hour === disabledTime.hour()) {
        return [disabledTime.minute()];
      }
    }
    return [];
  };
  return (
    <>
      <div className={`grid ${className || ""}`}>
        {label && (
          <label className="text-14 font-bold capitalize">
            {label} {isRequired && <sup className="text-danger-700">*</sup>}
          </label>
        )}

        <TimePicker
          className={`custom-date-input inline-block !mt-1 placeholder:text-[#9BA3AF] text-black w-full !h-[45px]`}
          use12Hours
          format="hh:mm A"
          onChange={onChange}
          inputReadOnly
          allowClear={false}
          popupClassName="custom-month-dropdown"
          value={selectedValue ? dayjs(selectedValue, "hh:mm A") : undefined}
          // disabledHours={() => {
          //   if (specificDayDisabled) {
          //     const disabledTime = dayjs(specificDayDisabled, "hh:mm A");
          //     return [disabledTime.hour()];
          //   }
          //   return [];
          // }}
          disabledTime={disableSpecificTime}
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

export default InputTimePicker;
