"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserProfile = {
    id: string;
    name: string;
    phone: string;
    status: string;
    created_at: string;
    call_initiated_at: string | null;
    call_duration_seconds: number | null;
    disconnection_reason: string | null;
    profiles: {
        career_summary: string;
        current_situation: string;
        needs: string;
        sentiment: string;
        personality_traits: string;
        spelling_corrected_notes: string;
        full_transcript: string;
    }[];
};

export default function AdminDashboard() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        fetchUsers();
        const intervalId = setInterval(fetchUsers, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchUsers = async () => {
        try {
            // Fetch users and their joined profiles
            const { data, error } = await supabase
                .from("users")
                .select(`
          id, name, phone, status, created_at, call_initiated_at, call_duration_seconds, disconnection_reason,
          profiles ( career_summary, current_situation, needs, sentiment, personality_traits, spelling_corrected_notes, full_transcript )
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data as any);

            setSelectedUser((prev) => {
                if (!prev) return null;
                const updated = (data as any).find((u: UserProfile) => u.id === prev.id);
                return updated || prev;
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <h1 className="admin-title">인재풀 대시보드 불러오는 중...</h1>
            </div>
        );
    }

    return (
        <div className="admin-container animate-fade-in">
            <header className="admin-header delay-1">
                <h1 className="admin-title">AI 시니어 캐스팅 <span className="highlight">인재풀 대시보드</span></h1>
                <p className="subtitle">AI 통화를 통해 수집된 시니어 인재들의 프로필을 확인하세요.</p>
            </header>

            <div className="admin-content delay-2">
                {/* User List Sidebar */}
                <aside className="user-list-sidebar">
                    <h2 className="section-title">최근 등록된 지원자 (총 {users.length}명)</h2>
                    <div className="user-list">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className={`user-card ${selectedUser?.id === user.id ? 'active' : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div className="user-info-brief">
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-phone">{user.phone}</span>
                                </div>
                                <div className="status-badge-container">
                                    <span className={`status-badge ${user.status === '프로필 완성' ? 'status-complete' :
                                        user.status === '통화 대기' ? 'status-waiting' : 'status-failed'
                                        }`}>
                                        {user.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <p className="empty-message">등록된 지원자가 없습니다.</p>
                        )}
                    </div>
                </aside>

                {/* Profile Detail View */}
                <main className="profile-detail">
                    {selectedUser ? (
                        <div className="profile-card animate-fade-in">
                            <div className="profile-header">
                                <h2>{selectedUser.name} 님의 프로필</h2>
                                <div className="profile-metadata" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                                    <span className="profile-date">
                                        🗓️ <strong>신청 시간:</strong> {new Date(selectedUser.created_at).toLocaleString('ko-KR', {
                                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                    {selectedUser.call_initiated_at && (
                                        <span className="profile-date">
                                            📞 <strong>통화 발신 시간:</strong> {new Date(selectedUser.call_initiated_at).toLocaleString('ko-KR', {
                                                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    )}
                                    {selectedUser.call_duration_seconds !== null && (
                                        <span className="profile-date" style={{ color: '#059669' }}>
                                            ⏱️ <strong>실제 통화 유지 시간:</strong> {Math.floor(selectedUser.call_duration_seconds / 60)}분 {selectedUser.call_duration_seconds % 60}초
                                        </span>
                                    )}
                                    {selectedUser.status === '통화 실패' && selectedUser.disconnection_reason && (
                                        <span className="profile-date" style={{ color: '#dc2626' }}>
                                            ⚠️ <strong>발신 실패 사유:</strong> {selectedUser.disconnection_reason === 'user_hangup' ? '상대방이 전화를 끊음 (수신거부/종료)' :
                                                selectedUser.disconnection_reason === 'dial_failed' ? '전화 연결 실패 (없는 번호 또는 부재중)' :
                                                    selectedUser.disconnection_reason === 'machine_detected' ? '음성사서함으로 연결됨' :
                                                        selectedUser.disconnection_reason === 'agent_hangup' ? 'AI 상담원이 전화를 끊음' :
                                                            selectedUser.disconnection_reason === 'error' ? '시스템 오류' :
                                                                selectedUser.disconnection_reason}
                                        </span>
                                    )}
                                </div>
                                {(selectedUser.status === '통화 대기' || selectedUser.status === '통화 실패' || selectedUser.status === '전화 발신됨' || selectedUser.status === '프로필 완성' || selectedUser.status === '통화 완료') && (
                                    <button
                                        className="trigger-call-btn"
                                        style={{ marginLeft: 'auto', padding: '8px 16px', backgroundColor: (selectedUser.status === '프로필 완성' || selectedUser.status === '통화 완료') ? '#10b981' : '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        onClick={async () => {
                                            try {
                                                const res = await fetch('/api/call', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        userId: selectedUser.id,
                                                        phone: selectedUser.phone,
                                                        name: selectedUser.name
                                                    })
                                                });
                                                if (res.ok) {
                                                    alert("전화 발신이 시작되었습니다. 잠시 후 사용자의 핸드폰으로 전화가 걸려옵니다.");
                                                    fetchUsers(); // Refresh list to update status
                                                } else {
                                                    const errorData = await res.json();
                                                    alert("전화 발신 실패: " + (errorData.error || '알 수 없는 오류'));
                                                }
                                            } catch (e) {
                                                alert("서버 연결에 실패했습니다.");
                                            }
                                        }}
                                    >
                                        {(selectedUser.status === '프로필 완성' || selectedUser.status === '통화 완료') ? '다시 전화 걸기 (AI)' : '전화 걸기 (AI)'}
                                    </button>
                                )}
                            </div>

                            {selectedUser.profiles && selectedUser.profiles.length > 0 ? (
                                <div className="profile-body">
                                    <div className="data-section highlight-section" style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
                                        <h3 style={{ color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>🧠</span> AI 성향 분석 노트
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                            <div>
                                                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>대화 감정 톤: </span>
                                                <span style={{ backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '12px', fontSize: '0.9em' }}>
                                                    {selectedUser.profiles[0].sentiment || '분석 중'}
                                                </span>
                                            </div>
                                            <div>
                                                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>지원자 성향 유추: </span>
                                                <span>{selectedUser.profiles[0].personality_traits || '분석 중'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="data-section">
                                        <h3>과거 경력 요약</h3>
                                        <p className="data-content">{selectedUser.profiles[0].career_summary}</p>
                                    </div>
                                    <div className="data-section">
                                        <h3>현재 상황 및 희망 조건</h3>
                                        <p className="data-content">{selectedUser.profiles[0].current_situation}</p>
                                    </div>
                                    <div className="data-section">
                                        <h3>필요 사항 및 요구 사항</h3>
                                        <p className="data-content">{selectedUser.profiles[0].needs}</p>
                                    </div>
                                    <div className="data-section" style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #fbbf24' }}>
                                        <h3 style={{ color: '#b45309', marginTop: 0 }}>대화 핵심 요약 노트</h3>
                                        <p className="data-content" style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                                            {selectedUser.profiles[0].spelling_corrected_notes || '요약 노트 없음'}
                                        </p>
                                    </div>
                                    <div className="data-section">
                                        <h3>전체 통화 스크립트 (STT 원문)</h3>
                                        <div className="transcript-box">
                                            {selectedUser.profiles[0].full_transcript.split('\n').map((line, i) => (
                                                <p key={i} style={{ color: '#6b7280' }}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-profile">
                                    <p>아직 AI 전화 통화가 완료되지 않아 프로필 정보가 없습니다.</p>
                                    <p>상태: <strong className="highlight">{selectedUser.status}</strong></p>
                                </div>
                            )}
                        </div>

                    ) : (
                        <div className="empty-selection">
                            <p>좌측 목록에서 지원자를 선택하면<br />상세 프로필을 확인할 수 있습니다.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// Force rebuild: 1771996562546