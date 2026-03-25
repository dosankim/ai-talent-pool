"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, CheckCircle2, ShieldAlert, Cpu, UserCheck, Mic } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !agreed) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, agreed }),
      });

      if (!response.ok) throw new Error('Failed to register');

      alert("신청이 완료되었습니다! 입력해주신 번호로 전용 인터뷰 웹콜 링크를 발송해 드렸습니다. 편하신 시간에 문자를 확인하고 인터뷰를 진행해 주세요.");
      setName("");
      setPhone("");
      setAgreed(false);
    } catch (error) {
      console.error(error);
      alert("신청 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Animation Variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] text-slate-900 font-sans selection:bg-purple-200">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="text-2xl font-extrabold tracking-tighter text-slate-900">
            SAI<span className="text-purple-600">PLUS</span>
          </a>
          <button onClick={scrollToForm} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm">
            AI 인터뷰 예약
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="relative pt-40 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh] text-center"
        style={{ opacity: opacityHero, scale: scaleHero }}
      >
        {/* Dynamic Premium Background */}
        <div className="absolute inset-0 bg-[#fcfdff] -z-20" />
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
        
        {/* Glowing Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-purple-400/20 rounded-full blur-[100px] md:blur-[120px] -z-10" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 right-1/4 translate-x-1/3 translate-y-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] -z-10" 
        />

        <div className="max-w-5xl px-6 mx-auto relative z-10 w-full">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center justify-center space-y-10 w-full">
            
            {/* Glassmorphic Pill Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_16px_rgba(0,0,0,0.03)] group">
              <span className="flex h-2 w-2 rounded-full bg-purple-600"></span>
              <p className="text-sm md:text-base font-bold text-slate-700 tracking-wide flex items-center gap-1.5">
                AI인터뷰 캐스팅 <span className="text-purple-300 mx-1">|</span> <span className="text-purple-600">사이플러스</span>
              </p>
            </motion.div>

            {/* Massive Typography */}
            <motion.h1
              variants={fadeUp}
              className="text-[4rem] sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.05em] leading-[1.05] text-slate-900 w-full"
            >
              <div className="relative inline-block w-full">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
                  나를 찾고,<br className="hidden sm:block"/> 일을 잇다.
                </span>
                {/* Text Shadow for depth */}
                <span className="absolute left-0 top-0 z-0 text-transparent bg-clip-text bg-gradient-to-br from-purple-600/20 to-indigo-600/20 blur-2xl transform translate-y-4">
                  나를 찾고,<br className="hidden sm:block"/> 일을 잇다.
                </span>
              </div>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed mt-4">
              "당신의 경력은 끝나지 않았습니다, 역할이 바뀌었을 뿐입니다."<br />
              <strong className="font-semibold text-slate-800">AI 기술</strong>로 은퇴 및 경단 인력을 지역 문제 해결의 주인공으로 전환합니다.
            </motion.p>

            <motion.div variants={fadeUp} className="pt-8 flex flex-col sm:flex-row items-center justify-center w-full gap-5">
              <button onClick={scrollToForm} className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-slate-900 rounded-full hover:bg-purple-700 hover:shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 text-lg overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  전화 인터뷰 신청하기
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <Link href="/consult" className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-purple-700 transition-all duration-300 bg-white/60 backdrop-blur-md border border-purple-200/50 rounded-full hover:bg-white hover:border-purple-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 text-lg">
                <Mic className="mr-2 w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                지금 바로 온라인 상담
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Value Proposition Section 1: 경험자산카드 */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Background detail */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-24">
            <span className="inline-block mb-4 text-purple-600 font-bold text-sm tracking-widest uppercase">SAI+의 가치 제안</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
              당신이 살아온 시간이<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
                새로운 명함이 됩니다
              </span>
            </h2>
          </motion.div>

          {/* 경험자산카드 feature — full-width premium card */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 text-white p-10 md:p-16 shadow-2xl shadow-purple-900/20"
          >
            {/* Background glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/25 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <div className="space-y-6">
                <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-yellow-400" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  나만의 <span className="text-yellow-400">'경험자산카드'</span> 발급
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  세상에 하나뿐인 당신만의 역량 리포트이자, 새로운 시대의 명함입니다. AI 인터뷰로 발굴된 기술·관계·취향·동기 4가지 축이 하나의 카드로 완성됩니다.
                </p>
                <div className="flex gap-3 flex-wrap">
                  {["기술 (Skill)","관계 (Relationship)","취향 (Taste)","동기 (Motivation)"].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Visual: mock card */}
              <div className="relative mx-auto w-full max-w-sm">
                <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 p-6 shadow-2xl shadow-purple-900/40 rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-white font-black text-lg">SAI+</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold">MEMBER CARD</span>
                  </div>
                  <div className="mb-8">
                    <p className="text-white/60 text-xs mb-1">이름</p>
                    <p className="text-white font-bold text-2xl tracking-wide">이경력 선생님</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-white/60 text-xs mb-0.5">핵심 역량</p><p className="text-white font-semibold text-sm">30년 현장 경험</p></div>
                    <div><p className="text-white/60 text-xs mb-0.5">추천 역할</p><p className="text-yellow-300 font-semibold text-sm">지식나눔 멘토</p></div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1.5 rounded-full shadow-lg">✦ 경험자산카드</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition Section 2: 6대 활동 영역 매칭 */}
      <section className="py-32 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-20">
            <span className="inline-block mb-4 text-purple-600 font-bold text-sm tracking-widest uppercase">프로젝트 매칭</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
              취향과 역량에 꼭 맞는<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">역할을 연결합니다</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              건강·돌봄부터 문화·창작까지, 지역사회가 필요로 하는 <strong className="text-slate-800">6대 활동 영역</strong>에 연결해 드립니다. 단순한 일자리를 넘어, 삶의 활력을 되찾는 <strong className="text-purple-700">'의미 있는 역할'</strong>을 제안합니다.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { emoji: "🏥", title: "건강 · 돌봄", desc: "간병 보조, 건강 코칭, 장기요양 지원 등 돌봄 분야의 전문적 경험을 연결합니다.", color: "from-rose-500 to-pink-500" },
              { emoji: "📚", title: "교육 · 멘토링", desc: "살아온 지식과 경험을 다음 세대에 전달하는 강사, 코치, 멘토 역할입니다.", color: "from-blue-500 to-indigo-500" },
              { emoji: "🎨", title: "문화 · 창작", desc: "예술, 공예, 스토리텔링 등 창의적 활동으로 지역 문화를 풍요롭게 합니다.", color: "from-orange-400 to-amber-500" },
              { emoji: "🌱", title: "환경 · 지속가능", desc: "도시 농업, 환경 교육, 지속 가능한 생활 방식을 전파하는 역할입니다.", color: "from-green-500 to-emerald-500" },
              { emoji: "🤝", title: "커뮤니티 · 복지", desc: "지역 주민 연결, 소외계층 지원, 커뮤니티 조직화를 담당합니다.", color: "from-purple-500 to-violet-500" },
              { emoji: "💼", title: "비즈니스 · 자문", desc: "수십 년의 업무 경험을 스타트업, 소상공인에게 전수하는 전문가 역할입니다.", color: "from-slate-600 to-slate-700" },
            ].map((area, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                style={{ transitionDelay: `${i * 60}ms` }}
                className="group relative bg-white rounded-3xl p-8 border border-slate-100 hover:border-transparent hover:shadow-2xl hover:shadow-purple-100/60 transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`} />
                <span className="text-4xl mb-5 block">{area.emoji}</span>
                <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-purple-700 transition-colors">{area.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{area.desc}</p>
                <div className={`mt-6 h-1 w-10 rounded-full bg-gradient-to-r ${area.color} opacity-70 group-hover:w-16 transition-all duration-300`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section id="register-form" className="py-32 bg-slate-900 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-500/10 blur-[100px]" />
        </div>

        <div className="max-w-xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-yellow-200">
                당신은 여전히
              </span>
              <span className="block mt-2">이 사회에 필요한 사람입니다.</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-transparent mx-auto mb-6 rounded-full"></div>
            <p className="text-lg md:text-xl text-slate-300 font-light">
              지금 <strong className="text-white font-semibold">AI인터뷰</strong>를 신청하시고<br className="hidden md:block"/> 당신만의 프로필을 받아보세요.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-200 mb-2">이름 (성함)</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-200 mb-2">연락처 (휴대폰 번호)</label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-start gap-4 pt-4">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id="agree"
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all cursor-pointer"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    required
                  />
                </div>
                <label htmlFor="agree" className="text-sm text-slate-300 leading-relaxed cursor-pointer select-none">
                  개인정보 수집 및 이용에 동의하며, 입력하신 번호로 AI 상담 전화가 걸려오는 것에 사전 동의합니다. 수집된 정보는 인재풀 등록 목적으로만 사용됩니다.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-6 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={!name || !phone || !agreed || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    신청 처리 중...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    AI 전화 인터뷰 예약 완료하기
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p className="font-semibold text-slate-400 mb-2">SAI PLUS - AI 시니어 캐스팅</p>
          <p>&copy; 2026 SAI PLUS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
