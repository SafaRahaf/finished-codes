"use client";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import cleanObject from "@/components/helpers/cleanObject";
import { DeleteSvg } from "@/components/helpers/storeAllSvgs";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { useIdentificationTypesQuery } from "@/store/features/auth/apiSlice";
import {
  useTeacherProfileUpdateMutation,
  useDeletePeopleIdentificationMutation,
} from "@/store/features/teacher-management/apiSlice";
import { updateTeacherStepTwoSchema } from "@/utilities/validationRules/schemas/updateTeacherSchema";
import { message } from "antd";
import React, { useState, useEffect } from "react";

function IdentificationDocumentStepUpdate({ prevData, modalOpen }) {
  /*======== initilize apis ========*/
  const { data: identificationTypes, isFetching: loaderForIdentifications } =
    useIdentificationTypesQuery();
  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();
  const [deletePeopleIdentification, { isLoading: isDeleting }] =
    useDeletePeopleIdentificationMutation();

  /*========= states & functions =========*/
  /* Hybrid Data: document type and information */

  const [documentsData, setDocumentsData] = useState([
    {
      updateId: null,
      licenceNumber: "",
      type_name: "",
      type_id: null,
    },
  ]);

  // Function to add a new contact link
  const addNewDocument = () => {
    if (documentsData?.length >= 6) {
      message.warning("You can only add up to 6 documents.");
      return;
    }
    setDocumentsData([
      ...documentsData,
      { licenceNumber: "", type_name: "", type_id: null, updateId: null },
    ]);
  };

  // Delete a document
  const deleteDocument = async (index) => {
    if (documentsData.length === 1) {
      message.warning("At least one document must remain.");
      return;
    }

    const documentToDelete = documentsData[index];

    if (documentToDelete.updateId) {
      try {
        await deletePeopleIdentification({ id: documentToDelete.updateId });
        setDocumentsData((prev) => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Error deleting identification:", error);
      }
    } else {
      setDocumentsData((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // input value handler
  const documentsDataHandler = (index, value, option, type = "input") => {
    if (type === "input") {
      setDocumentsData((prev) => {
        const updateItem = prev.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              licenceNumber: value,
            };
          } else {
            return item;
          }
        });
        return updateItem;
      });
    } else {
      setDocumentsData((prev) => {
        const updateItem = prev.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              type_name: value,
              type_id: option.id,
            };
          } else {
            return item;
          }
        });
        return updateItem;
      });
    }
  };

  const [identificationTypesData, setIdentificationTypeData] = useState([]);

  useEffect(() => {
    if (identificationTypes) {
      setIdentificationTypeData(identificationTypes?.data);
    }
  }, [identificationTypes]);

  /* Find Previous data and set data into available variable */
  useEffect(() => {
    if (prevData && !loaderForIdentifications) {
      if (identificationTypesData.length > 0) {
        const documentsData =
          prevData?.documentsData && prevData?.documentsData?.length > 0
            ? prevData?.documentsData.map((item) => ({
                updateId: item.id,
                licenceNumber: item.identification_code,
                type_name:
                  identificationTypesData.find(
                    (typeId) => typeId.id === item?.identification_type_id?.id
                  )?.type_name ?? null,
                type_id: item?.identification_type_id?.id,
              }))
            : [
                {
                  updateId: null,
                  licenceNumber: "",
                  type_name: "",
                  type_id: null,
                },
              ];
        setDocumentsData(documentsData);
      }
    }
  }, [prevData, identificationTypesData, loaderForIdentifications]);

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

  const stepHandler = async () => {
    const data = {
      documentsData: documentsData.filter(
        (doc) => doc.type_name && doc.type_id
      ),
    };

    try {
      await updateTeacherStepTwoSchema.validate(
        {
          ...data,
        },
        {
          abortEarly: false,
        }
      );
      const readyData = {
        people_identifications: data?.documentsData.length
          ? data?.documentsData.map((item) => ({
              id: item?.updateId,
              identification_type_id: item.type_id,
              identification_code: item.licenceNumber,
            }))
          : null,
      };
      await teacherProfileUpdate({
        id: prevData?.teacherId,
        data: cleanObject(readyData),
        redirectAnotherPage: redirectToAnotherPage,
        resetCookie: resetCookie,
      });

      modalOpen(true);
    } catch (err) {
      console.log(err.inner);
      const allMessages = err.inner.map((error, i) => {
        return error.message;
      });
      setErrors(allMessages);

      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {documentsData && documentsData.length
        ? documentsData.map((document, i) => (
            <div key={i} className="flex gap-6 items-end">
              {/* ID Type Select */}
              <div className="flex-1 ">
                <SelectBox
                  defaultValue={document?.type_name}
                  list={
                    identificationTypesData &&
                    identificationTypesData.length > 0 &&
                    identificationTypesData?.map((item) => ({
                      ...item,
                      label: item?.type_name,
                      value: item?.type_name,
                    }))
                  }
                  label="ID Type"
                  handler={(value, option) =>
                    documentsDataHandler(i, value, option, "select")
                  }
                />
              </div>

              {/* License Number + Delete Icon */}
              <div className="flex flex-1 gap-4 items-end pb-[2px]">
                {/* License Input */}
                <div className="flex-1">
                  <InputWithLabel
                    value={documentsData[i].licenceNumber}
                    label="License Number"
                    placeholder="License Number"
                    type="text"
                    name="ID Number"
                    handler={(e) =>
                      documentsDataHandler(i, e.target.value, null)
                    }
                  />
                </div>

                {/* Delete Icon */}
                <div
                  className="cursor-pointer"
                  onClick={() => deleteDocument(i)}
                  title="Delete this identification"
                >
                  {isDeleting ? (
                    <SvgLoader className="w-5 h-5" />
                  ) : (
                    <DeleteSvg className="hover:text-red-500 transition-colors" />
                  )}
                </div>
              </div>
            </div>
          ))
        : ""}

      <button
        type="button"
        onClick={addNewDocument}
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
        <span className="font-bold">Add Another ID</span>
      </button>

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

export default IdentificationDocumentStepUpdate;
