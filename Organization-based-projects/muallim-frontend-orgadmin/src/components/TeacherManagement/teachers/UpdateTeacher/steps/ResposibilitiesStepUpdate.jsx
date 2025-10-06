import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import {
  useDeleteEmployeeResponsibilitiesMutation,
  useTeacherProfileUpdateMutation,
} from "@/store/features/teacher-management/apiSlice";
import { message } from "antd";
import React, { useState, useEffect } from "react";

function ResposibilitiesStepUpdate({ prevData, modalOpen }) {
  const [toDelete, setToDelete] = useState([]);

  /*======== initilize apis ========*/
  const [deleteEmployeeResponsibilities, { isLoading: deleteLoading }] =
    useDeleteEmployeeResponsibilitiesMutation();
  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();

  /*========= states & functions =========*/
  // responsibilities
  const [responsibilities, setResponsibilities] = useState([
    {
      updateId: null,
      id: 1,
      title: "",
    },
  ]);
  // Add new responsibility handler
  const newResponsibilities = () => {
    if (responsibilities.length) {
      if (responsibilities.length >= 10) {
        message.warning("You can only add up to 10 responsibilities.");
        return;
      } else {
        setResponsibilities((prev) => [
          ...prev,
          { id: Math.floor(Math.random() * 900) + 100, title: "" },
        ]);
      }
    } else {
      setResponsibilities([
        {
          updateId: null,
          id: 1,
          title: "",
        },
      ]);
    }
  };

  const deleteResponsibilities = (id, uid = null) => {
    if (responsibilities.length > 1) {
      setResponsibilities((prev) => prev.filter((item) => item.id !== id));
      if (uid) {
        // marking for deletion
        setToDelete((prev) => [...prev, uid]);
      }
    } else {
      message.warning("Must have at least one");
    }
  };
  // change responsibility value handler
  const changeResponsibilitiesValueHandler = (id, value) => {
    setResponsibilities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: value } : item))
    );
  };

  /* 
      Find Previous data and set data into available variable
  */
  useEffect(() => {
    if (prevData) {
      const responsibilities = prevData?.responsibilities;
      const previousData =
        responsibilities &&
        responsibilities.length &&
        responsibilities.map((item, i) => ({
          updateId: item?.id,
          id: i + 1,
          title: item?.title,
        }));
      setResponsibilities(previousData);
    }
  }, [prevData]);

  //   clean object
  const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
      // If the object is an array, clean each item and filter out empty objects
      return obj
        .map(cleanObject) // Recursively clean each array item
        .filter(
          (item) =>
            item !== null &&
            item !== undefined &&
            (typeof item !== "object" || Object.keys(item).length > 0)
        );
    } else if (obj !== null && typeof obj === "object") {
      // If the object is not an array, recursively clean its properties
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const cleanedValue = cleanObject(value); // Clean the value recursively
        if (
          cleanedValue !== null &&
          cleanedValue !== undefined &&
          (typeof cleanedValue !== "object" ||
            Object.keys(cleanedValue).length > 0) &&
          (!Array.isArray(cleanedValue) || cleanedValue.length > 0)
        ) {
          acc[key] = cleanedValue; // Keep the key-value pair
        }
        return acc;
      }, {});
    }
    // For non-objects, return the value itself if it's valid
    return obj !== "" && obj !== null && obj !== undefined ? obj : undefined;
  };
  const redirectToAnotherPage = () => {};
  const resetCookie = () => {};

  //   error watcher
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error(error.data.message);
      } else {
        message.error(error.data.message);
      }
    }
  }, [error]);

  //  main operation handler
  const stepHandler = async () => {
    // 1. Delete responsibilities marked for deletion
    if (toDelete.length) {
      await Promise.all(
        toDelete.map((id) => deleteEmployeeResponsibilities({ id }))
      );
      setToDelete([]); // reset after deletion
    }

    // 2. Prepare updated responsibilities
    const readyData = {
      employee_responsibilities: responsibilities
        .filter((item) => item.title)
        .map((item) => ({
          id: item?.updateId,
          title: item.title,
        })),
    };

    // 3. Update teacher profile
    await teacherProfileUpdate({
      id: prevData?.teacherId,
      data: cleanObject(readyData),
      redirectAnotherPage: redirectToAnotherPage,
      resetCookie: resetCookie,
    });

    modalOpen(true);
  };

  return (
    <>
      <div className="w-full mb-4">
        <div className="flex flex-col gap-4">
          {responsibilities?.length &&
            responsibilities.map((responsibility, i) => (
              <div key={i} className="flex space-x-6 items-end">
                <div className="flex-1">
                  <InputWithLabel
                    key={i}
                    maxlength={40}
                    label={`Responsibilities ${i + 1}`}
                    placeholder={"Responsibility"}
                    type={"text"}
                    name="responsibility"
                    value={responsibility.title}
                    handler={(e) =>
                      changeResponsibilitiesValueHandler(
                        responsibility.id,
                        e.target.value
                      )
                    }
                  />
                </div>
                <button
                  onClick={() =>
                    deleteResponsibilities(
                      responsibility.id,
                      responsibility.updateId ? responsibility.updateId : null
                    )
                  }
                  type="button"
                  className="w-[44px] h-[44px] rounded-lg flex justify-center items-center border border-primary-brand-700 hover:border-danger-700 text-primary-brand-700 hover:text-danger-700 "
                >
                  <span>
                    <svg
                      width="18"
                      height="20"
                      viewBox="0 0 18 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 4H13V3C13 2.20435 12.6839 1.44129 12.1213 0.87868C11.5587 0.316071 10.7956 0 10 0H8C7.20435 0 6.44129 0.316071 5.87868 0.87868C5.31607 1.44129 5 2.20435 5 3V4H1C0.734784 4 0.48043 4.10536 0.292893 4.29289C0.105357 4.48043 0 4.73478 0 5C0 5.26522 0.105357 5.51957 0.292893 5.70711C0.48043 5.89464 0.734784 6 1 6H2V17C2 17.7956 2.31607 18.5587 2.87868 19.1213C3.44129 19.6839 4.20435 20 5 20H13C13.7956 20 14.5587 19.6839 15.1213 19.1213C15.6839 18.5587 16 17.7956 16 17V6H17C17.2652 6 17.5196 5.89464 17.7071 5.70711C17.8946 5.51957 18 5.26522 18 5C18 4.73478 17.8946 4.48043 17.7071 4.29289C17.5196 4.10536 17.2652 4 17 4ZM7 3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H10C10.2652 2 10.5196 2.10536 10.7071 2.29289C10.8946 2.48043 11 2.73478 11 3V4H7V3ZM14 17C14 17.2652 13.8946 17.5196 13.7071 17.7071C13.5196 17.8946 13.2652 18 13 18H5C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V6H14V17Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            ))}
        </div>

        <button
          type="button"
          onClick={newResponsibilities}
          className="flex justify-start items-center mt-4 gap-3 "
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 11H9V13C9 13.2652 9.10536 13.5196 9.29289 13.7071C9.48043 13.8946 9.73478 14 10 14C10.2652 14 10.5196 13.8946 10.7071 13.7071C10.8946 13.5196 11 13.2652 11 13V11H13C13.2652 11 13.5196 10.8946 13.7071 10.7071C13.8946 10.5196 14 10.2652 14 10C14 9.73478 13.8946 9.48043 13.7071 9.29289C13.5196 9.10536 13.2652 9 13 9H11V7C11 6.73478 10.8946 6.48043 10.7071 6.29289C10.5196 6.10536 10.2652 6 10 6C9.73478 6 9.48043 6.10536 9.29289 6.29289C9.10536 6.48043 9 6.73478 9 7V9H7C6.73478 9 6.48043 9.10536 6.29289 9.29289C6.10536 9.48043 6 9.73478 6 10C6 10.2652 6.10536 10.5196 6.29289 10.7071C6.48043 10.8946 6.73478 11 7 11ZM19 0H1C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1V19C0 19.2652 0.105357 19.5196 0.292893 19.7071C0.48043 19.8946 0.734784 20 1 20H19C19.2652 20 19.5196 19.8946 19.7071 19.7071C19.8946 19.5196 20 19.2652 20 19V1C20 0.734784 19.8946 0.48043 19.7071 0.292893C19.5196 0.105357 19.2652 0 19 0ZM18 18H2V2H18V18Z"
              fill="#22252B"
            />
          </svg>
          <span>Add another Responsibility</span>
        </button>
      </div>
      <div className="mb-3 text-right mt-20">
        <button
          type="button"
          onClick={stepHandler}
          className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Save Changes"}
        </button>
      </div>
    </>
  );
}

export default ResposibilitiesStepUpdate;
