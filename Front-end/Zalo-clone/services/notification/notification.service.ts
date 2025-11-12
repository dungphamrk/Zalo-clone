import { Notification, NotificationSummary } from '@/types/interfaces/notification.interface';
import {
  PaginationResponse,
  SingleResponse,
  PageData,
} from '@/utils/response-data';
import { axiosInstance } from '@/utils/axios-instance';
import { handleAxiosError } from '../error.service';

const NOTIFICATION_ENDPOINT = '/notifications';

export const getNotifications = async (
  page: number = 0,
  size: number = 10,
): Promise<PaginationResponse<Notification>> => {
  try {
    const response = await axiosInstance.get(`${NOTIFICATION_ENDPOINT}`, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

export const markAllNotificationsAsSeen = async (): Promise<SingleResponse<Record<string, number>>> => {
  try {
    const response = await axiosInstance.post(`${NOTIFICATION_ENDPOINT}/mark-all-as-seen`);
    return response.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

export const getUnseenNotificationCount = async (): Promise<SingleResponse<NotificationSummary>> => {
  try {
    const response = await axiosInstance.get(`${NOTIFICATION_ENDPOINT}/unseen-count`);
    return response.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

export const deleteAllNotifications = async (): Promise<SingleResponse<Record<string, number>>> => {
  try {
    const response = await axiosInstance.delete(`${NOTIFICATION_ENDPOINT}/all`);
    return response.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

export type NotificationPage = PageData<Notification>;


