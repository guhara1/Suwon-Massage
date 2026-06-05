#!/usr/bin/env node
/**
 * 세븐록 마사지 정적 사이트 생성기
 * - index.html, 서비스/지역 상세 페이지, sitemap, RSS, robots 생성
 * - 다음 사이트 재사용 시 아래 상단 상수 + 데이터 배열만 수정하세요.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

/* ===================== 1. 사이트 기본 값 ===================== */
const siteUrl = "https://sevenrock-massage.pages.dev"; // 커스텀 도메인 연결 후 교체
const brand = "세븐록 마사지";
const brandEn = "SEVENROCK";
const phone = "0508-202-4743";
const telHref = "tel:0508-202-4743";
const smsHref = "sms:0508-202-4743";
const buildDate = "2026-06-05";
const naverVerify = "여기에-네이버-인증코드";   // Naver Search Advisor에서 발급 후 교체
const googleVerify = "여기에-구글-인증코드";    // Search Console에서 발급 후 교체

/* ===================== 2. 메뉴/지역/서비스 데이터 ===================== */
const services = [
  { slug: "swedish", name: "스웨디시", icon: "🌿", short: "부드러운 압으로 전신 긴장을 풀어주는 가장 기본적인 휴식 관리." },
  { slug: "aroma", name: "아로마테라피", icon: "🕯️", short: "향과 오일로 호흡을 가라앉히고 편안하게 이완하는 관리." },
  { slug: "deeptissue", name: "딥티슈", icon: "💪", short: "뭉친 느낌이 강한 부위를 깊고 단단한 압으로 풀어주는 관리." },
  { slug: "thai", name: "타이마사지", icon: "🤸", short: "스트레칭 동작으로 몸의 가동 범위를 시원하게 늘려주는 관리." },
  { slug: "sports", name: "스포츠마사지", icon: "🏃", short: "활동량이 많은 분의 컨디션 관리에 맞춘 리듬감 있는 관리." },
  { slug: "lymph", name: "림프마사지", icon: "💧", short: "가볍고 일정한 압으로 몸이 무겁게 느껴질 때 도와주는 관리." },
];

