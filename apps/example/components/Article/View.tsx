export type ArticleData = {
  image: string;
  title: string;
  body: string;
  author: string;
  date: string;
};

export const ArticleView = ({ article }: { article: ArticleData }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/15 dark:bg-gray-900">
      <img
        src={article.image}
        alt={article.title}
        className="aspect-video w-full object-cover ss-object"
      />
      <div className="p-4 space-y-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white ss-text-[18]">
          {article.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 ss-text-[30/30/18]">
          {article.body}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span className="ss-text-[8]">{article.author}</span>
          <span className="ss-text-[6]">{article.date}</span>
        </div>
      </div>
    </div>
  );
};
