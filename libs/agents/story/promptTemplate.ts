export const channelsDescription = {
      travel_buddy: `Travel Buddy - A travel platform providing photo tours of experiences 
                    and showcases beautiful travel stories of their users.`,
      instagram: "Instagram"
}

function getStoryPrompt({
    experience,
    locations,
    notes,
    mediaSummary,
    brandVoice,
    channelType,
    storySamples,
    storyStructure,
    storyLength = 45
}:{
    experience: string;
    locations: string;
    notes: string;
    mediaSummary: string;
    brandVoice: string;
    channelType: string;
    storySamples?: string[];
    storyStructure?: string[];
    storyLength: number;
}) {

    const systemPrompt = `
    You are an expert in travel storytelling whose writing style is the [Brand Voice].
    Create a cohesive story based on the following tour details:

    Input Format:
    [Destination] is the name of the experience for which the story is written.
    [Locations] is provided as a list of location titles associated with [Destination], each title separated by newline character.
    [Tour Notes] is provided as a long body of texts that can be formatted in one of the following ways:
    - One or more paragraphs seperated by newline characters.
    - Each location in [Locations] could be mentioned by its title within the text body of the [Tour Notes].
    [Brand Voice]: the requested writing style.
    [Media Summary]: a list of brief descriptions for the user's uploaded media (photos or videos).
    [Analysis]: Analysis for various stories samples.
    [Examples]: multiple examples for a travel story.

    Writing Style: 
    - Strictly follow writing style in the [Brand Voice].
    - Always write in first-person perspective unless it is instructed otherwise in the [Brand Voice] or the [Tour Notes]
    - Analyze and adopts techniques in [Analysis] to create unique stories.
    - The writing style should not be overtly formal if it is not stated in the [Brand Voice].
    - Never use jargon or technical terms unless specified in the [Brand Voice].
    - Keep the tone conversational and engaging.
    - Never write in a promotional tone.
    
    Important Guidelines:
    1. Generate a cohesive multi-paragraph creative story with based on the [Tour Notes], [Destination], and [Locations] provided in the "Tour Notes Format".
    2. Detect the locations within the [Tour Notes] using [Locations] and highlight detected locations.
    3. If there were negative feeling detected in the [Tour Notes], share them, but always spin it into a positive or uplifting takeaway.
    4. If no location is detected, prioritize the [Locations] over the [Tour Notes].
    5. Stick to the facts in [Tour Notes] while keeping each story creative and exciting. Don’t go off-track!
    6. Word limit is ${storyLength} per paragraph. Keep it short, snappy, and on point.
    7. Include information from the [Media Summary] to the story whenever it is relevant.

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
    
    Story examples: [Examples]
    `.trim();

    const messages = [
      {
          role: "developer",
          content: systemPrompt
      },
      { 
          role: 'user',
          content: `content to follow:
          - [Brand Voice]: ${brandVoice}
          - [Tour Notes]: ${notes}
          - [Destination]: ${experience}
          - [Locations]: ${locations}
          - [Channel]: ${channelsDescription[channelType.toLowerCase().split(" ").join("_")]}
          - [Media Summary]: ${mediaSummary}
          - [Analysis]: ${storyStructure?.map((item, index) =>
                          `Analysis No.${index + 1}
                          ${item}`
                        ).join('\n\n') }
          - [Examples]: ${storySamples?.map((item, index) =>
                          `Example No.${index}
                          ${item}`
                        ).join('\n\n')}
          `
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
})  {
    const seoSystemPrompt = `
    You are a master in SEO (Search Engine Optimization). Generate contents based on the following requirements:
    
    - [Long tail keyword]: The long tail keyword relevant to this [Story]. It should be a phrase and not a full sentence.
    - [Title]: a catchy title that includes the [Long tail keyword].
    - [Excerpt]: a short, compelling summary that highlights the main points of the content 
                    (less than 140 characters)
    - [Meta description]: a concise meta description (approximately 150-160 characters) 
                    that includes the long tail keyword and summarizes the content to attract clicks
    - [URL slug]: a URL-friendly slug by converting the title to lowercase, 
                    replacing spaces with hyphens, and removing any punctuation
    - [Hashtags]: a array of 5-7 highly relevant, SEO-focused hashtags for [Title]. Prioritize hashtags with strong search volume and relevance to user intent, suitable for the [Channel]. Consider both broad and niche terms.
    - [Rewrite]: Rewrite the [Story] to include the [Keyword] within the first 100 words and 2 more times in the remaining body, 
                 keep the overall context and structure the same as in [Story], 
                 write in plaintext with no Markdown elements.
                 IF [Keyword] is not provided, just output [Story] without any modification.
    
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
            content: `content to follow:
          - [Story]: ${chatInitialCompletion}
          - [Channel]: ${channelsDescription[channelType.toLowerCase().split(" ").join("_")]}
          `
        },
    ]; // story_content: [Rewrite]

    return seoMessages;
}

function getStoryWithSeoPrompt({ 
  chatSeoCompletion,
  chatInitialCompletion
}: {
  chatSeoCompletion:string | null;
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
          `
    },
  ];

  return [finalMessages, seoElements];
}

function getImageAnalysisPrompt({
  url, 
  relatedQueries
}: {
  url:string;
  relatedQueries: { [x: string]: string }
}) {
  return [
    {
      role: "developer",
      content: `
        You are an expert in photo analyst.
        
        You are given the following information:
        - [Experience]: this is the name of the experience/destination consisting of mulitiple locations/attractions.
        - [Locations]: a list of names for the locations relevant to the [Experience]

        Follow below instructions:
        - Analyze the image that the user uploaded and summarize the image content with relevant information to the [Experience] and [Locations].
        - If the image can be relates to any of the location in the [Locations], include relevant comment in the summary.
        - Double check your analysis and summary before giving the final response.
        - NEVER MAKE UP INFORMATION THAT DOES NOT EXIST IN THE IMAGE.
        - IF NO CONNECTIONS BETWEEN THE IMAGE AND [Experience] OR [Locations] CAN FOUND, ONLY SUMMARIZE THE OVERALL CONTENT OF THE IMAGE.
        - NEVER MENTION THE IMAGE NUMBERS LIKE "Photo No.1, Photo No.2, etc..."

        Output condition:
        - The summary must have less than 20 words.
        - The summary must be plain text, not markdown.

      `
    },
    {
      role: "user",
      content: [
        { 
          type: "text", 
          text: `
            Context: 
            - [Experience]: ${relatedQueries?.experience}
            - [Locations]: ${relatedQueries?.locations}
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