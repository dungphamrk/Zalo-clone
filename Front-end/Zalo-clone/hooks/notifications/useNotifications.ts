import { useEffect, useMemo } from 'react';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { IMessage } from '@stomp/stompjs';

import {
  getNotifications,
  getUnseenNotificationCount,
  markAllNotificationsAsSeen,
  deleteAllNotifications,
  NotificationPage,
} from '@/services/notification/notification.service';
import { Notification } from '@/types/interfaces/notification.interface';
import { formatRelativeTime } from '@/utils/format';
import { useStomp } from '@/providers/StompProvider';

const DEFAULT_PAGE_SIZE = 10;

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (size: number) => [...notificationKeys.all, 'list', size] as const,
  unseenCount: () => [...notificationKeys.all, 'unseen-count'] as const,
};

export interface NotificationViewModel extends Notification {
  relativeTime: string;
}

const buildPageWithNotification = (notification: Notification, pageSize: number): NotificationPage => ({
  content: [notification],
  totalElements: 1,
  totalPages: 1,
  size: pageSize,
  number: 0,
  first: true,
  last: true,
  numberOfElements: 1,
  empty: false,
});

export function useNotifications(pageSize: number = DEFAULT_PAGE_SIZE) {
  const queryClient = useQueryClient();
  const { subscribe, connected } = useStomp();

  const notificationsQuery = useInfiniteQuery<NotificationPage | null>({
    queryKey: notificationKeys.list(pageSize),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getNotifications(pageParam, pageSize);
      return response.data?.items ?? null;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.last) {
        return undefined;
      }
      return lastPage.number + 1;
    },
    initialPageParam: 0,
  });

  const unseenQuery = useQuery<number>({
    queryKey: notificationKeys.unseenCount(),
    queryFn: async () => {
      const response = await getUnseenNotificationCount();
      const payload = response.data?.items;

      if (!payload) {
        return 0;
      }

      if (typeof payload.unseenCount === 'number') {
        return payload.unseenCount;
      }

      const values = Object.values(payload);
      const fallback = values.length > 0 ? Number(values[0]) : 0;
      return Number.isNaN(fallback) ? 0 : fallback;
    },
    initialData: 0,
    staleTime: 10_000,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsSeen,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.list(pageSize) }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.unseenCount() }),
      ]);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.list(pageSize) }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.unseenCount() }),
      ]);
    },
  });

  useEffect(() => {
    if (!connected) {
      return;
    }

    const unsubscribe = subscribe('/user/queue/notifications', (message: IMessage) => {
      try {
        const raw = JSON.parse(message.body) as Notification;

        queryClient.setQueryData<number>(notificationKeys.unseenCount(), (prev) => (prev ?? 0) + 1);

        queryClient.setQueryData<InfiniteData<NotificationPage | null>>(
          notificationKeys.list(pageSize),
          (oldData) => {
            if (!oldData) {
              return {
                pageParams: [0],
                pages: [buildPageWithNotification(raw, pageSize)],
              };
            }

            const { pages, pageParams } = oldData;
            if (!pages.length || !pages[0]) {
              const initialPage = buildPageWithNotification(raw, pageSize);
              return {
                pageParams: [0, ...pageParams.slice(1)],
                pages: [initialPage, ...pages.slice(1)],
              };
            }

            const [firstPage, ...restPages] = pages;
            const clippedContent = [raw, ...firstPage.content].slice(0, pageSize);

            const updatedFirst: NotificationPage = {
              ...firstPage,
              content: clippedContent,
              totalElements: (firstPage.totalElements ?? clippedContent.length) + 1,
              numberOfElements: clippedContent.length,
              empty: clippedContent.length === 0,
              first: true,
            };

            return {
              pageParams,
              pages: [updatedFirst, ...restPages],
            };
          },
        );
      } catch (error) {
        console.warn('[Notifications] Failed to parse websocket message', error);
      }
    });

    return unsubscribe;
  }, [connected, subscribe, queryClient, pageSize]);

  const notifications = useMemo<NotificationViewModel[]>(() => {
    const flat = notificationsQuery.data?.pages
      ?.filter((page): page is NotificationPage => Boolean(page))
      .flatMap((page) => page.content) ?? [];

    return flat.map((notification) => ({
      ...notification,
      relativeTime: formatRelativeTime(notification.createdAt),
    }));
  }, [notificationsQuery.data]);

  return {
    notifications,
    unseenCount: unseenQuery.data ?? 0,
    isLoading: notificationsQuery.isLoading,
    isFetching: notificationsQuery.isFetching,
    isFetchingNextPage: notificationsQuery.isFetchingNextPage,
    hasNextPage: notificationsQuery.hasNextPage ?? false,
    fetchNextPage: notificationsQuery.fetchNextPage,
    refetch: notificationsQuery.refetch,
    markAllAsSeen: markAllMutation.mutateAsync,
    isMarkingAllAsSeen: markAllMutation.isPending,
    deleteAll: deleteAllMutation.mutateAsync,
    isDeletingAll: deleteAllMutation.isPending,
    refetchUnseen: unseenQuery.refetch,
  };
}


