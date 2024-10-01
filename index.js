import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const modelId = "gemini-1.5-flash";

app.post("/complete-text", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(prompt);

    let completion = result.response.text();
    const maxLength = prompt.length + 50;

    if (completion.length > maxLength) {
      const truncatedIndex = completion.lastIndexOf(" ", maxLength);
      if (truncatedIndex > -1) {
        completion = completion.substring(0, truncatedIndex) + "...";
      } else {
        completion = completion.substring(0, maxLength) + "...";
      }
    }

    res.status(200).json({ completion: completion });
  } catch (error) {
    console.error("Error generating completion:", error);
    res.status(500).json({ error: "Failed to generate text completion" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
