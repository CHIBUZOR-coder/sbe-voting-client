import {
  RiVipCrownLine,
  RiBuilding2Line,
  RiCheckboxCircleLine,
  RiMailLine,
} from "react-icons/ri";
import useAuthStore from "../../store/authStore";

// ── Role config ────────────────────────────────────────────────
const roleConfig = {
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: RiVipCrownLine,
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  ORG_ADMIN: {
    label: "Org Admin",
    icon: RiBuilding2Line,
    color: "text-primary-500",
    bg: "bg-primary-50 dark:bg-primary-900/20",
  },
  VOTER: {
    label: "Voter",
    icon: RiCheckboxCircleLine,
    color: "text-gray-500",
    bg: "bg-surface-100 dark:bg-dark-surface",
  },
};

const ProfileHeader = () => {
  const { user } = useAuthStore();
  const role = roleConfig[user?.role] || roleConfig.VOTER;

  return (
    <div className="card flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* ── Avatar ──────────────────────────────────────────── */}
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-500/20 shrink-0"
        />
      ) : (
        <div
          className="
          w-20 h-20 rounded-2xl shrink-0
          bg-primary-500 text-white
          flex items-center justify-center
          text-3xl font-black
          ring-4 ring-primary-500/20
        "
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      )}

      {/* ── Info ────────────────────────────────────────────── */}
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          {user?.name}
        </h2>

        <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-gray-500 dark:text-dark-muted mt-1">
          <RiMailLine size={14} />
          {user?.email}
        </p>

        <div
          className={`
          inline-flex items-center gap-1.5 mt-3
          px-3 py-1 rounded-full text-sm font-medium
          ${role.color} ${role.bg}
        `}
        >
          <role.icon size={14} />
          {role.label}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
