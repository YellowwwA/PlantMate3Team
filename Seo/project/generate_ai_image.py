import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_dalle_image(prompt: str, size="512x512"):
    response = openai.images.generate(
        model="dall-e-3",  # 또는 "dall-e-2"
        prompt=prompt,
        size=size,
        quality="standard",
        n=1,
    )
    image_url = response.data[0].url
    return image_url