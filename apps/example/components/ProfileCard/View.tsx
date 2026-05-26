import { tv, type VariantProps } from "tailwind-variants";

const profileCard = tv({
  slots: {
    base: "overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/15 dark:bg-gray-900",
    avatar: "object-cover ss-object",
    name: "font-bold text-gray-900 dark:text-white ss-text-[10]",
    role: "text-sm text-gray-500 dark:text-gray-400 ss-text-[8]",
    bio: "text-sm text-gray-600 dark:text-gray-300 ss-text-[26/18]",
    links: "flex gap-2",
    link: "rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ss-text-[5]",
  },
  variants: {
    variant: {
      default: {
        base: "p-6",
        avatar: "mx-auto mb-4 size-24 rounded-full",
        name: "text-center text-lg",
        role: "text-center",
        bio: "mt-3 text-center",
        links: "mt-4 justify-center",
      },
      compact: {
        base: "flex items-center gap-4 p-4",
        avatar: "size-14 shrink-0 rounded-lg",
        name: "text-base",
        role: "",
        bio: "mt-1",
        links: "mt-2",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ProfileCardData = {
  image: string;
  name: string;
  role: string;
  bio: string;
  socials: { label: string }[];
};

type ProfileCardVariant = VariantProps<typeof profileCard>;

export const ProfileCardView = ({
  profile,
  variant,
}: {
  profile: ProfileCardData;
  variant?: ProfileCardVariant["variant"];
}) => {
  const safeVariant = typeof variant === "string" ? variant : undefined;
  const styles = profileCard({ variant: safeVariant });

  return (
    <div className={styles.base()}>
      <img src={profile.image} alt={profile.name} className={styles.avatar()} />
      <div>
        <h3 className={styles.name()}>{profile.name}</h3>
        <p className={styles.role()}>{profile.role}</p>
        <p className={styles.bio()}>{profile.bio}</p>
        <div className={styles.links()}>
          {profile.socials.map((social) => (
            <span key={social.label} className={styles.link()}>
              {social.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
