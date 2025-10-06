"use client";
import React, { useState, useRef, useEffect } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import { message, notification } from "antd";
import InputTimePicker from "@/components/common/Inputs/Input/InputTimePicker";
import { inviteTeacherSchema } from "@/utilities/validationRules/schemas/inviteTeacherSchema";
import { useInviteTeacherMutation } from "@/store/features/teacher-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import moment from "moment";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { usePeopleRolesQuery } from "@/store/features/auth/apiSlice";
import { DeleteSvg } from "@/components/helpers/storeAllSvgs";
import { daysOfWeekFull } from "@/constants/daysOfFullWeek";
import { useGetTeacherInfoDataByEmailIfExistsMutation } from "@/store/features/teacher-management/apiSlice";
import InputBluePrint from "@/components/common/Inputs/Input/InputBluePrint";

const InviteTeacher = ({ setShowModal }) => {
  const [isDataPrefilled, setIsDataPrefilled] = useState(false);
  /*===== general ========*/
  const notifyHandler = (option) => {
    notification.open(option);
  };

  /*======== initilize apis ========*/
  const [inviteTeacher, { isLoading: inviteLoading, error }] =
    useInviteTeacherMutation();
  const { data: fetchPeopleRoles, isFetching: loadingPeopleRoles } =
    usePeopleRolesQuery();

  const [
    GetAndFillTEacher,
    { isLoading: GetAndFillTEacherLoading, error: GetAndFillTEacherError },
  ] = useGetTeacherInfoDataByEmailIfExistsMutation();

  /*========= states & functions =========*/
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);

  // single data
  const [singleData, setSingleData] = useState({
    first_name: "",
    last_name: "",
    is_teacher_profile: true,
    email: "",
    access_to_admin_panel: false,
  });
  const [designation, setDesignation] = useState({
    is_exist: false,
    name: "",
  });
  // Modify the handleInput function to detect email changes and reset pre-filled data
  const handleInput = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setIsDataPrefilled(false); // reset prefill flag
      setSingleData((prev) => ({
        ...prev,
        email: value, // only update email
      }));
    } else {
      setSingleData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // responsibilities
  const [responsibilities, setResponsibilities] = useState([
    {
      id: Math.floor(Math.random() * 900) + 100,
      title: "",
    },
  ]);
  // Add new responsibility handler
  const newResponsibilities = () => {
    if (responsibilities.length >= 10) {
      message.warning("You can only add up to 10 responsibilities.");
      return;
    }
    setResponsibilities((prev) => [
      ...prev,
      { id: Math.floor(Math.random() * 900) + 100, title: "" },
    ]);
  };

  // Delete responsibility handler
  const deleteResponsibilities = (id) => {
    if (responsibilities.length > 1) {
      setResponsibilities((prev) => prev.filter((item) => item.id !== id));
    } else {
      message.warning("Must have at least one");
    }
  };

  // change responsibility value handler
  const changeResponsibilitiesValueHandler = (id, value) => {
    setResponsibilities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: value } : item))
    );
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

  // delete class days item
  const removeClassDaysHandler = (index) => {
    setClassDays((prevClassDays) => {
      return prevClassDays.filter((item, i) => i !== index);
    });
  };

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

  // people roles
  const [peopleRoles, setPeopleRoles] = useState([]);
  const [selectedPeopleRole, setSelectedPeopleRole] = useState(null); //selected roles
  useEffect(() => {
    if (!loadingPeopleRoles && fetchPeopleRoles) {
      setPeopleRoles(fetchPeopleRoles?.data);
    }
  }, [fetchPeopleRoles, loadingPeopleRoles]);

  // error watcher
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error(error?.data?.message);
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

  //   reset data handler
  const resetDataHandler = () => {
    setSingleData({
      first_name: "",
      last_name: "",
      is_teacher_profile: false,
      email: "",
      access_to_admin_panel: false,
    });
    setDesignation({
      is_exist: false,
      name: "",
    });
    setResponsibilities([
      {
        id: 1,
        title: "",
      },
    ]);
    setSelectedPeopleRole(null);
    setErrors(null);
    setClassDays([]);
    setTimeout(() => {
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
    }, 200);
  };

  const successHandler = () => {
    resetDataHandler();
    setShowModal(true);
    // router.replace(`/teachers/list`);
  };

  //   invite handler
  const inviteHandler = async () => {
    try {
      if (classDaysValidator(classDays) === undefined) {
        return;
      }
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

              // only attach date if this schedule is for today - DONT DELETE THIS
              // if (d.toLowerCase() === todayDay) {
              //   const localCheckInToday = moment(
              //     `${moment().format("YYYY-MM-DD")} ${check_in}`,
              //     "YYYY-MM-DD h:mm A"
              //   );
              //   const dateFromCheckInUTC = localCheckInToday
              //     .utc()
              //     .format("YYYY-MM-DD");
              //   const localCheckOutToday = moment(
              //     `${moment().format("YYYY-MM-DD")} ${check_out}`,
              //     "YYYY-MM-DD h:mm A"
              //   );
              //   const dateFromCheckOutUTC = localCheckOutToday
              //     .utc()
              //     .format("YYYY-MM-DD");

              //   scheduleObj.check_in_date = dateFromCheckInUTC;
              //   scheduleObj.check_out_date = dateFromCheckOutUTC;
              // }

              return scheduleObj;
            })
          )
        );
      };

      const sendData = {
        access_to_admin_panel:
          singleData.access_to_admin_panel && selectedPeopleRole ? true : false,
        role_id: selectedPeopleRole ? selectedPeopleRole?.id : null,
        first_name: singleData.first_name,
        last_name: singleData.last_name,
        is_teacher_profile: singleData.is_teacher_profile,
        email: singleData.email,
        designation: designation,
        employee_schedules: transformData(classDays),
        employee_responsibilities: responsibilities
          .filter((item) => item.title.trim() !== "") // Filter out empty titles
          .map((item) => ({
            title: item.title,
          })),
      };
      await inviteTeacherSchema.validate(
        {
          singleData: singleData,
          designation: designation.name,
          classDays: classDays,
        },
        { abortEarly: false }
      );
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
      const cleanedData = cleanObject(sendData);
      await inviteTeacher({
        data: cleanedData,
        successHandler: successHandler,
      });
    } catch (validationErrors) {
      const allMessages = validationErrors.inner.map((error) => error.message);
      setErrors(allMessages);
    }
  };

  // Add this function to handle email blur and pre-fill data
  const handleEmailBlur = async (e) => {
    const email = e.target.value;
    if (!email) return;

    try {
      const { data: teacherData } = await GetAndFillTEacher({ email });

      if (teacherData?.success && teacherData?.data) {
        const teacher = teacherData.data;
        const people = teacher.user_id?.people_id;

        if (people) {
          setSingleData((prev) => ({
            ...prev,
            first_name: people.first_name || prev.first_name,
            last_name: people.last_name || prev.last_name,
            email: teacher.email || prev.email,
          }));

          if (people.occupation) {
            setDesignation((prev) => ({
              ...prev,
              name: people.occupation,
            }));
          }

          setIsDataPrefilled(true);
          notifyHandler({
            key: Math.random(),
            message: "Teacher Found",
            description: `Pre-filled form with existing data for ${people.first_name} ${people.last_name}`,
            placement: "topRight",
          });
        }
      } else if (teacherData?.status === 400) {
        // Email already exists in current org
        setIsDataPrefilled(false);
        alert("Email already exists in current org");
        // notifyHandler({
        //   key: Math.random(),
        //   message: "Email Conflict",
        //   description: "This email already exists in this current organization",
        //   type: "error",
        //   placement: "topRight",
        // });
      } else {
        setIsDataPrefilled(false);
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setIsDataPrefilled(false);
    }
  };

  return (
    <>
      <div ref={errorRef} className="w-full">
        <div className="card lg:w-[750px] w-[95%] max-w-[95%] lg:p-12 p-5 rounded-[12px] shadow-lg bg-white top-0 m-auto mt-8 shadow-custom-effect">
          <div className="flex justify-between items-center ">
            <h2 className="lg:text-[30px] text-2xl font-bold ">
              Add Teacher/Employee
            </h2>
          </div>
          <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
          {errors && (
            <div
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
          <>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              <InputWithLabel
                label={"First Name"}
                maxlength={30}
                placeholder={"First Name"}
                type={"text"}
                name="first_name"
                value={singleData.first_name}
                handler={(e) => handleInput(e)}
                isRequired
                disabled={isDataPrefilled}
                noNumbersAndSpecialChars={true}
              />

              <InputWithLabel
                label={"Last Name"}
                maxlength={30}
                placeholder={"Last Name"}
                type={"text"}
                name="last_name"
                value={singleData.last_name}
                handler={(e) => handleInput(e)}
                isRequired
                disabled={isDataPrefilled}
                noNumbersAndSpecialChars={true}
              />

              <div className="col-span-full">
                <InputWithLabel
                  label={"Email"}
                  placeholder={"Email"}
                  type={"email"}
                  name="email"
                  value={singleData.email}
                  handler={(e) => handleInput(e)}
                  onBlur={handleEmailBlur}
                  isRequired
                />
              </div>
              <InputWithLabel
                label={"Designation"}
                placeholder={"Designation"}
                type={"text"}
                maxlength={30}
                name="designation"
                value={designation.name}
                handler={(e) =>
                  setDesignation((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                isRequired
              />
              <div className="flex justify-start items-center gap-3 h-full pt-6">
                <div className="flex items-center space-x-2">
                  <input
                    className="w-5 h-5"
                    type="radio"
                    name="profile_type"
                    id="teacherProfile"
                    value="teacher"
                    checked={singleData.is_teacher_profile === true}
                    onChange={() =>
                      setSingleData((prev) => ({
                        ...prev,
                        is_teacher_profile: true,
                      }))
                    }
                  />
                  <label htmlFor="teacherProfile">Teacher profile</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    className="w-5 h-5"
                    type="radio"
                    name="profile_type"
                    id="employeeProfile"
                    value="employee"
                    checked={singleData.is_teacher_profile === false}
                    onChange={() =>
                      setSingleData((prev) => ({
                        ...prev,
                        is_teacher_profile: false,
                      }))
                    }
                  />
                  <label htmlFor="employeeProfile">Employee profile</label>
                </div>
              </div>
            </div>

            <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
            {/*  responsibilities */}
            <div className="w-full mb-4">
              <div className="flex flex-col gap-4">
                {responsibilities.map((responsibility, i) => (
                  <div key={i} className="flex space-x-6 items-end">
                    <div className="flex-1">
                      <InputWithLabel
                        key={i}
                        label={`Responsibilities ${i + 1}`}
                        placeholder={"Responsibility"}
                        maxlength={40}
                        type={"text"}
                        name="responsibility"
                        value={responsibility.title}
                        handler={(e) =>
                          changeResponsibilitiesValueHandler(
                            responsibility.id,
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <button
                      onClick={() => deleteResponsibilities(responsibility.id)}
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
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={newResponsibilities}
                className="flex justify-start mt-4 items-center gap-2"
              >
                <img
                  src="/assets/img/icons/plus-square.svg"
                  className="plus"
                  alt=""
                />
                <span className="text-sm font-semibold">
                  Add another Responsibility
                </span>
              </button>
            </div>
            <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
            {/* check in and check out feature */}
            <div className="flex flex-col gap-6">
              <p className="text-12 font-bold text-[#383838] tracking-wider uppercase">
                Clock In/Out Information
              </p>
              {classDays.map((item, i) => (
                <div key={i} className="time">
                  <div className="flex flex-wrap justify-start items-center gap-2">
                    <span className="text-sm font-bold">Select Day</span>
                    {daysOfWeekFull.map((day, j) => {
                      return (
                        <div className="day" key={j}>
                          <input
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

                  <div className="flex justify-between items-end gap-3">
                    <div className="grid w-full items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4 mt-4">
                      <InputTimePicker
                        label="Clock in"
                        handler={(value) =>
                          updateTimeHandler(i, "check_in", value)
                        }
                        isRequired
                      />
                      <InputTimePicker
                        isRequired
                        label="Clock out"
                        handler={(value) =>
                          updateTimeHandler(i, "check_out", value)
                        }
                        specificDayDisabled={item.storeDay[0]?.check_in}
                      />
                    </div>
                    <button
                      onClick={() => removeClassDaysHandler(i)}
                      type="button"
                      className="w-[44px] h-[44px] rounded-lg flex justify-center items-center hover:border-danger-700 text-primary-brand-700 hover:text-danger-700"
                    >
                      <DeleteSvg />
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
              <img
                src="/assets/img/icons/plus-square.svg"
                className="plus"
                alt=""
              />
              <span className="text-sm font-semibold">Add another time</span>
            </button>

            <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
              <div className="col-span-full flex justify-start items-center gap-3 h-full">
                <input
                  className="w-5 h-5"
                  onChange={(e) =>
                    setSingleData((prev) => ({
                      ...prev,
                      access_to_admin_panel: !singleData.access_to_admin_panel,
                    }))
                  }
                  checked={singleData.access_to_admin_panel}
                  type="checkbox"
                  name=""
                  id="access"
                />
                <label htmlFor="access">
                  Give him/her access to admin panel.
                </label>
              </div>
              {singleData.access_to_admin_panel && (
                <SelectBox
                  list={
                    peopleRoles &&
                    peopleRoles.length > 0 &&
                    peopleRoles
                      .filter((item) => item?.role_type === "orgrole")
                      .map((item) => ({
                        ...item,
                        label: item?.role_name,
                        value: item?.role_name,
                      }))
                  }
                  isRequired
                  label="Select Role"
                  handler={(value, option) => setSelectedPeopleRole(option)}
                />
              )}
            </div>
            <button
              className="bg-black rounded-[8px] lg:px-[190px] px-[50px] py-3 text-white font-bold block mx-auto mt-10"
              onClick={inviteHandler}
            >
              {inviteLoading ? (
                <SvgLoader className="text-white" />
              ) : (
                "Send Invitation"
              )}
            </button>
          </>
        </div>
      </div>
    </>
  );
};

export default InviteTeacher;
