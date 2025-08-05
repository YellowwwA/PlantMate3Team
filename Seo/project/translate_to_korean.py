import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def translate_to_korean(scientific_name: str) -> str:
    prompt = (
        f"'{scientific_name}' 식물의 한국어 이름을 한 단어로만 알려줘. "
        f"다른 설명 없이 식물 이름 하나만 정확히 말해."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=20,
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("❌ 번역 실패:", e)
        return "알 수 없음"