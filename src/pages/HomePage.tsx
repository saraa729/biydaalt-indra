import React, { useState } from 'react';
import AnimatedBackground from '../shared/components/AnimatedBackground';
import Footer from '../shared/components/Footer';
import Navbar from '../shared/components/Navbar';
import { initialAdmissions } from '../data/admissions';
import { initialAnnouncements } from '../data/announcements';
import { initialNews } from '../data/news';
import { lessons } from '../data/lessons';
import Admissions from '../modules/admissions/Admissions';
import Announcements from '../modules/announcements/Announcements';
import News from '../modules/news/News';
import Programs from '../modules/programs/Programs';
import HomeModals from '../modules/home/HomeModals';
import {
  Admission,
  Announcement as AnnouncementType,
  Lesson,
  NewAdmission,
  NewAnnouncement,
  NewNewsArticle,
  NewsArticle,
} from '../types';

const getTodayLabel = () =>
  new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const createDefaultAdmission = (): NewAdmission => ({
  title: '',
  date: getTodayLabel(),
  description: '',
  icon: '📣',
  details: '',
});

const createDefaultAnnouncement = (): NewAnnouncement => ({
  title: '',
  date: getTodayLabel(),
  priority: 'Low',
  content: '',
});

const createDefaultNewsItem = (): NewNewsArticle => ({
  title: '',
  date: getTodayLabel(),
  image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  excerpt: '',
  content: '',
});

function HomePage() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [admissionsList, setAdmissionsList] = useState<Admission[]>(initialAdmissions);
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementType[]>(initialAnnouncements);
  const [newsList, setNewsList] = useState<NewsArticle[]>(initialNews);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [newAdmission, setNewAdmission] = useState<NewAdmission>(createDefaultAdmission);
  const [newAnnouncement, setNewAnnouncement] = useState<NewAnnouncement>(createDefaultAnnouncement);
  const [newNewsItem, setNewNewsItem] = useState<NewNewsArticle>(createDefaultNewsItem);

  const generateId = () => Date.now() + Math.random();

  const resetAdmissionForm = () => setNewAdmission(createDefaultAdmission());
  const resetAnnouncementForm = () => setNewAnnouncement(createDefaultAnnouncement());
  const resetNewsForm = () => setNewNewsItem(createDefaultNewsItem());

  const addAdmission = (event: React.FormEvent) => {
    event.preventDefault();
    setAdmissionsList((current) => [...current, { ...newAdmission, id: generateId() }]);
    resetAdmissionForm();
  };

  const addAnnouncement = (event: React.FormEvent) => {
    event.preventDefault();
    setAnnouncementsList((current) => [...current, { ...newAnnouncement, id: generateId() }]);
    resetAnnouncementForm();
  };

  const addNews = (event: React.FormEvent) => {
    event.preventDefault();
    setNewsList((current) => [...current, { ...newNewsItem, id: generateId() }]);
    resetNewsForm();
  };

  const removeAdmission = (id: number) => {
    setAdmissionsList((current) => current.filter((item) => item.id !== id));
  };

  const removeAnnouncement = (id: number) => {
    setAnnouncementsList((current) => current.filter((item) => item.id !== id));
  };

  const removeNews = (id: number) => {
    setNewsList((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div id="top" className="min-h-screen relative font-sans text-white">
      <AnimatedBackground />
      <Navbar isAdminMode={isAdminMode} onToggleAdmin={() => setIsAdminMode((current) => !current)} />

      <main>
        <section className="relative overflow-hidden px-4 pt-16 sm:px-6 lg:px-12">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative z-0 mx-auto max-w-7xl overflow-hidden rounded-3xl border border-gray-800/60 shadow-2xl shadow-blue-900/20">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80"
              alt="Cyber Security Background"
              className="h-[700px] w-full object-cover blur"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070F] via-[#05070F]/70 to-[#05070F]/40" />

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
              <div className="max-w-3xl px-4">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-blue-300">
                    Elite Cyber Defense Training
                  </span>
                </div>
                <h1 className="mb-8 text-4xl font-bold leading-tight md:text-5xl lg:text-7xl">
                  Master the{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-[#93C5FD] bg-clip-text text-transparent">
                    Digital Frontier
                  </span>
                </h1>
                <p className="mb-12 text-lg leading-relaxed text-[#9CA3AF] md:text-xl">
                  Weaponize your technical expertise. Join the Indra Cyber Institute and transform from an enthusiast into a specialized cyber professional through immersive, mission-critical simulations.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="rounded-xl bg-gradient-to-r from-blue-500 to-[#93C5FD] px-10 py-4 text-lg font-bold text-[#05070F] shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-blue-500/50">
                    VIEW PROGRAMS
                  </button>
                  <button className="rounded-xl border border-gray-700 bg-[#090D1A]/50 px-10 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:border-blue-500 hover:text-blue-300">
                    EXPLORE CURRICULUM
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-24">
            <div className="mt-24 grid grid-cols-2 gap-10 rounded-2xl border border-gray-800/30 bg-[#0A0E17]/70 p-10 backdrop-blur-sm md:grid-cols-4">
              {[
                { value: '98%', label: 'PLACEMENT' },
                { value: '2,400+', label: 'EXPERTS' },
                { value: '1.2M', label: 'ATTACKS LAB' },
                { value: '45+', label: 'FORTUNE PARTNERS' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-2 text-3xl font-bold text-white md:text-5xl">{stat.value}</div>
                  <div className="text-xs font-mono uppercase tracking-widest text-[#9CA3AF] md:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Programs lessons={lessons} setSelectedLesson={setSelectedLesson} />

        <Admissions
          admissions={admissionsList}
          isAdminMode={isAdminMode}
          newAdmission={newAdmission}
          setNewAdmission={setNewAdmission}
          addAdmission={addAdmission}
          removeAdmission={removeAdmission}
          setSelectedAdmission={setSelectedAdmission}
        />

        <Announcements
          announcements={announcementsList}
          isAdminMode={isAdminMode}
          newAnnouncement={newAnnouncement}
          setNewAnnouncement={setNewAnnouncement}
          addAnnouncement={addAnnouncement}
          removeAnnouncement={removeAnnouncement}
        />

        <News
          news={newsList}
          isAdminMode={isAdminMode}
          newNewsItem={newNewsItem}
          setNewNewsItem={setNewNewsItem}
          addNews={addNews}
          removeNews={removeNews}
          setSelectedNews={setSelectedNews}
        />

        <section className="bg-gradient-to-r from-blue-900 to-indigo-950 px-4 py-20 sm:px-6 lg:px-12">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl">Ready to join the Vanguard?</h2>
              <p className="text-lg text-blue-200">Applications for the Accelerator intake are now open. Limited seats available.</p>
            </div>
            <button className="whitespace-nowrap rounded-xl bg-[#05070F] px-10 py-4 text-lg font-bold text-white shadow-lg shadow-black/20 transition hover:bg-[#090D1A]">
              START YOUR ASSESSMENT
            </button>
          </div>
        </section>
      </main>

      <Footer />

      <HomeModals
        selectedLesson={selectedLesson}
        setSelectedLesson={setSelectedLesson}
        selectedAdmission={selectedAdmission}
        setSelectedAdmission={setSelectedAdmission}
        selectedNews={selectedNews}
        setSelectedNews={setSelectedNews}
      />
    </div>
  );
}

export default HomePage;
