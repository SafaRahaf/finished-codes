import Donut from "@/components/charts/donut";
import { FilterSvg } from "@/components/helpers/storeAllSvgs";
import moment from "moment";

const AttendanceSummaryCard = ({
  piData,
  startDateForChart,
  endDateForChart,
}) => {
  return (
    <div className="item bg-white shadow-custom-effect xl:px-6 xl:pt-8  xl:pb-4  p-3 rounded-[12px]">
      <div className="flex  justify-between  mb-3 ">
        <div>
          <h3 className="md:text-2xl text-lg mb-2 font-bold text-black">
            Attendance Summary
          </h3>
          <p className="font-bold text-14 md:text-16">
            {moment(startDateForChart, "YYYY-MM").format("MMMM YYYY")} -
            {moment(endDateForChart, "YYYY-MM").format("MMMM YYYY")}
          </p>
        </div>
        <div>
          <FilterSvg />
        </div>
      </div>
      <div className="grid pi-grid lg:grid-cols-2 grid-cols-1 gap-3 items-center ">
        <div className="item flex flex-col ">
          {piData.map((item, index) => (
            <div
              key={index}
              className="flex  justify-start items-center gap-2 "
            >
              <div
                className={`indicator w-[12px] h-[12px] rounded-full `}
                style={{ background: item.fill }}
              ></div>
              <p className="text-10 text-[#080D1C] tracking-wide ">
                {item.name}
              </p>
              <p className="text-12 font-bold">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="item">
          <Donut
            data={piData}
            width={200}
            height={200}
            titleTop="Total"
            titleBottom="Work Days"
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummaryCard;
