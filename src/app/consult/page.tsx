"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RetellWebClient } from "retell-client-js-sdk";

type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

export default function ConsultPage() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>("idle");
    const [isTalking, setIsTalking] = useState(false);
    const [agentTalking, setAgentTalking] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [callDuration, setCallDuration] = useState(0);
    const retellClientRef = useRef<RetellWebClient | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (retellClientRef.current) {
                retellClientRef.current.stopCall();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Call duration timer
    useEffect(() => {
        if (callStatus === "active") {
            setCallDuration(0);
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [callStatus]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const startCall = async () => {
        if (!name.trim() || !phone.trim() || !agreed) return;

        setCallStatus("connecting");
        setErrorMessage("");

        try {
            // 1. 유저 등록 및 DB 저장 (SMS 알림 발송 포함)
            const registerRes = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), phone: phone.trim(), agreed }),
            });

            if (!registerRes.ok) {
                const errorData = await registerRes.json();
                throw new Error(errorData.error || "사용자 등록 실패");
            }

            const { userId } = await registerRes.json();

            // 2. 발급받은 userId로 Retell Web Call 연결
            const res = await fetch("/api/web-call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "웹 통화 서버 연결 실패");
            }

            const { accessToken } = await res.json();

            // 2. Retell Web Client 초기화 및 통화 시작
            const retellWebClient = new RetellWebClient();
            retellClientRef.current = retellWebClient;

            // 이벤트 리스너 등록
            retellWebClient.on("call_started", () => {
                console.log("[Web Call] Call started");
                setCallStatus("active");
            });

            retellWebClient.on("call_ended", () => {
                console.log("[Web Call] Call ended");
                setCallStatus("ended");
            });

            retellWebClient.on("agent_start_talking", () => {
                setAgentTalking(true);
            });

            retellWebClient.on("agent_stop_talking", () => {
                setAgentTalking(false);
            });

            retellWebClient.on("error", (error) => {
                console.error("[Web Call] Error:", error);
                setErrorMessage("통화 중 오류가 발생했습니다. 다시 시도해 주세요.");
                setCallStatus("error");
            });

            // 3. 실제 통화 연결
            await retellWebClient.startCall({
                accessToken,
                sampleRate: 24000,
                emitRawAudioSamples: false,
            });

        } catch (error: any) {
            console.error("Start call error:", error);
            setErrorMessage(error.message || "상담 시작 중 오류가 발생했습니다.");
            setCallStatus("error");
        }
    };

    const endCall = () => {
        if (retellClientRef.current) {
            retellClientRef.current.stopCall();
        }
        setCallStatus("ended");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex flex-col break-keep">
            {/* Header */}
            <header className="px-6 py-5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">홈으로</span>
                </Link>
                <span className="text-2xl font-extrabold tracking-tighter">
                    SAI<span className="text-purple-400">PLUS</span>
                </span>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 pb-20 mt-10">
                <AnimatePresence mode="wait">
                    {/* IDLE — 정보 수집 화면 */}
                    {callStatus === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-lg text-left bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
                        >
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-500/30">
                                    <Sparkles className="w-10 h-10 text-purple-400" />
                                </div>
                                <h1 className="text-3xl font-extrabold mb-3 tracking-tight text-white">
                                    AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-yellow-400">온라인 상담</span>
                                </h1>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    간단한 정보를 입력하시고 AI 상담사와 바로 대화해 보세요.<br />
                                    마이크를 통해 편안하게 이야기해 주시면 됩니다.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-200 mb-2">이름 (성함)</label>
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="홍길동"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-200 mb-2">연락처 (휴대폰 번호)</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        placeholder="010-1234-5678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex items-start gap-4 pt-4">
                                    <div className="flex items-center h-6">
                                        <input
                                            type="checkbox"
                                            id="agree"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="agree" className="text-sm text-slate-300 leading-relaxed cursor-pointer select-none">
                                        개인정보 수집 및 이용에 동의하며, 수집된 정보는 향후 프로젝트 매칭 및 <b>경험자산카드 프로필 생성 목적</b>으로만 사용됩니다.
                                    </label>
                                </div>

                                <button
                                    onClick={startCall}
                                    disabled={!name.trim() || !phone.trim() || !agreed}
                                    className="w-full py-4 mt-2 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-purple-900/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    <Phone className="w-5 h-5" />
                                    AI 상담 시작하기
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* CONNECTING — 연결 중 */}
                    {callStatus === "connecting" && (
                        <motion.div
                            key="connecting"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <div className="w-32 h-32 mx-auto mb-8 relative">
                                <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
                                <div className="absolute inset-2 rounded-full bg-purple-500/20 animate-ping" style={{ animationDelay: "0.3s" }} />
                                <div className="relative w-32 h-32 rounded-full bg-purple-600/30 backdrop-blur-sm flex items-center justify-center border border-purple-500/30">
                                    <Phone className="w-10 h-10 text-purple-300 animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">연결 중...</h2>
                            <p className="text-slate-400">AI 상담사에게 연결하고 있습니다</p>
                        </motion.div>
                    )}

                    {/* ACTIVE — 통화 중 */}
                    {callStatus === "active" && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center w-full max-w-sm"
                        >
                            {/* Voice Visualizer */}
                            <div className="w-40 h-40 mx-auto mb-8 relative">
                                {/* Outer pulse rings */}
                                {agentTalking && (
                                    <>
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-purple-400/40"
                                            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-purple-400/30"
                                            animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                        />
                                    </>
                                )}
                                {/* Core circle */}
                                <motion.div
                                    className="relative w-40 h-40 rounded-full flex items-center justify-center border-2"
                                    animate={{
                                        backgroundColor: agentTalking ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.15)",
                                        borderColor: agentTalking ? "rgba(168, 85, 247, 0.6)" : "rgba(168, 85, 247, 0.3)",
                                        scale: agentTalking ? [1, 1.05, 1] : 1,
                                    }}
                                    transition={{ duration: 0.6, repeat: agentTalking ? Infinity : 0 }}
                                >
                                    <Mic className="w-12 h-12 text-purple-300" />
                                </motion.div>
                            </div>

                            <h2 className="text-2xl font-bold mb-1">상담 진행 중</h2>
                            <p className="text-slate-400 mb-2">
                                {agentTalking ? "AI 상담사가 말하고 있습니다..." : "말씀해 주세요..."}
                            </p>
                            <p className="text-purple-400 font-mono text-lg mb-10">
                                {formatDuration(callDuration)}
                            </p>

                            <button
                                onClick={endCall}
                                className="mx-auto w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-red-900/50"
                            >
                                <PhoneOff className="w-7 h-7 text-white" />
                            </button>
                            <p className="text-xs text-slate-500 mt-3">상담 종료</p>
                        </motion.div>
                    )}

                    {/* ENDED — 통화 완료 */}
                    {callStatus === "ended" && (
                        <motion.div
                            key="ended"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center w-full max-w-md"
                        >
                            <div className="w-24 h-24 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-extrabold mb-4">
                                상담이 <span className="text-green-400">완료</span>되었습니다
                            </h2>
                            <p className="text-slate-400 mb-4 leading-relaxed">
                                소중한 이야기를 들려주셔서 감사합니다.<br />
                                말씀해주신 내용을 바탕으로 프로필을 만들어 드리겠습니다.
                            </p>
                            {callDuration > 0 && (
                                <p className="text-sm text-slate-500 mb-8">
                                    총 상담 시간: <span className="text-purple-400 font-mono">{formatDuration(callDuration)}</span>
                                </p>
                            )}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setCallStatus("idle");
                                        setName("");
                                        setCallDuration(0);
                                    }}
                                    className="w-full py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all"
                                >
                                    새로운 상담 시작
                                </button>
                                <Link
                                    href="/"
                                    className="w-full py-4 bg-purple-600/20 border border-purple-500/30 rounded-2xl text-purple-300 font-semibold hover:bg-purple-600/30 transition-all text-center"
                                >
                                    홈으로 돌아가기
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* ERROR — 오류 발생 */}
                    {callStatus === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center w-full max-w-md"
                        >
                            <div className="w-24 h-24 mx-auto mb-8 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                                <MicOff className="w-12 h-12 text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-red-400">연결 오류</h2>
                            <p className="text-slate-400 mb-8">{errorMessage}</p>
                            <button
                                onClick={() => {
                                    setCallStatus("idle");
                                    setErrorMessage("");
                                }}
                                className="w-full py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all"
                            >
                                다시 시도하기
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="px-6 py-6 text-center">
                <p className="text-xs text-slate-600">© 2026 SAI PLUS. AI 시니어 캐스팅</p>
            </footer>
        </div>
    );
}
