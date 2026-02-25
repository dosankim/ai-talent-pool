const { Retell } = require('retell-sdk');
require('dotenv').config({ path: '.env.local' });

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

async function updateAgentAndLLM() {
    try {
        console.log(`Fetching Agent: ${agentId}...`);
        const agent = await retellClient.agent.retrieve(agentId);

        const llmId = agent.response_engine.llm_id;
        console.log(`Found LLM Engine ID: ${llmId}. Updating prompt...`);

        // 1. Update the LLM Prompt
        await retellClient.llm.update(llmId, {
            general_prompt: agentPrompt
        });
        console.log("LLM Prompt successfully updated with graceful 5-minute wrap-up instructions.");

        // 2. Update the hard limits to 6 minutes
        const response = await retellClient.agent.update(agentId, {
            max_call_duration_ms: 360000, // 6 minutes max fallback
            end_call_after_silence_ms: 15000 // 15s silence timeout
        });

        console.log("Agent successfully updated with 6-minute hard call limit!");
        console.log(`Max Duration: ${response.max_call_duration_ms} ms`);

    } catch (error) {
        console.error("Error updating agent or LLM:", error);
    }
}

updateAgentAndLLM();
