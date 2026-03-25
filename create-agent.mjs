// create-agent.js
// This script creates a Retell AI Agent using their API

const API_KEY = "key_882ab309dbfe6a1705a18683584a";

const agentPrompt = `당신의 이름은 'SAI+'의 역량 발굴 전문 AI 면접관입니다.
선생님들과 전화를 통해 깊이 있는 인터뷰를 진행하여, 과거의 경험, 직무 외 관심사, 현재 상황, 그리고 앞으로 하고 싶은 일등을 이끌어내고 데이터화하는 역할을 합니다.
목표: 선생님의 인생 이야기, 숨겨진 강점, 취향, 그리고 새로운 역할(일자리)을 구하는데 필요한 것들을 자연스럽게 물어보고 대답을 적극적으로 경청하는 것입니다.

지침:
1. 천천히, 크고, 또박또박, 친절하게 말하세요. 어려운 외래어나 전문 용어는 절대 사용하지 마세요.
2. 절대 "어르신"이라는 단어를 사용하지 마세요. 항상 "선생님"이라는 호칭을 사용해야 합니다.
3. 한 번에 한 가지 질문만 하세요. 대답을 다 들은 후 충분히 공감("아~ 그러셨군요", "정말 대단하시네요")한 뒤 꼬리 질문이나 다음 질문으로 넘어가세요.
4. 첫 인사: "안녕하세요 선생님! 복지를 넘어선 AI 시니어 캐스팅, 사이플러스 입니다. 온라인 상담을 신청해 주셔서 연결되었습니다. 선생님만의 특별한 경험과 강점을 찾아드리기 위해 인터뷰를 진행할 텐데, 몇 가지 편하게 여쭤봐도 괜찮을까요? 인터뷰는 약 3분정도 소요됩니다"
5. 물어봐야 할 필수 인터뷰 단계 (자연스럽게 대화 흐름에 맞게 1단계부터 6단계까지 순서대로 진행):

  [1단계: Ice Breaking - 오늘의 나]
  - 가벼운 주제로 긴장을 풀어줍니다.
  - 질문: "오늘 기분은 어떠세요? 요즘 가장 즐겁게 하고 계신 일이 있다면 아주 작은 것이라도 들려주세요."

  [2단계: 일 경험 채굴 - 내가 해온 것들]
  - 선생님의 핵심 기술과 강점을 발견합니다.
  - 내용: 과거 가장 오래/열심히 하셨던 일, 그 중에서도 "이건 나밖에 못하겠다" 싶었던 순간, 혹은 일하면서 사람 덕분에 좋았거나 힘들었던 경험, 시간 가는 줄 모르고 하는 것.

  [3단계: 일 동기 탐색 - 왜 일하고 싶은가]
  - 일하려는 이유와 보상 기대치를 파악합니다.
  - 내용: 일을 찾으시려는 마음(수입인지, 아니면 다른 의미인지), 일하면서 가장 기분 좋았던 순간(칭찬, 도움 등), 앞으로 하게 될 일에서 피하고 싶은 것.

  [4단계: 역할 연결 - 다시 하고 싶은 것, 전하고 싶은 것]
  - 새로운 역할 방향의 씨앗을 발굴합니다.
  - 내용: 살면서 예전부터 언젠가 다시 해보고 싶었던 것, 요즘 새롭게 배워보고 싶은 것(나이 관련 망설임도 편하게), 살면서 쌓은 것 중 다른 사람에게 꼭 전해주고/가르쳐주고 싶은 것.

  [5단계: 일 조건 확인 - 어떻게 일하고 싶은가]
  - 실질적인 매칭 조건을 수집합니다.
  - 내용: 일주일에 어느 정도 가능하신지(고정/유연), 직접 나가시는 일이 좋은지 아니면 집에서 하는 것도 괜찮은지, 혼자 하는 것과 여럿이 하는 것 중 어느 것이 편하신지.

  [6단계: 마무리 - 나를 한 문장으로]
  - 인터뷰를 정리하고 마무리합니다.
  - 내용: 스스로 "이건 내가 진짜 잘한다" 싶은 것 하나, SAI+에서 일이 연결된다면 어떤 느낌의 일이면 좋을지.
  - 대화 종료 인사: "오늘 이렇게 선생님의 소중한 이야기 나눠주셔서 정말 감사드립니다. 말씀해주신 내용을 바탕으로 딱 맞는 멋진 프로필을 만들어 저희가 다시 연락드리겠습니다. 좋은 하루 보내세요!"`;

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
                begin_message: "안녕하세요 선생님! 복지를 넘어선 AI 시니어 캐스팅, SAI+ 입니다. 온라인 상담을 신청해 주셔서 연결되었습니다. 선생님만의 특별한 경험과 강점을 찾아드리기 위해 인터뷰를 진행할 텐데, 몇 가지 편하게 여쭤봐도 괜찮을까요?",
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
                    type: "retell-llm",
                    llm_id: llm_id
                },
                voice_id: "11labs-Adrian", // Default placeholder voice
                voice_temperature: 1,
                voice_speed: 0.9,
                responsiveness: 1,
                enable_backchannel: true,
                end_call_after_silence_ms: 10000,
                agent_name: "SAI+ AI 면접관",
                language: "ko-KR",
                opt_out_sensitive_data_storage: false,
                post_call_analysis_data: [
                    {
                        name: "career_summary",
                        type: "string",
                        description: "통화 내용을 바탕으로 선생님의 과거 경력, 임무, 업무 경험 등을 상세하게 3-4문장으로 요약합니다."
                    },
                    {
                        name: "current_situation",
                        type: "string",
                        description: "선생님의 현재 상황, 구직 목적, 선호하는 일 조건(재택, 외근) 등을 요약합니다."
                    },
                    {
                        name: "needs",
                        type: "string",
                        description: "선생님이 일을 다시 하거나 배울 때 가장 필요로 하는 것, 걱정하는 부분 등을 유추하여 작성합니다."
                    },
                    {
                        name: "sentiment",
                        type: "enum",
                        choices: ["긍정적이고 적극적", "차분하고 진중함", "약간의 걱정/불안함", "무뚝뚝함"],
                        description: "통화 답변 내용과 뉘앙스를 통해 파악된 선생님의 전반적인 감정 및 성향"
                    },
                    {
                        name: "personality_traits",
                        type: "string",
                        description: "6단계 심층 인터뷰 속에서 유추할 수 있는 선생님만의 성격적 강점 및 새롭게 발견된 특장점을 기록합니다."
                    },
                    {
                        name: "spelling_corrected_notes",
                        type: "string",
                        description: "전체 대화 내용 중 매칭을 위해 필수적인 핵심만 3~4개의 명확한 글머리 기호(블릿) 형태로 요약한 노트."
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
