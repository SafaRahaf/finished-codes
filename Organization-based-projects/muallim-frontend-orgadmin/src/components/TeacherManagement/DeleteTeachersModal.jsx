import { Modal } from "antd";
import nextConfig from "../../../next.config.mjs";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const DeleteTeachersModal = ({
  isVisible,
  onCancel,
  onConfirm,
  selectedInfo,
  onRemoveTeacher,
}) => {
  return (
    <Modal
      title={
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-red-600 gap-2 font-semibold text-base my-2">
            <img
              src="/assets/img/icons/red warning.png"
              alt="Warning"
              className="w-5 h-5"
            />
            Delete Teacher Profile?
          </div>
          <hr className="border-gray-200" />
        </div>
      }
      open={isVisible}
      footer={null}
      onCancel={onCancel}
      centered
      styles={{
        body: { padding: "12px" },
      }}
    >
      <div className="space-y-4">
        <p className="text-gray-700 text-base">
          Are you sure you want to delete <strong>{selectedInfo.length}</strong>{" "}
          {selectedInfo.length === 1 ? "teacher" : "teachers"} profile
          {selectedInfo.length === 1 ? "" : "s"} below?
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {selectedInfo.map((teacher) => (
            <div
              key={teacher.id}
              className="flex justify-between items-center p-2"
            >
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={
                    teacher?.profile_picture
                      ? `${process.env.FILE_BROWSE_URL}${teacher?.profile_picture}`
                      : DefaultProfile.src
                  }
                  alt=""
                />
                <div className="flex items-center gap-1">
                  <p className="text-gray-800 font-medium">
                    {teacher.first_name} {teacher.last_name} -
                  </p>
                  <p className="text-gray-500 text-sm">{teacher.unique_id}</p>
                </div>
              </div>
              <button
                className="text-gray-500 font-bold text-lg px-2"
                onClick={() => onRemoveTeacher(teacher.id)}
                aria-label="Remove teacher"
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <hr className="border-gray-200" />

        <div className="flex justify-between pt-2">
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-base font-semibold"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="border border-gray-400 px-6 py-2 rounded-md text-base font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteTeachersModal;
