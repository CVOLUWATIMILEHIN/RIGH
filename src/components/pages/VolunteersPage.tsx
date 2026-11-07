import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Users,
  Briefcase,
  Linkedin,
  Calendar,
  ArrowRight,
  X,
  CheckCircle2,
  Award,
  HeartHandshake
} from "lucide-react";
import { PageContainer } from "../PageContainer";
import { VolunteerProfile, getPublishedVolunteers } from "../../lib/db";
import {
  subscribeToSupabaseCMSRealtime,
  RMA_MAIN_DEPARTMENTS,
  RMA_VOLUNTEER_DEPARTMENTS,
  getPositionsForDepartment,
  parseVolunteerDepartments,
  normalizeVolunteerPositionName
} from "../../lib/supabaseCms";

interface VolunteersPageProps {
  onNavigate: (view: string) => void;
  onOpenJoin?: (profile?: string) => void;
}

export default function VolunteersPage({
  onNavigate,
  onOpenJoin
}: VolunteersPageProps) {
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [selectedVolunteer, setSelectedVolunteer] =
    useState<VolunteerProfile | null>(null);

  const loadPublished = async () => {
    try {
      const list = await getPublishedVolunteers();
      // Strictly ensure only Published volunteers and never expose private email
      const safePublished = list
        .filter((v) => v.status === "Published")
        .map(({ email, ...publicSafe }) => publicSafe);
      setVolunteers(safePublished);
    } catch (err) {
      console.error("Failed to fetch published volunteers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublished();

    const handleLocalOrCloudUpdate = () => {
      loadPublished();
    };

    window.addEventListener("rma_volunteers_updated", handleLocalOrCloudUpdate);
    const unsubscribeSupabase = subscribeToSupabaseCMSRealtime((table) => {
      if (table === "volunteers") {
        loadPublished();
      }
    });

    return () => {
      window.removeEventListener(
        "rma_volunteers_updated",
        handleLocalOrCloudUpdate
      );
      unsubscribeSupabase();
    };
  }, []);

  // Available specialised positions based on selected Main Department
  const availablePositions = useMemo(() => {
    if (selectedDepartment !== "ALL") {
      return [...getPositionsForDepartment(selectedDepartment)];
    }
    return RMA_MAIN_DEPARTMENTS.flatMap((d) => d.positions);
  }, [selectedDepartment]);

  // Filtered published volunteers by name, main department, and position
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v) => {
      if (v.status !== "Published") return false;
      const vDepartments = parseVolunteerDepartments(v.department, v.departments);
      const vPosition = normalizeVolunteerPositionName(
        v.position || v.role,
        v.department
      );

      if (selectedDepartment !== "ALL") {
        const matchesDept =
          vDepartments.some(
            (d) => d.toLowerCase() === selectedDepartment.toLowerCase()
          ) ||
          (v.department || "")
            .toLowerCase()
            .includes(selectedDepartment.toLowerCase());
        if (!matchesDept) return false;
      }

      if (selectedPosition !== "ALL") {
        const matchesPos =
          vPosition.toLowerCase().includes(selectedPosition.toLowerCase()) ||
          (v.role || "").toLowerCase().includes(selectedPosition.toLowerCase());
        if (!matchesPos) return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = v.full_name.toLowerCase().includes(q);
        const matchDept =
          (v.department || "").toLowerCase().includes(q) ||
          vDepartments.some((d) => d.toLowerCase().includes(q));
        const matchRole =
          vPosition.toLowerCase().includes(q) ||
          (v.role || "").toLowerCase().includes(q);
        const matchExpertise = (v.expertise || []).some((skill) =>
          skill.toLowerCase().includes(q)
        );
        return matchName || matchDept || matchRole || matchExpertise;
      }

      return true;
    });
  }, [volunteers, selectedDepartment, selectedPosition, searchQuery]);

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-20 pb-24 font-sans">
      {/* Hero Banner — Right-Minds Africa Navy Blue, Orange & White */}
      <section className="bg-brand-blue text-white py-16 sm:py-20 border-b-4 border-brand-orange relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />
        <PageContainer className="relative z-10">
          <div className="max-w-3xl space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-brand-orange text-xs font-mono font-bold uppercase tracking-widest">
              <HeartHandshake size={14} />
              <span>Right-Minds Africa Community</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight">
              Meet Our Volunteers
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl">
              Behind every meaningful impact is a community of passionate individuals committed to creating change. Meet the volunteers contributing their time, skills and dedication to the Right-Minds Africa vision.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Search, Main Department & Position Filter Bar */}
      <section className="py-8 bg-slate-50 border-b border-slate-200/80">
        <PageContainer>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search by Name, Department, or Position */}
            <div className="relative flex-1 max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search volunteers by name, department, or position..."
                aria-label="Search volunteers by name, department, or position"
                className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Department (6 Main RMA Departments) & Position Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Briefcase size={15} className="text-brand-orange shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue font-mono">
                  Department:
                </span>
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedPosition("ALL");
                }}
                aria-label="Filter volunteers by main department"
                className="max-w-xs px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-brand-blue shadow-2xs focus:outline-none focus:border-brand-orange cursor-pointer truncate"
              >
                <option value="ALL">All 6 Main Departments ({volunteers.length})</option>
                {RMA_MAIN_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.number}. {dept.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                aria-label="Filter volunteers by position"
                className="max-w-xs px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-brand-blue shadow-2xs focus:outline-none focus:border-brand-orange cursor-pointer truncate"
              >
                <option value="ALL">
                  {selectedDepartment === "ALL"
                    ? "All Positions"
                    : `All ${selectedDepartment} Positions`}
                </option>
                {selectedDepartment === "ALL"
                  ? RMA_MAIN_DEPARTMENTS.map((dept) => (
                      <optgroup key={dept.id} label={`${dept.number}. ${dept.name}`}>
                        {dept.positions.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  : availablePositions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
              </select>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Main Volunteers Profile-Card Grid */}
      <section className="py-14 sm:py-16">
        <PageContainer>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs p-6 space-y-4 animate-pulse"
                >
                  <div className="w-full h-64 bg-slate-100 rounded-2xl" />
                  <div className="h-5 bg-slate-100 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-16 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="max-w-lg mx-auto text-center py-16 px-6 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue text-white flex items-center justify-center mx-auto shadow-sm">
                <Users size={26} className="text-brand-orange" />
              </div>
              <h2 className="text-xl font-display font-extrabold text-brand-blue">
                {volunteers.length === 0
                  ? "Volunteer Profiles Coming Soon"
                  : "No Matching Volunteers Found"}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {volunteers.length === 0
                  ? "Our administrators are currently updating our published volunteer directory. Check back soon or apply to join our volunteer community."
                  : "No published volunteer profiles matched your current search, department, or position filter. Try clearing your filter criteria."}
              </p>
              {(searchQuery || selectedDepartment !== "ALL" || selectedPosition !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartment("ALL");
                    setSelectedPosition("ALL");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVolunteers.map((volunteer) => {
                const vDepartments = parseVolunteerDepartments(
                  volunteer.department,
                  volunteer.departments
                );
                const primaryDept =
                  vDepartments[0] || RMA_VOLUNTEER_DEPARTMENTS[0];
                const extraDeptCount =
                  vDepartments.length > 1 ? vDepartments.length - 1 : 0;
                const vPosition = normalizeVolunteerPositionName(
                  volunteer.position || volunteer.role,
                  volunteer.department
                );

                return (
                  <motion.article
                    key={volunteer.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setSelectedVolunteer(volunteer)}
                    className="group bg-white border border-slate-200 hover:border-brand-orange/60 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col text-left cursor-pointer"
                  >
                    {/* Professional Photograph */}
                    <div className="relative h-72 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                      {volunteer.photo_url ? (
                        <img
                          src={volunteer.photo_url}
                          alt={volunteer.full_name}
                          loading="lazy"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-blue text-white font-display font-black text-3xl">
                          {volunteer.full_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {/* Main Department Badge(s) */}
                      {primaryDept && (
                        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center gap-1.5">
                          <span className="px-3 py-1 rounded-full bg-brand-blue/95 text-white text-[11px] font-bold tracking-wide shadow-sm truncate max-w-full">
                            {primaryDept}
                          </span>
                          {extraDeptCount > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-brand-orange text-white text-[10px] font-extrabold shadow-sm shrink-0">
                              +{extraDeptCount} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-2.5">
                        <div>
                          <h2 className="text-xl font-display font-extrabold text-brand-blue group-hover:text-brand-orange transition-colors leading-snug">
                            {volunteer.full_name}
                          </h2>
                          <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mt-0.5">
                            {vPosition}
                          </p>
                        </div>

                        {/* Assigned Main Department List on Card */}
                        {vDepartments.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {vDepartments.map((dept, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand-blue/5 text-brand-blue text-[11px] font-semibold"
                              >
                                <Briefcase
                                  size={10}
                                  className="text-brand-orange shrink-0"
                                />
                                <span className="truncate max-w-[240px]">{dept}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {volunteer.biography}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVolunteer(volunteer);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue group-hover:bg-brand-orange text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <span>View Profile</span>
                          <ArrowRight size={14} />
                        </button>

                        {volunteer.linkedin_url && (
                          <a
                            href={volunteer.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-blue hover:border-brand-blue transition-colors"
                            title={`${volunteer.full_name} on LinkedIn`}
                          >
                            <Linkedin size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </PageContainer>
      </section>

      {/* Call to Action Banner for Prospective Volunteers */}
      <section className="pt-4">
        <PageContainer>
          <div className="bg-brand-blue rounded-3xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-l-8 border-brand-orange shadow-lg">
            <div className="space-y-2 max-w-2xl text-left">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-orange">
                Serve With Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                Inspired to Contribute Your Skills to Right-Minds Africa?
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed">
                Join our growing network of dedicated volunteers and interns building transformative youth leadership and impact across Africa.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onNavigate("volunteer-application");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Apply to Volunteer</span>
                <ArrowRight size={15} />
              </button>
              {onOpenJoin && (
                <button
                  type="button"
                  onClick={() => onOpenJoin("corps_member")}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/15"
                >
                  Join RMA Community
                </button>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Detailed Volunteer Profile Modal */}
      <AnimatePresence>
        {selectedVolunteer && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedVolunteer(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-8 text-left"
            >
              {/* Modal Top Bar */}
              <div className="bg-brand-blue text-white px-6 py-4 flex items-center justify-between border-b-4 border-brand-orange">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-brand-orange" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    Right-Minds Africa Volunteer Profile
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVolunteer(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close volunteer profile"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-slate-100 border-2 border-brand-orange/40 shadow-md shrink-0">
                    {selectedVolunteer.photo_url ? (
                      <img
                        src={selectedVolunteer.photo_url}
                        alt={selectedVolunteer.full_name}
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-blue text-white font-display font-black text-3xl">
                        {selectedVolunteer.full_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 text-center sm:text-left flex-1">
                    <h2 className="text-2xl sm:text-3xl font-display font-black text-brand-blue leading-tight">
                      {selectedVolunteer.full_name}
                    </h2>

                    <p className="text-sm font-bold text-brand-orange uppercase tracking-wider">
                      {normalizeVolunteerPositionName(
                        selectedVolunteer.position || selectedVolunteer.role,
                        selectedVolunteer.department
                      )}
                    </p>

                    {/* Assigned Main Department(s) */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                      {parseVolunteerDepartments(
                        selectedVolunteer.department,
                        selectedVolunteer.departments
                      ).map((dept, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/5 border border-brand-blue/15 text-brand-blue text-xs font-bold"
                        >
                          <Briefcase size={12} className="text-brand-orange shrink-0" />
                          <span>Department: {dept}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                      {selectedVolunteer.date_onboarded && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar size={13} className="text-brand-blue" />
                          <span>
                            Joined{" "}
                            {new Date(
                              selectedVolunteer.date_onboarded
                            ).toLocaleDateString("en-GB", {
                              month: "long",
                              year: "numeric"
                            })}
                          </span>
                        </span>
                      )}

                      {selectedVolunteer.linkedin_url && (
                        <a
                          href={selectedVolunteer.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-xs font-bold transition-colors"
                        >
                          <Linkedin size={13} />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Biography */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-blue">
                    Professional Biography
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedVolunteer.biography}
                  </p>
                </div>

                {/* Areas of Expertise */}
                {selectedVolunteer.expertise &&
                  selectedVolunteer.expertise.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-blue">
                        Areas of Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedVolunteer.expertise.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-brand-blue text-xs font-semibold"
                          >
                            <CheckCircle2
                              size={12}
                              className="text-brand-orange shrink-0"
                            />
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedVolunteer(null)}
                    className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
