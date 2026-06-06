#!/usr/bin/env node
/**
 * 세븐록 마사지 / 수원 출장마사지 정적 사이트 생성기 (콘텐츠 확장판)
 * 모든 페이지 본문 2,000~2,500자 목표. 지역 데이터는 ./data/areas.mjs 에서 가져옵니다.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { suwonGu, reviewsByGu } from "./data/areas.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

/* ===================== 1. 기본 값 ===================== */
const siteUrl = "https://suwon-massage.pages.dev";
const brand = "세븐록 마사지";
const brandEn = "SEVENROCK";
const phone = "0508-202-4743";
const telHref = "tel:0508-202-4743";
const smsHref = "sms:0508-202-4743";
const buildDate = "2026-06-06";
const naverVerify = "74c56f85297b96c74d6a4cf2f356e04701ba451c";
const googleVerify = "여기에-구글-인증코드";
const indexNowKey = "4f3765781ec57f6460f12aff064f67da"; // IndexNow API 키 (빙·네이버 즉시 색인)

/* ===================== 2. 코스 데이터 (rich) ===================== */
const courses = [
  {
    slug: "relax", name: "피로 회복 관리", icon: "🌿",
    short: "부드럽고 일정한 압으로 전신 긴장을 풀어주는 기본 휴식 관리.",
    intro: "하루의 긴장으로 몸이 무겁게 느껴질 때 부드럽고 일정한 압으로 전신을 편안하게 풀어주는 휴식 중심 관리입니다.",
    what: "피로 회복 관리는 오일을 사용해 부드럽고 리듬감 있는 동작으로 전신을 고르게 쓸어주는 방식입니다. 강한 자극보다 편안함과 이완에 초점을 두어, 어깨와 등, 다리까지 전신의 긴장을 천천히 가라앉힙니다. 자극이 부담스러운 분이나 처음 방문 관리를 받는 분께 무난하게 권할 수 있는 기본 코스입니다.",
    when: ["하루 종일 긴장이 이어져 몸이 전반적으로 무겁게 느껴질 때", "강한 자극보다 부드러운 휴식이 필요할 때", "마사지를 처음 받아 압 조절이 걱정될 때", "수면 전 편안하게 몸을 이완하고 싶을 때"],
    feat: ["오일을 사용한 부드럽고 연속적인 동작", "전신을 고르게 쓸어주는 리듬감", "컨디션과 선호에 맞춘 단계별 압 조절", "이완과 휴식 중심의 마무리"],
    flow: "먼저 상담을 통해 원하는 압의 세기와 집중하고 싶은 부위를 확인합니다. 이후 가벼운 압으로 전신을 풀어준 뒤 어깨·등·허리·다리 순으로 고르게 관리하고, 마무리 단계에서는 호흡을 가라앉히며 천천히 이완하도록 진행합니다.",
    time: "처음이라면 60분, 전신을 충분히 이완하고 싶다면 90분, 여유로운 휴식에는 120분을 추천합니다.",
    diff: "딥티슈처럼 깊고 단단한 압이 아니라, 부드럽고 일정한 압으로 휴식에 가깝게 진행한다는 점이 다릅니다. 스포츠 관리가 활동 부위 중심이라면 피로 회복 관리는 전신 이완이 목적입니다.",
  },
  {
    slug: "aroma", name: "아로마 관리", icon: "🕯️",
    short: "향과 오일로 호흡을 가라앉히고 편안하게 이완하는 관리.",
    intro: "오일의 향과 부드러운 동작을 함께 사용해 편안한 분위기에서 호흡을 가라앉히며 이완하는 관리입니다.",
    what: "아로마 관리는 향이 있는 오일과 느리고 부드러운 동작을 함께 사용해, 관리받는 분이 편안한 분위기에서 긴장을 내려놓도록 돕는 방식입니다. 강한 자극보다 분위기와 호흡, 전신의 부드러운 이완에 초점을 둡니다. 하루를 마무리하며 차분하게 쉬고 싶을 때 잘 맞는 코스입니다.",
    when: ["하루를 마무리하며 편안하게 쉬고 싶을 때", "긴장으로 호흡이 얕고 답답하게 느껴질 때", "부드러운 분위기 속에서 휴식을 원할 때", "은은한 향과 함께 이완하고 싶을 때"],
    feat: ["향이 있는 오일을 활용한 편안한 분위기", "느리고 부드러운 연속 동작", "호흡을 가라앉히는 진행", "선호하는 향과 압을 반영한 맞춤 관리"],
    flow: "상담에서 선호하는 향의 계열과 압의 세기를 확인합니다. 이후 전신을 부드럽게 쓸어주며 어깨와 목, 등의 긴장을 천천히 풀고, 호흡의 흐름에 맞춰 느린 동작으로 이완을 이어가다가 차분하게 마무리합니다.",
    time: "편안한 이완에는 90분을 권장하며, 짧게는 60분, 여유롭게는 120분도 가능합니다.",
    diff: "피로 회복 관리가 전신 이완 자체에 집중한다면, 아로마 관리는 향을 더해 분위기와 호흡까지 편안하게 만드는 데 가깝습니다. 깊은 압으로 뭉침을 푸는 코스와는 목적이 다릅니다.",
  },
  {
    slug: "sports", name: "스포츠 관리", icon: "🏃",
    short: "활동량이 많은 분의 컨디션을 가다듬는 리듬감 있는 관리.",
    intro: "운동·활동으로 피로가 쌓이기 쉬운 부위를 리듬감 있게 관리해 컨디션을 가다듬는 관리입니다.",
    what: "스포츠 관리는 운동이나 활동으로 피로가 반복되기 쉬운 다리, 어깨, 등 부위를 중심으로 리듬감 있게 관리하는 방식입니다. 부위별로 압을 달리해 활동 후 무거운 느낌을 정돈하고 컨디션을 가다듬는 데 초점을 둡니다. 평소 활동량이 많은 분께 잘 맞습니다.",
    when: ["운동·활동량이 많아 다리·어깨가 무겁게 느껴질 때", "활동 전후 컨디션을 정돈하고 싶을 때", "특정 부위의 피로가 반복될 때", "오래 서 있거나 걷는 일이 많을 때"],
    feat: ["활동으로 피로가 쌓인 부위 중심 관리", "부위별로 달라지는 리듬감 있는 동작", "컨디션에 맞춘 압 조절", "활동 후 무거운 느낌 정돈"],
    flow: "상담에서 주로 사용하는 부위와 피로가 느껴지는 곳을 확인합니다. 이후 해당 부위를 중심으로 가볍게 풀어준 뒤 점차 압을 올려 리듬감 있게 관리하고, 전신 균형을 고려해 마무리합니다.",
    time: "부분 집중은 60분, 전신 컨디션 관리에는 90분, 충분한 관리에는 120분을 추천합니다.",
    diff: "피로 회복 관리가 전신을 부드럽게 이완한다면, 스포츠 관리는 활동 부위의 컨디션 정돈에 더 초점을 둡니다. 깊은 뭉침 해소보다 활동 피로 관리에 가깝습니다.",
  },
  {
    slug: "couple", name: "커플/가족 관리", icon: "👫",
    short: "두 분이 함께 받는 2인 동시 방문 관리.",
    intro: "가족·연인 등 두 분이 같은 공간에서 함께 받을 수 있는 2인 동시 방문 관리입니다. 일정과 인원에 맞춰 안내드립니다.",
    what: "커플/가족 관리는 두 분이 같은 시간, 같은 공간에서 각자 원하는 코스를 동시에 받을 수 있는 방식입니다. 함께 시간을 보내며 편안하게 휴식하고 싶은 분들께 적합하며, 각자의 컨디션과 선호에 맞춰 압과 코스를 따로 선택할 수 있습니다. 기념일이나 가족과의 휴식 시간에 자주 찾는 코스입니다.",
    when: ["둘이 함께 편안한 휴식을 원할 때", "기념일 등 함께하는 시간이 필요할 때", "같은 시간대에 동시 관리를 원할 때", "가족과 함께 휴식을 계획할 때"],
    feat: ["두 분 동시 진행", "각자 원하는 압과 코스를 따로 선택 가능", "함께하는 편안한 분위기", "인원·일정에 맞춘 사전 안내"],
    flow: "예약 시 인원과 각자 원하는 코스를 알려주시면, 방문 공간과 인원에 맞춰 진행 방식을 안내합니다. 두 분이 같은 시간에 각자 상담을 거쳐 동시에 관리를 시작하고 함께 마무리합니다.",
    time: "코스별 60~120분 중 선택 가능하며, 예약 시 인원과 희망 코스를 함께 알려주세요.",
    diff: "1인 코스와 진행 방식은 같지만 두 분이 동시에 받는다는 점이 다릅니다. 더 많은 인원이나 단체는 기업/단체 방문 관리로 안내합니다.",
  },
  {
    slug: "corporate", name: "기업/단체 방문 관리", icon: "🏢",
    short: "사무실·행사장 등으로 방문하는 단체 관리.",
    intro: "사무실, 행사장 등으로 방문해 임직원·참가자의 컨디션 관리를 돕는 단체 방문 관리입니다. 인원과 장소에 맞춰 협의 후 진행합니다.",
    what: "기업/단체 방문 관리는 사무실이나 행사장 등 단체가 모인 장소로 방문해 여러 인원의 컨디션 관리를 돕는 방식입니다. 임직원 복지 프로그램, 행사 부대 서비스 등으로 활용되며, 인원과 시간, 장소 여건에 맞춰 운영 방식을 협의해 진행합니다. 일정 조율이 중요한 코스입니다.",
    when: ["임직원 복지·휴식 프로그램이 필요할 때", "행사·모임에서 단체 컨디션 관리가 필요할 때", "단체 인원이 같은 장소에서 관리를 원할 때", "정해진 일정에 맞춘 방문 운영이 필요할 때"],
    feat: ["인원·시간에 맞춘 운영", "방문 장소 여건 사전 협의", "단체 일정 조율 진행", "상황에 맞춘 코스 구성"],
    flow: "인원, 희망 일정, 방문 장소를 알려주시면 운영 가능 여부와 진행 방식을 협의해 안내합니다. 방문일에는 장소 여건에 맞춰 순차 또는 동시 진행으로 운영합니다.",
    time: "인원과 코스에 따라 달라지며, 사전 협의를 통해 전체 운영 시간을 안내드립니다.",
    diff: "1~2인 코스와 달리 다수 인원을 위한 운영·일정 조율이 포함됩니다. 두 분만의 동시 관리는 커플/가족 관리로 안내합니다.",
  },
];

/* ===================== 3. 공통 헬퍼 ===================== */
function megaCols() {
  return suwonGu.map((g) => `<div class="mega-col">
            <a class="gu-title" href="/suwon/${g.slug}/">${g.name} 출장마사지</a>
            ${g.dongs.map((d) => `<a href="/suwon/${g.slug}/${d.slug}/">${d.name}</a>`).join("\n            ")}
          </div>`).join("\n          ");
}

const navHtml = `
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="${brand} 홈">
      <span class="logo">${brandEn}</span>
    </a>
    <nav class="nav" aria-label="주 메뉴">
      <div class="nav-item"><a href="/">홈</a></div>
      <div class="nav-item">
        <a href="/suwon/">수원출장마사지</a>
        <div class="dropdown">
          <a href="/suwon/#intro">서비스 소개</a>
          <a href="/suwon/#area">출장 가능 지역</a>
          <a href="/suwon/#process">예약 진행 방식</a>
          <a href="/suwon/#check">관리 전 확인사항</a>
          <a href="/suwon/#safety">위생 및 안전 안내</a>
          <a href="/suwon/#faq">자주 묻는 질문</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="/course/">코스안내</a>
        <div class="dropdown">
          <a href="/course/">전체 코스 보기</a>
          ${courses.map((c) => `<a href="/course/${c.slug}/">${c.name}</a>`).join("\n          ")}
          <a href="/course/price/">코스별 가격 안내</a>
          <a href="/course/guide/">코스 선택 가이드</a>
        </div>
      </div>
      <div class="nav-item has-mega">
        <a href="/suwon/#area">지역별 출장마사지</a>
        <div class="dropdown mega">
          ${megaCols()}
        </div>
      </div>
      <div class="nav-item">
        <a href="/reservation/">예약안내</a>
        <div class="dropdown">
          <a href="/reservation/#how">예약 방법</a>
          <a href="/reservation/#time">예약 가능 시간</a>
          <a href="/reservation/#place">방문 가능 장소</a>
          <a href="/reservation/#pay">결제 안내</a>
          <a href="/reservation/#cancel">취소·변경 안내</a>
          <a href="/reservation/#check">예약 전 확인사항</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="/guide/">이용가이드</a>
        <div class="dropdown">
          <a href="/guide/#first">처음 이용하시는 분</a>
          <a href="/guide/#prepare">방문 전 준비사항</a>
          <a href="/guide/#safety">위생 및 안전 안내</a>
          <a href="/guide/#after">관리 후 주의사항</a>
          <a href="/guide/#forbidden">금지행위 안내</a>
          <a href="/guide/#faq">자주 묻는 질문</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="/reviews/">고객후기</a>
        <div class="dropdown">
          <a href="/reviews/">전체 후기</a>
          ${suwonGu.map((g) => `<a href="/reviews/${g.slug}/">${g.name} 후기</a>`).join("\n          ")}
        </div>
      </div>
      <div class="nav-item">
        <a href="/customer/">고객센터</a>
        <div class="dropdown">
          <a href="/customer/#notice">공지사항</a>
          <a href="/customer/#faq">자주 묻는 질문</a>
          <a href="/customer/#contact">1:1 문의</a>
          <a href="/customer/#biz">제휴·기업 문의</a>
          <a href="/privacy-policy/">개인정보처리방침</a>
        </div>
      </div>
    </nav>
    <a class="header-cta" href="${telHref}">전화예약 ${phone}</a>
    <button class="menu-toggle" aria-label="메뉴 열기" aria-expanded="false">☰</button>
  </div>
</header>`;

