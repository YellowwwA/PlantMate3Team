import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("PLANTNET_API_KEY")
API_ENDPOINT = "https://my-api.plantnet.org/v2/identify/all"

def identify_plant(image_bytes):
    try:
        files = {'images': ('plant.jpg', image_bytes, 'image/jpeg')}
        params = {'api-key': API_KEY, 'lang': 'en'}

        response = requests.post(API_ENDPOINT, params=params, files=files)
        print("🌐 PlantNet 응답 상태:", response.status_code)
        print("📦 응답 일부:", response.text[:300])

        response.raise_for_status()
        result = response.json()

        if result.get("results"):
            top = result["results"][0]
            return [{
                "species": top.get("species", {}),
                "score": top.get("score", 0)
            }]
        else:
            print("❌ 결과 없음")
            return []

    except Exception as e:
        print("❌ identify_plant 예외 발생:", str(e))
        return []