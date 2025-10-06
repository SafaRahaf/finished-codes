import React, { useState, useEffect } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import InputBluePrint from "@/components/common/Inputs/Input/InputBluePrint";
import { useUpdateStudentGuardianMutation } from "@/store/features/student-management/apiSlice";
import { message } from "antd";
import { GuardianType } from "@/constants/guardianPeopleType";
import useLocationSelector from "@/hooks/useLocationSelector";
import { location_type_id_eighteen } from "@/static/static";
import { EditSvg, DownArrowSvg } from "@/components/helpers/storeAllSvgs";
import countryCodesFromJson from "../../../data/CountryCodes.json";

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

const EmergencyContactStep = ({ studentInfo }) => {
  const emergencyContactInfo = studentInfo?.parent_details;

  const getEmergencyContactInfo = () => {
    const emergencyContact = emergencyContactInfo?.find(
      (item) => item.people_type === "emergency contact"
    );
    return emergencyContact;
  };

  const [updateStudentGuardian, { isLoading }] =
    useUpdateStudentGuardianMutation();

  // State management
  const [formData, setFormData] = useState({
    guardian_is_emergency_contact: "false",
    emergency_contact_first_name: "",
    emergency_contact_last_name: "",
    emergency_contact_phone: "",
    emergency_contact_email: "",
    emergency_contact_relation: "",
    emergency_contact_location: null,
  });

  // Country code states
  const [countryDropDowntoggle, setCountryDropDownToggle] = useState(false);
  const [getCountries, setGetCountries] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [emergencyPhone, setEmergencyPhone] = useState("");

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

  // Initialize countries data
  useEffect(() => {
    if (!getCountries) {
      setGetCountries(countryCodesFromJson && countryCodesFromJson.countries);
      const findDefaultCountry =
        countryCodesFromJson && countryCodesFromJson.countries.length > 0
          ? countryCodesFromJson.countries.find(
              (country) => country.code === "US"
            )
          : null;
      setSelectedCountry(findDefaultCountry);
    }
  }, [getCountries]);

  // Helper: detect country by dial code (longest first), return {country, local}
  const detectCountryByDialCode = (fullNumber) => {
    if (!fullNumber || !getCountries || getCountries.length === 0) return null;
    const sorted = [...getCountries].sort(
      (a, b) => b.dial_code.length - a.dial_code.length
    );
    const trimmed = String(fullNumber).replace(/\s+/g, "");
    for (const c of sorted) {
      if (trimmed.startsWith(c.dial_code)) {
        return {
          country: c,
          local: trimmed.slice(c.dial_code.length),
        };
      }
    }
    return null;
  };

  const selectCountryhandler = (value) => {
    setSelectedCountry(value);
    setCountryDropDownToggle(false);
  };

  // Initialize form data
  useEffect(() => {
    if (studentInfo) {
      const emergencyContact = getEmergencyContactInfo();

      setFormData({
        guardian_is_emergency_contact:
          emergencyContact?.guardian_is_emergency_contact ? "true" : "false",
        emergency_contact_first_name: emergencyContact?.first_name || "",
        emergency_contact_last_name: emergencyContact?.last_name || "",
        emergency_contact_phone:
          emergencyContact?.user_id?.mobiles[0]?.mobile_no || null,
        emergency_contact_email:
          emergencyContact?.user_id?.emails[0]?.email || null,
        emergency_contact_relation:
          emergencyContact?.your_relation_with_person || null,
        emergency_contact_location: emergencyContact?.location_id || null,
      });

      // Initialize emergency phone with country code detection
      if (emergencyContact?.user_id?.mobiles[0]?.mobile_no) {
        const detected = detectCountryByDialCode(
          String(emergencyContact.user_id.mobiles[0].mobile_no)
        );
        if (detected?.country) {
          setSelectedCountry(detected.country);
          setEmergencyPhone(detected.local);
        } else {
          setEmergencyPhone(emergencyContact.user_id.mobiles[0].mobile_no);
        }
      }

      // Set up location hierarchy for display
      if (emergencyContact?.location_id) {
        const location = emergencyContact.location_id;

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
    }
  }, [studentInfo, setLocationFormData]);

  // Form change handler
  const handleEmergencyFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEmergencyPhoneChange = (e) => {
    const v = e.target.value;
    // If user pastes with code, auto-detect and strip prefix
    if (v?.trim().startsWith("+")) {
      const detected = detectCountryByDialCode(v.trim());
      if (detected?.country) {
        setSelectedCountry(detected.country);
        setEmergencyPhone(detected.local);
        return;
      }
    }
    setEmergencyPhone(v);
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

  // Save handler
  const handleSave = async () => {
    try {
      // Prepare emergency contact information
      const emergencyContactInfo = {
        contact_person_name:
          `${formData.emergency_contact_first_name} ${formData.emergency_contact_last_name}`.trim(),
        contact_person_mobile_no:
          emergencyPhone && selectedCountry?.dial_code
            ? selectedCountry.dial_code + emergencyPhone
            : emergencyPhone,
        contact_person_email: formData.emergency_contact_email,
        relation_with_contact_person: formData.emergency_contact_relation,
        guardian_is_emergency_contact:
          formData.guardian_is_emergency_contact === "true",
      };

      // Handle location data from the useLocationSelector hook
      if (
        locationUpdateToggle &&
        locationTypesObjItems &&
        locationTypesObjItems.length > 0
      ) {
        emergencyContactInfo.location = {
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
        isLocationEqual(
          { location_name: street_address },
          formData.emergency_contact_location
        )
      ) {
        delete emergencyContactInfo.location;
      }

      const payload = {
        emergency_contact: emergencyContactInfo,
      };

      await updateStudentGuardian({
        peopleId: studentInfo?.id,
        payload,
      }).unwrap();

      message.success("Emergency contact information updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update emergency contact information");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        <p className="text-sm font-bold mt-5 uppercase">
          Is the legal guardian the emergency contact person also? *
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="guardian_is_emergency_contact"
              id="another_yes"
              checked={formData.guardian_is_emergency_contact === "true"}
              value="true"
              onChange={handleFormChange}
            />
            <label htmlFor="another_yes">Yes</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="guardian_is_emergency_contact"
              id="another_no"
              checked={formData.guardian_is_emergency_contact === "false"}
              value="false"
              onChange={handleFormChange}
            />
            <label htmlFor="another_no">No</label>
          </div>
        </div>

        {/* Show emergency contact form only if guardian is not emergency contact */}
        {formData.guardian_is_emergency_contact === "false" && (
          <>
            <InputWithLabel
              label={"Contact Person Name"}
              placeholder={"Name"}
              type={"text"}
              value={formData.emergency_contact_first_name}
              name="emergency_contact_first_name"
              handler={handleEmergencyFormChange}
              noNumbersAndSpecialChars={true}
            />

            {/* Phone Number with Country Code */}
            <div>
              <label className="text-14 font-bold">
                Phone Number <sup className="text-danger-700 text-sm">*</sup>
              </label>
              <div className="mt-1 rounded-[4px] border w-full border-[#798295]">
                <div className="relative">
                  {/* country select button */}
                  <div className="flex items-center">
                    <div className="flex space-x-2 items-center">
                      <button
                        onClick={() =>
                          setCountryDropDownToggle(!countryDropDowntoggle)
                        }
                        type="button"
                        className="px-3 py-2 border-r border-[#798295]"
                      >
                        <div className="flex space-x-2 items-center">
                          <div className="w-[24px] h-[16px]">
                            {selectedCountry && (
                              <img
                                src={`/assets/img/countries/${selectedCountry.code}.svg`}
                                alt="country"
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          <span>
                            <DownArrowSvg />
                          </span>
                        </div>
                      </button>
                      <span className="text-base">
                        {selectedCountry && selectedCountry?.dial_code}
                      </span>
                    </div>
                    <input
                      className="block px-2 w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0"
                      placeholder="+13 549944994"
                      type="text"
                      value={emergencyPhone}
                      onChange={handleEmergencyPhoneChange}
                    />
                  </div>
                  {/* country code select dropdown list */}
                  {countryDropDowntoggle && (
                    <div className="absolute left-0 top-full z-10 mt-1 h-[150px] border border-[#798295] bg-white rounded overflow-y-auto overflow-style-none">
                      <ul>
                        {getCountries &&
                          getCountries.length > 0 &&
                          getCountries.map((item, i) => (
                            <li
                              onClick={() => selectCountryhandler(item)}
                              key={i}
                              className={`flex space-x-1.5 items-center px-3 py-1 cursor-pointer hover:bg-gray-100 ${
                                selectedCountry &&
                                selectedCountry.code === item.code
                                  ? "bg-blue-50 text-blue-600"
                                  : ""
                              }`}
                            >
                              <span>
                                <img
                                  width="25"
                                  height="15"
                                  src={`/assets/img/countries/${item.code}.svg`}
                                  alt="country"
                                  className="rounded"
                                />
                              </span>
                              <span className="text-sm text-qgray capitalize flex-1">
                                {item.dial_code}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <InputWithLabel
              label={"Email"}
              placeholder={"contact@gmail.com"}
              type={"email"}
              value={formData.emergency_contact_email}
              name="emergency_contact_email"
              handler={handleEmergencyFormChange}
            />

            <SelectBox
              defaultValue={formData.emergency_contact_relation}
              list={Object?.values(GuardianType)?.map((item) => ({
                label: item.replace("_", " "),
                value: item,
              }))}
              label="Relation"
              handler={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  emergency_contact_relation: value,
                }))
              }
            />

            <hr />

            {/* Location Section - Using useLocationSelector */}
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
            ) : (
              <>
                <div
                  className="col-span-full mt-4"
                  onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
                >
                  <InputBluePrint
                    label="Street Address"
                    value={street_address}
                  />
                </div>
                <div
                  onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
                  className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch"
                >
                  {getLocations &&
                    getLocations.length > 0 &&
                    getLocations.map((item, i) => (
                      <InputBluePrint
                        key={i}
                        label={item.type}
                        value={item.value}
                      />
                    ))}
                </div>
              </>
            )}
          </>
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

export default EmergencyContactStep;
