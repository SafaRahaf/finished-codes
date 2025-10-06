export const uploadImageAndProcess = async ({
  uploadApi,
  imageFile,
  onSuccess,
  onError,
}) => {
  try {
    // Upload image
    const uploadResponse = await uploadApi({ image: imageFile }).unwrap();

    if (uploadResponse?.data) {
      // it will be changed depending on response
      // Call the dynamic callback function with the uploaded image URL
      if (onSuccess) {
        await onSuccess(uploadResponse.data[0]?.hd?.path);
      }
    } else {
      throw new Error("Image upload failed.");
    }
  } catch (error) {
    console.error("Error in uploadImageAndProcess:", error);
    if (onError) {
      onError(error);
    }
  }
};