const stickyCta = `
<div class="sticky-cta">
  <a class="call" href="${telHref}">📞 전화예약</a>
  <a class="sms" href="${smsHref}">💬 문자문의</a>
</div>`;

function footerHtml() {
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        <h4>${brand}</h4>
        <p>수원 전지역 방문 마사지 예약 안내. 건전한 웰니스/휴식 관리를 제공하며, 의료 행위가 아닙니다.</p>
        <p style="margin-top:10px;color:var(--accent);font-weight:700;font-size:16px;">${phone}</p>
      </div>
      <div>
        <h4>바로가기</h4>
        <a href="/suwon/">수원출장마사지</a>
        <a href="/course/">코스안내</a>
        <a href="/reservation/">예약안내</a>
        <a href="/guide/">이용가이드</a>
        <a href="/reviews/">고객후기</a>
        <a href="/customer/">고객센터</a>
      </div>
      <div>
        <h4>지역별 출장마사지</h4>
        ${suwonGu.map((g) => `<a href="/suwon/${g.slug}/">${g.name} 출장마사지</a>`).join("\n        ")}
        <a href="/privacy-policy/">개인정보처리방침</a>
      </div>
    </div>
    <div class="footer-legal">
      <div>상호: ${brand} · 대표 책임자: 고객센터 운영팀 · 고객센터: ${phone}</div>
      <div class="disclaimer">
        본 사이트는 건전한 휴식·웰니스 관리를 안내합니다. 질병의 치료·완치 등 의료 효과를 보장하지 않으며 의료 행위가 아닙니다.
        성적 서비스를 제공하지 않으며, 관련 요청은 정중히 거절합니다. 모든 안내 문구는 고객센터 운영팀이 작성·검수합니다. © ${buildDate.slice(0, 4)} ${brand}.
      </div>
    </div>
  </div>
</footer>`;
}

function layout({ title, description, canonicalPath, jsonLd = [], bodyContent, ogType = "website", isHome = false, noindex = false }) {
  const canonical = siteUrl + canonicalPath;
  const verifyMeta = isHome
    ? `\n  <meta name="naver-site-verification" content="${naverVerify}">\n  <meta name="google-site-verification" content="${googleVerify}">`
    : "";
  const robots = noindex ? "noindex,follow" : "index,follow";
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n  ");
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="${robots}">${verifyMeta}
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="${brand}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}/assets/og-image.svg">
  <meta property="og:locale" content="ko_KR">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="alternate" type="application/rss+xml" title="${brand}" href="/rss.xml">
  <link rel="stylesheet" href="/styles.css">
  ${ld}
</head>
<body>
${navHtml}
${bodyContent}
${footerHtml()}
${stickyCta}
<script src="/script.js" defer></script>
</body>
</html>`;
}

const websiteLd = { "@context": "https://schema.org", "@type": "WebSite", name: brand, url: siteUrl };
const orgLd = {
  "@context": "https://schema.org", "@type": "Organization", name: brand, url: siteUrl, telephone: phone,
  image: `${siteUrl}/assets/og-image.svg`, description: "수원 전지역 방문 마사지 예약 안내. 건전한 웰니스/휴식 관리.",
  contactPoint: { "@type": "ContactPoint", telephone: phone, contactType: "reservations", areaServed: "수원시", availableLanguage: "Korean" },
};
function faqLd(faqs) {
  return { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}
function serviceLd({ name, description, url, areaServed }) {
  const o = { "@context": "https://schema.org", "@type": "Service", serviceType: name, name, description, url,
    provider: { "@type": "Organization", name: brand, telephone: phone, url: siteUrl } };
  if (areaServed) o.areaServed = areaServed;
  return o;
}
function breadcrumbLd(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: siteUrl + it.path })) };
}
function breadcrumbHtml(items) {
  return `<div class="breadcrumb">${items.map((it, i) => (i === items.length - 1 ? it.name : `<a href="${it.path}">${it.name}</a>`)).join(" › ")}</div>`;
}
function faqBlock(faqs) {
  return `
  <div class="faq-list">
    ${faqs.map((f) => `<div class="faq-item">
      <button class="faq-q" aria-expanded="false"><span>${f.q}</span><span class="mark">+</span></button>
      <div class="faq-a"><div>${f.a}</div></div>
    </div>`).join("\n    ")}
  </div>`;
}
function sidebar(extra = "") {
  return `
  <aside class="sidebar">
    <div class="side-card">
      <h4>예약 문의</h4>
      <p class="big-phone">${phone}</p>
      <p style="color:var(--muted);font-size:13px;margin:0;">24시간 예약 상담</p>
      <a class="btn btn-primary" href="${telHref}">📞 전화예약</a>
      <a class="btn btn-ghost" href="${smsHref}">💬 문자문의</a>
      <div class="review-line">작성·검수: 고객센터 운영팀 · 최종 점검 ${buildDate}</div>
    </div>
    ${extra}
  </aside>`;
}
const list = (arr) => `<ul>${arr.map((x) => `<li>${x}</li>`).join("")}</ul>`;