// 시도 단위 지역 (전국)
const regions = [
  {
    slug: "seoul", name: "서울", titleArea: "서울 전역",
    blurb: "서울은 업무권과 주거권, 호텔·오피스텔 숙소권이 좁은 범위에 섞여 있어 같은 구 안에서도 방문 조건이 달라집니다. 강남·여의도·종로 업무권은 퇴근 이후 오피스텔·호텔 문의가 많아 공동현관 출입과 주차 규정 확인이 중요합니다.",
    zones: ["강남·서초 업무/오피스텔권", "여의도·마포 업무/상권", "종로·중구 호텔·비즈니스권", "송파·성동 주거권"],
    move: "도심 정체와 일방통행, 공동현관 출입 규정이 가장 큰 변수입니다.",
    rec: "퇴근 후 짧은 휴식이 필요하면 스웨디시, 어깨·허리 뭉침이 강하면 딥티슈를 추천합니다.",
    faq: [
      { q: "오피스텔 공동현관은 어떻게 출입하나요?", a: "예약 시 공동현관 비밀번호나 프런트 호출 방식을 미리 알려주시면 도착 시 지연 없이 진행됩니다." },
      { q: "심야에도 서울 전역 방문이 가능한가요?", a: "도심권은 심야 이동이 비교적 원활하여 시간대 협의 후 안내드립니다. 외곽 일부는 이동 시간만 추가로 확인합니다." },
      { q: "호텔 객실 방문도 되나요?", a: "객실 방문 가능 여부는 숙소 규정에 따라 다르므로, 호텔명과 객실 안내 가능 여부를 함께 확인합니다." },
    ],
  },
  {
    slug: "gyeonggi", name: "경기", titleArea: "경기 전역",
    blurb: "경기는 도시마다 생활권과 이동 거리가 크게 달라 출장 가능 시간과 이동 변수를 도시별로 따로 봅니다. 수원·성남·용인 등 주요 도시는 신도시 아파트와 오피스텔 비중이 높아 단지 출입 방식 확인이 중요합니다.",
    zones: ["수원·화성 생활권", "성남·용인 신도시권", "고양·파주 서북권", "부천·안양 서남권"],
    move: "도시 간 거리와 광역도로 정체가 변수라 출발 전 예상 이동 시간을 함께 안내합니다.",
    rec: "장시간 좌식 근무 후라면 딥티슈, 전반적인 피로 완화에는 아로마테라피가 무난합니다.",
    faq: [
      { q: "경기 외곽도 출장 가능한가요?", a: "가능합니다. 다만 도시 외곽은 이동 시간이 길어질 수 있어 예약 시 출장비와 도착 예상 시간을 함께 확인합니다." },
      { q: "신도시 아파트 단지 방문 시 준비할 점은?", a: "단지 공동현관과 동·호수, 방문차량 등록 여부를 미리 알려주시면 출입이 매끄럽습니다." },
      { q: "수원 지역은 별도 페이지가 있나요?", a: "네, 수원시는 장안·권선·팔달·영통 구별로 별도 안내 페이지를 제공합니다." },
    ],
  },
  {
    slug: "incheon", name: "인천", titleArea: "인천 전역",
    blurb: "인천은 송도 국제도시, 구도심, 영종 공항권이 서로 다른 생활 리듬을 가집니다. 특히 영종권은 공항 일정과 교량 이동 시간이 예약 가능 여부에 직접 영향을 줍니다.",
    zones: ["송도 국제도시 주거/업무권", "구월·부평 구도심 상권", "영종 공항/숙소권", "연수·청라 주거권"],
    move: "영종대교·인천대교 이동 시간과 공항 일정이 핵심 변수입니다.",
    rec: "장거리 이동·비행 후 무거움에는 림프마사지, 전신 이완에는 아로마테라피를 추천합니다.",
    faq: [
      { q: "영종도(공항 인근)도 방문 가능한가요?", a: "가능합니다. 교량 이동 시간이 있어 항공편 전후 여유 시간을 확인한 뒤 예약을 잡습니다." },
      { q: "송도 오피스텔 방문 시 주의할 점은?", a: "고층 오피스텔은 엘리베이터·공동현관 출입 절차가 있어 출입 방식을 미리 알려주시면 좋습니다." },
      { q: "출장비는 지역마다 다른가요?", a: "구도심과 공항권은 이동 거리가 달라 출장비 기준이 다를 수 있어 예약 시 정확히 안내드립니다." },
    ],
  },
  {
    slug: "busan", name: "부산", titleArea: "부산 전역",
    blurb: "부산은 해운대 관광·숙소권과 서면 도심권, 주거권의 이동 조건이 크게 다릅니다. 성수기에는 해안도로 정체와 관광 숙소 객실 방문 규정이 변수가 됩니다.",
    zones: ["해운대·센텀 관광/업무권", "서면·연제 도심 상권", "남포·중구 원도심권", "사상·북구 주거권"],
    move: "성수기 해안도로 정체와 관광 숙소 객실 방문 가능 여부를 함께 확인합니다.",
    rec: "관광·이동으로 다리가 무거울 때는 스포츠마사지, 휴식 위주면 스웨디시가 좋습니다.",
    faq: [
      { q: "해운대 호텔·리조트 객실도 되나요?", a: "객실 방문 가능 여부는 숙소 규정에 따라 다르므로 숙소명을 알려주시면 사전 확인 후 안내합니다." },
      { q: "성수기에는 예약이 어려운가요?", a: "성수기에는 이동이 지연될 수 있어 미리 예약하시면 원하는 시간대 배정이 수월합니다." },
      { q: "서면 도심 오피스텔도 방문 가능한가요?", a: "가능합니다. 공동현관·주차 안내만 미리 확인하면 됩니다." },
    ],
  },
  {
    slug: "daegu", name: "대구", titleArea: "대구 전역",
    blurb: "대구는 동성로 도심 상권과 수성구 주거권, 외곽 산업권의 생활 리듬이 구분됩니다. 도심은 숙소·상권 문의가, 수성구는 주거권 방문 문의가 많습니다.",
    zones: ["중구 동성로 도심 상권", "수성구 주거권", "달서·북구 주거/업무 혼합", "동구 혁신도시권"],
    move: "도심 일방통행과 주차 여건, 외곽 이동 거리를 함께 확인합니다.",
    rec: "장시간 앉아 일한 뒤라면 딥티슈, 전반적 긴장 완화에는 아로마테라피가 무난합니다.",
    faq: [
      { q: "수성구 아파트 단지 방문도 가능한가요?", a: "가능합니다. 단지 출입 방식과 동·호수를 미리 알려주시면 도착이 매끄럽습니다." },
      { q: "동성로 인근 숙소도 방문 가능한가요?", a: "가능합니다. 숙소 객실 방문 규정만 사전 확인합니다." },
      { q: "심야 예약도 되나요?", a: "시간대는 협의 후 안내드리며, 외곽은 이동 시간만 추가로 확인합니다." },
    ],
  },
  {
    slug: "daejeon", name: "대전", titleArea: "대전 전역",
    blurb: "대전은 둔산 업무·상권과 유성 연구·주거권, 원도심권으로 나뉩니다. 둔산은 오피스텔 문의가, 유성은 출장·숙박 일정 문의가 많은 편입니다.",
    zones: ["서구 둔산 업무/상권", "유성구 연구/숙소권", "중구 원도심권", "대덕·동구 주거권"],
    move: "도심 내 이동은 원활한 편이며, 유성 숙소권은 일정 전후 시간을 확인합니다.",
    rec: "출장·업무 피로에는 스웨디시, 어깨 뭉침이 강하면 딥티슈를 추천합니다.",
    faq: [
      { q: "유성 호텔·숙소도 방문 가능한가요?", a: "가능합니다. 객실 방문 규정과 일정 전후 여유 시간을 확인합니다." },
      { q: "둔산 오피스텔 방문 시 준비할 점은?", a: "공동현관 출입 방식과 주차 안내만 미리 알려주시면 됩니다." },
      { q: "예약은 얼마나 미리 해야 하나요?", a: "당일 예약도 가능하지만, 원하는 시간대가 있다면 미리 문의하시는 편이 좋습니다." },
    ],
  },
  {
    slug: "gwangju", name: "광주", titleArea: "광주 전역",
    blurb: "광주는 상무지구 업무·상권과 봉선·수완 주거권, 첨단 산업권으로 생활권이 나뉩니다. 상무지구는 오피스텔·상권 문의가 많습니다.",
    zones: ["서구 상무 업무/상권", "남구 봉선 주거권", "광산 수완·첨단권", "동구 원도심권"],
    move: "도심 이동은 원활하며, 첨단·외곽은 이동 거리만 추가로 확인합니다.",
    rec: "전신 피로에는 아로마테라피, 부분 뭉침이 강하면 딥티슈가 좋습니다.",
    faq: [
      { q: "상무지구 오피스텔도 방문 가능한가요?", a: "가능합니다. 공동현관·주차 안내만 미리 확인합니다." },
      { q: "수완지구 아파트 방문도 되나요?", a: "가능합니다. 단지 출입 방식과 동·호수를 알려주시면 됩니다." },
      { q: "출장비는 어떻게 되나요?", a: "기본 권역은 동일하며, 외곽은 이동 거리에 따라 예약 시 안내드립니다." },
    ],
  },
  {
    slug: "ulsan", name: "울산", titleArea: "울산 전역",
    blurb: "울산은 삼산·달동 상권과 산업단지 인근 숙소권, 주거권으로 구분됩니다. 산업단지 인근은 교대 근무 일정에 맞춘 시간대 문의가 많습니다.",
    zones: ["남구 삼산·달동 상권", "중구 주거권", "동구 조선소권", "울주 산업/외곽권"],
    move: "산업단지 인근은 교대 시간과 이동 거리를, 울주 외곽은 이동 시간을 확인합니다.",
    rec: "활동량이 많은 분께는 스포츠마사지, 전신 휴식에는 스웨디시를 추천합니다.",
    faq: [
      { q: "교대 근무라 시간이 불규칙한데 가능한가요?", a: "가능합니다. 가능한 시간대를 알려주시면 그에 맞춰 협의 후 안내드립니다." },
      { q: "울주 외곽도 출장 되나요?", a: "가능합니다. 이동 시간이 길어질 수 있어 출장비와 도착 예상 시간을 함께 확인합니다." },
      { q: "산업단지 인근 숙소도 방문 가능한가요?", a: "가능합니다. 숙소 출입 규정만 사전 확인하면 됩니다." },
    ],
  },
  {
    slug: "sejong", name: "세종", titleArea: "세종 전역",
    blurb: "세종은 신도시 아파트와 정부청사 인근 오피스텔 비중이 높아 단지·건물 출입 방식 확인이 중요합니다. 생활권이 비교적 균일해 이동은 원활한 편입니다.",
    zones: ["정부청사 인근 업무권", "신도시 아파트 주거권", "조치원 원도심권", "오피스텔 밀집권"],
    move: "신도시 단지 출입 방식과 방문차량 등록 여부가 주요 확인 사항입니다.",
    rec: "좌식 근무 피로에는 딥티슈, 가벼운 이완에는 아로마테라피가 좋습니다.",
    faq: [
      { q: "신도시 아파트 단지 방문도 되나요?", a: "가능합니다. 공동현관·동호수·방문차량 등록 여부를 미리 알려주시면 됩니다." },
      { q: "조치원 등 원도심도 출장 가능한가요?", a: "가능합니다. 이동 시간만 추가로 확인합니다." },
      { q: "당일 예약도 가능한가요?", a: "가능합니다. 다만 원하는 시간대가 있으면 미리 문의하시는 편이 좋습니다." },
    ],
  },
  {
    slug: "gangwon", name: "강원", titleArea: "강원 전역",
    blurb: "강원은 춘천·원주 도심권과 강릉·속초 관광권으로 이동 조건이 크게 다릅니다. 관광권은 성수기 도로 정체와 숙소 객실 방문 규정이 변수입니다.",
    zones: ["춘천 도심권", "원주 혁신·주거권", "강릉·속초 관광/숙소권", "동해·삼척 해안권"],
    move: "관광 성수기 도로 정체와 도시 간 거리가 핵심 변수입니다.",
    rec: "장거리 이동 후 무거움에는 림프마사지, 휴식 위주면 스웨디시를 추천합니다.",
    faq: [
      { q: "강릉·속초 펜션·리조트 객실도 되나요?", a: "객실 방문 가능 여부는 숙소 규정에 따라 다르므로 숙소명을 알려주시면 확인 후 안내합니다." },
      { q: "성수기에는 예약이 어려운가요?", a: "성수기에는 이동이 지연될 수 있어 미리 예약하시면 시간대 배정이 수월합니다." },
      { q: "도시 간 이동도 가능한가요?", a: "가능하나 거리가 멀면 이동 시간과 출장비를 사전에 안내드립니다." },
    ],
  },
  {
    slug: "chungcheong", name: "충청", titleArea: "충청 전역",
    blurb: "충청은 천안·아산 산업·주거권, 청주 도심권, 충남·북 외곽권으로 나뉩니다. 산업권은 숙소·교대 일정 문의가, 도심은 오피스텔 문의가 많습니다.",
    zones: ["천안·아산 산업/주거권", "청주 도심·상권", "충주·제천 내륙권", "당진·서산 서해권"],
    move: "도시 간 거리가 있어 출발 전 이동 시간과 출장비를 함께 안내합니다.",
    rec: "활동량이 많은 분께는 스포츠마사지, 전신 피로에는 아로마테라피가 좋습니다.",
    faq: [
      { q: "천안·아산 숙소권도 방문 가능한가요?", a: "가능합니다. 숙소 출입 규정과 일정 전후 시간을 확인합니다." },
      { q: "청주 오피스텔도 되나요?", a: "가능합니다. 공동현관·주차 안내만 미리 확인하면 됩니다." },
      { q: "외곽 지역 출장비는 어떻게 되나요?", a: "이동 거리에 따라 달라질 수 있어 예약 시 정확히 안내드립니다." },
    ],
  },
  {
    slug: "jeolla", name: "전라", titleArea: "전라 전역",
    blurb: "전라는 전주 도심권, 광역시 인접 주거권, 여수·순천 관광권으로 생활권이 나뉩니다. 관광권은 성수기 이동과 숙소 규정이 변수입니다.",
    zones: ["전주 도심·한옥권", "익산·군산 서북권", "여수·순천 관광권", "광양·목포 해안권"],
    move: "관광 성수기 이동 지연과 도시 간 거리를 함께 확인합니다.",
    rec: "관광 이동으로 다리가 무거우면 스포츠마사지, 휴식엔 스웨디시가 좋습니다.",
    faq: [
      { q: "여수·순천 숙소 객실도 되나요?", a: "숙소 규정에 따라 다르므로 숙소명을 알려주시면 사전 확인 후 안내합니다." },
      { q: "전주 도심 숙소도 방문 가능한가요?", a: "가능합니다. 객실·오피스텔 출입 규정만 확인합니다." },
      { q: "출장비 기준이 궁금합니다.", a: "기본 권역은 동일하며 외곽은 이동 거리에 따라 예약 시 안내드립니다." },
    ],
  },
  {
    slug: "gyeongsang", name: "경상", titleArea: "경상 전역",
    blurb: "경상은 창원·김해 산업·주거권, 포항·구미 산업권, 경주 관광권으로 이동 조건이 다릅니다. 산업권은 교대 일정, 관광권은 숙소 규정이 변수입니다.",
    zones: ["창원·김해 산업/주거권", "포항·구미 산업권", "경주 관광/숙소권", "진주·양산 외곽권"],
    move: "산업단지 교대 시간과 도시 간 거리를 함께 확인합니다.",
    rec: "활동량이 많은 분께는 스포츠마사지, 전신 이완에는 아로마테라피를 추천합니다.",
    faq: [
      { q: "창원 산업단지 인근 숙소도 되나요?", a: "가능합니다. 숙소 출입 규정과 가능 시간대를 확인합니다." },
      { q: "경주 관광 숙소 객실도 방문 가능한가요?", a: "숙소 규정에 따라 다르므로 숙소명을 알려주시면 확인 후 안내합니다." },
      { q: "외곽 출장비는 어떻게 되나요?", a: "이동 거리에 따라 달라질 수 있어 예약 시 정확히 안내드립니다." },
    ],
  },
  {
    slug: "jeju", name: "제주", titleArea: "제주 전역",
    blurb: "제주는 제주시 도심권과 서귀포 관광·숙소권으로 나뉘며, 관광 일정과 렌터카 이동, 숙소 객실 방문 규정이 핵심 변수입니다.",
    zones: ["제주시 도심권", "노형·연동 상권", "서귀포 관광/숙소권", "중문 리조트권"],
    move: "관광 일정과 숙소(펜션·리조트·호텔) 객실 방문 규정을 함께 확인합니다.",
    rec: "여행 이동으로 무거움에는 림프마사지, 휴식 위주면 아로마테라피가 좋습니다.",
    faq: [
      { q: "펜션·리조트 객실도 방문 가능한가요?", a: "숙소 규정에 따라 다르므로 숙소명을 알려주시면 사전 확인 후 안내합니다." },
      { q: "서귀포까지도 출장 되나요?", a: "가능합니다. 이동 시간이 있어 일정 전후 여유 시간을 확인합니다." },
      { q: "여행 일정 중에도 예약 가능한가요?", a: "가능합니다. 일정에 맞춰 시간대를 협의해 안내드립니다." },
    ],
  },
];

