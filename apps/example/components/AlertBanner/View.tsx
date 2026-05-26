import clsx from "clsx";

export type AlertBannerData = {
  variant: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
};

const variantStyles = {
  info: {
    container: "border-blue-300 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-950/50",
    icon: "text-blue-500",
    title: "text-blue-800 dark:text-blue-200",
    message: "text-blue-700 dark:text-blue-300",
    button: "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900",
  },
  success: {
    container: "border-green-300 bg-green-50 dark:border-green-500/30 dark:bg-green-950/50",
    icon: "text-green-500",
    title: "text-green-800 dark:text-green-200",
    message: "text-green-700 dark:text-green-300",
    button: "text-green-500 hover:bg-green-100 dark:hover:bg-green-900",
  },
  warning: {
    container: "border-yellow-300 bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-950/50",
    icon: "text-yellow-500",
    title: "text-yellow-800 dark:text-yellow-200",
    message: "text-yellow-700 dark:text-yellow-300",
    button: "text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900",
  },
  error: {
    container: "border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-950/50",
    icon: "text-red-500",
    title: "text-red-800 dark:text-red-200",
    message: "text-red-700 dark:text-red-300",
    button: "text-red-500 hover:bg-red-100 dark:hover:bg-red-900",
  },
} as const;

const icons = {
  info: "\u2139\uFE0F",
  success: "\u2705",
  warning: "\u26A0\uFE0F",
  error: "\u274C",
} as const;

export const AlertBannerView = ({ alert }: { alert: AlertBannerData }) => {
  const styles = variantStyles[alert.variant] ?? variantStyles.info;

  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-lg border p-4",
        styles.container,
      )}
    >
      <span className={clsx("text-xl", styles.icon)}>
        {icons[alert.variant]}
      </span>
      <div className="flex-1">
        <h4 className={clsx("font-semibold ss-text-[10]", styles.title)}>
          {alert.title}
        </h4>
        <p className={clsx("mt-1 text-sm ss-text-[24/16]", styles.message)}>
          {alert.message}
        </p>
      </div>
      <button
        type="button"
        className={clsx("rounded p-1 transition-colors", styles.button)}
      >
        &times;
      </button>
    </div>
  );
};
