import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_TOKEN, dangerouslyAllowBrowser: true });

async function generateLocationStories(
    tourSchedule: string,
    tourNotes: {
      locations: string;
      notes: string;
    },    // corresponds to List[str] in Python
    storyLength: number = 45
  ): Promise<any> {

    const prompt = `
    Play the role of an imaginative travel writer.
    Create a cohesive creative story based on the following tour details:
    
    List of Tour information:
    - Tour Schedule: ${tourSchedule}
    - Tour Locations: ${tourNotes.locations}
    - Tour Notes: ${tourNotes.notes}
    
    Tour Notes Format:
    Tour Locations is provided as a list of location titles separated by newline characters.
    Tour Notes is provided as a long body of texts that can be formatted in one of the following ways:
    - Paragraphs seperated by newlines. Each paragraph is a location with its notes.
    - A single paragraph with unknown seperator between locations. Each location is maybe mentioned by its title. The titles can be cross check with the [Tour Locations].
    
    Important Guidelines:
    1. Generate a cohesive creative story with each paragraph telling the story for each location based on the "Tour Notes", "Tour Schedule", and "Tour Locations" provided with the format following the "Tour Notes Format" above.
    2. Detect the locations within the "Tour Notes" and highlight the "Tour Locations" for each location – They’re the star! Don’t miss any key details from this section.
    3. If there were any hiccups at a location, that’s okay! Share them, but always spin it into a positive or uplifting takeaway.
    4. Stick to the facts in the "Tour Schedule" and "Tour Notes" while keeping each story creative and exciting. Don’t go off-track!
    5. Word limit is ${storyLength} per location. Keep it short, snappy, and on point.
    6. DO NOT USE MARKDOWN FORMAT IN THE RESPONSE.
    
    Output Format:
    Return the result as a JSON list, where each item is a dictionary with:
    - "locationId": index of the location in the "Tour Locations" list.
    - "story": A ${storyLength}-word creative story for the corresponding location.
    This output should have the same length as the number of the locations. Note that it can have ONE item if the tour notes only has one location.
    
    The format should be like this:
    [
        {"locationId": 1, "story": "Exploring Hanoi's Old Quarter was a feast for the senses..."},
        {"locationId": 2, "story": "A peaceful afternoon in Halong Bay began with a gentle..."}
    ]
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

    // console.log(prompt?.length + tourNotes.locations?.split("\n")?.length * storyLength);

    const chatCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 16384,
    });


    // console.log(chatCompletion.choices[0].message.content)


    return chatCompletion.choices[0].message.content || "";
  } catch (error) {
    console.error("Error calling OpenAI model:", error);
    throw new Error("Failed to call OpenAI model");
  }
}

export { generateLocationStories };