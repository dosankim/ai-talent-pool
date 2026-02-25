// list-numbers.mjs
const API_KEY = "key_882ab309dbfe6a1705a18683584a";

async function listNumbers() {
    try {
        const response = await fetch("https://api.retellai.com/list-phone-numbers", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to list numbers: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        console.log("Phone numbers:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(error);
    }
}

listNumbers();
