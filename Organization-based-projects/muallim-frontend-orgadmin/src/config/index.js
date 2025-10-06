const siteConfig = {
  FILE_UPLOAD_API_URL: process.env.FILE_UPLOAD_API_URL,
  FILE_BROWSE_URL: process.env.FILE_BROWSE_URL,
  CORE_API_URL: process.env.CORE_API_URL,
  API_URL_TEMP: process.env.API_URL_TEMP,
  API_VERSION: process.env.API_VERSION,
  API_VERSION_APPEND_AFTER_SERVICE:
    process.env.API_VERSION_APPEND_AFTER_SERVICE === "true" ? true : false,
  MAP_KEY: process.env.MAP_KEY,
  MAP_STATUS: process.env.MAP_STATUS === "true" ? 1 : 0,
};

export default siteConfig;
