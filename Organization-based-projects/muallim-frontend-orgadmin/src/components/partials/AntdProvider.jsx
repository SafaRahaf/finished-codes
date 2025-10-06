"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ConfigProvider } from "antd";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

const AntdProvider = ({ children }) => {
  const [cache] = useState(() => createCache());

  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    );
  });

  const theme = {
    token: {
      zIndexPopup: 999999999, // High z-index for notifications and popups
      zIndexModal: 999999999, // High z-index for modals
      zIndexTooltip: 999999999, // High z-index for tooltips
      zIndexNotification: 999999999, // High z-index for notifications
    },
  };

  return (
    <StyleProvider cache={cache}>
      <ConfigProvider theme={theme}>{children}</ConfigProvider>
    </StyleProvider>
  );
};

export default AntdProvider;
