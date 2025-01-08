import sys
import time
import logging
import traceback
import io
import subprocess
import os

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
    logger.info(f"Attempting to install {package}")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "--no-warn-script-location", package])

def generate_story(tour_schedule, tour_notes):
    try:
        from pix2reel import TourStoryGenerator
        # Retrieve OpenAI API key from environment variable
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        
        if not openai_api_key:
            raise ValueError("OpenAI API key not found in environment variables")
        generator = TourStoryGenerator(openai_api_key=openai_api_key)
        story, cost = generator.generate_tour_story(tour_schedule, tour_notes)
        logger.info("Story generated successfully")
        return story
    except Exception as e:
        logger.error(f"Error generating story: {e}")
        traceback.print_exc()

def main():
    # Install the package
    install('git+https://github.com/talentedgeai/pix2reel.git@khang/dev')

    tour_schedule = """
    Chinatown, Binh Tay Market, Thien Hau Temple and Reunification Palace.

    Start the city tour to head to bustling Chinatown, take a tour of Cholon, HCMC's Chinatown, see colorful Chinese architecture and traditional medicine shops abound, visit Binh Tay market to experience the vibrant rhythm of one of Ho Chi Minh City's busiest and most colorful areas. At this major hub for local merchants, watch Vietnamese sellers barter for goods.

    Next stop is Thien Hau Temple, built in the early 19th century. The temple is dedicated to Thien Hau, the goddess of seafarers, for her protection during Chinese migration to Vietnam. Visit the pagoda's shrines and shops in the center of Chinatown, where the Chinese minority reside.

    Continue to the century-old Reunification Palace, which witnessed the growth of Ho Chi Minh City during peacetime and throughout the Vietnam War until its end in 1975.

    End the tour at your hotel.
    """
    tour_notes_list = sys.argv[1:]
    tour_notes = ', '.join(tour_notes_list)

    if not tour_notes:
        logger.info("No notes provided. Using default processing.")
        tour_notes = "Everything is perfect. I can't wait to go back to this place."

    # Generate story
    story = generate_story(tour_schedule, tour_notes)

    # Restore stdout and print only the story
    sys.stdout = original_stdout
    print(story)

    # Flush to ensure output is sent
    sys.stdout.flush()


if __name__ == "__main__":
    main()
