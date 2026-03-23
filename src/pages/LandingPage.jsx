import { useRef } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  RiShieldCheckLine,
  RiLockLine,
  RiLineChartLine,
  RiBuilding2Line,
  RiCheckboxCircleLine,
  RiUserAddLine,
  RiBarChartLine,
  RiArrowRightLine,
  RiGlobalLine,
  RiBankLine,
  RiGovernmentLine,
  RiTeamLine,
  RiStarLine,
} from "react-icons/ri";

// ── Animation variants ─────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

// ── Data ───────────────────────────────────────────────────────
const features = [
  {
    icon: RiShieldCheckLine,
    title: "Secure & Verified",
    desc: "Every voter is verified via email. Organizations are approved by admins before going live.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: RiLockLine,
    title: "Anonymous Ballots",
    desc: "Votes are completely anonymous. It is technically impossible to trace who voted for whom.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: RiLineChartLine,
    title: "Real-Time Results",
    desc: "Live vote counts pushed instantly to all watchers via WebSocket. No refresh needed.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: RiBuilding2Line,
    title: "Multi-Organization",
    desc: "Any school, company, or government body can create campaigns. One platform, unlimited use cases.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];

const steps = [
  {
    number: "01",
    icon: RiUserAddLine,
    title: "Create an Account",
    desc: "Register in seconds. Verify your email to activate your account and start participating.",
  },
  {
    number: "02",
    icon: RiCheckboxCircleLine,
    title: "Join a Campaign",
    desc: "Browse public campaigns or join your organization's private elections with a single click.",
  },
  {
    number: "03",
    icon: RiBarChartLine,
    title: "Vote & See Results",
    desc: "Cast your vote securely. Watch live results update in real-time as others vote.",
  },
];

const useCases = [
  {
    icon: RiTeamLine,
    title: "Schools & Universities",
    desc: "Student union elections, class representative voting, faculty board decisions.",
    examples: [
      "Class Rep Elections",
      "Student Union Voting",
      "Faculty Board Decisions",
    ],
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: RiBankLine,
    title: "Corporations & Banks",
    desc: "Manager elections, board decisions, shareholder voting, employee of the month.",
    examples: ["Board Elections", "Manager Voting", "Shareholder Decisions"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: RiGovernmentLine,
    title: "Government Bodies",
    desc: "Presidential elections, gubernatorial races, legislative voting, public referendums.",
    examples: [
      "Presidential Elections",
      "Gubernatorial Races",
      "Public Referendums",
    ],
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: RiGlobalLine,
    title: "NGOs & Associations",
    desc: "Leadership elections, policy voting, membership decisions, charity board elections.",
    examples: ["Leadership Elections", "Policy Voting", "Member Decisions"],
    color: "from-orange-500 to-red-500",
  },
  {
    icon: RiStarLine,
    title: "Community Groups",
    desc: "Neighborhood committees, sports clubs, religious bodies, alumni associations.",
    examples: ["Committee Elections", "Club Decisions", "Alumni Voting"],
    color: "from-teal-500 to-cyan-600",
  },
];

const stats = [
  { value: "100%", label: "Anonymous Voting" },
  { value: "3", label: "Access Levels" },
  { value: "2", label: "Voting Types" },
  { value: "∞", label: "Organizations" },
];

// ── Section wrapper with scroll animation ─────────────────────
const Section = ({ children, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// ── Landing Page ───────────────────────────────────────────────
const LandingPage = () => {
  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-white dark:from-dark-bg dark:via-dark-bg dark:to-dark-surface -z-10" />

        {/* Animated background circles */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-96 h-96 rounded-full bg-primary-200/30 dark:bg-primary-900/20 blur-3xl -z-10"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-primary-300/20 dark:bg-primary-800/10 blur-3xl -z-10"
        />

        <div className="container-page w-full py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                bg-primary-50 dark:bg-primary-900/30
                border border-primary-200 dark:border-primary-800
                text-primary-600 dark:text-primary-400
                text-sm font-medium mb-6"
            >
              <RiCheckboxCircleLine size={14} />
              Trusted Voting Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black
                text-gray-900 dark:text-white
                leading-tight tracking-tight mb-6"
            >
              Voting made{" "}
              <span className="relative inline-block">
                <span className="text-primary-500">secure</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-primary-500 rounded-full origin-left"
                />
              </span>{" "}
              and <span className="text-primary-500">transparent</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-500 dark:text-dark-muted
                max-w-2xl mx-auto leading-relaxed mb-10"
            >
              From school elections to national campaigns — SBE Vote delivers
              anonymous, real-time, tamper-proof voting for every organization.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="btn-primary text-base px-8 py-3 flex items-center gap-2 group"
              >
                Get Started Free
                <RiArrowRightLine
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </Link>
              <Link to="/campaigns" className="btn-outline text-base px-8 py-3">
                Browse Campaigns
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className="mt-6 text-sm text-gray-400 dark:text-dark-muted"
            >
              Free to join · No credit card required · Instant setup
            </motion.p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════ */}
      <Section className="bg-primary-500 py-12">
        <div className="container-page">
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="text-center"
              >
                <p className="text-4xl font-black text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-primary-100">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════════════════ */}
      <Section className="section bg-white dark:bg-dark-bg">
        <div className="container-page">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="page-title mb-3">
              Everything you need for{" "}
              <span className="text-primary-500">trustworthy</span> elections
            </h2>
            <p className="page-subtitle max-w-xl mx-auto">
              Built with security and transparency at its core — not as an
              afterthought.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="card group cursor-default"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                >
                  <feature.icon size={24} className={feature.color} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS SECTION
      ═══════════════════════════════════════════════════════ */}
      <Section className="section bg-surface-50 dark:bg-dark-surface">
        <div className="container-page">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="page-title mb-3">
              Up and running in{" "}
              <span className="text-primary-500">3 simple steps</span>
            </h2>
            <p className="page-subtitle max-w-xl mx-auto">
              No complex setup. No training required. Just sign up and start
              voting.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-primary-200 dark:bg-primary-900/50 z-0" />

            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="relative text-center z-10"
              >
                {/* Step number bubble */}
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-dark-bg border-2 border-primary-200 dark:border-primary-800 flex items-center justify-center shadow-soft mx-auto">
                    <step.icon size={28} className="text-primary-500" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary-500 text-white text-xs font-black flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          USE CASES — SWIPER CAROUSEL
      ═══════════════════════════════════════════════════════ */}
      <Section className="section bg-white dark:bg-dark-bg overflow-hidden">
        <div className="container-page">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="page-title mb-3">
              Built for{" "}
              <span className="text-primary-500">every organization</span>
            </h2>
            <p className="page-subtitle max-w-xl mx-auto">
              From a 30-person classroom to a nationwide election — one platform
              handles it all.
            </p>
          </motion.div>
        </div>

        <motion.div variants={fadeIn} className="px-4 md:px-8 lg:px-16">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
            style={{ alignItems: "stretch" }} // ← add this
          >
            {useCases.map((useCase) => (
              <SwiperSlide key={useCase.title} className="h-auto">
                <div className="card h-full flex flex-col group hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
                  {/* Gradient icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-5 shadow-soft shrink-0`}
                  >
                    <useCase.icon size={26} className="text-white" />
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-dark-muted leading-relaxed mb-4">
                    {useCase.desc}
                  </p>

                  {/* Examples — pushed to bottom */}
                  <ul className="space-y-1.5 mt-auto">
                    {useCase.examples.map((example) => (
                      <li
                        key={example}
                        className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-muted"
                      >
                        <RiCheckboxCircleLine
                          size={14}
                          className="text-primary-500 shrink-0"
                        />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════ */}
      <Section className="section bg-surface-50 dark:bg-dark-surface">
        <div className="container-page">
          <motion.div
            variants={fadeUp}
            className="
              relative overflow-hidden
              bg-gradient-to-br from-primary-500 to-primary-600
              rounded-3xl p-12 text-center
            "
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <motion.div variants={fadeUp}>
                <RiCheckboxCircleLine
                  size={48}
                  className="text-white/80 mx-auto mb-4"
                />
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight"
              >
                Ready to run your first election?
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-primary-100 text-lg max-w-xl mx-auto mb-8"
              >
                Join thousands of organizations using SBE Vote for secure,
                transparent and anonymous elections.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  to="/register"
                  className="
                    bg-white text-primary-600 font-bold
                    px-8 py-3 rounded-xl
                    hover:bg-primary-50 transition-colors duration-200
                    flex items-center gap-2 group text-base
                    shadow-soft
                  "
                >
                  Create Free Account
                  <RiArrowRightLine
                    size={18}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </Link>
                <Link
                  to="/campaigns"
                  className="
                    border-2 border-white/50 text-white font-bold
                    px-8 py-3 rounded-xl
                    hover:border-white hover:bg-white/10
                    transition-all duration-200 text-base
                  "
                >
                  Explore Campaigns
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
};

export default LandingPage;
