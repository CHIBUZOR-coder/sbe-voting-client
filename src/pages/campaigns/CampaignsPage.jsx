import { useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  RiSearchLine,
  RiFilterLine,
  RiMegaphoneLine,
  RiBuilding2Line,
  RiTimeLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import api from "../../lib/api";

// ── Filter options ─────────────────────────────────────────────
const statusFilters = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Closed", value: "CLOSED" },
  { label: "Draft", value: "DRAFT" },
];

const accessFilters = [
  { label: "All Types", value: "" },
  { label: "Public", value: "PUBLIC" },
  { label: "Members Only", value: "ORG_MEMBERS_ONLY" },
  { label: "Invite Only", value: "INVITE_ONLY" },
];

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

// ── Status sort order — ACTIVE first ──────────────────────────
const statusOrder = { ACTIVE: 0, DRAFT: 1, CLOSED: 2, CANCELLED: 3 };

// ── Skeleton card ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="card animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-5 bg-surface-200 dark:bg-dark-border rounded w-16" />
      <div className="h-5 bg-surface-200 dark:bg-dark-border rounded w-20" />
    </div>
    <div className="h-6 bg-surface-200 dark:bg-dark-border rounded w-3/4" />
    <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-1/2" />
    <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-full" />
  </div>
);

const skeletonKeys = [1, 2, 3, 4, 5, 6];

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

  const endDate = new Date(campaign.endDate);
  const now = new Date();
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className="card group flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={status.class}>{status.label}</span>
        <span className={`text-xs font-medium ${access.color}`}>
          {access.label}
        </span>
      </div>

      <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 flex-1">
        {campaign.title}
      </h3>

      {campaign.organization && (
        <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-muted mb-3">
          <RiBuilding2Line size={12} />
          {campaign.organization.name}
        </p>
      )}

      {campaign.description && (
        <p className="text-sm text-gray-500 dark:text-dark-muted line-clamp-2 mb-4">
          {campaign.description}
        </p>
      )}

      <div className="mt-auto pt-4 border-t border-surface-200 dark:border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-dark-muted">
          <span className="flex items-center gap-1">
            <RiCheckboxCircleLine size={12} />
            {campaign._count?.voteRecords ?? 0} votes
          </span>
          {campaign.status === "ACTIVE" && daysLeft > 0 && (
            <span className="flex items-center gap-1 text-orange-500">
              <RiTimeLine size={12} />
              {daysLeft}d left
            </span>
          )}
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

// ── Campaigns Page ─────────────────────────────────────────────
const CampaignsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [accessFilter, setAccess] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaigns", search, statusFilter, accessFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ limit, page });

      if (search) params.set("search", search);

      // ── Status filter ────────────────────────────────────
      // "" (All) → allStatuses=true so backend returns everything
      // specific status → pass it directly
      if (statusFilter) {
        params.set("status", statusFilter);
      } else {
        params.set("allStatuses", "true");
      }

      const res = await api.get(`/api/campaigns?${params}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const campaigns = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  // ── Sort ACTIVE first on the frontend ────────────────────
  const sorted = [...campaigns].sort(
    (a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99),
  );

  // ── Client-side access filter ─────────────────────────────
  const filtered = accessFilter
    ? sorted.filter((c) => c.accessType === accessFilter)
    : sorted;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
  };

  return (
    <div className="container-page py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-title">Campaigns</h1>
        <p className="page-subtitle">
          Browse and participate in active voting campaigns.
        </p>
      </motion.div>

      {/* Search and status filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-8"
      >
        <div className="relative flex-1">
          <RiSearchLine
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={handleSearchChange}
            className="input pl-9 w-full"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <RiFilterLine size={16} className="text-gray-400 shrink-0" />
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusChange(f.value)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  statusFilter === f.value
                    ? "bg-primary-500 text-white"
                    : "bg-surface-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-surface-200 dark:hover:bg-dark-border"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Access type filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 mb-8 flex-wrap"
      >
        {accessFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setAccess(f.value);
              setPage(1);
            }}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
              ${
                accessFilter === f.value
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-surface-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-surface-200 dark:hover:bg-dark-border"
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Results count */}
      {!isLoading && !isError && (
        <p className="text-sm text-gray-400 dark:text-dark-muted mb-5">
          {filtered.length} campaign{filtered.length !== 1 ? "s" : ""} found
          {pagination.total > limit &&
            ` · Page ${page} of ${pagination.totalPages}`}
        </p>
      )}

      {/* Campaign grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletonKeys.map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RiErrorWarningLine size={40} className="text-red-400 mb-3" />
          <p className="text-gray-500 dark:text-dark-muted">
            Failed to load campaigns. Please try again.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RiMegaphoneLine
            size={40}
            className="text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-500 dark:text-dark-muted">
            No campaigns found.
          </p>
          {(search || statusFilter || accessFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setAccess("");
                setPage(1);
              }}
              className="mt-3 text-sm text-primary-500 hover:text-primary-600"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((campaign, i) => (
            <CampaignCard key={campaign.id} campaign={campaign} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline text-sm px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-dark-muted px-4">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
            className="btn-outline text-sm px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
