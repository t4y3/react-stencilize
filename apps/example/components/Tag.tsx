export const Tag = ({
  tag,
}: {
  tag: {
    name: string
  }
}) => {
  return (
    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 [--skeleton-color:transparent] ss-text-[4]">
      {tag.name}
    </span>
  )
}
