const { Retell } = require('retell-sdk');
require('dotenv').config({ path: '.env.local' });

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });
const agentId = 'agent_cca4333d1b63d905ee50c810c7';

async function inspect() {
    try {
        const agent = await retellClient.agent.retrieve(agentId);
        console.log("=== Agent Specs ===");
        console.log("Agent Name:", agent.agent_name);
        console.log("Voice ID:", agent.voice_id);
        console.log("Language:", agent.language);
        
        const llm = await retellClient.llm.retrieve(agent.response_engine.llm_id);
        console.log("\n=== LLM Prompt Preface ===");
        console.log(llm.general_prompt.substring(0, 300) + "...\n(TRUNCATED)");
    } catch (e) {
        console.error("Error:", e);
    }
}
inspect();
