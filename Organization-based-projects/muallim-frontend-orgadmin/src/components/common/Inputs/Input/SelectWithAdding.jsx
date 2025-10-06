import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Input, Select, Space } from "antd";
import { FaChevronDown } from "react-icons/fa";

const SelectWithAdding = ({
  label,
  isRequired,
  error,
  className,
  inputHeight = "!h-[46px]",
  placeholder,
  lists,
  handler,
  addNewOptionHandler,
  defaultValue,
  loading,
}) => {
  const [items, setItems] = useState(lists);
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (defaultValue) {
      setName(defaultValue.value);
    }
  }, [defaultValue]);

  useEffect(() => {
    setItems(lists);
  }, [lists]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const addItem = (e) => {
    e.preventDefault();
    // setItems([...items, { id: items.length + 1, label: name, value: name }]);
    if (addNewOptionHandler) {
      addNewOptionHandler(name);
    }
    if (!name) return;

    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const onChange = (value, option) => {
    if (handler) {
      handler(value, option);
    }
  };

  return (
    <>
      <div className={`${className || ""}`}>
        <label className="text-14 font-bold capitalize">
          {label}
          {isRequired && <sup className="text-danger-700">*</sup>}
        </label>
        <Select
          className={`custom-select inline-block !mt-1 text-black overflow-hidden border w-full rounded-[4px] focus-within:border-2 focus-within:border-black ${
            error ? "border-danger-700" : "border-[#798295]"
          } ${inputHeight} `}
          showSearch
          placeholder={placeholder || `Select a ${label}`}
          onChange={onChange}
          loading={loading}
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: "8px 0" }} />
              <Space
                className="custom-select-adding-space"
                style={{ padding: "0 8px 4px", width: "100%" }}
              >
                <Input
                  placeholder="Department Name"
                  ref={inputRef}
                  value={name}
                  onChange={onNameChange}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <Button
                  type="text"
                  className=" font-semibold"
                  icon={<PlusOutlined />}
                  onClick={addItem}
                >
                  Add
                </Button>
              </Space>
            </>
          )}
          options={
            items &&
            items.length > 0 &&
            items.map((item) => ({
              ...item,
              label: item.label,
              value: item.value,
            }))
          }
          suffixIcon={<FaChevronDown className="text-[#4C5361]" />}
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
        .custom-select-adding-space .ant-space-item:first-child {
          flex: 1 1 0% !important;
        }
        .custom-select-adding-space .ant-space-item:last-child {
          width: 70px !important;
        }
      `}</style>
    </>
  );
};

export default SelectWithAdding;
