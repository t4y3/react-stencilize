export type NotificationData = {
  icon: string;
  actor: string;
  action: string;
  target: string;
  time: string;
};

export const NotificationView = ({
  notification,
}: {
  notification: NotificationData;
}) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-white/15 dark:bg-gray-900">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base dark:bg-gray-800 [--skeleton-radius:9999px] ss-object"
      >
        {notification.icon}
      </span>
      <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-gray-900 dark:text-white ss-text-[5]">
          {notification.actor}
        </span>{" "}
        <span className="ss-text-[4]">{notification.action}</span>{" "}
        <span className="font-medium text-blue-600 dark:text-blue-400 ss-text-[6]">
          {notification.target}
        </span>
      </p>
      <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 ss-text-[3]">
        {notification.time}
      </span>
    </div>
  );
};
