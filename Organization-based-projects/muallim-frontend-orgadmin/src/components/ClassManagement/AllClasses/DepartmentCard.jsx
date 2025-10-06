"use client";
import React, { useState, useRef, useEffect } from "react";
import { message, Popconfirm, Modal, Input } from "antd";
import { DeleteSvg } from "@/components/helpers/storeAllSvgs";

const DepartmentCard = ({
  icon,
  title,
  noOfClasses,
  handler,
  loading = false,
  deleteHanler,
  onRename,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState(title);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setNewName(title);
  }, [title]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const confirm = (e) => {
    deleteHanler();
  };

  const handleRename = () => {
    if (newName.trim() === "") {
      message.error("Name cannot be empty");
      return;
    }
    if (onRename) {
      onRename(newName);
      setModalVisible(false);
      setDropdownVisible(false);
    }
  };

  if (!loading) {
    return (
      <>
        <div className="card p-6 rounded-[8px] group shadow-custom-effect border border-transparent  relative ">
          <div className="flex justify-between items-start">
            <div className="icon w-[45px] h-[45px] bg-[#7F669D] rounded-[4px] flex justify-center items-center">
              <img src={icon} alt="Icon" />
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownVisible(!dropdownVisible)}
                className="flex justify-center items-center w-[44px] h-[44px] text-[#000] hover:bg-gray-100 rounded-full transition-colors"
              >
                <img src="/assets/img/icons/menu.svg" alt="Menu Icon" />
              </button>

              {dropdownVisible && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg z-50 min-w-[120px] border border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setModalVisible(true);
                      setDropdownVisible(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Rename
                  </button>
                </div>
              )}
            </div>
          </div>
          <h3
            onClick={handler}
            className="text-2xl font-bold my-2 group-hover:text-tertiary-1 group-hover:cursor-pointer"
          >
            {title}
          </h3>
          <p className="text-xs font-bold text-[#626A7C]">
            Total {noOfClasses} {noOfClasses > 1 ? "Classes" : "Class"}
          </p>
        </div>

        <Modal
          open={modalVisible}
          footer={null}
          closable={false}
          centered
          className="!p-0"
          onCancel={() => {
            setModalVisible(false);
            setNewName(title);
          }}
        >
          <div className="p-10 ">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Rename Department
            </h2>
            <hr className="my-6" />

            <label className="block text-sm font-medium text-black mb-2">
              Name of Department<span className="text-red-500">*</span>
            </label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-16"
              placeholder="Enter new name"
            />

            <div className="flex justify-between mt-8">
              <button
                onClick={() => {
                  setModalVisible(false);
                  setNewName(title);
                }}
                className="border border-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800"
              >
                Rename
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  } else {
    return (
      <div className="card p-6 rounded-[8px] group shadow-lg">
        <div className="flex justify-between items-start">
          <div className="animate-pulse icon w-[45px] h-[45px] bg-slate-300 rounded-[4px] flex justify-center items-center"></div>
        </div>
        <div className="animate-pulse font-bold h-[20px] cursor-pointer bg-slate-300 my-2 rounded-full"></div>
        <div className="animate-pulse h-[10px] font-bold bg-slate-300 rounded-full"></div>
      </div>
    );
  }
};

export default DepartmentCard;