async function writeFile(rel, content) {
  const full = path.join(ROOT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf8");
  return rel;
}

function articlePage({ title, description, canonicalPath, h1, lead, proseHtml, crumbs, jsonLd, sideExtra = "", noindex = false }) {
  canonicalPath = canonicalPath || crumbs[crumbs.length - 1].path;
  const body = `
<main>
  <div class="page-hero">
    <div class="wrap">
      ${breadcrumbHtml(crumbs)}
      <h1>${h1}</h1>
      ${lead ? `<p>${lead}</p>` : ""}
    </div>
  </div>
  <div class="article">
    <div class="wrap article-grid">
      <article class="prose">
        ${proseHtml}
      </article>
      ${sidebar(sideExtra)}
    </div>
  </div>
</main>`;
  return layout({ title, description, canonicalPath, ogType: "article", noindex, jsonLd: [breadcrumbLd(crumbs), ...jsonLd], bodyContent: body });
}

/* ===================== 4. 홈 ===================== */
function buildHome() {
  const body = `
<main>
  <section class="hero">
    <div class="wrap">
      <span class="eyebrow">수원 전지역 방문 마사지</span>
      <h1>집·오피스텔·숙소 어디서나<br><span class="hl">수원 출장마사지</span> 예약 안내</h1>
      <p class="lead">${brand}는 장안·권선·팔달·영통 수원 전 지역으로 방문합니다. 코스·지역·예약 방법·이용 안내를 한 화면에서 확인하세요. 컨디션에 맞춘 압 조절로 건전한 휴식 관리를 제공합니다.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="${telHref}">📞 전화예약 ${phone}</a>
        <a class="btn btn-ghost" href="/suwon/">📍 수원 출장마사지 안내</a>
      </div>
      <div class="hero-meta">
        <span><b>24시간</b> 예약 상담</span>
        <span><b>수원 4개 구</b> 전 지역</span>
        <span><b>1회용품</b> 위생 관리</span>
        <span><b>당일 예약</b> 가능</span>
      </div>
    </div>
  </section>

  <section id="trust">
    <div class="wrap">
      <div class="section-head"><span class="kicker">WELCOME</span><h2>${brand}를 찾아주셔서 감사합니다</h2>
        <p>${brand}는 수원 지역에 특화된 방문 마사지 예약 안내 서비스입니다. 번화가 오피스텔부터 신도시 대단지, 오래된 주거지와 관광 숙소까지 지역마다 다른 생활권과 방문 조건을 고려해, 예약 전에 꼭 확인해야 할 정보를 먼저 안내합니다. 모든 관리는 건전한 휴식·웰니스 범위로만 제공되며 의료 행위가 아닙니다.</p>
      </div>
      <div class="trust-grid">
        <div class="trust-card"><h3>오늘 예약 가능 안내</h3><p>24시간 예약 상담을 받으며, 지역과 시간대에 맞춰 당일 가능한 일정을 안내합니다. 갑작스러운 일정에도 가능한 시간대를 함께 찾아드립니다.</p></div>
        <div class="trust-card"><h3>인기 코스 바로가기</h3><p>피로 회복·아로마·스포츠 관리 등 휴식 중심 코스를 컨디션에 맞춰 안내합니다. 처음이라면 부드러운 코스부터 권해드립니다.</p></div>
        <div class="trust-card"><h3>지역별 출장 가능 안내</h3><p>장안·권선·팔달·영통 구별 생활권과 방문 조건을 페이지에서 확인할 수 있습니다. 동 단위까지 생활권 안내를 제공합니다.</p></div>
      </div>
    </div>
  </section>

  <section id="courses">
    <div class="wrap">
      <div class="section-head"><span class="kicker">COURSE</span><h2>인기 코스 바로가기</h2><p>컨디션과 상황에 맞춰 선택할 수 있는 대표 코스입니다. 각 코스의 자세한 진행 방식과 추천 시간은 코스안내에서 확인하세요.</p></div>
      <div class="card-grid">
        ${courses.map((c) => `<a class="svc-card" href="/course/${c.slug}/"><div class="ico">${c.icon}</div><h3>${c.name}</h3><p>${c.short}</p><span class="more">자세히 보기 →</span></a>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section id="areas">
    <div class="wrap">
      <div class="section-head"><span class="kicker">AREA</span><h2>지역별 출장 가능 안내</h2><p>수원 4개 구 전 지역으로 방문합니다. 구를 선택하면 동별 생활권과 방문 조건, 자주 묻는 질문을 볼 수 있습니다.</p></div>
      <div class="area-grid">
        <a class="area-chip" href="/suwon/">수원 전체<span>대표 안내</span></a>
        ${suwonGu.map((g) => `<a class="area-chip" href="/suwon/${g.slug}/">${g.name}<span>${g.dongs.length}개 동 안내</span></a>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section id="how">
    <div class="wrap">
      <div class="section-head"><span class="kicker">HOW IT WORKS</span><h2>예약문의 바로가기</h2><p>예약부터 마무리까지 절차가 간단합니다. 처음이라도 상담을 통해 편안하게 진행됩니다.</p></div>
      <div class="step-grid">
        <div class="step"><div class="num">1</div><h3>예약 문의</h3><p>전화·문자로 지역, 시간, 코스를 알려주세요.</p></div>
        <div class="step"><div class="num">2</div><h3>일정 확인</h3><p>가능한 시간대와 출장비를 안내드립니다.</p></div>
        <div class="step"><div class="num">3</div><h3>방문 준비</h3><p>공동현관·주차·객실 규정을 미리 확인합니다.</p></div>
        <div class="step"><div class="num">4</div><h3>관리 진행</h3><p>상담 후 컨디션에 맞춘 압으로 진행합니다.</p></div>
        <div class="step"><div class="num">5</div><h3>결제·마무리</h3><p>안내된 방법으로 결제하고 마무리합니다.</p></div>
      </div>
      <div style="margin-top:20px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px;color:var(--muted);font-size:14px;">
        자세한 예약 방법은 <a href="/reservation/" style="color:var(--accent);font-weight:700;">예약안내</a>를, 처음 이용하신다면 <a href="/guide/" style="color:var(--accent);font-weight:700;">이용가이드</a>를, 실제 이용 후기는 <a href="/reviews/" style="color:var(--accent);font-weight:700;">고객후기</a>에서 확인하세요.
      </div>
    </div>
  </section>

  <section id="about">
    <div class="wrap">
      <div class="section-head"><span class="kicker">ABOUT</span><h2>수원 출장마사지, 이렇게 안내합니다</h2></div>
      <div class="prose" style="max-width:820px;">
        <p>${brand}는 수원에 특화된 방문 마사지 예약 안내 서비스입니다. 단순히 지역명만 바꾼 안내가 아니라, 장안·권선·팔달·영통 4개 구와 그 안의 29개 생활권을 각각의 특성에 맞춰 안내합니다. 삼성 사업장과 광교 신도시가 있는 영통, 번화가와 수원화성 관광권이 있는 팔달, 호매실 택지지구와 서수원 주거권의 권선, 광교산 자락 주거지의 장안까지, 지역마다 다른 건물 유형과 이동 변수, 방문 조건을 고려해 예약 전에 필요한 정보를 먼저 안내합니다.</p>
        <p>모든 코스는 매장 방문 없이 자택·오피스텔·숙소 등 원하는 장소에서 받는 방문 관리이며, 도착 후 상담을 거쳐 컨디션에 맞춘 압으로 진행합니다. 피로 회복·아로마·스포츠 관리 같은 1인 코스부터 두 분이 함께 받는 커플/가족 관리, 사무실·행사장으로 방문하는 기업/단체 방문 관리까지 상황에 맞게 선택할 수 있습니다. 모든 관리는 건전한 휴식·웰니스 범위로만 제공되며 의료 행위가 아니고, 성적 서비스를 일절 제공하지 않습니다. 1회용품과 청결한 용품을 사용해 위생을 우선으로 준비합니다.</p>
      </div>
    </div>
  </section>

  <section id="contact">
    <div class="wrap">
      <div class="cta-final">
        <h2>지금 수원 출장마사지를 예약하세요</h2>
        <p>전화 또는 문자로 지역과 희망 시간을 알려주시면 가능한 일정을 빠르게 안내드립니다.</p>
        <div class="cta-row" style="justify-content:center;">
          <a class="btn btn-primary" href="${telHref}">📞 전화예약 ${phone}</a>
          <a class="btn btn-ghost" href="${smsHref}">💬 문자문의</a>
        </div>
      </div>
    </div>
  </section>
</main>`;
  return layout({
    title: `수원 출장마사지 예약 안내 | ${brand}`,
    description: `${brand} 수원 출장마사지 - 장안·권선·팔달·영통 전 지역 방문 마사지 예약 안내. 피로 회복·아로마·스포츠 코스, 24시간 예약 상담 ${phone}.`,
    canonicalPath: "/", isHome: true, jsonLd: [websiteLd, orgLd], bodyContent: body,
  });
}

/* ===================== 5. /suwon/ 대표 ===================== */
function buildSuwonMain() {
  const faqs = [
    { q: "수원 어느 지역까지 방문 가능한가요?", a: "장안구·권선구·팔달구·영통구 등 수원 4개 구 전 지역 방문이 가능합니다. 광교산·서수원 외곽 등 일부 지역은 이동 시간만 추가로 확인한 뒤 안내드립니다." },
    { q: "예약은 어떻게 하나요?", a: `전화(${phone}) 또는 문자로 ① 방문 지역(구·동), ② 희망 시간, ③ 원하는 코스를 알려주시면 가능한 일정과 출장비를 안내드립니다.` },
    { q: "방문 가능한 장소는 어디인가요?", a: "자택, 오피스텔, 호텔·숙소 등에서 가능합니다. 공동현관 출입 방식과 주차, 숙소의 경우 객실 방문 규정을 미리 확인하면 진행이 매끄럽습니다." },
    { q: "위생 관리는 어떻게 하나요?", a: "1회용품과 청결하게 관리된 용품을 사용하며, 방문 시마다 위생을 우선으로 준비합니다." },
    { q: "처음 이용해도 괜찮을까요?", a: "네, 상담을 통해 원하는 압과 집중 부위를 먼저 확인한 뒤 진행하므로 처음이라도 편안하게 받으실 수 있습니다. 부드러운 피로 회복 관리나 아로마 관리부터 권해드립니다." },
  ];
  const prose = `
        <h2 id="intro">수원 출장마사지 서비스 소개</h2>
        <p>${brand}는 수원 장안구, 권선구, 팔달구, 영통구 전 지역으로 방문하는 출장마사지 예약 안내 서비스입니다. 수원은 같은 도시 안에서도 지역마다 성격이 크게 다릅니다. 삼성 사업장과 광교 신도시가 있는 영통, 번화가와 관광지가 모인 팔달, 호매실 택지지구와 서수원 주거권이 넓게 자리한 권선, 광교산 자락의 조용한 주거지가 많은 장안까지, 생활권에 따라 방문 조건과 이동 변수가 달라집니다. 그래서 단순히 지역명만 바꾼 안내가 아니라, 각 구와 동의 실제 생활권에 맞춘 정보를 제공합니다. 모든 관리는 건전한 휴식·웰니스 범위로만 진행되며 의료 행위가 아닙니다.</p>

        <h2 id="area">출장 가능 지역</h2>
        <p>수원 4개 구 전 지역 방문이 가능합니다. 아래에서 구를 선택하면 해당 구에 속한 동별 생활권과 방문 조건, 자주 묻는 질문을 확인할 수 있습니다. 신도시 대단지는 공동현관·방문차량 등록, 번화가 숙소는 객실 방문 규정, 오래된 주거권은 주차 여건을 미리 확인하면 도착이 매끄럽습니다.</p>
        <div class="zone-grid">
          ${suwonGu.map((g) => `<a class="zone-card" href="/suwon/${g.slug}/" style="text-decoration:none;"><h4>${g.name} 출장마사지 →</h4><p>${g.dongs.map((d) => d.name).join(" · ")}</p></a>`).join("\n          ")}
        </div>

        <h2 id="course">이용 가능한 코스</h2>
        <p>피로 회복·아로마·스포츠 관리 등 휴식 중심 코스를 컨디션에 맞춰 선택할 수 있으며, 두 분이 함께 받는 커플/가족 관리와 단체를 위한 기업/단체 방문 관리도 운영합니다. 각 코스의 진행 방식과 추천 시간은 <a href="/course/">코스안내</a>에서 자세히 확인할 수 있습니다.</p>
        ${list(courses.map((c) => `<strong>${c.name}</strong> – ${c.short}`))}

        <h2 id="process">예약 진행 방식</h2>
        <p>예약은 어렵지 않습니다. 아래 순서대로 진행됩니다.</p>
        ${list([
          "전화 또는 문자로 방문 지역(구·동), 희망 시간, 원하는 코스를 알려주세요.",
          "가능한 시간대와 출장비, 도착 예상 시간을 안내드립니다.",
          "방문 장소의 공동현관·주차·객실 방문 규정을 함께 확인합니다.",
          "방문 후 상담을 거쳐 컨디션에 맞춘 압으로 관리를 진행합니다.",
          "관리가 끝나면 사전에 안내된 방법으로 결제하고 마무리합니다.",
        ])}

        <h2 id="check">관리 전 확인사항</h2>
        ${list([
          "샤워 후 편안한 상태에서 받으시면 더 좋습니다.",
          "정확한 주소와 공동현관 출입 방식, 주차 정보를 미리 알려주세요.",
          "아파트 단지라면 방문차량 등록 가능 여부를 확인해 주세요.",
          "건강상 주의가 필요한 부분이 있다면 상담 시 알려주세요.",
        ])}

        <h2 id="safety">위생 및 안전 안내</h2>
        <p>1회용품과 청결하게 관리된 용품을 사용하며, 방문 시마다 위생을 우선으로 준비합니다. ${brand}는 건전한 휴식 관리만 제공하며 성적 서비스를 일절 제공하지 않습니다. 관련 요청 시 관리는 즉시 중단되며 정중히 거절합니다. 관리사에 대한 안전과 상호 존중을 중요하게 생각합니다.</p>

        <h2 id="faq">자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2>예약 문의</h2>
        <p>수원 출장마사지 예약은 전화(${phone}) 또는 문자로 방문 지역과 희망 시간을 알려주시면 가능한 일정을 안내드립니다. 지역별 상세 안내가 필요하시면 위의 구별 페이지에서 동 단위까지 확인하실 수 있습니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "수원출장마사지", path: "/suwon/" }];
  const sideExtra = `<div class="side-card"><h4>구별 안내</h4><div class="side-links">${suwonGu.map((g) => `<a href="/suwon/${g.slug}/">${g.name} 출장마사지</a>`).join("\n      ")}</div></div>`;
  return articlePage({
    title: "수원출장마사지 | 수원 전지역 방문 마사지 예약 안내",
    description: "수원 장안구, 권선구, 팔달구, 영통구 출장마사지 예약 안내 페이지입니다. 코스, 이용시간, 출장 가능 지역, 예약 전 확인사항을 확인해보세요.",
    canonicalPath: "/suwon/", h1: "수원 출장마사지 예약 안내", lead: `${brand}는 수원 장안·권선·팔달·영통 전 지역으로 방문합니다.`,
    proseHtml: prose, crumbs, sideExtra,
    jsonLd: [serviceLd({ name: "수원 출장마사지", description: "수원 전지역 방문 마사지 예약 안내", url: `${siteUrl}/suwon/`, areaServed: "수원시" }), faqLd(faqs)],
  });
}

/* ===================== 6. 구 / 동 ===================== */
function buildGu(g) {
  const prose = `
        <h2>${g.name} 출장마사지 안내</h2>
        <p>${g.intro}</p>
        <p>${g.overview}</p>

        <h2>${g.name} 방문 가능 생활권</h2>
        <p>${g.classify}</p>
        <div class="zone-grid">
          ${g.dongs.map((d) => `<a class="zone-card" href="/suwon/${g.slug}/${d.slug}/" style="text-decoration:none;"><h4>${d.name} →</h4><p>${d.zone}</p></a>`).join("\n          ")}
        </div>

        <h2>${g.name}에서 많이 찾는 코스</h2>
        <p>${g.course} 코스별 진행 방식은 <a href="/course/">코스안내</a>에서 확인하세요.</p>

        <h2>이동·주차 안내</h2>
        <p>${g.access}</p>

        <h2>예약 가능 시간</h2>
        <p>${g.name}은(는) 오전부터 심야까지 시간대를 협의해 안내드립니다. 당일 예약도 가능하며, 원하는 시간대가 있다면 미리 문의하시는 편이 배정이 수월합니다. 번화가·신도시 등 이동 변수가 있는 지역은 도착 예상 시간을 함께 알려드립니다.</p>

        <h2>방문 가능 장소</h2>
        <p>${g.name}에서는 자택, 오피스텔, 호텔·숙소 등에서 받으실 수 있습니다. 아파트·오피스텔은 공동현관 출입 방식과 동·호수, 방문차량 등록 여부를 미리 알려주시면 도착이 매끄럽고, 호텔·숙소는 객실 방문 가능 여부가 숙소 규정에 따라 달라 숙소명을 함께 알려주시면 사전에 확인해 드립니다. ${g.name}은(는) ${g.zoneSummary}</p>

        <h2>예약 전 확인사항</h2>
        ${list([
          "방문 장소(자택·오피스텔·숙소)의 공동현관 출입 방식",
          "주차 가능 여부 또는 인근 주차 안내",
          "아파트 단지의 경우 방문차량 등록 여부",
          "숙소의 경우 객실 방문 가능 여부",
        ])}
        <div class="callout">${g.name} 시내 기본 권역은 동일하게 안내됩니다. 외곽·심야·장거리 이동은 이동 거리와 시간에 따라 출장비가 달라질 수 있어 예약 시 정확히 안내드리며, 숨겨진 비용은 없습니다. ${brand}는 건전한 휴식 관리만 제공합니다.</div>

        <h2>${g.name} 출장마사지 자주 묻는 질문</h2>
        ${faqBlock(g.faq)}

        <h2>예약 문의</h2>
        <p>${g.name} 예약은 전화(${phone}) 또는 문자로 동·건물 정보와 희망 시간을 알려주시면 가능한 일정을 안내드립니다. 더 자세한 지역 안내가 필요하시면 위의 동별 페이지를 확인하세요.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "수원출장마사지", path: "/suwon/" }, { name: `${g.name} 출장마사지`, path: `/suwon/${g.slug}/` }];
  const sideExtra = `
    <div class="side-card"><h4>${g.name} 동별 안내</h4><div class="side-links">${g.dongs.map((d) => `<a href="/suwon/${g.slug}/${d.slug}/">${d.name} 출장마사지</a>`).join("\n      ")}</div></div>
    <div class="side-card"><h4>다른 구</h4><div class="side-links">${suwonGu.filter((x) => x.slug !== g.slug).map((x) => `<a href="/suwon/${x.slug}/">${x.name} 출장마사지</a>`).join("\n      ")}</div></div>`;
  return articlePage({
    title: `${g.name} 출장마사지 | 수원 ${g.name} 방문 마사지 안내`,
    description: `${g.name} 출장마사지 - ${g.dongs.map((d) => d.name).slice(0, 6).join(", ")} 등 ${g.name} 생활권별 방문 조건과 예약 안내. 건전한 휴식 관리, 예약 ${phone}.`.replace(/\s+/g, " "),
    h1: `${g.name} 출장마사지 예약 안내`, lead: g.intro,
    proseHtml: prose, crumbs, sideExtra,
    jsonLd: [serviceLd({ name: `${g.name} 출장마사지`, description: g.intro, url: `${siteUrl}/suwon/${g.slug}/`, areaServed: `수원시 ${g.name}` }), faqLd(g.faq)],
  });
}

function buildDong(g, d) {
  const others = g.dongs.filter((x) => x.slug !== d.slug);
  const prose = `
        <h2>${d.name} 출장마사지 안내</h2>
        <p>${d.intro}</p>
        <p>${brand}는 ${g.name} ${d.name} 전 지역으로 방문하며, 이용 가능 시간과 코스 선택 기준, 예약 전 확인사항을 안내합니다. 같은 ${g.name} 안에서도 ${d.name}만의 생활권 특성에 맞춰 방문 조건을 안내해 드립니다. 방문 마사지가 처음이시더라도 도착 후 상담을 통해 원하는 압과 집중 부위를 확인한 뒤 진행하므로 편안하게 받으실 수 있으며, 모든 관리는 건전한 휴식·웰니스 범위로만 이루어집니다.</p>

        <h2>${d.name} 방문 가능 지역</h2>
        <p>${d.name} 일대의 주요 권역입니다. 자택·오피스텔·숙소 등 방문 장소에 맞춰 출입 동선을 안내드립니다.</p>
        <div class="zone-grid">
          ${d.areas.map((a) => `<div class="zone-card"><h4>${a.n}</h4><p>${a.d}</p></div>`).join("\n          ")}
        </div>

        <h2>${d.name} 생활권 특징</h2>
        <p>${d.life}</p>

        <h2>건물 유형과 방문 안내</h2>
        <p>${d.building}</p>

        <h2>이동·주차·시간대 안내</h2>
        <p>${d.access}</p>

        <h2>${d.name} 추천 코스</h2>
        <p>${d.course} 코스별 자세한 내용은 <a href="/course/">코스안내</a>에서 확인할 수 있습니다.</p>

        <h2>예약 가능 시간</h2>
        <p>${d.name}은(는) 오전부터 심야까지 시간대를 협의해 안내드리며 당일 예약도 가능합니다. 원하는 시간대가 있으면 미리 문의하시는 편이 좋습니다.</p>

        <h2>이용 전 확인사항</h2>
        ${list([
          "정확한 주소와 공동현관 출입 방식을 미리 알려주세요.",
          "주차 가능 여부 또는 인근 주차 안내를 확인합니다.",
          "아파트 단지는 방문차량 등록 여부를 확인합니다.",
          `${brand}는 건전한 휴식 관리만 제공하며 성적 서비스를 제공하지 않습니다.`,
        ])}

        <h2>${d.name}에서 자주 묻는 질문</h2>
        ${faqBlock(d.faqs)}

        <h2>예약문의</h2>
        <p>${g.name} ${d.name} 출장마사지 예약은 전화(${phone}) 또는 문자로 문의해주세요. 인근 ${others.slice(0, 3).map((x) => x.name).join(", ")} 등 ${g.name} 내 다른 지역도 함께 예약하실 수 있습니다.</p>`;
  const crumbs = [
    { name: "홈", path: "/" }, { name: "수원출장마사지", path: "/suwon/" },
    { name: `${g.name} 출장마사지`, path: `/suwon/${g.slug}/` }, { name: `${d.name} 출장마사지`, path: `/suwon/${g.slug}/${d.slug}/` },
  ];
  const sideExtra = `<div class="side-card"><h4>${g.name} 다른 지역</h4><div class="side-links"><a href="/suwon/${g.slug}/">${g.name} 전체</a>${others.map((x) => `\n      <a href="/suwon/${g.slug}/${x.slug}/">${x.name} 출장마사지</a>`).join("")}</div></div>`;
  return articlePage({
    title: `${d.name} 출장마사지 | 수원 ${g.name} ${d.name} 방문 마사지`,
    description: `${d.name} 출장마사지 - ${d.intro}`.replace(/\s+/g, " ").slice(0, 150),
    h1: `${d.name} 출장마사지 예약 안내`, lead: d.intro.slice(0, 120),
    proseHtml: prose, crumbs, sideExtra,
    jsonLd: [serviceLd({ name: `${d.name} 출장마사지`, description: d.intro.slice(0, 200), url: `${siteUrl}/suwon/${g.slug}/${d.slug}/`, areaServed: `수원시 ${g.name} ${d.name}` }), faqLd(d.faqs)],
  });
}

/* ===================== 7. 코스 ===================== */
function buildCourseIndex() {
  const prose = `
        <h2>전체 코스 보기</h2>
        <p>${brand}의 코스는 모두 건전한 휴식·웰니스 관리입니다. 강한 자극부터 부드러운 이완까지 목적이 다르므로, 컨디션과 상황에 맞춰 선택하시면 됩니다. 각 코스는 방문 후 상담을 거쳐 원하는 압과 집중 부위를 반영해 진행합니다.</p>
        <div class="zone-grid">
          ${courses.map((c) => `<a class="zone-card" href="/course/${c.slug}/" style="text-decoration:none;"><h4>${c.icon} ${c.name} →</h4><p>${c.short}</p></a>`).join("\n          ")}
        </div>
        <h2>코스별 특징 한눈에 보기</h2>
        ${list([
          "<strong>피로 회복 관리</strong> – 부드러운 압으로 전신을 고르게 이완하는 기본 휴식 코스. 처음 이용에 적합합니다.",
          "<strong>아로마 관리</strong> – 향이 있는 오일로 분위기와 호흡까지 편안하게 만드는 코스.",
          "<strong>스포츠 관리</strong> – 활동으로 피로가 쌓인 부위를 리듬감 있게 정돈하는 코스.",
          "<strong>커플/가족 관리</strong> – 두 분이 같은 공간에서 동시에 받는 코스.",
          "<strong>기업/단체 방문 관리</strong> – 사무실·행사장 등으로 방문하는 단체 코스.",
        ])}
        <h2>방문 관리란?</h2>
        <p>${brand}의 코스는 모두 매장에 방문하지 않고 자택·오피스텔·숙소 등 원하는 장소에서 받는 방문(출장) 관리입니다. 이동할 필요 없이 편안한 공간에서 받을 수 있어, 퇴근 후 휴식이나 외부 숙소에서의 관리, 가족과 함께하는 시간 등 다양한 상황에서 이용하실 수 있습니다. 수원 장안·권선·팔달·영통 4개 구 전 지역으로 방문하며, 지역별 방문 조건은 <a href="/suwon/">수원출장마사지</a> 페이지에서 확인할 수 있습니다.</p>

        <h2>코스 진행 흐름</h2>
        <p>코스 종류와 관계없이 진행 흐름은 비슷합니다. 예약 시 원하는 코스와 시간을 정하고, 방문 후 간단한 상담을 통해 원하는 압의 세기와 집중하고 싶은 부위를 확인합니다. 이후 코스에 맞춰 관리를 진행하고, 마무리 단계에서 호흡을 가라앉히며 이완하도록 안내합니다. 처음이라 압이 걱정되시면 상담 시 편하게 말씀해주시면 그에 맞춰 조절합니다.</p>

        <h2>코스 선택이 고민된다면</h2>
        <p>어떤 코스가 맞을지 고민된다면 <a href="/course/guide/">코스 선택 가이드</a>에서 상황별 추천을, <a href="/course/price/">코스별 가격 안내</a>에서 시간대별 기준을 확인할 수 있습니다. 처음 방문하신다면 부드러운 피로 회복 관리나 아로마 관리부터 시작하시길 권합니다. 활동이 많아 다리·어깨가 무겁다면 스포츠 관리가, 두 분이 함께라면 커플/가족 관리가 적합합니다. 상담 시 원하는 압을 알려주시면 컨디션에 맞춰 조절해 드립니다.</p>

        <h2>코스 공통 안내</h2>
        <p>모든 코스는 도착 후 상담을 거쳐 원하는 압의 세기와 집중 부위를 확인한 뒤 진행합니다. 코스는 정해진 틀이 아니라 그날의 컨디션에 맞춰 조절되며, 관리 중에도 더 약하게 또는 강하게 요청하실 수 있습니다. 모든 관리는 건전한 휴식·웰니스 범위로만 이루어지며 의료 행위가 아닙니다. 추천 관리 시간과 출장비 등 자세한 기준은 <a href="/course/price/">코스별 가격 안내</a>에서 확인할 수 있습니다.</p>
        ${faqBlock([
          { q: "코스는 언제 정하나요?", a: "예약 시 미리 정하셔도 되고, 방문 후 상담을 통해 정하셔도 됩니다. 고민되면 지역과 시간만 알려주셔도 함께 정해드립니다." },
          { q: "처음인데 어떤 코스가 좋을까요?", a: "강한 자극이 부담되면 피로 회복 관리나 아로마 관리를, 활동 피로가 강하면 스포츠 관리를 추천합니다." },
          { q: "두 명이 함께 받을 수 있나요?", a: "네, 커플/가족 관리로 두 분이 같은 공간에서 동시에 받을 수 있습니다. 예약 시 인원을 알려주세요." },
        ])}

        <h2>예약 안내</h2>
        <p>코스를 정하셨다면 전화(${phone}) 또는 문자로 방문 지역·희망 시간과 함께 원하는 코스를 알려주세요. 아직 정하지 못하셨다면 지역과 대략적인 희망 시간만 알려주셔도 상담을 통해 함께 정해드립니다. 자세한 예약 절차는 <a href="/reservation/">예약안내</a>에서, 처음이라면 <a href="/guide/">이용가이드</a>에서 준비사항을 확인하실 수 있습니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "코스안내", path: "/course/" }];
  const sideExtra = `<div class="side-card"><h4>코스</h4><div class="side-links">${courses.map((c) => `<a href="/course/${c.slug}/">${c.name}</a>`).join("\n    ")}\n    <a href="/course/price/">코스별 가격 안내</a>\n    <a href="/course/guide/">코스 선택 가이드</a></div></div>`;
  return articlePage({
    title: `코스안내 | 수원 출장마사지 코스 | ${brand}`,
    description: `${brand} 코스안내 - 피로 회복·아로마·스포츠·커플/가족·기업 방문 관리. 컨디션에 맞춘 건전한 휴식 코스를 확인하세요. 예약 ${phone}.`,
    h1: "코스안내", lead: "컨디션과 상황에 맞춰 선택할 수 있는 대표 코스입니다.",
    proseHtml: prose, crumbs, sideExtra, jsonLd: [orgLd],
  });
}

function buildCourse(c) {
  const faqs = [
    { q: `${c.name}는 어떤 분께 맞나요?`, a: `${c.when[0]} 등 ${c.intro} 상담을 통해 컨디션에 맞춰 진행하므로 부담 없이 받으실 수 있습니다.` },
    { q: "관리 시간은 얼마나 걸리나요?", a: c.time },
    { q: "압 조절이 가능한가요?", a: "네, 상담 시 원하는 압의 세기와 집중하고 싶은 부위를 알려주시면 컨디션에 맞춰 단계적으로 조절합니다." },
    { q: "수원 어디로 방문 가능한가요?", a: `장안·권선·팔달·영통 수원 4개 구 전 지역으로 방문합니다. 전화(${phone})로 지역과 희망 시간을 알려주세요.` },
    { q: "방문 장소는 어디든 괜찮나요?", a: "자택, 오피스텔, 호텔·숙소 등에서 받으실 수 있습니다. 공동현관 출입 방식과 주차, 숙소의 경우 객실 방문 규정을 미리 확인하면 진행이 매끄럽습니다." },
    { q: "다른 코스로 바꿔서 받아도 되나요?", a: "가능합니다. 그날의 컨디션에 따라 방문 때마다 다른 코스를 선택하셔도 되며, 상담 시 원하는 코스를 알려주시면 됩니다." },
  ];
  const prose = `
        <h2>${c.name}란?</h2>
        <p>${c.intro}</p>
        <p>${c.what}</p>

        <h2>이런 경우에 좋아요</h2>
        ${list(c.when)}

        <h2>${c.name}의 특징</h2>
        ${list(c.feat)}

        <h2>관리 진행 방식</h2>
        <p>${c.flow}</p>

        <h2>추천 관리 시간</h2>
        <p>${c.time} 처음 방문하신다면 짧은 시간으로 시작해 컨디션에 맞춰 다음 방문 시 시간을 늘리는 방법도 좋습니다.</p>

        <h2>다른 코스와의 차이</h2>
        <p>${c.diff} 어떤 코스가 맞을지 고민된다면 <a href="/course/guide/">코스 선택 가이드</a>를 참고하세요.</p>

        <h2>이용 전 준비사항</h2>
        ${list([
          "샤워 후 편안한 상태에서 받으시면 더 좋습니다.",
          "방문 장소의 공동현관·주차 정보를 미리 알려주세요.",
          "건강상 주의가 필요한 부분이 있다면 상담 시 알려주세요.",
          "원하는 압의 세기와 집중 부위를 미리 생각해두면 상담이 빠릅니다.",
        ])}

        <h2>예약 전 확인사항</h2>
        <div class="callout">${c.name}는 건전한 휴식·웰니스 관리이며 의료 행위가 아닙니다. 질병의 치료·완치 효과를 보장하지 않습니다. 예약 시 방문 지역, 희망 시간, 원하는 압을 함께 알려주시면 일정 안내가 빠릅니다.</div>

        <h2>수원 전 지역에서 받는 ${c.name}</h2>
        <p>${c.name}는 매장에 방문하지 않고 자택·오피스텔·숙소 등 원하는 장소에서 편하게 받는 방문 관리입니다. ${brand}는 수원 장안구, 권선구, 팔달구, 영통구 4개 구 전 지역으로 방문하며, 신도시 대단지와 번화가 오피스텔, 구도심 주거권까지 지역에 맞춰 안내합니다. 방문 장소의 공동현관·주차 정보를 미리 알려주시면 도착이 매끄럽습니다. 지역별 방문 조건은 <a href="/suwon/">수원출장마사지</a> 페이지에서 동 단위까지 확인하실 수 있습니다.</p>

        <h2>자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2>예약 문의</h2>
        <p>${c.name} 예약은 전화(${phone}) 또는 문자로 지역과 희망 시간을 알려주시면 안내드립니다. 가격 기준은 <a href="/course/price/">코스별 가격 안내</a>에서, 코스 선택이 고민되면 <a href="/course/guide/">코스 선택 가이드</a>에서 확인하세요.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "코스안내", path: "/course/" }, { name: c.name, path: `/course/${c.slug}/` }];
  const sideExtra = `<div class="side-card"><h4>다른 코스</h4><div class="side-links">${courses.filter((x) => x.slug !== c.slug).map((x) => `<a href="/course/${x.slug}/">${x.name}</a>`).join("\n    ")}\n    <a href="/course/price/">코스별 가격 안내</a></div></div>`;
  return articlePage({
    title: `${c.name} | 수원 출장마사지 코스 | ${brand}`,
    description: `${c.name} - ${c.intro} 수원 전지역 방문 가능, 예약 ${phone}.`.replace(/\s+/g, " ").slice(0, 150),
    h1: `${c.name} 안내`, lead: c.intro,
    proseHtml: prose, crumbs, sideExtra,
    jsonLd: [serviceLd({ name: c.name, description: c.intro, url: `${siteUrl}/course/${c.slug}/`, areaServed: "수원시" }), faqLd(faqs)],
  });
}

