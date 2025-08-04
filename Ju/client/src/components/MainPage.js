import React, { useEffect, useState } from "react";
import '../styles/MainPage.css';
import Carousel from "./Carousel";
import Header from "./Header";

const MainPage = () => {
  const plantNames = ["감나무", "개망초", "튤립", "네잎클로바", "안개꽃", "개나리"];
  const [mixedPlantImages, setMixedPlantImages] = useState([]);

  useEffect(() => {
    const fetchAllImages = async () => {
      try {
        const responses = await Promise.all(
          plantNames.map((name) =>
            fetch(`/api/plant-images/${name}?sample_count=2`).then((res) => res.json())
          )
        );

        const combined = responses.flatMap((res, idx) =>
          res.images.map((url) => ({
            img: url,
            name: plantNames[idx],
          }))
        );

        // 랜덤 섞기
        const shuffled = combined.sort(() => Math.random() - 0.5);
        setMixedPlantImages(shuffled);
      } catch (err) {
        console.error("이미지 로딩 실패:", err);
      }
    };

    fetchAllImages();
  }, []);

  return (
    <div className="main-container">
      <Header />
      {/* 메인 콘텐츠 */}
      <main className="hero-section">
        <div className="hero-content">
          <h1>식물을 더 스마트하게 관리하세요</h1>
          <p className="subtitle">
            PlantMate와 함께라면 누구나 식물 관리의 달인이 될 수 있습니다. 지금 바로 시작해보세요!
          </p>
        </div>
      </main>
      <section className="plant-gallery">
          <Carousel mixedData={mixedPlantImages} />
      </section>

      {/* 앱 기능 소개 */}
      <section className="features">
        <h2>주요 기능</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-camera"></i>
            </div>
            <h3>식물 인식</h3>
            <p>사진만으로도 식물의 종류와 관리 방법을 알려드립니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-bell"></i>
            </div>
            <h3>물주기 알림</h3>
            <p>식물별로 최적의 물주기 알림을 받아보세요.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>성장 추적</h3>
            <p>식물의 성장 과정을 기록하고 추적해보세요.</p>
          </div>
        </div>
      </section>
      {/* 푸터 */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <i className="fas fa-leaf"></i>
            <span>PlantVision</span>
          </div>
          <div className="footer-links">
            <a href="#">이용약관</a>
            <a href="#">개인정보처리방침</a>
            <a href="#">문의하기</a>
          </div>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
        <div className="copyright">
          &copy; 2025 PlantVision. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
