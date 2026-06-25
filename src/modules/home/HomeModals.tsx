import React from 'react';
import { Admission, Lesson, NewsArticle } from '../../types';

interface HomeModalsProps {
  selectedLesson: Lesson | null;
  setSelectedLesson: React.Dispatch<React.SetStateAction<Lesson | null>>;
  selectedAdmission: Admission | null;
  setSelectedAdmission: React.Dispatch<React.SetStateAction<Admission | null>>;
  selectedNews: NewsArticle | null;
  setSelectedNews: React.Dispatch<React.SetStateAction<NewsArticle | null>>;
}

const HomeModals: React.FC<HomeModalsProps> = ({
  selectedLesson,
  setSelectedLesson,
  selectedAdmission,
  setSelectedAdmission,
  selectedNews,
  setSelectedNews,
}) => {
  return (
    <>
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-gray-800/60 bg-[#0A0E17] shadow-2xl shadow-blue-900/30">
            <div className="p-8">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <span
                    className={`mb-4 inline-block rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-wider ${
                      selectedLesson.tag === 'Advanced'
                        ? 'border-red-500/30 bg-red-500/20 text-red-400'
                        : selectedLesson.tag === 'Foundational'
                          ? 'border-blue-500/30 bg-blue-500/20 text-blue-400'
                          : 'border-purple-500/30 bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {selectedLesson.tag}
                  </span>
                  <h2 className="text-3xl font-bold text-white">{selectedLesson.title}</h2>
                  <p className="mt-2 text-sm font-mono text-blue-400">{selectedLesson.duration}</p>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="rounded-full p-2 text-2xl text-gray-400 transition hover:bg-gray-800/50 hover:text-white"
                >
                  X
                </button>
              </div>
              <div className="whitespace-pre-line leading-relaxed text-[#9CA3AF]">
                {selectedLesson.detailedExplanation}
              </div>
              <div className="mt-8 flex gap-4 border-t border-gray-800/50 pt-6">
                <button className="rounded-xl bg-gradient-to-r from-blue-500 to-[#93C5FD] px-8 py-3 text-lg font-bold text-[#05070F] shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-blue-500/50">
                  ENROLL NOW
                </button>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="rounded-xl border border-gray-700 px-8 py-3 text-lg font-semibold text-white transition hover:border-blue-500 hover:text-blue-300"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-gray-800/60 bg-[#0A0E17] shadow-2xl shadow-blue-900/30">
            <div className="p-8">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-4 text-5xl">{selectedAdmission.icon}</div>
                  <span className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
                    ADMISSION UPDATE
                  </span>
                  <h2 className="text-3xl font-bold text-white">{selectedAdmission.title}</h2>
                  <p className="mt-2 text-sm font-mono text-blue-400">{selectedAdmission.date}</p>
                </div>
                <button
                  onClick={() => setSelectedAdmission(null)}
                  className="rounded-full p-2 text-2xl text-gray-400 transition hover:bg-gray-800/50 hover:text-white"
                >
                  X
                </button>
              </div>
              <div className="whitespace-pre-line leading-relaxed text-[#9CA3AF]">
                {selectedAdmission.details}
              </div>
              <div className="mt-8 flex gap-4 border-t border-gray-800/50 pt-6">
                <button className="rounded-xl bg-gradient-to-r from-blue-500 to-[#93C5FD] px-8 py-3 text-lg font-bold text-[#05070F] shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-blue-500/50">
                  APPLY NOW
                </button>
                <button
                  onClick={() => setSelectedAdmission(null)}
                  className="rounded-xl border border-gray-700 px-8 py-3 text-lg font-semibold text-white transition hover:border-blue-500 hover:text-blue-300"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-gray-800/60 bg-[#0A0E17] shadow-2xl shadow-blue-900/30">
            <div className="relative h-64 w-full overflow-hidden rounded-t-3xl">
              <img
                src={selectedNews.image}
                alt={selectedNews.title}
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/70 to-transparent" />
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-2xl text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                X
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <span className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
                  NEWS & UPDATES
                </span>
                <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">{selectedNews.title}</h2>
                <p className="text-sm font-mono text-blue-400">{selectedNews.date}</p>
              </div>

              <div className="whitespace-pre-line text-lg leading-relaxed text-[#9CA3AF]">
                {selectedNews.content}
              </div>

              <div className="mt-8 flex gap-4 border-t border-gray-800/50 pt-6">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="rounded-xl border border-gray-700 px-8 py-3 text-lg font-semibold text-white transition hover:border-blue-500 hover:text-blue-300"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeModals;
