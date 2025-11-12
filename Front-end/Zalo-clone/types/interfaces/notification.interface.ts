import { NotificationType } from '@/enums/notification.enum';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  referenceId?: string | null;
  actorAvatar?: string | null;
  seen: boolean;
  createdAt: string;
}

export interface NotificationSummary {
  unseenCount: number;
}


