"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <main className="container animate-fade-in">
      <div className="card delay-1">
        <h1>당신의 살아온 이야기가<br />가장 <span className="highlight">빛나는 이력서</span>가 됩니다.</h1>
        <p className="subtitle">
          복잡한 타자 입력은 이제 그만. AI 상담사와의 편안한 통화 한 번이면<br />
          당신의 소중한 경험과 역량이 담긴 멋진 프로필이 완성됩니다.
        </p>

        <form onSubmit={handleSubmit} className="animate-fade-in delay-2">
          <div className="form-group">
            <label htmlFor="name" className="form-label">이름 (성함)</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">연락처 (휴대폰 번호)</label>
            <input
              type="tel"
              id="phone"
              className="form-input"
              placeholder="010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="agree"
              className="custom-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
            />
            <label htmlFor="agree" className="checkbox-label">
              개인정보 수집 및 이용에 동의하며, 입력하신 번호로 AI 상담 전화가 걸려오는 것에
              사전 동의합니다. 수집된 정보는 인재풀 등록 목적으로만 사용됩니다.
            </label>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={!name || !phone || !agreed || isSubmitting}
          >
            {isSubmitting ? "신청 처리 중..." : "AI 전화 인터뷰 예약하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
