import { Retell } from 'retell-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });
const agentId = process.env.RETELL_AGENT_ID;

const agentPrompt = `
당신의 이름은 '실버 캐스팅 알리미'이며, 중장년층을 돕는 따뜻하고 친절한 상담원입니다.
사용자는 컴퓨터 타자가 익숙하지 않아서 당신과의 통화를 통해 이력서를 데이터화 하려고 합니다.
목표: 어르신의 인생 이야기, 경력, 현재 상황, 그리고 일자리를 구하는데 필요한 것들을 자연스럽게 물어보고 대답을 경청하는 것입니다.

지침:
1. 천천히, 크고, 또박또박, 친절하게 말하세요. 어려운 외래어나 전문 용어는 절대 사용하지 마세요.
2. 한 번에 한 가지 질문만 하세요. 대답을 다 들은 후 충분히 공감("아~ 그러셨군요", "정말 대단하시네요")한 뒤 다음 질문으로 넘어가세요.
3. 첫 인사: "안녕하세요! 실버 캐스팅입니다. 홈페이지에 신청을 남겨주셔서 전화드렸습니다. 이력서를 만들기 위해 몇 가지 여쭤봐도 괜찮을까요?"
4. 물어봐야 할 필수 항목 (자연스럽게 대화 흐름에 맡게 순서대로 질문):
    - 과거에 주로 어떤 일을 하셨나요? (직종, 기간 등)
    - 지금 상황은 어떠신가요? (건강 상태, 이사가 가능한지, 어떤 환경을 찾으시는지)
    - 새로운 일을 시작하신다면, 특별히 원하시거나 저희가 도와드려야 할 부분이 있을까요?
5. 마무리: 모든 정보를 다 들었으면, "소중한 이야기 들려주셔서 감사합니다. 말씀해주신 내용을 멋진 프로필로 만들어 두겠습니다. 좋은 하루 보내세요!"라고 인사를 끝내며 대화를 종료하세요.

[중요 요금 방어 규칙]
- 만약 사용자가 너무 흥분하거나 말이 지연되어서 전체 대화 시간이 4분 30초~5분 내외로 길어지고 있다면, 하던 질문을 멈추고 질문 단계를 건너뛰세요.
- "어르신 정말 좋은 말씀 감사합니다. 시간 관계상 오늘은 여기까지만 여쭤보겠습니다. 말씀해주신 소중한 내용들로 멋진 프로필 만들어 두겠습니다. 감사합니다, 좋은 하루 되세요!" 라고 즉시 부드럽게 마무리 멘트를 한 뒤 대화를 종료해야 합니다.
`;

const postCallAnalysisData = [
    {
        name: "career_summary",
        type: "string",
        description: "사용자의 과거 경력을 매우 상세하게 요약합니다. 어떤 직종에서 몇 년간 일했는지, 관련된 주요 업무는 무엇이었는지 핵심만 번호 매기기나 개조식(bullet points) 또는 자연스러운 문장으로 깔끔하게 정리하세요. 반드시 '한국어(Korean)'로만 작성하세요."
    },
    {
        name: "current_situation",
        type: "string",
        description: "현재 거주지, 이사 가능 여부, 현재 건강 상태 등에 대해 요약합니다. 반드시 '한국어(Korean)'로만 작성하세요."
    },
    {
        name: "needs",
        type: "string",
        description: "사용자가 새로운 일자리를 구할 때 희망하는 조건(시간, 거리, 직무 유형 등)이나 회사가 도와주어야 할 사항을 요약합니다. 반드시 '한국어(Korean)'로만 작성하세요."
    },
    {
        name: "sentiment",
        type: "string",
        description: "대화 중 사용자의 감정 상태나 톤(예: 차분함, 열정적, 불안함 등)을 1~2 단어로 한국어로 요약하세요. (예: '매우 긍정적이고 의욕적임')"
    },
    {
        name: "personality_traits",
        type: "string",
        description: "대화를 통해 유추할 수 있는 사용자의 성격이나 성향을 한국어로 1~2문장으로 깔끔하게 서술하세요."
    },
    {
        name: "spelling_corrected_notes",
        type: "string",
        description: "통화 내용 전체의 핵심 정보만 모아 보기 좋게 글머리 기호(bullet points) 형식으로 요약한 노트입니다. 반드시 '한국어(Korean)'로 가장 깔끔하고 읽기 편하게 정리해주세요."
    }
];

async function updateAnalysis() {
    try {
        console.log(`Fetching Agent: ${agentId}...`);
        const agent = await retellClient.agent.retrieve(agentId);

        console.log("Updating agent post-call analysis schema to enforce Korean and better formatting...");
        
        // Retell V2 Agent Update for post-call analysis
        await retellClient.agent.update(agentId, {
            post_call_analysis_data: postCallAnalysisData
        });

        // Ensure LLM is also aware
        const llmId = agent.response_engine.llm_id;
        console.log(`Found LLM Engine ID: ${llmId}. Updating prompt to enforce Korean output...`);

        await retellClient.llm.update(llmId, {
            general_prompt: agentPrompt
        });

        console.log("Agent analysis schema successfully updated!");

    } catch (error) {
        console.error("Error updating agent:", error);
    }
}

updateAnalysis();