// 수원시 하위 구 (수원 중심 상세)
const suwonDistricts = [
  {
    slug: "jangan-gu", name: "장안구",
    blurb: "수원 장안구는 정자·영화·송죽동 등 오래된 주거권과 행정타운, 성균관대 인근 생활권이 섞여 있습니다. 단독·빌라와 아파트가 함께 있어 주소와 출입 방식을 미리 확인하는 것이 중요합니다.",
    zones: [
      { h: "정자·천천동", p: "대단지 아파트가 많아 공동현관·동호수 확인이 핵심입니다." },
      { h: "영화·송죽동", p: "빌라·단독 주택이 섞여 있어 정확한 주소와 출입 동선을 확인합니다." },
      { h: "조원·파장동", p: "행정타운·상권 인접 주거권으로 주차 여건을 함께 확인합니다." },
    ],
    move: "북수원 IC 인접으로 외부 진입은 원활하나, 노후 주거권은 주차 공간을 미리 확인합니다.",
    rec: "장시간 가사·좌식 후 어깨·허리 뭉침에는 딥티슈, 전반적 휴식에는 스웨디시를 추천합니다.",
    faq: [
      { q: "장안구 빌라·단독주택도 방문 가능한가요?", a: "가능합니다. 정확한 주소와 출입구 위치, 주차 가능 여부를 미리 알려주시면 도착이 매끄럽습니다." },
      { q: "성균관대 인근도 출장 되나요?", a: "가능합니다. 원룸·오피스텔은 공동현관 출입 방식만 사전에 확인합니다." },
      { q: "주차가 어려운 곳은 어떻게 하나요?", a: "인근 공영주차장 이용이 가능하며, 출입 동선을 함께 안내드립니다." },
    ],
  },
  {
    slug: "gwonseon-gu", name: "권선구",
    blurb: "수원 권선구는 권선·곡선동 주거권, 세류·서둔동 생활권, 호매실 신도시권이 함께 있습니다. 신축 아파트와 오래된 주거지가 섞여 단지별 출입 방식이 다릅니다.",
    zones: [
      { h: "권선·곡선동", p: "대단지 아파트 중심으로 방문차량 등록 여부를 확인합니다." },
      { h: "호매실 신도시", p: "신축 단지가 많아 공동현관·동호수 확인이 중요합니다." },
      { h: "세류·서둔동", p: "주거·상권 혼합권으로 주차 여건을 함께 확인합니다." },
    ],
    move: "수원IC·산업도로 인접으로 진입은 원활하며, 신도시권은 단지 출입 등록을 미리 확인합니다.",
    rec: "활동량이 많은 분께는 스포츠마사지, 전신 피로 완화에는 아로마테라피가 좋습니다.",
    faq: [
      { q: "호매실 신축 아파트도 방문 가능한가요?", a: "가능합니다. 단지 공동현관과 방문차량 등록 방식을 미리 알려주시면 됩니다." },
      { q: "권선구 어디까지 출장 되나요?", a: "권선구 전역 방문 가능하며, 외곽은 이동 시간만 추가로 확인합니다." },
      { q: "예약 후 시간 변경이 가능한가요?", a: "가능합니다. 가급적 빨리 연락 주시면 일정 조정을 도와드립니다." },
    ],
  },
  {
    slug: "paldal-gu", name: "팔달구",
    blurb: "수원 팔달구는 인계동 번화가, 화성행궁·수원역 인근 상권, 매교·고등동 주거권이 모여 있는 수원의 중심 생활권입니다. 상권 인근 오피스텔·숙소 문의가 많습니다.",
    zones: [
      { h: "인계동 번화가", p: "오피스텔·숙소가 밀집해 공동현관 출입과 주차 규정을 확인합니다." },
      { h: "수원역·매산동", p: "역세권 상권·숙소권으로 객실 방문 규정을 함께 확인합니다." },
      { h: "화서·매교동", p: "재개발·신축 주거권으로 단지 출입 방식을 확인합니다." },
    ],
    move: "도심 번화가 특성상 저녁 시간 주차·정체가 변수라 출입 동선을 미리 안내합니다.",
    rec: "퇴근 후 짧은 휴식에는 스웨디시, 어깨·목 뭉침이 강하면 딥티슈를 추천합니다.",
    faq: [
      { q: "인계동 오피스텔·숙소도 방문 가능한가요?", a: "가능합니다. 공동현관 출입 방식과 객실 방문 규정만 사전에 확인합니다." },
      { q: "수원역 인근 숙소도 되나요?", a: "가능합니다. 숙소명을 알려주시면 객실 방문 가능 여부를 확인 후 안내합니다." },
      { q: "저녁 시간대도 예약 가능한가요?", a: "가능합니다. 번화가는 정체가 있어 도착 예상 시간을 함께 안내드립니다." },
    ],
  },
  {
    slug: "yeongtong-gu", name: "영통구",
    blurb: "수원 영통구는 영통·매탄동 아파트 주거권, 광교 신도시 업무·주거권, 삼성 사업장 인근 오피스텔권으로 구성됩니다. 신도시·오피스텔 비중이 높아 단지 출입 확인이 핵심입니다.",
    zones: [
      { h: "광교 신도시", p: "신축 대단지·오피스텔이 많아 공동현관·방문등록을 확인합니다." },
      { h: "영통·매탄동", p: "대단지 아파트 중심으로 동호수와 주차 안내를 확인합니다." },
      { h: "망포·원천동", p: "신축 주거권으로 단지 출입 방식을 미리 확인합니다." },
    ],
    move: "영통IC·광교 진입은 원활하나, 신도시 단지는 방문차량 등록 절차를 미리 확인합니다.",
    rec: "장시간 좌식 근무 후에는 딥티슈, 가벼운 이완에는 아로마테라피가 좋습니다.",
    faq: [
      { q: "광교 신도시 오피스텔도 방문 가능한가요?", a: "가능합니다. 공동현관 출입 방식과 방문차량 등록 여부를 미리 알려주시면 됩니다." },
      { q: "삼성 사업장 인근 원룸도 되나요?", a: "가능합니다. 원룸·오피스텔은 출입 방식만 사전에 확인합니다." },
      { q: "영통구 전역 출장 가능한가요?", a: "네, 영통구 전역 방문 가능하며 이동 시간만 사전에 안내드립니다." },
    ],
  },
];

