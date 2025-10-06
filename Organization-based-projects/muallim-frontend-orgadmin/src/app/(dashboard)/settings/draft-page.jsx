"use client";
import { Tabs } from "antd";
import Link from "next/link";
import React from "react";
import Tab1 from "./tab1";
import Tab2 from "./tab2";
import Tab3 from "./tab3";

const Settings = () => {
  const onChange = (key) => {
    console.log(key);
  };

  const items = [
    {
      key: "1",
      label: "General",
      children: <Tab1 />,
    },
    {
      key: "2",
      label: "Organization",
      children: <Tab2 />,
    },
    {
      key: "3",
      label: "Profile",
      children: <Tab3 />,
    },
  ];
  return (
    <div>
      <div className="mt-0">
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </div>
    </div>
  );
};

export default Settings;
