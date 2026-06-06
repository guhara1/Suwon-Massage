#!/usr/bin/env node
/**
 * 구글 Indexing API 색인 통보 (옵션)
 *
 * 주의: 구글 Indexing API는 공식적으로 JobPosting·BroadcastEvent 전용입니다.
 *       일반 페이지 통보는 비공식이며 무시될 수 있습니다. 보조 수단으로만 사용하세요.
 *
 * 인증: 서비스 계정 JSON 전체를 환경변수 GOOGLE_INDEXING_SA 에 넣습니다.
 *       (GitHub Actions에서는 secret 으로 주입) — 없으면 아무 것도 하지 않고 종료.
 *
 * 사용법:
 *   GOOGLE_INDEXING_SA="$(cat sa.json)" node google-index.mjs            # sitemap 전체
 *   GOOGLE_INDEXING_SA="$(cat sa.json)" node google-index.mjs /course/aroma/
 *   node google-index.mjs --dry                                          # 대상만 출력
 *
 * 외부 npm 패키지 없이 Node 내장 crypto 만 사용합니다.
 */
import { promises as fs } from "node:fs";
import crypto from "node:crypto";

const siteUrl = "https://suwon-massage.pages.dev";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const pathArgs = args.filter((a) => a !== "--dry");

function toUrl(u) {
  if (u.startsWith("http")) return u;
  return siteUrl + (u.startsWith("/") ? u : "/" + u);
}
async function getUrls() {
  if (pathArgs.length) return pathArgs.map(toUrl);
  const xml = await fs.readFile(new URL("./sitemap.xml", import.meta.url), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const b64url = (x) => Buffer.from(x).toString("base64url");

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const jwt = `${unsigned}.${signature}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error(`토큰 발급 실패 HTTP ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

async function publish(token, url) {
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, type: "URL_UPDATED" }),
  });
  return res.status;
}

const raw = process.env.GOOGLE_INDEXING_SA;
const urls = await getUrls();

if (dry) {
  console.log(`구글 Indexing 제출 대상: ${urls.length}개`);
  urls.forEach((u) => console.log("  " + u));
  console.log("--dry 모드: 실제 전송 안 함");
  process.exit(0);
}
if (!raw) {
  console.log("GOOGLE_INDEXING_SA 미설정 — 구글 Indexing API 통보 건너뜀 (IndexNow는 별도 동작)");
  process.exit(0);
}

let sa;
try { sa = JSON.parse(raw); } catch (e) { console.error("GOOGLE_INDEXING_SA JSON 파싱 실패:", e.message); process.exit(1); }

const token = await getAccessToken(sa);
console.log(`구글 Indexing API 제출: ${urls.length}개 URL (계정 ${sa.client_email})`);
let ok = 0;
for (const u of urls) {
  try {
    const status = await publish(token, u);
    const good = status === 200;
    if (good) ok++;
    console.log(`  ${good ? "✅" : "⚠️ " + status} ${u}`);
  } catch (e) {
    console.log(`  ❌ ${u} — ${e.message}`);
  }
}
console.log(`완료: ${ok}/${urls.length} 접수`);
process.exit(ok ? 0 : 1);
