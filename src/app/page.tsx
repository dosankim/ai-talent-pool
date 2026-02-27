"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, CheckCircle2, ShieldAlert, Cpu, UserCheck } from "lucide-react";

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

      alert("신청이 완료되었습니다! 잠시 후 AI 담당자가 입력해주신 번호로 전화를 드릴 예정입니다.");
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
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
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
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-transparent -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-100/40 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl px-6 mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
            <motion.p variants={fadeUp} className="text-purple-600 font-semibold tracking-wide uppercase text-sm md:text-base">
              사회적 재등장 시스템
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[1.1] text-slate-900"
            >
              복지를 넘어선 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-yellow-500">AI 시니어 캐스팅</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-2xl text-slate-500 font-light max-w-3xl mx-auto leading-relaxed">
              "당신의 경력은 끝나지 않았습니다, 역할이 바뀌었을 뿐입니다."<br />
              <span className="font-semibold text-slate-700">AI 기술</span>로 은퇴 및 경단 인력을 지역 문제 해결의 생산자로 전환합니다.
            </motion.p>
            <motion.div variants={fadeUp} className="pt-8">
              <button onClick={scrollToForm} className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-purple-600 font-pj rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 text-lg shadow-xl shadow-purple-200">
                지금 바로 신청하기
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Problem & Solution Section */}
      <section className="py-32 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-20 text-slate-900">
              숙련된 경험의 조기 퇴장, <br className="md:hidden" />
              <span className="text-purple-600">'생산성 단절'</span>의 위기
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Limit Card */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-8">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900">기존 복지 모델의 구조적인 한계</h3>
              <ul className="space-y-6">
                <li>
                  <strong className="block text-lg text-slate-800 mb-1">Pain Point 1: 생산성 단절</strong>
                  <p className="text-slate-500 leading-relaxed text-sm md:text-base">재취업 교육은 단순 노무 위주로, <span className="text-yellow-600 font-medium bg-yellow-50 px-1">개인의 고유한 비정형 경험</span>을 반영하지 못합니다.</p>
                </li>
                <li>
                  <strong className="block text-lg text-slate-800 mb-1">Pain Point 2: 보호 중심의 수동성</strong>
                  <p className="text-slate-500 leading-relaxed text-sm md:text-base">'시혜적인 보호와 수혜' 중심의 예산 소진 후 지원이 종료되는 <span className="text-red-500 font-medium bg-red-50 px-1">단발성 프로그램의 반복</span></p>
                </li>
              </ul>
            </motion.div>

            {/* Paradigm Shift Card */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-slate-900 text-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl shadow-purple-900/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-3xl rounded-full" />
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 relative z-10">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-8 relative z-10">패러다임의 확실한 전환</h3>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                  <div className="flex-1 text-slate-400">단발성 심리 회복</div>
                  <ArrowRight className="w-5 h-5 text-purple-400 shrink-0" />
                  <div className="flex-1 font-semibold text-xl text-yellow-400">역할 설계 및 생산</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-slate-400">예산 집행률 지표</div>
                  <ArrowRight className="w-5 h-5 text-purple-400 shrink-0" />
                  <div className="flex-1 font-semibold text-xl text-purple-300">생산 전환율 및 임팩트</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              SAI PLUS의 3대 가치
            </h2>
            <p className="text-xl text-slate-500">경험을 자산화하여 새로운 역할을 부여합니다.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-8 h-8 text-purple-600" />,
                title: "사회적 재등장",
                desc: "단순 보호를 넘어, 복지 지출을 의미있는 사회적 생산으로 기여하게 만드는 혁신적 구조를 설계합니다."
              },
              {
                icon: <Cpu className="w-8 h-8 text-purple-600" />,
                title: "역할 자산 카드",
                desc: "개인의 경험, 역량, 취향을 AI로 정밀 진단하여 표준화된 자산으로 명확하게 데이터화합니다."
              },
              {
                icon: <UserCheck className="w-8 h-8 text-purple-600" />,
                title: "사이플러 (SAI+er)",
                desc: "단순 참가자가 아닙니다. 경험을 자산화하여 지역 사회의 실질적 가치 생산자로 복귀하는 주역입니다."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white border border-slate-200 p-10 rounded-3xl hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
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
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
              지금 바로 <span className="text-yellow-400">인터뷰 예약</span>하기
            </h2>
            <p className="text-lg text-slate-300">
              복잡한 이력서는 필요 없습니다. 이름과 번호만 남기시면 AI 상담사가 편안한 통화로 경험을 자산화해 드립니다.
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
