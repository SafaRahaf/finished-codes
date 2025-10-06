import React, { useEffect, useState } from "react";

const Switcher = ({ initialValue = false, handler, disabled }) => {
  const [isChecked, setIsChecked] = useState(initialValue);

  const handleCheckboxChange = () => {
    setIsChecked((prev) => {
      const newState = !prev;
      handler(newState); // Use the updated state
      return newState;
    });
  };
  useEffect(() => {
    setIsChecked(initialValue);
  }, [initialValue]);

  if (!disabled) {
    return (
      <>
        <label className="flex cursor-pointer select-none items-center">
          <div className="relative">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="sr-only"
            />
            <div
              className={`box block h-8 w-14 rounded-full ${
                isChecked ? "bg-[#98F3A1]" : "bg-[#FC9F9F]"
              }`}
            ></div>
            <div
              className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#4C5361] transition ${
                isChecked ? "translate-x-full" : ""
              }`}
            ></div>
          </div>
        </label>
      </>
    );
  } else {
    return (
      <div className="flex cursor-not-allowed select-none items-center opacity-40">
        <div className="relative">
          <div className="box block h-8 w-14 rounded-full bg-[#C9CDD5]"></div>
          <div
            className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#4C5361] transition ${
              isChecked ? "translate-x-full" : ""
            }`}
          ></div>
        </div>
      </div>
    );
  }
};

export default Switcher;
