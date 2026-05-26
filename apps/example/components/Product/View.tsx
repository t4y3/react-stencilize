export type ProductData = {
  image: string;
  name: string;
  price: string;
  description: string;
  tags: { name: string }[];
};

export const ProductView = ({ product }: { product: ProductData }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/15 dark:bg-gray-900">
      <img
        src={product.image}
        alt={product.name}
        className="aspect-square w-full object-cover ss-object"
      />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white ss-text-[10]">
            {product.name}
          </h3>
          <span className="text-lg font-semibold text-green-700 dark:text-green-400 ss-text-[4]">
            {product.price}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 ss-text-[20/14]">
          {product.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <span
              key={tag.name}
              className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-200 dark:text-blue-800 [--skeleton-color:transparent] ss-text-[4]"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
