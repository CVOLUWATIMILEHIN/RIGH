import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Search, Newspaper, Video, Mic, 
  Download, ChevronRight, Play, ExternalLink, FileText, ArrowRight, ChevronDown, X,
  ThumbsUp, MessageSquare, Calendar, Facebook
} from "lucide-react";
import FAQs from "../FAQs";
import Gallery from "../Gallery";
import { GalleryItem, GALLERY_ITEMS } from "../../types";
import { getResources, getSocialPosts } from "../../lib/db";
import { PageContainer } from "../PageContainer";

interface ResourceViewsProps {
  subView: "articles" | "videos" | "podcasts" | "downloads" | "faqs" | "gallery";
  onNavigate: (view: string) => void;
  onOpenJoin: (profile?: string) => void;
}

export default function ResourceViews({ subView, onNavigate, onOpenJoin }: ResourceViewsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [dbResources, setDbResources] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [selectedArticleTab, setSelectedArticleTab] = useState<"coaches" | "facebook">("coaches");
  const [selectedPostForModal, setSelectedPostForModal] = useState<any | null>(null);

  useEffect(() => {
    const loadSocialData = async () => {
      const data = await getSocialPosts();
      if (data) {
        setSocialPosts(data);
      }
    };
    loadSocialData();

    window.addEventListener("rma_social_posts_updated", loadSocialData);
    return () => window.removeEventListener("rma_social_posts_updated", loadSocialData);
  }, []);

  useEffect(() => {
    const loadAndSyncResources = async () => {
      const data = await getResources();
      if (data) {
        setDbResources(data);
      }
    };
    loadAndSyncResources();

    window.addEventListener("rma_resources_updated", loadAndSyncResources);
    return () => window.removeEventListener("rma_resources_updated", loadAndSyncResources);
  }, []);

  const articlesList = [
    {
      title: "Mindset Re-Engineering: The Catalyst for African Youth Growth",
      author: "Gracious-Esther",
      date: "May 25, 2026",
      desc: "Escaping standard procrastination loops and limited thinking. How setting robust routine metrics drives ultimate physical change."
    },
    {
      title: "Navigating National Service (NYSC) with Strategic Purpose",
      author: "Abana Ogechukwu Esther",
      date: "April 18, 2026",
      desc: "Don't let 12 months waste. Practical guidelines on saving patterns, digital skill setups, and remote international placements."
    },
    {
      title: "Building Workplace High Integrity & Professional EQ",
      author: "Gracious-Esther",
      date: "March 10, 2026",
      desc: "Differentiating intellectual competence and behavioral excellence. Raising efficiency benchmarks in complex corporate environments."
    }
  ];

  const downloadsList = [
    { title: "RMA 12-Month Goal Execution Workbook", format: "PDF Document (2.4 MB)", link: "https://sellar.co/m/rightmindsafrica", isSellar: true },
    { title: "Standard Mindset Daily Audit Journal", format: "Interactive Worksheet (1.2 MB)", link: "https://sellar.co/m/rightmindsafrica", isSellar: true },
    { title: "NYSC Save & Financial Growth Guide", format: "Guides & Slide Deck (3.1 MB)", link: "https://sellar.co/m/rightmindsafrica", isSellar: true },
    { title: "G3 Goal Setting & Execution Masterclass Flyer & SOP", format: "Flyer & PDF Record (1.8 MB)", link: "https://sellar.co/m/rightmindsafrica", isSellar: true },
    { title: "YAP Annual Conference Speaker Decks & Program Flyer", format: "Vetted Event Resource (4.5 MB)", link: "https://sellar.co/m/rightmindsafrica", isSellar: true }
  ];

  // Articles
  const dbArticles = dbResources.filter(r => r.category === "Articles" && r.status === "Active");
  const filteredArticles = dbArticles.length > 0 
    ? dbArticles.map(a => ({
        title: a.title,
        author: a.author || "RMA Academy",
        date: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "May 25, 2026",
        desc: a.description,
        link: a.link
      }))
    : articlesList;

  // Downloads
  const dbDownloads = dbResources.filter(r => r.category === "Downloads" && r.status === "Active");
  const filteredDownloads = dbDownloads.length > 0 
    ? dbDownloads.map(d => ({
        title: d.title,
        format: d.sizeOrDuration || "PDF Document",
        link: d.link || "https://sellar.co/m/rightmindsafrica",
        isSellar: true
      }))
    : downloadsList;

  // Videos
  const dbVideos = dbResources.filter(r => r.category === "Videos" && r.status === "Active");
  const filteredVideos = dbVideos.length > 0 
    ? dbVideos.map(v => ({
        title: v.title,
        duration: v.sizeOrDuration || "15:00 Mins",
        desc: v.description,
        link: v.link
      }))
    : [
        { title: "YAP Conference Mainstage Summary", duration: "18:24 Muns", desc: "A robust overview of corporate positioning and mindset resilience presented physically in Lagos." },
        { title: "CII Resume Overhaul & LinkedIn Masterclass", duration: "44:10 Muns", desc: "Coordinating executive standard CV formats specifically designed for graduates entering remote freelancing." }
      ];

  // Podcasts
  const dbPodcasts = dbResources.filter(r => r.category === "Podcasts" && r.status === "Active");
  const filteredPodcasts = dbPodcasts.length > 0 
    ? dbPodcasts.map((p, ix) => ({
        ep: "Episode " + (p.id ? p.id.replace(/\D/g, "") : (ix + 1)),
        title: p.title,
        length: p.sizeOrDuration || "20 Mins",
        speaker: p.author || "Guest Analyst",
        link: p.link
      }))
    : [
        { ep: "Episode 12", title: "Overcoming Post-Graduation Anxieties", length: "14:10 Muns", speaker: "Gracious-Esther" },
        { ep: "Episode 11", title: "Character Standards in Professional Circles", length: "18:45 Muns", speaker: "Abana Ogechukwu Esther" }
      ];

  const handleDownload = (fileName: string, link: string) => {
    if (link && link !== "#") {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }
    setDownloadSuccess(`Initiating direct client download for: ${fileName}. Perfect! Check your system downloads drawer.`);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 5000);
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      // Check for headings
      if (line.startsWith("### ")) {
        return <h4 key={i} className="text-sm font-extrabold uppercase text-slate-800 tracking-tight mt-4 mb-2">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={i} className="text-base font-black uppercase text-slate-900 tracking-tight mt-5 mb-2">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={i} className="text-lg font-black uppercase text-[#0E3A2F] tracking-tight mt-6 mb-3">{line.replace("# ", "")}</h2>;
      }
      // Check for bold items
      let renderedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      const content = parts.length > 0 ? parts : renderedLine;

      // Check for lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={i} className="ml-4 list-disc text-xs text-slate-600 leading-relaxed my-1">{line.substring(2)}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-4 list-decimal text-xs text-slate-600 leading-relaxed my-1">{line.replace(/^\d+\.\s/, "")}</li>;
      }
      
      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }
      return <p key={i} className="text-xs text-slate-600 leading-relaxed my-1.5">{content}</p>;
    });
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-16">
      {/* Background radial effects */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-slate-900/5 rounded-full blur-[140px] pointer-events-none" />

      <PageContainer className="relative z-10 font-sans">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("home")} className="hover:text-slate-900 font-medium transition-colors">Home</button>
            <ChevronRight size={12} />
            <span className="font-semibold text-slate-905">Resources</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-amber-550 capitalize">{subView}</span>
          </div>
        </div>

        {/* Mobile Page Subnavigation Dropdown */}
        <div className="block lg:hidden mb-8 text-left relative" id="resources-mobile-section-nav">
          <label className="block text-[9px] font-black uppercase tracking-widest text-[#0E3A2F]/50 font-mono mb-1.5">
            📂 Resources Subsections Navigation
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#FAF8F3]/60 border border-[#0E3A2F]/10 rounded-2xl text-xs font-black uppercase text-slate-800 tracking-wider shadow-sm focus:outline-none"
          >
            <span>
              {subView === "articles" && "Growth Masterclass Articles"}
              {subView === "videos" && "Video Masterclasses & Seminars"}
              {subView === "podcasts" && "Mindset & Purpose Audio Podcasts"}
              {subView === "downloads" && "Vetted Action Worksheets & Workbooks"}
              {subView === "faqs" && "Frequently Asked Questions (FAQs)"}
              {subView === "gallery" && "Photo Gallery & Previous Events"}
            </span>
            <ChevronDown size={14} className={`transition-transform duration-200 text-slate-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1 text-left"
              >
                {[
                  { label: "Growth Masterclass Articles", view: "resources-articles" },
                  { label: "Video Masterclasses & Seminars", view: "resources-videos" },
                  { label: "Mindset & Purpose Audio Podcasts", view: "resources-podcasts" },
                  { label: "Vetted Action Worksheets & Workbooks", view: "resources-downloads" },
                  { label: "Frequently Asked Questions (FAQs)", view: "resources-faqs" },
                  { label: "Photo Gallery & Previous Events", view: "resources-gallery" }
                ].map((option) => {
                  const isActive = "resources-" + subView === option.view;
                  return (
                    <button
                      key={option.view}
                      onClick={() => {
                        onNavigate(option.view);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-[#0E3A2F] text-white" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {subView === "faqs" ? (
          <div className="mt-4" id="resources-faq-container">
            <FAQs />
          </div>
        ) : subView === "gallery" ? (
          <div className="mt-4 animate-fadeIn" id="resources-gallery-container">
            <GalleryPage galleryData={GALLERY_ITEMS} />
          </div>
        ) : (
          <>
            {/* Section title */}
            <div className="max-w-3xl space-y-4 mb-12 border-l-4 border-slate-900 pl-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-amber-600 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                <Sparkles size={11} /> Materials & Library
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display uppercase tracking-tight">
                {subView === "articles" && "Growth Masterclass Articles"}
                {subView === "videos" && "Video Masterclasses & Seminars"}
                {subView === "podcasts" && "Mindset & Purpose Audio Podcasts"}
                {subView === "downloads" && "Vetted Action Worksheets & Workbooks"}
              </h1>
              <p className="text-slate-605 text-sm sm:text-base leading-relaxed">
                {subView === "articles" && "Read carefully curated articles written by certified coaches to guide daily thinking adjustments."}
                {subView === "videos" && "Review session highlights, interview panels, and physical classroom presentations on-demand."}
                {subView === "podcasts" && "Audio clips and episodes specifically focused on emotional resilience during youth service year."}
                {subView === "downloads" && "Directly grab interactive sheets to map 12-month goals, habit boxes, and personal savings."}
              </p>
            </div>

            {/* Quick Link to Gallery and Facebook Community */}
            <div className="mb-8 p-5 bg-gradient-to-r from-slate-50 to-amber-500/5 border border-amber-500/15 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium text-slate-700 text-left">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl shrink-0 text-sm font-black select-none leading-none">
                  📸
                </span>
                <span className="leading-relaxed">
                  Want to view snapshots of our previous events and orientation ceremonies? Check our official <strong>Photo Gallery Page</strong> or follow our updates on the <a href="https://www.facebook.com/RightMAHub/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">RMA Facebook Page</a>.
                </span>
              </div>
              <button 
                onClick={() => onNavigate("resources-gallery")}
                className="px-4 py-2.5 bg-[#0E3A2F] hover:bg-[#0b2d24] text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shrink-0 cursor-pointer self-start sm:self-center shadow-sm"
              >
                Browse Gallery &rarr;
              </button>
            </div>

        {/* SEARCH AND FILTER */}
        <div className="mb-10 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder={`Search ${subView}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs w-full text-slate-900 focus:outline-none border-none py-1 h-8"
          />
        </div>

        {/* SUCCESS ALERTS */}
        {downloadSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
            {downloadSuccess}
          </div>
        )}

        {/* ARTICLES & BLOGS */}
        {subView === "articles" && (
          <div className="space-y-8 animate-fadeIn text-left">
            <div className="flex border-b border-slate-100 pb-3 gap-6 text-xs sm:text-sm">
              <button
                onClick={() => setSelectedArticleTab("coaches")}
                className={`pb-3 font-bold uppercase tracking-wider relative transition-colors cursor-pointer ${
                  selectedArticleTab === "coaches" 
                    ? "text-[#0E3A2F]" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                ✍️ Coaches' Masterclasses
                {selectedArticleTab === "coaches" && (
                  <motion.div layoutId="activeArticleTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E3A2F]" />
                )}
              </button>
              
              <button
                onClick={() => setSelectedArticleTab("facebook")}
                className={`pb-3 font-bold uppercase tracking-wider relative transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedArticleTab === "facebook" 
                    ? "text-[#0E3A2F]" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                📘 Facebook Live Feed
                <span className="bg-blue-100 text-blue-700 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">LIVE</span>
                {selectedArticleTab === "facebook" && (
                  <motion.div layoutId="activeArticleTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E3A2F]" />
                )}
              </button>
            </div>

            {selectedArticleTab === "coaches" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredArticles
                  .filter(art => art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((art, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:border-amber-500/30 transition-all flex flex-col justify-between">
                      <div className="space-y-4">
                        <span className="text-[10px] text-amber-550 font-bold font-mono uppercase block">{art.date} &bull; BY {art.author}</span>
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tight leading-snug">{art.title}</h3>
                        <p className="text-slate-500 text-xs leading-relaxed font-normal">{art.desc}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <button 
                          onClick={() => art.link && art.link !== "#" && window.open(art.link, "_blank", "noopener,noreferrer")}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase"
                        >
                          Read Entire Article <ArrowRight size={12} />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] text-slate-400 font-bold uppercase font-mono tracking-wider">Share</span>
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${art.title}" by ${art.author} on Right Minds Africa!`)}&url=${encodeURIComponent(art.link && art.link !== "#" ? art.link : "https://rightmindsafrica.org/?view=resources-articles")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-black transition-colors flex items-center justify-center cursor-pointer"
                            title="Share on X (Twitter)"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </a>
                          
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(art.link && art.link !== "#" ? art.link : "https://rightmindsafrica.org/?view=resources-articles")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#0a66c2] transition-colors flex items-center justify-center cursor-pointer"
                            title="Share on LinkedIn"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                          
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this insightful article from Right Minds Africa: "${art.title}" by ${art.author}. ✨ Read here: ` + (art.link && art.link !== "#" ? art.link : "https://rightmindsafrica.org/?view=resources-articles"))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#25D366] transition-colors flex items-center justify-center cursor-pointer"
                            title="Share on WhatsApp"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.636-1.023-5.115-2.884-6.978C16.53 1.9 14.05 1.171 11.413 1.171c-5.438 0-9.863 4.42-9.867 9.864 0 1.702.443 3.366 1.293 4.811L1.8 21.01l5.222-1.37a9.8 9.8 0 0 0 4.822 1.144z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Meta Feed Description Banner */}
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-left text-xs text-blue-800 flex items-start gap-3">
                  <span className="text-sm">📘</span>
                  <div className="space-y-1">
                    <p className="font-bold">Real-Time Meta Integration Portal</p>
                    <p className="text-slate-600 font-normal leading-relaxed">
                      These posts are fetched automatically from the <strong className="font-bold">RMA Official Facebook page</strong>. The raw captions are translated and expanded automatically using Google Gemini's neural editor into highly professional, structured leadership articles instantly.
                    </p>
                  </div>
                </div>

                {socialPosts.filter(p => p.platform === "facebook" || p.platform === "manual").length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-250 rounded-3xl space-y-4">
                    <span className="text-3xl">📡</span>
                    <h4 className="font-bold text-slate-800 text-sm uppercase">No Live Posts Synchronized Yet</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-normal">
                      Administrators can use the Right Minds Africa Operations Hub (press <strong className="font-bold">Ctrl+Shift+A</strong>) and click <strong>"Sync Social Hub"</strong> under the Social Automation Hub tab to pull live content automatically using Gemini.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {socialPosts
                      .filter(p => p.platform === "facebook" || p.platform === "manual")
                      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((post) => {
                        const hasMedia = post.mediaUrls && post.mediaUrls.length > 0 && post.mediaUrls[0];
                        const dateString = post.publishedAt 
                          ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
                          : "May 25, 2026";
                        return (
                          <div key={post.id} className="bg-white border border-slate-150 rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                            {/* Card Header (Facebook Post Style) */}
                            <div className="p-4 border-b border-slate-50 flex items-center justify-between gap-3 text-left">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-[#0E3A2F] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                  RMA
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-slate-900 text-xs tracking-tight flex items-center gap-1">
                                    Right Minds Africa Hub
                                    <svg className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" title="Verified Account">
                                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 font-mono">
                                    <Calendar size={10} /> {dateString}
                                  </span>
                                </div>
                              </div>
                              <div className="p-1.5 bg-[#1877F2]/10 text-[#1877F2] rounded-lg">
                                <Facebook size={12} className="fill-current" />
                              </div>
                            </div>

                            {/* Card Media (if any) */}
                            {hasMedia && (
                              <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 border-b border-slate-50">
                                <img 
                                  src={post.mediaUrls[0]} 
                                  alt={post.title} 
                                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                              <div className="space-y-2">
                                <span className="inline-block text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-mono">
                                  #{post.category || "General"}
                                </span>
                                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight leading-snug line-clamp-2">
                                  {post.title}
                                </h4>
                                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 font-normal">
                                  {post.content}
                                </p>
                              </div>

                              {/* Likes & comments count bar */}
                              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-50">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp size={11} className="text-blue-500 fill-current" /> {post.likesCount || 12} Likes
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare size={11} /> {post.commentsCount || 2} Comments
                                </span>
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex gap-2">
                              {post.blogArticle ? (
                                <button
                                  onClick={() => setSelectedPostForModal(post)}
                                  className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Sparkles size={11} /> Read Gemini Blog
                                </button>
                              ) : (
                                <button
                                  onClick={() => window.open(post.postUrl || "https://www.facebook.com/RightMAHub/", "_blank", "noopener,noreferrer")}
                                  className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  View Raw Post
                                </button>
                              )}
                              <a
                                href={post.postUrl || "https://www.facebook.com/RightMAHub/"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                                title="View Original Post on Facebook"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIDEO CLINICS */}
        {subView === "videos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredVideos.map((vid, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden flex flex-col">
                <div 
                  onClick={() => vid.link && vid.link !== "#" && window.open(vid.link, "_blank", "noopener,noreferrer")}
                  className="aspect-video bg-slate-900 border-b border-slate-200 flex items-center justify-center relative cursor-pointer group"
                >
                  <Play size={36} className="text-white group-hover:scale-110 transition-all drop-shadow-md" />
                  <span className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-white tracking-widest uppercase">{vid.duration}</span>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm uppercase">{vid.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-normal">{vid.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AUDIO PODCASTS */}
        {subView === "podcasts" && (
          <div className="space-y-4">
            {filteredPodcasts.map((pod, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Mic size={20} className="text-amber-550" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{pod.ep} &bull; Guest Analyst: {pod.speaker}</span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase">{pod.title}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 font-mono font-bold">{pod.length}</span>
                  <button 
                    onClick={() => pod.link && pod.link !== "#" && window.open(pod.link, "_blank", "noopener,noreferrer")}
                    className="px-3.5 py-1.5 bg-slate-900 text-white text-[11px] rounded-lg font-bold uppercase hover:bg-slate-800 transition-colors"
                  >
                    Play Episode
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIRECT DOWNLOAD MATERIALS */}
        {subView === "downloads" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredDownloads.map((dl, i) => (
              <div key={i} className="bg-slate-50 border border-slate-105 p-6 rounded-3xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">{dl.title}</h3>
                  <p className="text-slate-500 text-[10px] font-mono leading-none">{dl.format}</p>
                </div>
                <button 
                  onClick={() => handleDownload(dl.title, dl.link)}
                  className="mt-6 w-full py-2.5 bg-[#E76F51] hover:bg-[#d85e40] text-white font-bold rounded-xl text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                >
                  <Download size={13} /> {dl.isSellar ? "Get Free on Sellar" : "Direct Download"}
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    )}

      </PageContainer>

      {/* Dynamic Overlay Modal for Facebook Posts Generated Articles */}
      <AnimatePresence>
        {selectedPostForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPostForModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left font-sans z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="space-y-1 text-left">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-mono">
                    ✨ Gemini Content Hub Expanded Blog
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight leading-snug">
                    {selectedPostForModal.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium font-mono uppercase">
                    Platform Source: <strong className="font-bold text-[#1877F2]">Facebook Page</strong> &bull; Synced: {new Date(selectedPostForModal.syncedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedPostForModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
                {selectedPostForModal.mediaUrls && selectedPostForModal.mediaUrls[0] && (
                  <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 mb-6">
                    <img 
                      src={selectedPostForModal.mediaUrls[0]} 
                      alt={selectedPostForModal.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                
                <div className="prose prose-slate max-w-none text-xs sm:text-sm">
                  {renderMarkdown(selectedPostForModal.blogArticle || selectedPostForModal.content)}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><ThumbsUp size={11} className="text-blue-500 fill-current" /> {selectedPostForModal.likesCount || 0} Likes</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11} /> {selectedPostForModal.commentsCount || 0} Comments</span>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={selectedPostForModal.postUrl || "https://www.facebook.com/RightMAHub/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Facebook size={11} className="fill-current" /> Original Post ↗
                  </a>
                  <button 
                    onClick={() => setSelectedPostForModal(null)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Close
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

interface GalleryPageProps {
  galleryData: GalleryItem[];
}

export function GalleryPage({ galleryData }: GalleryPageProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  return (
    <div className="space-y-12 text-left animate-fadeIn">
      {/* Facebook Link Banner Box */}
      <div className="p-6 bg-[#1877f2]/5 border border-[#1877f2]/15 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#1877f2]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-[#1877f2] text-white rounded-2xl shrink-0 shadow-sm shadow-[#1877f2]/20">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight">RMA Official Facebook Portal</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl font-normal">
              Stay connected with our global hub! Click below to visit the official Right Minds Africa page for continuous updates, streaming media, and discussions.
            </p>
          </div>
        </div>
        <a 
          href="https://www.facebook.com/RightMAHub/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-5 py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-500/10 shrink-0 inline-flex items-center gap-2 cursor-pointer relative z-10"
        >
          Explore Facebook Feed <ExternalLink size={12} />
        </a>
      </div>

      {/* Responsive CSS Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="gallery-grid">
        {galleryData.map((item) => (
          <div 
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className="group relative bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image Container with Zoom effect */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#0E3A2F]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-3 bg-white text-[#0E3A2F] rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Play size={16} className="fill-current" />
                </span>
              </div>
            </div>

            {/* Content panel */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 font-mono block">
                  {item.category}
                </span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tight group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-normal">
                  {item.description}
                </p>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 font-mono font-bold flex items-center justify-between border-t border-slate-100">
                <span>{item.date}</span>
                <span className="text-[9px] text-[#0E3A2F] group-hover:underline">View Memory &rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl z-10 text-left border border-slate-100"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-slate-800 hover:text-black p-2 rounded-full transition-colors z-20 shadow cursor-pointer"
                aria-label="Close details"
              >
                <X size={18} />
              </button>

              <div className="aspect-[16/10] bg-zinc-950 overflow-hidden">
                <img 
                  src={selectedImage.image} 
                  alt={selectedImage.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 text-[10px] font-black rounded uppercase">
                    {selectedImage.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-bold">{selectedImage.date}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">{selectedImage.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">{selectedImage.description}</p>
                
                {/* Facebook banner in lightbox */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <span className="text-[10px] text-slate-400 font-medium">Follow more updates and stories on Facebook:</span>
                  <a 
                    href="https://www.facebook.com/RightMAHub/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 shrink-0"
                  >
                    RMA Facebook <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
