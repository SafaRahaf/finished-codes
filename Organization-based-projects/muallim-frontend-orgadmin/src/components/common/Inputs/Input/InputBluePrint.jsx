import React from "react";
import { Button, Tooltip } from "antd";

const InputBluePrint = ({ label, placeholder, isRequired, value, info }) => {
  return (
    <div>
      {label && (
        <label className="text-14 font-bold capitalize gap-1 flex">
          {label}{" "}
          {isRequired && <sup className="text-danger-700 text-sm">*</sup>}
          {info && (
            <Tooltip color="#fff" placement="top" title={info}>
              <span className="text-primary-brand-default">
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
      <div
        className={`border border-[#798295] w-full min-h-[45px] px-4 mt-1 rounded-[4px] flex items-center`}
      >
        {value ? (
          <span className="text-sm text-black"> {value} </span>
        ) : (
          <span className="text-sm text-[#9BA3AF] capitalize">
            {" "}
            {placeholder}{" "}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputBluePrint;
