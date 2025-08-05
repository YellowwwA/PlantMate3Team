import React, { useState } from 'react';
import axios from 'axios';

function UploadPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('file', image);
    formData.append('user_id', 1); // 필요 시 동적 설정

    setLoading(true);
    try {
      const response = await axios.post(
        'http://15.168.150.125:8080/identify',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log("✅ 서버 응답:", response.data);
      setResult(response.data);
    } catch (error) {
      console.error('❌ 업로드 오류:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>📷 식물 사진 업로드</h2>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        style={{ marginBottom: '15px' }}
      />

      {preview && (
        <div style={{ marginTop: '20px' }}>
          <img
            src={preview}
            alt="미리보기"
            style={{ width: '250px', borderRadius: '8px' }}
          />
        </div>
      )}

      {image && (
        <button
          onClick={handleUpload}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          분석 요청
        </button>
      )}

      {loading && <p style={{ marginTop: '20px' }}>분석 중...</p>}

      {result && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            maxWidth: '400px',
          }}
        >
          <h3>🌱 분석 결과</h3>
          <p>
            <strong>학명 (영문):</strong> {result.plant_name_en ?? '알 수 없음'}
          </p>
          <p>
            <strong>일반 이름 (한글):</strong> {result.plant_name_kr ?? '알 수 없음'}
          </p>
          <p>
            <strong>확신도:</strong>{' '}
            {result.confidence !== undefined && result.confidence !== null
              ? `${parseFloat(result.confidence).toFixed(1)}%`
              : '-'}
          </p>

          {/* ✅ AI 생성 이미지 */}
          {result.image_url && (
            <div style={{ marginTop: '20px' }}>
              <h3>🎨 AI 생성 이미지</h3>
              <img
                src={result.image_url}
                alt="AI 생성 이미지"
                style={{ width: '250px', borderRadius: '8px' }}
              />
            </div>
          )}

          {/* ✅ 누끼 이미지 */}
          {result.removed_bg_image_base64 && (
            <div style={{ marginTop: '20px' }}>
              <h3>🪄 배경 제거 이미지</h3>
              <img
                src={`data:image/png;base64,${result.removed_bg_image_base64}`}
                alt="누끼 이미지"
                style={{
                  width: '250px',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadPage;