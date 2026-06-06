#!/usr/bin/env node
/**
 * IndexNow 색인 통보 스크립트 (Bing · Naver 즉시 색인)
 *
 * 사용법:
 *   node indexnow.mjs              # sitemap.xml 의 전체 URL 제출
 *   node indexnow.mjs /suwon/paldal-gu/ingye-dong/   # 특정 경로만 제출
 *   node indexnow.mjs https://suwon-massage.pages.dev/course/aroma/
 *   node indexnow.mjs --dry        # 실제 전송 없이 제출 대상만 출력
 *
 * 전제: 키 파일(<key>.txt)이 배포된 사이트 루트에 노출되어 있어야 합니다.
 */
import { promises as fs } from "node:fs";

const siteUrl = "https://suwon-massage.pages.dev";
const host = "suwon-massage.pages.dev";
const key = "4f3765781ec57f6460f12aff064f67da";
const keyLocation = `${siteUrl}/${key}.txt`;

// IndexNow 참여 엔드포인트 (한 곳에 보내면 공유되지만, 빙·네이버에 직접도 함께 전송)
const endpoints = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://searchadvisor.naver.com/indexnow",
];

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

async function submit(endpoint, urlList) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  return res.status;
}

const urls = await getUrls();
console.log(`IndexNow 제출 대상: ${urls.length}개 URL (key: ${key})`);
if (dry) {
  urls.forEach((u) => console.log("  " + u));
  console.log("--dry 모드: 실제 전송 안 함");
  process.exit(0);
}

let ok = 0;
for (const ep of endpoints) {
  try {
    const status = await submit(ep, urls);
    const good = status === 200 || status === 202;
    if (good) ok++;
    console.log(`  ${ep} → HTTP ${status}${good ? " ✅" : ""}`);
  } catch (e) {
    console.log(`  ${ep} → 전송 오류: ${e.message}`);
  }
}
console.log(ok ? `완료: ${ok}/${endpoints.length} 엔드포인트 접수` : "모든 엔드포인트 전송 실패 — 네트워크/키 파일 노출 여부 확인");
process.exit(ok ? 0 : 1);
