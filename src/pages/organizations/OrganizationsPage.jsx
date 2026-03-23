import { useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  RiSearchLine,
  RiBuilding2Line,
  RiMegaphoneLine,
  RiTeamLine,
  RiArrowRightLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import api from "../../lib/api";

// ── Skeleton keys ──────────────────────────────────────────────
const skeletonKeys = [1, 2, 3, 4, 5, 6];

// ── Skeleton card ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="card animate-pulse space-y-4">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-surface-200 dark:bg-dark-border shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-surface-200 dark:bg-dark-border rounded w-2/3" />
        <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-1/3" />
      </div>
    </div>
    <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-full" />
    <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-3/4" />
  </div>
);

// ── Org card ───────────────────────────────────────────────────
const OrgCard = ({ org, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={{ y: -3 }}
    className="card group flex flex-col h-full"
  >
    <div className="flex items-center gap-4 mb-4">
      {org.logoUrl ? (
        <img
          src={org.logoUrl}
          alt={org.name}
          className="w-14 h-14 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
          <RiBuilding2Line size={26} className="text-primary-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">
          {org.name}
        </h3>
        <p className="text-xs text-gray-400 dark:text-dark-muted truncate">
          {org.slug}
        </p>
      </div>
    </div>

    {org.description && (
      <p className="text-sm text-gray-500 dark:text-dark-muted line-clamp-2 mb-4 flex-1">
        {org.description}
      </p>
    )}

    <div className="mt-auto pt-4 border-t border-surface-200 dark:border-dark-border flex items-center justify-between">
      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-dark-muted">
        <span className="flex items-center gap-1">
          <RiTeamLine size={12} />
          {org._count?.members ?? 0} members
        </span>
        <span className="flex items-center gap-1">
          <RiMegaphoneLine size={12} />
          {org._count?.campaigns ?? 0} campaigns
        </span>
      </div>
      <Link
        to={`/organizations/${org.slug}`}
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

// ── Organizations Page ─────────────────────────────────────────
const OrganizationsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizations", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit,
        page,
        ...(search && { search }),
      });
      const res = await api.get(`/api/orgs?${params}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const orgs = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="container-page py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-title">Organizations</h1>
        <p className="page-subtitle">
          Browse organizations using SBE Vote for their elections.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-md mb-8"
      >
        <RiSearchLine
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search organizations..."
          value={search}
          onChange={handleSearch}
          className="input pl-9 w-full"
        />
      </motion.div>

      {!isLoading && !isError && (
        <p className="text-sm text-gray-400 dark:text-dark-muted mb-5">
          {orgs.length} organization{orgs.length !== 1 ? "s" : ""} found
          {pagination.total > limit &&
            ` · Page ${page} of ${pagination.totalPages}`}
        </p>
      )}

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
            Failed to load organizations. Please try again.
          </p>
        </div>
      ) : orgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RiBuilding2Line
            size={40}
            className="text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-500 dark:text-dark-muted">
            No organizations found.
          </p>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="mt-3 text-sm text-primary-500 hover:text-primary-600"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((org, i) => (
            <OrgCard key={org.id} org={org} index={i} />
          ))}
        </div>
      )}

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

export default OrganizationsPage;