function buildCoursePrice() {
  const faqs = [
    { q: "출장비는 따로 있나요?", a: "수원 시내 기본 권역은 동일하게 안내되며, 서수원 외곽·심야·장거리 이동의 경우 이동 거리와 시간에 따라 출장비가 달라질 수 있습니다. 예약 시 정확히 안내드립니다." },
    { q: "결제는 언제 하나요?", a: "관리가 끝난 뒤 사전에 안내된 방법으로 결제합니다. 추가 비용이 있는 경우 예약 단계에서 미리 알려드리며 숨겨진 비용은 없습니다." },
    { q: "코스 시간은 어떻게 정하나요?", a: "처음이라면 60분, 충분한 이완에는 90분, 여유로운 관리에는 120분을 권장합니다. 상담 시 함께 정할 수 있습니다." },
    { q: "왜 가격이 페이지에 표시되지 않나요?", a: "방문 지역과 시간대, 코스 구성에 따라 출장비가 달라질 수 있어, 정확한 금액을 예약 단계에서 안내드립니다. 표시 금액과 실제 금액이 달라지는 일을 막기 위함이며, 추가 비용 없이 안내된 금액으로 진행됩니다." },
    { q: "현장에서 금액이 달라지지 않나요?", a: "달라지지 않습니다. 출장비를 포함한 전체 금액을 예약 시 미리 안내드리므로, 방문 후 예상치 못한 비용이 추가되지 않습니다." },
  ];
  const prose = `
        <h2>코스별 가격 안내</h2>
        <p>${brand}의 요금은 관리 시간을 기준으로 안내됩니다. 코스 종류와 관계없이 시간 단위로 구성되며, 정확한 요금과 출장비는 예약 시 명확하게 안내드립니다. 표시되지 않은 추가 비용이나 숨겨진 비용은 없습니다.</p>
        <div class="price-grid">
          <div class="price-card"><div class="time">60분 코스</div><div class="price">예약 시 안내</div><ul><li>전신 기본 관리</li><li>처음 이용 시 추천</li><li>부담 없는 시간대</li></ul></div>
          <div class="price-card featured"><div class="time">90분 코스</div><div class="price">예약 시 안내</div><ul><li>전신 + 집중 부위</li><li>가장 많이 찾는 코스</li><li>충분한 이완</li></ul></div>
          <div class="price-card"><div class="time">120분 코스</div><div class="price">예약 시 안내</div><ul><li>전신 + 스트레칭/집중</li><li>여유로운 관리</li><li>심화 휴식</li></ul></div>
        </div>
        <p class="price-note">※ 지역·시간대에 따라 추가 출장비가 발생할 수 있으며, 심야·장거리 이동은 예약 시 사전 안내드립니다.</p>

        <h2>시간대별 안내</h2>
        <p>60분은 전신을 한 번 고르게 풀어주는 기본 구성으로, 처음 이용하시거나 짧게 휴식하고 싶을 때 적합합니다. 90분은 전신을 충분히 관리하면서 어깨·허리 등 집중 부위까지 다룰 수 있어 가장 많이 선택하는 시간대입니다. 120분은 전신과 집중 관리, 스트레칭까지 여유롭게 진행해 깊은 휴식을 원할 때 좋습니다. 커플/가족 관리나 기업/단체 방문 관리는 인원과 구성에 따라 시간이 달라지므로 예약 시 안내드립니다.</p>

        <h2>출장비 기준</h2>
        <p>수원 시내 기본 권역은 동일한 기준으로 안내됩니다. 장안구 광교산 인근, 권선구 서수원 외곽, 심야 시간대 등 이동 거리와 시간이 늘어나는 경우에는 출장비가 달라질 수 있습니다. 어떤 경우든 예약 단계에서 출장비를 포함한 전체 금액을 미리 안내해 드리므로, 방문 후 예상치 못한 비용이 추가되지 않습니다.</p>

        <h2>결제 안내</h2>
        <p>결제 방법은 예약 시 안내드리며, 관리가 끝난 뒤 사전에 안내된 방법으로 결제하시면 됩니다. 추가 비용이 있는 경우 예약 단계에서 미리 알려드리므로 결제 시점에 당황하실 일이 없습니다. 금액과 관련해 궁금한 점은 예약 전에 편하게 문의해주세요.</p>

        <h2>코스·인원별 안내</h2>
        <p>피로 회복·아로마·스포츠 관리 등 1인 코스는 위의 시간 기준을 따릅니다. 두 분이 함께 받는 <a href="/course/couple/">커플/가족 관리</a>는 인원에 따라, 사무실·행사장 등으로 방문하는 <a href="/course/corporate/">기업/단체 방문 관리</a>는 인원과 구성에 따라 운영 시간과 금액이 달라지므로 예약 시 별도로 안내드립니다. 어떤 코스든 정확한 금액은 예약 단계에서 명확히 알려드립니다.</p>

        <h2>자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2>가격 안내를 보실 때</h2>
        <p>요금은 코스의 종류가 아니라 관리 시간을 기준으로 구성된다는 점을 참고해주세요. 같은 60분이라도 어떤 코스를 선택하든 시간 기준은 동일하며, 코스에 따라 진행 방식과 집중하는 부위가 달라집니다. 따라서 가격보다 그날의 컨디션과 목적에 맞는 코스와 시간을 먼저 정하고, 그에 맞춰 금액을 안내받는 흐름을 권합니다. 어떤 시간을 고를지 고민된다면 처음에는 60분으로 시작해 보시는 것도 좋은 방법입니다.</p>

        <h2>예약 문의</h2>
        <p>정확한 요금이 궁금하시면 전화(${phone}) 또는 문자로 방문 지역과 희망 코스, 시간을 알려주세요. 코스 선택이 고민된다면 <a href="/course/guide/">코스 선택 가이드</a>를 참고하시면 됩니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "코스안내", path: "/course/" }, { name: "코스별 가격 안내", path: "/course/price/" }];
  return articlePage({
    title: `코스별 가격 안내 | 수원 출장마사지 요금 | ${brand}`,
    description: `수원 출장마사지 코스별 가격 안내 - 60·90·120분 기준과 출장비 안내. 정확한 요금은 예약 시 안내드립니다. 예약 ${phone}.`,
    h1: "코스별 가격 안내", lead: "관리 시간 기준 요금과 출장비 안내입니다.",
    proseHtml: prose, crumbs, jsonLd: [faqLd(faqs)],
  });
}

function buildCourseGuide() {
  const faqs = [
    { q: "처음인데 어떤 코스가 좋을까요?", a: "강한 자극이 부담되면 부드러운 피로 회복 관리나 아로마 관리를, 어깨·다리 활동 피로가 강하면 스포츠 관리를 추천합니다. 상담 시 원하는 압을 알려주시면 조절해 드립니다." },
    { q: "두 명이 함께 받을 수 있나요?", a: "네, 커플/가족 관리로 두 분이 같은 공간에서 동시에 받을 수 있습니다. 각자 원하는 코스를 따로 선택할 수 있으며, 예약 시 인원을 알려주세요." },
    { q: "코스를 바꿔가며 받아도 되나요?", a: "가능합니다. 그날의 컨디션에 따라 방문 때마다 다른 코스를 선택하셔도 됩니다. 상담 시 그날 원하는 코스를 알려주시면 됩니다." },
    { q: "코스마다 압이 많이 다른가요?", a: "코스별로 기본 성격은 다르지만, 압은 상담을 통해 개인에 맞춰 조절합니다. 같은 코스라도 더 부드럽게 또는 더 단단하게 받으실 수 있습니다." },
  ];
  const prose = `
        <h2>코스 선택 가이드</h2>
        <p>${brand}의 코스는 목적이 조금씩 다릅니다. 정답이 정해져 있는 것은 아니며, 그날의 컨디션과 상황에 맞춰 고르면 됩니다. 아래 기준을 참고하시고, 방문 시 상담을 통해 최종적으로 정하셔도 됩니다.</p>

        <h3>휴식과 이완이 목적이라면</h3>
        <p>하루의 긴장을 풀고 편안하게 쉬고 싶다면 <a href="/course/relax/">피로 회복 관리</a>가 무난합니다. 여기에 향과 분위기까지 더해 차분하게 이완하고 싶다면 <a href="/course/aroma/">아로마 관리</a>를 추천합니다. 두 코스 모두 부드러운 압으로 진행되어 처음 이용하시는 분께 적합합니다.</p>

        <h3>활동·운동 피로가 강하다면</h3>
        <p>오래 서 있거나 걷는 일이 많고 다리·어깨가 자주 무겁다면 <a href="/course/sports/">스포츠 관리</a>가 적합합니다. 활동으로 피로가 쌓이기 쉬운 부위를 리듬감 있게 정돈해 컨디션을 가다듬는 데 초점을 둡니다.</p>

        <h3>함께 받고 싶다면</h3>
        <p>연인·가족과 함께 시간을 보내고 싶다면 <a href="/course/couple/">커플/가족 관리</a>로 두 분이 동시에 받을 수 있습니다. 사무실이나 행사 등 단체라면 <a href="/course/corporate/">기업/단체 방문 관리</a>를 통해 인원과 일정에 맞춰 운영합니다.</p>

        <h3>상황별 추천 정리</h3>
        <p>간단히 정리하면, 전반적인 피로와 휴식에는 피로 회복 관리, 차분한 분위기의 이완에는 아로마 관리, 활동·운동 피로에는 스포츠 관리, 함께 받는 시간에는 커플/가족 관리, 단체 방문에는 기업/단체 방문 관리가 적합합니다. 정답이 정해진 것은 아니므로, 그날의 컨디션에 따라 자유롭게 선택하시면 됩니다.</p>

        <h3>방문 관리가 처음이라면</h3>
        <p>매장을 방문하지 않고 집이나 숙소에서 받는 방문 관리가 처음이라 낯설 수 있습니다. 도착 후 간단한 상담을 거쳐 진행하므로 미리 모든 것을 정해두지 않아도 괜찮습니다. 준비사항과 주의사항은 <a href="/guide/">이용가이드</a>에서 확인하실 수 있습니다.</p>

        <h3>차분한 분위기를 원한다면</h3>
        <p>관리 자체뿐 아니라 편안한 분위기 속에서 쉬고 싶다면 향이 있는 <a href="/course/aroma/">아로마 관리</a>가 잘 맞습니다. 느리고 부드러운 동작으로 호흡을 가라앉히며 이완하는 데 초점을 둡니다.</p>

        <h3>시간 선택이 고민된다면</h3>
        <p>처음이라면 60분으로 가볍게 시작해보고, 다음 방문 때 90분이나 120분으로 늘리는 방법을 권합니다. 90분은 전신과 집중 부위를 함께 다룰 수 있어 가장 많이 선택하는 시간대입니다. 시간대별 구성은 <a href="/course/price/">코스별 가격 안내</a>에서 확인할 수 있습니다.</p>

        <h3>압의 세기는 어떻게 정하나요</h3>
        <p>압은 코스보다 상담에서 더 중요하게 정해집니다. 강하게 받고 싶은지, 부드럽게 받고 싶은지 정도만 편하게 말씀해주시면 그에 맞춰 진행하고, 관리 중에도 더 약하게 또는 강하게 조절을 요청하실 수 있습니다. 컨디션은 그날그날 다르므로 방문 시점에 맞춰 정하셔도 됩니다.</p>

        <h2>자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2>코스를 정한 뒤에는</h2>
        <p>코스를 정하셨다면 방문 지역과 희망 시간, 원하는 코스를 알려주시면 됩니다. 정하지 못하셨더라도 괜찮습니다. 그날의 컨디션과 원하는 정도를 상담에서 함께 확인해 가장 잘 맞는 코스로 진행할 수 있습니다. 코스는 한 번 정하면 고정되는 것이 아니라 방문 때마다 자유롭게 바꿀 수 있으니 부담 없이 시작하셔도 됩니다.</p>

        <h2>예약 문의</h2>
        <p>코스가 정해졌거나 상담을 통해 정하고 싶으시면 전화(${phone}) 또는 문자로 편하게 문의해주세요.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "코스안내", path: "/course/" }, { name: "코스 선택 가이드", path: "/course/guide/" }];
  return articlePage({
    title: `코스 선택 가이드 | 수원 출장마사지 | ${brand}`,
    description: `수원 출장마사지 코스 선택 가이드 - 휴식·활동 피로·동시 관리 등 상황별 추천 코스를 안내합니다. 예약 ${phone}.`,
    h1: "코스 선택 가이드", lead: "상황과 컨디션에 맞는 코스를 고르는 기준입니다.",
    proseHtml: prose, crumbs, jsonLd: [faqLd(faqs)],
  });
}

