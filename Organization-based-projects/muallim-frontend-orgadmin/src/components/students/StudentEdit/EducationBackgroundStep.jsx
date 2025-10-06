import React, { useState, useEffect } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import InputBluePrint from "@/components/common/Inputs/Input/InputBluePrint";
import { GradeType } from "@/constants/GradeType";
import { useUpdateStudentProfileMutation } from "@/store/features/student-management/apiSlice";
import useLocationSelector from "@/hooks/useLocationSelector";
import { location_type_id_eighteen } from "@/static/static";
import { EditSvg } from "@/components/helpers/storeAllSvgs";
import { message } from "antd";

// Location Hierarchy function
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

const EducationBackgroundStep = ({ allOrganizations, studentInfo, grades }) => {
  const studentEducationalInfo = studentInfo?.student_profile_id;

  const defaultValue = {
    attended_years_of_madrasa:
      studentEducationalInfo?.attended_years_of_madrasa || "",
    madrasa_name: studentEducationalInfo?.organization_id?.name || "",
    madrasa_address: studentEducationalInfo?.madrasa_address || "",
    country: studentEducationalInfo?.country || "",
    state: studentEducationalInfo?.state || "",
    city: studentEducationalInfo?.city || "",
    studied_in_madrasa: studentEducationalInfo?.studied_in_madrasa
      ? "true"
      : "false",
    attended_public_school: studentEducationalInfo?.attended_public_school
      ? "true"
      : "false",
    attended_home_school: studentEducationalInfo?.attended_home_school
      ? "true"
      : "false",
    to_grade: studentEducationalInfo?.to_grade,
    program_name: studentEducationalInfo?.program_name,
    organization: studentEducationalInfo?.organization_id
      ? {
          is_exist: "true",
          id: studentEducationalInfo?.organization_id?.id,
          name: studentEducationalInfo?.organization_id?.name,
        }
      : {
          is_exist: "false",
          id: null,
          name: null,
        },
    organization_location:
      studentEducationalInfo?.organization_location || null,
  };

  const [formData, setFormData] = useState(defaultValue);

  // Location-related states
  const [locationUpdateToggle, setLocationUpdateToggle] = useState(false);
  const [getLocations, setGetLocation] = useState([]);
  const [street_address, setStreetAddress] = useState("");

  // Location feature using useLocationSelector hook
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

  const [updateStudentProfile, { isLoading: isUpdating }] =
    useUpdateStudentProfileMutation();

  // useEffect to update location state when studentInfo changes
  useEffect(() => {
    if (studentEducationalInfo?.organization_location) {
      const location = studentEducationalInfo.organization_location;

      const locationsFormated = {
        ...location,
        location_type_id: {
          ...location.location_type_id,
          type_name: "child_address",
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
  }, [studentEducationalInfo, setLocationFormData]);

  const handleChange = (input) => {
    let name, value;
    if (input?.target) {
      name = input.target.name;
      value = input.target.value;
    } else if (typeof input === "object" && input !== null) {
      [name, value] = Object.entries(input)[0];
    } else {
      return;
    }

    if (name.startsWith("organization.")) {
      const orgKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        organization: { ...prev.organization, [orgKey]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleOrganizationChange = (value, option) => {
    if (option) {
      setFormData((prev) => ({
        ...prev,
        organization: {
          is_exist: "true",
          id: option.value,
          name: option.label,
        },
      }));
    }
    if (value && !option) {
      setFormData((prev) => ({
        ...prev,
        organization: {
          is_exist: "false",
          id: null,
          name: value,
        },
      }));
    }
  };

  const isLocationEqual = (loc1, loc2) => {
    if (!loc1 || !loc2) return false;
    return (
      loc1.location_name === loc2.location_name &&
      loc1.post_code === loc2.post_code &&
      loc1.location_parent_id === loc2.location_parent_id &&
      loc1.location_type_id === loc2.location_type_id
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const organizationPayload =
      formData.organization.is_exist === "true"
        ? { is_exist: true, id: Number(formData.organization.id) }
        : {
            is_exist: false,
            name: formData.organization.name,
          };

    const payload = {
      studied_in_madrasa: formData.studied_in_madrasa === "true",
      attended_public_school: formData.attended_public_school === "true",
      attended_home_school: formData.attended_home_school === "true",
      attended_years_of_madrasa: formData.attended_years_of_madrasa,
      program_name: formData.program_name,
      to_grade: formData.to_grade,
      organization: organizationPayload,
    };

    // Handle location data from the useLocationSelector hook
    if (
      formData.organization.is_exist === "false" &&
      locationUpdateToggle &&
      locationTypesObjItems &&
      locationTypesObjItems.length > 0
    ) {
      payload.organization_location = {
        location_name: street_address,
        location_parent_id:
          locationTypesObjItems[locationTypesObjItems.length - 1]?.id || null,
        location_type_id: location_type_id_eighteen,
        lat: "0.0",
        long: "0.0",
      };
    }

    // Remove location if it's the same as original
    if (
      formData.organization.is_exist === "false" &&
      isLocationEqual(
        { location_name: street_address },
        studentEducationalInfo?.organization_location
      )
    ) {
      delete payload.organization_location;
    }

    // updateStudentProfile({
    //   peopleId: studentEducationalInfo?.id,
    //   payload: payload,
    // });
    try {
      await updateStudentProfile({
        peopleId: studentEducationalInfo?.id,
        payload: payload,
      }).unwrap();

      // Show success toast
      message.success("Student Educational info updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update student educational info.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Section 1: Studied in Madrasa */}
      <p className="text-sm font-bold mb-2 ">
        Has He/She Studied in A Madrasa/Islamic School Before?
      </p>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            value="true"
            checked={formData.studied_in_madrasa === "true"}
            onChange={handleChange}
            name="studied_in_madrasa"
            id="studied-yes"
          />
          <label htmlFor="studied-yes">Yes</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            value="false"
            checked={formData.studied_in_madrasa === "false"}
            onChange={handleChange}
            name="studied_in_madrasa"
            id="studied-no"
          />
          <label htmlFor="studied-no">No</label>
        </div>
      </div>

      {/* Conditional: Madrasa details if yes */}
      {formData.studied_in_madrasa === "true" && (
        <div className="input">
          {/* Years attended */}
          <div className="mb-3">
            <InputWithLabel
              label="Years Attended in Madrasa"
              placeholder={`e.g., ${formData.attended_years_of_madrasa || "3"}`}
              type="text"
              value={formData.attended_years_of_madrasa}
              name="attended_years_of_madrasa"
              handler={handleChange}
            />
          </div>

          {/* Conditional: Existing org select */}
          <div className="mb-3">
            <SelectBox
              defaultValue={
                formData?.organization?.id
                  ? allOrganizations.find(
                      (item) => item.id === formData?.organization?.id
                    )?.name
                  : formData?.organization?.name
                  ? formData?.organization?.name
                  : null
              }
              handler={(value, option) =>
                handleOrganizationChange(value, option)
              }
              list={allOrganizations.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              isAcceptstring
              label="Select Existing Madrasa/Islamic School"
            />
          </div>

          {/* Conditional: New org name + location */}
          {/* <div className="mb-3">
            <InputWithLabel
              label="Name of New Madrasa/Islamic School"
              placeholder="Organization Name"
              type="text"
              value={formData.organization.name}
              name="organization.name"
              handler={handleChange}
            />
          </div> */}

          {formData.organization.is_exist === "false" && (
            <>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch">
                <div>
                  <SelectBox
                    defaultValue={locationSelectedCountry?.location_name}
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
                    value={street_address}
                    name="street_address"
                    handler={(e) => setStreetAddress(e.target.value)}
                    error={
                      locationErrors && locationErrors.location
                        ? locationErrors.location
                        : null
                    }
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

      <hr className="my-4" />

      {/* Section 2: Public School */}
      <p className="text-sm font-bold mb-2 ">
        Has He/She Ever Gone to Public School?
      </p>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            value="true"
            checked={formData.attended_public_school === "true"}
            onChange={handleChange}
            name="attended_public_school"
            id="public-yes"
          />
          <label htmlFor="public-yes">Yes</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            value="false"
            checked={formData.attended_public_school === "false"}
            onChange={handleChange}
            name="attended_public_school"
            id="public-no"
          />
          <label htmlFor="public-no">No</label>
        </div>
      </div>

      {/* Conditional: Grade if public school yes */}
      {formData.attended_public_school === "true" && (
        <SelectBox
          defaultValue={formData.to_grade}
          handler={(value) => handleChange({ to_grade: value })}
          list={Object.values(GradeType).map((item) => ({
            label: item,
            value: item,
          }))}
          label="To Grade"
        />
      )}

      {/* Section 3: Home Schooling */}
      <p className="text-sm font-bold mt-5 mb-2 ">
        Is He/She Doing Home Schooling?
      </p>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            value="true"
            checked={formData.attended_home_school === "true"}
            onChange={handleChange}
            name="attended_home_school"
            id="home-yes"
          />
          <label htmlFor="home-yes">Yes</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            value="false"
            checked={formData.attended_home_school === "false"}
            onChange={handleChange}
            name="attended_home_school"
            id="home-no"
          />
          <label htmlFor="home-no">No</label>
        </div>
      </div>

      {formData.attended_home_school === "true" && (
        <InputWithLabel
          label="Home Schooling Program Name"
          placeholder="Program Name"
          type="text"
          value={formData.program_name}
          name="program_name"
          handler={handleChange}
        />
      )}

      {/* Submit button */}
      <div className="mb-3 text-right mt-20">
        <button
          type="submit"
          disabled={isUpdating}
          className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EducationBackgroundStep;