// 서비스 상세 콘텐츠
const serviceDetails = {
  swedish: {
    intro: "부드럽고 일정한 압으로 전신을 쓸어주며 긴장을 풀어주는 가장 기본적인 휴식 관리입니다.",
    what: "스웨디시는 오일을 사용해 부드럽고 리듬감 있는 동작으로 전신을 관리하는 방식입니다. 강한 압보다 편안함과 이완에 초점을 둡니다.",
    when: ["하루 종일 긴장이 이어져 몸이 무겁게 느껴질 때", "깊은 자극보다 부드러운 휴식이 필요할 때", "마사지를 처음 받아 압 조절이 걱정될 때"],
    feature: ["오일을 사용해 피부 마찰을 줄인 부드러운 동작", "전신을 고르게 쓸어주는 리듬감", "컨디션에 맞춘 압 조절"],
    flow: "상담으로 원하는 압과 집중 부위를 확인한 뒤, 전신을 고르게 관리하고 마무리에 호흡을 가라앉히는 순서로 진행합니다.",
    time: "처음이라면 60분, 전신을 충분히 이완하고 싶다면 90분을 추천합니다.",
    diff: "딥티슈가 깊고 단단한 압이라면, 스웨디시는 부드럽고 편안한 압으로 휴식에 가깝습니다.",
  },
  aroma: {
    intro: "향과 오일을 활용해 호흡을 가라앉히고 몸과 마음을 편안하게 이완하는 관리입니다.",
    what: "아로마테라피는 오일의 향과 부드러운 동작을 함께 사용해 편안한 분위기에서 전신을 이완하는 방식입니다.",
    when: ["하루를 마무리하며 편안하게 쉬고 싶을 때", "긴장으로 호흡이 얕게 느껴질 때", "부드러운 분위기의 휴식을 원할 때"],
    feature: ["향을 활용한 편안한 분위기", "부드럽고 느린 동작", "호흡을 가라앉히는 마무리"],
    flow: "선호하는 향과 압을 확인한 뒤, 전신을 부드럽게 관리하며 호흡과 함께 천천히 이완하도록 진행합니다.",
    time: "편안한 이완에는 90분을 권장하며, 짧게는 60분도 가능합니다.",
    diff: "스웨디시가 전신 이완 중심이라면, 아로마테라피는 향을 더해 분위기까지 편안하게 만드는 데 가깝습니다.",
  },
  deeptissue: {
    intro: "뭉친 느낌이 강한 부위를 깊고 단단한 압으로 풀어주는 관리입니다.",
    what: "딥티슈는 표면보다 깊은 부위를 단단한 압으로 천천히 관리하는 방식입니다. 특정 부위의 뭉침이 강할 때 적합합니다.",
    when: ["어깨·등·허리가 단단하게 뭉친 느낌이 들 때", "장시간 같은 자세로 일한 뒤", "부드러운 압으로는 시원함이 부족할 때"],
    feature: ["깊고 단단한 압", "뭉친 부위 집중 관리", "압을 단계적으로 올리는 진행"],
    flow: "집중 부위를 확인한 뒤 가벼운 압으로 풀어주고, 점차 압을 올려 깊은 부위를 천천히 관리합니다.",
    time: "부분 집중은 60분, 전신과 함께 관리하려면 90분 이상을 추천합니다.",
    diff: "스웨디시보다 압이 강하며, 휴식보다 뭉친 부위를 풀어주는 데 초점을 둡니다.",
  },
  thai: {
    intro: "스트레칭 동작을 함께 사용해 몸의 가동 범위를 시원하게 늘려주는 관리입니다.",
    what: "타이마사지는 오일 없이 옷을 입은 상태에서 지압과 스트레칭 동작을 함께 사용하는 방식입니다.",
    when: ["몸이 뻣뻣하게 굳은 느낌이 들 때", "스트레칭으로 시원함을 느끼고 싶을 때", "전신을 활동적으로 풀어주고 싶을 때"],
    feature: ["지압과 스트레칭의 결합", "옷을 입은 상태로 진행", "가동 범위를 늘려주는 동작"],
    flow: "관리받을 분의 유연성과 컨디션을 확인한 뒤, 무리되지 않는 범위에서 스트레칭과 지압을 함께 진행합니다.",
    time: "전신 스트레칭 위주라면 90분을 추천합니다.",
    diff: "오일 마사지가 쓸어주는 동작 중심이라면, 타이마사지는 스트레칭으로 몸을 펴주는 데 가깝습니다.",
  },
  sports: {
    intro: "활동량이 많은 분의 컨디션 관리에 맞춘 리듬감 있는 관리입니다.",
    what: "스포츠마사지는 활동으로 피로가 쌓이기 쉬운 부위를 리듬감 있게 관리해 컨디션을 가다듬는 방식입니다.",
    when: ["운동·활동량이 많아 다리·어깨가 무거울 때", "활동 전후 컨디션을 가다듬고 싶을 때", "특정 부위 피로가 반복될 때"],
    feature: ["활동 부위 중심 관리", "리듬감 있는 동작", "부위별 압 조절"],
    flow: "주로 사용하는 부위와 피로감을 확인한 뒤, 해당 부위를 중심으로 리듬감 있게 관리합니다.",
    time: "부분 집중은 60분, 전신 컨디션 관리에는 90분을 추천합니다.",
    diff: "딥티슈가 뭉침 해소 중심이라면, 스포츠마사지는 활동 부위의 컨디션 관리에 가깝습니다.",
  },
  lymph: {
    intro: "가볍고 일정한 압으로 몸이 무겁게 느껴질 때 편안함을 돕는 관리입니다.",
    what: "림프마사지는 가볍고 느린 동작으로 몸을 부드럽게 쓸어주어 무거운 느낌을 줄이는 데 도움을 주는 방식입니다.",
    when: ["오래 앉아 있거나 이동이 많아 몸이 무거울 때", "강한 압보다 가벼운 관리를 원할 때", "전신을 가볍게 정돈하고 싶을 때"],
    feature: ["가볍고 일정한 압", "느리고 부드러운 동작", "전신을 고르게 정돈"],
    flow: "무겁게 느껴지는 부위를 확인한 뒤, 가벼운 압으로 전신을 천천히 정돈하며 진행합니다.",
    time: "가벼운 정돈에는 60분, 전신 관리에는 90분을 추천합니다.",
    diff: "딥티슈가 강한 압이라면, 림프마사지는 가장 가벼운 압으로 편안함을 돕는 데 가깝습니다.",
  },
};

