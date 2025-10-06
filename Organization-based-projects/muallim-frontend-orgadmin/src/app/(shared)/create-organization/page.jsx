"use client";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrganizationSchema } from "@/utilities/validationRules/schemas/authSchema";
import {
  useCreateOrganzizationMutation,
  useSwitchToOrgUserMutation,
} from "@/store/features/auth/apiSlice";
import { message } from "antd";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { location_type_id, org_type_id } from "@/static/static";
import cleanObject from "@/components/helpers/cleanObject";
import useLocationSelector from "@/hooks/useLocationSelector";

const CreateOrganization = () => {
  const router = useRouter();

  // ========= FORM DATA STATES =========
  const [formData, setFormData] = useState({
    name: "",
    website_url: "",
    org_type_id: org_type_id,
    location_name: "",
  });
  const [errors, setErrors] = useState(null);

  // ========= ORGANIZATION API HOOKS =========
  const [createOrganzization, { isLoading, error }] =
    useCreateOrganzizationMutation();
  const [
    switchToOrgUser,
    { isLoading: switchToOrgUserLoader, error: switchToOrgUserError },
  ] = useSwitchToOrgUserMutation();

  // ========= FORM HANDLERS =========
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // location selector
  const {
    selectedCountry,
    formData: locationFormData,
    errors: locationErrors,
    setErrors: setLocationErrors,
    isFetching,
    locationTypes,
    setLocationTypes,
    handleLocationSelection,
    handleFormChange,
    getCountryOptions,
    getLocationOptions,
    getFilteredInputGroups,
    locationTypesObjItems,
  } = useLocationSelector();

  // ========= UTILITY FUNCTIONS =========
  const resetFrom = () => {
    setFormData({
      name: "",
      website_url: "",
      org_type_id: org_type_id,
      location_name: "",
    });
    setErrors(null);
    setLocationTypes([]);
    setCountries(null);
    setInputGroups([]);
  };

  const redirectToAnotherPage = () => {
    router.replace(`/dashboard`);
  };

  const switchToOrgUserHandler = async (id) => {
    try {
      await switchToOrgUser({
        org_id: id,
        redirectToAnotherPage: redirectToAnotherPage,
        resetHandler: resetFrom,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const organizerRequestHandler = async () => {
    try {
      await createOrganizationSchema.validate(
        {
          name: formData.name,
          website_url: formData.website_url,
          location_name: formData.location_name,
          location: locationTypes,
        },
        { abortEarly: false }
      );
      const data = {
        name: formData.name,
        website_url: formData.website_url,
        org_type_id: org_type_id,
        organization_location: {
          location_name: formData?.location_name,
          location_type_id: location_type_id,
          location_parent_id:
            locationTypesObjItems.length > 0
              ? locationTypesObjItems[locationTypesObjItems.length - 1].id
              : null,
        },
      };
      const reformateData = cleanObject(data);
      await createOrganzization({
        data: reformateData,
        switchToOrgUserHandler: switchToOrgUserHandler,
      });
    } catch (validationErrors) {
      console.log(validationErrors);
      const formattedErrors = {};
      validationErrors.inner.forEach((error) => {
        formattedErrors[error.path] = error.message;
      });
      setErrors(formattedErrors);
      setLocationErrors(formattedErrors);
    }
  };

  // ========= ERROR HANDLING EFFECTS =========
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error(error.data.message);
      } else {
        message.error(error.data.message);
      }
    }
  }, [error]);
  return (
    <div className="card w-full md:p-[48px] shadow-authpage  p-8 rounded-[12px] relative z-50 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="md:text-30 text-2xl font-bold my-0 p-0">
          Create Organization
        </h3>
        {/* <p className="font-bold md:block hidden">Step 3/3</p> */}
      </div>

      <div className="line bg-[#e4e6ea] w-full h-[1px] my-6"></div>
      <div className="w-full blur-anim">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 items-stretch">
          <div className="col-span-full">
            <InputWithLabel
              label={"Organization Name"}
              placeholder={"Organization Name"}
              type={"text"}
              value={formData.name}
              name="name"
              maxlength={50}
              handler={(e) => handleChange(e)}
              error={errors && errors.name ? errors.name : null}
              isRequired
            />
          </div>
          <div className="col-span-full">
            <InputWithLabel
              label={"Website"}
              placeholder={"Ex: http://example.com/"}
              type={"text"}
              value={formData.website_url}
              name="website_url"
              handler={(e) => handleChange(e)}
              error={errors && errors.website_url ? errors.website_url : null}
            />
          </div>
          <div>
            <SelectBox
              defaultValue={selectedCountry?.location_name}
              handler={handleLocationSelection}
              loading={isFetching}
              list={getCountryOptions()}
              isRequired
              label="Country"
              error={
                locationErrors && locationErrors.location
                  ? locationErrors.location
                  : null
              }
            />
            {locationErrors && locationErrors.location && (
              <p className="text-danger-700 text-sm">
                {locationErrors.location}
              </p>
            )}
          </div>

          {/* Dynamic Location Layers */}
          {getFilteredInputGroups().map((group, index) => (
            <div className="w-full" key={index}>
              <SelectBox
                isRequired
                className="blur-anim"
                handler={handleLocationSelection}
                list={getLocationOptions(group.children)}
                label={group.type_name}
                error={
                  locationErrors && locationErrors.location
                    ? locationErrors.location
                    : null
                }
              />
              {locationErrors && locationErrors.location && (
                <p className="text-danger-700 text-sm">
                  {locationErrors.location}
                </p>
              )}
            </div>
          ))}

          {/* Street Address Input */}
          <InputWithLabel
            label="Street Address"
            placeholder="Enter street address"
            type="text"
            value={formData.location_name}
            name="location_name"
            handler={(e) => handleChange(e)}
            error={errors && errors.location_name ? errors.location_name : null}
            isRequired
          />
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={organizerRequestHandler}
            type="button"
            className="btn btn-black bg-black text-white common-transition rounded-[8px] md:w-auto w-full py-2 px-0 flex justify-center items-center md:py-[12px] md:px-[200px] text-lg font-bold  mx-auto"
          >
            {isLoading ? (
              <SvgLoader className="text-white" />
            ) : (
              "Create Organization"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;
