export type CommentData = {
  avatar: string;
  author: string;
  time: string;
  body: string;
};

export const CommentView = ({ comment }: { comment: CommentData }) => {
  return (
    <div className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/15 dark:bg-gray-900">
      <img
        src={comment.avatar}
        alt={comment.author}
        className="size-10 shrink-0 rounded-full object-cover ss-object"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white ss-text-[6]">
            {comment.author}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ss-text-[4]">
            {comment.time}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 ss-text-[30/20]">
          {comment.body}
        </p>
      </div>
    </div>
  );
};