/* ===================== 8. 예약안내 ===================== */
function buildReservation() {
  const faqs = [
    { q: "예약은 얼마나 미리 해야 하나요?", a: "당일 예약도 가능하지만, 원하는 시간대가 정해져 있다면 미리 문의하시는 편이 배정이 수월합니다. 주말·심야 등 문의가 몰리는 시간대는 여유 있게 예약하시길 권합니다." },
    { q: "예약을 변경하거나 취소할 수 있나요?", a: "가능합니다. 일정 변경이 필요하면 가급적 빨리 연락 주시면 조정을 도와드립니다. 방문 직전 변경은 일정 조율이 어려울 수 있으니 미리 알려주세요." },
    { q: "문자로만 예약해도 되나요?", a: "네, 문자로도 예약하실 수 있습니다. 방문 지역, 희망 시간, 원하는 코스를 적어 보내주시면 확인 후 가능한 일정을 회신드립니다." },
    { q: "예약 시 무엇을 먼저 정해야 하나요?", a: "방문 지역과 대략적인 희망 시간만 정해도 충분합니다. 코스와 압의 세기는 방문 후 상담을 통해 함께 정하셔도 되므로 부담 없이 문의해주세요." },
  ];
  const prose = `
        <h2 id="how">예약 방법</h2>
        <p>예약은 전화 또는 문자로 간단하게 진행됩니다. 전화(${phone}) 또는 문자로 ① 방문 지역(구·동), ② 희망 시간, ③ 원하는 코스, 이 세 가지를 알려주시면 가능한 일정과 출장비, 도착 예상 시간을 안내드립니다. 처음이라 무엇을 말해야 할지 모르겠다면, 지역과 대략적인 희망 시간만 알려주셔도 상담을 통해 함께 정해드립니다.</p>

        <h2 id="time">예약 가능 시간</h2>
        <p>오전부터 심야까지 시간대를 협의해 안내드립니다. 24시간 예약 상담을 받고 있으며, 당일 예약도 가능합니다. 다만 번화가나 신도시처럼 이동 변수가 있는 지역은 도착 예상 시간을 함께 안내드리며, 문의가 몰리는 주말·심야에는 원하는 시간대가 빨리 마감될 수 있어 여유 있게 문의하시길 권합니다.</p>

        <h2 id="place">방문 가능 장소</h2>
        <p>자택, 오피스텔, 호텔·숙소 등에서 받으실 수 있습니다. 아파트·오피스텔은 공동현관 출입 방식과 동·호수, 방문차량 등록 여부를 미리 알려주시면 도착이 매끄럽습니다. 호텔·숙소는 객실 방문 가능 여부가 숙소 규정에 따라 다르므로 숙소명을 함께 알려주시면 사전에 확인해 드립니다.</p>

        <h2 id="pay">결제 안내</h2>
        <p>결제 방법은 예약 시 안내드리며, 추가 출장비가 있는 경우 예약 단계에서 미리 명확히 알려드립니다. 방문 후 예상치 못한 비용이 추가되는 일은 없으며, 숨겨진 비용 없이 사전에 안내된 금액으로 진행됩니다.</p>

        <h2 id="cancel">취소·변경 안내</h2>
        <p>일정 변경이나 취소는 가급적 빨리 연락 주시면 조정을 도와드립니다. 방문이 임박한 시점의 변경은 관리사 일정 조율이 어려울 수 있으므로, 일정이 바뀔 가능성이 있다면 미리 알려주시면 감사하겠습니다.</p>

        <h2 id="check">예약 전 확인사항</h2>
        ${list([
          "정확한 주소와 공동현관 출입 방식을 준비해주세요.",
          "주차 가능 여부 또는 인근 주차 안내를 확인해주세요.",
          "원하는 코스와 압의 세기를 미리 생각해두면 상담이 빠릅니다.",
          "건강상 주의가 필요한 부분이 있다면 미리 알려주세요.",
        ])}
        <div class="callout">${brand}는 건전한 휴식·웰니스 관리만 제공하며 성적 서비스를 일절 제공하지 않습니다. 관련 요청은 정중히 거절하며, 관리사의 안전과 상호 존중을 중요하게 생각합니다.</div>

        <h2>예약 시 알려주시면 좋은 정보</h2>
        <p>예약 상담을 빠르게 진행하기 위해 다음 정보를 함께 알려주시면 도움이 됩니다. 방문할 지역(구·동)과 건물 형태(아파트·오피스텔·숙소), 희망하는 방문 시간, 원하는 코스와 대략적인 압의 세기입니다. 모두 정하지 않으셨더라도 괜찮습니다. 지역과 시간만 알려주셔도 상담을 통해 함께 정해드립니다.</p>

        <h2>방문 후 진행 안내</h2>
        <p>예약하신 시간에 맞춰 방문하면, 먼저 간단한 상담으로 원하는 압과 집중 부위, 주의가 필요한 부분을 확인합니다. 이후 선택하신 코스로 관리를 진행하고, 마무리 단계에서 천천히 이완하도록 안내합니다. 관리 중 더 약하게 또는 강하게 받고 싶으시면 언제든 말씀해주세요. 관리가 끝나면 사전에 안내된 방법으로 결제하고 마무리합니다.</p>

        <h2>자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2>예약 문의</h2>
        <p>예약은 전화(${phone}) 또는 문자로 문의해주세요. 처음 이용하신다면 <a href="/guide/">이용가이드</a>를, 코스 선택이 고민되면 <a href="/course/guide/">코스 선택 가이드</a>를 함께 확인하시면 도움이 됩니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "예약안내", path: "/reservation/" }];
  return articlePage({
    title: `예약안내 | 수원 출장마사지 예약 방법 | ${brand}`,
    description: `수원 출장마사지 예약안내 - 예약 방법, 예약 가능 시간, 방문 가능 장소, 결제·취소 안내. 24시간 예약 상담 ${phone}.`,
    h1: "예약안내", lead: "예약 방법부터 결제·취소까지 한 번에 확인하세요.",
    proseHtml: prose, crumbs, jsonLd: [faqLd(faqs)],
  });
}

/* ===================== 9. 이용가이드 ===================== */
function buildGuide() {
  const faqs = [
    { q: "처음이라 긴장되는데 괜찮을까요?", a: "상담을 통해 원하는 압과 집중 부위를 먼저 확인한 뒤 진행하니 편안하게 받으시면 됩니다. 부드러운 피로 회복 관리나 아로마 관리부터 시작하시길 권합니다." },
    { q: "관리 후 주의할 점이 있나요?", a: "수분을 충분히 섭취하고, 무리한 활동은 피한 채 충분히 쉬는 것이 좋습니다. 관리 직후 바로 격한 운동이나 음주는 권하지 않습니다." },
    { q: "건강 상태를 미리 말해야 하나요?", a: "네, 통증이 있거나 주의가 필요한 부위, 임신 등 컨디션에 영향을 줄 수 있는 부분은 상담 시 미리 알려주시면 그에 맞춰 진행합니다." },
    { q: "관리 중에 압을 바꿀 수 있나요?", a: "가능합니다. 관리 중 더 약하게 또는 강하게 받고 싶으시면 언제든 말씀해주세요. 그 자리에서 바로 조절해 드립니다." },
  ];
  const prose = `
        <h2 id="first">처음 이용하시는 분</h2>
        <p>출장마사지가 처음이라면 어떤 코스를 골라야 할지, 무엇을 준비해야 할지 막막할 수 있습니다. 처음이라면 부드러운 압으로 진행되는 <a href="/course/relax/">피로 회복 관리</a>나 <a href="/course/aroma/">아로마 관리</a>로 시작하시길 추천합니다. 방문 후 상담을 통해 원하는 압과 집중하고 싶은 부위를 확인하므로, 미리 모든 것을 정해두지 않아도 괜찮습니다. 강하거나 약하게 받고 싶은 정도만 편하게 말씀해주시면 그에 맞춰 조절합니다.</p>
        <p>방문 관리는 매장을 찾아갈 필요 없이 익숙한 공간에서 편안하게 받을 수 있다는 점이 가장 큰 장점입니다. 예약한 시간에 맞춰 방문하므로 대기 시간이 거의 없고, 관리 후에는 이동 없이 바로 휴식을 이어갈 수 있습니다. 자택, 오피스텔, 머무는 숙소 등 편한 장소를 알려주시면 그에 맞춰 안내해 드립니다.</p>

        <h2 id="prepare">방문 전 준비사항</h2>
        ${list([
          "샤워 후 편안한 상태에서 받으시면 더 좋습니다.",
          "방문 장소의 공동현관 출입 방식과 주차 정보를 준비해주세요.",
          "아파트 단지라면 방문차량 등록 가능 여부를 확인해주세요.",
          "건강상 주의가 필요한 부분이 있다면 미리 알려주세요.",
          "편안하게 받을 수 있는 공간을 미리 정리해두시면 좋습니다.",
        ])}

        <h2 id="safety">위생 및 안전 안내</h2>
        <p>${brand}는 1회용품과 청결하게 관리된 용품을 사용하며, 방문 시마다 위생을 우선으로 준비합니다. 사용하는 오일과 용품은 위생적으로 보관·관리되며, 관리받는 분과 관리사 모두의 안전을 위해 기본 수칙을 지킵니다. 위생과 관련해 궁금한 점이 있다면 예약 시 문의해주세요.</p>

        <h2 id="after">관리 후 주의사항</h2>
        <p>관리 후에는 수분을 충분히 섭취하고, 무리한 활동을 피하며 충분히 쉬는 것이 좋습니다. 관리 직후 바로 격한 운동이나 음주는 권하지 않으며, 몸을 따뜻하게 유지하면 이완된 상태를 더 오래 느낄 수 있습니다. 혹시 관리 중이나 후에 불편한 점이 있었다면 알려주시면 다음 방문 시 참고해 진행합니다.</p>

        <h2>관리받기 좋은 환경</h2>
        <p>방문 관리는 편안한 공간에서 받을 때 더 좋습니다. 관리를 받을 공간을 미리 가볍게 정리해두시고, 너무 춥거나 덥지 않도록 실내 온도를 맞춰두시면 편안하게 받으실 수 있습니다. 휴대전화 알림을 잠시 꺼두고 조용한 환경을 만들면 이완에 도움이 됩니다. 반려동물이 있는 경우 미리 알려주시면 진행에 참고합니다.</p>

        <h2 id="forbidden">금지행위 안내</h2>
        <div class="callout">${brand}는 건전한 휴식·웰니스 관리만 제공합니다. 성적 서비스 및 불법적 요청은 일절 제공하지 않으며, 관련 요청이 있을 경우 관리는 즉시 중단되고 비용 환불 없이 정중히 거절합니다. 관리사에 대한 부적절한 언행, 신체적 접촉 요구, 위협 행위 등도 엄격히 금지됩니다. 서로를 존중하는 환경에서 건전한 관리가 이루어지도록 협조 부탁드립니다.</div>

        <h2>건강 상태 안내</h2>
        <p>관리 전 상담에서 통증이 있는 부위나 최근 다친 곳, 수술 이력, 임신 여부 등 컨디션에 영향을 줄 수 있는 부분은 미리 알려주세요. 음주 상태이거나 몸 상태가 좋지 않을 때는 관리를 권하지 않습니다. 마사지는 의료 행위가 아니므로, 치료가 필요한 증상이 있다면 전문 의료기관의 진료를 먼저 받으시길 권합니다. 안전하고 편안한 관리를 위해 솔직하게 알려주시면 그에 맞춰 진행합니다.</p>

        <h2 id="faq">자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2>예약 문의</h2>
        <p>이용 방법에 대해 더 궁금한 점이 있으면 전화(${phone}) 또는 문자로 문의해주세요. 예약 절차는 <a href="/reservation/">예약안내</a>에서 확인하실 수 있습니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "이용가이드", path: "/guide/" }];
  return articlePage({
    title: `이용가이드 | 수원 출장마사지 이용 안내 | ${brand}`,
    description: `수원 출장마사지 이용가이드 - 처음 이용, 방문 전 준비, 위생·안전, 관리 후 주의, 금지행위 안내. 예약 ${phone}.`,
    h1: "이용가이드", lead: "처음 이용하시는 분을 위한 안내와 주의사항입니다.",
    proseHtml: prose, crumbs, jsonLd: [faqLd(faqs)],
  });
}

