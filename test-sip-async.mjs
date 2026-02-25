import Retell from 'retell-sdk';
const retellClient = new Retell({ apiKey: "key_882ab309dbfe6a1705a18683584a" });

const testNumbers = [
    "+821041635713",
    "+82 10 4163 5713",
    "821041635713",
    "01041635713",
    "82 10 4163 5713"
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
    for (const num of testNumbers) {
        console.log(`\nTesting to_number: "${num}"`);
        try {
            const call = await retellClient.call.createPhoneCall({
                from_number: "+12565781774",
                to_number: num,
                override_agent_id: "agent_d6d1159c4b2d3e10d55dd66d0d",
            });

            console.log(`Initiated. Call ID: ${call.call_id}. Waiting 4 seconds for SIP routing...`);
            await wait(4000);

            const status = await retellClient.call.retrieve(call.call_id);
            if (status.disconnection_reason === "invalid_destination") {
                console.log(`❌ Failed at Twilio SIP: invalid_destination`);
            } else if (status.call_status === "registered" || status.call_status === "ongoing" || status.call_status === "ringing") {
                console.log(`✅ SUCCESS! Phone is ringing! Call Status: ${status.call_status}`);
            } else {
                console.log(`❓ Status: ${status.call_status}, Reason: ${status.disconnection_reason}`);
            }
        } catch (e) {
            console.log(`API Error (Synchronous): ${e.message}`);
        }
    }
}

runTests();
