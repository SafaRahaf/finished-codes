import React from "react";
import InputWithLabel from "../../common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";

const ClassAssignModal = ({
  setCreateGroupModal,
  groupList = [],
  assignGroupHandler,
}) => {
  return (
    <div>
      <div
        className="onboarding-profile-bg z-30"
        onClick={() => setCreateGroupModal(false)}
      ></div>
      <div className="card w-[350px] max-w-[95%] max-h-[90vh] overflow-y-auto p-12 rounded-[12px] shadow-lg bg-white z-[999999] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <p className="text-2xl font-bold">Choose Group</p>

        <div className="line h-[1px] w-full bg-[#E4E6EA] my-6 "></div>
        <SelectBox
          isRequired
          handler={assignGroupHandler}
          list={
            groupList.length > 0 &&
            groupList.map((item, i) => ({
              ...item,
              itemIndex: i,
              label: item?.name,
              value: item.name,
            }))
          }
          label="Groups"
        />
      </div>
    </div>
  );
};

export default ClassAssignModal;
