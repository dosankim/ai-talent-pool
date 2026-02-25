-- Supabase SQL 초기화 스크립트
-- 이 코드를 복사해서 Supabase Dashboard의 SQL Editor에서 실행해주세요.

-- 1. 사용자(지원자) 기본 정보 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  agreed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT '통화 대기'
  -- status 예시: '통화 대기', '통화 완료', '프로필 완성', '실패'
);

-- 2. AI 면접 후 추출된 데이터(프로필) 테이블
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_transcript TEXT,           -- 전체 대화 스크립트 내용
  career_summary TEXT,            -- 과거 경력 요약 정보
  current_situation TEXT,         -- 현재 상황 (희망 근로시간, 지역 등)
  needs TEXT,                     -- 무엇이 필요한지 (교육, 자금, 일자리 매칭 등)
  sentiment TEXT,                 -- 전반적 감정 및 반응 성향
  personality_traits TEXT,        -- 성격적 특장점 유추
  spelling_corrected_notes TEXT,  -- 오탈자 보정 버전의 핵심 요약 노트
  is_verified BOOLEAN DEFAULT false -- 관리자 검수 여부
);

-- 보안: 기본적으로 테이블 접근 권한 설정 (선택사항)
-- 웹 클라이언트에서 바로 입력할 수 있도록 하려면 Service Role Key나 적절한 Policy가 필요합니다.
-- 개발 초기 단계이므로 익명 접근을 허용하거나 서버에서 Service 키를 사용하도록 권장합니다.
