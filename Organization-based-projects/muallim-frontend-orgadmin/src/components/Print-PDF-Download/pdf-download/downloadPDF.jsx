"use client";
import React, { useRef, useState } from "react";
import { notification } from "antd";
import { DownloadBtnSvg, ShareSvg } from "@/components/helpers/storeAllSvgs";
import PDFTeacherAttendanceDailyView from "./PDFTeacherAttendanceDailyView";
import PDFTeacherAttendanceMonthlyView from "./PDFTeacherAttendanceMonthlyView";
import PrintList from "../print/PrintList";
import PDFTeacherIndividualAttendanceSheet from "./PDFTeacherIndividualAttendanceSheet";
import PDFDefaultDesign from "./PDFDefaultDesign";
import { useOnboardingProfileSetupDataQuery } from "@/store/features/auth/apiSlice";
import PDFStudentList from "./PDFStudentList";

const PDFDownload = ({ data, viewType = "daily" }) => {
  const pdfRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: orgData } = useOnboardingProfileSetupDataQuery();

  // console.log("PDFDownload data:", data, "viewType:", viewType);

  const waitForImages = (element) => {
    const images = element.querySelectorAll("img");
    const promises = [];

    images.forEach((img) => {
      if (!img.complete || img.naturalHeight === 0) {
        promises.push(
          new Promise((resolve) => {
            img.onload = img.onerror = resolve;
          })
        );
      }
    });

    return Promise.all(promises);
  };

  const generatePDF = async () => {
    try {
      if (!data || !orgData) {
        notification.error({
          message: "Data Error",
          description: "Data is still loading. Please try again in a moment.",
        });
        return;
      }

      setIsGenerating(true);

      // Show starting notification
      const startNotification = notification.info({
        message: "Please wait...",
        description: "Preparing to generate your PDF report",
        duration: 0, // Keep it open until we dismiss it
      });

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const originalWrapper = document.querySelector(".print-content");

      if (!originalWrapper) {
        notification.error({
          message: "Content Error",
          description: "Content not found. Make sure .print-content exists.",
        });
        return;
      }

      // Clone the wrapper into a visible container
      const cloneWrapper = originalWrapper.cloneNode(true);
      cloneWrapper.style.position = "absolute";
      cloneWrapper.style.top = "0";
      cloneWrapper.style.left = "0";
      cloneWrapper.style.zIndex = "-9999";
      cloneWrapper.style.opacity = "1";
      cloneWrapper.style.visibility = "visible";
      cloneWrapper.style.display = "block";
      cloneWrapper.id = "print-clone-temp";

      document.body.appendChild(cloneWrapper);

      const pageElements = cloneWrapper.querySelectorAll(".pdf-page");

      if (pageElements.length === 0) {
        throw new Error("No .pdf-page elements found inside cloned content.");
      }

      const pdf = new jsPDF("portrait", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let isFirstPage = true;

      for (const [index, pageEl] of pageElements.entries()) {
        console.log(`Rendering page ${index + 1}...`);

        // Wait for images + fonts
        const waitForFonts = document.fonts
          ? document.fonts.ready
          : Promise.resolve();
        await Promise.all([waitForImages(pageEl), waitForFonts]);
        await new Promise((resolve) => setTimeout(resolve, 300)); // small delay

        const rect = pageEl.getBoundingClientRect();
        console.log(`Page size: ${rect.width} x ${rect.height}`);
        if (rect.width === 0 || rect.height === 0) {
          throw new Error(`.pdf-page at index ${index} has no size.`);
        }

        const canvas = await html2canvas(pageEl, {
          scale: 1,
          useCORS: true,
          allowTaint: false,
          scrollY: -window.scrollY,
        });

        const imgData = canvas.toDataURL("image/png");
        if (!imgData.startsWith("data:image/png")) {
          throw new Error(
            "Image data generation failed or format not recognized."
          );
        }

        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pageWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`teacher-attendance-${viewType}.pdf`);

      // Dismiss the "Please wait..." notification
      notification.destroy();

      // Show success notification
      notification.success({
        message: "PDF Generated Successfully",
        description: `Your ${viewType} attendance report has been downloaded.`,
        duration: 4,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);

      // Dismiss the "Please wait..." notification
      notification.destroy();

      notification.error({
        message: "PDF Generation Failed",
        description:
          "An error occurred while generating the PDF. Please try again.",
        duration: 5,
      });
    } finally {
      // Clean up cloned content
      const clone = document.getElementById("print-clone-temp");
      if (clone) clone.remove();
      setIsGenerating(false);
    }
  };

  const sharePDF = async () => {
    try {
      setIsGenerating(true);

      // Show starting notification
      notification.info({
        message: "Preparing to Share",
        description: "Generating PDF for sharing...",
        duration: 2,
      });

      const html2pdf = (await import("html2pdf.js")).default;
      // const element = pdfRef.current;
      const element = pdfRef.current;

      const opt = {
        margin: [2, 2, 2, 2],
        filename: `teacher-attendance-${viewType}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      element.style.display = "block";

      const pdf = await html2pdf().set(opt).from(element).outputPdf("blob");
      const file = new File([pdf], `teacher-attendance-${viewType}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "Teacher Attendance Sheet",
          text: "Please find attached the teacher attendance sheet.",
        });

        notification.success({
          message: "PDF Shared Successfully",
          description: "The PDF has been shared successfully.",
          duration: 3,
        });
      } else {
        // Fallback for browsers that don't support sharing
        const url = URL.createObjectURL(file);
        window.open(url, "_blank");

        notification.success({
          message: "PDF Generated",
          description: "PDF has been generated and opened in a new tab.",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      notification.error({
        message: "Share Failed",
        description: "Failed to share the PDF. Please try again.",
        duration: 4,
      });
    } finally {
      // setIsGenerating(false);
      // pdfRef.current.style.display = "none";
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={sharePDF}
          disabled={isGenerating}
          className="flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
          title="Share PDF"
        >
          <ShareSvg height={26} width={26} />
        </button>
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
          title="Download PDF"
        >
          <DownloadBtnSvg height={26} width={26} />
        </button>
        <div>
          <PrintList viewType={viewType} data={data} />
        </div>
      </div>
      <div className={`no-print ${isGenerating ? "generating" : ""}`}>
        <div ref={pdfRef} style={{ display: "none" }} className="pdf-content">
          {viewType === "daily" ? (
            <PDFTeacherAttendanceDailyView data={data} orgData={orgData} />
          ) : viewType === "monthly" ? (
            <PDFTeacherAttendanceMonthlyView data={data} orgData={orgData} />
          ) : viewType === "teacherIndividualAttendanceSheet" ? (
            <PDFTeacherIndividualAttendanceSheet
              data={data}
              orgData={orgData}
            />
          ) : viewType === "studentlist" ? (
            <PDFStudentList data={data} orgData={orgData} />
          ) : (
            <PDFDefaultDesign />
          )}
        </div>
      </div>
    </>
  );
};

export default PDFDownload;
