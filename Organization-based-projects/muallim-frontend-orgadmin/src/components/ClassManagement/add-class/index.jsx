"use client";
import React, { useState, useEffect, useRef } from "react";
// import { Checkbox } from "antd";
import Switcher from "@/components/common/Inputs/Buttons/Switch";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import { useGetClassTypesQuery } from "@/store/features/class-management/classTypesSlice";
import {
  useCreateClassGroupMutation,
  useCreateClassMutation,
  useGetGroupsQuery,
} from "@/store/features/class-management/apiSlice";
import {
  useGetTeachersQuery,
  useGetTeachersWithExtraDataQuery,
} from "@/store/features/teacher-management/apiSlice";
import { usePeopleRolesQuery } from "@/store/features/auth/apiSlice";
import InputTimePicker from "@/components/common/Inputs/Input/InputTimePicker";
import { message, notification } from "antd";
import { createClassSchema } from "@/utilities/validationRules/schemas/createClassSchema";
import moment from "moment";
import { useRouter } from "next/navigation";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import SelectWithAdding from "@/components/common/Inputs/Input/SelectWithAdding";
import { daysOfWeekFull } from "@/constants/daysOfFullWeek";
import { DeleteBtnSvg } from "@/components/helpers/storeAllSvgs";

import dynamic from "next/dynamic";

import useGoogleLocation from "@/hooks/useGoogleLocation";

const GoogleMap = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.GoogleMap),
  { ssr: false }
);
const MarkerF = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.MarkerF),
  { ssr: false }
);

