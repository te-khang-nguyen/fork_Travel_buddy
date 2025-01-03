import sys
import base64
import time
import os
import subprocess
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('/tmp/generate_reel.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def uninstall(package):
    logger.info(f"Attempting to uninstall {package}")
    subprocess.check_call([sys.executable, "-m", "pip", "uninstall", "-y", package])

def install(package):
    logger.info(f"Attempting to install {package}")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "--no-warn-script-location", package])

def process_images(image_paths):
    captions = []
    for path in image_paths:
        captions.append("Captions to be insert")
        if not os.path.exists(path):
            logger.warning(f"Image not found: {path}")
    return captions

def generate_video(image_paths, captions, audio_path, output_path):
    try:
        import pix2reel
        pix2reel.run_reel_assembly(image_paths, captions, audio_path, output_video=output_path, mode='url')
        logger.info("Video generated successfully")
    except Exception as e:
        logger.error(f"Error generating video: {e}")
        traceback.print_exc()

def main():
    # Uninstall and install the package
    uninstall('pix2reel')
    install('git+https://github.com/talentedgeai/pix2reel.git')

    # Receive image paths and audio path as command-line arguments
    image_paths = sys.argv[1:-1]
    audio_path = sys.argv[-1]

    if not image_paths:
        logger.info("No images provided. Using default processing.")

    # Process images
    captions = process_images(image_paths)

    # Generate video
    output_path = os.path.join(os.getcwd(), 'public', 'output_video.mp4')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    generate_video(image_paths, captions, audio_path, output_path)

    # Output success message
    time.sleep(1)
    logger.info("Congratulations! You have completed the challenge. Here is your journey!")

if __name__ == "__main__":
    main()
