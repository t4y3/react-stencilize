export type StatData = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
};

export type StatsData = {
  stats: StatData[];
};

export const StatsView = ({ data }: { data: StatsData }) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {data.stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/15 dark:bg-gray-900"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 ss-text-[8]">
            {stat.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white ss-text-[6]">
            {stat.value}
          </p>
          <p
            className={`mt-1 text-sm font-medium ss-text-[4] ${
              stat.positive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  );
};