/* ===================== 10. 고객후기 ===================== */
function reviewCards(arr) {
  return `<div class="review-grid">${arr.map((r) => `<div class="review-card"><div class="stars">${"★".repeat(r.s)}${"☆".repeat(5 - r.s)}</div><p>${r.t}</p><div class="meta">${r.m}</div></div>`).join("")}</div>`;
}
function buildReviewsIndex() {
  const all = Object.entries(reviewsByGu).flatMap(([gu, arr]) => arr.map((r) => ({ ...r, gu })));
  const prose = `
        <h2>전체 후기</h2>
        <p>${brand}를 이용해주신 고객님들이 남겨주신 대표 후기입니다. 후기는 실제 이용 경험을 바탕으로 작성되며, 지역과 코스에 따라 느낀 점이 다를 수 있습니다. 아래 후기는 장안·권선·팔달·영통 각 지역에서 받은 의견을 모은 것입니다.</p>
        ${reviewCards(all)}

        <h2>지역별 후기 보기</h2>
        <p>구별로 자주 받는 후기와 이용 특징이 조금씩 다릅니다. 아래에서 각 구의 후기를 확인할 수 있습니다.</p>
        ${list(suwonGu.map((g) => `<a href="/reviews/${g.slug}/">${g.name} 후기</a> – ${g.name} 지역 이용 후기`))}

        <h2>어떤 점을 후기로 남기면 좋을까요</h2>
        <p>다른 고객님께 도움이 되는 후기는 구체적일수록 좋습니다. 예약과 도착 시간이 잘 지켜졌는지, 상담을 통해 원하는 압으로 받았는지, 위생 용품을 잘 사용했는지, 전반적인 분위기는 어땠는지 등을 적어주시면 처음 이용하시는 분께 큰 참고가 됩니다.</p>

        <h2>후기를 참고하실 때</h2>
        <p>후기는 개인의 경험과 그날의 컨디션에 따라 느낌이 다를 수 있다는 점을 참고해주세요. 같은 코스라도 원하는 압과 집중 부위에 따라 만족도가 달라지므로, 후기를 절대적인 기준으로 보기보다 전반적인 분위기와 진행 방식을 참고하시는 것이 좋습니다. ${brand}는 과장되거나 사실과 다른 후기를 지양하며, 실제 이용 경험에 기반한 솔직한 의견을 소중하게 생각합니다.</p>

        <h2>지역별 이용 안내</h2>
        <p>수원은 지역마다 생활권과 방문 조건이 다릅니다. 번화가가 많은 팔달구, 신도시와 사업장이 있는 영통구, 넓은 주거권의 권선구, 광교산 자락의 장안구까지 각 구의 특성에 맞춘 안내는 <a href="/suwon/">수원출장마사지</a> 페이지에서 동 단위까지 확인하실 수 있습니다.</p>

        <h2>후기 작성 안내</h2>
        <p>관리를 받으신 후 솔직한 후기를 남겨주시면 서비스 개선에 큰 도움이 됩니다. 후기는 실제 이용 경험을 바탕으로 작성해주시고, 과장되거나 사실과 다른 내용은 피해주세요. ${brand}는 후기를 바탕으로 부족한 점을 보완하고 더 나은 안내를 제공하기 위해 노력합니다.</p>

        <h2>예약 문의</h2>
        <p>후기를 보고 예약을 원하시면 전화(${phone}) 또는 문자로 지역과 희망 시간을 알려주세요. 지역별 상세 안내는 <a href="/suwon/">수원출장마사지</a> 페이지에서, 코스 안내는 <a href="/course/">코스안내</a>에서, 처음 이용 시 준비사항은 <a href="/guide/">이용가이드</a>에서 확인하실 수 있습니다. ${brand}는 후기를 통해 받은 의견을 바탕으로 더 나은 안내와 서비스를 제공하기 위해 꾸준히 노력하겠습니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "고객후기", path: "/reviews/" }];
  const sideExtra = `<div class="side-card"><h4>구별 후기</h4><div class="side-links">${suwonGu.map((g) => `<a href="/reviews/${g.slug}/">${g.name} 후기</a>`).join("\n    ")}</div></div>`;
  return articlePage({
    title: `고객후기 | 수원 출장마사지 이용 후기 | ${brand}`,
    description: `${brand} 수원 출장마사지 고객후기 - 장안·권선·팔달·영통 구별 이용 후기를 확인하세요. 예약 ${phone}.`,
    h1: "고객후기", lead: "실제 이용 고객님이 남겨주신 대표 후기입니다.",
    proseHtml: prose, crumbs, sideExtra, jsonLd: [orgLd],
  });
}
function buildReviewsGu(g) {
  const arr = reviewsByGu[g.slug] || [];
  const prose = `
        <h2>${g.name} 후기</h2>
        <p>수원 ${g.name} 지역에서 ${brand}를 이용해주신 고객님의 후기입니다. ${g.name}은(는) ${g.zoneSummary} 이러한 생활권 특성에 따라 방문 조건과 자주 받는 코스가 조금씩 다릅니다.</p>
        ${reviewCards(arr)}

        <h2>${g.name} 이용 특징</h2>
        <p>${g.reviewNote}</p>
        <p>${g.overview}</p>

        <h2>${g.name}에서 자주 찾는 코스</h2>
        <p>${g.course} 코스에 대한 자세한 내용은 <a href="/course/">코스안내</a>에서 확인할 수 있습니다. 처음 이용하시는 분은 부드러운 피로 회복 관리나 아로마 관리부터 시작하시길 권하며, 방문 후 상담을 통해 원하는 압과 집중 부위를 맞춰 진행합니다.</p>

        <h2>${g.name} 지역 안내</h2>
        <p>${g.name}의 동별 방문 조건과 생활권 안내는 아래 페이지에서 확인할 수 있습니다. 각 동마다 주요 권역과 건물 유형, 이동·주차 변수가 달라 방문 전 참고하시면 좋습니다.</p>
        ${list(g.dongs.map((d) => `<a href="/suwon/${g.slug}/${d.slug}/">${d.name} 출장마사지</a> – ${d.zone}`))}

        <h2>${g.name} 출장마사지 자주 묻는 질문</h2>
        ${faqBlock(g.faq)}

        <h2>${g.name} 방문 전 참고사항</h2>
        <p>${g.name}에서 처음 방문 관리를 받으신다면, 정확한 주소와 공동현관 출입 방식, 주차 또는 인근 주차 안내를 미리 준비해주시면 도착이 매끄럽습니다. 아파트 단지는 방문차량 등록 여부를, 숙소는 객실 방문 가능 여부를 확인합니다. 도착 후 상담을 통해 원하는 압과 집중 부위를 정한 뒤 진행하므로 처음이라도 편안하게 받으실 수 있습니다.</p>

        <h2>후기 작성 안내</h2>
        <p>${g.name}에서 관리를 받으신 후 솔직한 후기를 남겨주시면 같은 지역을 이용하실 다른 고객님께 도움이 됩니다. 실제 경험을 바탕으로 예약·도착 시간, 상담과 압 조절, 위생, 전반적인 분위기 등을 구체적으로 적어주시면 더욱 좋습니다. ${brand}는 후기를 바탕으로 부족한 점을 보완해 나갑니다.</p>

        <h2>${g.name} 출장마사지 예약</h2>
        <p>${g.name} 예약은 전화(${phone}) 또는 문자로 동·건물 정보와 희망 시간을 알려주시면 안내드립니다. 동 단위 상세 안내는 <a href="/suwon/${g.slug}/">${g.name} 출장마사지</a> 페이지를, 예약 절차는 <a href="/reservation/">예약안내</a>를 참고하세요.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "고객후기", path: "/reviews/" }, { name: `${g.name} 후기`, path: `/reviews/${g.slug}/` }];
  const sideExtra = `<div class="side-card"><h4>다른 구 후기</h4><div class="side-links"><a href="/reviews/">전체 후기</a>${suwonGu.filter((x) => x.slug !== g.slug).map((x) => `\n    <a href="/reviews/${x.slug}/">${x.name} 후기</a>`).join("")}</div></div>`;
  return articlePage({
    title: `${g.name} 후기 | 수원 ${g.name} 출장마사지 후기 | ${brand}`,
    description: `수원 ${g.name} 출장마사지 고객후기 - ${g.name} 지역 이용 후기와 이용 특징을 확인하세요. 예약 ${phone}.`,
    h1: `${g.name} 출장마사지 후기`, lead: `${g.name} 지역 이용 후기입니다.`,
    proseHtml: prose, crumbs, sideExtra, jsonLd: [orgLd],
  });
}

