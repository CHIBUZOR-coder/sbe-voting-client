import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  RiBuilding2Line,
  RiArrowDownSLine,
  RiLoader4Line,
  RiAddLine,
} from "react-icons/ri";
import api from "../../lib/api";


import ManageCampaigns from "./ManageCampaigns";
import ManageMembers from "./ManageMembers";
import CreateOrg from "./Createorg";
import OrgDetails from "./OrgDetails";


// ── Animation ─────────────────────────────────────────────────
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
  PENDING: { label: "Pending Approval", class: "badge-yellow" },
  APPROVED: { label: "Approved", class: "badge-green" },
  REJECTED: { label: "Rejected", class: "badge-red" },
};

// ── Org Manage Page ────────────────────────────────────────────
const OrgManagePage = () => {
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // Fetch user's orgs
  const { data, isLoading } = useQuery({
    queryKey: ["my-orgs"],
    queryFn: async () => {
      const res = await api.get("/api/orgs?limit=20");
      return res.data.data;
    },
  });

  const orgs = data ?? [];
  const selectedOrg =
    orgs.find((o) => o.id === selectedOrgId) || orgs[0] || null;

  // Auto-select first org when data loads
  if (!selectedOrgId && orgs.length > 0 && !showCreate) {
    setSelectedOrgId(orgs[0].id);
  }

  const isApproved = selectedOrg?.status === "APPROVED";

  return (
    <div className="container-page py-10">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="page-title">Manage Organization</h1>
          <p className="page-subtitle">
            Create and manage your organizations, campaigns and members.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(!showCreate);
            setSelectedOrgId(null);
          }}
          className="btn-primary text-sm flex items-center gap-1.5 shrink-0"
        >
          <RiAddLine size={15} />
          New Organization
        </button>
      </motion.div>

      {/* Create org form */}
      {showCreate && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <CreateOrg
            onCreated={() => {
              setShowCreate(false);
            }}
          />
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line size={32} className="text-primary-500 animate-spin" />
        </div>
      )}

      {/* No orgs */}
      {!isLoading && orgs.length === 0 && !showCreate && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card text-center py-16"
        >
          <RiBuilding2Line
            size={40}
            className="text-gray-300 dark:text-gray-600 mx-auto mb-4"
          />
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            No organizations yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-muted mb-6 max-w-xs mx-auto">
            Create your first organization and submit it for admin approval to
            get started.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary text-sm inline-flex items-center gap-1.5"
          >
            <RiAddLine size={15} />
            Create Organization
          </button>
        </motion.div>
      )}

      {/* Org selector + management */}
      {!isLoading && orgs.length > 0 && !showCreate && (
        <div className="space-y-6">
          {/* Org selector */}
          {orgs.length > 1 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <label className="label">Select Organization</label>
              <div className="relative max-w-sm">
                <RiBuilding2Line
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={selectedOrgId ?? ""}
                  onChange={(e) => setSelectedOrgId(Number(e.target.value))}
                  className="input pl-9 pr-8 appearance-none"
                >
                  {orgs.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} — {org.status}
                    </option>
                  ))}
                </select>
                <RiArrowDownSLine
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </motion.div>
          )}

          {selectedOrg && (
            <>
              {/* Status notice */}
              {selectedOrg.status !== "APPROVED" && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className={`
                    p-4 rounded-xl border flex items-center gap-3
                    ${
                      selectedOrg.status === "PENDING"
                        ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                        : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                    }
                  `}
                >
                  <RiBuilding2Line
                    size={18}
                    className={
                      selectedOrg.status === "PENDING"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }
                  />
                  <div>
                    <p
                      className={`text-sm font-semibold ${selectedOrg.status === "PENDING" ? "text-yellow-700 dark:text-yellow-400" : "text-red-700 dark:text-red-400"}`}
                    >
                      {statusConfig[selectedOrg.status]?.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                      {selectedOrg.status === "PENDING"
                        ? "Your organization is awaiting admin approval. Campaign and member management will be available once approved."
                        : "Your organization was rejected. Please contact support for more information."}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Org details — always visible */}
              <motion.div
                variants={fadeUp}
                custom={1}
                initial="hidden"
                animate="visible"
              >
                <OrgDetails org={selectedOrg} />
              </motion.div>

              {/* Campaigns + Members — only if approved */}
              {isApproved && (
                <>
                  <motion.div
                    variants={fadeUp}
                    custom={2}
                    initial="hidden"
                    animate="visible"
                  >
                    <ManageCampaigns org={selectedOrg} />
                  </motion.div>
                  <motion.div
                    variants={fadeUp}
                    custom={3}
                    initial="hidden"
                    animate="visible"
                  >
                    <ManageMembers org={selectedOrg} />
                  </motion.div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OrgManagePage;
