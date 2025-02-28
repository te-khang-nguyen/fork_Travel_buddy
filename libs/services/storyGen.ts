import OpenAI from "openai";

const client = new OpenAI({ 
  apiKey: process.env.NEXT_PUBLIC_OPENAI_TOKEN,
  dangerouslyAllowBrowser: true 
});

async function generateLocationStories(
    attractions: string,
    notes: string,
    storyLength: number = 45
  ): Promise<any> {

    const prompt = `
    Play the role of an imaginative travel writer.
    Create a cohesive creative story based on the following tour details:
    
    List of Tour information:
    - Tour Locations: ${attractions}
    - Tour Notes: ${notes}
    
    Tour Notes Format:
    [Tour Locations] is provided as a list of location titles separated by newline characters.
    [Tour Notes] is provided as a long body of texts that can be formatted in one of the following ways:
    - Paragraphs seperated by newlines. Each paragraph is a location with its notes.
    - A single paragraph with unknown seperator between attractions. 
    - Each location could be mentioned by its title within the text body of the [Tour Notes]. 
    - The titles can be cross check with the [Tour Locations].
    
    Important Guidelines:
    1. Generate a cohesive creative story with each paragraph telling the story for each location based on the "Tour Notes" and "Tour Locations" provided with the format following the "Tour Notes Format" above.
    2. Detect the attractions within the [Tour Notes] using [Tour Locations] and highlight detected attractions – They’re the star! Don’t miss any key details from this section.
    3. If there were any hiccups at a location, that’s okay! Share them, but always spin it into a positive or uplifting takeaway.
    4. Prioritize detected attractions from [Tour Notes]. Use [Tour Attractions] as reference for correct order of paragraph. 
    5. Stick to the facts [Tour Notes] while keeping each story creative and exciting. Don’t go off-track!
    6. Word limit is ${storyLength} per location. Keep it short, snappy, and on point.

    THINGS MUST NOT BE VIOLATED:
    1. DO NOT MADE UP STORY FOR LOCATIONS THAT DOES NOT EXIST IN [Tour Notes].
    2. DO NOT USE MARKDOWN FORMAT ANYWHERE IN THE RESPONSE.
    
    Output Format:
    - Output can be a paragraph or a collection of paragraphs.
    - Each paragraph has a ${storyLength}-words story corresponding to a location.
    - Paragraphs must be separated with a blank line.
    - This output should have the same number of paragraph as the number of the attractions. 
    - Note that it can have ONE paragraph if the [Tour Notes] only has one location.
    `.trim();

  try {
    const messages = [
        {
            role: "system",
            content: `You are a creative storyteller who 
                      can weave narratives from travel experiences.`
        },
        { 
            role: 'user',
            content: prompt
        },
    ];


    const chatCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 16384,
    });


    return { data: chatCompletion.choices[0].message.content || "" };
  } catch (error) {
    console.error("Error calling OpenAI model:", error);
    return { error: "Failed to call OpenAI model" };
  }
}

export { generateLocationStories };