// 메인 페이지 FAQ
const mainFaq = [
  { q: "예약은 어떻게 하나요?", a: `전화(${phone}) 또는 문자로 지역, 희망 시간, 관리 종류를 알려주시면 가능한 시간대를 안내해드립니다.` },
  { q: "결제는 어떻게 진행되나요?", a: "결제 방법은 예약 시 안내드리며, 추가 출장비가 있는 경우 사전에 명확히 알려드립니다. 숨겨진 비용은 없습니다." },
  { q: "어떤 장소에서 받을 수 있나요?", a: "자택, 오피스텔, 호텔·숙소 등에서 가능합니다. 공동현관·주차·객실 방문 규정을 미리 확인하면 진행이 매끄럽습니다." },
  { q: "위생 관리는 어떻게 하나요?", a: "1회용품과 청결한 용품을 사용하며, 위생을 우선으로 관리합니다." },
  { q: "관리사는 어떻게 배정되나요?", a: "지역과 예약 시간에 맞춰 배정되며, 요청 사항이 있으면 가능한 범위에서 반영합니다." },
  { q: "예약 취소·변경이 가능한가요?", a: "가능합니다. 일정 변경이 필요하면 가급적 빨리 연락 주시면 조정을 도와드립니다." },
];

/* ===================== 3. 공통 HTML 헬퍼 ===================== */
const navHtml = `
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="${brand} 홈">
      <span class="logo">${brandEn}</span><span class="ko">${brand}</span>
    </a>
    <nav class="nav" aria-label="주 메뉴">
      <div class="nav-item">
        <a href="/#services">서비스 안내</a>
        <div class="dropdown">
          ${services.map((s) => `<a href="/services/${s.slug}/">${s.name}</a>`).join("\n          ")}
        </div>
      </div>
      <div class="nav-item">
        <a href="/areas/">출장 가능 지역</a>
        <div class="dropdown cols-2">
          ${regions.map((r) => `<a href="/areas/${r.slug}/">${r.name}</a>`).join("\n          ")}
        </div>
      </div>
      <div class="nav-item"><a href="/#how">이용 방법</a></div>
      <div class="nav-item"><a href="/#price">요금 안내</a></div>
      <div class="nav-item"><a href="/#faq">FAQ</a></div>
      <div class="nav-item"><a href="/#contact">예약 문의</a></div>
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
        <p>수원·전국 출장마사지 예약 안내. 건전한 웰니스/휴식 관리를 제공하며, 의료 행위가 아닙니다.</p>
        <p style="margin-top:10px;color:var(--accent);font-weight:700;font-size:16px;">${phone}</p>
      </div>
      <div>
        <h4>서비스 안내</h4>
        ${services.map((s) => `<a href="/services/${s.slug}/">${s.name}</a>`).join("\n        ")}
      </div>
      <div>
        <h4>출장 가능 지역</h4>
        <a href="/areas/">전체 지역 보기</a>
        <a href="/areas/gyeonggi/suwon/">수원 출장마사지</a>
        <a href="/areas/seoul/">서울 출장마사지</a>
        <a href="/areas/gyeonggi/">경기 출장마사지</a>
        <a href="/areas/incheon/">인천 출장마사지</a>
      </div>
    </div>
    <div class="footer-legal">
      <div>상호: ${brand} · 대표 책임자: 고객센터 운영팀 · 고객센터: ${phone}</div>
      <div class="disclaimer">
        본 사이트는 건전한 휴식·웰니스 관리를 안내합니다. 질병의 치료·완치 등 의료 효과를 보장하지 않으며 의료 행위가 아닙니다.
        모든 안내 문구는 고객센터 운영팀이 작성·검수합니다. © ${buildDate.slice(0, 4)} ${brand}.
      </div>
    </div>
  </div>
</footer>`;
}

function layout({ title, description, canonicalPath, jsonLd = [], bodyContent, ogType = "website", isHome = false }) {
  const canonical = siteUrl + canonicalPath;
  const verifyMeta = isHome
    ? `\n  <meta name="naver-site-verification" content="${naverVerify}">\n  <meta name="google-site-verification" content="${googleVerify}">`
    : "";
  const ld = jsonLd
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join("\n  ");
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index,follow">${verifyMeta}
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

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand,
  url: siteUrl,
  telephone: phone,
  image: `${siteUrl}/assets/og-image.svg`,
  description: "수원·전국 출장마사지 예약 안내. 건전한 웰니스/휴식 관리.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: phone,
    contactType: "reservations",
    areaServed: "KR",
    availableLanguage: "Korean",
  },
};

function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function serviceJsonLd({ name, description, url, areaServed }) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: name,
    name,
    description,
    url,
    provider: { "@type": "Organization", name: brand, telephone: phone, url: siteUrl },
  };
  if (areaServed) obj.areaServed = areaServed;
  return obj;
}

function faqBlock(faqs) {
  return `
  <div class="faq-list">
    ${faqs
      .map(
        (f) => `<div class="faq-item">
      <button class="faq-q" aria-expanded="false"><span>${f.q}</span><span class="mark">+</span></button>
      <div class="faq-a"><div>${f.a}</div></div>
    </div>`
      )
      .join("\n    ")}
  </div>`;
}

