import React, { useState } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";

const Donut = ({
  data,
  width = 200,
  height = 200,
  titleTop,
  titleBottom,
  studentCount,
  totalDay,
  totalWorkDay,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const totalWorkDayCount = totalWorkDay !== undefined ? totalWorkDay : 1;

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;
    return (
      <g>
        {/* Optional Top Title */}
        {titleTop && (
          <text
            x={cx}
            y={cy - 28}
            textAnchor="middle"
            fill={titleTop === "Deficit" ? "red" : "#24222A"}
            fontSize="10"
            className="tracking-wider"
          >
            {titleTop}
          </text>
        )}

        {/* Central Value */}
        <text
          x={cx}
          y={cy}
          dy={8}
          textAnchor="middle"
          fill="#000"
          fontSize="24"
          fontWeight="bold"
        >
          {typeof studentCount === "number"
            ? studentCount
            : totalWorkDayCount
            ? totalWorkDayCount
            : // : totalDay
            // ? totalDay
            data
            ? data.reduce((acc, cur) => acc + cur.value, 0)
            : 0}
        </text>

        {/* Optional Bottom Title */}
        {titleBottom && (
          <text
            x={cx}
            y={cy + 32}
            textAnchor="middle"
            fill={titleBottom === "Deficit" ? "red" : "#24222A"}
            fontSize="10"
            className="tracking-wider"
          >
            {titleBottom}
          </text>
        )}

        {/* Donut Sectors */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="pie-chart-wrapper" style={{ width: width, height: height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            style={{ outline: "none" }}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Donut;
