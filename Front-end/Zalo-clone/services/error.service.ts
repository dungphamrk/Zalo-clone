import axios, { isAxiosError } from "axios";

export const handleAxiosError = (error: any) => {
  console.log(error);
  if (isAxiosError(error)) {
    if (error.response) {
      const serverData = error.response.data;

      if (serverData.errors && serverData.errors.length > 0) {
        return new Error(serverData.errors[0].message);
      }

      return new Error(serverData.message || "Lỗi không xác định từ server");
    }

    return new Error("Không thể kết nối tới server");
  }

  return new Error("Lỗi không xác định");
};
