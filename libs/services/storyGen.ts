import OpenAI from "openai";

const client = new OpenAI({ 
  apiKey: process.env.NEXT_PUBLIC_OPENAI_TOKEN,
  dangerouslyAllowBrowser: true 
});

async function generateLocationStories(
    experience: string,
    locations: string,
    notes: string,
    media: string[],
    brandVoice: string,
    channelType: string,
    storyLength: number = 45
  ): Promise<any> {
    let chatInitialCompletion: string | null
    let chatSeoCompletion: string | null;

    const channels = {
      travel_buddy: `Travel Buddy - A travel platform providing photo tours of experiences 
                    and showcases beautiful travel stories of their users.`,
      instagram: "Instagram"
    }

    const systemPrompt = `
    Create a cohesive story based on the following tour details:

    Writing Style: 
    - Strictly follow and write the story in the style specified in the [Brand Voice]
    
    Input Format:
    [Destination] is the name of the experience for which the story is written.
    [Locations] is provided as a list of location titles associated with [Destination], each title separated by newline character.
    [Tour Notes] is provided as a long body of texts that can be formatted in one of the following ways:
    - Paragraphs seperated by newlines. Each paragraph is a location with its notes.
    - A single paragraph with unknown seperator between locations. 
    - Each location could be mentioned by its title within the text body of the [Tour Notes]. 
    - The titles can be cross check with the [Locations].
    
    Important Guidelines:
    1. Generate a cohesive creative story with each paragraph telling the story for each location based on the [Tour Notes], [Destination], and [Locations] provided with the format following the "Tour Notes Format" above.
    2. Detect the locations within the [Tour Notes] using [Locations] and highlight detected locations.
    3. If there were any hiccups at an location, that’s okay! Share them, but always spin it into a positive or uplifting takeaway.
    4. Prioritize detected locations from [Tour Notes]. Use [Locations] as reference for correct order of paragraph. 
    5. If no location detected, you will prioritize the [Locations] over the [Tour Notes].
    5. Stick to the facts [Tour Notes] while keeping each story creative and exciting. Don’t go off-track!
    6. Word limit is ${storyLength} per location. Keep it short, snappy, and on point.

    THINGS MUST NOT BE VIOLATED:
    1. DO NOT WRITE THE STORY IRRELEVANT OF THE [Tour Notes].
    2. DO NOT USE MARKDOWN FORMAT ANYWHERE IN THE RESPONSE. ALWAYS GENERATE AS PLAINTEXT.
    3. ALWAYS WRITE A GOOD STORY BASED ON [Destination] EVEN IF THERE ARE INSUFFICIENT INFORMATION IN THE INPUT FORMAT.
    
    Output Format:
    The output must be a paragraph with the following format:
      - Output can be a paragraph or a collection of paragraphs.
      - Each paragraph has a ${storyLength}-words story corresponding to an location.
      - Paragraphs must be separated with a blank line.
      - This output should have the same number of paragraph as the number of the locations. 
      - Note that it can have ONE paragraph if the [Tour Notes] only has one location.
    `.trim();

    const messages = [
      {
          role: "system",
          content: systemPrompt
      },
      { 
          role: 'user',
          content: `content to follow:
          - [Brand Voice]: ${brandVoice}
          - [Tour Notes]: ${notes}
          - [Destination]: ${experience}
          - [Locations]: ${locations}
          - [Channel]: ${channels[channelType.toLowerCase().split(" ").join("_")]}
          `
      },
    ];

    try {
  
      chatInitialCompletion = (await client.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
        max_tokens: 16384,
      })).choices[0].message.content;
  
    } catch (error) {
      console.error("Error calling OpenAI model:", error);
      return { error: "Failed to call OpenAI model" };
    }

    const seoSystemPrompt = `
    Act as a master in SEO (Search Engine Optimization) and generate contents based on the following requirements:
    
    - [Long tail keyword]: The long tail keyword relevant to this [Story]. It should be a phrase and not a full sentence.
    - [Title]: a catchy title that includes the [Long tail keyword].
    - [Excerpt]: a short, compelling summary that highlights the main points of the content 
                    (less than 140 characters)
    - [Meta description]: a concise meta description (approximately 150-160 characters) 
                    that includes the long tail keyword and summarizes the content to attract clicks
    - [URL slug]: a URL-friendly slug by converting the title to lowercase, 
                    replacing spaces with hyphens, and removing any punctuation
    - [Hashtags]: a array of 5-7 highly relevant, SEO-focused hashtags for [Title]. Prioritize hashtags with strong search volume and relevance to user intent, suitable for the [Channel]. Consider both broad and niche terms.

    Output Format:
    The output must be an JSON object that follows this format:
    {
      long_tail_keyword: [Long tail keyword],
      seo_title_tag: [Title],
      seo_excerpt: [Excerpt],
      seo_meta_desc: [Meta description],
      seo_slug: [URL slug],
      hashtags: [Hashtags]
    }
    `.trim();

    const seoMessages = [
      {
          role: "system",
          content: seoSystemPrompt
      },
      { 
          role: 'user',
          content: `content to follow:
          - [Story]: ${chatInitialCompletion}
          - [Channel]: ${channels[channelType.toLowerCase().split(" ").join("_")]}
          `
      },
    ];


    try {
      chatSeoCompletion = (await client.chat.completions.create({
        model: "gpt-4o",
        messages: seoMessages as any,
        max_tokens: 16384,
      })).choices[0].message.content;
  
    } catch (error) {
      console.error("Error calling OpenAI model:", error);
      return { error: "Failed to call OpenAI model" };
    }

    const processedOuput = chatSeoCompletion?.replace("```json","").replace("```","");
    const seoElements = JSON.parse(processedOuput as string);

    const finalSystemPrompt = `
    Rewrite the [Story] to include the [Keyword] within the first 100 words
    and 2 more times in the remaining body, 
    keep the overall context and structure the same as in [Story],
    write in plaintext with no Markdown elements.
    IF [Keyword] is not provided, just output [Story] without any modification.
    `.trim();

    const finalMessages = [
      {
          role: "system",
          content: finalSystemPrompt
      },
      { 
          role: 'user',
          content: `content to follow:
          - [Story]: ${chatInitialCompletion}
          - [Keyword]: ${seoElements["long_tail_keyword"]}
          `
      },
    ];


  try {
    const chatCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: finalMessages as any,
      max_tokens: 16384,
    });

    const output = {
      ...seoElements,
      story_content: chatCompletion.choices[0].message.content || ""
    }

    return { data: output };
  } catch (error) {
    console.error("Error calling OpenAI model:", error);
    return { error: "Failed to call OpenAI model" };
  }
}

export { generateLocationStories };