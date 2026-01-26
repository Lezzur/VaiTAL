const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Logic to read .env.local manually since we can't depend on Next.js loading it here
const envPath = path.resolve(__dirname, '../.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env.local");
}

if (!apiKey) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error.message);
            return;
        }

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(model => {
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${model.name}`);
                }
            });
        } else {
            console.log("No models returned.");
        }
    } catch (error) {
        console.error("Fetch error:", error.message);
    }
}

listModels();
