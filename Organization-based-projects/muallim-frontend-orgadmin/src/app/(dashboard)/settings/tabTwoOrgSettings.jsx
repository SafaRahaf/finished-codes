"use client";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { current } from "@reduxjs/toolkit";
import Image from "next/image";
import React, { useState } from "react";
import { FaUser } from "react-icons/fa";

const OrgSettings = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const genders = [
    { value: "male", label: "male" },
    { value: "female", label: "female" },
  ];
  const type = [
    { value: "Option 1", label: "Option 1" },
    { value: "Option 2", label: "Option 2" },
    { value: "Option 3", label: "Option 3" },
  ];

  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (e) => {
    setWordCount(e.target.value.length);
  };
  return (
    <div>
      <div className="2xl:w-4/5 w-full shadow-lg rounded-[12px] mx-auto mt-6">
        <div className="card-header p-12 pb-6">
          <h2 className="text-2xl font-bold">Organization</h2>
        </div>

        <div className="card-body border-t-2 border-[#E7F7FF] grid xl:grid-cols-7 grid-cols-1">
          <div className="item-left xl:col-span-2 col-span-1 h-full bg-[#E7F7FF] py-6 px-6">
            <ul className="flex flex-col gap-[20px]">
              <li>
                <button
                  className={` ${
                    currentStep === 1 ? "bg-[#B6BFF0]" : "bg-transparent"
                  } w-full text-sm py-3 text-left ls-7-2 font-bold px-6 rounded-[8px]`}
                  onClick={() => setCurrentStep(1)}
                >
                  Organization Information
                </button>
              </li>
              <li>
                <button
                  className={` ${
                    currentStep === 2 ? "bg-[#B6BFF0]" : "bg-transparent"
                  } w-full text-sm py-3 text-left ls-7-2 font-bold px-6 rounded-[8px]`}
                  onClick={() => setCurrentStep(2)}
                >
                  Identification Documents
                </button>
              </li>
              <li>
                <button
                  className={` ${
                    currentStep === 3 ? "bg-[#B6BFF0]" : "bg-transparent"
                  } w-full text-sm py-3 text-left ls-7-2 font-bold px-6 rounded-[8px]`}
                  onClick={() => setCurrentStep(3)}
                >
                  Address
                </button>
              </li>
              <li>
                <button
                  className={` ${
                    currentStep === 4 ? "bg-[#B6BFF0]" : "bg-transparent"
                  } w-full text-sm py-3 text-left ls-7-2 font-bold px-6 rounded-[8px]`}
                  onClick={() => setCurrentStep(4)}
                >
                  Employee Settings
                </button>
              </li>
              <li>
                <button
                  className={` ${
                    currentStep === 5 ? "bg-[#B6BFF0]" : "bg-transparent"
                  } w-full text-sm py-3 text-left ls-7-2 font-bold px-6 rounded-[8px]`}
                  onClick={() => setCurrentStep(5)}
                >
                  Schedule
                </button>
              </li>
              <li>
                <button
                  className={` ${
                    currentStep === 6 ? "bg-[#B6BFF0]" : "bg-transparent"
                  } w-full text-sm py-3 text-left ls-7-2 font-bold px-6 rounded-[8px]`}
                  onClick={() => setCurrentStep(6)}
                >
                  Rules For Student & Parents
                </button>
              </li>
              <li>
                <button
                  className={` ${
                    currentStep === 7 ? "bg-[#B6BFF0]" : "bg-transparent"
                  } w-full text-sm py-3 text-left ls-7-2 font-bold px-6 rounded-[8px]`}
                  onClick={() => setCurrentStep(7)}
                >
                  Publish on General App
                </button>
              </li>
            </ul>
          </div>
          <div className="item-right xl:col-span-5 col-span-1 h-full py-6 px-12">
            <form action="">
              {/* step 1 */}
              {currentStep === 1 && (
                <>
                  <label htmlFor="dp">
                    <input type="file" className="hidden" name="dp" id="dp" />
                    <span className="text-4xl mb-4 flex justify-center items-center border w-[100px] h-[100px] rounded-full border-black p-4">
                      <FaUser />
                    </span>
                  </label>

                  <div className="mb-3">
                    <InputWithLabel
                      label={"Name"}
                      placeholder={"Ummul Qura Islamic School"}
                      type={"text"}
                      value={""}
                      name="email"
                      handler={(e) => handleChange(e)}
                    />
                  </div>
                  <div className="mb-0">
                    <label htmlFor="" className="font-bold text-sm mb-2">
                      About
                    </label>
                    <textarea
                      name=""
                      rows={3}
                      className="block border w-full px-4 py-2 mt-1 rounded-[4px] border-[#798295]"
                      placeholder="Write about your organization"
                      maxLength={250}
                      onChange={handleTextChange}
                      id=""
                    ></textarea>
                    <div className="text-right">
                      <p className="text-xs">
                        <span className="text-red-500">*</span> {wordCount}/250
                      </p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                    <SelectBox
                      defaultValue={type && type[0].value}
                      list={
                        type &&
                        type.length > 0 &&
                        type.map((item) => ({
                          ...item,
                          label: item?.label,
                          value: item.value,
                        }))
                      }
                      isRequired
                      label={"Organization Type"}
                    />
                    <InputWithLabel
                      label={"Date Established"}
                      placeholder={"14 June 1982"}
                      type={"date"}
                      value={""}
                      name="email"
                      handler={(e) => handleChange(e)}
                    />
                    <SelectBox
                      defaultValue={type && type[0].value}
                      list={
                        type &&
                        type.length > 0 &&
                        type.map((item) => ({
                          ...item,
                          label: item?.label,
                          value: item.value,
                        }))
                      }
                      isRequired
                      label={"Total Employee"}
                    />
                    <SelectBox
                      defaultValue={type && type[0].value}
                      list={
                        type &&
                        type.length > 0 &&
                        type.map((item) => ({
                          ...item,
                          label: item?.label,
                          value: item.value,
                        }))
                      }
                      isRequired
                      label={"Total Students"}
                    />
                    <InputWithLabel
                      label={"Organization Email"}
                      placeholder={"14 June 1982"}
                      type={"email"}
                      value={""}
                      name="email"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={"Organization Phone"}
                      placeholder={"14 June 1982"}
                      type={"tel"}
                      value={""}
                      name="email"
                      handler={(e) => handleChange(e)}
                    />
                    <div className="col-span-2">
                      <InputWithLabel
                        label={"Organization Website"}
                        placeholder={"14 June 1982"}
                        type={"url"}
                        value={""}
                        name="email"
                        handler={(e) => handleChange(e)}
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-bold">ID Number Settings</p>
                      <p>
                        ID numbers (e.g., Book ID, Class ID, Student ID) have
                        two parts: 1. Organization code, set by admin (2-6
                        characters), and 2. System-generated ID number.
                      </p>
                    </div>
                    <InputWithLabel
                      label={"Organization Code"}
                      placeholder={"1982"}
                      type={"email"}
                      value={""}
                      name="email"
                      handler={(e) => handleChange(e)}
                    />
                    <div className="col-span-2">
                      <InputWithLabel
                        label={"Social Media"}
                        placeholder={"Facebook"}
                        type={"url"}
                        value={""}
                        name="email"
                        handler={(e) => handleChange(e)}
                      />
                      <button
                        type="button"
                        className="flex justify-start items-center gap-2 mt-4"
                      >
                        <Image
                          src="/assets/img/logos/add.svg"
                          alt="plus"
                          width={18}
                          height={18}
                        />
                        <label htmlFor="" className="font-bold">
                          Add another link
                        </label>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 mt-8 text-right">
                    <button className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold">
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* step 2 */}
              {currentStep === 2 && (
                <>
                  <div className="input">
                    <div className="label-none">
                      <label htmlFor="" className="font-bold text-[14px]">
                        Select Department*
                      </label>
                      <SelectBox
                        defaultValue={type && type[0].value}
                        list={
                          type &&
                          type.length > 0 &&
                          type.map((item) => ({
                            ...item,
                            label: item?.label,
                            value: item.value,
                          }))
                        }
                        isRequired
                      />
                    </div>
                    <div className="label-none">
                      <label htmlFor="" className="font-bold text-[14px]">
                        Select Grade*
                      </label>
                      <SelectBox
                        defaultValue={type && type[0].value}
                        list={
                          type &&
                          type.length > 0 &&
                          type.map((item) => ({
                            ...item,
                            label: item?.label,
                            value: item.value,
                          }))
                        }
                        isRequired
                      />
                    </div>
                    <div className="label-none">
                      <label htmlFor="" className="font-bold text-[14px]">
                        Quran Recitation Level
                      </label>
                      <SelectBox
                        defaultValue={type && type[0].value}
                        list={
                          type &&
                          type.length > 0 &&
                          type.map((item) => ({
                            ...item,
                            label: item?.label,
                            value: item.value,
                          }))
                        }
                        isRequired
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
                    <SelectBox
                      defaultValue={type && type[0].value}
                      list={
                        genders &&
                        genders.length > 0 &&
                        genders.map((item) => ({
                          ...item,
                          label: item?.label,
                          value: item.value,
                        }))
                      }
                      label={"Number of Memorised Juzs"}
                      isRequired
                    />
                    <SelectBox
                      defaultValue={type && type[0].value}
                      list={
                        genders &&
                        genders.length > 0 &&
                        genders.map((item) => ({
                          ...item,
                          label: item?.label,
                          value: item.value,
                        }))
                      }
                      label={"Current Sabaq Juz (Optional)"}
                    />
                  </div>

                  <p className="font-bold my-3">Select Memorised Juzs</p>

                  <div className="flex flex-wrap gap-2 justify-start items-center">
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j1" />
                      <label htmlFor="j1">01</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j2" />
                      <label htmlFor="j2">02</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j3" />
                      <label htmlFor="j3">03</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j4" />
                      <label htmlFor="j4">04</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j5" />
                      <label htmlFor="j5">05</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j6" />
                      <label htmlFor="j6">06</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j7" />
                      <label htmlFor="j7">07</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j8" />
                      <label htmlFor="j8">08</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j9" />
                      <label htmlFor="j9">09</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j10" />
                      <label htmlFor="j10">10</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j11" />
                      <label htmlFor="j11">11</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j12" />
                      <label htmlFor="j12">12</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j13" />
                      <label htmlFor="j13">13</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j14" />
                      <label htmlFor="j14">14</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j15" />
                      <label htmlFor="j15">15</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j16" />
                      <label htmlFor="j16">16</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j17" />
                      <label htmlFor="j17">07</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j18" />
                      <label htmlFor="j18">18</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j19" />
                      <label htmlFor="j19">19</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j20" />
                      <label htmlFor="j20">20</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j21" />
                      <label htmlFor="j21">21</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j22" />
                      <label htmlFor="j22">22</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j23" />
                      <label htmlFor="j23">23</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j24" />
                      <label htmlFor="j24">24</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j25" />
                      <label htmlFor="j25">25</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j26" />
                      <label htmlFor="j26">26</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j27" />
                      <label htmlFor="j27">27</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j28" />
                      <label htmlFor="j28">28</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j29" />
                      <label htmlFor="j29">29</label>
                    </div>
                    <div className="juz-btn">
                      <input type="checkbox" name="juz" id="j30" />
                      <label htmlFor="j30">30</label>
                    </div>
                  </div>
                  <div className="mb-3 text-right mt-20">
                    <button className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold">
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* step 3 */}
              {currentStep === 3 && (
                <>
                  <p className="text-sm font-bold">
                    Has He/She Studied in A Madrasa/Islamic School Before?
                  </p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="madrasa" id="yes" />
                      <label htmlFor="yes">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="madrasa" id="no" />
                      <label htmlFor="no">No</label>
                    </div>
                  </div>

                  <div className="input">
                    <div className="mb-3">
                      <InputWithLabel
                        label={"Name of Madrasa/Islamic School"}
                        placeholder={"Darul Ulum"}
                        type={"text"}
                        value={""}
                        name="email"
                        handler={(e) => handleChange(e)}
                      />
                    </div>
                    <div className="mb-2">
                      <InputWithLabel
                        label={"Street Address"}
                        placeholder={"1750 Ranchero Road"}
                        type={"text"}
                        value={""}
                        name="email"
                        handler={(e) => handleChange(e)}
                      />
                    </div>
                    <div className="label-none">
                      <label htmlFor="" className="font-bold text-[14px]">
                        Country
                      </label>
                      <SelectBox
                        defaultValue={type && type[0].value}
                        list={
                          type &&
                          type.length > 0 &&
                          type.map((item) => ({
                            ...item,
                            label: item?.label,
                            value: item.value,
                          }))
                        }
                        isRequired
                      />
                    </div>
                    <div className="label-none">
                      <label htmlFor="" className="font-bold text-[14px]">
                        State
                      </label>
                      <SelectBox
                        defaultValue={type && type[0].value}
                        list={
                          type &&
                          type.length > 0 &&
                          type.map((item) => ({
                            ...item,
                            label: item?.label,
                            value: item.value,
                          }))
                        }
                        isRequired
                      />
                    </div>
                    <div className="label-none">
                      <label htmlFor="" className="font-bold text-[14px]">
                        City
                      </label>
                      <SelectBox
                        defaultValue={type && type[0].value}
                        list={
                          type &&
                          type.length > 0 &&
                          type.map((item) => ({
                            ...item,
                            label: item?.label,
                            value: item.value,
                          }))
                        }
                        isRequired
                      />
                    </div>
                    <div className="mb-3">
                      <InputWithLabel
                        label={"Zip Code"}
                        placeholder={"78028"}
                        type={"text"}
                        value={""}
                        name="zip"
                        handler={(e) => handleChange(e)}
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <p className="text-sm font-bold">
                    Has He/She Ever Gone to Public School?
                  </p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="school" id="yes1" />
                      <label htmlFor="yes1">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="school" id="no1" />
                      <label htmlFor="no1">No</label>
                    </div>
                  </div>

                  <SelectBox
                    defaultValue={type && type[0].value}
                    list={
                      type &&
                      type.length > 0 &&
                      type.map((item) => ({
                        ...item,
                        label: item?.label,
                        value: item.value,
                      }))
                    }
                    isRequired
                    label={"to Grade"}
                  />

                  <p className="text-sm font-bold mt-5">
                    Is He/She Doing Home Schooling?
                  </p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="homeSchool" id="yes2" />
                      <label htmlFor="yes2">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="homeSchool" id="no2" />
                      <label htmlFor="no2">No</label>
                    </div>
                  </div>

                  <InputWithLabel
                    label={"Home Schooling Program Name"}
                    placeholder={"Program Name"}
                    type={"text"}
                    value={""}
                    name="zip"
                    handler={(e) => handleChange(e)}
                  />

                  <div className="mb-3 text-right mt-20">
                    <button className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold">
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* step 4 */}
              {currentStep === 4 && (
                <>
                  <div className="grid items-center justify-center grid-cols-1 gap-x-8 gap-y-4">
                    <SelectBox
                      defaultValue={type && type.length > 0 && type[0]}
                      list={
                        type &&
                        type.length > 0 &&
                        type.map((item) => ({
                          ...item,
                          label: item,
                          value: item,
                        }))
                      }
                      isRequired
                      label="Legal Guardian*"
                    />

                    <hr />
                    <InputWithLabel
                      label={"Father's Name"}
                      placeholder={"Ibrahim Jafrry khan"}
                      type={"text"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={"Phone Number"}
                      placeholder={"+13 549944994"}
                      type={"tel"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={"Email"}
                      placeholder={"ibrahim@gmail.com"}
                      type={"email"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />

                    <p className="text-sm font-bold mt-5 uppercase">
                      Father's Home/Mailing Address*
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <input type="radio" name="f_add" id="f_add_same" />
                        <label htmlFor="f_add_same">
                          Same as student’s address
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="f_add" id="f_add_diff" />
                        <label htmlFor="f_add_diff">
                          Different than student’s address
                        </label>
                      </div>
                    </div>

                    <hr />

                    <InputWithLabel
                      label={"Mother's Name"}
                      placeholder={"Fatema Jafrry khan"}
                      type={"text"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={"Phone Number"}
                      placeholder={"+13 549944994"}
                      type={"tel"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={"Email"}
                      placeholder={"ibrahim@gmail.com"}
                      type={"email"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />

                    <p className="text-sm font-bold mt-5 uppercase">
                      Mohter's Home/Mailing Address*
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <input type="radio" name="m_add" id="m_add_same" />
                        <label htmlFor="m_add_same">
                          Same as student’s address
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="m_add" id="m_add_diff" />
                        <label htmlFor="m_add_diff">
                          Different than student’s address
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3 text-right mt-20">
                    <button className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold">
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* step 5 */}
              {currentStep === 5 && (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-sm font-bold mt-5 uppercase">
                      Office Hours
                    </p>

                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                      <SelectBox
                        defaultValue={type && type[0].value}
                        list={
                          genders &&
                          genders.length > 0 &&
                          genders.map((item) => ({
                            ...item,
                            label: item?.label,
                            value: item.value,
                          }))
                        }
                        label={"Office Day (In Week)"}
                        isRequired
                      />
                      <div className="flex justify-start items-center gap-3">
                        <input type="checkbox" name="" id="add-another" />
                        <label
                          htmlFor="add-another"
                          className="font-bold text-sm"
                        >
                          Add different office hours
                        </label>
                      </div>
                    </div>

                    <SelectBox
                      defaultValue={type && type[0].value}
                      list={
                        type &&
                        type.length > 0 &&
                        type.map((item) => ({
                          ...item,
                          label: item?.label,
                          value: item.value,
                        }))
                      }
                      label={"State"}
                      isRequired
                    />
                    <SelectBox
                      defaultValue={type && type[0].value}
                      list={
                        type &&
                        type.length > 0 &&
                        type.map((item) => ({
                          ...item,
                          label: item?.label,
                          value: item.value,
                        }))
                      }
                      label={"City"}
                      isRequired
                    />
                    <InputWithLabel
                      label={"Zip Code"}
                      placeholder={"78028"}
                      type={"text"}
                      value={""}
                      name="email"
                      handler={(e) => handleChange(e)}
                    />
                  </div>
                  <div className="mb-3 text-right mt-20">
                    <button className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold">
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* step 6 */}
              {currentStep === 6 && (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    <InputWithLabel
                      label={"Blood Group"}
                      placeholder={"A+"}
                      type={"text"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={"Allergies"}
                      placeholder={"Hilsha Fish"}
                      type={"text"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={"Medical Problems"}
                      placeholder={"Diabates"}
                      type={"text"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={"Regular Medications"}
                      placeholder={"Medications"}
                      type={"text"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={
                        "Significant Medical History (Surgery, injury, serious illness etc.)"
                      }
                      placeholder={"Surgery, injury, serious illness"}
                      type={"text"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <hr className="my-4" />
                    <InputWithLabel
                      label={"Physician (Name)"}
                      placeholder={"David Ant"}
                      type={"text"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                    <InputWithLabel
                      label={"Physicians’ Contact"}
                      placeholder={"+13 489371554"}
                      type={"text"}
                      value={""}
                      name="fn"
                      handler={(e) => handleChange(e)}
                    />
                  </div>
                  <div className="mb-3 text-right mt-20">
                    <button className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold">
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* step 7 */}
              {currentStep === 7 && (
                <>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="input">
                      <div className="label-none">
                        <label htmlFor="" className="font-bold text-[14px]">
                          Blood Group
                        </label>
                        <SelectBox
                          defaultValue={type && type[0].value}
                          list={
                            genders &&
                            genders.length > 0 &&
                            genders.map((item) => ({
                              ...item,
                              label: item?.label,
                              value: item.value,
                            }))
                          }
                          isRequired
                        />
                      </div>
                    </div>
                    <div className="input">
                      <div className="label-none">
                        <InputWithLabel
                          label={"Allergies"}
                          placeholder={"Allergies"}
                          type={"text"}
                          value={""}
                          name="email"
                          handler={(e) => handleChange(e)}
                        />
                      </div>
                    </div>
                    <div className="input">
                      <div className="label-none">
                        <InputWithLabel
                          label={"Medical Problems"}
                          placeholder={"Medical Problems"}
                          type={"text"}
                          value={""}
                          name="email"
                          handler={(e) => handleChange(e)}
                        />
                      </div>
                    </div>
                    <div className="input">
                      <div className="label-none">
                        <label htmlFor="" className="font-bold text-[14px]">
                          Regular Medication
                        </label>
                        <SelectBox
                          defaultValue={type && type[0].value}
                          list={
                            genders &&
                            genders.length > 0 &&
                            genders.map((item) => ({
                              ...item,
                              label: item?.label,
                              value: item.value,
                            }))
                          }
                          isRequired
                        />
                      </div>
                    </div>
                    <div className="input">
                      <div className="label-none">
                        <InputWithLabel
                          label={
                            "Significant Medical History (Surgery, injury, serious illness etc.)"
                          }
                          placeholder={"Surgery, injury, serious illness"}
                          type={"text"}
                          value={""}
                          name="email"
                          handler={(e) => handleChange(e)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3 text-right mt-20">
                    <button className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold">
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* edit card */}
    </div>
  );
};

export default OrgSettings;
