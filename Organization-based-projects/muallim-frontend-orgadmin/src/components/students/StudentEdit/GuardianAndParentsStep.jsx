import React, { useState, useEffect } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { LegalGuardianType } from "@/constants/guardianPeopleType";
import { useUpdateStudentGuardianMutation } from "@/store/features/student-management/apiSlice";
import { message } from "antd";
import useLocationSelector from "@/hooks/useLocationSelector";
import { location_type_id_eighteen } from "@/static/static";
import InputBluePrint from "@/components/common/Inputs/Input/InputBluePrint";
import { EditSvg } from "@/components/helpers/storeAllSvgs";

// Build displayable location hierarchy from nested parent chain
function getLocationHierarchy(location) {
  const result = [];
  function traverse(node) {
    if (!node) return;
    if (
      node.location_type_id &&
      node.location_type_id.type_name !== "child_address"
    ) {
      result.push({
        value: node.location_name,
        type: node.location_type_id.type_name,
        id: node.id,
      });
    }
    traverse(node.parent_id);
  }
  traverse(location);
  return result.reverse();
}

const GuardianParentsStep = ({ studentInfo }) => {
  const studentParentInfo = studentInfo?.parent_details;
  const [updateStudentGuardian, { isLoading }] =
    useUpdateStudentGuardianMutation();

  // State management
  const [formData, setFormData] = useState({
    legal_guardian_type: "",
    father_first_name: "",
    father_last_name: "",
    father_phone: "",
    father_email: "",
    father_address: true,
    father_location: null,
    mother_first_name: "",
    mother_last_name: "",
    mother_phone: "",
    mother_email: "",
    mother_address: true,
    mother_location: null,
  });

  const getFatherInfo = () => {
    const fatherInfo = studentParentInfo?.find(
      (item) => item.people_type === "father"
    );
    return fatherInfo;
  };

  const getMotherInfo = () => {
    const motherInfo = studentParentInfo?.find(
      (item) => item.people_type === "mother"
    );
    return motherInfo;
  };

  // Form change handler
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Father location hook
  const {
    selectedCountry: fatherSelectedCountry,
    formData: fatherLocationFormData,
    setFormData: setFatherLocationFormData,
    errors: fatherErrors,
    isFetching: fatherIsFetching,
    handleLocationSelection: fatherHandleLocationSelection,
    handleFormChange: fatherHandleFormChange,
    getCountryOptions: fatherGetCountryOptions,
    getLocationOptions: fatherGetLocationOptions,
    getFilteredInputGroups: fatherGetFilteredInputGroups,
    locationTypesObjItems: fatherLocationTypesObjItems,
  } = useLocationSelector();

  // Mother location hook
  const {
    selectedCountry: motherSelectedCountry,
    formData: motherLocationFormData,
    setFormData: setMotherLocationFormData,
    errors: motherErrors,
    isFetching: motherIsFetching,
    handleLocationSelection: motherHandleLocationSelection,
    handleFormChange: motherHandleFormChange,
    getCountryOptions: motherGetCountryOptions,
    getLocationOptions: motherGetLocationOptions,
    getFilteredInputGroups: motherGetFilteredInputGroups,
    locationTypesObjItems: motherLocationTypesObjItems,
  } = useLocationSelector();

  // Display states and toggles for father and mother location
  const [fatherLocationUpdateToggle, setFatherLocationUpdateToggle] =
    useState(false);
  useEffect(() => {
    if (fatherLocationUpdateToggle) {
      setFatherStreetAddress("");
    } else {
      setFatherStreetAddress(fatherLocationFormData.location_name);
    }
  }, [fatherLocationUpdateToggle]);
  const [fatherGetLocations, setFatherGetLocations] = useState([]);

  const [fatherStreetAddress, setFatherStreetAddress] = useState("");

  const [motherLocationUpdateToggle, setMotherLocationUpdateToggle] =
    useState(false);
  useEffect(() => {
    if (motherLocationUpdateToggle) {
      setMotherStreetAddress("");
    } else {
      setMotherStreetAddress(motherLocationFormData.location_name);
    }
  }, [motherLocationUpdateToggle]);
  const [motherGetLocations, setMotherGetLocations] = useState([]);

  const [motherStreetAddress, setMotherStreetAddress] = useState("");

  const isLocationEqual = (loc1, loc2) => {
    if (!loc1 || !loc2) return false;
    return (
      loc1.location_name === loc2.location_name &&
      loc1.post_code === loc2.post_code &&
      loc1.location_parent_id === loc2.location_parent_id &&
      loc1.location_type_id === loc2.location_type_id
    );
  };

  // Save handler
  const handleSave = async () => {
    try {
      // Prepare father information
      const fatherInfo = {
        first_name: formData.father_first_name || "",
        last_name: formData.father_last_name || "",
        same_address_as_student: formData.father_address === "true",
      };

      // Prepare mother information
      const motherInfo = {
        first_name: formData.mother_first_name || "",
        last_name: formData.mother_last_name || "",
        same_address_as_student: formData.mother_address === "true",
      };

      // Attach father location when address is different and selection exists
      if (
        formData.father_address === "false" &&
        fatherLocationTypesObjItems &&
        fatherLocationTypesObjItems.length > 0
      ) {
        fatherInfo.location = {
          location_name:
            fatherStreetAddress || fatherLocationFormData.location_name,
          location_parent_id:
            fatherLocationTypesObjItems[fatherLocationTypesObjItems.length - 1]
              ?.id || null,
          location_type_id: location_type_id_eighteen,
          lat: "0.0",
          long: "0.0",
        };
      }

      // Attach mother location when address is different and selection exists
      if (
        formData.mother_address === "false" &&
        motherLocationTypesObjItems &&
        motherLocationTypesObjItems.length > 0
      ) {
        motherInfo.location = {
          location_name:
            motherStreetAddress || motherLocationFormData.location_name,
          location_parent_id:
            motherLocationTypesObjItems[motherLocationTypesObjItems.length - 1]
              ?.id || null,
          location_type_id: location_type_id_eighteen,
          lat: "0.0",
          long: "0.0",
        };
      }

      // If unchanged from original, omit location
      if (
        formData.father_address === "false" &&
        formData.father_location &&
        fatherInfo.location &&
        isLocationEqual(
          { location_name: fatherInfo.location.location_name },
          formData.father_location
        )
      ) {
        delete fatherInfo.location;
      }

      if (
        formData.mother_address === "false" &&
        formData.mother_location &&
        motherInfo.location &&
        isLocationEqual(
          { location_name: motherInfo.location.location_name },
          formData.mother_location
        )
      ) {
        delete motherInfo.location;
      }

      const payload = {
        legal_guardian_type: formData.legal_guardian_type,
        father_information: fatherInfo,
        mother_information: motherInfo,
      };

      await updateStudentGuardian({
        peopleId: studentInfo?.id,
        payload,
      }).unwrap();

      message.success("Guardian information updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update guardian information");
    }
  };
  // Initialize form data
  useEffect(() => {
    if (studentInfo) {
      const fatherInfo = getFatherInfo();
      const motherInfo = getMotherInfo();

      // Helper function to format location data for LocationEdit component
      const formatLocationForComponent = (locationData) => {
        if (!locationData) return null;

        return {
          id: locationData.id,
          location_name: locationData.location_name,
          location_type_id: locationData.location_type_id?.id,
          location_parent_id: locationData.parent_id?.id,
          post_code: null,
          lat: null,
          long: null,
          parent_id: locationData.parent_id,
        };
      };

      setFormData({
        legal_guardian_type:
          studentInfo?.student_profile_id?.legal_guardian_type || "",
        father_first_name: fatherInfo?.first_name || "",
        father_last_name: fatherInfo?.last_name || "",
        father_phone:
          fatherInfo?.user_id?.mobiles?.find(
            (item) => item.mobile_type === "primary"
          )?.mobile_no || "",
        father_email:
          fatherInfo?.user_id?.emails?.find(
            (item) => item.email_type === "primary"
          )?.email || "",
        father_address: fatherInfo?.same_address_as_student ? "true" : "false",
        father_location: formatLocationForComponent(fatherInfo?.location_id),
        mother_first_name: motherInfo?.first_name || "",
        mother_last_name: motherInfo?.last_name || "",
        mother_phone:
          motherInfo?.user_id?.mobiles?.find(
            (item) => item.mobile_type === "primary"
          )?.mobile_no || "",
        mother_email:
          motherInfo?.user_id?.emails?.find(
            (item) => item.email_type === "primary"
          )?.email || "",
        mother_address: motherInfo?.same_address_as_student ? "true" : "false",
        mother_location: formatLocationForComponent(motherInfo?.location_id),
      });

      // Set up existing father location hierarchy for display
      if (fatherInfo?.location_id) {
        const location = fatherInfo.location_id;
        const locationsFormated = {
          ...location,
          location_type_id: {
            ...location.location_type_id,
            type_name: "child_address",
          },
        };
        const hierarchy = getLocationHierarchy(locationsFormated);
        if (hierarchy.length > 0) {
          setFatherLocationFormData((prev) => ({
            ...prev,
            location_name: location.location_name,
          }));
          setFatherStreetAddress(location.location_name);
          setFatherGetLocations(hierarchy);
        }
      }

      // Set up existing mother location hierarchy for display
      if (motherInfo?.location_id) {
        const location = motherInfo.location_id;
        const locationsFormated = {
          ...location,
          location_type_id: {
            ...location.location_type_id,
            type_name: "child_address",
          },
        };
        const hierarchy = getLocationHierarchy(locationsFormated);

        if (hierarchy.length > 0) {
          setMotherLocationFormData((prev) => ({
            ...prev,
            location_name: location.location_name,
          }));
          setMotherStreetAddress(location.location_name);
          setMotherGetLocations(hierarchy);
        }
      }
    }
  }, [studentInfo]);
  return (
    <>
      <div className="grid items-center justify-center grid-cols-1 gap-x-8 gap-y-4">
        <SelectBox
          defaultValue={formData.legal_guardian_type}
          list={Object?.values(LegalGuardianType)?.map((item) => ({
            label: item.replace("_", " ").replace("_", " "),
            value: item,
          }))}
          label="Legal Guardian"
          handler={(value) =>
            setFormData((prev) => ({ ...prev, legal_guardian_type: value }))
          }
        />
        <hr />

        {/* Father Information */}
        <div className="grid grid-cols-2 gap-4">
          <InputWithLabel
            label={"Father's First Name"}
            placeholder={"Father's first name"}
            type={"text"}
            value={formData.father_first_name}
            noNumbersAndSpecialChars={true}
            name="father_first_name"
            handler={handleFormChange}
          />
          <InputWithLabel
            label={"Father's Last Name"}
            placeholder={"Father's last name"}
            type={"text"}
            noNumbersAndSpecialChars={true}
            value={formData.father_last_name}
            name="father_last_name"
            handler={handleFormChange}
          />
        </div>

        <InputWithLabel
          label={"Phone Number"}
          placeholder={"+13 549944994"}
          type={"text"}
          value={formData.father_phone}
          name="father_phone"
          // handler={handleFormChange}
          disabled={true}
        />
        <InputWithLabel
          label={"Email"}
          placeholder={"father@gmail.com"}
          type={"email"}
          value={formData.father_email}
          name="father_email"
          // handler={handleFormChange}
          disabled={true}
        />

        <p className="text-sm font-bold mt-5 uppercase">
          Father's Home/Mailing Address*
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.father_address === "true"}
              name="father_address"
              value="true"
              onChange={handleFormChange}
              id="f_add_same"
            />
            <label htmlFor="f_add_same">Same as student's address</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.father_address === "false"}
              name="father_address"
              value="false"
              onChange={handleFormChange}
              id="f_add_diff"
            />
            <label htmlFor="f_add_diff">Different than student's address</label>
          </div>
        </div>

        {/* Father Location - show existing with Edit toggle, and selectors when editing */}
        {formData.father_address === "false" && (
          <div className="w-full mt-4">
            <div className="flex justify-between items-center md:col-span-2">
              <h4 className="text-lg font-bold">Address</h4>
              <button
                onClick={() =>
                  setFatherLocationUpdateToggle(!fatherLocationUpdateToggle)
                }
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

            {fatherLocationUpdateToggle ? (
              <div className="grid 2xl:grid-cols-2 mt-3 lg:grid-cols-2 grid-cols-1 gap-3 ">
                <div>
                  <SelectBox
                    defaultValue={fatherSelectedCountry?.location_name}
                    handler={fatherHandleLocationSelection}
                    loading={fatherIsFetching}
                    list={fatherGetCountryOptions()}
                    label="Country"
                    error={fatherErrors?.father_location}
                  />
                  {fatherErrors?.father_location && (
                    <p className="text-danger-700 text-sm">
                      {fatherErrors.father_location}
                    </p>
                  )}
                </div>

                {fatherGetFilteredInputGroups().map((group, index) => (
                  <div className="w-full" key={index}>
                    <SelectBox
                      className="blur-anim"
                      handler={fatherHandleLocationSelection}
                      list={fatherGetLocationOptions(group.children)}
                      label={group.type_name}
                      error={fatherErrors?.father_location}
                    />
                    {fatherErrors?.location && (
                      <p className="text-danger-700 text-sm">
                        {fatherErrors.location}
                      </p>
                    )}
                  </div>
                ))}

                <div className="w-full">
                  <InputWithLabel
                    label="Street Address"
                    placeholder="Enter street address"
                    type="text"
                    value={fatherStreetAddress}
                    name="street_address"
                    handler={(e) => setFatherStreetAddress(e.target.value)}
                    error={fatherErrors?.father_location_name}
                  />
                </div>
              </div>
            ) : (
              <>
                <div
                  className="col-span-full mt-4"
                  onClick={() =>
                    setFatherLocationUpdateToggle(!fatherLocationUpdateToggle)
                  }
                >
                  <InputBluePrint
                    label="Street Address"
                    value={fatherStreetAddress}
                  />
                </div>
                <div
                  onClick={() =>
                    setFatherLocationUpdateToggle(!fatherLocationUpdateToggle)
                  }
                  className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch"
                >
                  {fatherGetLocations &&
                    fatherGetLocations.length > 0 &&
                    fatherGetLocations.map((item, i) => (
                      <InputBluePrint
                        key={i}
                        label={item.type}
                        value={item.value}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        <hr />

        {/* Mother Information */}
        <div className="grid grid-cols-2 gap-4">
          <InputWithLabel
            label={"Mother's First Name"}
            placeholder={"Mother's first name"}
            type={"text"}
            value={formData.mother_first_name}
            name="mother_first_name"
            noNumbersAndSpecialChars={true}
            handler={handleFormChange}
          />
          <InputWithLabel
            label={"Mother's Last Name"}
            placeholder={"Mother's last name"}
            type={"text"}
            value={formData.mother_last_name}
            noNumbersAndSpecialChars={true}
            name="mother_last_name"
            handler={handleFormChange}
          />
        </div>

        <InputWithLabel
          label={"Phone Number"}
          placeholder={"+13 549944994"}
          type={"text"}
          value={formData.mother_phone}
          name="mother_phone"
          // handler={handleFormChange}
          disabled={true}
        />
        <InputWithLabel
          label={"Email"}
          placeholder={"mother@gmail.com"}
          type={"email"}
          value={formData.mother_email}
          name="mother_email"
          // handler={handleFormChange}
          disabled={true}
        />

        <p className="text-sm font-bold mt-5 uppercase">
          Mother's Home/Mailing Address*
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.mother_address === "true"}
              name="mother_address"
              value="true"
              onChange={handleFormChange}
              id="m_add_same"
            />
            <label htmlFor="m_add_same">Same as student's address</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.mother_address === "false"}
              name="mother_address"
              value="false"
              onChange={handleFormChange}
              id="m_add_diff"
            />
            <label htmlFor="m_add_diff">Different than student's address</label>
          </div>
        </div>

        {/* Mother Location - show existing with Edit toggle, and selectors when editing */}
        {formData.mother_address === "false" && (
          <div className="w-full mt-4">
            <div className="flex justify-between items-center md:col-span-2">
              <h4 className="text-lg font-bold">Address</h4>
              <button
                onClick={() =>
                  setMotherLocationUpdateToggle(!motherLocationUpdateToggle)
                }
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

            {motherLocationUpdateToggle ? (
              <div className="grid 2xl:grid-cols-2 mt-3 lg:grid-cols-2 grid-cols-1 gap-3 ">
                <div>
                  <SelectBox
                    defaultValue={motherSelectedCountry?.location_name}
                    handler={motherHandleLocationSelection}
                    loading={motherIsFetching}
                    list={motherGetCountryOptions()}
                    label="Country"
                    error={motherErrors?.mother_location}
                  />
                  {motherErrors?.mother_location && (
                    <p className="text-danger-700 text-sm">
                      {motherErrors.mother_location}
                    </p>
                  )}
                </div>

                {motherGetFilteredInputGroups().map((group, index) => (
                  <div className="w-full" key={index}>
                    <SelectBox
                      className="blur-anim"
                      handler={motherHandleLocationSelection}
                      list={motherGetLocationOptions(group.children)}
                      label={group.type_name}
                      error={motherErrors?.mother_location}
                    />
                    {motherErrors?.location && (
                      <p className="text-danger-700 text-sm">
                        {motherErrors.location}
                      </p>
                    )}
                  </div>
                ))}

                <div className="w-full">
                  <InputWithLabel
                    label="Street Address"
                    placeholder="Enter street address"
                    type="text"
                    value={motherStreetAddress}
                    name="street_address"
                    handler={(e) => setMotherStreetAddress(e.target.value)}
                    error={motherErrors?.mother_location_name}
                  />
                </div>
              </div>
            ) : (
              <>
                <div
                  className="col-span-full mt-4"
                  onClick={() =>
                    setMotherLocationUpdateToggle(!motherLocationUpdateToggle)
                  }
                >
                  <InputBluePrint
                    label="Street Address"
                    value={motherStreetAddress}
                  />
                </div>
                <div
                  onClick={() =>
                    setMotherLocationUpdateToggle(!motherLocationUpdateToggle)
                  }
                  className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch"
                >
                  {motherGetLocations &&
                    motherGetLocations.length > 0 &&
                    motherGetLocations.map((item, i) => (
                      <InputBluePrint
                        key={i}
                        label={item.type}
                        value={item.value}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mb-3 text-right mt-20">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
};

export default GuardianParentsStep;
