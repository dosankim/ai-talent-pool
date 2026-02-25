import Retell from 'retell-sdk';
const retellClient = new Retell({ apiKey: "key_882ab309dbfe6a1705a18683584a" });

async function checkCallStatus(callId) {
    const call = await retellClient.call.retrieve(callId);
    console.log(`Call ID: ${callId}`);
    console.log(`Status: ${call.call_status}`);
    console.log(`Disconnection Reason: ${call.disconnection_reason}`);
}

checkCallStatus("call_f10b7d833364ddd2a9c1bf4c8fe");
checkCallStatus("call_a199878dc98fb2a37fb3ce8c342");
