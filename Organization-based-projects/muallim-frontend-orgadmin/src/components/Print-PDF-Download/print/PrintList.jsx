"use client";
import React, { useState, useEffect } from "react";
import { PrintSvg } from "../../helpers/storeAllSvgs";
import "./print.css";
import ReactDOMServer from "react-dom/server";
import PDFTeacherAttendanceDailyView from "../pdf-download/PDFTeacherAttendanceDailyView";
import PDFTeacherAttendanceMonthlyView from "../pdf-download/PDFTeacherAttendanceMonthlyView";
import PDFTeacherList from "../pdf-download/PDFTeacherList";
import PDFDefaultDesign from "../pdf-download/PDFDefaultDesign";
import PDFTeacherIndividualAttendanceSheet from "../pdf-download/PDFTeacherIndividualAttendanceSheet";
import { useOnboardingProfileSetupDataQuery } from "@/store/features/auth/apiSlice";
import PDFStudentList from "../pdf-download/PDFStudentList";
import PDFUserList from "../pdf-download/PDFUserList";

const PrintList = ({ viewType, data }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: orgData } = useOnboardingProfileSetupDataQuery();

  const cleanupPrintContainer = () => {
    const existingPrintContainer = document.querySelector(".print-only");
    if (existingPrintContainer && existingPrintContainer.parentNode) {
      existingPrintContainer.parentNode.removeChild(existingPrintContainer);
    }
  };

  useEffect(() => {
    return () => {
      cleanupPrintContainer();
    };
  }, []);

  const handlePrint = () => {
    try {
      setIsPrinting(true);
      cleanupPrintContainer();

      const printContainer = document.createElement("div");
      printContainer.className = "print-only";

      printContainer.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        background: white !important;
        z-index: 9999 !important;
        margin: 0 !important;
        padding: 0 !important;
      `;

      let content;
      if (viewType === "monthly") {
        content = (
          <PDFTeacherAttendanceMonthlyView data={data} orgData={orgData} />
        );
      } else if (viewType === "daily") {
        content = (
          <PDFTeacherAttendanceDailyView data={data} orgData={orgData} />
        );
      } else if (viewType === "teacherlist") {
        content = <PDFTeacherList data={data} orgData={orgData} />;
      } else if (viewType === "teacherIndividualAttendanceSheet") {
        content = (
          <PDFTeacherIndividualAttendanceSheet data={data} orgData={orgData} />
        );
      } else if (viewType === "studentlist") {
        content = <PDFStudentList data={data} orgData={orgData} />;
      } else if (viewType === "userlist") {
        content = <PDFUserList data={data} orgData={orgData} />;
      } else {
        content = <PDFDefaultDesign data={data} />;
      }

      const contentWrapper = document.createElement("div");
      contentWrapper.className = "print-content-main";
      contentWrapper.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        background: white !important;
        padding: 20px !important;
      `;

      const contentString = ReactDOMServer.renderToString(content);
      contentWrapper.innerHTML = contentString;
      printContainer.appendChild(contentWrapper);

      document.body.appendChild(printContainer);

      printContainer.offsetHeight;
      contentWrapper.offsetHeight;

      setTimeout(() => {
        window.print();
      }, 100);

      window.onafterprint = () => {
        cleanupPrintContainer();
        setIsPrinting(false);
      };
    } catch (error) {
      console.error("Print error:", error);
      cleanupPrintContainer();
      setIsPrinting(false);
    }
  };

  return (
    <div
      onClick={handlePrint}
      className={`flex items-center ${isPrinting ? "print-desktop" : ""}`}
    >
      <PrintSvg />
    </div>
  );
};

export default PrintList;
