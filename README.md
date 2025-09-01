# GitHub PR Analyzer

GitHub Pull Request를 분석하여 특정 기간 동안의 작업 내역을 시각화하고 정리해주는 Electron 데스크탑 애플리케이션입니다.

<img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/936f91a9-0bef-47fc-955e-8efb7e7a03ac" />

<br>

## 주요 기능

- 📊 **PR 통계 시각화**: 기간별 PR 병합 현황을 그래프로 시각화
- 🔍 **실시간 검색**: PR 번호, 제목, 본문으로 즉시 필터링
- 🏷️ **사용자별 분석**: 특정 사용자의 커밋이 포함된 PR만 분석
- 📑 **다중 탭 지원**: 여러 저장소나 조건을 동시에 분석
- 🌓 **테마 지원**: 시스템/라이트/다크 모드 지원
- 📊 **CSV 내보내기**: 분석 결과를 CSV로 추출
- 📝 **마크다운 렌더링**: GitHub 스타일 마크다운 완벽 지원

<br>

## 설치 방법

### 사전 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- GitHub Personal Access Token ([생성 방법](https://github.com/settings/tokens))

### 설치 단계

1. 저장소 클론
```bash
git clone https://github.com/yourusername/github-pr-analyzer.git
cd github-pr-analyzer
```

2. 의존성 설치
```bash
npm install
```

<br>

## 실행 방법

### 개발 모드

개발 서버와 Electron을 동시에 실행:
```bash
npm start
```

### 프로덕션 모드

1. 빌드 생성
```bash
npm run build
```

2. Electron 앱 실행
```bash
npm run electron
```

### 앱 패키징

각 플랫폼별 실행 파일 생성:
```bash
npm run dist
```

생성된 파일은 `dist` 폴더에서 확인할 수 있습니다:
- **macOS**: `.dmg` 파일
- **Windows**: `.exe` 설치 파일
- **Linux**: `.AppImage` 파일

<br>

## 사용 방법

1. GitHub 토큰 설정
2. (Optional) 테마 설정
3. PR 분석

<br>

## 개발 스크립트

```bash
# 개발 서버 실행 (Vite + Hot Reload)
npm run dev

# TypeScript 컴파일 및 React 빌드
npm run build

# Electron 앱 실행 (프로덕션)
npm run electron

# 개발 모드로 Electron 실행
npm run electron:dev

# 개발 서버 + Electron 동시 실행 (권장)
npm start

# 배포용 패키지 생성 (macOS/Windows/Linux)
npm run dist
```