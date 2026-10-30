import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Filter,
  FileBadge,
  Wand2,
  PlayCircle,
  Clock,
  Award
} from 'lucide-react';
import { RESOURCES_DATA } from '../data/mockData';
import { ResourceItem, SchoolLevel, ExamPaper, QuizQuestion } from '../types';

interface ResourcesSectionProps {
  examPapers?: ExamPaper[];
  onStartExam?: (questions: QuizQuestion[], title: string) => void;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  examPapers = [],
  onStartExam,
}) => {
  const [levelFilter, setLevelFilter] = useState<'All' | SchoolLevel>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  const handleDownload = (id: string, title: string) => {
    if (!downloadedIds.includes(id)) {
      setDownloadedIds([...downloadedIds, id]);
    }
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('download', `${title}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResources = RESOURCES_DATA.filter((res) => {
    const matchesLevel = levelFilter === 'All' || res.level === levelFilter;
    const matchesType = typeFilter === 'All' || res.type === typeFilter;
    const matchesQuery = 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.classLevel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesType && matchesQuery;
  });

  return (
    <section className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-3">
            <FileBadge className="w-3.5 h-3.5" />
            <span>Official Examination & Past Paper Bank</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            UNEB Examination Hall & Revision Library
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Take auto-marked interactive examinations online or download printable PDF question papers for offline revision.
          </p>
        </div>

        {/* FEATURED: Interactive Online Exam Papers (Extracted from PDF) */}
        {examPapers.length > 0 && (
          <div className="mb-12 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-purple-800/50">
              <div>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Active Examination Papers
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1">
                  Online Exam Hall (Interactive & PDF Formats)
                </h3>
                <p className="text-xs text-purple-200 mt-1">
                  Papers uploaded by Teacher Ojok. Learners can answer directly online or download the original PDF paper.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examPapers.map((exam) => (
                <div key={exam.id} className="bg-purple-900/40 border border-purple-700/60 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-purple-800 text-pink-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                        {exam.classLevel} · {exam.subject}
                      </span>
                      {exam.mode === 'interactive-extracted' ? (
                        <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Wand2 className="w-3 h-3" /> Auto-Marked Online
                        </span>
                      ) : (
                        <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md">
                          Printable PDF Paper
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-white text-base leading-snug">
                      {exam.title}
                    </h4>

                    <p className="text-xs text-purple-200 mt-1">
                      {exam.term} {exam.year ? `(${exam.year})` : ''} · {exam.questions ? `${exam.questions.length} Questions Extracted` : 'Authentic Exam Layout'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-800/60 flex flex-wrap items-center justify-between gap-2">
                    {exam.mode === 'interactive-extracted' && exam.questions && onStartExam ? (
                      <button
                        onClick={() => onStartExam(exam.questions!, exam.title)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Sit Online Exam (Auto-Marked)</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleDownload(exam.id, exam.title)}
                      className="bg-purple-800/80 hover:bg-purple-700 text-purple-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download PDF ({exam.pdfFileSize || '3.5 MB'})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources by subject or year (e.g. 'P7 Math 2025', 'UCE Physics')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {(['All', 'primary', 'secondary'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 capitalize ${
                    levelFilter === lvl
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'All' ? 'All Levels' : lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1 border-t border-slate-100">
            <span className="font-semibold text-slate-500">Resource Type:</span>
            {['All', 'Past Paper', 'Marking Guide', 'Revision Notes', 'Worksheet'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium shrink-0 ${
                  typeFilter === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => {
            const isDownloaded = downloadedIds.includes(res.id);

            return (
              <div 
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        res.level === 'primary' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {res.classLevel}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {res.type}
                      </span>
                      {res.year && (
                        <span className="text-xs font-medium text-slate-500">
                          Year: {res.year}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {res.fileSize}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2">
                    Subject: <strong>{res.subject}</strong> · {res.downloadsCount.toLocaleString()} Total Downloads
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600">
                    Free PDF Download
                  </span>

                  <button
                    onClick={() => handleDownload(res.id, res.title)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isDownloaded
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-900 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {isDownloaded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
