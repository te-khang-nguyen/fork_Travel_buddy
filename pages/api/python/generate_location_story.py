import sys
import json
import os
import logging
import traceback
import io
import subprocess

# Configure logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "--no-warn-script-location", "--upgrade", package])

def generate_story(tour_schedule, tour_notes):
    try:
        from pix2reel import TourStoryGenerator
        # Retrieve OpenAI API key from environment variable
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        
        if not openai_api_key:
            raise ValueError("OpenAI API key not found in environment variables")
        generator = TourStoryGenerator(openai_api_key=openai_api_key)
        story, cost = generator.generate_location_stories(tour_schedule, tour_notes)
        return story
    except Exception as e:
        logger.error(f"Error generating story: {e}")
        traceback.print_exc()
        return None

def handler(req, res):
    # Ensure only POST requests are accepted
    if req.method != 'POST':
        res.status(405).json({"error": "Method Not Allowed"})
        return

    try:
        # Install the package
        install('git+https://github.com/talentedgeai/pix2reel.git@khang/dev')

        # Default tour schedule (you might want to make this more dynamic)
        tour_schedule = """
        Hanoi Vespa Food Tour Itinerary
        8:30 AM: Hotel pick-up. Your guide arrives on a vintage Vespa to start your culinary journey through Hanoi's vibrant streets. Brief introduction and safety instructions before departing.
        9:00 AM: Pho Ba Muoi on Hang Bai Street. There will be Pho Bo (beef pho) and Pho Ga (chicken pho). Pho Ga will is light-hearted, while Pho Bo is more savory. Guests can enjoy the hot bowl of pho, drink one cup of tea, and soak in the morning atmosphere of Hanoi.
        10:30 AM: Bun Cha Huong Lien. Famed for being Obama's lunch spot with Anthony Bourdain when he visited Hanoi for a business trip. Relish a plate of Hanoi's iconic Bun Cha with grilled pork patties, fresh vermicelli, and dipping sauce at a family-run restaurant.
        12:00 PM: Hotel drop-off. Return safely to your hotel with a heart full of memories and a belly full of Hanoi's finest flavors.
        """

        # Parse the request body
        body = json.loads(req.body)
        tour_notes = []

        for challenge in body.get('notes', []):
            # Add error handling to check for locationId
            if "locationId" not in challenge:
                logger.error(f"Missing locationId in challenge: {challenge}")
                continue
            
            str_to_pass = ";".join([
                str(challenge["locationId"]),
                challenge.get("title", "Unknown Location"),
                challenge.get("userQuestionSubmission", "") + "\n",
            ])
            tour_notes.append(str_to_pass)

        # Generate story
        story = generate_story(tour_schedule, tour_notes)

        if story:
            res.status(200).json({"story": story})
        else:
            res.status(500).json({"error": "Failed to generate story"})

    except Exception as e:
        logger.error(f"API Error: {e}")
        res.status(500).json({"error": str(e)})

# For Vercel Python API routes
def main(req, res):
    handler(req, res)