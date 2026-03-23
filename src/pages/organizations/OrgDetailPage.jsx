import { Link, useParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  RiArrowLeftLine,
  RiBuilding2Line,
  RiMegaphoneLine,
  RiTeamLine,
  RiTimeLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCheckboxCircleLine,

} from "react-icons/ri";
import api from "../../lib/api";

// ── Status badge config ────────────────────────────────────────
const statusConfig = {
  ACTIVE: { label: "Active", class: "badge-green" },
  DRAFT: { label: "Draft", class: "badge-gray" },
  CLOSED: { label: "Closed", class: "badge-gray" },
  CANCELLED: { label: "Cancelled", class: "badge-red" },
};

// ── Access type config ─────────────────────────────────────────
const accessConfig = {
  PUBLIC: { label: "Public", color: "text-green-500" },
  ORG_MEMBERS_ONLY: { label: "Members Only", color: "text-blue-500" },
  INVITE_ONLY: { label: "Invite Only", color: "text-purple-500" },
};

// ── Skeleton keys ──────────────────────────────────────────────
const campaignSkeletonKeys = [1, 2, 3];

// ── Campaign card ──────────────────────────────────────────────
const CampaignCard = ({ campaign, index }) => {
  const status = statusConfig[campaign.status] || {
    label: campaign.status,
    class: "badge-gray",
  };
  const access = accessConfig[campaign.accessType] || {
    label: campaign.accessType,
    color: "text-gray-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="card group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={status.class}>{status.label}</span>
        <span className={`text-xs font-medium ${access.color}`}>
          {access.label}
        </span>
      </div>

      <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
        {campaign.title}
      </h3>

      {campaign.description && (
        <p className="text-sm text-gray-500 dark:text-dark-muted line-clamp-2 mb-3">
          {campaign.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-200 dark:border-dark-border">
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-dark-muted">
          <span className="flex items-center gap-1">
            <RiCheckboxCircleLine size={12} />
            {campaign._count?.voteRecords ?? 0} votes
          </span>
          <span className="flex items-center gap-1">
            <RiTimeLine size={12} />
            {new Date(campaign.endDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <Link
          to={`/campaigns/${campaign.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
        >
          View
          <RiArrowRightLine
            size={12}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>
    </motion.div>
  );
};

// ── Org Detail Page ────────────────────────────────────────────
const OrgDetailPage = () => {
  const { slug } = useParams();

  const {
    data: org,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["org", slug],
    queryFn: async () => {
      const res = await api.get(`/api/orgs/${slug}`);
      return res.data.data;
    },
  });

  const { data: campaignsData, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["org-campaigns", slug],
    enabled: !!org?.id,
    queryFn: async () => {
      const res = await api.get(`/api/campaigns?orgId=${org.id}&limit=9`);
      return res.data;
    },
  });

  const campaigns = campaignsData?.data ?? [];

  if (isLoading) {
    return (
      <div className="container-page py-20 flex items-center justify-center">
        <RiLoader4Line size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  if (isError || !org) {
    return (
      <div className="container-page py-20 text-center">
        <RiErrorWarningLine size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-dark-muted mb-4">
          Organization not found.
        </p>
        <Link to="/organizations" className="btn-outline text-sm">
          Back to Organizations
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      {/* Back link */}
      <Link
        to="/organizations"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 mb-6 transition-colors w-fit"
      >
        <RiArrowLeftLine size={14} />
        Back to Organizations
      </Link>

      {/* Org header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Logo */}
          {org.logoUrl ? (
            <img
              src={org.logoUrl}
              alt={org.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-500/10 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
              <RiBuilding2Line size={32} className="text-primary-500" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              {org.name}
            </h1>
            <p className="text-sm text-gray-400 dark:text-dark-muted mb-3">
              {org.slug}
            </p>
            {org.description && (
              <p className="text-sm text-gray-500 dark:text-dark-muted leading-relaxed">
                {org.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted">
              <RiTeamLine size={14} className="text-primary-500" />
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {org._count?.members ?? 0}
                </strong>{" "}
                members
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted">
              <RiMegaphoneLine size={14} className="text-primary-500" />
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {org._count?.campaigns ?? 0}
                </strong>{" "}
                campaigns
              </span>
            </div>
          </div>
        </div>

        {/* Created by */}
        {org.createdBy && (
          <div className="mt-5 pt-4 border-t border-surface-200 dark:border-dark-border flex items-center gap-2">
            {org.createdBy.avatarUrl ? (
              <img
                src={org.createdBy.avatarUrl}
                alt={org.createdBy.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {org.createdBy.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-xs text-gray-400 dark:text-dark-muted">
              Created by{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {org.createdBy.name}
              </span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Campaigns section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RiMegaphoneLine size={18} className="text-primary-500" />
            Campaigns
          </h2>
          <Link
            to={`/campaigns?orgId=${org.id}`}
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            View all <RiArrowRightLine size={14} />
          </Link>
        </div>

        {loadingCampaigns ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaignSkeletonKeys.map((k) => (
              <div key={k} className="card animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 bg-surface-200 dark:bg-dark-border rounded w-16" />
                  <div className="h-5 bg-surface-200 dark:bg-dark-border rounded w-20" />
                </div>
                <div className="h-6 bg-surface-200 dark:bg-dark-border rounded w-3/4" />
                <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-full" />
              </div>
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, i) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={i} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <RiMegaphoneLine
              size={32}
              className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <p className="text-sm text-gray-400 dark:text-dark-muted">
              No campaigns yet for this organization.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OrgDetailPage;
