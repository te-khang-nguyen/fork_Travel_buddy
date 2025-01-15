import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_TOKEN, dangerouslyAllowBrowser: true });

async function generateLocationStories(
    tourSchedule: string,
    tourNotes: any[],    // corresponds to List[str] in Python
    storyLength: number = 100
  ): Promise<any> {

    const transformedData = tourNotes.map((item) => {
      return `${item.locationId};${item.title};${item.userQuestionSubmission}`;
    });
    const prompt = `
    Create a precisely ${storyLength}-word creative story for each location based on the following tour details:
    
    Tour Schedule: ${tourSchedule}
    Tour Notes: ${transformedData}
    
    Tour Notes Format:
    Tour Notes is provided as a list of strings. Each string corresponds to a single location and is formatted as:
    location_id;location_name;location_notes
    Example:
    [
        "8bdcbfb6-9b0e-4ca6-92b4-2a3061bbf6ea;Cho Ben Thanh;Ben Thanh photos",
        "d41d8cd9-8f00-3204-a980-98ef41c8e308;Notre Dame Cathedral;Visited the iconic church"
    ]
    
    location_id: A unique identifier for the location (usually a UUID format).
    location_name: The name of the location (plain text).
    location_notes: Descriptive notes about the location (plain text).
    
    Important Guidelines:
    1. Generate one story for each location in the "Tour Notes." Treat each item in "Tour Notes" as a single location. IF THERE IS ONLY ONE LOCATION, MAKE SURE THE OUTPUT HAS ONLY ONE LOCATION AS WELL.
        Do not split or combine fields (location_id, location_name, location_notes) into separate locations.
        Use the semicolon (;) as a delimiter within each item, not between two different items in the list.
    2. Highlight the "location_notes" for each location – They’re the star! Don’t miss any key details from this section.
    3. If there were any hiccups at a location, that’s okay! Share them, but always spin it into a positive or uplifting takeaway.
    4. Stick to the facts in the "Tour Schedule" and "location_notes" while keeping each story creative and exciting. Don’t go off-track!
    5. Word limit is ${storyLength} per location. Keep it short, snappy, and on point.
    
    Output Format:
    Return the result as a JSON list, where each item is a dictionary with:
    - "locationId": The location_id from the "Tour Notes."
    - "story": A ${storyLength}-word creative story for the corresponding location.
    This output can have ONLY ONE item if the tour notes only has one location.
    
    Return exactly this:
    [
        {"locationId": 1, "story": "Exploring Hanoi's Old Quarter was a feast for the senses..."},
        {"locationId": 2, "story": "A peaceful afternoon in Halong Bay began with a gentle..."}
    ]
    
    No yapping.
    `.trim();
  try {
    const messages = [
        {
            role: "system",
            content: "You are a creative storyteller who can weave narratives from travel experiences."
        },
        { 
            role: 'user',
            content: prompt
        },
    ];

    const chatCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 200 * tourNotes.length,
    });


    console.log(chatCompletion.choices[0].message.content)


    return chatCompletion.choices[0].message.content || "";
  } catch (error) {
    console.error("Error calling OpenAI model:", error);
    throw new Error("Failed to call OpenAI model");
  }
}

export { generateLocationStories };