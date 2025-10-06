import React from "react";
import InputWithLabel from "../../common/Inputs/Input/InputWithLabel";

const CreateGroupModal = ({
  inputValue,
  inputHandler,
  setCreateGroupModal,
  actionHandler,
}) => {
  return (
    <div>
      <div
        className="onboarding-profile-bg z-30"
        onClick={() => setCreateGroupModal(false)}
      ></div>
      <div className="card w-[350px] max-w-[95%] max-h-[90vh] overflow-y-auto p-12 rounded-[12px] shadow-lg bg-white z-[999999] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <p className="text-2xl font-bold">New Group</p>

        <div className="line h-[1px] w-full bg-[#E4E6EA] my-6"></div>
        <InputWithLabel
          label={"Group Name"}
          placeholder={"Full Time Hifz"}
          type={"text"}
          name="groupname"
          value={inputValue}
          handler={(e) => inputHandler(e.target.value)}
        />

        <div className="flex justify-between items-center mt-10">
          <button
            onClick={() => setCreateGroupModal(false)}
            className="cancel border border-black px-5 py-2 rounded-[8px] text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={actionHandler}
            disabled={inputValue === "" ? true : false}
            className="cancel disabled:cursor-not-allowed disabled:opacity-5 border border-black px-5 py-2 bg-black text-white rounded-[8px] text-sm"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
