import InputTimePicker from "@/components/common/Inputs/Input/InputTimePicker";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import { message, notification } from "antd";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import {
  useGetGroupsQuery,
  useDeleteClassDayScheduleMutation,
} from "@/store/features/class-management/apiSlice";
import {
  useGetTeachersQuery,
  useGetTeachersWithExtraDataQuery,
} from "@/store/features/teacher-management/apiSlice";
import { daysOfWeekFull } from "@/constants/daysOfFullWeek";
import { DeleteBtnSvg } from "@/components/helpers/storeAllSvgs";

import siteConfig from "@/config";
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

function ClassGrade({
  oldDataSets,
  updateHandler,
  classId,
  createClassLoading,
}) {
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

  // department/gropus
  const [classGroups, setClassGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const selectedClassGroupsHandler = (value, option) => {
    setSelectedGroup(option);
  };
  const { data: fetchClassGroups, isFetching: loadingClassGroups } =
    useGetGroupsQuery({ page: 1, limit: 999 });
  useEffect(() => {
    if (!loadingClassGroups && fetchClassGroups) {
      setClassGroups(fetchClassGroups?.data);
    }
  }, [fetchClassGroups, loadingClassGroups]);

  // teachers
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const selectedClassTeachersHandler = (value, option) => {
    setSelectedTeacher(option);
  };

  const limit = 1000;
  const pageRef = useRef(1);

  const { data: fetchTeachers, isFetching: loadingTeachers } =
    useGetTeachersWithExtraDataQuery({
      page: pageRef.current,
      limit,
    });

  // const { data: fetchTeachers, isFetching: loadingTeachers } =
  //   useGetTeachersQuery();

  useEffect(() => {
    if (!loadingTeachers && fetchTeachers) {
      setTeachers(fetchTeachers?.data);
      const findOldData =
        fetchTeachers?.data.length > 0 &&
        fetchTeachers?.data.find(
          (item) => item.id === oldDataSets?.home_room_teacher_id?.id
        );

      if (findOldData) {
        setSelectedTeacher({
          ...findOldData,
          label: findOldData?.first_name + " " + findOldData?.last_name,
          value: findOldData?.first_name + " " + findOldData?.last_name,
        });
      }
    }
  }, [fetchTeachers, loadingTeachers]);

  //  class schedules
  const [classDays, setClassDays] = useState([
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
      return prevClassDays.map((item, i) => {
        if (i === index) {
          const updatedStoreDay = item.storeDay.map((storeDayItem) => {
            const dayExists = storeDayItem.day.includes(day.toLowerCase());
            return {
              ...storeDayItem,
              day: dayExists
                ? storeDayItem.day.filter((d) => d !== day.toLowerCase())
                : [...storeDayItem.day, day.toLowerCase()],
            };
          });

          return { ...item, storeDay: updatedStoreDay };
        }
        return item;
      });
    });
  };

  // check in check out handler
  const updateTimeHandler = (index, timeType, value) => {
    setClassDays((prevClassDays) => {
      return prevClassDays.map((item, i) => {
        if (i === index) {
          const updatedStoreDay = item.storeDay.map((storeDayItem) => ({
            ...storeDayItem,
            [timeType]: value,
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
      const isLastDayEmpty = lastClassDay?.storeDay?.every(
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

  useEffect(() => {
    if (oldDataSets) {
      setFormData({
        grade: oldDataSets?.data.class_name || "",
        mode: oldDataSets?.data.mode || "",
      });

      // Handle teacher selection
      if (oldDataSets?.data?.home_room_teacher_id) {
        setSelectedTeacher(oldDataSets?.data.home_room_teacher_id);
      }

      // Handle group selection - ADD THIS SECTION
      if (oldDataSets?.data?.group_id) {
        setSelectedGroup({
          ...oldDataSets?.data.group_id,
          label: oldDataSets?.data.group_id.name,
          value: oldDataSets?.data.group_id.name,
        });
      }

      // Handle class days data - convert UTC to local time for display
      const days = oldDataSets?.data?.class_days || [];

      if (days && days.length > 0) {
        // Group by check_in and check_out times
        const grouped = days.reduce((acc, item) => {
          const key = `${item.check_in}-${item.check_out}`;
          if (!acc[key]) {
            acc[key] = {
              days: [],
              uids: [],
              check_in: moment
                .utc(item.check_in, "HH:mm:ss")
                .local()
                .format("hh:mm A"),
              check_out: moment
                .utc(item.check_out, "HH:mm:ss")
                .local()
                .format("hh:mm A"),
            };
          }
          acc[key].days.push(item.day.toLowerCase());
          acc[key].uids.push(item.id);
          return acc;
        }, {});

        // Convert to the required format
        const result = Object.values(grouped).map((group, index) => ({
          id: index + 1,
          storeDay: [
            {
              day: group.days,
              uids: group.uids,
              check_in: group.check_in,
              check_out: group.check_out,
            },
          ],
        }));

        setClassDays(result);
      }

      // Handle map location and address
      if (oldDataSets?.data?.address) {
        setMapAddress(oldDataSets?.data?.address);
      }
      if (oldDataSets?.data?.lat) {
        setMapLocation((prev) => ({
          ...prev,
          lat: Number(oldDataSets?.data?.lat),
        }));
      }
      if (oldDataSets?.data?.long) {
        setMapLocation((prev) => ({
          ...prev,
          lng: Number(oldDataSets?.data?.long),
        }));
      }
      if (oldDataSets?.data?.radius) {
        setRadius(oldDataSets?.data?.radius);
      }
    }
  }, [oldDataSets]);

  // create handler
  const updateClassApiHandler = async () => {
    const transformData = (data) => {
      const today = moment(); // local today
      const todayDay = today.format("dddd").toLowerCase();

      return data.flatMap(({ storeDay }) =>
        storeDay.flatMap(({ day, check_in, check_out, uids }) =>
          day.map((d, idx) => {
            const localCheckIn = moment(check_in, ["h:mm A"]);
            const localCheckOut = moment(check_out, ["h:mm A"]);

            const formattedCheckIn = localCheckIn.utc().format("HH:mm:ss");
            const formattedCheckOut = localCheckOut.utc().format("HH:mm:ss");

            const scheduleObj = {
              id: uids?.[idx] ?? undefined,
              day: d.toLowerCase(),
              check_in: formattedCheckIn,
              check_out: formattedCheckOut,
            };

            if (d.toLowerCase() === todayDay) {
              const localCheckInToday = moment(
                `${moment().format("YYYY-MM-DD")} ${check_in}`,
                "YYYY-MM-DD h:mm A"
              );
              const localCheckOutToday = moment(
                `${moment().format("YYYY-MM-DD")} ${check_out}`,
                "YYYY-MM-DD h:mm A"
              );
              scheduleObj.check_in_date = localCheckInToday
                .utc()
                .format("YYYY-MM-DD");
              scheduleObj.check_out_date = localCheckOutToday
                .utc()
                .format("YYYY-MM-DD");
            }

            return scheduleObj;
          })
        )
      );
    };

    // Create an object with only the changed fields
    const changedFields = {};

    // Check if grade has changed
    if (formData.grade !== oldDataSets?.data.class_name) {
      changedFields.class_name = formData.grade;
    }

    // Check if mode has changed
    if (formData.mode !== oldDataSets?.data.mode) {
      changedFields.mode = formData.mode;
    }

    // Check if teacher has changed
    const oldTeacherId = oldDataSets?.data?.home_room_teacher_id?.id;
    const newTeacherId = selectedTeacher?.id;
    if (newTeacherId !== oldTeacherId) {
      changedFields.home_room_teacher_id = Number(newTeacherId);
    }

    // Check if group has changed
    const oldGroupId = oldDataSets?.data?.group_id?.id;
    const newGroupId = selectedGroup?.id;
    if (newGroupId !== oldGroupId) {
      changedFields.group_id = Number(newGroupId);
    }

    // Build new/old class day lists
    const oldClassDays = oldDataSets?.data?.class_days || [];
    const newClassDays = transformData(classDays);

    // Normalize old class days
    const normalizedOldClassDays = oldClassDays?.map((day) => ({
      id: day.id,
      day: day.day?.toLowerCase(),
      check_in: moment.utc(day.check_in, "HH:mm:ss").format("HH:mm:ss"),
      check_out: moment.utc(day.check_out, "HH:mm:ss").format("HH:mm:ss"),
    }));

    // Normalize new class days
    const normalizedNewClassDays = newClassDays?.map((day) => ({
      day: day.day?.toLowerCase(),
      check_in: moment.utc(day.check_in, "HH:mm:ss").format("HH:mm:ss"),
      check_out: moment.utc(day.check_out, "HH:mm:ss").format("HH:mm:ss"),
    }));

    // Prepare sets for comparison
    const newKeySet = new Set(
      normalizedNewClassDays?.map(
        (d) => `${d.day}-${d.check_in}-${d.check_out}`
      )
    );

    // Find deletions (present before, now missing)
    const todayDay = moment().format("dddd").toLowerCase();
    const toDelete = normalizedOldClassDays
      .filter(
        (od) => !newKeySet.has(`${od.day}-${od.check_in}-${od.check_out}`)
      )
      .map((od) => {
        const deleteObj = { class_day_id: od.id };
        if (od.day === todayDay) {
          deleteObj.date = moment().utc().format("YYYY-MM-DD");
        }
        return deleteObj;
      });

    // Compare normalized class days to decide if updates are needed
    const hasClassDaysChanged =
      JSON.stringify(normalizedOldClassDays.map(({ id, ...rest }) => rest)) !==
      JSON.stringify(normalizedNewClassDays);

    if (hasClassDaysChanged) {
      changedFields.class_days = newClassDays;
    }

    // Map-related fields for on-site
    if (formData?.mode === "on-site") {
      changedFields.address = mapAddress;
      changedFields.lat = mapLocation?.lat;
      changedFields.long = mapLocation?.lng;
      changedFields.radius = radius;
    }

    // Add the id if there are actual changes
    if (Object.keys(changedFields).length > 0) {
      changedFields.id = Number(classId);
    }

    // If neither deletions nor changes, do nothing
    if (Object.keys(changedFields).length === 0 && toDelete.length === 0) {
      notifyHandler({
        key: Math.random(),
        message: "No Changes Detected",
        description:
          "No fields have been modified. Please make changes before saving.",
        placement: "topRight",
      });
      return;
    }

    try {
      // First delete unselected old schedules (if any)
      if (toDelete.length > 0) {
        await deleteClassDaySchedule({
          data: { class_days: toDelete },
          classId: classId,
        });
      }

      // Then apply updates (if any)
      if (Object.keys(changedFields).length > 0) {
        await updateHandler({
          data: changedFields,
        });
      }
    } catch (error) {
      console.error("Error updating class days:", error);
    }
  };

  const getDepartmentName = oldDataSets?.data?.group_id?.name;

  const getHomeroomTeacherName = oldDataSets?.data?.home_room_teacher_id;

  const HomeroomTeacherName =
    oldDataSets?.data?.home_room_teacher_id.first_name +
    " " +
    oldDataSets?.data?.home_room_teacher_id.last_name;

  // Add the delete mutation hook
  const [deleteClassDaySchedule, { isLoading: deleteLoading }] =
    useDeleteClassDayScheduleMutation();

  // Add delete handler for class days
  const deleteClassDaysHandler = async (index) => {
    if (classDays.length <= 1) {
      notifyHandler({
        key: Math.random(),
        message: "Action Blocked: At least one schedule required",
        description:
          "You cannot delete all schedules. At least one must remain.",
        placement: "topRight",
      });
      return;
    }

    const classDayToDelete = classDays[index];
    const classDayIds = [];

    if (oldDataSets?.data?.class_days) {
      classDayToDelete.storeDay.forEach((storeDay) => {
        // Convert local time to UTC for comparison
        const utcIn = moment(storeDay.check_in, ["h:mm A"])
          .utc()
          .format("HH:mm:ss");
        const utcOut = moment(storeDay.check_out, ["h:mm A"])
          .utc()
          .format("HH:mm:ss");

        storeDay?.day?.forEach((day) => {
          const existingClassDay = oldDataSets?.data.class_days?.find(
            (cd) =>
              cd.day?.toLowerCase() === day?.toLowerCase() &&
              cd.check_in === utcIn &&
              cd.check_out === utcOut
          );

          if (existingClassDay) {
            const todayDay = moment().format("dddd").toLowerCase();

            const deleteObj = {
              class_day_id: existingClassDay.id,
            };

            if (day?.toLowerCase() === todayDay) {
              deleteObj.date = moment(storeDay.check_in, ["h:mm A"])
                .utc()
                .format("YYYY-MM-DD");
            }

            classDayIds.push(deleteObj);
          }
        });
      });
    }

    if (classDayIds.length > 0) {
      const payload = {
        class_days: classDayIds,
      };

      try {
        await deleteClassDaySchedule({
          data: payload,
          classId: classId,
          onSuccess: () => {
            setClassDays((prev) => prev.filter((_, i) => i !== index));
          },
        });
      } catch (error) {
        console.error("Error deleting class days:", error);
      }
    } else {
      // If nothing to delete in backend, just remove locally
      setClassDays((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="mb-10">
          <div className="grid items-center justify-center lg:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4">
            <SelectBox
              defaultValue={selectedGroup}
              list={
                classGroups &&
                classGroups.length > 0 &&
                classGroups.map((item) => ({
                  ...item,
                  label: item?.name,
                  value: item?.name,
                }))
              }
              labelName="Department"
              DefaultItem={
                getDepartmentName ? `${getDepartmentName}` : "Select Department"
              }
              loading={loadingClassGroups}
              handler={selectedClassGroupsHandler}
            />
            <InputWithLabel
              label={"Grade"}
              placeholder={"Grade"}
              maxlength={30}
              type={"text"}
              name="grade"
              value={formData?.grade}
              handler={(e) => formDataHandler(e)}
              isRequired
            />
            <SelectBox
              defaultValue={
                HomeroomTeacherName ? HomeroomTeacherName : "Homeroom Teacher"
              }
              list={
                teachers &&
                teachers.length > 0 &&
                teachers.map((item) => ({
                  ...item,
                  label: item?.first_name + " " + item?.last_name,
                  value: item?.first_name + " " + item?.last_name,
                }))
              }
              labelName="Homeroom Teacher"
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
              label="Online/On-site"
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
              <div className="w-full grid grid-cols-1 gap-4">
                <div className="w-full grid grid-cols-12 gap-4">
                  {/* Address Input */}
                  {Number(siteConfig.MAP_STATUS) === 1 ? (
                    <div className="relative sm:col-span-8 col-span-full">
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
                                handlePredictionSelect(prediction.place_id)
                              }
                            >
                              <div className="text-sm text-gray-900">
                                {prediction.structured_formatting?.main_text ||
                                  prediction.description}
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
                    <div className="sm:col-span-8 col-span-full">
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
                  <div className="w-full sm:col-span-4 col-span-full">
                    <div className="w-full">
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
                <div className="w-full h-[312px]">
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
              </div>
            </div>
          </div>

          <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
          <p className="font-bold text-16 ">
            Class Day & Check In/Out<span className="text-red-600"> *</span>
          </p>
          <div className="flex flex-col gap-3">
            {classDays?.map((item, i) => {
              return (
                <div key={i} className="time w-full">
                  <div className="flex justify-start gap-2 my-6">
                    <span className="text-sm font-bold text-[#2b2422]">
                      Class Day{" "}
                    </span>
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
                            checked={item?.storeDay[0].day?.includes(day)}
                            type="checkbox"
                            className="hidden"
                            name=""
                            id={day + i}
                            disabled={isDayDisabled} // Disable the checkbox if the day is already selected
                          />
                          <label
                            onClick={() => {
                              if (!isDayDisabled)
                                toggleClassDaysHandler(day, i);
                            }}
                            htmlFor={day + i}
                            //   className={`text-sm px-2 py-1 rounded-md inline-flex capitalize
                            //    ${
                            //      item?.storeDay[0].day?.includes(day) &&
                            //      "bg-slate-900 text-white"
                            //      //  "bg-slate-300 text-white"
                            //    }
                            //  ${
                            //    isDayDisabled
                            //      ? "cursor-not-allowed opacity-30"
                            //      : ""
                            //  }`}
                            className={`text-sm capitalize px-2 py-1 rounded-md inline-flex ${
                              isDayDisabled
                                ? "cursor-not-allowed opacity-30"
                                : ""
                            }`}
                          >
                            {day.slice(0, 2)}
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-y-4 mt-4 gap-x-2">
                    <div className="">
                      <InputTimePicker
                        defaultValue={item?.storeDay[0].check_in}
                        label="Clock in"
                        handler={(value) =>
                          updateTimeHandler(i, "check_in", value)
                        }
                        isRequired
                      />
                    </div>
                    <div className="flex items-center">
                      <InputTimePicker
                        defaultValue={item?.storeDay[0].check_out}
                        isRequired
                        label="Clock out"
                        className="w-full"
                        handler={(value) =>
                          updateTimeHandler(i, "check_out", value)
                        }
                      />
                      <button
                        className="pt-5 pl-2"
                        onClick={() => deleteClassDaysHandler(i)}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <SvgLoader className="text-gray-500" />
                        ) : (
                          <DeleteBtnSvg />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addAnotherClassDaysHandler}
            className="flex justify-start mt-4 items-center gap-2"
          >
            <img
              src="/assets/img/icons/plus-square.svg"
              className="plus"
              alt=""
            />
            <span className="text-sm font-bold">Add another time</span>
          </button>
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <button
          onClick={updateClassApiHandler}
          type="button"
          className="btn bg-[#22252B]  py-[13px] px-[24px] font-bold text-lg rounded-[8px] text-white"
        >
          {createClassLoading ? (
            <SvgLoader className="text-white" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}

export default ClassGrade;
