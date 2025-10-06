import { Modal } from "antd";
import { useState } from "react";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const ConfirmDeleteModal = ({
  isVisible,
  onCancel,
  onConfirm,
  selectedInfo,
}) => {
  const [note, setNote] = useState("");
  const maxLength = 120;

  const handleConfirm = () => {
    onConfirm(note);
  };

  return (
    <Modal
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      centered
      closeIcon={null}
      styles={{ body: { padding: "12px" } }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <img
          src="/assets/img/icons/red warning.png"
          alt="Warning"
          className="w-5 h-5"
        />
        <h2 className="text-lg font-semibold text-red-500">
          Delete Teacher Profile?
        </h2>
      </div>

      {/* Body */}
      <div className="mb-4">
        <p className="text-gray-700 mb-4 text-16">
          Deleting these teacher profiles will permanently erase their data,
          including attendance, activities, and progress. Are you sure you want
          to proceed?
        </p>

        {/* Teacher Avatars */}
        <div className="flex -space-x-2 mb-4">
          {selectedInfo?.map((teacher, index) => (
            <img
              key={teacher?.id}
              src={
                teacher?.profile_picture
                  ? `${process.env.FILE_BROWSE_URL}${teacher?.profile_picture}`
                  : DefaultProfile.src
              }
              alt=""
              className="w-10 h-10 rounded-full border-2 border-white"
              style={{ zIndex: selectedInfo.length - index }}
            />
          ))}
        </div>

        {/* Note Input */}
        <div className="mt-4">
          <label className="text-gray-700 mb-2 block font-bold">
            Type Note
          </label>
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, maxLength))}
              className="w-full p-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[120px] resize-none"
              placeholder="Enter your reason for deletion..."
            />
            <span className="absolute bottom-2 right-2 text-gray-400 text-sm">
              {note.length}/{maxLength}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onCancel}
          className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
