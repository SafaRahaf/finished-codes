import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { useGetClassTypesQuery } from "@/store/features/class-management/classTypesSlice";
import React, { useState, useEffect } from "react";

function ClassTypes({ oldType, updateHandler, classId, createClassLoading }) {
  const [getAllClassTypes, setGetAllClassTypes] = useState([]);
  const [selectedClassType, setSelectedClassType] = useState(null); //selected class type
  const selectClassTypeHandler = (value, option) => {
    setSelectedClassType(option);
  };
  const { data: classTypes, isFetching: fetchingClassTypes } =
    useGetClassTypesQuery();
  useEffect(() => {
    if (!fetchingClassTypes && classTypes) {
      setGetAllClassTypes(classTypes?.data);
      const findOldData =
        classTypes?.data.length > 0 &&
        classTypes?.data.find(
          (item) => item?.class_type_id?.id === oldType?.id
        );

      setSelectedClassType({
        ...findOldData,
        label: findOldData?.class_type_id?.type_name,
        value: findOldData?.class_type_id?.type_name,
      });
    }
  }, [fetchingClassTypes, classTypes]);
  // create handler
  const updateClassApiHandler = async () => {
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
      id: Number(classId),
      class_type_org_id: selectedClassType
        ? Number(selectedClassType?.class_type_id?.id)
        : null,
    };
    const data = cleanObject(dataSanitizer);
    await updateHandler({
      data,
    });
  };
  return (
    <div className="w-full">
      <div className="w-full">
        <div className="w-full mb-32">
          <SelectBox
            defaultValue={selectedClassType}
            loading={fetchingClassTypes}
            list={
              getAllClassTypes &&
              getAllClassTypes.length > 0 &&
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
        </div>
        <div className="flex justify-end">
          <button
            onClick={updateClassApiHandler}
            type="button"
            className="btn bg-[#22252B] py-[13px] px-[24px] font-bold text-lg rounded-[8px] text-white"
          >
            {createClassLoading ? (
              <SvgLoader className="text-white" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClassTypes;
