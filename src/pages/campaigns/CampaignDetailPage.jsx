import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  RiArrowLeftLine,
  RiBuilding2Line,

  RiTimeLine,
  RiCheckboxCircleLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiBarChartLine,
  RiUserLine,
  RiLockLine,
  RiGroupLine,
} from "react-icons/ri";
import api from "../../lib/api";
import useAuthStore from "../../store/authStore";

// ── Socket URL ─────────────────────────────────────────────────
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// ── Status badge config ────────────────────────────────────────
const statusConfig = {
  ACTIVE: { label: "Active", class: "badge-green" },
  DRAFT: { label: "Draft", class: "badge-gray" },
  CLOSED: { label: "Closed", class: "badge-gray" },
  CANCELLED: { label: "Cancelled", class: "badge-red" },
};

// ── Access type config ─────────────────────────────────────────
const accessConfig = {
  PUBLIC: { label: "Public", icon: RiGroupLine, color: "text-green-500" },
  ORG_MEMBERS_ONLY: {
    label: "Members Only",
    icon: RiBuilding2Line,
    color: "text-blue-500",
  },
  INVITE_ONLY: {
    label: "Invite Only",
    icon: RiLockLine,
    color: "text-purple-500",
  },
};

// ── Voting type config ─────────────────────────────────────────
const votingTypeConfig = {
  SINGLE_CHOICE: { label: "Single Choice", desc: "Pick one candidate" },
  MULTIPLE_CHOICE: {
    label: "Multiple Choice",
    desc: "Pick one or more candidates",
  },
};

