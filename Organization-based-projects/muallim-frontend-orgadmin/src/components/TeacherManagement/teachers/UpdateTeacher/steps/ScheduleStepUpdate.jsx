import InputTimePicker from "@/components/common/Inputs/Input/InputTimePicker";
import React, { useState, useRef, useEffect } from "react";
import { message, notification } from "antd";
import {
  useDeleteEmployeeScheduleMutation,
  useSubmitTeacherFormMutation,
  useTeacherProfileUpdateMutation,
  classManagementApi,
} from "@/store/features/teacher-management/apiSlice";
import { UpdateTeacherStepSixSchema } from "@/utilities/validationRules/schemas/updateTeacherSchema";
import moment from "moment";
import cleanObject from "@/components/helpers/cleanObject";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { daysOfWeekFull } from "@/constants/daysOfFullWeek";
import { useDispatch } from "react-redux";

function ScheduleStepUpdate({ prevData, modalOpen }) {
  const notifyHandler = (option) => {
    notification.open(option);
  };
  // check in time / check out time
  //   Employees schedules
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

  const [deleteEmployeeSchedule] = useDeleteEmployeeScheduleMutation();
  // remove class day
  // const removeClassDayHandler = (index, uids = null) => {
  //   if (classDays.length === 1) {
  //     message.warning("At least one schedule must remain.");
  //     return;
  //   }

  //   setClassDays((prev) => {
  //     const updatedClassDays = [...prev];
  //     // instead of removing immediately, mark as deleted
  //     updatedClassDays[index] = {
  //       ...updatedClassDays[index],
  //       markedForDelete: true,
  //     };
  //     return updatedClassDays;
  //   });
  // };

  const removeClassDayHandler = async (index, uids = null) => {
    if (classDays.length === 1) {
      message.warning("At least one schedule must remain.");
      return;
    }

    const scheduleToDelete = classDays[index];

    // Flatten all days in the schedule
    const allDays = scheduleToDelete.storeDay.flatMap((store) =>
      store.day.map((d) => d.toLowerCase())
    );

    // Current day in local time
    const today = moment().format("dddd").toLowerCase();

    // Check if today's day exists
    const includesToday = allDays.includes(today);

    let query = "";

    if (includesToday) {
      // Use the schedule's check-in time to calculate UTC date
      const checkInTime = scheduleToDelete.storeDay[0]?.check_in; // e.g. "04:00 AM"
      if (checkInTime) {
        const utcDate = moment(
          `${moment().format("YYYY-MM-DD")} ${checkInTime}`,
          "YYYY-MM-DD h:mm A"
        )
          .utc()
          .format("YYYY-MM-DD");

        query = `?date=${utcDate}`;
      }
    }

    // Only send query if includesToday, otherwise don't attach query
    if (uids && uids.length) {
      await Promise.all(
        uids.map((uid) =>
          deleteEmployeeSchedule({ id: uid, ...(query && { query }) })
        )
      );
    }

    // Remove from local state
    setClassDays((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleClassDaysHandler = (day, index) => {
    setModifiedSchedules((prev) => new Set(prev).add(index));

    setClassDays((prevClassDays) => {
      // Map through the previous state to update immutably
      return prevClassDays?.map((item, i) => {
        if (i === index) {
          // Update the `storeDay` array for the specific index
          const updatedStoreDay = item.storeDay?.map((storeDayItem) => {
            const dayExists = storeDayItem?.day?.includes(day);
            return {
              ...storeDayItem,
              day: dayExists
                ? storeDayItem?.day?.filter((d) => d !== day) // Remove the day
                : [...storeDayItem?.day, day], // Add the day
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
    setModifiedSchedules((prev) => new Set(prev).add(index));

    setClassDays((prevClassDays) => {
      return prevClassDays?.map((item, i) => {
        if (i === index) {
          // Update the specific storeDay
          const updatedStoreDay = item?.storeDay?.map((storeDayItem) => ({
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
      // Check if the last class day's day is empty
      const lastClassDay = prev[prev?.length - 1];
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
          isNew: true, // Mark as new schedule
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
  // class days validator
  const classDaysValidator = (schdules) => {
    const daysArr = schdules; // Assuming classDays is your array

    // Loop through each item in the classDays array
    for (let i = 0; i < daysArr.length; i++) {
      const itemA = daysArr[i];
      let conflictFound = false; // Flag to track if conflict was found for itemA
      let conflictMessage = "";

      const daysA = itemA.storeDay || [];

      // Compare itemA with every other item in the array (itemB)
      for (let j = 0; j < daysArr.length; j++) {
        if (i === j) continue; // Skip comparing itemA with itself

        const itemB = daysArr[j];
        const daysB = itemB.storeDay || [];

        // Loop through each day in itemA's storeDay
        for (const dayA of daysA) {
          // Loop through each day in itemB's storeDay
          for (const dayB of daysB) {
            // Compare days (case-insensitive)
            if (
              Array.isArray(dayA.day) &&
              Array.isArray(dayB.day) &&
              dayA.day.some(
                (dA) => dA.toLowerCase() === dayB.day[0].toLowerCase()
              ) &&
              dayA.check_in === dayB.check_in
            ) {
              conflictMessage = `${dayA.day[0]} has the same check-in time (${dayA.check_in}) as another schedule.`;
              conflictFound = true; // Mark conflict as found
              break;
            }
          }
          if (conflictFound) break; // Exit early if conflict found
        }
        if (conflictFound) break; // Exit early if conflict found
      }

      // If no conflict was found for this item, log as passed
      if (!conflictFound) {
        return daysArr;
      } else {
        setErrors(() => [conflictMessage]);
        return;
      }
    }
  };
  /* 
        Find Previous data and set data into available variable
    */

  useEffect(() => {
    if (prevData) {
      const days = prevData?.classDays;

      if (days && days.length) {
        // group schedules
        const grouped = days.reduce((acc, item) => {
          const key = `${item?.check_in}-${item?.check_out}`;
          if (!acc[key]) {
            acc[key] = {
              days: [],
              uids: [],
              check_in: item?.check_in,
              check_out: item?.check_out,
            };
          }
          acc[key].days.push(item.day);
          acc[key].uids.push(item.id);
          return acc;
        }, {});

        const result = Object.values(grouped)?.map((group, index) => ({
          id: index + 1,
          storeDay: [
            {
              day: group?.days,
              uids: group?.uids,
              check_in: moment
                .utc(group?.check_in, "HH:mm:ss")
                .local()
                .format("hh:mm A"),
              check_out: moment
                .utc(group?.check_out, "HH:mm:ss")
                .local()
                .format("hh:mm A"),
            },
          ],
        }));

        setClassDays(result);
      } else {
        // No schedules → show one empty row
        setClassDays([
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
      }
    }
  }, [prevData]);

  // errors
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);
  // step handler

  const redirectToAnotherPage = () => {};
  const resetCookie = () => {};
  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();
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
  useEffect(() => {
    if (errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [errors]);

  // Add state to track modified schedules
  const [modifiedSchedules, setModifiedSchedules] = useState(new Set());

  const dispatch = useDispatch();

  // const stepHandler = async () => {
  //   try {
  //     if (classDaysValidator(classDays) === undefined) return;

  //     await UpdateTeacherStepSixSchema.validate(
  //       { classDays },
  //       { abortEarly: false }
  //     );

  //     // delete marked schedules
  //     const deletePromises = classDays
  //       .filter(
  //         (item) => item.markedForDelete && item?.storeDay[0]?.uids?.length
  //       )
  //       .flatMap((item) =>
  //         item.storeDay[0].uids.map((uid) =>
  //           deleteEmployeeSchedule({ id: uid })
  //         )
  //       );

  //     await Promise.all(deletePromises);

  //     // transform and save only modified schedules
  //     const transformData = (data) => {
  //       const today = moment(); // local today
  //       const todayDay = today.format("dddd").toLowerCase();

  //       const schedules = data
  //         ?.filter(
  //           (item, index) =>
  //             !item.markedForDelete &&
  //             (modifiedSchedules.has(index) || item.isNew)
  //         )
  //         .flatMap(({ storeDay }) =>
  //           storeDay?.flatMap(({ day, check_in, check_out, uids }) =>
  //             day?.map((d, idx) => {
  //               const localCheckIn = moment(check_in, ["h:mm A"]);
  //               const localCheckOut = moment(check_out, ["h:mm A"]);

  //               const formattedCheckIn = localCheckIn.utc().format("HH:mm:ss");
  //               const formattedCheckOut = localCheckOut
  //                 .utc()
  //                 .format("HH:mm:ss");

  //               const scheduleObj = {
  //                 // use uid if exists (for existing schedules), undefined for new ones
  //                 id: uids?.[idx] ?? undefined,
  //                 day: d.toLowerCase(),
  //                 check_in: formattedCheckIn,
  //                 check_out: formattedCheckOut,
  //               };

  //               // only attach date if this schedule is for today
  //               if (d.toLowerCase() === todayDay) {
  //                 const localCheckInToday = moment(
  //                   `${moment().format("YYYY-MM-DD")} ${check_in}`,
  //                   "YYYY-MM-DD h:mm A"
  //                 );
  //                 const dateFromCheckInUTC = localCheckInToday
  //                   .utc()
  //                   .format("YYYY-MM-DD");

  //                 const localCheckOutToday = moment(
  //                   `${moment().format("YYYY-MM-DD")} ${check_out}`,
  //                   "YYYY-MM-DD h:mm A"
  //                 );
  //                 const dateFromCheckOutUTC = localCheckOutToday
  //                   .utc()
  //                   .format("YYYY-MM-DD");

  //                 scheduleObj.check_in_date = dateFromCheckInUTC;
  //                 scheduleObj.check_out_date = dateFromCheckOutUTC;
  //               }

  //               return scheduleObj;
  //             })
  //           )
  //         );

  //       const uniqueSchedules = schedules.filter(
  //         (s, i, self) =>
  //           i ===
  //           self.findIndex(
  //             (t) =>
  //               t.day === s.day &&
  //               t.check_in === s.check_in &&
  //               t.check_out === s.check_out
  //           )
  //       );

  //       return uniqueSchedules;
  //     };

  //     const readyData = {
  //       employee_schedules: transformData(classDays),
  //     };

  //     await teacherProfileUpdate({
  //       id: prevData?.teacherId,
  //       data: cleanObject(readyData),
  //       redirectAnotherPage: redirectToAnotherPage,
  //       resetCookie,
  //     });

  //     // Invalidate the teacher details query to refresh the data
  //     dispatch(
  //       classManagementApi.util.invalidateTags([
  //         { type: "Teachers", id: prevData?.teacherId },
  //       ])
  //     );

  //     modalOpen(true);
  //   } catch (err) {
  //     console.log(err);
  //     const allMessages = err.inner?.map((error, i) => error.message);
  //     setErrors(allMessages);
  //   }
  // };

  const stepHandler = async () => {
    try {
      if (classDaysValidator(classDays) === undefined) return;

      await UpdateTeacherStepSixSchema.validate(
        { classDays },
        { abortEarly: false }
      );

      // delete marked schedules
      const deletePromises = classDays
        .filter(
          (item) => item.markedForDelete && item?.storeDay[0]?.uids?.length
        )
        .flatMap((item) =>
          item.storeDay[0].uids.map((uid) =>
            deleteEmployeeSchedule({ id: uid })
          )
        );

      await Promise.all(deletePromises);

      // ===== detect unselected day/time entries and delete them =====
      // Build OLD normalized list from server data
      const oldEntries =
        (prevData?.classDays || []).map((d) => ({
          id: d.id,
          day: d.day?.toLowerCase(),
          check_in: moment.utc(d.check_in, "HH:mm:ss").format("HH:mm:ss"),
          check_out: moment.utc(d.check_out, "HH:mm:ss").format("HH:mm:ss"),
        })) || [];

      // Build NEW normalized list from current UI state
      const newTransformed = classDays.flatMap(({ storeDay }) =>
        storeDay.flatMap(({ day, check_in, check_out, uids }) =>
          day.map((d) => {
            const ci = moment(check_in, ["h:mm A"]).utc().format("HH:mm:ss");
            const co = moment(check_out, ["h:mm A"]).utc().format("HH:mm:ss");
            return {
              day: d.toLowerCase(),
              check_in: ci,
              check_out: co,
            };
          })
        )
      );

      // Map of key -> local check_in string to compute ?date= for today's deletions
      const localCheckInByKey = {};
      classDays.forEach(({ storeDay }) => {
        storeDay.forEach(({ day, check_in, check_out }) => {
          const ciUTC = moment(check_in, ["h:mm A"]).utc().format("HH:mm:ss");
          const coUTC = moment(check_out, ["h:mm A"]).utc().format("HH:mm:ss");
          day.forEach((d) => {
            const key = `${d.toLowerCase()}-${ciUTC}-${coUTC}`;
            localCheckInByKey[key] = check_in; // keep local string like "04:00 AM"
          });
        });
      });

      const newKeySet = new Set(
        newTransformed.map((d) => `${d.day}-${d.check_in}-${d.check_out}`)
      );

      const today = moment().format("dddd").toLowerCase();
      const toDelete = oldEntries.filter((od) => {
        const key = `${od.day}-${od.check_in}-${od.check_out}`;
        return !newKeySet.has(key);
      });

      if (toDelete.length) {
        await Promise.all(
          toDelete.map(async (od) => {
            let query;
            if (od.day === today) {
              const key = `${od.day}-${od.check_in}-${od.check_out}`;
              const localCI = localCheckInByKey[key];
              if (localCI) {
                const utcDate = moment(
                  `${moment().format("YYYY-MM-DD")} ${localCI}`,
                  "YYYY-MM-DD h:mm A"
                )
                  .utc()
                  .format("YYYY-MM-DD");
                query = `?date=${utcDate}`;
              }
            }
            return deleteEmployeeSchedule({
              id: od.id,
              ...(query && { query }),
            });
          })
        );
      }
      // ===== end deletion of unselected entries =====

      // transform and save only modified schedules
      const transformData = (data) => {
        const today = moment(); // local today
        const todayDay = today.format("dddd").toLowerCase();

        const schedules = data
          ?.filter(
            (item, index) =>
              !item.markedForDelete &&
              (modifiedSchedules.has(index) || item.isNew)
          )
          .flatMap(({ storeDay }) =>
            storeDay?.flatMap(({ day, check_in, check_out, uids }) =>
              day?.map((d, idx) => {
                const localCheckIn = moment(check_in, ["h:mm A"]);
                const localCheckOut = moment(check_out, ["h:mm A"]);

                const formattedCheckIn = localCheckIn.utc().format("HH:mm:ss");
                const formattedCheckOut = localCheckOut
                  .utc()
                  .format("HH:mm:ss");

                const scheduleObj = {
                  // use uid if exists (for existing schedules), undefined for new ones
                  id: uids?.[idx] ?? undefined,
                  day: d.toLowerCase(),
                  check_in: formattedCheckIn,
                  check_out: formattedCheckOut,
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

        const uniqueSchedules = schedules.filter(
          (s, i, self) =>
            i ===
            self.findIndex(
              (t) =>
                t.day === s.day &&
                t.check_in === s.check_in &&
                t.check_out === s.check_out
            )
        );

        return uniqueSchedules;
      };

      const readyData = {
        employee_schedules: transformData(classDays),
      };

      await teacherProfileUpdate({
        id: prevData?.teacherId,
        data: cleanObject(readyData),
        redirectAnotherPage: redirectToAnotherPage,
        resetCookie,
      });

      // Invalidate the teacher details query to refresh the data
      dispatch(
        classManagementApi.util.invalidateTags([
          { type: "Teachers", id: prevData?.teacherId },
        ])
      );

      modalOpen(true);
    } catch (err) {
      console.log(err);
      const allMessages = err.inner?.map((error, i) => error.message);
      setErrors(allMessages);
    }
  };

  return (
    <>
      {errors && errors?.length && (
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
            {errors?.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col gap-6 w-full">
        {classDays
          ?.filter((item) => !item.markedForDelete)
          ?.map((item, i) => (
            <div key={i} className="time w-full">
              <div className="flex flex-wrap justify-start items-center gap-2">
                <span className="text-sm font-bold">Select Day:</span>
                {daysOfWeekFull?.map((day, j) => {
                  return (
                    <div className="day" key={j}>
                      <input
                        checked={item?.storeDay[0].day?.includes(day)}
                        type="checkbox"
                        className="hidden"
                        name=""
                        id={day + i}
                        // Disable the checkbox if the day is already selected
                      />
                      <label
                        onClick={() => toggleClassDaysHandler(day, i)}
                        htmlFor={day + i}
                        className={`text-sm capitalize px-2 py-1 rounded-md inline-flex`}
                      >
                        {day.slice(0, 2)}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="w-full flex gap-5 items-end">
                <div className="w-full grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4 mt-4">
                  <InputTimePicker
                    defaultValue={item?.storeDay[0].check_in}
                    label="Clock in"
                    handler={(value) => updateTimeHandler(i, "check_in", value)}
                    isRequired
                  />
                  <InputTimePicker
                    defaultValue={item?.storeDay[0].check_out}
                    isRequired
                    label="Clock out"
                    handler={(value) =>
                      updateTimeHandler(i, "check_out", value)
                    }
                    specificDayDisabled={item.storeDay[0]?.check_in}
                  />
                </div>
                <button
                  onClick={() =>
                    removeClassDayHandler(
                      i,
                      item?.storeDay[0]?.uids && item?.storeDay[0]?.uids.length
                        ? item?.storeDay[0]?.uids
                        : null
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
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          ))}
      </div>

      <button
        type="button"
        className="flex justify-start mt-4 items-center gap-2"
        onClick={addAnotherClassDaysHandler}
      >
        <img src="/assets/img/icons/plus-square.svg" className="plus" alt="" />
        <span className="text-sm font-bold">Add another time</span>
      </button>
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

export default ScheduleStepUpdate;
