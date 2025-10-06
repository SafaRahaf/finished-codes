"use client";
import InputBluePrint from "@/components/common/Inputs/Input/InputBluePrint";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import cleanObject from "@/components/helpers/cleanObject";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { location_type_id_eighteen } from "@/static/static";
import {
  useGetCountriesQuery,
  useLazyGetLocationLayersQuery,
} from "@/store/features/locations/apiSlice";
import { useTeacherProfileUpdateMutation } from "@/store/features/teacher-management/apiSlice";
import { updateTeacherStepThreeSchema } from "@/utilities/validationRules/schemas/updateTeacherSchema";
import { message } from "antd";
import React, { useState, useEffect } from "react";
// Location Hierarchy
import useLocationSelector from "@/hooks/useLocationSelector";
import { EditSvg } from "@/components/helpers/storeAllSvgs";
function getLocationHierarchy(location) {
  const result = [];

  // Recursive function to traverse and collect data
  function traverse(location) {
    if (!location) return;

    // Push the current location details to the result array
    if (
      location.location_type_id &&
      location.location_type_id.type_name !== "child_address"
    ) {
      result.push({
        value: location.location_name,
        type: location.location_type_id.type_name,
        id: location.id,
      });
    }

    // Recursively call for the next parent, if it exists
    traverse(location.parent_id);
  }

  // Start the recursion with the initial location
  traverse(location);

  // Reverse the result to show from top-level parent to the child
  return result.reverse();
}

function LocationStepUpdate({ prevData, modalOpen }) {
  /*======== initilize apis ========*/

  const { data, isFetching } = useGetCountriesQuery();
  const [getLocationLayers, { data: getLayers, isLoading: isLoadingLayers }] =
    useLazyGetLocationLayersQuery();
  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();

  /*========= states & functions =========*/

  // location option
  const [locationUpdateToggle, setLocationUpdateToggle] = useState(false);
  useEffect(() => {
    if (locationUpdateToggle) {
      setLocationFormData((prev) => ({
        ...prev,
        location_name: "",
      }));
    } else {
      setLocationFormData((prev) => ({
        ...prev,
        location_name: locationFormData.location_name,
      }));
    }
  }, [locationUpdateToggle]);
  // getting location tree
  const [getLocations, setGetLocation] = useState([]);
  // errors
  const [errors, setErrors] = useState(null);
  const [street_address, setStreetAddress] = useState("");

  //=== === === location feature
  const {
    selectedCountry: locationSelectedCountry,
    formData: locationFormData,
    errors: locationErrors,
    setFormData: setLocationFormData,
    setErrors: setLocationErrors,
    isFetching: isFetchingLocation,
    locationTypes,
    setLocationTypes,
    handleLocationSelection,
    handleFormChange,
    getCountryOptions,
    getLocationOptions,
    getFilteredInputGroups,
    locationTypesObjItems,
  } = useLocationSelector();

  // === === === end location feature
  /* 
      Find Previous data and set data into available variable
  */
  useEffect(() => {
    if (prevData) {
      const location = prevData?.location;
      const locationsFormated = {
        ...location, // Spread the original properties first
        location_type_id: {
          ...location,
          type_name: "child_address", // Override type_name here
        },
      };
      const hierarchy = getLocationHierarchy(locationsFormated);
      if (hierarchy.length > 0) {
        setStreetAddress(location.location_name);
        setLocationFormData((prev) => ({
          ...prev,
          location_name: location.location_name,
        }));
        setGetLocation(hierarchy);
      }
    }
  }, [prevData]);

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
    try {
      await updateTeacherStepThreeSchema.validate(
        {
          street_address: street_address,
        },
        {
          abortEarly: false,
        }
      );
      const data = {
        street_address: street_address,
        locationTypesObjItems: locationTypesObjItems,
        location_type_id: location_type_id_eighteen,
      };
      const readyData = {
        people_location: {
          id: prevData?.id,
          location_name: data?.street_address,
          location_parent_id:
            data?.locationTypesObjItems.length > 0
              ? data?.locationTypesObjItems[
                  data?.locationTypesObjItems.length - 1
                ].id
              : null,
          location_type_id: data?.location_type_id,
          lat: "0.0",
          long: "0.0",
        },
      };
      await teacherProfileUpdate({
        id: prevData?.teacherId,
        data: cleanObject(readyData),
        redirectAnotherPage: redirectToAnotherPage,
        resetCookie: resetCookie,
      });

      modalOpen(true);
    } catch (err) {
      const allMessages = err.inner.map((error) => {
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
      {errors && (
        <div
          ref={errorRef}
          className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-semibold text-lg">
            Please check your{" "}
            <span className="font-bold">Invalid Information</span>:
          </p>
          <ul className="list-disc ml-5 mt-2">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <div className="flex justify-between items-center md:col-span-2">
          <h4 className="text-lg font-bold">Address</h4>
          <button
            onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
            type="button"
            className="flex space-x-1 items-center"
          >
            <span>
              <EditSvg />
            </span>
            <span className="text-sm text-primary-brand-900 font-bold">
              Edit
            </span>
          </button>
        </div>
      </div>

      {locationUpdateToggle ? (
        <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch">
          <div>
            <SelectBox
              defaultValue={locationSelectedCountry?.location_name}
              isRequired
              handler={handleLocationSelection}
              loading={isFetchingLocation}
              list={getCountryOptions()}
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
                className="blur-anim"
                isRequired
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

          {locationTypes && locationTypes.length > 0 && (
            <InputWithLabel
              label="Street Address"
              placeholder="Enter street address"
              type="text"
              value={locationFormData?.location_name}
              name="location_name"
              handler={(e) => handleFormChange(e)}
              error={
                locationErrors && locationErrors.location
                  ? locationErrors.location
                  : null
              }
              isRequired
            />
          )}
        </div>
      ) : (
        <>
          <div
            className="col-span-full mt-4"
            onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
          >
            <InputBluePrint label="Street Address" value={street_address} />
          </div>
          <div
            onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
            className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch"
          >
            {getLocations &&
              getLocations.length > 0 &&
              getLocations.map((item, i) => (
                <InputBluePrint key={i} label={item.type} value={item.value} />
              ))}
          </div>
        </>
      )}
      <div className="mb-3 text-right mt-20">
        <button
          onClick={stepHandler}
          type="button"
          className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Save Changes"}
        </button>
      </div>
    </>
  );
}

export default LocationStepUpdate;
