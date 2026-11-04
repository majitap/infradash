# InfraDash

GitLab 운영 콘솔 데모. Next.js(App Router), Tailwind CSS v4, shadcn/ui(`dashboard-01` 블록 기반), Recharts로 만들었습니다.

Live: https://majitap.github.io/infradash/

> **모든 데이터는 모의 데이터입니다.** 모든 페이지는 `lib/mock-data.ts`(와 `lib/mock/*`)만 읽습니다.
> 실제 API 호출과 토큰은 어디에도 없습니다. 재시작·정리 같은 버튼은 확인 다이얼로그와 토스트만 띄웁니다.

## 페이지

| 메뉴 | 경로 | 내용 |
| --- | --- | --- |
| 개요 | `/` | S1 인시던트 배너, KPI 타일, 파이프라인 추이, 이번 주 커밋 TOP 5, 1년 커밋 히트맵, 러너 현황, 최근 활동, 주의 항목 |
| 파이프라인 | `/pipelines` | 성공률·소요 시간 KPI, 일별 성공/실패, 실패 스테이지, 프로젝트별 성공률, 최근 파이프라인, 느린 잡 |
| 러너 | `/runners` | 러너 상태 도넛, 실행기별 잡, 러너 테이블(부하·버전·7일 추이), 재시작/일시중지(데모) |
| 인시던트 | `/incidents` | 온콜, 월별 MTTR, 심각도 분포, 서비스 가용성, 인시던트 타임라인 |
| 커밋 | `/commits` | 주간/4주/12주 커밋 순위(포디움 + 4~10위), 연속 커밋 스트릭, 시간대 히트맵, 프로젝트/부서별 커밋, 최근 커밋 |
| 머지 리퀘스트 | `/merge-requests` | 처리량, 머지 소요 시간, 상태별 MR 테이블, 리뷰어 부하, 오래된 MR, 라벨 분포 |
| 프로젝트 | `/projects` | 언어 분포, 그룹별 수, 활발한 프로젝트, 검색/가시성 필터가 있는 프로젝트 테이블 |
| 사용자 | `/users` | 역할 분포, 부서별 인원, 입사/퇴사 추이, 입사자·퇴사자·차단·초대 대기 탭, 2FA |
| 권한 관리 | `/access` | 관리자 전용. 접근 요청 승인·거절(높은 권한은 2인 승인), 그룹별 역할 일괄 편집, 인스턴스 관리자, 접근 정책, 임시 권한 만료·연장, 권한 검토, 역할별 권한표, 변경 이력 |
| 스토리지 | `/storage` | 유형별 사용량, 월별 추이, 프로젝트별 누적 막대, 정리 후보 |
| 보안 | `/security` | 심각도 추이, 스캐너별 탐지, 취약점 테이블, 컴플라이언스 점검, 프로젝트 위험도 |
| 감사 로그 | `/audit` | 유형별 이벤트, 활동이 많은 사용자, 실패 이벤트, 검색/필터 가능한 로그 테이블 |
| 업그레이드 | `/upgrade` | 현재 → 목표 버전 경로, 사전 점검, 주요 변경 사항, 단계별 체크리스트 |

공통 셸: 그룹화된 사이드바, 페이지 제목/설명이 있는 헤더, `⌘K` 빠른 이동, 알림, 라이트/다크 테마.

## 구조

```
app/                  라우트 (페이지는 views를 렌더링만 함)
components/layout/    사이드바, 헤더, 테마, 커맨드 팔레트
components/dashboard/ KPI 타일, 히트맵, 리더보드, 포디움, 도넛, 바 리스트 등 공용 위젯
components/charts/    Recharts 래퍼 (막대, 선, 영역)
components/views/     페이지별 화면
components/ui/        shadcn/ui 컴포넌트
lib/mock/             주제별 모의 데이터 (시드 기반 결정적 생성)
lib/mock-data.ts      모의 데이터 단일 진입점
lib/nav.ts            메뉴 정의
lib/format.ts         숫자/날짜 포맷 (로케일 의존 없음)
```

## 개발

```bash
npm install
npm run dev
```

`basePath` 때문에 개발 서버는 http://localhost:3000/infradash/ 에서 열립니다.

## 빌드와 배포

`next.config.ts`는 `output: "export"`, `basePath: "/infradash"`, `trailingSlash: true`, `images.unoptimized: true`를 사용합니다.

```bash
npm run build   # ./out 에 정적 사이트 생성
```

`main`에 푸시하면 `.github/workflows/deploy.yml`이 빌드 후 `./out`을 GitHub Pages에 배포합니다
(Settings > Pages > Source: GitHub Actions).

## 디자인 메모 (Apple HIG · Cupertino Bento Edition)

- **타이포그래피**: Pretendard Variable + Apple SF Pro / Apple SD Gothic Neo + Geist Mono (`16px` 광학 스케일, 타이트한 디스플레이 자간 `-0.025em` 및 정렬 숫자 `tabular-nums`)
- **표면 & 머티리얼**: Cupertino Alabaster 캔버스(`#F5F5F7`) 위 순백색 스쿼클 벤토 카드(`rounded-[22px]`)와 미세 헤어라인·다층 앰비언트 섀도우, 반투명 프로스티드 글래스(`backdrop-blur-2xl saturate-180`) 헤더 및 플로팅 바, 다크 모드는 Apple Pro Display XDR 스타일의 옵시디언-그래파이트 계층과 상단 스페큘러 하이라이트 적용
- **데이터 시각화**: Catmull-Rom 기반 매끄러운 베지어(Bezier) 그라데이션 스파크라인, 듀얼 그라데이션 영역 차트, macOS 시스템 설정 스타일의 볼륨 점유율 바, 반응형 크리스탈 블루 기여도 히트맵
- **공간 배치**: 이그제큐티브 펄스 히어로 + 다이나믹 아일랜드 스타일 S1 장애 캡슐, 비대칭 12컬럼 벤토 그리드, 프로젝트 카드/테이블 뷰 전환 지원
