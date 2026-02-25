const { Retell } = require('retell-sdk');
require('dotenv').config({ path: '.env.local' });

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });
const agentId = "agent_d0b27c4659b0feb0f6eaeeaaaf"; // NEW Agent ID

async function updateNumber() {
    try {
        const response = await retellClient.phoneNumber.update(
            '+12565781774', // Your Twilio Number
            { outbound_agent_id: agentId }
        );
        console.log("Successfully bound new Agent to Phone Number!");
        console.log(response);
    } catch (e) {
        console.error("Error updating phone number:", e.message);
    }
}

updateNumber();
