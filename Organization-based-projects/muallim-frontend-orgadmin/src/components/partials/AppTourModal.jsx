import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function AppTourModal({ open, onClose }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setCurrentStepIndex(0);
    }
  }, [open]);

  if (!open) return null;

  const steps = [
    {
      title: "Add Teacher",
      image: "/assets/img/AddTeacher.png",
      description:
        "Transform your online presence with our top-tier web design services. We craft stunning, user-friendly websites that captivate your audience and drive results. Our expert team combines cutting-edge design, seamless functionality, and tailored strategies to elevate your brand above the competition.",
      cta: "Add Teacher",
      link: "/teachers/invite",
    },
    {
      title: "Create Class",
      image: "/assets/img/Createclass.png",
      description:
        "Transform your online presence with our top-tier web design services. we craft stunning, user-friendly websites that captivate your audience and drive results. Our expert team combines cutting-edge design, seamless functionality, and tailored strategies to elevate your brand above the competition.",
      cta: "Create Class",
      link: "/classes/create",
    },
    {
      title: "Add Student",
      image: "/assets/img/AddStudent.png",
      description:
        "Transform your online presence with our top-tier web design services. we craft stunning, user-friendly websites that captivate your audience and drive results. Our expert team combines cutting-edge design, seamless functionality, and tailored strategies to elevate your brand above the competition.",
      cta: "Add Student",
      link: "/students/add",
    },
  ];

  const totalSteps = steps.length;
  const step = steps[currentStepIndex];

  const handlePrev = () => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentStepIndex((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  };

  const handleCtaClick = () => {
    router.push(step.link);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center "
      style={{ zIndex: 9999999999 }}
    >
      <div className="absolute inset-0 bg-white/65" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden m-4 h-[700px] shadow-custom-effect">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50"
        >
          ×
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 h-full ">
          <div className="hidden lg:block p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-teal-100 h-full">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={step.image}
                alt={step.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          <div className="p-8 h-full flex flex-col">
            <p className="text-sm text-gray-500 mb-2">
              Step {currentStepIndex + 1}/{totalSteps}
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              {step.description}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCtaClick}
                className="px-5 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
              >
                {step.cta}
              </button>
            </div>

            <div className="mt-auto flex items-center justify-center gap-4 py-2">
              <button
                onClick={handlePrev}
                className="h-9 w-10 px-6 border border-black rounded-md flex items-center justify-center text-black disabled:opacity-40 "
                disabled={currentStepIndex === 0}
                aria-label="Previous step"
              >
                Prev
                {/* ‹ */}
              </button>

              <div className="flex items-center gap-2">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-2 w-2 rounded-full ${
                      idx === currentStepIndex ? "bg-gray-900" : "bg-gray-300"
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="h-9 w-10 px-6 border tracking-wide border-black bg-black rounded-md flex items-center justify-center text-white disabled:opacity-40"
                disabled={currentStepIndex === totalSteps - 1}
                aria-label="Next step"
              >
                {/* › */}
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
