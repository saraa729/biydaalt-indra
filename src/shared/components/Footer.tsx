import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800/50 bg-[#0A0E17]/70 px-4 py-12 text-white backdrop-blur-sm sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold">
                I
              </div>
              <span className="text-xl font-bold tracking-wide">INDRA CYBER</span>
            </div>
            <p className="text-sm leading-relaxed text-[#9CA3AF]">
              Indra Cyber Institute is a premier institution dedicated to training the next generation of cybersecurity professionals and industry leaders.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">RESOURCES</h4>
            <ul className="space-y-2 text-sm text-[#9CA3AF]">
              <li><a href="#programs" className="transition hover:text-blue-300">Study Materials</a></li>
              <li><a href="#programs" className="transition hover:text-blue-300">Practice Labs</a></li>
              <li><a href="#news" className="transition hover:text-blue-300">Career Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">CONTACT</h4>
            <ul className="space-y-2 text-sm text-[#9CA3AF]">
              <li>contact@indracyber.in</li>
              <li>+91 98765 43210</li>
              <li>Delhi, India</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">LEGAL</h4>
            <ul className="space-y-2 text-sm text-[#9CA3AF]">
              <li><a href="#" className="transition hover:text-blue-300">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-blue-300">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800/50 pt-8 text-center text-sm text-[#6B7280]">
          © {new Date().getFullYear()} Indra Cyber Institute. Securing the digital frontier since 2018.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
