import { useRef, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import CopyPasteColumn from "./CopyPasteColumn";
import { LuSheet } from "react-icons/lu";

const AddMultipleStudent = ({ onCancel }) => {
  const [uploadMethod, setUploadMethod] = useState("spreadsheet");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 3 * 1024 * 1024 && file.name.endsWith(".xlsx")) {
      setFileName(file.name);
    } else {
      alert("Only .xlsx files under 3MB are allowed.");
      e.target.value = null;
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    fileInputRef.current.value = null;
  };
  return (
    <div className=" p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Add Multiple Students</h2>
        <p className="text-sm text-gray-500">Step 1/3</p>
      </div>

      <div className="flex items-center gap-6 mb-4 border-y py-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="uploadMethod"
            value="spreadsheet"
            checked={uploadMethod === "spreadsheet"}
            onChange={() => setUploadMethod("spreadsheet")}
          />
          <span>Upload Spread Sheet</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="uploadMethod"
            value="copyPaste"
            color="black"
            checked={uploadMethod === "copyPaste"}
            onChange={() => setUploadMethod("copyPaste")}
          />
          <span>Copy-Paste Columns</span>
        </label>
      </div>

      {uploadMethod === "spreadsheet" ? (
        <>
          <div className="flex-row md:flex items-center gap-3 mb-2 ">
            <button
              onClick={handleFileClick}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              <FaCloudUploadAlt />
              Upload Your .xlsx File
            </button>

            {fileName && (
              <div className="flex items-center gap-1 text-sm text-gray-700 ">
                <span className="truncate max-w-xs ">{fileName}</span>
                <button onClick={handleRemoveFile}>
                  <IoClose className="text-gray-500 hover:text-red-500" />
                </button>
              </div>
            )}

            <input
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <p className="text-12 text-gray-500 my-4 tracking-wider">
            Upload the excel file of student information. File formats - .xlsx.
            File should not be more than 3 MB.
          </p>

          <a
            href="#"
            className="text-sm text-black font-medium underline flex items-center gap-1 mb-4"
          >
            Download Spreadsheet Template <LuSheet />
          </a>

          <hr className="mb-4" />
        </>
      ) : (
        <CopyPasteColumn></CopyPasteColumn>
      )}

      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-5 py-2 border border-black rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800">
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddMultipleStudent;
