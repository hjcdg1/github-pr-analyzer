# GitHub PR Analyzer

GitHub Pull Request를 분석하여 특정 기간 동안의 작업 내역을 시각화하고 정리해주는 Electron 데스크탑 애플리케이션입니다.

<img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/936f91a9-0bef-47fc-955e-8efb7e7a03ac" />

<br>

## 주요 기능

- 📊 **PR 통계 시각화**: 날짜별 PR 병합 현황을 그래프로 확인
- 🔍 **고급 필터링**: GitHub Search API를 활용한 최적화된 PR 검색
- 🏷️ **커밋 작성자 필터링**: 특정 사용자가 작성한 커밋만 포함된 PR 분석
- 📑 **다중 탭 지원**: 여러 저장소나 조건을 동시에 분석 가능
- 🌓 **테마 지원**: 시스템/라이트/다크 모드 자동 전환
- 🔐 **안전한 데이터 관리**: GitHub 토큰과 분석 데이터를 로컬에 안전하게 저장
- 📝 **마크다운 렌더링**: PR 설명을 GitHub 스타일로 렌더링
- 📄 **2열 그리드 레이아웃**: 공간 효율적인 PR 목록 표시
- ⚡ **병렬 처리**: API 호출 최적화로 빠른 분석 속도

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

### 1. GitHub 토큰 설정

1. 앱 실행 후 좌측 사이드바에서 **Settings** 클릭
2. GitHub Personal Access Token 입력
   - [GitHub Settings](https://github.com/settings/tokens)에서 토큰 생성
   - 필요한 권한: `repo` (전체 저장소 접근)
3. 테마 선택 (System/Light/Dark)
4. **Save Settings** 클릭

### 2. PR 분석하기

1. 좌측 사이드바에서 **Analyze** 클릭
2. 분석 조건 입력:
   - **GitHub Repository URL**: 분석할 저장소 URL
   - **Connection Test**: 저장소 연결 확인
   - **Head Branch**: 특정 브랜치만 분석 (선택사항)
   - **Base Branch**: 대상 브랜치 (예: main, master)
   - **Analysis Period**: 분석 기간 선택 (최대 1년)
   - **GitHub Usernames**: 분석할 사용자명 입력 (여러 개 가능)
3. **Analyze** 버튼 클릭
4. 결과 확인:
   - 상단 그래프: 날짜별 PR 병합 현황 (Chart.js 사용)
   - 하단 2열 그리드: PR 상세 정보 (제목, 병합 시각, 작성자)
   - 페이지네이션: 10/50/100개 단위로 조회

### 3. 고급 기능

- **탭 관리**: `+` 버튼으로 새 분석 탭 생성, X 버튼으로 삭제
- **데이터 지속성**: 앱 재시작 시 분석 결과 자동 복원
- **PR 상세보기**: "View Description" 토글로 마크다운 형식의 PR 본문 확인
- **외부 링크**: PR 번호 클릭 시 GitHub 페이지로 바로 이동
- **실시간 테마 전환**: 시스템 다크모드 변경 시 자동 적용

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