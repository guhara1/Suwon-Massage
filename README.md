# 세븐록 마사지 (SEVENROCK) — 수원 출장마사지

수원 전지역(장안·권선·팔달·영통) 방문 마사지 안내 정적 사이트입니다.
건전한 웰니스/휴식 관리를 안내하며 의료 행위가 아닙니다.

- 상호: **세븐록 마사지**
- 예약 문의: **0508-202-4743**
- 임시 도메인: `https://sevenrock-massage.pages.dev` (커스텀 도메인 연결 후 교체)

## 빌드

모든 HTML / sitemap / RSS / robots 는 `build-site.mjs` 가 생성합니다.

```bash
node build-site.mjs
```

`styles.css`, `script.js`, `assets/` 는 정적 파일이라 생성 대상이 아닙니다.

## 메뉴 / URL 구조

```text
홈 (/)
수원출장마사지        /suwon/
코스안내             /course/ , /course/<slug>/ , /course/price/ , /course/guide/
지역별 출장마사지(메가) /suwon/<gu>/ , /suwon/<gu>/<dong>/   ← 구 4 + 동 29
예약안내             /reservation/
이용가이드           /guide/
고객후기             /reviews/ , /reviews/<gu>/
고객센터             /customer/
                    /privacy-policy/
```

- 메가메뉴는 상단에 **구 단위**까지만 노출하고, 그 아래 대표 동을 펼침
- 모든 하위 페이지에 **breadcrumb + BreadcrumbList 구조화 데이터** 적용
- 코스/지역/후기 = 별도 페이지(Service 스키마), 예약·가이드·고객센터 = 단일 허브 + 앵커

## SEO 원칙

- 동 페이지는 지역명만 바꾼 복붙이 아니라 **실제 생활권·랜드마크·고유 FAQ**로 차별화
  - 예: 인계동=나혜석거리/효원공원, 광교동=광교중앙역/경기도청, 매탄동=삼성 수원사업장
- 모든 색인 대상 페이지 고유 title / description / canonical
- 실주소가 없어 `LocalBusiness` 대신 홈은 `WebSite + Organization`, 하위는 `Service`
- 의료 효과·과장 표현 없음, 건전성(성적 서비스 거절·금지행위) 문구 일관 노출
- 키워드 스터핑(같은 표현 반복 나열) 회피

## 데이터 구조

```text
build-site.mjs          # 템플릿·홈·코스·예약·가이드·후기·고객센터·SEO 생성기 + 글자수 검증
data/areas.mjs          # 4개 구 메타데이터(intro·생활권·이동·FAQ) + 후기
data/dongs/<gu>.mjs      # 구별 동 상세 콘텐츠(동마다 고유 생활권·건물·이동·FAQ)
```

각 페이지 본문은 2,000~2,500자(공백 포함)로 작성됐고, `node build-site.mjs` 실행 시
모든 페이지의 본문 글자수를 검증해 2,000자 미만 페이지를 경고로 출력합니다.

## 데이터 수정 위치 (`build-site.mjs` 상단)

```js
const siteUrl  = "https://새도메인";
const brand    = "새 상호명";
const phone    = "새 전화번호";
const naverVerify / googleVerify  // 검색엔진 인증 코드
// 데이터: courses(build-site.mjs), suwonGu(data/areas.mjs + data/dongs/*), reviewsByGu(data/areas.mjs)
```

## 배포

```text
GitHub main → Cloudflare Pages 자동 배포 → 라이브 반영
```

배포 후 Search Console / Naver Search Advisor 에 sitemap 제출.

## IndexNow (빙·네이버 즉시 색인 통보)

새 글/수정 페이지를 Bing·Naver에 즉시 알리는 IndexNow가 설정돼 있습니다.

- **키**: `4f3765781ec57f6460f12aff064f67da`
- **키 파일**: 루트에 `4f3765781ec57f6460f12aff064f67da.txt` (빌드 시 자동 생성, 내용은 키 그대로)
  - 라이브 확인: `https://suwon-massage.pages.dev/4f3765781ec57f6460f12aff064f67da.txt`
- **자동 통보**: `.github/workflows/indexnow.yml` — main 에 페이지가 푸시되면
  Cloudflare 배포(120초 대기) 후 바뀐 페이지 URL을 IndexNow에 자동 제출 (변경분 없으면 sitemap 전체)
- **수동 통보**: `indexnow.mjs`

```bash
node indexnow.mjs                       # sitemap 전체 제출
node indexnow.mjs /course/aroma/        # 특정 페이지만
node indexnow.mjs --dry                 # 전송 없이 대상만 확인
```

제출 엔드포인트: `api.indexnow.org`, `www.bing.com`, `searchadvisor.naver.com`
(IndexNow는 참여 검색엔진끼리 제출을 공유하며, 키 파일이 라이브여야 검증됩니다.)

## 구글 Indexing API (옵션)

구글은 IndexNow 미참여라 별도 통보가 필요합니다. `google-index.mjs` + 워크플로의
"Submit to Google Indexing API" 스텝이 준비돼 있고, **secret 이 있을 때만** 동작합니다(없으면 건너뜀).

> ⚠️ 구글 Indexing API는 공식적으로 JobPosting·BroadcastEvent 전용입니다. 일반 페이지
> 통보는 비공식이라 무시될 수 있습니다. 구글 색인의 정식 경로는 **Search Console 사이트맵 제출**이며,
> 본 기능은 보조 수단입니다.

설정(쓰려는 경우):
1. Google Cloud Console → 프로젝트 생성 → **Indexing API** 사용 설정
2. **서비스 계정** 생성 → JSON 키 다운로드
3. Search Console → 속성 `suwon-massage.pages.dev` → 설정 → 사용자 및 권한 →
   서비스 계정 이메일(`...iam.gserviceaccount.com`)을 **소유자**로 추가
4. GitHub → 저장소 Settings → Secrets and variables → Actions →
   **`GOOGLE_INDEXING_SA`** 에 JSON 키 파일 내용 전체를 붙여넣기
5. 이후 main 푸시 시 IndexNow와 함께 구글에도 자동 통보됩니다.

수동 실행:

```bash
GOOGLE_INDEXING_SA="$(cat service-account.json)" node google-index.mjs        # 전체
GOOGLE_INDEXING_SA="$(cat service-account.json)" node google-index.mjs /course/aroma/
node google-index.mjs --dry                                                   # 대상만 확인
```

> 도메인을 바꾸면 `build-site.mjs`의 `siteUrl`·`indexNowKey`, `indexnow.mjs`의 상수,
> `.github/workflows/indexnow.yml`의 `SITE` 값을 함께 수정하세요.

## 현재 규모

페이지 52개 (홈1 · 수원허브1 · 구4 · 동29 · 코스8 · 예약1 · 가이드1 · 후기5 · 고객센터1 · 개인정보1)
