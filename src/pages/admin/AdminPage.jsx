import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RiVipCrownLine,
  RiBuilding2Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiLoader4Line,
  RiShieldCheckLine,
  RiUserLine,
  RiCalendarLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import api from "../../lib/api";

// ── Tab config ─────────────────────────────────────────────────
const tabs = [
  { key: "pending", label: "Pending", icon: RiBuilding2Line },
  { key: "approved", label: "Approved", icon: RiCheckboxCircleLine },
  { key: "rejected", label: "Rejected", icon: RiCloseCircleLine },
];

// ── Status badge config ────────────────────────────────────────
const statusConfig = {
  PENDING: { label: "Pending", class: "badge-yellow" },
  APPROVED: { label: "Approved", class: "badge-green" },
  REJECTED: { label: "Rejected", class: "badge-red" },
};

// ── Skeleton keys ──────────────────────────────────────────────
const skeletonKeys = [1, 2, 3];

// ── Org row ────────────────────────────────────────────────────
const OrgRow = ({ org, onApprove, onReject, approving, rejecting }) => {
  const status = statusConfig[org.status?.toUpperCase()] || {
    label: org.status,
    class: "badge-gray",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
      {/* Logo */}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-bold text-gray-900 dark:text-white truncate">
            {org.name}
          </p>
          <span className={status.class}>{status.label}</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-dark-muted truncate mb-1">
          {org.slug}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-dark-muted flex-wrap">
          {org.createdBy && (
            <span className="flex items-center gap-1">
              <RiUserLine size={11} />
              {org.createdBy.name} · {org.createdBy.email}
            </span>
          )}
          <span className="flex items-center gap-1">
            <RiCalendarLine size={11} />
            {new Date(org.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        {org.description && (
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-1 line-clamp-1">
            {org.description}
          </p>
        )}
      </div>

      {/* Actions — only for PENDING */}
      {org.status?.toUpperCase() === "PENDING" && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onApprove(org.id)}
            disabled={approving === org.id || rejecting === org.id}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            {approving === org.id ? (
              <RiLoader4Line size={13} className="animate-spin" />
            ) : (
              <RiCheckboxCircleLine size={13} />
            )}
            Approve
          </button>
          <button
            onClick={() => onReject(org.id)}
            disabled={approving === org.id || rejecting === org.id}
            className="btn-danger text-xs px-4 py-2 flex items-center gap-1.5"
          >
            {rejecting === org.id ? (
              <RiLoader4Line size={13} className="animate-spin" />
            ) : (
              <RiCloseCircleLine size={13} />
            )}
            Reject
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ── Admin Page ─────────────────────────────────────────────────
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch ALL orgs once — derive counts and filter on frontend
  const {
    data: allOrgs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-orgs"],
    queryFn: async () => {
      const [pending, approved, rejected] = await Promise.all([
        api.get("/api/orgs/admin/pending").then((r) => r.data.data ?? []),
        api
          .get("/api/orgs?status=APPROVED&limit=100")
          .then((r) => r.data.data ?? []),
        api
          .get("/api/orgs?status=REJECTED&limit=100")
          .then((r) => r.data.data ?? []),
      ]);
      return [...pending, ...approved, ...rejected];
    },
  });

  // Derive counts from single array
  const counts = {
    pending: allOrgs.filter((o) => o.status?.toUpperCase() === "PENDING")
      .length,
    approved: allOrgs.filter((o) => o.status?.toUpperCase() === "APPROVED")
      .length,
    rejected: allOrgs.filter((o) => o.status?.toUpperCase() === "REJECTED")
      .length,
  };

  // Filter for active tab
  const orgs = allOrgs.filter(
    (o) => o.status?.toUpperCase() === activeTab.toUpperCase(),
  );

  // Approve mutation
  const { mutate: approveOrg } = useMutation({
    mutationFn: (id) => api.patch(`/api/orgs/${id}/approve`),
    onMutate: (id) => setApprovingId(id),
    onSettled: () => {
      setApprovingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-orgs"] });
    },
  });

  // Reject mutation
  const { mutate: rejectOrg } = useMutation({
    mutationFn: (id) => api.patch(`/api/orgs/${id}/reject`),
    onMutate: (id) => setRejectingId(id),
    onSettled: () => {
      setRejectingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-orgs"] });
    },
  });

  return (
    <div className="container-page py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
            <RiVipCrownLine size={20} className="text-yellow-500" />
          </div>
          <h1 className="page-title">Admin Panel</h1>
        </div>
        <p className="page-subtitle">
          Review and manage organization approval requests.
        </p>
      </motion.div>

      {/* Tabs with counts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              card flex items-center gap-3 text-left transition-all duration-200
              ${
                activeTab === tab.key
                  ? "border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/10"
                  : "hover:border-primary-300 dark:hover:border-primary-800"
              }
            `}
          >
            <div
              className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${
                activeTab === tab.key
                  ? "bg-primary-500 text-white"
                  : "bg-surface-100 dark:bg-dark-bg text-gray-400"
              }
            `}
            >
              <tab.icon size={18} />
            </div>
            <div>
              <p
                className={`font-bold text-sm ${activeTab === tab.key ? "text-primary-600 dark:text-primary-400" : "text-gray-900 dark:text-white"}`}
              >
                {tab.label}
              </p>
              <p
                className={`text-2xl font-black leading-tight ${activeTab === tab.key ? "text-primary-500" : "text-gray-900 dark:text-white"}`}
              >
                {isLoading ? "—" : counts[tab.key]}
              </p>
              <p className="text-xs text-gray-400 dark:text-dark-muted">
                Organizations
              </p>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Org list */}
      {isLoading ? (
        <div className="space-y-4">
          {skeletonKeys.map((k) => (
            <div key={k} className="card animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-200 dark:bg-dark-border shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-1/3" />
                <div className="h-3 bg-surface-200 dark:bg-dark-border rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="card text-center py-12">
          <RiErrorWarningLine size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Failed to load organizations.
          </p>
        </div>
      ) : orgs.length === 0 ? (
        <div className="card text-center py-12">
          <RiShieldCheckLine
            size={32}
            className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
          />
          <p className="text-sm text-gray-400 dark:text-dark-muted">
            No {activeTab} organizations.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {orgs.map((org) => (
              <OrgRow
                key={org.id}
                org={org}
                onApprove={approveOrg}
                onReject={rejectOrg}
                approving={approvingId}
                rejecting={rejectingId}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AdminPage;