// ── Candidate card ─────────────────────────────────────────────
const CandidateCard = ({
  candidate,
  selected,
  onSelect,
  disabled,
  votingType,
}) => {
  const isSelected =
    votingType === "SINGLE_CHOICE"
      ? selected === candidate.id
      : selected.includes(candidate.id);

  return (
    <motion.div
      whileHover={disabled ? {} : { y: -2 }}
      onClick={() => !disabled && onSelect(candidate.id)}
      className={`
        card cursor-pointer transition-all duration-200
        ${disabled ? "cursor-not-allowed opacity-70" : ""}
        ${
          isSelected
            ? "border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-green"
            : "hover:border-primary-300 dark:hover:border-primary-700"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Photo */}
        {candidate.photoUrl ? (
          <img
            src={candidate.photoUrl}
            alt={candidate.user?.name}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
            <RiUserLine size={24} className="text-primary-400" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white truncate">
            {candidate.user?.name}
          </p>
          {candidate.user?.avatarUrl && (
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5 truncate">
              Registered voter
            </p>
          )}
        </div>

        {/* Selection indicator */}
        <div
          className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
          ${
            isSelected
              ? "border-primary-500 bg-primary-500"
              : "border-surface-300 dark:border-dark-border"
          }
        `}
        >
          {isSelected && (
            <RiCheckboxCircleLine size={14} className="text-white" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Results bar ────────────────────────────────────────────────
const ResultBar = ({ candidate, totalVoters, index }) => {
  const pct =
    totalVoters > 0
      ? ((candidate.votes / totalVoters) * 100).toFixed(1)
      : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-3">
        {candidate.photoUrl ? (
          <img
            src={candidate.photoUrl}
            alt={candidate.name}
            className="w-9 h-9 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
            <RiUserLine size={16} className="text-primary-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {candidate.name}
            </p>
            <p className="text-sm font-bold text-primary-500 shrink-0 ml-2">
              {pct}%
            </p>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-surface-200 dark:bg-dark-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, delay: index * 0.06 + 0.2 }}
              className="h-full bg-primary-500 rounded-full"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-dark-muted shrink-0 w-14 text-right">
          {candidate.votes} vote{candidate.votes !== 1 ? "s" : ""}
        </p>
      </div>
    </motion.div>
  );
};

// ── Campaign Detail Page ───────────────────────────────────────
const CampaignDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState(null); // int for SINGLE, [] for MULTIPLE
  const [liveResults, setLiveResults] = useState(null);
  const [voteError, setVoteError] = useState("");

  // ── Fetch campaign ─────────────────────────────────────────
  const {
    data: campaignData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const res = await api.get(`/api/campaigns/${id}`);
      return res.data.data;
    },
  });

  // ── Fetch results ──────────────────────────────────────────
  const { data: resultsData } = useQuery({
    queryKey: ["campaign-results", id],
    queryFn: async () => {
      const res = await api.get(`/api/votes/${id}/results`);
      return res.data.data;
    },
    enabled: !!campaignData,
  });

  // ── Fetch vote status ──────────────────────────────────────
  const { data: voteStatus } = useQuery({
    queryKey: ["vote-status", id],
    queryFn: async () => {
      const res = await api.get(`/api/votes/${id}/status`);
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  // ── Initialize selected based on voting type ───────────────
  useEffect(() => {
    if (campaignData) {
      setSelected(campaignData.votingType === "MULTIPLE_CHOICE" ? [] : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignData?.votingType]);

  // ── Socket.io — live results ───────────────────────────────
  // ── Socket.io — live results ───────────────────────────────
  useEffect(() => {
    if (!id) return;

    const socket = io(SOCKET_URL);
    socket.emit("join_campaign", { campaignId: parseInt(id) });

    socket.on("vote_update", (data) => {
      setLiveResults(data);
      queryClient.invalidateQueries({ queryKey: ["campaign-results", id] });
    });

    return () => {
      socket.emit("leave_campaign", { campaignId: parseInt(id) });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // ← only re-run when id changes, queryClient is stable

  // ── Candidate selection handler ────────────────────────────
  const handleSelect = (candidateId) => {
    setVoteError("");
    if (campaignData?.votingType === "SINGLE_CHOICE") {
      setSelected(candidateId);
    } else {
      setSelected((prev) =>
        prev.includes(candidateId)
          ? prev.filter((id) => id !== candidateId)
          : [...prev, candidateId],
      );
    }
  };

  // ── Cast vote mutation ─────────────────────────────────────
  const { mutate: castVote, isPending: voting } = useMutation({
    mutationFn: async () => {
      const isSingle = campaignData.votingType === "SINGLE_CHOICE";
      await api.post(
        `/api/votes/${id}`,
        isSingle ? { candidateId: selected } : { candidateIds: selected },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-status", id] });
      queryClient.invalidateQueries({ queryKey: ["campaign-results", id] });
    },
    onError: (error) => {
      setVoteError(
        error.response?.data?.message ||
          "Failed to cast vote. Please try again.",
      );
    },
  });

  const handleVote = () => {
    setVoteError("");
    const isSingle = campaignData?.votingType === "SINGLE_CHOICE";
    if (isSingle && !selected) {
      setVoteError("Please select a candidate.");
      return;
    }
    if (!isSingle && (!selected || selected.length === 0)) {
      setVoteError("Please select at least one candidate.");
      return;
    }
    castVote();
  };

  // ── Derived state ──────────────────────────────────────────
  const results = liveResults || resultsData;
  const hasVoted = voteStatus?.hasVoted;
  const canVote =
    isAuthenticated && campaignData?.status === "ACTIVE" && !hasVoted;
  const isMultiple = campaignData?.votingType === "MULTIPLE_CHOICE";
  const status = statusConfig[campaignData?.status] || {
    label: campaignData?.status,
    class: "badge-gray",
  };
  const access = accessConfig[campaignData?.accessType] || {
    label: campaignData?.accessType,
    icon: RiGroupLine,
    color: "text-gray-400",
  };
  const votingType = votingTypeConfig[campaignData?.votingType];

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container-page py-20 flex items-center justify-center">
        <RiLoader4Line size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (isError || !campaignData) {
    return (
      <div className="container-page py-20 text-center">
        <RiErrorWarningLine size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-dark-muted mb-4">
          Campaign not found or access denied.
        </p>
        <Link to="/campaigns" className="btn-outline text-sm">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      {/* ── Back link ────────────────────────────────────────── */}
      <Link
        to="/campaigns"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 mb-6 transition-colors w-fit"
      >
        <RiArrowLeftLine size={14} />
        Back to Campaigns
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left — campaign info + voting ──────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={status.class}>{status.label}</span>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${access.color}`}
              >
                <access.icon size={12} />
                {access.label}
              </span>
              {votingType && (
                <span className="badge-gray">{votingType.label}</span>
              )}
            </div>

            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {campaignData.title}
            </h1>

            {campaignData.description && (
              <p className="text-gray-500 dark:text-dark-muted leading-relaxed mb-4">
                {campaignData.description}
              </p>
            )}

            {campaignData.organization && (
              <Link
                to={`/organizations/${campaignData.organization.slug}`}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors w-fit"
              >
                {campaignData.organization.logoUrl ? (
                  <img
                    src={campaignData.organization.logoUrl}
                    alt={campaignData.organization.name}
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  <RiBuilding2Line size={16} />
                )}
                {campaignData.organization.name}
              </Link>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400 dark:text-dark-muted">
              <span className="flex items-center gap-1">
                <RiTimeLine size={12} />
                Starts:{" "}
                {new Date(campaignData.startDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <RiTimeLine size={12} />
                Ends:{" "}
                {new Date(campaignData.endDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </motion.div>

          {/* Candidates + voting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                Candidates
                <span className="text-sm font-normal text-gray-400 dark:text-dark-muted ml-2">
                  ({campaignData.candidates?.length ?? 0})
                </span>
              </h2>
              {votingType && (
                <p className="text-xs text-gray-400 dark:text-dark-muted">
                  {votingType.desc}
                </p>
              )}
            </div>

            {/* Already voted */}
            {hasVoted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 mb-5"
              >
                <RiCheckboxCircleLine
                  size={18}
                  className="text-primary-500 shrink-0"
                />
                <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                  You have voted in this campaign. Results are shown on the
                  right.
                </p>
              </motion.div>
            )}

            {/* Not logged in */}
            {!isAuthenticated && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-100 dark:bg-dark-surface border border-surface-200 dark:border-dark-border mb-5">
                <RiLockLine size={16} className="text-gray-400 shrink-0" />
                <p className="text-sm text-gray-500 dark:text-dark-muted">
                  <Link to="/login" className="text-primary-500 font-medium">
                    Log in
                  </Link>{" "}
                  to vote in this campaign.
                </p>
              </div>
            )}

            {/* Candidate list */}
            <div className="space-y-3">
              {campaignData.candidates?.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={isMultiple ? selected || [] : selected}
                  onSelect={handleSelect}
                  disabled={!canVote}
                  votingType={campaignData.votingType}
                />
              ))}
            </div>

            {/* Vote error */}
            <AnimatePresence>
              {voteError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-500 mt-4"
                >
                  {voteError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Vote button */}
            {canVote && (
              <button
                onClick={handleVote}
                disabled={voting}
                className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
              >
                {voting ? (
                  <>
                    <RiLoader4Line size={16} className="animate-spin" /> Casting
                    vote...
                  </>
                ) : (
                  <>
                    <RiCheckboxCircleLine size={12} />
                    Cast Vote
                  </>
                )}
              </button>
            )}
          </motion.div>
        </div>

        {/* ── Right — live results ────────────────────────────── */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card sticky top-24"
          >
            <div className="flex items-center gap-2 mb-5">
              <RiBarChartLine size={18} className="text-primary-500" />
              <h2 className="font-bold text-gray-900 dark:text-white">
                Live Results
              </h2>
              {/* Live indicator */}
              {campaignData.status === "ACTIVE" && (
                <span className="flex items-center gap-1 ml-auto">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-500 font-medium">
                    Live
                  </span>
                </span>
              )}
            </div>

            {/* Total voters */}
            <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-surface-50 dark:bg-dark-bg">
              <RiCheckboxCircleLine size={16} className="text-bg-primary-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">
                  {results?.totalVoters ?? 0}
                </strong>{" "}
                total voter{(results?.totalVoters ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Result bars */}
            {results?.candidates?.length > 0 ? (
              <div className="space-y-4">
                {results.candidates.map((candidate, i) => (
                  <ResultBar
                    key={candidate.id}
                    candidate={candidate}
                    totalVoters={results.totalVoters}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <RiBarChartLine
                  size={28}
                  className="text-gray-300 dark:text-gray-600 mx-auto mb-2"
                />
                <p className="text-sm text-gray-400 dark:text-dark-muted">
                  No votes yet.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
