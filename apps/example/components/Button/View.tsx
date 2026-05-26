import { cva, type VariantProps } from "class-variance-authority";

const button = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      intent: {
        primary:
          "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary:
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-white/15 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
        danger:
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    compoundVariants: [
      {
        intent: "primary",
        size: "lg",
        class: "uppercase tracking-wide",
      },
    ],
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  },
);

export type ButtonData = {
  label: string;
} & VariantProps<typeof button>;

export const ButtonView = ({ button: btn }: { button: ButtonData }) => {
  const intent = typeof btn.intent === "string" ? btn.intent : undefined;
  const size = typeof btn.size === "string" ? btn.size : undefined;

  return (
    <button
      type="button"
      className={button({ intent, size })}
    >
      <span className="ss-text-[6]">{btn.label}</span>
    </button>
  );
};

export const ButtonGridView = ({
  buttons,
}: {
  buttons: ButtonData[];
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {buttons.map((btn) => (
        <ButtonView key={`${btn.intent}-${btn.size}-${btn.label}`} button={btn} />
      ))}
    </div>
  );
};