import siteConfig from "@/config";
const AddNewClass = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [getAllClassTypes, setGetAllClassTypes] = useState([]);
  const [selectedClassType, setSelectedClassType] = useState(null);
  const [classGroups, setClassGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // notification  Handler
  const notifyHandler = (option) => {
    notification.open(option);
  };
  // others input filed
  const [formData, setFormData] = useState({
    grade: "",
    mode: "on-site",
  });

  const formDataHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // class type
  const selectClassTypeHandler = (value, option) => {
    setSelectedClassType(option);
  };
  // api slice
  const { data: classTypes, isFetching: fetchingClassTypes } =
    useGetClassTypesQuery();
  useEffect(() => {
    if (!fetchingClassTypes && classTypes) {
      setGetAllClassTypes(classTypes?.data);
    }
  }, [fetchingClassTypes, classTypes]);

  // department/gropus
  const selectedClassGroupsHandler = (value, option) => {
    setSelectedGroup(option);
  };
  const [
    createGroup,
    { isLoading: createGroupLoading, error: createGroupError },
  ] = useCreateClassGroupMutation();
  const successHandler = (data) => {
    setClassGroups(data);
  };
  const addNewClassGroupsHandler = async (name) => {
    // createGroup({ data: { name }, successHandler: successHandler });
    try {
      await createGroup({ data: { name } }).unwrap();
      await refetchGroups();
    } catch (err) {
      console.error(err);
    }
  };
  const {
    data: fetchClassGroups,
    isFetching: loadingClassGroups,
    refetch: refetchGroups,
  } = useGetGroupsQuery({
    page: 1,
    limit: 999,
  });

  useEffect(() => {
    if (!loadingClassGroups && fetchClassGroups) {
      setClassGroups(fetchClassGroups?.data);
    }
  }, [fetchClassGroups, loadingClassGroups]);

  // teachers
  const selectedClassTeachersHandler = (value, option) => {
    setSelectedTeacher(option);
  };

  const limit = 1000;
  const pageRef = useRef(1);

  const { data: fetchTeachers, isFetching: loadingTeachers } =
    useGetTeachersWithExtraDataQuery(
      {
        page: 1,
        limit,
      },
      { refetchOnMountOrArgChange: true }
    );
  // const { data: fetchTeachers, isFetching: loadingTeachers } =
  //   useGetTeachersQuery({ limit: 1000 });

  useEffect(() => {
    if (!loadingTeachers && fetchTeachers) {
      setTeachers(fetchTeachers?.data);
    }
  }, [fetchTeachers, loadingTeachers]);

  // supervisor
  const [enableSupervisor, setEnableSupervisor] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null); //selected supervisor

  // roles
  const [peopleRoles, setPeopleRoles] = useState([]);
  const [selectedPeopleRole, setSelectedPeopleRole] = useState(null); //selected roles
  const { data: fetchPeopleRoles, isFetching: loadingPeopleRoles } =
    usePeopleRolesQuery();
  useEffect(() => {
    if (!loadingPeopleRoles && fetchPeopleRoles) {
      setPeopleRoles(fetchPeopleRoles?.data);
    }
  }, [fetchPeopleRoles, loadingPeopleRoles]);

  // multiple roles and multiple supervisor
  const [allSupervisor, setSupervisor] = useState([
    // supervisor data
    {
      unKey: 1,
      people_id: null,
      role_id: null,
    },
  ]);

  // add supervisor data
  const updateSupervisor = (unKey, updatedData) => {
    setSupervisor((prev) =>
      prev.map((supervisor) =>
        supervisor.unKey === unKey
          ? {
              ...supervisor,
              people_id: updatedData.id,
            }
          : supervisor
      )
    );
  };
  // add supervisor role
  const updateSupervisorRole = (unKey, updatedData) => {
    setSupervisor((prev) =>
      prev.map((supervisor) =>
        supervisor.unKey === unKey
          ? {
              ...supervisor,
              role_id: updatedData.id,
            }
          : supervisor
      )
    );
  };

  // add new supervisor
  const addNewSupervisorHandler = () => {
    if (allSupervisor.length < teachers.length) {
      setSupervisor((prev) => [
        ...prev,
        {
          unKey: prev.length + 1,
          id: null,
          people_type_id: null,
          role_id: null,
        },
      ]);
    }
  };

  //  class schedules
  const [classDays, setClassDays] = useState([
    //class days
    {
      id: 1,
      storeDay: [
        {
          day: [],
          check_in: "",
          check_out: "",
        },
      ],
    },
  ]);

  // toggle class Day remove add
  const toggleClassDaysHandler = (day, index) => {
    setClassDays((prevClassDays) => {
      // Map through the previous state to update immutably
      return prevClassDays.map((item, i) => {
        if (i === index) {
          // Update the `storeDay` array for the specific index
          const updatedStoreDay = item.storeDay.map((storeDayItem) => {
            const dayExists = storeDayItem.day.includes(day);

            return {
              ...storeDayItem,
              day: dayExists
                ? storeDayItem.day.filter((d) => d !== day) // Remove the day
                : [...storeDayItem.day, day], // Add the day
            };
          });

          return { ...item, storeDay: updatedStoreDay };
        }
        return item; // Return the unmodified item for other indices
      });
    });
  };

  // check in check out handler
  const updateTimeHandler = (index, timeType, value) => {
    setClassDays((prevClassDays) => {
      return prevClassDays.map((item, i) => {
        if (i === index) {
          // Update the specific storeDay
          const updatedStoreDay = item.storeDay.map((storeDayItem) => ({
            ...storeDayItem,
            [timeType]: value, // Dynamically update check_in or check_out
          }));

          return { ...item, storeDay: updatedStoreDay };
        }
        return item;
      });
    });
  };

  // add new schdule
  const addAnotherClassDaysHandler = () => {
    setClassDays((prev) => {
      // item add max 7
      if (prev.length >= 7) {
        notifyHandler({
          key: Math.random(),
          message: "Action Blocked: Maximum Day Limit Reached",
          description:
            "Maximum number of class days reached. You can't add more class days.",
          placement: "topRight",
        });
        return prev;
      }

      const isDayLengthValid =
        prev.reduce(
          (total, classDay) =>
            total +
            classDay.storeDay.reduce(
              (storeTotal, store) => storeTotal + store.day.length,
              0
            ),
          0
        ) < 7;

      if (!isDayLengthValid) {
        notifyHandler({
          key: Math.random(),
          message: "Action Blocked: Maximum Day Limit Reached",
          description:
            "The total number of selected days across all schedules has reached the limit of 7. You can't add more days.",
          placement: "topRight",
        });

        return prev;
      }

      // Check if the last class day's day is empty
      const lastClassDay = prev[prev.length - 1];
      const isLastDayEmpty = lastClassDay.storeDay.every(
        (store) =>
          store.day.length !== 0 &&
          store.check_in !== "" &&
          store.check_out !== ""
      );
      if (!isLastDayEmpty) {
        notifyHandler({
          key: Math.random(),
          message: "Action Blocked: Incomplete Schedule",
          description:
            "The last class day contains incomplete or non-empty schedule details. Please ensure schedule details properly before adding a new class day.",
          placement: "topRight",
        });
        return prev;
      }

      return [
        ...prev,
        {
          id: prev.length + 1,
          storeDay: [
            {
              day: [],
              check_in: "",
              check_out: "",
            },
          ],
        },
      ];
    });
  };

  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);

  // create api slice
  const [createClass, { isLoading: createClassLoading, error }] =
    useCreateClassMutation();
  // error watcher
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error(
          error?.data?.message.includes("exists")
            ? "Class already exists. Please try a different one"
            : error.data.message
        );
      } else {
        message.error(error.data.message);
      }
    }
  }, [error]);

  //   redirect method for create when api request successfully then redirect verify page
  const redirectToAnotherPage = (id) => {
    router.replace(`/classes/lists/${id}`);
  };

  // data reset handler
  const resetData = () => {
    setGetAllClassTypes([]);
    setSelectedClassType(null);
    setClassGroups([]);
    setSelectedGroup(null);
    setTeachers([]);
    setSelectedTeacher(null);
    setEnableSupervisor(false);
    setSelectedSupervisor(null);
    setPeopleRoles([]);
    setSelectedPeopleRole(null);
    setSupervisor([
      {
        unKey: 1,
        people_type_id: null,
        role_id: null,
      },
    ]);
    setFormData({
      grade: "",
      mode: "",
    });
    setErrors(null);
    setClassDays([
      { id: 1, storeDay: [{ day: [], check_in: "", check_out: "" }] },
    ]);
  };

  const deleteDaysHandler = (index) => {
    if (classDays.length === 1) {
      message.warning("At least one schedule must remain.");
      return;
    }
    setClassDays((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * ===== Google Map Location Logic =====
   * 1. map states and radius state @const maplocation, @const mapAddress, @const radius
   * 2. handlers @func mapAddressHandler, @func radiusHandler
   * 3. initlize hook @func useGoogleLocation
   * 4.refs for map and single circle instance @ref mapRef, @ref circleRef
   * 5. google map instance handler @func handleMapLoad
   * 6. effect to create/update/remove single google.maps.Circle when marker/ radius/flag change @func useEffect
   * 7. cleanup on unmount @func useEffect
   */

  // 1. map states
  const [mapLocation, setMapLocation] = useState(null);
  const [mapAddress, setMapAddress] = useState(null);

  // 1. radius state (in meters) — local and passed to hook
  const [radius, setRadius] = useState(0);

  // 2. handlers
  const mapAddressHandler = (value) => setMapAddress(value);
  const radiusHandler = (type = "increament") => {
    if (type === "increament") {
      setRadius(radius + 1);
    } else {
      // Ensure radius doesn't go below 0
      if (radius > 0) {
        setRadius(radius - 1);
      }
    }
  };

  // 3. hook
  const {
    isLoaded: mapIsLoaded,
    markerPosition,
    mapCenter,
    currentRadius, // radius controlled by hook (synced from prop)
    hasUserSelectedLocation,
    onMapClick,
    onMarkerDragEnd,
    handleSearchInputChange,
    handleSearchInputFocus,
    handleSearchInputBlur,
    handlePredictionSelect,
    handleSimpleInputChange,
    handleRadiusChange,
    inputRef,
    predictions,
    showPredictions,
  } = useGoogleLocation({
    searchInputHandler: mapAddressHandler || (() => {}),
    locationHandler: setMapLocation || (() => {}),
    location: mapLocation,
    mapKey: siteConfig.MAP_KEY,
    mapStatus: Number(siteConfig.MAP_STATUS),
    radius: radius,
    radiusHandler: radiusHandler,
  });

  // 4. refs for map and single circle instance
  const mapRef = useRef(null);
  const circleRef = useRef(null);

  // 5. Capture google.maps.Map instance on load
  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  // 6. Effect: create/update/remove single google.maps.Circle when marker/ radius/flag change
  useEffect(() => {
    // ensure google maps is available and map instance exists
    if (!window.google || !mapRef.current) return;

    const hasValidMarker =
      markerPosition &&
      typeof markerPosition.lat === "number" &&
      typeof markerPosition.lng === "number";

    const positiveRadius = Number(currentRadius) > 0;

    if (hasValidMarker && positiveRadius && hasUserSelectedLocation) {
      // create circle if not exists
      if (!circleRef.current) {
        circleRef.current = new window.google.maps.Circle({
          strokeColor: "#7F669D",
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: "#7F669D",
          fillOpacity: 0.1,
          map: mapRef.current,
          center: markerPosition,
          radius: Number(currentRadius) || 0,
        });
      } else {
        // update existing
        circleRef.current.setCenter(markerPosition);
        circleRef.current.setRadius(Number(currentRadius) || 0);
        // ensure it's attached to map (in case map changed)
        circleRef.current.setMap(mapRef.current);
      }
    } else {
      // no circle should be shown — remove if exists
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    }
  }, [markerPosition, currentRadius, hasUserSelectedLocation]);

  // 7. Cleanup on unmount
  useEffect(() => {
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      mapRef.current = null;
    };
  }, []);

  /* ===== end of google map location logic ===== */

  // create handler
  const createClassApiHandler = async () => {
    const transformData = (data) => {
      const today = moment(); // local today
      const todayDay = today.format("dddd").toLowerCase();

      return data.flatMap(({ storeDay }) =>
        storeDay.flatMap(({ day, check_in, check_out }) =>
          day.map((d) => {
            const scheduleObj = {
              day: d.toLowerCase(),
              check_in: moment(check_in, ["h:mm A"])
                .local()
                .utc()
                .format("HH:mm:ss"),
              check_out: moment(check_out, ["h:mm A"])
                .local()
                .utc()
                .format("HH:mm:ss"),
            };

            // only attach date if this schedule is for today
            if (d.toLowerCase() === todayDay) {
              const localCheckInToday = moment(
                `${moment().format("YYYY-MM-DD")} ${check_in}`,
                "YYYY-MM-DD h:mm A"
              );
              const dateFromCheckInUTC = localCheckInToday
                .utc()
                .format("YYYY-MM-DD");
              const localCheckOutToday = moment(
                `${moment().format("YYYY-MM-DD")} ${check_out}`,
                "YYYY-MM-DD h:mm A"
              );
              const dateFromCheckOutUTC = localCheckOutToday
                .utc()
                .format("YYYY-MM-DD");

              scheduleObj.check_in_date = dateFromCheckInUTC;
              scheduleObj.check_out_date = dateFromCheckOutUTC;
            }

            return scheduleObj;
          })
        )
      );
    };
    const cleanObject = (obj) => {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        if (
          value !== false &&
          value !== "" &&
          value !== null && // Exclude null
          (!Array.isArray(value) || value.length > 0) &&
          value !== undefined
        ) {
          acc[key] = value; // Keep the key-value pair
        }
        return acc;
      }, {});
    };
    const dataSanitizer = {
      // class_type_org_id: selectedClassType
      //   ? Number(selectedClassType?.class_type_id?.id)
      //   : null,
      class_type_org_id: selectedClassType
        ? Number(selectedClassType?.id)
        : null,
      home_room_teacher_id: selectedTeacher
        ? Number(selectedTeacher?.id)
        : null,
      address: formData?.mode === "on-site" ? mapAddress : undefined,
      lat: formData?.mode === "on-site" ? mapLocation?.lat : undefined,
      long: formData?.mode === "on-site" ? mapLocation?.lng : undefined,
      radius: formData?.mode === "on-site" ? radius : undefined,
      class_name: formData?.grade,
      group_id: selectedGroup ? Number(selectedGroup?.id) : null,
      mode: formData?.mode,
      class_people:
        enableSupervisor && allSupervisor.length > 0
          ? allSupervisor
              .filter((item) => item.people_id && item.role_id)
              .map((item) => ({
                people_id: item.people_id,
                role_id: item.role_id,
                people_type: "supervisor",
              }))
          : null,
      // enableSupervisor && allSupervisor.length > 0
      //   ? allSupervisor.filter((item) => item.people_id && item.role_id)
      //   : null,
      class_days: transformData(classDays),
    };
    const data = cleanObject(dataSanitizer);

    // Construct validation data - only include map fields for on-site mode
    const validationData = {
      formData: formData,
      selectedTeacher: selectedTeacher,
      classDays: classDays,
    };

    // Only include map-related fields if mode is on-site
    if (formData?.mode === "on-site") {
      validationData.mapLocation = mapLocation;
      validationData.mapAddress = mapAddress;
      validationData.radius = radius;
    }

    try {
      await createClassSchema.validate(validationData, { abortEarly: false });
      setErrors(null);
      await createClass({
        data,
        redirect: redirectToAnotherPage,
        resetHandler: resetData,
      });
    } catch (validationErrors) {
      console.log(validationErrors);
      const allMessages = validationErrors.inner.map((error) => error.message);
      setErrors(allMessages);
      // Scroll to the top where errors are displayed
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <div>
        {/* Error List */}
        <div className="w-full ">
          {/* creat class */}
          <div className="card lg:w-[750px] w-[95%] max-w-[95%] lg:p-12 p-5 rounded-[12px] shadow-lg bg-white top-0 m-auto mt-8">
            <div className="flex justify-between items-center">
              <h2 className="lg:text-[30px] text-2xl font-bold">
                Create Class
              </h2>
              <p className="font-bold">Step {step}/2</p>
            </div>
            <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
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

            {step === 1 && (
              <>
                <p className="mb-6">
                  To create a class you have to select a class type first. There
                  are three types Hifz, Maktab and General. The method of
                  progress input in the teachers’ mobile app will change as per
                  class type.
                </p>
                <SelectBox
                  defaultValue={selectedClassType}
                  loading={fetchingClassTypes}
                  list={
                    getAllClassTypes &&
                    getAllClassTypes.length > 0 &&
                    // getAllClassTypes.map((item) => ({
                    //   ...item,
                    //   label: item?.class_type_id?.type_name,
                    //   value: item?.class_type_id?.type_name,
                    // }))
                    getAllClassTypes.map((item) => ({
                      ...item,
                      label: item?.class_type_id?.type_name,
                      value: item?.class_type_id?.type_name,
                    }))
                  }
                  isRequired
                  label="Class Type"
                  handler={selectClassTypeHandler}
                />
                <p className="mt-6">
                  If you select Maktab, you can assign all subjects to a single
                  teacher. Quran, Tajweed, Hadith, and Islamic Studies will be
                  automatically added as subjects, but you will have the option
                  to remove them if necessary.
                </p>

                <button
                  className="bg-black rounded-[8px] lg:px-[190px] px-[50px] py-3 text-white font-bold block mx-auto mt-10"
                  onClick={() => setStep(2)}
                >
                  Next Step
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <p className="font-bold mb-4">Class/Grade Details</p>

                <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
                  <SelectWithAdding
                    defaultValue={selectedGroup}
                    lists={
                      classGroups &&
                      classGroups.length > 0 &&
                      classGroups.map((item) => ({
                        ...item,
                        label: item?.name,
                        value: item?.name,
                      }))
                    }
                    label="Department"
                    loading={loadingClassGroups}
                    handler={selectedClassGroupsHandler}
                    addNewOptionHandler={addNewClassGroupsHandler}
                    isRequired
                  />
                  <InputWithLabel
                    label={"Class Name"}
                    placeholder={"Class Name"}
                    maxlength={30}
                    type={"text"}
                    name="grade"
                    value={formData?.grade}
                    handler={(e) => formDataHandler(e)}
                    isRequired
                  />
                  <SelectBox
                    defaultValue={selectedTeacher}
                    list={
                      teachers &&
                      teachers.length > 0 &&
                      teachers.map((item) => ({
                        ...item,
                        label: item?.first_name + " " + item?.last_name,
                        value: item?.first_name + " " + item?.last_name,
                      }))
                    }
                    label="Homeroom Teacher"
                    handler={selectedClassTeachersHandler}
                    isRequired
                  />
                  <SelectBox
                    defaultValue={
                      formData?.mode
                        ? {
                            label: formData?.mode,
                            value: formData?.mode,
                          }
                        : null
                    }
                    list={[
                      {
                        label: "online",
                        value: "online",
                      },
                      {
                        name: "on-site",
                        value: "on-site",
                      },
                    ]}
                    label="Online/Onsite"
                    handler={(value, option) =>
                      setFormData((prev) => ({ ...prev, mode: value }))
                    }
                    isRequired
                  />

                  <div
                    style={{
                      display: formData?.mode === "on-site" ? "block" : "none",
                    }}
                    className="col-span-full"
                  >
                    {/* Google Map */}
                    <div className="w-full grid sm:grid-cols-2 grid-cols-1 gap-8">
                      <div className="w-full h-[312px] order-2 sm:order-1">
                        {/* Google Map */}
                        {Number(siteConfig.MAP_STATUS) === 1 && mapCenter && (
                          <GoogleMap
                            mapContainerStyle={{
                              width: "100%",
                              height: "100%",
                            }}
                            center={mapCenter}
                            zoom={16}
                            onClick={onMapClick}
                            onLoad={handleMapLoad}
                            options={{
                              mapTypeControl: false,
                              streetViewControl: false,
                            }}
                          >
                            {markerPosition && (
                              <MarkerF
                                position={markerPosition}
                                draggable={true}
                                onDragEnd={onMarkerDragEnd}
                              />
                            )}
                          </GoogleMap>
                        )}
                      </div>

                      <div className="w-full order-1 sm:order-2">
                        {/* Address Input */}
                        {Number(siteConfig.MAP_STATUS) === 1 ? (
                          <div className="relative">
                            <div>
                              <InputWithLabel
                                ref={inputRef}
                                value={mapAddress}
                                handler={handleSearchInputChange}
                                onFocus={handleSearchInputFocus}
                                onBlur={handleSearchInputBlur}
                                label="Address"
                                placeholder="Your Address here"
                                isRequired
                                error={
                                  mapAddress &&
                                  Object.hasOwn(mapAddress, "address") &&
                                  mapAddress.address[0]
                                }
                              />
                              {mapAddress &&
                              Object.hasOwn(mapAddress, "address") &&
                              mapAddress.address[0] ? (
                                <span className="text-sm mt-1 text-qred">
                                  {mapAddress.address[0]}
                                </span>
                              ) : (
                                ""
                              )}
                            </div>

                            {showPredictions && predictions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {predictions.map((prediction) => (
                                  <div
                                    key={prediction.place_id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                                    onClick={() =>
                                      handlePredictionSelect(
                                        prediction.place_id
                                      )
                                    }
                                  >
                                    <div className="text-sm text-gray-900">
                                      {prediction.structured_formatting
                                        ?.main_text || prediction.description}
                                    </div>
                                    {prediction.structured_formatting
                                      ?.secondary_text && (
                                      <div className="text-xs text-gray-500">
                                        {
                                          prediction.structured_formatting
                                            .secondary_text
                                        }
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <InputWithLabel
                              value={mapAddress}
                              handler={handleSimpleInputChange}
                              label="Address"
                              placeholder="Your Address here"
                              isRequired
                              error={
                                mapAddress &&
                                Object.hasOwn(mapAddress, "address") &&
                                mapAddress.address[0]
                              }
                            />
                            {mapAddress &&
                            Object.hasOwn(mapAddress, "address") &&
                            mapAddress.address[0] ? (
                              <span className="text-sm mt-1 text-qred">
                                {mapAddress.address[0]}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        )}

                        {/* Radius Input */}
                        <div className="w-full mt-4">
                          <div className="w-full mt-4">
                            <label className="text-14 font-bold flex">
                              Radius (miters){" "}
                              <sup className="text-danger-700 text-sm">*</sup>{" "}
                            </label>

                            <div className="w-full flex justify-center items-center h-11 overflow-hidden mt-1">
                              <button
                                onClick={() => radiusHandler("decreament")}
                                type="button"
                                className="w-11 h-full bg-[#22252B] flex justify-center items-center rounded-l  "
                              >
                                <svg
                                  width="16"
                                  height="2"
                                  viewBox="0 0 16 2"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M15 0H1C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1C0 1.26522 0.105357 1.51957 0.292893 1.70711C0.48043 1.89464 0.734784 2 1 2H15C15.2652 2 15.5196 1.89464 15.7071 1.70711C15.8946 1.51957 16 1.26522 16 1C16 0.734784 15.8946 0.48043 15.7071 0.292893C15.5196 0.105357 15.2652 0 15 0Z"
                                    fill="white"
                                  />
                                </svg>
                              </button>
                              <div className="flex-1 h-full border border-[#798295] flex justify-center items-center">
                                {radius}m
                              </div>
                              <button
                                type="button"
                                className="w-11 h-full bg-[#22252B] flex justify-center items-center rounded-r"
                                onClick={() => radiusHandler("increament")}
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
                                    fill="white"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className=" line h-[1px] my-6 bg-[#E4E6EA]"></div>

                <div className="flex flex-col gap-6">
                  {classDays.map((item, i) => (
                    <div key={i} className="time">
                      <div className="flex flex-wrap justify-start items-center gap-2">
                        <span className="text-sm font-bold">Select Day</span>
                        {daysOfWeekFull.map((day, j) => {
                          // Check if the day is already selected in other `classDays`
                          const isDayDisabled = classDays.some(
                            (classDay, classDayIndex) =>
                              classDayIndex !== i && // Exclude the current classDay
                              classDay.storeDay.some((storeDay) =>
                                storeDay.day.includes(day)
                              )
                          );

                          return (
                            <div className="day" key={j}>
                              <input
                                type="checkbox"
                                className="hidden"
                                name=""
                                id={day + i}
                                disabled={isDayDisabled} // Disable the checkbox if the day is already selected
                              />
                              <label
                                onClick={() => {
                                  if (!isDayDisabled)
                                    toggleClassDaysHandler(day, i); // Prevent click if disabled
                                }}
                                htmlFor={day + i}
                                className={`text-sm capitalize px-2 py-1 rounded-md inline-flex ${
                                  isDayDisabled
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                              >
                                {day.slice(0, 2)}
                              </label>
                            </div>
                          );
                        })}
                      </div>

                      {/* <div className="grid lg:grid-cols-2 grid-cols-1 gap-y-4 mt-4 gap-x-2">  */}
                      <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-4 gap-y-4 mt-4">
                        <div>
                          <InputTimePicker
                            label="Clock in"
                            handler={(value) =>
                              updateTimeHandler(i, "check_in", value)
                            }
                            isRequired
                          />
                        </div>
                        <div className="flex items-center">
                          <div className="w-[290px] lg:w-[290px] sm:w-full">
                            <InputTimePicker
                              isRequired
                              label="Clock out"
                              handler={(value) =>
                                updateTimeHandler(i, "check_out", value)
                              }
                            />{" "}
                          </div>
                          <button
                            className="pt-5 pl-2"
                            onClick={() => deleteDaysHandler(i)}
                          >
                            <DeleteBtnSvg />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="flex justify-start mt-4 items-center gap-2"
                >
                  <img
                    src="/assets/img/icons/plus-square.svg"
                    className="plus"
                    alt=""
                  />
                  <span
                    onClick={addAnotherClassDaysHandler}
                    className="text-sm font-bold"
                  >
                    Add another time
                  </span>
                </button>

                <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

                {/* add supervisor */}
                <div className="flex justify-start items-center gap-8">
                  <p className="text-sm font-bold">Add Supervisor</p>
                  {/* switch */}
                  <Switcher
                    initialValue={enableSupervisor}
                    handler={setEnableSupervisor}
                  />
                </div>

                <p>
                  A supervisor will be able to monitor the activities of this
                  class. You also have the option to add multiple supervisors to
                  ensure comprehensive oversight and support.
                </p>
                {enableSupervisor && (
                  <>
                    {allSupervisor.map((item, i) => (
                      <div
                        key={i}
                        className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4 mt-4"
                      >
                        <SelectBox
                          defaultValue={selectedSupervisor}
                          list={
                            teachers &&
                            teachers.length > 0 &&
                            teachers.map((item) => ({
                              ...item,
                              label: item?.first_name + " " + item?.last_name,
                              value: item?.first_name + " " + item?.last_name,
                            }))
                          }
                          label="Select Supervisor"
                          handler={(value, option) =>
                            updateSupervisor(item.unKey, option)
                          }
                        />
                        <SelectBox
                          defaultValue={selectedPeopleRole}
                          list={
                            peopleRoles &&
                            peopleRoles.length > 0 &&
                            peopleRoles.map((item) => ({
                              ...item,
                              label: item?.role_name,
                              value: item?.role_name,
                            }))
                          }
                          label="Supervisor Role"
                          handler={(value, option) =>
                            updateSupervisorRole(item.unKey, option)
                          }
                        />
                      </div>
                    ))}

                    <button
                      onClick={addNewSupervisorHandler}
                      type="button"
                      className="flex justify-start mt-4 items-center gap-2"
                    >
                      <img
                        src="/assets/img/icons/plus-square.svg"
                        className="plus"
                        alt=""
                      />
                      <span className="text-sm font-bold">
                        Add another supervisor
                      </span>
                    </button>
                  </>
                )}

                <div className="text-center md:w-[60%] mx-auto">
                  {/* <button className="bg-white border border-black rounded-[8px] py-3 text-black font-bold block mx-auto mt-10 w-full">
                    Create Class
                  </button> */}
                  <button
                    onClick={createClassApiHandler}
                    className="bg-black border border-black rounded-[8px] py-3 text-white font-bold flex justify-center mx-auto mt-4 w-full"
                  >
                    {createClassLoading ? (
                      <SvgLoader className="text-white" />
                    ) : (
                      " Create new Class"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewClass;
