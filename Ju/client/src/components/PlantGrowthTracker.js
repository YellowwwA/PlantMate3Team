import React, { useState, useEffect, useRef } from 'react';
import '../styles/PlantGrowthTracker.css';
import Header from "./Header";

const PlantGrowthTracker = () => {
  const [plantId, setPlantId] = useState('');
  const [imageGallery, setImageGallery] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [growthData, setGrowthData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reports, setReports] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (imageBlob) => {
    if (!plantId) {
      alert('식물 ID를 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', imageBlob, 'uploaded.jpg');
    formData.append('notes', '');

    await fetch(`/api/plants/${plantId}/upload`, {
      method: 'POST',
      body: formData,
    });

    loadImages();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handleUpload(file);
    e.target.value = '';
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch (err) {
      alert('카메라 접근에 실패했습니다.');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (blob) {
        handleUpload(blob);
        stopCamera();
      }
    }, 'image/jpeg');
  };

  const loadImages = async () => {
    if (!plantId) return;
    try {
      const res = await fetch(`/api/plants/${plantId}/images`);
      const data = await res.json();
      setImageGallery(data.images || []);
    } catch (err) {
      console.error("이미지 불러오기 실패:", err);
    }
  };

  const analyzeGrowth = async () => {
    if (!plantId) {
      alert("식물 ID를 입력해주세요.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/growth-analysis/${plantId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ 분석 실패 응답:", errText);
        throw new Error("분석 요청 실패");
      }

      const data = await res.json();
      setGrowthData(data.growth);

      // ✅ 분석 결과를 UI에 바로 보여주도록 reportData에 저장
      setReportData({
        first_image_url: data.growth.first_image_url || '',
        last_image_url: data.growth.last_image_url || '',
        growth_rate_percent: data.growth.growth_rate_percent,
        report: data.growth.report,
      });

      // ✅ 분석 완료 후 전체 리포트 목록 갱신
      fetchAllReports();
    } catch (err) {
      console.error("성장 분석 실패:", err);
      alert("성장 분석 중 오류가 발생했습니다.");
    }
  };

  const loadGrowthReport = async () => {
    try {
      const res = await fetch(`/api/growth-report/${plantId}`);
      if (!res.ok) return;
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("리포트 불러오기 실패:", err);
    }
  };

  const fetchAllReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("❗토큰이 없습니다. 로그인 필요");
      return;
    }

    try {
      const response = await fetch('/api/growth-report/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn("리포트 불러오기 실패:", error);
        return;
      }

      const data = await response.json();
      console.log("받아온 리포트:", data);

      if (Array.isArray(data)) {
        setReports(data);
      } else if (Array.isArray(data.reports)) {
        setReports(data.reports);
      } else if (data.plant_id) {
        setReports([data]);
      } else {
        console.warn("리포트 형식 이상:", data);
        setReports([]);
      }
    } catch (error) {
      console.error("리포트 불러오기 오류:", error);
    }
  };

  useEffect(() => {
    if (plantId) {
      loadImages();
      loadGrowthReport();
    }
    return () => stopCamera();
  }, [plantId]);

  useEffect(() => {
    fetchAllReports();
  }, []);

  return (
    <div>
      <Header />
      <title>PlantGrowthTracker</title>
      <div className="container mt-4">
        {/* 업로드 & 분석 */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>식물 성장 분석하기</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="plantId" className="form-label">식물 ID</label>
              <input
                type="text"
                className="form-control"
                id="plantId"
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => fileInputRef.current.click()}>사진 업로드</button>
              <button className="btn btn-outline-success" onClick={analyzeGrowth}>성장 분석</button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>
        {/* 최근 분석 결과 */}
        {reportData && (
          <div className="card mt-4 p-3 shadow">
            <div className="card-header">
              <h5>식물 성장 리포트</h5>
            </div>
            <div className="card-body">
              <div className="horizontal-report-images">
                <div className="report-image-block">
                  <img
                    src={reportData.first_image_url}
                    alt="처음 사진"
                    className="img-thumbnail"
                    style={{ maxWidth: '180px', borderRadius: '10px' }}
                  />
                  <div className="mt-2 text-muted" style={{ fontSize: "0.85em" }}>
                    최초 업로드
                  </div>
                </div>

                <div className="fs-2 arrow-icon">→</div>

                <div className="report-image-block">
                  <img
                    src={reportData.last_image_url}
                    alt="최신 사진"
                    className="img-thumbnail"
                    style={{ maxWidth: '180px', borderRadius: '10px' }}
                  />
                  <div className="mt-2 text-muted" style={{ fontSize: "0.85em" }}>
                    최근 업로드
                  </div>
                </div>
              </div>

              <div className="mb-3 fs-5">
                <strong>총 성장률:</strong> {reportData.growth_rate_percent}%
              </div>

              {reportData.report && (
                <div className="bg-light p-3 rounded border">
                  <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{reportData.report}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 전체 리포트 카드 */}
       {/* 전체 리포트 카드 (리포트 있을 때만 보여주기 + 배경 포함) */}
        {reports.length > 0 && (
          <div className="report-container">
            <div className="report-grid">
              {reports.map((report, index) => (
                <div key={index} className="report-card">
                  <div className="image-row">
                    <img src={report.first_image_url} alt="처음 이미지" />
                    <img src={report.last_image_url} alt="마지막 이미지" />
                  </div>
                  <div className="report-info">
                    <p><strong>식물 이름:</strong> {report.plant_name ?? '알 수 없음'}</p>
                    <p><strong>날짜:</strong> {report.created_at ? new Date(report.created_at).toLocaleString() : 'N/A'}</p>
                    <p><strong>성장률:</strong> {report.growth_rate_percent != null ? `${report.growth_rate_percent}%` : '측정 불가'}</p>
                    <p><strong>요약:</strong> {report.summary ?? '없음'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantGrowthTracker;
