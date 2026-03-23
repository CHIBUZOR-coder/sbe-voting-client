import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  RiBuilding2Line,
  RiMegaphoneLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiVipCrownLine,
  RiLoader4Line,
  RiAddLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import useAuthStore from "../store/authStore";
import api from "../lib/api";

// ── Animation variants ─────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08 },
  }),
};

// ── Status badge config ────────────────────────────────────────
const statusConfig = {
  ACTIVE: { label: "Active", class: "badge-green" },
  DRAFT: { label: "Draft", class: "badge-gray" },
  CLOSED: { label: "Closed", class: "badge-gray" },
  CANCELLED: { label: "Cancelled", class: "badge-red" },
  PENDING: { label: "Pending", class: "badge-yellow" },
  APPROVED: { label: "Approved", class: "badge-green" },
  REJECTED: { label: "Rejected", class: "badge-red" },
};

// ── Base stats config ──────────────────────────────────────────
// Values are filled dynamically inside the component
const baseStats = [
  {
    key: "activeCampaigns",
    icon: RiMegaphoneLine,
    label: "Active Campaigns",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    to: "/campaigns",
  },
  {
    key: "votesCast",
    icon: RiCheckboxCircleLine,
    label: "Votes Cast",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    to: null,
  },
  {
    key: "pendingVote",
    icon: RiTimeLine,
    label: "Pending Vote",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    to: "/campaigns",
  },
];

// ── Super admin stat (conditionally added) ────────────────────
const adminStat = {
  key: "pendingApproval",
  icon: RiShieldCheckLine,
  label: "Pending Approval",
  color: "text-yellow-500",
  bg: "bg-yellow-50 dark:bg-yellow-900/20",
  to: "/admin",
};

// ── Skeleton placeholder counts ────────────────────────────────
const campaignSkeletons = [1, 2, 3];
const orgSkeletons = [1, 2];

// ── Role badge config ──────────────────────────────────────────
const roleDisplay = {
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: RiVipCrownLine,
    color: "text-yellow-500",
  },
  ORG_ADMIN: {
    label: "Org Admin",
    icon: RiBuilding2Line,
    color: "text-primary-500",
  },
  VOTER: { label: "Voter", icon: RiCheckboxCircleLine, color: "text-gray-400" },
};

// ── Empty state config ─────────────────────────────────────────
const emptyStates = {
  noVotes: {
    icon: RiCheckboxCircleLine,
    message: "You've voted in all active campaigns!",
  },
  noCampaigns: {
    icon: RiMegaphoneLine,
    message: "No active campaigns right now.",
  },
  noOrgs: {
    icon: RiBuilding2Line,
    message: "You have no organizations yet.",
  },
  noPending: {
    icon: RiShieldCheckLine,
    message: "No organizations pending approval.",
  },
};

// ── Status badge ───────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, class: "badge-gray" };
  return <span className={cfg.class}>{cfg.label}</span>;
};

// ── Campaign card ──────────────────────────────────────────────
const CampaignCard = ({ campaign, hasVoted = false, index = 0 }) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -2 }}
    className="card group"
  >
    <div className="flex items-start justify-between mb-3">
      <StatusBadge status={campaign.status} />
      <span className="text-xs text-gray-400 dark:text-dark-muted capitalize">
        {campaign.votingType?.replace("_", " ").toLowerCase()}
      </span>
    </div>

    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
      {campaign.title}
    </h3>

    {campaign.organization && (
      <p className="text-xs text-gray-400 dark:text-dark-muted flex items-center gap-1 mb-3">
        <RiBuilding2Line size={12} />
        {campaign.organization.name}
      </p>
    )}

    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-dark-muted">
        <RiCheckboxCircleLine size={12} />
        {campaign._count?.voteRecords ?? 0} votes
      </div>

      {hasVoted ? (
        <span className="flex items-center gap-1 text-xs text-primary-500 font-medium">
          <RiCheckboxCircleLine size={14} />
          Voted
        </span>
      ) : (
        <Link
          to={`/campaigns/${campaign.id}`}
          className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          Vote now
          <RiArrowRightLine
            size={12}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      )}
    </div>
  </motion.div>
);