function sidebarHtml(extraLinks = "") {
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
    ${extraLinks}
  </aside>`;
}

/* ===================== 4. 페이지 생성 ===================== */
async function writeFile(relPath, content) {
  const full = path.join(ROOT, relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf8");
  return relPath;
}

// ---- 메인 페이지 ----
function buildHome() {
  const body = `
<main>
  <section class="hero">
    <div class="wrap">
      <span class="eyebrow">수원 · 전국 출장마사지</span>
      <h1>집·오피스텔·호텔 어디서나<br><span class="hl">${brand}</span>로 편안한 휴식을</h1>
      <p class="lead">예약 전 꼭 확인해야 할 서비스·지역·요금·이용 방법을 한 화면에서 빠르게 확인하세요. 컨디션에 맞춘 압 조절로 건전한 웰니스 관리를 제공합니다.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="${telHref}">📞 전화예약 ${phone}</a>
        <a class="btn btn-ghost" href="/areas/">📍 출장 가능 지역 보기</a>
      </div>
      <div class="hero-meta">
        <span><b>24시간</b> 예약 상담</span>
        <span><b>수원 전역</b> + 전국 시도</span>
        <span><b>1회용품</b> 위생 관리</span>
        <span><b>당일 예약</b> 가능</span>
      </div>
    </div>
  </section>

  <section id="trust">
    <div class="wrap">
      <div class="trust-grid">
        <div class="trust-card"><h3>운영 안내</h3><p>24시간 예약 상담을 받으며, 지역과 시간대에 맞춰 가능한 일정을 안내합니다.</p></div>
        <div class="trust-card"><h3>서비스 범위</h3><p>스웨디시·아로마·딥티슈 등 휴식 중심의 웰니스 관리만 제공하며, 의료 행위가 아닙니다.</p></div>
        <div class="trust-card"><h3>상담 기준</h3><p>원하는 압과 집중 부위, 방문 장소 조건을 먼저 확인한 뒤 컨디션에 맞춰 진행합니다.</p></div>
      </div>
    </div>
  </section>

  <section id="services">
    <div class="wrap">
      <div class="section-head">
        <span class="kicker">SERVICE</span>
        <h2>서비스 안내</h2>
        <p>휴식과 긴장 완화를 위한 대표 관리입니다. 컨디션에 맞춰 압을 조절합니다.</p>
      </div>
      <div class="card-grid">
        ${services
          .map(
            (s) => `<a class="svc-card" href="/services/${s.slug}/">
          <div class="ico">${s.icon}</div>
          <h3>${s.name}</h3>
          <p>${s.short}</p>
          <span class="more">자세히 보기 →</span>
        </a>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section id="areas">
    <div class="wrap">
      <div class="section-head">
        <span class="kicker">AREA</span>
        <h2>출장 가능 지역</h2>
        <p>수원을 중심으로 전국 시도 단위 출장이 가능합니다. 지역별 이용 조건을 확인하세요.</p>
      </div>
      <div class="area-grid">
        <a class="area-chip" href="/areas/gyeonggi/suwon/">수원<span>장안·권선·팔달·영통</span></a>
        ${regions
          .map((r) => `<a class="area-chip" href="/areas/${r.slug}/">${r.name}<span>${r.titleArea}</span></a>`)
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section id="how">
    <div class="wrap">
      <div class="section-head">
        <span class="kicker">HOW IT WORKS</span>
        <h2>이용 방법</h2>
        <p>예약부터 마무리까지 절차가 간단합니다.</p>
      </div>
      <div class="step-grid">
        <div class="step"><div class="num">1</div><h3>예약 문의</h3><p>전화·문자로 지역, 시간, 관리 종류를 알려주세요.</p></div>
        <div class="step"><div class="num">2</div><h3>일정 확인</h3><p>가능한 시간대와 출장비를 안내드립니다.</p></div>
        <div class="step"><div class="num">3</div><h3>방문 준비</h3><p>공동현관·주차·객실 규정을 미리 확인합니다.</p></div>
        <div class="step"><div class="num">4</div><h3>관리 진행</h3><p>상담 후 컨디션에 맞춘 압으로 진행합니다.</p></div>
        <div class="step"><div class="num">5</div><h3>결제·마무리</h3><p>안내된 방법으로 결제하고 마무리합니다.</p></div>
      </div>
      <div class="callout" style="margin-top:20px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px;color:var(--muted);font-size:14px;">
        <strong style="color:var(--text);">관리 전 준비사항:</strong> 샤워 후 편안한 상태가 좋으며, 방문 장소의 공동현관·주차 정보를 미리 알려주시면 진행이 매끄럽습니다.
        <strong style="color:var(--text);"> 취소·환불:</strong> 일정 변경은 가급적 빨리 연락 주시면 조정해 드립니다.
      </div>
    </div>
  </section>

  <section id="price">
    <div class="wrap">
      <div class="section-head">
        <span class="kicker">PRICE</span>
        <h2>요금 안내</h2>
        <p>관리 시간 기준 안내입니다. 정확한 요금과 출장비는 예약 시 안내드립니다.</p>
      </div>
      <div class="price-grid">
        <div class="price-card">
          <div class="time">60분 코스</div>
          <div class="price">예약 시 안내<small></small></div>
          <ul><li>전신 기본 관리</li><li>처음 이용 시 추천</li><li>컨디션 압 조절</li></ul>
        </div>
        <div class="price-card featured">
          <div class="time">90분 코스</div>
          <div class="price">예약 시 안내<small></small></div>
          <ul><li>전신 + 집중 부위</li><li>가장 많이 찾는 코스</li><li>충분한 이완</li></ul>
        </div>
        <div class="price-card">
          <div class="time">120분 코스</div>
          <div class="price">예약 시 안내<small></small></div>
          <ul><li>전신 + 스트레칭/집중</li><li>여유로운 관리</li><li>심화 휴식</li></ul>
        </div>
      </div>
      <p class="price-note">※ 지역·시간대에 따라 추가 출장비가 발생할 수 있으며, 심야·장거리 이동은 예약 시 사전 안내드립니다. 숨겨진 비용은 없습니다.</p>
    </div>
  </section>

  <section id="faq">
    <div class="wrap">
      <div class="section-head">
        <span class="kicker">FAQ</span>
        <h2>자주 묻는 질문</h2>
        <p>예약·결제·장소·위생·배정·취소 관련 질문을 모았습니다.</p>
      </div>
      ${faqBlock(mainFaq)}
    </div>
  </section>

  <section id="contact">
    <div class="wrap">
      <div class="cta-final">
        <h2>지금 편안한 휴식을 예약하세요</h2>
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
    title: `${brand} | 수원·전국 출장마사지 예약 안내`,
    description: `${brand} 수원 전역과 전국 시도 출장마사지 예약 안내. 스웨디시·아로마·딥티슈 등 건전한 웰니스 관리. 24시간 예약 상담 ${phone}.`,
    canonicalPath: "/",
    isHome: true,
    jsonLd: [orgJsonLd, faqJsonLd(mainFaq)],
    bodyContent: body,
  });
}

// ---- 서비스 상세 ----
function buildService(s) {
  const d = serviceDetails[s.slug];
  const url = `${siteUrl}/services/${s.slug}/`;
  const faqs = [
    { q: `${s.name}는 어떤 분께 맞나요?`, a: `${d.when[0]} 등 ${d.intro}` },
    { q: "관리 시간은 얼마나 걸리나요?", a: d.time },
    { q: "압 조절이 가능한가요?", a: "네, 상담 시 원하는 압과 집중 부위를 알려주시면 컨디션에 맞춰 조절합니다." },
    { q: "출장으로도 받을 수 있나요?", a: `네, 수원 전역과 전국 시도로 출장 가능합니다. 전화(${phone})로 지역과 시간을 알려주세요.` },
  ];
  const sideLinks = `
    <div class="side-card">
      <h4>다른 서비스</h4>
      <div class="side-links">
        ${services.filter((x) => x.slug !== s.slug).map((x) => `<a href="/services/${x.slug}/">${x.name}</a>`).join("\n        ")}
      </div>
    </div>`;
  const body = `
<main>
  <div class="page-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> › <a href="/#services">서비스 안내</a> › ${s.name}</div>
      <h1>${s.name} 출장마사지 서비스 안내</h1>
      <p>${d.intro}</p>
    </div>
  </div>
  <div class="article">
    <div class="wrap article-grid">
      <article class="prose">
        <h2>${s.name}란?</h2>
        <p>${d.what}</p>

        <h2>이런 경우에 좋아요</h2>
        <ul>${d.when.map((x) => `<li>${x}</li>`).join("")}</ul>

        <h2>특징</h2>
        <ul>${d.feature.map((x) => `<li>${x}</li>`).join("")}</ul>

        <h2>관리 진행 방식</h2>
        <p>${d.flow}</p>

        <h2>추천 관리 시간</h2>
        <p>${d.time}</p>

        <h2>다른 마사지와의 차이</h2>
        <p>${d.diff}</p>

        <h2>이용 전 준비사항</h2>
        <ul>
          <li>샤워 후 편안한 상태에서 받으시면 좋습니다.</li>
          <li>방문 장소의 공동현관·주차 정보를 미리 알려주세요.</li>
          <li>건강상 주의가 필요한 부분이 있다면 상담 시 알려주세요.</li>
        </ul>

        <h2>예약 전 확인사항</h2>
        <div class="callout">${s.name}는 건전한 휴식·웰니스 관리이며 의료 행위가 아닙니다. 질병의 치료·완치 효과를 보장하지 않습니다. 예약 시 지역, 희망 시간, 원하는 압을 함께 알려주시면 일정 안내가 빠릅니다.</div>

        <h2>자주 묻는 질문</h2>
        ${faqBlock(faqs)}
      </article>
      ${sidebarHtml(sideLinks)}
    </div>
  </div>
</main>`;

  return layout({
    title: `${s.name} 출장마사지 | ${brand}`,
    description: `${s.name} 출장마사지 안내 - ${d.intro} 수원·전국 출장 가능, 예약 ${phone}.`,
    canonicalPath: `/services/${s.slug}/`,
    ogType: "article",
    jsonLd: [serviceJsonLd({ name: `${s.name} 출장마사지`, description: d.intro, url }), faqJsonLd(faqs)],
    bodyContent: body,
  });
}

// ---- 지역(시도) 상세 ----
function buildRegion(r) {
  const url = `${siteUrl}/areas/${r.slug}/`;
  const sideLinks = `
    <div class="side-card">
      <h4>다른 지역</h4>
      <div class="side-links">
        <a href="/areas/gyeonggi/suwon/">수원 출장마사지</a>
        ${regions.filter((x) => x.slug !== r.slug).slice(0, 7).map((x) => `<a href="/areas/${x.slug}/">${x.name} 출장마사지</a>`).join("\n        ")}
        <a href="/areas/">전체 지역 보기</a>
      </div>
    </div>`;
  const body = `
<main>
  <div class="page-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> › <a href="/areas/">출장 가능 지역</a> › ${r.name}</div>
      <h1>${r.name} 출장마사지 서비스 안내</h1>
      <p>${r.blurb}</p>
    </div>
  </div>
  <div class="article">
    <div class="wrap article-grid">
      <article class="prose">
        <h2>${r.name} 출장마사지 이용 안내</h2>
        <p>${r.blurb}</p>

        <h2>주요 권역별 안내</h2>
        <div class="zone-grid">
          ${r.zones.map((z) => `<div class="zone-card"><h4>${z}</h4></div>`).join("\n          ")}
        </div>

        <h2>방문 시 확인할 점</h2>
        <p>${r.move}</p>
        <ul>
          <li>방문 장소(자택·오피스텔·숙소)의 공동현관 출입 방식</li>
          <li>주차 가능 여부 또는 인근 주차 안내</li>
          <li>숙소의 경우 객실 방문 가능 여부</li>
        </ul>

        <h2>추천 관리</h2>
        <p>${r.rec}</p>

        <h2>이용 전 준비사항</h2>
        <ul>
          <li>샤워 후 편안한 상태가 좋습니다.</li>
          <li>정확한 주소와 출입 동선을 미리 알려주세요.</li>
          <li>원하는 관리 종류와 압을 함께 알려주시면 좋습니다.</li>
        </ul>

        <h2>출장비 판단 기준</h2>
        <div class="callout">${r.name} 기본 권역은 동일하게 안내되며, 외곽·심야·장거리 이동은 이동 거리와 시간에 따라 출장비가 달라질 수 있습니다. 예약 시 정확히 안내드리며 숨겨진 비용은 없습니다.</div>

        <h2>자주 묻는 질문</h2>
        ${faqBlock(r.faq)}

        <h2>예약 문의</h2>
        <p>${r.name} 지역 예약은 전화(${phone}) 또는 문자로 지역과 희망 시간을 알려주시면 가능한 일정을 안내드립니다.</p>
      </article>
      ${sidebarHtml(sideLinks)}
    </div>
  </div>
</main>`;

  return layout({
    title: `${r.name} 출장마사지 | ${brand}`,
    description: `${r.name} 출장마사지 - ${r.zones.slice(0, 3).join(", ")} 등 생활권별 방문 조건과 ${r.move} ${r.rec.split(",")[0]} 예약 ${phone}.`.replace(/\s+/g, " "),
    canonicalPath: `/areas/${r.slug}/`,
    ogType: "article",
    jsonLd: [
      serviceJsonLd({ name: `${r.name} 출장마사지`, description: r.blurb, url, areaServed: r.name }),
      faqJsonLd(r.faq),
    ],
    bodyContent: body,
  });
}

// ---- 수원 허브 ----
function buildSuwonHub() {
  const url = `${siteUrl}/areas/gyeonggi/suwon/`;
  const blurb = "수원은 장안·권선·팔달·영통 4개 구가 각각 다른 생활권을 가집니다. 신도시 아파트·오피스텔과 오래된 주거권, 번화가 상권이 섞여 있어 구별로 방문 조건과 출입 방식이 다릅니다. 세븐록 마사지는 수원 전역으로 출장하며, 각 구의 생활권과 예약 조건에 맞춰 안내합니다.";
  const faqs = [
    { q: "수원 어느 구까지 출장 가능한가요?", a: "장안구·권선구·팔달구·영통구 등 수원 전역으로 출장 가능합니다. 외곽은 이동 시간만 추가로 확인합니다." },
    { q: "신도시(광교·호매실) 단지도 방문 가능한가요?", a: "가능합니다. 신축 단지는 공동현관·방문차량 등록 방식을 미리 알려주시면 출입이 매끄럽습니다." },
    { q: "수원역·인계동 숙소도 되나요?", a: "가능합니다. 숙소 객실 방문 규정만 사전에 확인합니다." },
    { q: "당일 예약도 가능한가요?", a: `가능합니다. 전화(${phone})로 지역과 희망 시간을 알려주시면 가능한 일정을 안내드립니다.` },
  ];
  const sideLinks = `
    <div class="side-card">
      <h4>수원 구별 안내</h4>
      <div class="side-links">
        ${suwonDistricts.map((d) => `<a href="/areas/gyeonggi/suwon/${d.slug}/">${d.name} 출장마사지</a>`).join("\n        ")}
      </div>
    </div>`;
  const body = `
<main>
  <div class="page-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> › <a href="/areas/">출장 가능 지역</a> › <a href="/areas/gyeonggi/">경기</a> › 수원</div>
      <h1>수원 출장마사지 서비스 안내</h1>
      <p>${blurb}</p>
    </div>
  </div>
  <div class="article">
    <div class="wrap article-grid">
      <article class="prose">
        <h2>수원 출장마사지 이용 안내</h2>
        <p>${blurb}</p>

        <h2>구별 안내</h2>
        <div class="zone-grid">
          ${suwonDistricts
            .map(
              (d) => `<a class="zone-card" href="/areas/gyeonggi/suwon/${d.slug}/" style="text-decoration:none;">
            <h4>${d.name} →</h4>
            <p>${d.blurb.slice(0, 60)}…</p>
          </a>`
            )
            .join("\n          ")}
        </div>

        <h2>추천 관리</h2>
        <p>좌식 근무·가사 후 어깨·허리 뭉침에는 딥티슈, 전반적인 휴식에는 스웨디시나 아로마테라피가 좋습니다.</p>

        <h2>이용 전 준비사항</h2>
        <ul>
          <li>샤워 후 편안한 상태가 좋습니다.</li>
          <li>정확한 주소와 공동현관·주차 정보를 미리 알려주세요.</li>
          <li>신도시 단지는 방문차량 등록 여부를 확인해 주세요.</li>
        </ul>

        <h2>출장비 판단 기준</h2>
        <div class="callout">수원 시내 기본 권역은 동일하게 안내됩니다. 외곽·심야·장거리 이동은 이동 거리와 시간에 따라 출장비가 달라질 수 있어 예약 시 정확히 안내드립니다.</div>

        <h2>자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2>예약 문의</h2>
        <p>수원 예약은 전화(${phone}) 또는 문자로 구·동과 희망 시간을 알려주시면 가능한 일정을 안내드립니다.</p>
      </article>
      ${sidebarHtml(sideLinks)}
    </div>
  </div>
</main>`;

  return layout({
    title: `수원 출장마사지 | 장안·권선·팔달·영통 | ${brand}`,
    description: `수원 출장마사지 안내 - 장안구·권선구·팔달구·영통구 생활권별 방문 조건과 출장비 기준. 건전한 웰니스 관리, 예약 ${phone}.`,
    canonicalPath: "/areas/gyeonggi/suwon/",
    ogType: "article",
    jsonLd: [
      serviceJsonLd({ name: "수원 출장마사지", description: blurb, url, areaServed: "수원시" }),
      faqJsonLd(faqs),
    ],
    bodyContent: body,
  });
}

// ---- 수원 구 상세 ----
function buildSuwonDistrict(d) {
  const url = `${siteUrl}/areas/gyeonggi/suwon/${d.slug}/`;
  const sideLinks = `
    <div class="side-card">
      <h4>수원 다른 구</h4>
      <div class="side-links">
        <a href="/areas/gyeonggi/suwon/">수원 전체</a>
        ${suwonDistricts.filter((x) => x.slug !== d.slug).map((x) => `<a href="/areas/gyeonggi/suwon/${x.slug}/">${x.name} 출장마사지</a>`).join("\n        ")}
      </div>
    </div>`;
  const body = `
<main>
  <div class="page-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> › <a href="/areas/">지역</a> › <a href="/areas/gyeonggi/">경기</a> › <a href="/areas/gyeonggi/suwon/">수원</a> › ${d.name}</div>
      <h1>수원 ${d.name} 출장마사지 서비스 안내</h1>
      <p>${d.blurb}</p>
    </div>
  </div>
  <div class="article">
    <div class="wrap article-grid">
      <article class="prose">
        <h2>${d.name} 출장마사지 이용 안내</h2>
        <p>${d.blurb}</p>

        <h2>주요 권역별 안내</h2>
        <div class="zone-grid">
          ${d.zones.map((z) => `<div class="zone-card"><h4>${z.h}</h4><p>${z.p}</p></div>`).join("\n          ")}
        </div>

        <h2>방문 시 확인할 점</h2>
        <p>${d.move}</p>
        <ul>
          <li>정확한 주소와 공동현관 출입 방식</li>
          <li>주차 가능 여부 또는 인근 주차 안내</li>
          <li>아파트 단지의 경우 방문차량 등록 여부</li>
        </ul>

        <h2>추천 관리</h2>
        <p>${d.rec}</p>

        <h2>이용 전 준비사항</h2>
        <ul>
          <li>샤워 후 편안한 상태가 좋습니다.</li>
          <li>건강상 주의가 필요한 부분은 상담 시 알려주세요.</li>
          <li>원하는 관리 종류와 압을 함께 알려주시면 좋습니다.</li>
        </ul>

        <h2>출장비 판단 기준</h2>
        <div class="callout">${d.name} 기본 권역은 수원 시내 기준으로 안내됩니다. 외곽·심야 이동은 출장비가 달라질 수 있어 예약 시 정확히 안내드립니다.</div>

        <h2>자주 묻는 질문</h2>
        ${faqBlock(d.faq)}

        <h2>예약 문의</h2>
        <p>${d.name} 예약은 전화(${phone}) 또는 문자로 동·건물 정보와 희망 시간을 알려주시면 가능한 일정을 안내드립니다.</p>
      </article>
      ${sidebarHtml(sideLinks)}
    </div>
  </div>
</main>`;

  return layout({
    title: `수원 ${d.name} 출장마사지 | ${brand}`,
    description: `수원 ${d.name} 출장마사지 - ${d.zones.map((z) => z.h).join(", ")} 등 생활권별 방문 조건. ${d.rec.split(",")[0]} 예약 ${phone}.`.replace(/\s+/g, " "),
    canonicalPath: `/areas/gyeonggi/suwon/${d.slug}/`,
    ogType: "article",
    jsonLd: [
      serviceJsonLd({ name: `수원 ${d.name} 출장마사지`, description: d.blurb, url, areaServed: `수원시 ${d.name}` }),
      faqJsonLd(d.faq),
    ],
    bodyContent: body,
  });
}

// ---- 지역 인덱스 ----
function buildAreasIndex() {
  const body = `
<main>
  <div class="page-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> › 출장 가능 지역</div>
      <h1>출장 가능 지역 안내</h1>
      <p>${brand}는 수원을 중심으로 전국 시도 단위 출장이 가능합니다. 지역을 선택하면 생활권별 방문 조건과 출장비 기준을 확인할 수 있습니다.</p>
    </div>
  </div>
  <div class="article">
    <div class="wrap">
      <div class="section-head"><span class="kicker">SUWON</span><h2>수원 중심 안내</h2></div>
      <div class="area-grid">
        <a class="area-chip" href="/areas/gyeonggi/suwon/">수원 전체<span>4개 구 안내</span></a>
        ${suwonDistricts.map((d) => `<a class="area-chip" href="/areas/gyeonggi/suwon/${d.slug}/">${d.name}<span>수원시</span></a>`).join("\n        ")}
      </div>
      <div class="section-head" style="margin-top:48px;"><span class="kicker">NATIONWIDE</span><h2>전국 시도</h2></div>
      <div class="area-grid">
        ${regions.map((r) => `<a class="area-chip" href="/areas/${r.slug}/">${r.name}<span>${r.titleArea}</span></a>`).join("\n        ")}
      </div>
    </div>
  </div>
</main>`;
  return layout({
    title: `출장 가능 지역 | ${brand}`,
    description: `${brand} 출장 가능 지역 안내 - 수원 전역과 전국 시도. 지역별 방문 조건과 출장비 기준을 확인하세요. 예약 ${phone}.`,
    canonicalPath: "/areas/",
    jsonLd: [orgJsonLd],
    bodyContent: body,
  });
}

/* ===================== 5. SEO 파일 ===================== */
function collectUrls() {
  const urls = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/areas/", priority: "0.8", changefreq: "weekly" },
    { loc: "/areas/gyeonggi/suwon/", priority: "0.9", changefreq: "weekly" },
  ];
  services.forEach((s) => urls.push({ loc: `/services/${s.slug}/`, priority: "0.8", changefreq: "monthly" }));
  regions.forEach((r) => urls.push({ loc: `/areas/${r.slug}/`, priority: "0.7", changefreq: "weekly" }));
  suwonDistricts.forEach((d) => urls.push({ loc: `/areas/gyeonggi/suwon/${d.slug}/`, priority: "0.8", changefreq: "weekly" }));
  return urls;
}

function buildSitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${siteUrl}${u.loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

function buildRss(urls) {
  const titleFor = (loc) => {
    if (loc === "/") return `${brand} 홈`;
    if (loc === "/areas/") return "출장 가능 지역";
    if (loc === "/areas/gyeonggi/suwon/") return "수원 출장마사지";
    const svc = services.find((s) => loc === `/services/${s.slug}/`);
    if (svc) return `${svc.name} 출장마사지`;
    const reg = regions.find((r) => loc === `/areas/${r.slug}/`);
    if (reg) return `${reg.name} 출장마사지`;
    const dist = suwonDistricts.find((d) => loc === `/areas/gyeonggi/suwon/${d.slug}/`);
    if (dist) return `수원 ${dist.name} 출장마사지`;
    return brand;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${brand}</title>
    <link>${siteUrl}/</link>
    <description>수원·전국 출장마사지 예약 안내</description>
    <language>ko</language>
    <lastBuildDate>${new Date(buildDate).toUTCString()}</lastBuildDate>
${urls
  .map(
    (u) => `    <item>
      <title>${titleFor(u.loc)}</title>
      <link>${siteUrl}${u.loc}</link>
      <guid>${siteUrl}${u.loc}</guid>
      <description>${titleFor(u.loc)} 안내</description>
      <pubDate>${new Date(buildDate).toUTCString()}</pubDate>
    </item>`
  )
  .join("\n")}
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

/* ===================== 6. 빌드 실행 ===================== */
async function main() {
  const written = [];
  written.push(await writeFile("index.html", buildHome()));
  written.push(await writeFile("areas/index.html", buildAreasIndex()));
  written.push(await writeFile("areas/gyeonggi/suwon/index.html", buildSuwonHub()));

  for (const s of services) written.push(await writeFile(`services/${s.slug}/index.html`, buildService(s)));
  for (const r of regions) written.push(await writeFile(`areas/${r.slug}/index.html`, buildRegion(r)));
  for (const d of suwonDistricts) written.push(await writeFile(`areas/gyeonggi/suwon/${d.slug}/index.html`, buildSuwonDistrict(d)));

  const urls = collectUrls();
  const sitemap = buildSitemap(urls);
  written.push(await writeFile("sitemap.xml", sitemap));
  written.push(await writeFile("sitemap1.xml", sitemap));
  written.push(await writeFile("rss.xml", buildRss(urls)));
  written.push(await writeFile("robots.txt", robotsTxt));

  console.log(`✅ ${written.length}개 파일 생성 완료 (siteUrl: ${siteUrl})`);
  written.forEach((f) => console.log("  - " + f));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