/* ===================== 11. 고객센터 / 개인정보 ===================== */
function buildCustomer() {
  const faqs = [
    { q: "상담은 어떻게 하나요?", a: `전화(${phone}) 또는 문자로 문의해주시면 안내드립니다. 24시간 예약 상담을 받고 있으며, 문의가 몰릴 경우 순차적으로 회신드립니다.` },
    { q: "제휴·기업 문의도 가능한가요?", a: "가능합니다. 기업/단체 방문 관리는 인원과 장소, 희망 일정을 알려주시면 운영 가능 여부를 협의해 안내드립니다." },
    { q: "예약을 변경하고 싶어요.", a: "전화나 문자로 가급적 빨리 연락 주시면 일정 조정을 도와드립니다. 자세한 내용은 예약안내 페이지의 취소·변경 안내를 참고하세요." },
  ];
  const prose = `
        <h2 id="notice">공지사항</h2>
        <p>운영 시간 및 안내 변경 사항은 본 페이지를 통해 공지합니다. 현재 ${brand}는 24시간 예약 상담을 운영하고 있으며, 수원 장안·권선·팔달·영통 4개 구 전 지역으로 방문하고 있습니다. 명절 등 특정 기간에는 운영 시간이 조정될 수 있으며, 변경 사항이 있을 경우 사전에 안내드립니다.</p>
        <p>예약 문의가 몰리는 주말과 심야 시간대에는 답변이 다소 지연될 수 있습니다. 원하시는 시간대가 정해져 있다면 여유 있게 미리 문의해주시면 배정에 도움이 됩니다. 갑작스러운 일정에도 가능한 시간을 함께 찾아드리니 편하게 문의해주세요.</p>

        <h2 id="faq">자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2 id="contact">1:1 문의</h2>
        <p>예약·이용과 관련한 문의는 전화(${phone}) 또는 문자로 남겨주시면 순차적으로 안내드립니다. 문의 시 방문 지역, 희망 시간, 궁금한 내용을 함께 적어주시면 더 빠르고 정확하게 답변드릴 수 있습니다. 후기나 서비스 개선 의견도 환영합니다.</p>
        <p>자주 문의 주시는 내용으로는 방문 가능 지역, 코스 종류와 시간, 출장비, 예약 가능 시간대, 위생 관리 방법 등이 있습니다. 이러한 내용은 각 안내 페이지에 자세히 정리되어 있으니 함께 참고하시면 도움이 됩니다. 페이지에서 찾기 어려운 내용은 직접 문의해주시면 안내드립니다.</p>

        <h2>운영 안내</h2>
        <p>${brand}는 수원 지역을 중심으로 방문 마사지 예약을 안내하며, 건전한 휴식·웰니스 관리만 제공합니다. 의료 행위가 아니며 질병의 치료·완치 효과를 보장하지 않습니다. 또한 성적 서비스를 일절 제공하지 않으며 관련 요청은 정중히 거절합니다. 서로를 존중하는 환경에서 편안한 관리가 이루어질 수 있도록 협조 부탁드립니다.</p>

        <h2 id="biz">제휴·기업 문의</h2>
        <p>기업 임직원 복지 프로그램, 행사 부대 서비스 등 단체 방문 관리와 제휴에 관한 문의는 인원, 장소, 희망 일정을 함께 알려주시면 운영 가능 여부를 협의해 안내드립니다. 자세한 내용은 <a href="/course/corporate/">기업/단체 방문 관리</a> 페이지에서 확인할 수 있습니다.</p>

        <h2>방문 가능 지역 안내</h2>
        <p>${brand}는 수원 4개 구 전 지역으로 방문합니다. 구별 생활권과 동 단위 방문 조건은 아래 페이지에서 확인하실 수 있습니다.</p>
        ${list(suwonGu.map((g) => `<a href="/suwon/${g.slug}/">${g.name} 출장마사지</a> – ${g.zoneSummary}`))}

        <h2>이용 관련 안내</h2>
        <p>처음 이용하시는 분은 <a href="/guide/">이용가이드</a>에서 준비사항과 주의사항을, 예약 절차는 <a href="/reservation/">예약안내</a>에서, 코스 선택은 <a href="/course/guide/">코스 선택 가이드</a>에서, 코스별 시간과 출장비 기준은 <a href="/course/price/">코스별 가격 안내</a>에서 확인하실 수 있습니다. 지역별 방문 조건은 <a href="/suwon/">수원출장마사지</a> 페이지에서 구·동 단위로 안내하고 있으며, 실제 이용 후기는 <a href="/reviews/">고객후기</a>에서 보실 수 있습니다.</p>

        <h2>고객센터 이용 안내</h2>
        <p>고객센터는 예약·이용 문의와 함께 제휴, 후기, 서비스 개선 의견을 받고 있습니다. 빠른 안내를 위해 문의 시 방문 지역과 희망 시간, 궁금한 내용을 함께 알려주시면 도움이 됩니다. 통화 연결이 어려운 경우 문자로 남겨주시면 확인 후 순차적으로 회신드립니다.</p>

        <h2>개인정보처리방침</h2>
        <p>개인정보의 수집·이용에 관한 자세한 내용은 <a href="/privacy-policy/">개인정보처리방침</a>에서 확인할 수 있습니다. ${brand}는 예약에 필요한 최소한의 정보만 수집하며 안전하게 관리합니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "고객센터", path: "/customer/" }];
  return articlePage({
    title: `고객센터 | 수원 출장마사지 문의 | ${brand}`,
    description: `${brand} 고객센터 - 공지사항, 자주 묻는 질문, 1:1 문의, 제휴·기업 문의 안내. 24시간 예약 상담 ${phone}.`,
    h1: "고객센터", lead: "문의와 안내를 한 곳에서 확인하세요.",
    proseHtml: prose, crumbs, jsonLd: [faqLd(faqs)],
  });
}
function buildPrivacy() {
  const prose = `
        <h2>개인정보처리방침</h2>
        <p>${brand}(이하 "회사")는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수합니다. 회사는 예약 상담에 필요한 최소한의 정보만 수집하고, 수집한 정보를 목적에 맞게만 이용하며 안전하게 관리합니다. 본 방침은 회사가 운영하는 사이트 및 예약 상담 과정에 적용됩니다. 회사는 이용자가 안심하고 서비스를 이용할 수 있도록 개인정보 보호에 최선을 다하며, 본 방침을 통해 수집·이용·보관·파기에 관한 사항을 투명하게 안내합니다.</p>

        <h3>1. 수집하는 개인정보 항목</h3>
        <p>회사는 예약 접수와 상담을 위해 연락처(전화번호), 방문 지역, 희망 시간, 원하는 코스 등 예약에 필요한 최소한의 정보를 수집합니다. 회사는 주민등록번호 등 민감정보를 수집하지 않습니다. 또한 서비스 이용 과정에서 통화 기록이나 문자 내역 등 예약 상담에 수반되는 정보가 생성될 수 있으며, 이는 예약 확인 및 문의 응대 목적으로만 이용됩니다. 회사는 수집 목적에 필요한 범위를 넘어서는 과도한 정보를 요구하지 않으며, 이용자가 제공을 원하지 않는 정보는 수집하지 않습니다.</p>

        <p>회사는 이용자가 전화 또는 문자를 통해 예약·문의하는 과정에서 개인정보를 수집하며, 이용자가 직접 제공한 정보 외에 별도의 자동 수집 장치를 통해 개인정보를 수집하지 않습니다.</p>

        <h3>2. 개인정보의 수집·이용 목적</h3>
        <p>수집한 정보는 예약 접수 및 확인, 방문 일정 안내, 고객 문의 응대, 서비스 개선을 위한 목적으로만 이용합니다. 이용자의 사전 동의 없이 수집 목적 외의 용도로 이용하지 않습니다.</p>

        <h3>3. 개인정보의 보유 및 이용 기간</h3>
        <p>예약 및 상담 목적이 달성된 후에는 관련 법령에서 별도로 정한 보존 기간을 제외하고 해당 정보를 지체 없이 파기합니다. 전자적 파일은 복구할 수 없는 방법으로 삭제합니다.</p>

        <h3>4. 개인정보의 제3자 제공</h3>
        <p>회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만 법령에 근거가 있거나 수사기관의 적법한 요청이 있는 경우는 예외로 합니다.</p>

        <h3>5. 개인정보의 처리 위탁</h3>
        <p>회사는 원활한 예약 안내를 위해 필요한 경우에 한해 개인정보 처리 업무를 위탁할 수 있으며, 이 경우 위탁 대상과 업무 내용을 본 방침을 통해 안내하고 관련 법령에 따라 안전하게 관리합니다.</p>

        <h3>6. 이용자 및 법정대리인의 권리</h3>
        <p>이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요청할 수 있으며, 고객센터(${phone})를 통해 요청하실 수 있습니다. 회사는 요청을 받은 경우 지체 없이 필요한 조치를 취합니다.</p>

        <h3>7. 개인정보의 안전성 확보 조치</h3>
        <p>회사는 수집한 개인정보가 분실·도난·유출·변조되지 않도록 접근 제한 등 필요한 보호 조치를 취합니다.</p>

        <h3>8. 개인정보의 파기 절차 및 방법</h3>
        <p>회사는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 정보를 파기합니다. 전자적 파일 형태의 정보는 복구가 불가능한 기술적 방법으로 삭제하며, 출력물 등은 분쇄하거나 소각하여 파기합니다.</p>

        <h3>9. 만 14세 미만 아동의 개인정보</h3>
        <p>회사는 만 14세 미만 아동을 대상으로 서비스를 제공하지 않으며, 해당 아동의 개인정보를 고의로 수집하지 않습니다. 수집된 사실이 확인되는 경우 지체 없이 파기합니다.</p>

        <h3>10. 개인정보 보호책임자 및 문의처</h3>
        <p>개인정보 관련 문의, 열람·정정·삭제 요청, 불만 처리, 피해 구제 등에 관한 사항은 고객센터 운영팀(${phone})으로 연락해주시기 바랍니다. 회사는 이용자의 문의에 신속하고 성실하게 답변하기 위해 노력합니다.</p>

        <h3>11. 개인정보처리방침의 변경</h3>
        <p>본 방침은 법령·정책 또는 보안 기술의 변경에 따라 내용이 추가·삭제·수정될 수 있으며, 변경 시 본 페이지를 통해 변경 사항과 시행일을 안내합니다.</p>

        <div class="callout">본 개인정보처리방침은 ${buildDate} 기준이며, 관련 법령 및 내부 운영 방침의 변경에 따라 수정될 수 있습니다. 내용이 변경되는 경우 변경 사항과 시행일을 본 페이지를 통해 사전에 공지하며, 이용자께서는 수시로 확인하실 수 있습니다.</div>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "개인정보처리방침", path: "/privacy-policy/" }];
  return articlePage({
    title: `개인정보처리방침 | ${brand}`,
    description: `${brand} 개인정보처리방침 - 개인정보 수집 항목, 이용 목적, 보유 기간, 제3자 제공, 이용자 권리 안내.`,
    h1: "개인정보처리방침", lead: "", proseHtml: prose, crumbs, jsonLd: [],
  });
}

