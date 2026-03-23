import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiCalendarLine,
  RiShieldCheckLine,
  RiVipCrownLine,
  RiBuilding2Line,
  RiUserLine,
} from "react-icons/ri";
import useAuthStore from "../../store/authStore";

// ── Info rows config ───────────────────────────────────────────
// Each row is built dynamically from the user object
const buildInfoRows = (user) => [
  {
    icon: RiShieldCheckLine,
    label: "Email Verification",
    value: user?.isVerified ? "Verified" : "Not Verified",
    valueColor: user?.isVerified
      ? "text-primary-600 dark:text-primary-400"
      : "text-red-500",
    statusIcon: user?.isVerified ? RiCheckboxCircleLine : RiErrorWarningLine,
    statusColor: user?.isVerified ? "text-primary-500" : "text-red-500",
  },
  {
    icon: RiUserLine,
    label: "Account Role",
    value: user?.role
      ?.replace("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    valueColor: "text-gray-700 dark:text-gray-200",
    statusIcon:
      user?.role === "SUPER_ADMIN"
        ? RiVipCrownLine
        : user?.role === "ORG_ADMIN"
          ? RiBuilding2Line
          : RiCheckboxCircleLine,
    statusColor:
      user?.role === "SUPER_ADMIN"
        ? "text-yellow-500"
        : user?.role === "ORG_ADMIN"
          ? "text-primary-500"
          : "text-gray-400",
  },
  {
    icon: RiCalendarLine,
    label: "Member Since",
    value: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—",
    valueColor: "text-gray-700 dark:text-gray-200",
    statusIcon: null,
    statusColor: null,
  },
];

const AccountInfo = () => {
  const { user } = useAuthStore();
  const infoRows = buildInfoRows(user);

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">
          Account Information
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Your account details and status.
        </p>
      </div>

      <div className="space-y-4">
        {infoRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-3 border-b border-surface-200 dark:border-dark-border last:border-0"
          >
            {/* Label */}
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-dark-muted">
              <row.icon size={16} className="text-gray-400" />
              {row.label}
            </div>

            {/* Value */}
            <div
              className={`flex items-center gap-1.5 text-sm font-medium ${row.valueColor}`}
            >
              {row.statusIcon && (
                <row.statusIcon size={15} className={row.statusColor} />
              )}
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountInfo;
