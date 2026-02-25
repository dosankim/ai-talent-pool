# Retell AI & Webhook Integration Guide

## 🚨 Critical Rules for Post-Call Analysis & Webhooks

### 1. Strictly Factual Extraction (Fact-Based Only)
- The LLM Agent MUST be instructed to summarize ONLY factual information directly extracted from the user's call transcript.
- **NEVER** use mock data, placeholder data, or hallucinated backgrounds when testing or manually syncing data. The integrity of the applicant's profile depends entirely on reflecting their actual spoken words.

### 2. Post-Call Analysis Schema Data Format
- Ensure `post_call_analysis_data` is explicitly configured on the Retell Agent to enforce Korean (`한국어(Korean)`) responses for all properties.
- Schema properties (e.g., `career_summary`, `current_situation`, `needs`, `spelling_corrected_notes`) must specify formatting instructions like "반드시 한국어로 작성", "글머리 기호(bullet points)를 사용하여 깔끔하게 정리" to prevent the LLM from defaulting to English or generating messy paragraph formats.

### 3. Webhook Automation (`api/webhook/route.ts`)
- **Event Targeting**: Must listen to the `call_analyzed` event to guarantee that transcript analysis is 100% complete before saving to the DB. `call_ended` is too early for analysis data.
- **Upsert Logic**: Do NOT simply `insert` the profile. You MUST use an `upsert` approach (checking if the profile exists first, then `update`, or `insert` if missing) to prevent completely dropping the data or throwing duplicate key errors if a call is re-analyzed.
- **Status Sync**: The `users` table status must be immediately updated to `통화 중` on `call_started`, and `프로필 완성` (Profile Completed) upon successful webhook upsert.

### 4. Admin Dashboard Reactivity
- Due to the asynchronous nature of AI analysis and webhooks, the admin dashboard (`admin/page.tsx`) must implement a short-interval polling mechanism (e.g., `setInterval` every 5 seconds) to fetch updated user statuses and profiles automatically without requiring explicit manual refreshes from the user.
