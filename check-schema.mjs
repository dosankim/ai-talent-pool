import Retell from 'retell-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });
const agentId = process.env.RETELL_AGENT_ID;

async function checkSchema() {
    const agent = await retellClient.agent.retrieve(agentId);
    console.log("Agent's post_call_analysis_data:");
    console.log(JSON.stringify(agent.post_call_analysis_data, null, 2));

    const llmId = agent.response_engine.llm_id;
    const llm = await retellClient.llm.retrieve(llmId);
    console.log("LLM states:");
    console.log(JSON.stringify(llm.states, null, 2));
}

checkSchema();
