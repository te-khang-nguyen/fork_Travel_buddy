import sys
import time
import logging
import traceback
import io
import subprocess
import os
import json

# Redirect logging to stderr to prevent it from being captured as the story output
class LoggerWriter:
    def __init__(self, logger, level):
        self.logger = logger
        self.level = level
        self.buffer = []

    def write(self, message):
        if message.strip():
            self.logger.log(self.level, message.strip())

    def flush(self):
        pass

# Configure logging to write to stderr
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stderr  # Redirect log messages to stderr
)
logger = logging.getLogger(__name__)

# Redirect stdout to capture only the story
original_stdout = sys.stdout
story_buffer = io.StringIO()
sys.stdout = story_buffer

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

def main():
    # Install the package
    install('git+https://github.com/talentedgeai/pix2reel.git@khang/dev')

    tour_schedule = """
    Hanoi Vespa Food Tour Itinerary
    8:30 AM: Hotel pick-up. Your guide arrives on a vintage Vespa to start your culinary journey through Hanoi’s vibrant streets. Brief introduction and safety instructions before departing.
    9:00 AM: Pho Ba Muoi on Hang Bai Street. There will be Pho Bo (beef pho) and Pho Ga (chicken pho). Pho Ga will is light-hearted, while Pho Bo is more savory. Guests can enjoy the hot bowl of pho, drink one cup of tea, and soak in the morning atmosphere of Hanoi.
    10:30 AM: Bun Cha Huong Lien. Famed for being Obama's lunch spot with Anthony Bourdain when he visited Hanoi for a business trip. Relish a plate of Hanoi's iconic Bun Cha with grilled pork patties, fresh vermicelli, and dipping sauce at a family-run restaurant.
    12:00 PM: Hotel drop-off. Return safely to your hotel with a heart full of memories and a belly full of Hanoi's finest flavors.
    """
    user_challenges = sys.argv[1:]
    user_challenges = json.loads(user_challenges[0])
    
    tour_notes = []
    for challenge in user_challenges:
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
    # Restore stdout and print only the story
    sys.stdout = original_stdout
    print(story)

    # Flush to ensure output is sent
    sys.stdout.flush()


if __name__ == "__main__":
    main()
