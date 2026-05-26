export type MediaGalleryData = {
  title: string;
  images: { src: string; caption: string }[];
};

export const MediaGalleryView = ({
  gallery,
}: {
  gallery: MediaGalleryData;
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white ss-text-[12]">
        {gallery.title}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {gallery.images.map((image) => (
          <div key={image.src}>
            <img
              src={image.src}
              alt={image.caption}
              className="aspect-square w-full rounded-lg object-cover ss-object"
            />
            <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400 ss-text-[6]">
              {image.caption}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
