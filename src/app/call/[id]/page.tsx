"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RetellWebClient } from "retell-client-js-sdk";
import { supabase } from "@/lib/supabase";

type CallStatus = "loading" | "error_invalid_link" | "idle" | "connecting" | "active" | "ended" | "error";

export default function DedicatedCallPage() {
    const params = useParams();
    const userId = params.id as string;
    
    const [name, setName] = useState("");
    const [callStatus, setCallStatus] = useState<CallStatus>("loading");
    const [isTalking, setIsTalking] = useState(false);
    const [agentTalking, setAgentTalking] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [callDuration, setCallDuration] = useState(0);
    const retellClientRef = useRef<RetellWebClient | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch user on mount
    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                setCallStatus("error_invalid_link");
                return;
            }
            try {
                const { data, error } = await supabase
                    .from("users")
                    .select("name, status")
                    .eq("id", userId)
                    .single();

                if (error || !data) {
                    setCallStatus("error_invalid_link");
                    return;
                }

                // // Optional: Check if already completed
                // if (data.status === '웹 상담 완료' || data.status === '통화 완료') {
                //     ...
                // }

                setName(data.name);
                setCallStatus("idle");
            } catch (err) {
                setCallStatus("error_invalid_link");
            }
        };
        fetchUser();
    }, [userId]);

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
        setCallStatus("connecting");
        setErrorMessage("");

        try {
            // Backend에서 access_token 발급 (이름/전화번호 대신 userId 전달)
            const res = await fetch("/api/web-call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "서버 연결 실패");
            }

            const { accessToken } = await res.json();

            // Retell Web Client 초기화 및 통화 시작
            const retellWebClient = new RetellWebClient();
            retellClientRef.current = retellWebClient;

            // 이벤트 리스너 등록
            retellWebClient.on("call_started", () => {
                setCallStatus("active");
            });

            retellWebClient.on("call_ended", () => {
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
                setErrorMessage("상담 중 연결이 끊어졌습니다. 다시 시도해 주세요.");
                setCallStatus("error");
            });

            // 실제 통화 연결
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex flex-col">
            {/* Header */}
            <header className="px-6 py-5 flex items-center justify-center border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
                <Link href="/" className="text-2xl font-extrabold tracking-tighter">
                    SAI<span className="text-purple-400">PLUS</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 pb-20 mt-10">
                <AnimatePresence mode="wait">
                    {/* LOADING */}
                    {callStatus === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400">정보를 확인하는 중입니다...</p>
                        </motion.div>
                    )}

                    {/* ERROR_INVALID_LINK */}
                    {callStatus === "error_invalid_link" && (
                        <motion.div
                            key="error_invalid_link"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                                <span className="text-4xl">❌</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-red-400">유효하지 않은 링크입니다</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                링크가 잘못되었거나 만료되었을 수 있습니다.<br />
                                다시 확인하시거나 홈페이지에서 새롭게 신청해 주세요.
                            </p>
                            <Link
                                href="/"
                                className="inline-block px-8 py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all"
                            >
                                사이플러스 홈으로
                            </Link>
                        </motion.div>
                    )}

                    {/* IDLE — 준비 화면 */}
                    {callStatus === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-lg text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-500/30">
                                <Sparkles className="w-10 h-10 text-purple-400" />
                            </div>
                            <h1 className="text-3xl font-extrabold mb-3 tracking-tight text-white">
                                환영합니다, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-yellow-400">{name} 선생님</span>
                            </h1>
                            <p className="text-slate-400 leading-relaxed mb-10">
                                편안하게 마이크를 켜고 AI 상담사와 대화를 시작해 보세요.<br />
                                선생님의 소중한 경험과 이야기를 들려주시면 됩니다.
                            </p>

                            <button
                                onClick={startCall}
                                className="w-full py-5 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-purple-900/50 flex items-center justify-center gap-3 animate-pulse-slow"
                            >
                                <Phone className="w-6 h-6" />
                                인터뷰 시작하기
                            </button>
                            <p className="text-xs text-slate-500 mt-6 leading-relaxed">
                                상담 시작 시 브라우저의 마이크 권한을 허용해 주세요.
                            </p>
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

                            <h2 className="text-2xl font-bold mb-1">인터뷰 진행 중</h2>
                            <p className="text-slate-400 mb-2">
                                {agentTalking ? "AI 상담사가 말하고 있습니다..." : "편하게 말씀해 주세요..."}
                            </p>
                            <p className="text-purple-400 font-mono text-xl mb-10">
                                {formatDuration(callDuration)}
                            </p>

                            <button
                                onClick={endCall}
                                className="mx-auto flex items-center justify-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 rounded-2xl transition-colors shadow-lg shadow-red-900/50 text-white font-bold"
                            >
                                <PhoneOff className="w-6 h-6" />
                                상담 완료 (종료)
                            </button>
                        </motion.div>
                    )}

                    {/* ENDED — 통화 완료 */}
                    {callStatus === "ended" && (
                        <motion.div
                            key="ended"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
                        >
                            <div className="w-24 h-24 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-extrabold mb-4">
                                통화가 <span className="text-green-400">완료</span>되었습니다
                            </h2>
                            <p className="text-slate-300 mb-4 leading-relaxed">
                                소중한 경험을 나누어 주셔서 감사합니다.<br />
                                분석을 마친 뒤 프로필 완성을 안내해 드리겠습니다.
                            </p>
                            {callDuration > 0 && (
                                <p className="text-sm text-slate-500 mb-8">
                                    총 통화 시간: <span className="text-purple-400 font-mono">{formatDuration(callDuration)}</span>
                                </p>
                            )}
                            <Link
                                href="/"
                                className="inline-block w-full py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all text-center"
                            >
                                창 닫고 홈으로 돌아가기
                            </Link>
                        </motion.div>
                    )}

                    {/* ERROR — 오류 발생 */}
                    {callStatus === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12"
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
                                다시 연결하기
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
