import os
from openai import OpenAI
from dotenv import load_dotenv

# ✅ 환경변수 로드
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

# ✅ OpenAI 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_plant_image(plant_name_kr: str) -> str:
    """
    흰색 화분에 심어진 전체 식물의 사실적인 이미지 생성 (DALL·E 3)
    """
    prompt = (
        f"A high-quality realistic photo of a healthy '{plant_name_kr}' plant in a glossy white ceramic pot, "
        "shot with a 35mm lens, in soft natural light, on a clean white background. "
        "The plant should have vibrant natural colors and visible soil. "
        "Avoid cartoons or illustrations. DSLR photo quality, shallow depth of field."
    )

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            n=1
        )
        return response.data[0].url
    except Exception as e:
        print("❌ 이미지 생성 실패:", e)
        return None