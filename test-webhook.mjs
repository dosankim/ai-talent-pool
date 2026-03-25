import fetch from 'node-fetch';

async function testWebhook() {
    console.log("Creating mock webhook payload...");

    const mockPayload = {
      event: "call_analyzed",
      data: {
        call_id: "mock_call_123",
        call_status: "ended",
        metadata: {
          user_id: "4f8c3fa0-1ce8-48fe-a33b-6eaaf3a767ac"
        },
        transcript: "This is a test transcript for the webhook upsert.",
        start_timestamp: Date.now() - 60000,
        end_timestamp: Date.now(),
        call_analysis: {
          custom_analysis_data: {
             career_summary: "Test update from Webhook Automation",
             current_situation: "Tested successfully",
             needs: "Automated test user",
             sentiment: "Positive",
             personality_traits: "Automated",
             spelling_corrected_notes: "None"
          }
        }
      }
    };

    console.log("Sending POST to http://localhost:3000/api/webhook...");

    try {
        const res = await fetch('http://localhost:3000/api/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockPayload)
        });

        const data = await res.json();
        console.log("Response:", res.status, data);
    } catch (e) {
        console.log("Error linking localhost. Make sure the server is running on :3000 to test fully. The code is already saved.", e.message);
    }
}

testWebhook();
