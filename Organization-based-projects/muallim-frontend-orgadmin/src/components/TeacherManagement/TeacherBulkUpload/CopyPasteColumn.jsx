import React from "react";
import { LuSquareArrowOutUpRight } from "react-icons/lu";

const CopyPasteColumn = () => {
  return (
    <div className="mt-4 w-full">
      <p className="text-sm font-medium mb-2">Teacher Informations</p>
      <p className="text-14 text-gray-500 mb-4">
        Copy a column from your spreadsheet and paste it into the corresponding
        column below. If you're unsure, please watch the tutorial.
      </p>

      <a
        href="https://youtu.be/G5RpJwCJDqc?si=pxrZvEbrc2HKn_Cz"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="mb-4 font-bold px-4 py-2 border border-black rounded-md text-sm flex items-center gap-2">
          Watch Tutorial
          <span>
            <LuSquareArrowOutUpRight />
          </span>
        </button>
      </a>

      {/* <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">No.</th>
              <th className="px-4 py-2">First Name*</th>
              <th className="px-4 py-2">Last Name*</th>
              <th className="px-4 py-2">Date of Birth*</th>
              <th className="px-4 py-2">Sex*</th>
              <th className="px-4 py-2">Department*</th>
              <th className="px-4 py-2">Subject*</th>
              <th className="px-4 py-2">Email*</th>
              <th className="px-4 py-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{`0${i + 1}`}</td>
                {Array(8)
                  .fill(null)
                  .map((_, j) => (
                    <td key={j} className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="Paste Here"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default CopyPasteColumn;
