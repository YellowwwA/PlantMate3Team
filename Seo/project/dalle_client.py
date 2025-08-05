import os
from openai import OpenAI
from dotenv import load_dotenv
import requests

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
REMOVE_BG_API_KEY = os.getenv("REMOVE_BG_API_KEY")  # 🔑 remove.bg API 키

def generate_plant_image(plant_name_en: str) -> str:
    prompt = (
        f"A high-resolution realistic photograph of a {plant_name_en} plant in a modern white ceramic pot, "
        "centered on a plain white background. The plant should display its distinctive species-specific characteristics "
        "such as the correct shape, size, flowers, or fruits depending on the name. Avoid generic green foliage. "
        "Use soft natural lighting and shallow depth of field. DSLR quality. No cropping, full view."
    )

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            n=1
        )
        image_url = response.data[0].url
    except Exception as e:
        print("❌ 이미지 생성 실패:", e)
        return None

    # ✅ remove.bg로 배경 제거
    try:
        remove_response = requests.post(
            "https://api.remove.bg/v1.0/removebg",
            data={"image_url": image_url, "size": "auto"},
            headers={"X-Api-Key": REMOVE_BG_API_KEY},
        )
        if remove_response.status_code == 200:
            with open("output.png", "wb") as out:
                out.write(remove_response.content)
            return "data:image/png;base64," + remove_response.content.encode("base64")  # 프론트 표시용
        else:
            print("❌ remove.bg 실패:", remove_response.text)
            return image_url
    except Exception as e:
        print("❌ remove.bg 에러:", e)
        return image_url