import React from "react";
import { Tooltip, Select } from "antd";
import { FaChevronDown } from "react-icons/fa";

const InputDropdown = ({
  label,
  name,
  options = [],
  value,
  defaultValue,
  onChange,
  placeholder = "Select an option",
  isRequired = false,
  error = "",
  info = "",
  classStyle,
}) => {
  const departmentOptions = [
    { value: "", label: "By Department" },
    ...options.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  ];

  return (
    <>
      <style>
        {`
          .custom-text-select .ant-select-selector {
            border-color: #798295 !important;
            color: #000 !important;
            border-radius: 4px
          }
          .custom-text-select .ant-select-selection-item,
          .custom-text-select .ant-select-selection-placeholder {
            color: #000 !important;
          }
        `}
      </style>
      <div className="item">
        {label && (
          <label className="text-sm font-bold gap-1">
            {label}
            {isRequired && <sup className="text-danger-700 text-sm">*</sup>}
            {info && (
              <Tooltip color="#fff" placement="top" title={info}>
                <span className="text-primary-brand-default ">
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11V17H13V11H11ZM11 7V9H13V7H11Z"></path>
                  </svg>
                </span>
              </Tooltip>
            )}
          </label>
        )}

        <div className="relative w-full">
          <Select
            allowClear={false}
            value={value || undefined}
            onChange={(val) => {
              onChange({ target: { name, value: val } });
            }}
            placeholder={placeholder}
            suffixIcon={<FaChevronDown className="text-[#4C5361]" />}
            className={`w-full custom-text-select ${
              classStyle ? classStyle : ""
            }`}
            style={{
              height: 36,
              fontSize: 20,
              color: "#000",
              borderColor: "#000",
              background: "#fff",
            }}
            dropdownStyle={{
              fontSize: 18,
              color: "#22252B",
            }}
            options={departmentOptions}
            getPopupContainer={(trigger) => trigger.parentNode}
            dropdownRender={(menu) => (
              <div style={{ overflow: "hidden" }}>{menu}</div>
            )}
          />
        </div>

        {error && <span className="text-danger-700 text-sm">{error}</span>}
      </div>
    </>
  );
};

export default InputDropdown;
