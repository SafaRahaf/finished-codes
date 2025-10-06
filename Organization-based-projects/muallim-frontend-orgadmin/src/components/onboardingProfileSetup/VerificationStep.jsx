"use client";
import React, { useEffect, useState, useRef } from "react";
import InputWithLabel from "../common/Inputs/Input/InputWithLabel";
import Image from "next/image";
import { useOnboardingProfileSetupMutation } from "@/store/features/auth/apiSlice";
import UploadSvg from "../helpers/storeAllSvgs/UploadSvg";
import { message } from "antd";
import CrossSvg from "../helpers/storeAllSvgs/CrossSvg";
import { useUploadPhotoMutation } from "@/store/features/file-upload/apiSlice";
import { uploadImageAndProcess } from "../helpers/uploadImageAndProcess";
import { verificationSchema } from "@/utilities/validationRules/schemas/authSchema";

function VerificationStep({
  step,
  setStep,
  prevData,
  refetchData,
  handleToggle,
}) {
  const [formData, setFormData] = useState({
    ein: "",
    ssn: "",
  });

  const [errors, setErrors] = useState({});
  const [formDoc, setFormDoc] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const docUploadInput = useRef(null);

  const removeFormDoc = () => {
    if (formDoc) {
      setFormData((prev) => ({
        ...prev,
        document: null,
      }));
      setFormDoc(null);
    }
  };

  const docUploadChangeHandler = (e) => {
    const inputElement = e.target;

    if (inputElement.value !== "") {
      setIsProcessingFile(true);
      const file = inputElement.files[0];
      const validFileTypes = [
        "application/pdf",
        "image/png",
        "image/jpg",
        "image/jpeg",
      ];

      // Check if the file type is valid
      if (!validFileTypes.includes(file.type)) {
        message.error(
          "Invalid file type. Please upload a PDF, PNG, JPG, or JPEG file."
        );
        inputElement.value = "";
        setIsProcessingFile(false);
        return;
      }

      // Get file size in bytes
      const fileSizeInBytes = file.size;

      // Convert to kilobytes (optional)
      const fileSizeInKB = fileSizeInBytes / 1024;

      // Convert to megabytes (optional)
      const fileSizeInMB = fileSizeInKB / 1024;

      // You can add a file size check if needed
      if (fileSizeInMB > 3) {
        message.error("File size exceeds 3MB limit");
        inputElement.value = "";
        setIsProcessingFile(false);
      } else {
        // Proceed with reading and setting the file
        const docReader = new FileReader();
        docReader.onload = (event) => {
          setFormData((prev) => ({
            ...prev,
            document: event.target.result,
          })); //store
          setIsProcessingFile(false);
        };
        docReader.readAsDataURL(file); //view
        setFormDoc(file);
        // Clear the input value after successful processing
        inputElement.value = "";
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.length <= 9) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetDataHandler = () => {
    setFormData({
      ein: "",
      ssn: "",
      document: null,
    });
  };
  useEffect(() => {
    if (prevData) {
      setFormData({
        ein: prevData.ein,
        ssn: prevData.ssn,
      });
    }
  }, [prevData]);

  //  initialize request slice
  const [onboardingProfileSetup, { isLoading, error }] =
    useOnboardingProfileSetupMutation();

  //   error watcher
  useEffect(() => {
    if (error) {
      message.error(error.data.message);
    }
  }, [error]);

  const nextStepHandler = async () => {
    await refetchData();
    handleToggle();
  };
  const [uploadPhoto, { isLoading: photoUploadLoading, error: uploadError }] =
    useUploadPhotoMutation();

  // update profile request handler
  // const updateOrganizationHandler = async () => {
  //   const data = {
  //     ein: formData?.ein,
  //     ssn: formData?.ssn,
  //     document: formData?.document,
  //   };

  //   // only for ein
  //   const checkData = data.ein
  //     ? { organization: { ein: data?.ein } }
  //     : { organization: { ein: null } };
  //   console.log(checkData);

  //   if (formData?.document) {
  //     await uploadImageAndProcess({
  //       uploadApi: uploadPhoto,
  //       imageFile: formDoc,
  //       onSuccess: async (imageUrl) => {
  //         await onboardingProfileSetup({
  //           data: {
  //             ...checkData,
  //             organization: {
  //               ...checkData.organization,
  //               ein_photo_url: imageUrl,
  //             },
  //           },
  //           reset: resetDataHandler,
  //           next: nextStepHandler,
  //         });
  //       }, // Dynamic API call
  //       onError: async (error) =>
  //         await onboardingProfileSetup({
  //           data: {
  //             ...checkData,
  //             organization: {
  //               ...checkData.organization,
  //               ein_photo_url: undefined,
  //             },
  //           },
  //           reset: resetDataHandler,
  //           next: nextStepHandler,
  //         }),
  //     });
  //   } else {
  //     await onboardingProfileSetup({
  //       data: {
  //         ...checkData,
  //         organization: {
  //           ...checkData.organization,
  //           ein_photo_url: undefined,
  //         },
  //       },
  //       reset: resetDataHandler,
  //       next: nextStepHandler,
  //     });
  //   }
  // };
  const updateOrganizationHandler = async () => {
    try {
      // validate formData against Yup schema
      await verificationSchema.validate(formData, { abortEarly: false });
      setErrors({}); // clear errors if valid
    } catch (err) {
      if (err.inner) {
        // collect Yup errors
        const validationErrors = {};
        err.inner.forEach((e) => {
          if (e.path) {
            validationErrors[e.path] = e.message;
          }
        });
        setErrors(validationErrors);
      }
      return; // stop execution if validation fails
    }

    const data = {
      ein: formData?.ein,
      ssn: formData?.ssn,
      document: formData?.document,
    };

    const checkData = data.ein
      ? { organization: { ein: data?.ein } }
      : { organization: { ein: null } };

    if (formData?.document) {
      await uploadImageAndProcess({
        uploadApi: uploadPhoto,
        imageFile: formDoc,
        onSuccess: async (imageUrl) => {
          await onboardingProfileSetup({
            data: {
              ...checkData,
              organization: {
                ...checkData.organization,
                ein_photo_url: imageUrl,
              },
            },
            reset: resetDataHandler,
            next: nextStepHandler,
          });
        },
        onError: async () =>
          await onboardingProfileSetup({
            data: {
              ...checkData,
              organization: {
                ...checkData.organization,
                ein_photo_url: undefined,
              },
            },
            reset: resetDataHandler,
            next: nextStepHandler,
          }),
      });
    } else {
      await onboardingProfileSetup({
        data: {
          ...checkData,
          organization: {
            ...checkData.organization,
            ein_photo_url: undefined,
          },
        },
        reset: resetDataHandler,
        next: nextStepHandler,
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-3 mt-10 scrollable">
      <p className="md:col-span-2 text-[#22252B] ">
        Submit your documents to verify your organization.
      </p>
      <div className="flex flex-col gap-1">
        <InputWithLabel
          label={"EIN"}
          placeholder={"EIN number XX-XXXXXXX"}
          type={"number"}
          name="ein"
          handler={(e) => handleChange(e)}
          maxlength={9}
          value={formData.ein}
        />
        <p className="text-gray-400 text-sm">
          EIN must contain 9 numeric digits.{" "}
        </p>

        {errors.ein && <p className="text-red-500 text-sm">{errors.ein}</p>}
      </div>
      {/* <div className="line h-[1px] mt-2 mb-4 bg-[#E4E6EA] md:col-span-2"></div> */}

      {/* <InputWithLabel
        label={"SSN"}
        placeholder={"Social security number"}
        type={"text"}
        name="ssn"
        handler={(e) => handleChange(e)}
        value={formData.ssn}
      /> */}

      {formData.ein ? (
        <div className="md:col-span-2 mt-3">
          <label
            htmlFor="doc-upload"
            className="py-3 md:px-12 px-6 flex w-full justify-center items-center flex-col rounded-[12px] border border-dashed border-[#AEB4BF] cursor-pointer hover:border-[#22252B] transition-colors"
            onClick={(e) => {
              if (isProcessingFile) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <input
              ref={docUploadInput}
              type="file"
              name="doc-upload"
              className="hidden"
              id="doc-upload"
              accept=".pdf, .jpg, .png"
              onChange={docUploadChangeHandler}
            />

            <div className="flex justify-center items-center gap-2">
              <UploadSvg />
              <span className="font-bold">Upload</span>
            </div>
            <p className="text-sm text-center mt-3">
              File formats - .pdf, .jpg, .png etc. <br />
              File should not be more then 3 MB.
            </p>
            {formDoc && (
              <div className="flex justify-center items-center gap-2 mt-2">
                <p className="text-sm text-green-600 font-semibold">
                  {formDoc.name}
                </p>{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFormDoc();
                  }}
                  className="text-red-500 hover:text-red-700 text-sm underline"
                >
                  <span className="text-red-500 hover:text-red-700 text-sm underline">
                    <CrossSvg width={16} height={16} />
                  </span>
                </button>
              </div>
            )}
          </label>
        </div>
      ) : (
        ""
      )}
      {errors.document && formData.ein > 0 && (
        <p className="text-red-500 text-sm">{errors.document}</p>
      )}

      <div className="md:col-span-2 flex md:flex-row flex-col gap-5 justify-between items-center text-right mt-10 ">
        <div className="  border border-black text-black text-lg rounded-[8px] font-bold bg-[#fff] py-[13px] px-[24px]">
          <button type="button" onClick={() => setStep(2)} className="w-full">
            Previous Step
          </button>
        </div>
        <div className=" border  border-black text-black bg-[#22252B] text-lg rounded-[8px] font-bold text-center">
          <button
            disabled={isLoading}
            onClick={updateOrganizationHandler}
            type="button"
            className="btn md:w-auto  w-full disabled:cursor-not-allowed disabled:opacity-50 py-[13px] px-[24px] font-bold text-lg rounded-[8px] text-white"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationStep;
