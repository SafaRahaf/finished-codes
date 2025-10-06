import React, { useState, useEffect } from "react";
import { Select } from "antd";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faChevronDown } from "@fortawesome/free-solid-svg-icons"; // ✅ Import the correct icon
import { FaChevronDown } from "react-icons/fa";

function SelectBox({
  list = [],
  handler,
  label,
  labelName,
  DefaultItem,
  isRequired,
  loading = false,
  defaultValue,
  className,
  inputHeight = "!h-[46px]",
  error,
  placeholder,
  isAcceptstring = false,
  icon,
}) {
  const initialDate = defaultValue ? defaultValue : null;
  const [selectedValue, setSelectedValue] = useState(initialDate);

  useEffect(() => {
    if (defaultValue) {
      setSelectedValue(defaultValue);
    } else {
      setSelectedValue(null); // Clear the value when defaultValue is empty
    }
  }, [defaultValue]);

  const [clickCount, setClickCount] = useState(0);

  const onChange = (value, option) => {
    setClickCount((prev) => prev + 1);
    if (handler) {
      setSelectedValue(value);
      handler(value, option, clickCount);
    }
  };

  const onSearch = (value) => {
    if (isAcceptstring) {
      handler(value, null, clickCount);
    }
  };

  return (
    <>
      <div className={`${className || ""} flex flex-col`}>
        <label className="text-14 font-bold capitalize">
          {label ? label : labelName ? labelName : ""}{" "}
          {isRequired && <sup className="text-danger-700 text-sm">*</sup>}
        </label>
        <Select
          className={`custom-select  inline-block !mt-1  text-black overflow-hidden border w-full rounded-[4px] focus-within:border-2 focus-within:border-black  ${
            error ? "border-danger-700" : "border-[#798295]"
          } ${inputHeight} `}
          showSearch
          placeholder={
            label
              ? `Select a ${label}`
              : DefaultItem
              ? DefaultItem
              : placeholder
              ? placeholder
              : ""
          }
          optionFilterProp="label"
          onChange={onChange}
          onSearch={onSearch}
          options={
            list &&
            list.length &&
            list
              .filter(
                (item, index, self) =>
                  index === self.findIndex((t) => t.value === item.value)
              )
              .map((item, index) => ({
                ...item,
                key: `${item?.id ? item.id : Math.random()}-${index}`,
              }))
          }
          loading={loading}
          dropdownStyle={{ zIndex: 999999 }}
          value={selectedValue || undefined}
          suffixIcon={icon || <FaChevronDown className="text-[#4C5361] " />}
        />
      </div>
      <style>{`
        .custom-select .ant-select-selector {      
          border:none !important;
          border-radius:0 !important;
          padding: 9px 16px !important;
        }
        .custom-select .ant-select-selector:hover {
          border:none !important;
        }
          .custom-select .ant-select-selection-item{
          text-transform:capitalize !important;
          }
          .ant-select-selection-placeholder {
            color: #22252B !important;
          }
      `}</style>
    </>
  );
}

export default SelectBox;
