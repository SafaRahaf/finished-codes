"use client";
import Link from "next/link";
import React, { useState } from "react";
import ClassAssignModal from "../ClassAssignModal";
import { Dropdown, Menu } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useDeleteClassMutation } from "@/store/features/class-management/apiSlice";

const ClassCard = ({
  id,
  name,
  title,
  students,
  subjects,
  attendance,
  classId,
  loading = false,
  refech,
}) => {
  // delete class feature
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmStep, setConfirmStep] = useState(1);

  const deleteClassHandler = async (id) => {
    try {
      await deleteClass(id).unwrap();
      setShowDeleteModal(false);
      if (refech) {
        await refech();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dropdownItems = [
    {
      key: "edit",
      label: (
        <Link href={`/classes/update/${id}`} className="text-16 px-4 ">
          Edit Class
        </Link>
      ),
    },
    {
      key: "delete",
      label: (
        <button
          type="button"
          onClick={() => {
            setShowDeleteModal(true);
            setConfirmStep(1);
          }}
          className="text-16 px-4 
          "
        >
          Delete Class
        </button>
      ),
    },
  ];

  if (!loading) {
    return (
      <>
        <div className="card py-6 rounded-[8px] shadow-custom-effect relative cursor-pointer  border border-transparent">
          <div className="px-6">
            <p className="text-xs text-[#626A7C]  font-bold ">{name}</p>
            <div className="flex justify-between items-center">
              <Link href={`/classes/lists/${id}`}>
                <h2 className="text-2xl font-bold my-2 hover:text-tertiary-1">
                  {title}
                </h2>
              </Link>
              <div className="">
                <Dropdown
                  menu={{ items: dropdownItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <button className="flex justify-center items-center w-[44px] h-[44px] text-[#000]">
                    <img src="/assets/img/icons/menu.svg" alt="Export Icon" />
                  </button>
                </Dropdown>
              </div>
            </div>
            <p className="text-xs text-[#626A7C] font-bold">
              Class ID - {classId}
            </p>
          </div>

          <div className="px-6 bg-[#E7F7FF] py-3 mt-4">
            <p className="font-bold">
              {students > 1 ? "Students" : "Student"} - {students} |{" "}
              {subjects > 1 ? "Subjects" : "Subject"} - {subjects}
            </p>
          </div>

          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
                <div className="flex items-center text-red-600 gap-2 font-semibold text-16">
                  <img
                    src="/assets/img/icons/red warning.png"
                    alt="Warning"
                    className="w-5 h-5"
                  />
                  Delete Class?
                </div>
                <hr />
                {confirmStep === 1 && (
                  <>
                    <div>
                      <p className="text-12 text-gray-500 font-bold">{name}</p>
                      <h2 className="text-2xl font-bold text-gray-800 my-1">
                        {title}
                      </h2>
                      <p className="text-12 text-gray-500 font-bold">
                        Class ID - {classId}
                      </p>
                    </div>
                    <p className="text-16 text-gray-700">
                      Would you like to proceed with the deletion of the class?
                    </p>
                    <hr />
                    <div className="flex justify-between  pt-1">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="border border-gray-400 px-4 py-2 rounded-md text-16 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setConfirmStep(2)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-16 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}

                {confirmStep === 2 && (
                  <>
                    <p className="text-16 text-gray-700">
                      Upon executing the deletion process, all associated data
                      will be irrevocably erased. It is important to note that
                      the specific class in question presently accommodates a
                      total of <strong>{students} students</strong>. Therefore,
                      we urge you to make your decision with careful
                      consideration.
                    </p>
                    <hr />
                    <div className="flex justify-between gap-3 pt-2">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="border border-gray-400 px-4 py-2 rounded-md text-16 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteClassHandler(id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-16 font-medium"
                      >
                        Confirm
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  } else {
    return (
      <div className="card py-6 rounded-[8px] shadow-lg relative cursor-pointer group">
        <div className="px-6">
          <div className="animate-pulse h-[16px] bg-slate-300 rounded-full font-bold "></div>
          <div className="animate-pulse h-[32px] font-bold my-2 rounded-full bg-slate-300"></div>
          <div className="animate-pulse h-[16px] bg-slate-300 rounded-full  font-bold"></div>
        </div>

        <div className="animate-pulse font-bold h-10 bg-slate-300 mt-4"></div>
      </div>
    );
  }
};

export default ClassCard;
