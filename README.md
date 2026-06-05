# 세븐록 마사지 (SEVENROCK)

수원 중심 + 전국 시도 출장마사지 안내 정적 사이트입니다.
건전한 웰니스/휴식 관리를 안내하며 의료 행위가 아닙니다.

- 상호: **세븐록 마사지**
- 예약 문의: **0508-202-4743**
- 임시 도메인: `https://sevenrock-massage.pages.dev` (커스텀 도메인 연결 후 교체)

## 빌드 방법

모든 HTML / sitemap / RSS / robots 는 `build-site.mjs` 가 생성합니다.

```bash
node build-site.mjs
```

`styles.css`, `script.js`, `assets/` 는 정적 파일이라 생성 대상이 아닙니다.

## 파일 구조

```text
build-site.mjs                # 생성기 (데이터 + 템플릿)
index.html                    # 메인
styles.css / script.js        # UI / 인터랙션
robots.txt sitemap.xml sitemap1.xml rss.xml
assets/favicon.svg og-image.svg
services/<slug>/index.html    # 서비스 6종
areas/index.html              # 지역 인덱스
areas/<region>/index.html     # 전국 시도 14
areas/gyeonggi/suwon/         # 수원 허브 + 4개 구
```

## 다음 사이트에서 바꿀 값

`build-site.mjs` 상단 상수와 데이터 배열만 수정하면 됩니다.

```js
const siteUrl   = "https://새도메인";
const brand     = "새 상호명";
const phone     = "새 전화번호";
const naverVerify / googleVerify   // 검색엔진 인증 코드
// 데이터: services, regions, suwonDistricts, serviceDetails, mainFaq
```

도메인 변경 시 canonical / og:url / og:image / sitemap / RSS / robots /
구조화 데이터 url 이 모두 `siteUrl` 기준으로 자동 반영됩니다.

## 배포

```text
GitHub main 브랜치 → Cloudflare Pages 자동 배포 → 라이브 반영
```

배포 후 Search Console / Naver Search Advisor 에 sitemap 제출.

## SEO 원칙

- 지역 페이지는 지역명만 바꾼 복붙이 아니라 생활권·이동 변수·출장비 기준·FAQ를 각각 다르게 구성
- 모든 색인 대상 페이지에 고유 title / description / canonical
- 실제 주소가 없어 `LocalBusiness` 대신 `Organization` + `Service` 사용
- 의료 효과·과장 표현 사용 안 함
