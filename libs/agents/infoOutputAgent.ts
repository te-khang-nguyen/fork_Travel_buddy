import OpenAI from "openai";

// Language detection: simple heuristic for Vietnamese
function detectLanguage(text: string): "vi" | "en" {
  const vietnameseRegex = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
  return vietnameseRegex.test(text) ? "vi" : "en";
}

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function infoOutputAgent({
  query,
  dbResults,
  webResults,
  conversationHistory = [],
}: {
  query: string,
  dbResults: any[],
  webResults: any[],
  conversationHistory?: { user: string, bot: string }[],
}) {
  const language = detectLanguage(query);

  // Tone adjustment
  const tone = language === "vi"
    ? "Thân thiện, gần gũi, như một người bạn đồng hành." // Friendly, buddy-like in Vietnamese
    : "Friendly, approachable, like a knowledgeable travel buddy."; // Friendly, buddy-like in English

  // High-score = similarity > 0.8
  const highScoreDbResults = dbResults.filter(r => r.similarity > 0.8);

  // Mid-score = similarity > 0.75
  const midScoreDbResults = dbResults.filter(r => r.similarity > 0.75);

  // Build system prompt
  let systemPrompt =
    language === "vi"
      ? `Bạn là một người bạn đồng hành du lịch thân thiện, hiểu biết, luôn khuyến khích sự tò mò và khám phá. Hãy trả lời một cách gần gũi, dễ hiểu, và luôn sẵn sàng trả lời các câu hỏi tiếp theo của người dùng.`
      : `You are a friendly, knowledgeable travel buddy who encourages curiosity and exploration. Answer in a conversational, approachable way, and always be open to follow-up questions.`;

  // Add conversation history (memory/context)
  let historyPrompt = "";
  if (conversationHistory && conversationHistory.length > 0) {
    historyPrompt += language === "vi"
      ? "Lịch sử trò chuyện trước đó:\n"
      : "Previous conversation history:\n";
    historyPrompt += conversationHistory
      .map(
        (turn) =>
          (language === "vi"
            ? `Người dùng: ${turn.user}\nBạn: ${turn.bot}\n`
            : `User: ${turn.user}\nYou: ${turn.bot}\n`)
      )
      .join("");
    historyPrompt += "\n";
  }

  let prompt = `${systemPrompt}\n${historyPrompt}`;
  prompt += language === "vi"
    ? `Câu hỏi hiện tại: ${query}\n\n`
    : `Current question: ${query}\n\n`;

    if (highScoreDbResults.length > 0) {
        // Case 1: Use only high-score DB results
        prompt += language === "vi"
          ? `Kết quả từ cơ sở dữ liệu (rất liên quan):\n${highScoreDbResults.map(r => r.text).join("\n---\n")}\n\n`
          : `Highly relevant database results:\n${highScoreDbResults.map(r => r.text).join("\n---\n")}\n\n`;
        prompt += language === "vi"
          ? `Hãy trả lời câu hỏi chỉ dựa trên các thông tin trên từ cơ sở dữ liệu. Phong cách trả lời: ${tone}.`
          : `Please answer the user's question using only the database information above. Answer in a ${tone} style.`;
      } else if (midScoreDbResults.length > 0) {
        // Case 2: Use mid-score DB results + web results
        prompt += language === "vi"
          ? `Không có kết quả thực sự liên quan từ cơ sở dữ liệu, nhưng có một số kết quả tương đối liên quan và kết quả từ tìm kiếm web:\n\n`
          : `No highly relevant database results found, but there are some moderately relevant database results and web search results:\n\n`;
        prompt += language === "vi"
          ? `Kết quả từ cơ sở dữ liệu:\n${midScoreDbResults.map(r => r.text).join("\n---\n")}\n\n`
          : `Database results:\n${midScoreDbResults.map(r => r.text).join("\n---\n")}\n\n`;
        prompt += language === "vi"
          ? `Kết quả từ tìm kiếm web:\n${webResults.map(r => r.snippet || r.content).join("\n---\n")}\n\n`
          : `Web search results:\n${webResults.map(r => r.snippet || r.content).join("\n---\n")}\n\n`;
        prompt += language === "vi"
          ? `Hãy tổng hợp thông tin từ cả hai nguồn trên. Nếu bạn sử dụng thông tin từ kết quả tìm kiếm web, hãy nói rõ với người dùng rằng bạn đã sử dụng nguồn từ web, không chỉ từ cơ sở dữ liệu nội bộ. Phong cách trả lời: ${tone}.`
          : `Please synthesize information from both the moderately relevant database results and the web search results above. If you use any information from web search, you must clearly indicate to the user that it comes from web search, not just our internal database. Answer in a ${tone} style.`;
      } else {
        // Case 3: Use only web results
        prompt += language === "vi"
          ? `Không có kết quả phù hợp từ cơ sở dữ liệu. Dưới đây là các kết quả từ tìm kiếm web:\n\n`
          : `No relevant database results found. Here are the web search results:\n\n`;
        prompt += language === "vi"
          ? `Kết quả từ tìm kiếm web:\n${webResults.map(r => r.snippet || r.content).join("\n---\n")}\n\n`
          : `Web search results:\n${webResults.map(r => r.snippet || r.content).join("\n---\n")}\n\n`;
        prompt += language === "vi"
          ? `Hãy trả lời câu hỏi dựa trên các kết quả tìm kiếm web ở trên. Bạn phải nói rõ với người dùng rằng câu trả lời của bạn dựa trên thông tin từ web, không phải từ cơ sở dữ liệu nội bộ. Phong cách trả lời: ${tone}.`
          : `Please answer the user's question based only on the web search results above. You must clearly indicate to the user that your answer is based on web search information, not from our internal database. Answer in a ${tone} style.`;
      }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return completion.choices[0].message.content;
}