/* ===================== 12. SEO 파일 ===================== */
function collectUrls() {
  const urls = [
    { loc: "/", p: "1.0", f: "daily" },
    { loc: "/suwon/", p: "0.9", f: "weekly" },
    { loc: "/course/", p: "0.8", f: "monthly" },
    { loc: "/course/price/", p: "0.6", f: "monthly" },
    { loc: "/course/guide/", p: "0.6", f: "monthly" },
    { loc: "/reservation/", p: "0.7", f: "monthly" },
    { loc: "/guide/", p: "0.6", f: "monthly" },
    { loc: "/reviews/", p: "0.6", f: "weekly" },
    { loc: "/customer/", p: "0.5", f: "monthly" },
    { loc: "/privacy-policy/", p: "0.3", f: "yearly" },
  ];
  courses.forEach((c) => urls.push({ loc: `/course/${c.slug}/`, p: "0.7", f: "monthly" }));
  suwonGu.forEach((g) => {
    urls.push({ loc: `/suwon/${g.slug}/`, p: "0.8", f: "weekly" });
    urls.push({ loc: `/reviews/${g.slug}/`, p: "0.5", f: "weekly" });
    g.dongs.forEach((d) => urls.push({ loc: `/suwon/${g.slug}/${d.slug}/`, p: "0.7", f: "weekly" }));
  });
  return urls;
}
function titleFor(loc) {
  const map = { "/": "수원 출장마사지 예약 안내", "/suwon/": "수원출장마사지", "/course/": "코스안내",
    "/course/price/": "코스별 가격 안내", "/course/guide/": "코스 선택 가이드", "/reservation/": "예약안내",
    "/guide/": "이용가이드", "/reviews/": "고객후기", "/customer/": "고객센터", "/privacy-policy/": "개인정보처리방침" };
  if (map[loc]) return map[loc];
  const c = courses.find((x) => loc === `/course/${x.slug}/`);
  if (c) return c.name;
  for (const g of suwonGu) {
    if (loc === `/suwon/${g.slug}/`) return `${g.name} 출장마사지`;
    if (loc === `/reviews/${g.slug}/`) return `${g.name} 후기`;
    const d = g.dongs.find((x) => loc === `/suwon/${g.slug}/${x.slug}/`);
    if (d) return `${d.name} 출장마사지`;
  }
  return brand;
}
function buildSitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${siteUrl}${u.loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${u.f}</changefreq>
    <priority>${u.p}</priority>
  </url>`).join("\n")}
</urlset>
`;
}
function buildRss(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${brand}</title>
    <link>${siteUrl}/</link>
    <description>수원 전지역 방문 마사지 예약 안내</description>
    <language>ko</language>
    <lastBuildDate>${new Date(buildDate).toUTCString()}</lastBuildDate>
${urls.map((u) => `    <item>
      <title>${titleFor(u.loc)}</title>
      <link>${siteUrl}${u.loc}</link>
      <guid>${siteUrl}${u.loc}</guid>
      <description>${titleFor(u.loc)} 안내</description>
      <pubDate>${new Date(buildDate).toUTCString()}</pubDate>
    </item>`).join("\n")}
  </channel>
</rss>
`;
}
const robotsTxt = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Yeti
Allow: /

User-agent: NaverBot
Allow: /

User-agent: Daumoa
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap1.xml
Sitemap: ${siteUrl}/rss.xml
`;

/* ===================== 13. 실행 + 글자수 리포트 ===================== */
function mainLen(html) {
  const m = html.match(/<main[\s\S]*?<\/main>/i);
  if (!m) return 0;
  // 공백 포함 글자수(한국 글자수 세기 관례) — 태그 제거 후 공백 1칸으로 정규화
  return m[0].replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim().length;
}
async function emit(rel, html, report) {
  await writeFile(rel, html);
  report.push({ rel, len: mainLen(html) });
}
async function main() {
  const report = [];
  await emit("index.html", buildHome(), report);
  await emit("suwon/index.html", buildSuwonMain(), report);
  await emit("course/index.html", buildCourseIndex(), report);
  for (const c of courses) await emit(`course/${c.slug}/index.html`, buildCourse(c), report);
  await emit("course/price/index.html", buildCoursePrice(), report);
  await emit("course/guide/index.html", buildCourseGuide(), report);
  await emit("reservation/index.html", buildReservation(), report);
  await emit("guide/index.html", buildGuide(), report);
  await emit("reviews/index.html", buildReviewsIndex(), report);
  await emit("customer/index.html", buildCustomer(), report);
  await emit("privacy-policy/index.html", buildPrivacy(), report);
  for (const g of suwonGu) {
    await emit(`suwon/${g.slug}/index.html`, buildGu(g), report);
    await emit(`reviews/${g.slug}/index.html`, buildReviewsGu(g), report);
    for (const d of g.dongs) await emit(`suwon/${g.slug}/${d.slug}/index.html`, buildDong(g, d), report);
  }
  const urls = collectUrls();
  const sm = buildSitemap(urls);
  await writeFile("sitemap.xml", sm);
  await writeFile("sitemap1.xml", sm);
  await writeFile("rss.xml", buildRss(urls));
  await writeFile("robots.txt", robotsTxt);
  // IndexNow 키 파일 (루트에 <key>.txt, 내용은 키 그대로)
  await writeFile(`${indexNowKey}.txt`, indexNowKey);

  const under = report.filter((r) => r.len < 2000);
  const over = report.filter((r) => r.len > 2600);
  console.log(`✅ ${report.length}개 페이지 생성 (sitemap URL ${urls.length}개)`);
  console.log(`   본문 글자수: 최소 ${Math.min(...report.map((r) => r.len))}, 최대 ${Math.max(...report.map((r) => r.len))}, 평균 ${Math.round(report.reduce((a, r) => a + r.len, 0) / report.length)}`);
  if (under.length) { console.log(`   ⚠ 2000자 미만 ${under.length}개:`); under.forEach((r) => console.log(`     ${String(r.len).padStart(5)}  ${r.rel}`)); }
  else console.log("   ✓ 모든 페이지 2000자 이상");
  if (over.length) { console.log(`   ⚠ 2600자 초과 ${over.length}개:`); over.forEach((r) => console.log(`     ${String(r.len).padStart(5)}  ${r.rel}`)); }
}
main().catch((e) => { console.error(e); process.exit(1); });
