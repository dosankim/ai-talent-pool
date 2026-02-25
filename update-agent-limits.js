const { Retell } = require('retell-sdk');
require('dotenv').config({ path: '.env.local' });

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });
const agentId = process.env.RETELL_AGENT_ID;

async function updateAgentLimits() {
    try {
        console.log(`Updating Agent: ${agentId}...`);

        const response = await retellClient.agent.update(agentId, {
            max_call_duration_ms: 300000, // 5 minutes max
            end_call_after_silence_ms: 10000 // Hang up after 10 seconds of silence
        });

        console.log("Agent successfully updated with call limits!");
        console.log(`Max Duration: ${response.max_call_duration_ms} ms`);

    } catch (error) {
        console.error("Error updating agent:", error);
    }
}

updateAgentLimits();
