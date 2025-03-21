export const channelsDescription = {
  travel_buddy: `Travel Buddy - A travel platform providing photo tours of experiences 
                    and showcases beautiful travel stories of their users.`,
  instagram: "Instagram"
}

function getStoryPrompt({
  experience,
  activities,
  notes,
  mediaSummary,
  brandVoice,
  channelType,
  storySamples,
  storyStructure,
  storyLength = 45
}: {
  experience: string;
  activities: string;
  notes: string;
  mediaSummary: string;
  brandVoice: string;
  channelType: string;
  storySamples?: string[];
  storyStructure?: string[];
  storyLength: number;
}) {

  const systemPrompt = `
    You are a travel storytelling expert writing in the provided [Brand Voice]. Create an engaging, cohesive first-person narrative based exclusively on these inputs:

    Inputs:
    - [Experience]: Name of travel experience.
    - [Activities]: List of activities/atrractions relevant to [Experience].
    - [Tour Notes]: Text containing detailed context; may explicitly mention [Activities].
    - [Brand Voice]: Defines writing style.
    - [Media Summary]: Descriptions of user's uploaded media.
    - [Analysis]: Techniques to incorporate.
    - [Examples]: Reference travel stories.
    
    Guidelines:
    - Strictly adhere to [Brand Voice]: conversational, engaging, concise, factual, and non-promotional.
    - Use storytelling techniques from [Analysis].
    - Use [Tour Notes] as the focal points, connect it creatively with [Experience].
    - If any activity/atrraction in [Activities] is mentioned in [Tour Notes], clearly highlight it. Otherwise, skip the [Activities].
    - In case there are multiple paragraphs, generate each paragraph with exactly ${storyLength} words, separated by blank lines.
    - Spin negative sentiments into positive, uplifting conclusions.
    - Naturally incorporate relevant [Media Summary] details.
    
    Mandatory:
    - Output plaintext only; NO markdown.
    - Ensure relevance strictly to provided inputs.
    - Always produce a complete, compelling narrative—even with minimal input details.
    `.trim();

  const messages = [
    {
      role: "developer",
      content: systemPrompt
    },
    {
      role: 'user',
      content: `Content to follow:
          - [Brand Voice]: ${brandVoice}
          - [Tour Notes]: ${notes}
          - [Experience]: ${experience}
          - [Activities]: ${activities}
          - [Channel]: ${channelsDescription[channelType.toLowerCase().split(" ").join("_")]}
          - [Media Summary]: ${mediaSummary}
          - [Analysis]: ${storyStructure?.map((item, index) =>
        `Analysis No.${index + 1}
                          ${item}`
      ).join('\n\n')}
          - [Examples]: ${storySamples?.map((item, index) =>
        `Example No.${index}
                          ${item}`
      ).join('\n\n')}
      `.trim()
    },
  ];

  // [Examples]: multiple examples for a travel story.
  // - [Examples]: ${storySamples.map((item,index) => 
  //                      `Example No.${index}
  //                       ${item}`
  //                      ).join('\n\n')
  //                    }


  return messages;

}


function getSeoPrompt({
  chatInitialCompletion,
  channelType,
}: {
  chatInitialCompletion: string | null;
  channelType: string;
}) {
  const seoSystemPrompt = `
    You're an SEO expert. Generate content precisely following these instructions:

    Inputs:
    - [Long tail keyword]: A relevant phrase (not a full sentence) for the [Story].
    - [Title]: Catchy, includes [Long tail keyword].
    - [Excerpt]: Engaging summary (<140 chars), highlighting main points.
    - [Meta description]: Concise (150–160 chars), includes [Long tail keyword], crafted to boost clicks.
    - [URL slug]: Lowercase, hyphen-separated, punctuation-free version of [Title].
    - [Hashtags]: Array of 5–7 SEO-focused hashtags optimized for [Channel]; prioritize strong search volume and user intent (balance broad & niche terms).
    - [Rewrite]: Rewrite [Story] with just plaintext (no Markdown), preserving original structure/context. Insert [Keyword] within first 100 words and twice afterward. If no [Keyword], output original [Story] unchanged.
    
    Output Format:
    The output must be an JSON object that follows this format:
    {
      long_tail_keyword: [Long tail keyword],
      seo_title_tag: [Title],
      seo_excerpt: [Excerpt],
      seo_meta_desc: [Meta description],
      seo_slug: [URL slug],
      hashtags: [Hashtags],
      story_content: [Rewrite]
    }
    `.trim();

  const seoMessages = [
    {
      role: "developer",
      content: seoSystemPrompt
    },
    {
      role: 'user',
      content: `Content to follow:
          - [Story]: ${chatInitialCompletion}
          - [Channel]: ${channelsDescription[channelType.toLowerCase().split(" ").join("_")]}
          `.trim()
    },
  ]; // story_content: [Rewrite]

  return seoMessages;
}

function getStoryWithSeoPrompt({
  chatSeoCompletion,
  chatInitialCompletion
}: {
  chatSeoCompletion: string | null;
  chatInitialCompletion: string | null;
}) {
  const processedOuput = chatSeoCompletion?.replace("```json", "").replace("```", "");
  const seoElements = JSON.parse(processedOuput as string);

  const finalSystemPrompt = `
    Naturally include the [Keyword] in the [Story] within the first 100 words
    and 2 more times in the remaining body, 
    keep the everything else the same as in [Story],
    write in plaintext with no Markdown elements.
    IF [Keyword] is not provided, just output [Story] without any modification.
    `.trim();

  const finalMessages = [
    {
      role: "developer",
      content: finalSystemPrompt
    },
    {
      role: 'user',
      content: `content to follow:
          - [Story]: ${chatInitialCompletion}
          - [Keyword]: ${seoElements["long_tail_keyword"]}
          `.trim()
    },
  ];

  return [finalMessages, seoElements];
}

function getImageAnalysisPrompt({
  url,
  relatedQueries
}: {
  url: string;
  relatedQueries: { [x: string]: string }
}) {
  return [
    {
      role: "developer",
      content: `
        You're an expert photo analyst. Carefully analyze the user's uploaded image based solely on:

        Inputs:
        - [Experience]: Name of the overall experience or experience (consisting of multiple attractions).
        - [Activities]: List of activity/atrraction names relevant to the [Experience].
        
        Instructions:
        - Summarize the image clearly, accurately, and factually.
        - Explicitly connect image details to relevant [Activities] or [Experience] when possible.
        - If no clear connections exist, provide only a general summary of the image content.
        - NEVER invent details not present in the image.
        - NEVER refer to images by numbers (e.g., "Photo No.1").

        Output condition:
        - The summary must have less than 20 words.
        - The summary must be plain text, not markdown.
      `.trim()
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `
            Context: 
            - [Experience]: ${relatedQueries?.experience}
            - [Activities]: ${relatedQueries?.activities}
            - [Request]: Tell me the content of this image
          `
        },
        {
          type: "image_url",
          image_url: {
            "url": url,
          },
        },
      ],
    }
  ];
};


export { getStoryPrompt, getSeoPrompt, getStoryWithSeoPrompt, getImageAnalysisPrompt };