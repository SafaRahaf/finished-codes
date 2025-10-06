import React, { useEffect, useState } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { GradeType } from "@/constants/GradeType";
import { QuranRecitationLevel } from "@/constants/quranRecitationLevel";
import { useUpdateStudentProfileMutation } from "@/store/features/student-management/apiSlice";
import { message } from "antd";
import { useGetGroupsQuery } from "@/store/features/class-management/apiSlice";

const DepartmentGradeStep = ({ studentProfileInfo }) => {
  const defaultValue = {
    department_id: studentProfileInfo?.department_id?.id,
    grade_id: studentProfileInfo?.grade_id?.id,
    quran_recitation_level: studentProfileInfo?.quran_recitation_level,
    total_memorised_juzs: studentProfileInfo?.total_memorised_juzs,
    current_sabaq_juz: studentProfileInfo?.current_sabaq_juz,
    memorised_juzs: studentProfileInfo?.memorised_juzs || [],
  };

  const [formData, setFormData] = useState(defaultValue);
  const [gradesState, setGradesState] = useState([]);

  const [updateStudentProfile, { isLoading: isUpdating }] =
    useUpdateStudentProfileMutation();

  const { data: departments, isFetching: loadingDepts } = useGetGroupsQuery({
    page: 1,
    limit: 999,
  });

  const handleSelect = (name, value, option) => {
    handleChange({ department_id: value });
    // console.log(option, value, name);
    if (name === "department_id" && option) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        department_name: option.label,
      }));
      setGradesState(
        option?.class_id && option?.class_id.length > 0 ? option?.class_id : []
      );
    }
    if (name === "grade_id" && option) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        grade_name: option?.class_type_org_id?.class_type_id?.type_name,
      }));
      // console.log(option.);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChange = (e) => {
    if (e?.target) {
      const { name, value, type, checked } = e.target;

      // For memorised juzs checkboxes
      if (name === "juz") {
        setFormData((prev) => {
          const juzs = new Set(prev.memorised_juzs || []);

          if (checked) {
            juzs.add(value);
          } else {
            juzs.delete(value);
          }

          return { ...prev, memorised_juzs: [...juzs] };
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
      }
    } else if (typeof e === "object" && !Array.isArray(e)) {
      setFormData((prev) => ({ ...prev, ...e }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      total_memorised_juzs:
        formData.total_memorised_juzs ??
        formData.memorised_juzs?.length ??
        defaultValue.total_memorised_juzs,
      department_id: Number(
        formData.department_id ?? defaultValue.department_id
      ),
      grade_id: Number(formData.grade_id ?? defaultValue.grade_id),
    };

    try {
      await updateStudentProfile({
        peopleId: studentProfileInfo?.id,
        payload,
      }).unwrap();
      message.success("Student profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update student profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input">
        <div className="label-none">
          <SelectBox
            label="Select Department"
            name="department_id"
            defaultValue={studentProfileInfo?.department_id?.name}
            list={
              departments?.data?.map((item) => ({
                label: item.name,
                value: item.id,
                class_id: item.class_id,
              })) ?? []
            }
            handler={(value, option) =>
              handleSelect("department_id", value, option)
            }
          />
        </div>
        <div className="label-none">
          <SelectBox
            label="Select Grade"
            name="grade_id"
            list={
              gradesState?.length
                ? gradesState?.map((grade) => ({
                    ...grade,
                    label: grade?.class_name,
                    value: grade.id,
                  }))
                : []
            }
            defaultValue={studentProfileInfo?.grade_id?.name ?? ""}
            handler={(value, option) => handleSelect("grade_id", value, option)}
          />
        </div>
        <div className="label-none">
          <label htmlFor="" className="font-bold text-[14px]">
            Quran Recitation Level
          </label>
          <SelectBox
            name="quran_recitation_level"
            defaultValue={defaultValue?.quran_recitation_level}
            handler={(value) => handleChange({ quran_recitation_level: value })}
            list={Object.values(QuranRecitationLevel).map((item) => ({
              label: item.replace("_", " "),
              value: item,
            }))}
          />
        </div>
      </div>
      {formData?.grade_name === "Hifz" ||
      defaultValue?.total_memorised_juzs !== 0 ? (
        <>
          <hr className="my-4" />
          <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
            <SelectBox
              label={"Total Memorised Juzs"}
              defaultValue={defaultValue?.total_memorised_juzs}
              handler={(value) => handleChange({ total_memorised_juzs: value })}
              list={[...Array(30)].map((_, i) => ({
                label: String(i).padStart(2, "0"),
                value: i,
              }))}
            />
            <SelectBox
              label={"Current Sabaq Juz (Optional)"}
              defaultValue={defaultValue?.current_sabaq_juz}
              handler={(value) => handleChange({ current_sabaq_juz: value })}
              list={[...Array(30)].map((_, i) => ({
                label: String(i).padStart(2, "0"),
                value: i,
              }))}
            />
          </div>
          <p className="font-bold my-3">Select Memorised Juzs</p>
          <div className="flex flex-wrap gap-2 justify-start items-center">
            {[...Array(30)].map((_, i) => {
              const juzNumber = (i + 1).toString();
              const isChecked =
                defaultValue?.memorised_juzs?.includes(juzNumber);

              return (
                <div className="juz-btn" key={i}>
                  <input
                    type="checkbox"
                    name="juz"
                    value={juzNumber}
                    id={`j${i + 1}`}
                    defaultChecked={isChecked}
                    onChange={handleChange}
                    disabled={
                      !isChecked &&
                      formData?.memorised_juzs?.length >=
                        Number(formData?.total_memorised_juzs)
                    }
                  />
                  <label htmlFor={`j${i + 1}`}>
                    {String(i + 1).padStart(2, "0")}
                  </label>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        formData?.grade_name !== "Hifz" && null
      )}
      <div className="mb-3 text-right mt-20">
        <button className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold">
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default DepartmentGradeStep;
