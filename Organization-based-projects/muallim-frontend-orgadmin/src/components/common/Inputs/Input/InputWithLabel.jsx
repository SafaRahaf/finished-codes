import React, { useState, forwardRef } from "react";
import { Button, Tooltip } from "antd";

const InputWithLabel = forwardRef(
  (
    {
      label,
      placeholder,
      value,
      type,
      handler,
      name,
      error,
      isRequired,
      info,
      onBlur,
      disabled,
      maxlength,
      noNumber,
      noNumbersAndSpecialChars,
    },
    ref
  ) => {
    const [passValueVisibility, setPassValueVisibility] = useState(false);
    // show on time error

    const [localError, setLocalError] = useState("");

    // validate phone number
    const validatePhone = (val) => {
      if (!val) return isRequired ? "This field is required." : "";
      // // Basic international phone number validation (E.164 format or general)
      // const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      // return phoneRegex.test(val.replace(/\s/g, "")) // remove spaces before test
      //   ? ""
      //   : "Please enter a valid phone number. Must be use country code";
    };

    const validateEmail = (val) => {
      if (!val) return isRequired ? "This field is required." : "";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val) ? "" : "Please enter a valid email address.";
    };

    const handleBlur = (e) => {
      let validationMessage = "";
      if (type === "email") {
        validationMessage = validateEmail(e.target.value);
      } else if (label === "Phone Number") {
        validationMessage = validatePhone(e.target.value);
      }

      if (validationMessage) {
        setLocalError(validationMessage);
      }

      if (onBlur) onBlur(e);
    };

    const handleChange = (e) => {
      if (localError) setLocalError(""); // reset error on change
      if (handler) handler(e);
    };

    return (
      // input component, taking props from view
      <div>
        {label && (
          <label className="text-14 font-bold flex">
            {label}{" "}
            {isRequired && <sup className="text-danger-700 text-sm">*</sup>}{" "}
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

        <div className="w-full h-[45px] relative">
          <input
            ref={ref}
            className={`block border w-full h-full mt-1 rounded-[4px] ${
              error ? "border-danger-700" : "border-[#798295]"
            }
          ${isRequired ? "required" : ""}
           ${type === "password" ? "pl-4 pr-10" : "px-4"}`}
            type={passValueVisibility ? "text" : type}
            placeholder={placeholder}
            value={value || ""}
            // onChange={handler || undefined}
            disabled={disabled}
            maxLength={maxlength && maxlength}
            name={name}
            // onBlur={onBlur ? onBlur : undefined}
            onChange={(e) => {
              handleChange(e); // local internal logic
              handler?.(e); // external prop
            }}
            onBlur={(e) => {
              handleBlur(e); // local validation
              onBlur?.(e); // external prop
            }}
            onKeyDown={(e) => {
              // 🚫 Block only number keys at typing level
              if (noNumber && /[0-9]/.test(e.key)) {
                e.preventDefault();
              }
              // 🚫 Block numbers & special chars at typing level
              if (noNumbersAndSpecialChars && /[^a-zA-Z\s]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            // 🚫 Clean only numbers if pasted
            onPaste={(e) => {
              if (noNumber) {
                e.preventDefault();
                const text = e.clipboardData
                  .getData("text")
                  .replace(/[0-9]/g, "");
                document.execCommand("insertText", false, text);
              }
              // 🚫 Clean pasted text (remove numbers & special chars, keep only letters + spaces)
              if (noNumbersAndSpecialChars) {
                e.preventDefault();
                const text = e.clipboardData
                  .getData("text")
                  .replace(/[^a-zA-Z\s]/g, "");
                document.execCommand("insertText", false, text);
              }
            }}
          />
          {type === "password" ? (
            <button
              className="absolute top-1/2 transform -translate-y-1/2 right-[18px]"
              type="button"
              onClick={() => setPassValueVisibility(!passValueVisibility)}
            >
              <svg
                width="20"
                height="16"
                viewBox="0 0 20 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.9196 7.6C17.8996 2.91 14.0996 0 9.99958 0C5.89958 0 2.09958 2.91 0.0795785 7.6C0.0245152 7.72617 -0.00390625 7.86234 -0.00390625 8C-0.00390625 8.13766 0.0245152 8.27383 0.0795785 8.4C2.09958 13.09 5.89958 16 9.99958 16C14.0996 16 17.8996 13.09 19.9196 8.4C19.9746 8.27383 20.0031 8.13766 20.0031 8C20.0031 7.86234 19.9746 7.72617 19.9196 7.6ZM9.99958 14C6.82958 14 3.82958 11.71 2.09958 8C3.82958 4.29 6.82958 2 9.99958 2C13.1696 2 16.1696 4.29 17.8996 8C16.1696 11.71 13.1696 14 9.99958 14ZM9.99958 4C9.20845 4 8.43509 4.2346 7.7773 4.67412C7.1195 5.11365 6.60681 5.73836 6.30406 6.46927C6.00131 7.20017 5.9221 8.00444 6.07644 8.78036C6.23078 9.55628 6.61174 10.269 7.17115 10.8284C7.73056 11.3878 8.44329 11.7688 9.21922 11.9231C9.99514 12.0775 10.7994 11.9983 11.5303 11.6955C12.2612 11.3928 12.8859 10.8801 13.3255 10.2223C13.765 9.56448 13.9996 8.79113 13.9996 8C13.9996 6.93913 13.5782 5.92172 12.828 5.17157C12.0779 4.42143 11.0604 4 9.99958 4ZM9.99958 10C9.60402 10 9.21734 9.8827 8.88844 9.66294C8.55954 9.44318 8.30319 9.13082 8.15182 8.76537C8.00044 8.39991 7.96084 7.99778 8.03801 7.60982C8.11518 7.22186 8.30566 6.86549 8.58537 6.58579C8.86507 6.30608 9.22144 6.1156 9.6094 6.03843C9.99736 5.96126 10.3995 6.00087 10.7649 6.15224C11.1304 6.30362 11.4428 6.55996 11.6625 6.88886C11.8823 7.21776 11.9996 7.60444 11.9996 8C11.9996 8.53043 11.7889 9.03914 11.4138 9.41421C11.0387 9.78929 10.53 10 9.99958 10Z"
                  fill="#4C5361"
                />
              </svg>
            </button>
          ) : (
            ""
          )}
        </div>
        {/* {error && <p className="text-danger-700 text-sm">{error}</p>} */}
        {(error || localError) && (
          <p className="text-danger-700 text-sm">{error || localError}</p>
        )}
      </div>
    );
  }
);

InputWithLabel.displayName = "InputWithLabel";

export default InputWithLabel;
