import Retell from 'retell-sdk';
const retellClient = new Retell({ apiKey: "key_882ab309dbfe6a1705a18683584a" });

const testNumbers = [
    "+821041635713",
    "+8201041635713",
    "+82 10 4163 5713",
    "01041635713",
    "821041635713"
];

async function runTests() {
    for (const num of testNumbers) {
        console.log(`\nTesting to_number: ${num}`);
        try {
            const call = await retellClient.call.createPhoneCall({
                from_number: "+12565781774",
                to_number: num,
                override_agent_id: "agent_d6d1159c4b2d3e10d55dd66d0d",
            });
            console.log(`Success with ${num}! Call ID: ${call.call_id}`);
            return; // Exit on first success
        } catch (e) {
            console.log(`Failed with ${num} - ${e.message}`);
        }
    }
}

runTests();