// ── Org card ───────────────────────────────────────────────────
const OrgCard = ({ org, index = 0 }) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -2 }}
    className="card flex items-center gap-4"
  >
    {org.logoUrl ? (
      <img
        src={org.logoUrl}
        alt={org.name}
        className="w-12 h-12 rounded-xl object-cover shrink-0"
      />
    ) : (
      <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
        <RiBuilding2Line size={22} className="text-primary-500" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 dark:text-white truncate">
        {org.name}
      </p>
      <p className="text-xs text-gray-400 dark:text-dark-muted truncate">
        {org.slug}
      </p>
    </div>
    <StatusBadge status={org.status} />
  </motion.div>
);

// ── Pending org card ───────────────────────────────────────────
const PendingOrgCard = ({ org, index = 0 }) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    initial="hidden"
    animate="visible"
    className="card flex items-center gap-4"
  >
    <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
      <RiBuilding2Line size={18} className="text-yellow-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
        {org.name}
      </p>
      <p className="text-xs text-gray-400 dark:text-dark-muted">
        by {org.createdBy?.name} ·{" "}
        {new Date(org.createdAt).toLocaleDateString()}
      </p>
    </div>
    <Link to="/admin" className="btn-primary text-xs px-3 py-1.5 shrink-0">
      Review
    </Link>
  </motion.div>
);

// ── Empty state ────────────────────────────────────────────────
const EmptyState = ({ type, children }) => {
  const { icon: Icon, message } = emptyStates[type];
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-dark-surface flex items-center justify-center mb-3">
        <Icon size={22} className="text-gray-300 dark:text-gray-600" />
      </div>
      <p className="text-sm text-gray-400 dark:text-dark-muted mb-4">
        {message}
      </p>
      {children}
    </div>
  );
};

// ── Skeleton loader ────────────────────────────────────────────
const CampaignSkeleton = () => (
  <div className="card animate-pulse">
    <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-16 mb-3" />
    <div className="h-5 bg-surface-200 dark:bg-dark-border rounded w-3/4 mb-2" />
    <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-1/2" />
  </div>
);

const OrgSkeleton = () => (
  <div className="card animate-pulse flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-surface-200 dark:bg-dark-border shrink-0" />
    <div className="flex-1">
      <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-1/2 mb-2" />
      <div className="h-3 bg-surface-200 dark:bg-dark-border rounded w-1/3" />
    </div>
  </div>
);

