import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RiMegaphoneLine,
  RiAddLine,
  RiCloseLine,
  RiLoader4Line,
  RiArrowRightLine,
  RiPlayLine,
  RiStopLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiUserLine,
} from "react-icons/ri";
import api from "../../lib/api";
import ManageCandidatesModal from "./ManageCandidatesModal";




// ── Status badge config ────────────────────────────────────────
const statusConfig = {
  ACTIVE: { label: "Active", class: "badge-green" },
  DRAFT: { label: "Draft", class: "badge-gray" },
  CLOSED: { label: "Closed", class: "badge-gray" },
  CANCELLED: { label: "Cancelled", class: "badge-red" },
};

// ── Voting type options ────────────────────────────────────────
const votingTypeOptions = [
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
];

// ── Access type options ────────────────────────────────────────
const accessTypeOptions = [
  { value: "PUBLIC", label: "Public" },
  { value: "ORG_MEMBERS_ONLY", label: "Members Only" },
  { value: "INVITE_ONLY", label: "Invite Only" },
];

// ── Status transition buttons ──────────────────────────────────
const statusActions = [
  {
    from: "DRAFT",
    to: "ACTIVE",
    icon: RiPlayLine,
    label: "Activate",
    class: "btn-primary",
  },
  {
    from: "ACTIVE",
    to: "CLOSED",
    icon: RiStopLine,
    label: "Close",
    class: "btn-danger",
  },
];

// ── Campaign row ───────────────────────────────────────────────
const CampaignRow = ({
  campaign,
  onStatusChange,
  changingId,
  onManageCandidates,
}) => {
  const status = statusConfig[campaign.status] || {
    label: campaign.status,
    class: "badge-gray",
  };
  const actions = statusActions.filter((a) => a.from === campaign.status);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3 border-b border-surface-200 dark:border-dark-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {campaign.title}
          </p>
          <span className={status.class}>{status.label}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-dark-muted">
          <span className="flex items-center gap-1">
            <RiCheckboxCircleLine size={12} />
            {campaign._count?.voteRecords ?? 0} votes
          </span>
          <span className="flex items-center gap-1">
            <RiUserLine size={11} />
            {campaign._count?.candidates ?? 0} candidates
          </span>
          <span className="flex items-center gap-1">
            <RiTimeLine size={11} />
            Ends{" "}
            {new Date(campaign.endDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {/* Manage candidates — only for DRAFT */}
        {campaign.status === "DRAFT" && (
          <button
            onClick={() => onManageCandidates(campaign)}
            className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <RiUserLine size={12} />
            Candidates
          </button>
        )}

        {/* Status actions */}
        {actions.map((action) => (
          <button
            key={action.to}
            onClick={() => onStatusChange(campaign.id, action.to)}
            disabled={changingId === campaign.id}
            className={`${action.class} text-xs px-3 py-1.5 flex items-center gap-1.5`}
          >
            {changingId === campaign.id ? (
              <RiLoader4Line size={12} className="animate-spin" />
            ) : (
              <action.icon size={12} />
            )}
            {action.label}
          </button>
        ))}

        {/* View link */}
        <Link
          to={`/campaigns/${campaign.id}`}
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          <RiArrowRightLine size={15} />
        </Link>
      </div>
    </div>
  );
};

// ── Manage Campaigns ───────────────────────────────────────────
const ManageCampaigns = ({ org }) => {
  const [showForm, setShowForm] = useState(false);
  const [changingId, setChangingId] = useState(null);
  const [serverError, setServerError] = useState("");
  const [candidatesCampaign, setCandidatesCampaign] = useState(null); // campaign to manage candidates for
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch org campaigns — all statuses
  const { data, isLoading } = useQuery({
    queryKey: ["org-manage-campaigns", org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const res = await api.get(
        `/api/campaigns?orgId=${org.id}&limit=20&allStatuses=true`,
      );
      return res.data.data;
    },
  });

  const campaigns = data ?? [];

  // Create campaign mutation
  const { mutate: createCampaign, isPending: creating } = useMutation({
    mutationFn: async (data) => {
      await api.post("/api/campaigns", { ...data, organizationId: org.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["org-manage-campaigns", org?.id],
      });
      reset();
      setShowForm(false);
      setServerError("");
    },
    onError: (error) => {
      setServerError(
        error.response?.data?.message || "Failed to create campaign.",
      );
    },
  });

  // Change status mutation
  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/api/campaigns/${id}/status`, { status }),
    onMutate: ({ id }) => {
      setChangingId(id);
      setServerError("");
    },
    onSettled: () => {
      setChangingId(null);
      queryClient.invalidateQueries({
        queryKey: ["org-manage-campaigns", org?.id],
      });
    },
    onError: (error) => {
      setServerError(
        error.response?.data?.message || "Failed to update campaign status.",
      );
    },
  });

  const onSubmit = (data) => {
    setServerError("");
    createCampaign(data);
  };

  return (
    <>
      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Campaigns
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
              Create and manage your organization's campaigns.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setServerError("");
            }}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            {showForm ? <RiCloseLine size={15} /> : <RiAddLine size={15} />}
            {showForm ? "Cancel" : "New Campaign"}
          </button>
        </div>

        {/* ── Global error ─────────────────────────────────────── */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <RiErrorWarningLine
                size={16}
                className="text-red-500 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-600 dark:text-red-400">
                {serverError}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Create form ───────────────────────────────────────── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 p-4 bg-surface-50 dark:bg-dark-bg rounded-xl border border-surface-200 dark:border-dark-border"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  New Campaign
                </h4>

                <div>
                  <label className="label">Title</label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    type="text"
                    placeholder="e.g. Student Union President 2025"
                    className={`input ${errors.title ? "input-error" : ""}`}
                  />
                  {errors.title && (
                    <p className="error-text">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Description (Optional)</label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    className="input resize-none"
                    placeholder="Brief description of this campaign..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Voting Type</label>
                    <select
                      {...register("votingType", { required: "Required" })}
                      className="input"
                    >
                      {votingTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Access Type</label>
                    <select
                      {...register("accessType", { required: "Required" })}
                      className="input"
                    >
                      {accessTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      {...register("startDate", {
                        required: "Start date is required",
                      })}
                      type="datetime-local"
                      className={`input ${errors.startDate ? "input-error" : ""}`}
                    />
                    {errors.startDate && (
                      <p className="error-text">{errors.startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      {...register("endDate", {
                        required: "End date is required",
                      })}
                      type="datetime-local"
                      className={`input ${errors.endDate ? "input-error" : ""}`}
                    />
                    {errors.endDate && (
                      <p className="error-text">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <RiLoader4Line size={14} className="animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create Campaign"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Campaign list ──────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="animate-pulse flex items-center gap-3 py-3 border-b border-surface-200 dark:border-dark-border"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-1/2" />
                  <div className="h-3 bg-surface-200 dark:bg-dark-border rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div>
            {campaigns.map((campaign) => (
              <CampaignRow
                key={campaign.id}
                campaign={campaign}
                onStatusChange={(id, status) => changeStatus({ id, status })}
                changingId={changingId}
                onManageCandidates={setCandidatesCampaign}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <RiMegaphoneLine
              size={28}
              className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <p className="text-sm text-gray-400 dark:text-dark-muted">
              No campaigns yet. Create your first one above.
            </p>
          </div>
        )}
      </div>

      {/* ── Candidates modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {candidatesCampaign && (
          <ManageCandidatesModal
            campaign={candidatesCampaign}
            onClose={() => setCandidatesCampaign(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ManageCampaigns;
