import { apiSlice } from "../../api/apiSlice";
import siteConfig from "@/config";
// Inject all authentication related api in main api slice
export const fileUploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // invite teacher
    uploadPhoto: builder.mutation({
      query: ({ image }) => {
        const bodyFormData = new FormData();
        bodyFormData.append("image", image);
        bodyFormData.append("sizes", "hd,medium,thumbnail");
        return {
          meta: {
            baseUrl: siteConfig.FILE_UPLOAD_API_URL, // Override base URL
          },
          url: `api/v1/blob/images/upload/`,
          method: "POST",
          body: bodyFormData,
          formData: true,
        };
      },
    }),
  }),
});
export const { useUploadPhotoMutation } = fileUploadApi;
