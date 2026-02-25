// create-agent.js
// This script creates a Retell AI Agent using their API

const API_KEY = "key_882ab309dbfe6a1705a18683584a";

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
`;

async function createAgent() {
    try {
        // 1. Create a Retell LLM Response Engine
        console.log("Creating Retell LLM Response Engine...");
        const engineResponse = await fetch("https://api.retellai.com/create-retell-llm", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                llm_id: "gpt-4o",
                general_prompt: agentPrompt,
                begin_message: "안녕하세요! 실버 캐스팅입니다. 홈페이지에 신청을 남겨주셔서 전화드렸습니다. 이력서를 만들기 위해 몇 가지 여쭤봐도 괜찮을까요?",
                model_temperature: 0.7,
            }),
        });

        if (!engineResponse.ok) {
            const errorText = await engineResponse.text();
            throw new Error(`Failed to create engine: ${engineResponse.status} ${errorText}`);
        }

        const engineData = await engineResponse.json();
        console.log("Response Engine Created!");
        const llm_id = engineData.llm_id;

        // 2. Create the Agent using the engine
        console.log("Creating Agent...");
        const agentResponse = await fetch("https://api.retellai.com/create-agent", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                response_engine: {
                    "type": "retell-llm",
                    "llm_id": llm_id
                },
                voice_id: "11labs-Adrian", // Default placeholder voice
                voice_temperature: 1,
                voice_speed: 0.9,
                responsiveness: 1,
                enable_backchannel: true,
                agent_name: "실버 캐스팅 상담원",
                language: "ko-KR",
                opt_out_sensitive_data_storage: false,
                post_call_analysis_data: [
                    {
                        name: "career_summary",
                        type: "string",
                        description: "통화 내용을 바탕으로 지원자의 과거 경력, 주요 직무, 근무 기간 등을 상세하게 3-4문장으로 요약합니다."
                    },
                    {
                        name: "current_situation",
                        type: "string",
                        description: "지원자의 현재 상황, 구직을 희망하는 이유, 희망 근무 형태(시간, 요일), 출퇴근 제약사항 등을 요약합니다."
                    },
                    {
                        name: "needs",
                        type: "string",
                        description: "지원자가 새로운 일자리를 구하거나 교육을 받는 데 있어 가장 필요로 하는 것, 걱정하는 부분 등을 유추하여 작성합니다."
                    },
                    {
                        name: "sentiment",
                        type: "enum",
                        choices: ["긍정적이고 적극적", "차분하고 진중함", "약간의 걱정/불안함", "무뚝뚝함"],
                        description: "통화 답변 내용과 뉘앙스를 통해 파악된 지원자의 전반적인 감정 및 성향"
                    },
                    {
                        name: "personality_traits",
                        type: "string",
                        description: "짧은 대화 속에서 유추할 수 있는 지원자의 성격적 장점 (예: 성실함, 새로운 것에 대한 거부감이 적음, 친화력이 좋음 등)을 면접관의 시선에서 상세히 분석하여 작성해주세요."
                    },
                    {
                        name: "spelling_corrected_notes",
                        type: "string",
                        description: "전체 대화 내용 중 가장 중요한 핵심만 3~4개의 명확한 글머리 기호(블릿) 형태로 요약한 노트. (원문/교정 등 불필요한 형식 없이 내용만 요약할 것)"
                    }
                ]
            }),
        });

        if (!agentResponse.ok) {
            const errorText = await agentResponse.text();
            throw new Error(`Failed to create agent: ${agentResponse.status} ${errorText}`);
        }

        const agentData = await agentResponse.json();
        console.log("Agent Created successfully!");
        console.log(`\n================================`);
        console.log(`YOUR AGENT ID IS: ${agentData.agent_id}`);
        console.log(`================================\n`);

    } catch (error) {
        console.error("Error creating agent:", error);
    }
}

createAgent();
