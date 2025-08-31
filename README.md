# GitHub PR Analyzer

GitHub Pull Request를 분석하여 특정 기간 동안의 작업 내역을 시각화하고 정리해주는 Electron 데스크탑 애플리케이션입니다.

<img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/936f91a9-0bef-47fc-955e-8efb7e7a03ac" />

<br>

## 주요 기능

- 📊 **PR 통계 시각화**: 주 단위 그룹핑으로 최대 1년간의 PR 병합 현황을 그래프로 확인
- 🔍 **고급 필터링**: GitHub Search API를 활용한 최적화된 PR 검색
- 🔎 **실시간 검색**: PR 번호, 제목, 본문으로 즉시 검색 가능
- 🏷️ **커밋 작성자 필터링**: 특정 사용자가 작성한 커밋만 포함된 PR 분석
- 📑 **다중 탭 지원**: 커스텀 탭 이름으로 여러 저장소나 조건을 동시에 분석 가능
- 🌓 **실시간 테마 전환**: 시스템/라이트/다크 모드 즉시 적용 (저장 불필요)
- 🔐 **안전한 데이터 관리**: GitHub 토큰과 분석 데이터를 로컬에 안전하게 저장
- 📝 **GitHub 스타일 마크다운**: Alert 문법([!IMPORTANT], [!NOTE] 등) 포함한 완전한 GitHub 마크다운 렌더링
- 📄 **효율적인 2열 그리드**: PR 제목 말줄임표 처리로 공간 최적화
- ⚡ **병렬 처리 최적화**: API 호출 최적화로 빠른 분석 속도
- 🔗 **커밋 타임라인**: PR 모달에서 커밋 목록을 타임라인 형태로 시각화
- ⚠️ **혼합 커밋 알림**: 다른 작성자의 커밋이 섞인 PR을 시각적으로 구분 표시
- 📊 **CSV 내보내기**: 전체 PR 목록과 커밋 정보를 CSV 파일로 추출

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

### 1. 초기 설정

#### GitHub 토큰 설정
1. 앱 실행 후 좌측 사이드바에서 **Settings** 클릭
2. GitHub Personal Access Token 입력
   - [GitHub Settings](https://github.com/settings/tokens)에서 토큰 생성
   - 필요한 권한: `repo` (전체 저장소 접근)
3. **Save GitHub Token** 버튼 클릭

#### 테마 설정
- 테마 드롭다운에서 System/Light/Dark 선택
- 변경 즉시 적용됨 (별도 저장 불필요)
- 시스템 테마 변경 시 자동으로 동기화

### 2. PR 분석하기

1. 좌측 사이드바에서 **Analyze** 클릭
2. 탭 설정:
   - **Tab Name**: 분석 탭의 커스텀 이름 지정
3. 분석 조건 입력:
   - **GitHub Repository URL**: 분석할 저장소 URL
   - **Connection Test**: 저장소 연결 상태 확인
   - **Head Branch**: 특정 브랜치만 분석 (선택사항)
   - **Base Branch**: 대상 브랜치 (예: main, master)
   - **Analysis Period**: 분석 기간 선택 (최대 1년)
   - **GitHub Usernames**: 분석할 사용자명 입력 (여러 개 가능)
4. **Analyze** 또는 **Re-analyze** 버튼 클릭
   - 분석 중에는 버튼 비활성화
   - Re-analyze 시 기존 결과 즉시 삭제 후 새 분석 시작
5. 결과 확인:
   - **상단 그래프**: 주 단위로 그룹핑된 PR 병합 현황 (#4D8F94 색상)
   - **하단 2열 그리드**: 최신순으로 정렬된 PR 목록
   - **실시간 검색**: PR 번호, 제목, 본문으로 즉시 필터링
   - **페이지네이션**: 10/50/100개 단위로 조회 가능
   - **CSV 내보내기**: 전체 PR 데이터를 CSV 파일로 추출 가능

### 3. PR 상세 정보 확인

#### PR 목록 기능
- **PR 제목**: 긴 제목은 자동으로 말줄임표(...) 처리
- **혼합 커밋 표시**: 🔀 아이콘으로 다른 작성자 커밋이 포함된 PR 구분
  - 노란색 Shuffle 아이콘으로 표시
  - 마우스 오버 시 "이 PR에는 다른 작성자의 커밋도 포함되어 있습니다" 툴팁
- **자세히 버튼**: PR 제목과 같은 줄에 배치된 "자세히" 버튼

#### PR 상세 모달
- **GitHub 스타일 마크다운**: 
  - Alert 문법 지원 ([!IMPORTANT], [!NOTE], [!WARNING] 등)
  - 완전한 GitHub Flavored Markdown 렌더링
  - 테마에 따른 자동 색상 적용
- **커밋 타임라인**: 
  - 날짜순 내림차순으로 정렬된 커밋 목록
  - 타임라인 형태의 시각적 표현 (점과 선으로 연결)
  - 각 커밋 정보: 메시지, 작성자, 날짜, SHA
  - **커밋 작성자 구분**: 
    - 대상 사용자 커밋: 정상 밝기, 테마 색상 점
    - 기타 사용자 커밋: 50% 투명도, 회색 점

### 4. 고급 기능

- **탭 관리**: `+` 버튼으로 새 분석 탭 생성, X 버튼으로 삭제
- **데이터 지속성**: 앱 재시작 시 분석 결과 및 탭 상태 자동 복원
- **외부 링크**: PR 번호 및 커밋 클릭 시 GitHub 페이지로 바로 이동
- **반응형 레이아웃**: 창 크기에 따른 PR 박스 자동 조정
- **DevTools 경고 제거**: 개발 환경에서의 불필요한 경고 메시지 제거

### 5. CSV 데이터 추출

- **사용법**: Pull Requests 카드 우측 상단의 "Export CSV" 버튼 클릭
- **추출 데이터**:
  - 전체 PR 목록 (페이지네이션과 무관하게 모든 PR 포함)
  - 병합일 기준 내림차순 정렬
- **CSV 컬럼**:
  - PR Number: PR 번호
  - PR Title: PR 제목
  - PR Description: PR 본문
  - PR Merged At: 병합일시 (YYYY.MM.DD HH:mm:ss 형식)
  - Commits: 커밋 목록 (`[SHA] 메시지 (MM/DD HH:mm by 작성자)` 형식)
- **파일명**: `pr-analysis-YYYY-MM-DD-HHmmss.csv`
- **인코딩**: UTF-8

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