// ── Dashboard Page ─────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuthStore();

  // Fetch active campaigns
  const { data: campaignsData, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["dashboard-campaigns"],
    queryFn: async () => {
      const res = await api.get("/api/campaigns?status=ACTIVE&limit=6");
      return res.data;
    },
  });

  // Fetch vote status for each campaign
  const { data: voteStatuses } = useQuery({
    queryKey: [
      "dashboard-vote-statuses",
      campaignsData?.data?.map((c) => c.id),
    ],
    enabled: !!campaignsData?.data?.length,
    queryFn: async () => {
      const ids = campaignsData.data.map((c) => c.id);
      const results = await Promise.all(
        ids.map((id) =>
          api
            .get(`/api/votes/${id}/status`)
            .then((r) => ({ id, hasVoted: r.data.data.hasVoted })),
        ),
      );
      return Object.fromEntries(results.map((r) => [r.id, r.hasVoted]));
    },
  });

  // Fetch user's orgs (ORG_ADMIN + SUPER_ADMIN)
  const { data: orgsData, isLoading: loadingOrgs } = useQuery({
    queryKey: ["dashboard-orgs"],
    enabled: user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN",
    queryFn: async () => {
      const res = await api.get("/api/orgs?limit=4");
      return res.data;
    },
  });

  // Fetch pending orgs (SUPER_ADMIN)
  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ["dashboard-pending-orgs"],
    enabled: user?.role === "SUPER_ADMIN",
    queryFn: async () => {
      const res = await api.get("/api/orgs/admin/pending");
      return res.data;
    },
  });

  const campaigns = campaignsData?.data ?? [];
  const orgs = orgsData?.data ?? [];
  const pendingOrgs = pendingData?.data ?? [];

  // Split campaigns into not-voted and voted
  const notVoted = campaigns.filter((c) => !voteStatuses?.[c.id]);
  const voted = campaigns.filter((c) => voteStatuses?.[c.id]);

  // Build stats with live values
  const stats = [
    ...baseStats.map((s) => ({
      ...s,
      value:
        s.key === "activeCampaigns"
          ? campaigns.length
          : s.key === "votesCast"
            ? voted.length
            : notVoted.length,
    })),
    ...(user?.role === "SUPER_ADMIN"
      ? [{ ...adminStat, value: pendingOrgs.length }]
      : []),
  ];

  const roleInfo = roleDisplay[user?.role] || roleDisplay.VOTER;

  return (
    <div className="container-page py-10 space-y-10">
      {/* ── Welcome header ──────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary-500/20"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-xl font-black">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p
              className={`text-sm flex items-center gap-1.5 mt-0.5 ${roleInfo.color}`}
            >
              <roleInfo.icon size={14} />
              {roleInfo.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/campaigns"
            className="btn-outline text-sm flex items-center gap-1.5"
          >
            <RiMegaphoneLine size={15} />
            Campaigns
          </Link>
          {(user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN") && (
            <Link
              to="/org/manage"
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              <RiAddLine size={15} />
              Manage Org
            </Link>
          )}
        </div>
      </motion.div>

      {/* ── Quick stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.key}
            variants={fadeUp}
            custom={i}
            initial="hidden"
            animate="visible"
          >
            {stat.to ? (
              <Link
                to={stat.to}
                className="card flex items-center gap-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
                >
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted">
                    {stat.label}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="card flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
                >
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted">
                    {stat.label}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Active campaigns to vote in ─────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RiMegaphoneLine size={18} className="text-primary-500" />
            Campaigns to Vote In
          </h2>
          <Link
            to="/campaigns"
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            View all <RiArrowRightLine size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingCampaigns ? (
            campaignSkeletons.map((i) => <CampaignSkeleton key={i} />)
          ) : notVoted.length > 0 ? (
            notVoted.map((campaign, i) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                hasVoted={false}
                index={i}
              />
            ))
          ) : (
            <EmptyState type="noVotes" />
          )}
        </div>
      </section>

      {/* ── Campaigns already voted in ──────────────────────── */}
      {voted.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RiCheckboxCircleLine size={18} className="text-primary-500" />
              My Votes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {voted.map((campaign, i) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                hasVoted
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── My Organizations (ORG_ADMIN + SUPER_ADMIN) ──────── */}
      {(user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN") && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RiBuilding2Line size={18} className="text-primary-500" />
              My Organizations
            </h2>
            <Link
              to="/org/manage"
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              Manage <RiArrowRightLine size={14} />
            </Link>
          </div>

          {loadingOrgs ? (
            <div className="space-y-3">
              {orgSkeletons.map((i) => (
                <OrgSkeleton key={i} />
              ))}
            </div>
          ) : orgs.length > 0 ? (
            <div className="space-y-3">
              {orgs.map((org, i) => (
                <OrgCard key={org.id} org={org} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState type="noOrgs">
              <Link
                to="/org/manage"
                className="btn-primary text-sm inline-flex items-center gap-1.5"
              >
                <RiAddLine size={15} />
                Create Organization
              </Link>
            </EmptyState>
          )}
        </section>
      )}

      {/* ── Pending Organizations (SUPER_ADMIN) ─────────────── */}
      {user?.role === "SUPER_ADMIN" && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RiVipCrownLine size={18} className="text-yellow-500" />
              Pending Approvals
              {pendingOrgs.length > 0 && (
                <span className="badge bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                  {pendingOrgs.length}
                </span>
              )}
            </h2>
            <Link
              to="/admin"
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              Admin panel <RiArrowRightLine size={14} />
            </Link>
          </div>

          {loadingPending ? (
            <div className="space-y-3">
              {orgSkeletons.map((i) => (
                <OrgSkeleton key={i} />
              ))}
            </div>
          ) : pendingOrgs.length > 0 ? (
            <div className="space-y-3">
              {pendingOrgs.map((org, i) => (
                <PendingOrgCard key={org.id} org={org} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState type="noPending" />
          )}
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
