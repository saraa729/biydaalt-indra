import React, { useEffect, useRef, useState } from 'react';
import { lessons } from './data/lessons';
import { initialNews } from './data/news';
import Timeline from './modules/timeline/Timeline';
import News from './modules/news/News';
import Programs from './modules/programs/Programs';
import { 
  Lesson, 
  NewsArticle, 
  NewNewsArticle 
} from './types';

const lessonImages = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80", // Fullstack Developer
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", // Digital Marketing
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80", // English Language
  "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=80", // Chinese Language
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80", // Skillcraft / Game Dev
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80" // LITE Program / Startup
];

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1;
      
      const gridSize = 80;
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = '#05070F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawGrid();
      
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${particle.opacity})`;
        ctx.fill();
      });
      
      connectParticles();
      
      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

function App() {
  // ============== STATE VARIABLES ==============
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  const [newsList, setNewsList] = useState<NewsArticle[]>(initialNews);

  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Try to get current user
      const fetchCurrentUser = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (data.success) {
            setCurrentUser(data.user);
            // Set admin mode if user is SUPER_ADMIN
            if (data.user.role?.name === 'SUPER_ADMIN') {
              setIsAdminMode(true);
            }
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          localStorage.removeItem('token');
        }
      };
      fetchCurrentUser();
    }
  }, []);

  const [newNewsItem, setNewNewsItem] = useState<NewNewsArticle>({
    title: '',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
  });

  // Fetch news from backend
  const fetchNews = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/news`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNewsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    }
  };

  // Fetch news on mount
  useEffect(() => {
    fetchNews();
  }, []);

  const addNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Please login first");
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNewsItem)
      });
      
      if (!res.ok) {
        throw new Error("Failed to add news");
      }

      const createdNews = await res.json();
      setNewsList([...newsList, createdNews]);
      
      // Reset form
      setNewNewsItem({
        title: '',
        content: '',
        imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
      });
    } catch (err: any) {
      console.error("Error adding news:", err);
    }
  };

  const removeNews = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Please login first");
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to delete news");
      }

      setNewsList(newsList.filter(n => n.id !== id));
    } catch (err: any) {
      console.error("Error deleting news:", err);
    }
  };

  // Auth functions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    try {
      const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;
      
      if (authMode === 'register') {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword,
            firstName: authFirstName,
            lastName: authLastName,
            phone: authPhone || undefined
          })
        });
        
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        // Set admin mode if user is SUPER_ADMIN
        if (data.user.role?.name === 'SUPER_ADMIN') {
          setIsAdminMode(true);
        }
        setShowAuthModal(false);
      } else {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword
          })
        });
        
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        // Set admin mode if user is SUPER_ADMIN
        if (data.user.role?.name === 'SUPER_ADMIN') {
          setIsAdminMode(true);
        }
        setShowAuthModal(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Алдаа гарлаа');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAdminMode(false);
  };

  return (
    <div className="min-h-screen text-white font-sans relative">
      <AnimatedBackground />
      
      <nav className="sticky top-0 z-50 bg-[#0A0E17]/90 backdrop-blur-md border-b border-gray-800/30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.webp" alt="INDRA CYBER INSTITUTE" className="w-10 h-10 rounded-lg" />
              <span className="text-2xl font-bold tracking-wide">INDRA CYBER INSTITUTE</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-gray-400 hover:text-blue-300 transition text-sm font-semibold tracking-wide">БИДНИЙ ТУХАЙ</a>
              <a href="#programs" className="text-gray-400 hover:text-blue-300 transition text-sm font-semibold tracking-wide">ХОТГӨЛБӨР</a>
              <a href="#timeline" className="text-gray-400 hover:text-blue-300 transition text-sm font-semibold tracking-wide">TIMELINE</a>
              <a href="#news" className="text-gray-400 hover:text-blue-300 transition text-sm font-semibold tracking-wide">МЭДЭЭ</a>
            </div>
            
            <div className="flex items-center gap-4">
                {currentUser ? (
                  <>
                    <span className="text-gray-300 text-sm font-semibold">
                      Сайн уу, {currentUser.firstName}!
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg font-semibold text-sm transition bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                    >
                      ГАРАХ
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                      }}
                      className="hidden md:block px-6 py-2 border border-blue-400 text-blue-300 rounded-lg hover:bg-blue-400/10 transition text-sm font-semibold"
                    >
                      НЭВТРЭХ
                    </button>
                    <button 
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition"
                    >
                      БҮРТГҮҮЛЭХ
                    </button>
                  </>
                )}
              </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-16 px-4 sm:px-6 lg:px-12 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="relative z-0 mx-auto max-w-8xl overflow-hidden rounded-3xl border border-gray-800/60 shadow-2xl shadow-blue-900/20">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80" 
            alt="Education Background" 
            className="w-full h-[700px] object-cover blur opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070F] via-[#05070F]/70 to-[#05070F]/40"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
            <div className="max-w-3xl px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-blue-300 text-xs font-mono uppercase tracking-widest">Эрчимтэй Боловсрол</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                Мэргэжилтэй <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#93C5FD]">болох</span>
              </h1>
              <p className="text-[#9CA3AF] text-lg md:text-xl mb-12 leading-relaxed">
                Indra Institute-д нэгдэж, Fullstack Development, Digital Marketing, хэлний хөтөлбөрүүдээс сонгоно уу.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={() => {
                    const programsSection = document.getElementById('programs');
                    programsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-10 py-4 bg-gradient-to-r from-blue-500 to-[#93C5FD] text-[#05070F] rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition transform hover:-translate-y-0.5">
                  ХОТГӨЛБӨР ҮЗЭХ
                </button>
                {!currentUser && (
                  <button 
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="px-10 py-4 border border-gray-700 text-white rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-300 transition bg-[#090D1A]/50 backdrop-blur-sm">
                    Бүртгүүлэх
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-24">
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-10 p-10 bg-[#0A0E17]/70 rounded-2xl border border-gray-800/30 backdrop-blur-sm">
            {[
              { value: "98%", label: "АЖИЛД ОРУУЛАХ" },
              { value: "2,400+", label: "СУРАГЧ" },
              { value: "10+", label: "ХӨТГӨЛБӨР" },
              { value: "45+", label: "БАЙГУУЛЛАГУУД" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-[#9CA3AF] text-xs md:text-sm font-mono uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Бидний Тухай section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-12 bg-[#0A0E17]">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Бидний Тухай</h2>
            <p className="text-[#9CA3AF] text-lg">Монголын анхны нэгдсэн экосистемтой институт</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#05070F]/80 border border-gray-800/60 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">AI</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI интеграцтай сургалт</h3>
              <p className="text-[#9CA3AF] text-[#9CA3AF]">ChatGPT, Claude, Midjourney зэрэг 10+ AI хэрэгслийг хичээлд нэгтгэсэн орчин үеийн сургалтын арга.</p>
            </div>

            <div className="bg-[#05070F]/80 border border-gray-800/60 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">CT</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Олон улсын сертификат</h3>
              <p className="text-[#9CA3AF] text-[#9CA3AF]">Google, Meta, Harvard зэрэг олон улсад хүлээн зөвшөөрөгдсөн байгууллагуудын сертификат олгодог.</p>
            </div>

            <div className="bg-[#05070F]/80 border border-gray-800/60 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">JB</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Ажлын байранд бэлтгэх</h3>
              <p className="text-[#9CA3AF] text-[#9CA3AF]">Төгсөгчдийн 50%+ нь төгсмөгцөө ажилд орсон. Бодит портфолиотойгоор төгсөнө.</p>
            </div>

            <div className="bg-[#05070F]/80 border border-gray-800/60 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">EC</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Нэгдсэн экосистем</h3>
              <p className="text-[#9CA3AF] text-[#9CA3AF]">IT + Маркетинг + Хэлний сургалтыг нэг дор нэгтгэсэн Монголын анхны мэргэжлийн институт.</p>
            </div>
          </div>
        </div>
      </section>

      <Programs lessons={lessons} setSelectedLesson={setSelectedLesson} />

      <Timeline />

      <News 
        news={newsList}
        isAdminMode={isAdminMode}
        newNewsItem={newNewsItem}
        setNewNewsItem={setNewNewsItem}
        addNews={addNews}
        removeNews={removeNews}
        setSelectedNews={setSelectedNews}
      />

      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-r from-blue-900 to-indigo-1000">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Бидэнтэй нэгдэхээр бэлэн үү?</h2>
            <p className="text-blue-200 text-lg">Хурдан хөтөлбөрийн өрсөлдөхөөс бүртгүүлэх боломж нээлттэй. Хязгаарлагдсан суудал.</p>
          </div>
          {!currentUser && (
            <button 
              onClick={() => {
                setAuthMode('register');
                setShowAuthModal(true);
              }}
              className="px-10 py-4 bg-[#05070F] text-white rounded-xl font-bold text-lg hover:bg-[#090D1A] transition shadow-lg shadow-black/20 whitespace-nowrap">
              ҮНЭЛГЭЭ ЭХЛҮҮЛЭХ
            </button>
          )}
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-12 border-t border-gray-800/50 bg-[#0A0E17]/70 backdrop-blur-sm">
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.webp" alt="INDRA CYBER INSTITUTE" className="w-10 h-10 rounded-lg" />
                <span className="text-xl font-bold tracking-wide">INDRA CYBER INSTITUTE</span>
              </div>
              <p className="text-[#9CA3AF] text-sm leading-relaxed">
                Indra Cyber Institute бол ирээдүйн хамгаалалтын мэргэжилтнүүд болон салбарын тэргүүчдийг сургах анхны байгууллага юм.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">НӨӨЦЛӨЛ</h4>
              <ul className="space-y-2 text-[#9CA3AF] text-sm">
                <li><a href="#" className="hover:text-blue-300 transition">Сургалтын Материал</a></li>
                <li><a href="#" className="hover:text-blue-300 transition">Дасгалын Лаб</a></li>
                <li><a href="#" className="hover:text-blue-300 transition">Ажилд Оруулах Тусламж</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">ХОЛБОО БАРИХ</h4>
              <ul className="space-y-2 text-[#9CA3AF] text-sm">
                <li>contact@indracyber.in</li>
                <li>+976 99999999</li>
                <li>Улаанбаатар, Монгол</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">ХУУЛЬ</h4>
              <ul className="space-y-2 text-[#9CA3AF] text-sm">
                <li><a href="#" className="hover:text-blue-300 transition">Нууцлалын бодлого</a></li>
                <li><a href="#" className="hover:text-blue-300 transition">Үйлчилгээний нөхцөл</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800/50 text-center text-[#6B7280] text-sm">
            © {new Date().getFullYear()} Indra Cyber Institute. 2018 оноос хойш дижитал цагаан овоог хамгаалж байна.
          </div>
        </div>
      </footer>


      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0E17] rounded-3xl border border-gray-800/60 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-900/30">
            <div className="relative h-64 w-full overflow-hidden rounded-t-3xl">
              <img 
                src={lessonImages[lessons.findIndex(l => l.title === selectedLesson.title) % lessonImages.length]} 
                alt={selectedLesson.title} 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/70 to-transparent"></div>
              <button 
                onClick={() => setSelectedLesson(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white transition text-2xl p-2 rounded-full backdrop-blur-sm"
              >
                ×
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
                  selectedLesson.tag === "Advanced" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                  selectedLesson.tag === "Foundational" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                  "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                }`}>
                  {selectedLesson.tag === "Advanced" ? "Дэвшилтэт" : selectedLesson.tag === "Foundational" ? "Суурь" : "Тусгай"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{selectedLesson.title}</h2>
                <p className="text-blue-400 text-sm font-mono">{selectedLesson.duration}</p>
              </div>

              <div className="text-[#9CA3AF] whitespace-pre-line leading-relaxed text-lg">
                {selectedLesson.detailedExplanation}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800/50 flex gap-4">
                {!currentUser && (
                  <button 
                    onClick={() => {
                      setSelectedLesson(null);
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-[#93C5FD] text-[#05070F] rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition transform hover:-translate-y-0.5">
                    БҮРТГҮҮЛЭХ
                  </button>
                )}
                <button 
                  onClick={() => setSelectedLesson(null)}
                  className="px-8 py-3 border border-gray-700 text-white rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-300 transition"
                >
                  ХААХ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0E17] rounded-3xl border border-gray-800/60 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-900/30">
            <div className="relative h-64 w-full overflow-hidden rounded-t-3xl">
              <img 
                src={selectedNews.imageUrl || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80'} 
                alt={selectedNews.title} 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/70 to-transparent"></div>
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white transition text-2xl p-2 rounded-full backdrop-blur-sm"
              >
                ×
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-400 border border-blue-500/30 bg-blue-500/10 mb-4">
                  МЭДЭЭ БОЛОН ШИНЭ ЧИГЛЭЛ
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{selectedNews.title}</h2>
                <p className="text-blue-400 text-sm font-mono">{new Date(selectedNews.createdAt).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div className="text-[#9CA3AF] whitespace-pre-line leading-relaxed text-lg">
                {selectedNews.content}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800/50 flex gap-4">
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="px-8 py-3 border border-gray-700 text-white rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-300 transition"
                >
                  ХААХ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0E17] rounded-3xl border border-gray-800/60 max-w-md w-full shadow-2xl shadow-blue-900/30">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {authMode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-white transition text-2xl p-2 hover:bg-gray-800/50 rounded-full"
                >
                  ×
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">Овог</label>
                      <input
                        type="text"
                        required
                        value={authLastName}
                        onChange={(e) => setAuthLastName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#05070F] border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition"
                        placeholder="Овогоо оруулна уу"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">Нэр</label>
                      <input
                        type="text"
                        required
                        value={authFirstName}
                        onChange={(e) => setAuthFirstName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#05070F] border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition"
                        placeholder="Нэрээ оруулна уу"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">Утасны дугаар (сонголттой)</label>
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-[#05070F] border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition"
                        placeholder="Утасны дугаараа оруулна уу"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">И-мэйл</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#05070F] border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">Нууц үг</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#05070F] border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition"
                    placeholder="Нууц үгээ оруулна уу"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? 'Уншиж байна...' : (authMode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  {authMode === 'login' ? 'Бүртгүүлээгүй үү?' : 'Бүртгүүлсэн байна уу?'}
                  {' '}
                  <button
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setAuthError('');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold transition"
                  >
                    {authMode === 'login' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
