import Link from "next/link";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";

const AddSingleOrMultiple = ({ onNext, onCancel }) => {
  return (
    <>
      <div className="">
        <h2 className="text-2xl font-semibold mb-4">Add New Teacher</h2>

        <div className="space-y-1 mb-6 md:w-[405px]">
          <Link href="/teachers/invite">
            <button className="w-full text-left  py-3 border-y border-[#E4E6EA]  flex gap-2 items-center">
              Add Single Teacher{" "}
              <span>
                <MdKeyboardArrowRight />
              </span>
            </button>
          </Link>

          <button
            onClick={() => onNext()}
            className="w-full text-left  py-3 border-b border-[#E4E6EA] flex gap-2 items-center"
          >
            Add Multiple Teacher{" "}
            <span>
              {" "}
              <MdKeyboardArrowRight />
            </span>
          </button>
        </div>

        <div className="flex justify-between gap-2">
          <button
            onClick={onCancel}
            className="px-5 py-2 border border-black rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={() => onNext()}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default AddSingleOrMultiple;
