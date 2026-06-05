#!/usr/bin/env node
/**
 * 세븐록 마사지 / 수원 출장마사지 정적 사이트 생성기
 * 메뉴: 홈 · 수원출장마사지 · 코스안내 · 지역별 출장마사지(메가) · 예약안내 · 이용가이드 · 고객후기 · 고객센터
 *
 * URL 구조:
 *   /                         홈(허브)
 *   /suwon/                   수원 대표 페이지
 *   /suwon/<gu>/              구 허브
 *   /suwon/<gu>/<dong>/       동 페이지(29개)
 *   /course/ , /course/<slug>/
 *   /reservation/ /guide/ /reviews/ /reviews/<gu>/ /customer/ /privacy-policy/
 *
 * 다음 사이트 재사용 시 상단 상수 + 데이터만 수정하세요.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

/* ===================== 1. 기본 값 ===================== */
const siteUrl = "https://sevenrock-massage.pages.dev"; // 커스텀 도메인 연결 후 교체
const brand = "세븐록 마사지";
const brandEn = "SEVENROCK";
const phone = "0508-202-4743";
const telHref = "tel:0508-202-4743";
const smsHref = "sms:0508-202-4743";
const buildDate = "2026-06-05";
const naverVerify = "여기에-네이버-인증코드";
const googleVerify = "여기에-구글-인증코드";

/* ===================== 2. 데이터 ===================== */
// 코스
const courses = [
  { slug: "relax", name: "피로 회복 관리", icon: "🌿",
    short: "부드럽고 일정한 압으로 전신 긴장을 풀어주는 기본 휴식 관리.",
    intro: "하루의 긴장으로 몸이 무겁게 느껴질 때 부드럽고 일정한 압으로 전신을 편안하게 풀어주는 휴식 중심 관리입니다.",
    when: ["종일 긴장이 이어져 몸이 무거울 때", "강한 자극보다 부드러운 휴식이 필요할 때", "처음 방문 관리를 받아 압 조절이 걱정될 때"],
    feat: ["오일을 사용한 부드러운 동작", "전신을 고르게 쓸어주는 리듬", "컨디션에 맞춘 압 조절"],
    time: "처음이라면 60분, 충분한 이완에는 90분을 추천합니다." },
  { slug: "aroma", name: "아로마 관리", icon: "🕯️",
    short: "향과 오일로 호흡을 가라앉히고 편안하게 이완하는 관리.",
    intro: "오일의 향과 부드러운 동작을 함께 사용해 편안한 분위기에서 호흡을 가라앉히며 이완하는 관리입니다.",
    when: ["하루를 마무리하며 편안히 쉬고 싶을 때", "긴장으로 호흡이 얕게 느껴질 때", "부드러운 분위기의 휴식을 원할 때"],
    feat: ["향을 활용한 편안한 분위기", "느리고 부드러운 동작", "호흡을 가라앉히는 마무리"],
    time: "편안한 이완에는 90분을 권장하며 60분도 가능합니다." },
  { slug: "sports", name: "스포츠 관리", icon: "🏃",
    short: "활동량이 많은 분의 컨디션을 가다듬는 리듬감 있는 관리.",
    intro: "운동·활동으로 피로가 쌓이기 쉬운 부위를 리듬감 있게 관리해 컨디션을 가다듬는 관리입니다.",
    when: ["운동·활동량이 많아 다리·어깨가 무거울 때", "활동 전후 컨디션을 정돈하고 싶을 때", "특정 부위 피로가 반복될 때"],
    feat: ["활동 부위 중심 관리", "리듬감 있는 동작", "부위별 압 조절"],
    time: "부분 집중 60분, 전신 컨디션 관리 90분을 추천합니다." },
  { slug: "couple", name: "커플/가족 관리", icon: "👫",
    short: "두 분이 함께 받는 2인 동시 방문 관리.",
    intro: "가족·연인 등 두 분이 같은 공간에서 함께 받을 수 있는 2인 동시 방문 관리입니다. 일정과 인원에 맞춰 안내드립니다.",
    when: ["둘이 함께 편안한 휴식을 원할 때", "기념일 등 함께하는 시간이 필요할 때", "같은 시간대에 동시 관리를 원할 때"],
    feat: ["2인 동시 진행", "각자 원하는 압·코스 선택 가능", "함께하는 편안한 분위기"],
    time: "코스별 60~120분 중 선택 가능하며 예약 시 인원을 알려주세요." },
  { slug: "corporate", name: "기업/단체 방문 관리", icon: "🏢",
    short: "사무실·행사장 등으로 방문하는 단체 관리.",
    intro: "사무실, 행사장 등으로 방문해 임직원·참가자의 컨디션 관리를 돕는 단체 방문 관리입니다. 인원과 장소에 맞춰 협의 후 진행합니다.",
    when: ["임직원 복지·행사 프로그램이 필요할 때", "단체 인원이 같은 장소에서 관리를 원할 때", "일정에 맞춘 방문 운영이 필요할 때"],
    feat: ["인원·시간 맞춤 운영", "방문 장소 협의 진행", "단체 일정 조율"],
    time: "인원·코스에 따라 달라지며 사전 협의로 안내드립니다." },
];
const courseSlugs = courses.map((c) => c.slug);

// 수원 구 / 동 (행정동 묶음 기준)
const suwonGu = [
  {
    slug: "jangan-gu", name: "장안구",
    intro: "수원 장안구는 광교산 자락의 조원·연무 주거권, 만석공원과 화서역 인근 대단지, 성균관대·율전역 생활권이 함께 있는 지역입니다. 오래된 단독·빌라와 대규모 아파트가 섞여 있어 방문 전 정확한 주소와 출입 방식 확인이 중요합니다.",
    move: "북수원IC 진입은 원활하나 노후 주거권은 주차 공간을, 대단지는 공동현관·동호수를 미리 확인합니다.",
    rec: "가사·좌식 후 어깨·허리 뭉침에는 스포츠 관리, 전반적 휴식에는 피로 회복 관리를 추천합니다.",
    faq: [
      { q: "장안구 어디까지 방문 가능한가요?", a: "정자·조원·연무동 등 장안구 전역 방문이 가능하며, 광교산 인근 외곽은 이동 시간만 추가로 확인합니다." },
      { q: "성균관대(율전) 인근 원룸도 되나요?", a: "가능합니다. 원룸·오피스텔은 공동현관 출입 방식만 미리 알려주시면 됩니다." },
    ],
    dongs: [
      { slug: "pajang-dong", name: "파장동", intro: "장안구 파장동은 북수원 파장시장과 만석거, 노송지대 인근 생활권으로 단독·빌라 주거 방문 문의가 많은 지역입니다.", zone: "북수원·파장시장·만석거 인근", landmark: "파장시장",
        faq: { q: "파장동 단독·빌라도 방문 가능한가요?", a: "가능합니다. 정확한 주소와 출입구 위치, 주차 가능 여부를 미리 알려주시면 도착이 매끄럽습니다." } },
      { slug: "yulcheon-dong", name: "율천동", intro: "장안구 율천동은 율전동·천천동 일대로 성균관대 자연과학캠퍼스와 율전역(1호선) 인근 생활권이라 원룸·오피스텔 방문 문의가 많습니다.", zone: "성균관대·율전역 인근", landmark: "성균관대 자연과학캠퍼스",
        faq: { q: "율천동 원룸촌도 방문 되나요?", a: "가능합니다. 대학가 원룸·오피스텔은 공동현관 비밀번호나 출입 방식을 미리 알려주시면 됩니다." } },
      { slug: "jeongja-dong", name: "정자동", intro: "장안구 정자동은 만석공원과 화서역 인근 대단지 아파트 생활권으로, SK스카이뷰·한라비발디 등 대규모 단지 방문 문의가 많은 지역입니다.", zone: "만석공원·화서역 대단지", landmark: "만석공원",
        faq: { q: "정자동 대단지 아파트 방문 시 준비할 점은?", a: "단지 공동현관과 동·호수, 방문차량 등록 여부를 미리 알려주시면 출입이 매끄럽습니다." } },
      { slug: "yeonghwa-dong", name: "영화동", intro: "장안구 영화동은 수원종합운동장과 만석공원, 화서문 인근 생활권으로 오래된 주거지와 상권이 섞여 있는 지역입니다.", zone: "종합운동장·화서문 인근", landmark: "수원종합운동장",
        faq: { q: "영화동 상권 인근도 방문 가능한가요?", a: "가능합니다. 상권 인근은 주차 여건을 함께 확인해 출입 동선을 안내드립니다." } },
      { slug: "songjuk-dong", name: "송죽동", intro: "장안구 송죽동은 KT위즈파크(수원야구장)와 만석공원 인근 생활권으로, 송죽동 주거권 방문 문의가 꾸준한 지역입니다.", zone: "수원야구장·만석공원 인근", landmark: "KT위즈파크",
        faq: { q: "송죽동 경기장 인근 숙소도 되나요?", a: "가능합니다. 숙소 객실 방문 규정만 사전에 확인하면 됩니다." } },
      { slug: "jowon-dong", name: "조원동", intro: "장안구 조원동은 광교산 자락과 장안구청, 한일타운 대단지 인근 생활권으로 조원시장 주변 주거 방문 문의가 많습니다.", zone: "장안구청·한일타운·조원시장", landmark: "한일타운",
        faq: { q: "조원동 한일타운 단지도 방문 가능한가요?", a: "가능합니다. 대단지는 공동현관·동호수와 방문차량 등록 방식을 미리 알려주시면 됩니다." } },
      { slug: "yeonmu-dong", name: "연무동", intro: "장안구 연무동은 수원화성 창룡문과 광교산 등산로 입구 인근 생활권으로, 행정타운과 가까워 주거·방문 문의가 이어지는 지역입니다.", zone: "창룡문·광교산 입구", landmark: "창룡문",
        faq: { q: "연무동 광교산 인근도 출장 되나요?", a: "가능합니다. 산 인근 외곽은 이동 시간만 추가로 확인해 도착 시간을 안내드립니다." } },
    ],
  },
  {
    slug: "gwonseon-gu", name: "권선구",
    intro: "수원 권선구는 권선동·곡선동 주거권, 세류·서둔동 생활권, 호매실 택지지구가 함께 있는 지역입니다. 신축 대단지와 오래된 주거지, 서수원 외곽이 섞여 단지별 출입 방식이 다릅니다.",
    move: "수원IC·산업도로 진입은 원활하며, 호매실·당수 등 신도시권은 단지 출입 등록을 미리 확인합니다.",
    rec: "활동량이 많은 분께는 스포츠 관리, 전신 피로 완화에는 아로마 관리를 추천합니다.",
    faq: [
      { q: "권선구 어디까지 방문 가능한가요?", a: "권선·호매실·세류동 등 권선구 전역 방문이 가능하며, 서수원 외곽은 이동 시간만 추가로 확인합니다." },
      { q: "호매실 신축 단지도 되나요?", a: "가능합니다. 신축 단지는 공동현관과 방문차량 등록 방식을 미리 알려주시면 됩니다." },
    ],
    dongs: [
      { slug: "seryu-dong", name: "세류동", intro: "권선구 세류동은 세류역(1호선)과 세류시장 인근 생활권으로, 오래된 주거권과 상권이 섞여 방문 문의가 꾸준한 지역입니다.", zone: "세류역·세류시장 인근", landmark: "세류역",
        faq: { q: "세류동 빌라·주택도 방문 가능한가요?", a: "가능합니다. 정확한 주소와 출입구, 주차 가능 여부를 미리 알려주시면 됩니다." } },
      { slug: "pyeong-dong", name: "평동", intro: "권선구 평동은 서수원 평리 일대 생활권으로, 서수원시외버스터미널과 산업·물류권이 가까워 이동 동선 확인이 중요한 지역입니다.", zone: "서수원·평리 산업권", landmark: "서수원시외버스터미널",
        faq: { q: "평동 산업권 인근도 출장 되나요?", a: "가능합니다. 물류·산업권은 이동 동선과 방문 시간을 함께 확인해 안내드립니다." } },
      { slug: "seodun-dong", name: "서둔동", intro: "권선구 서둔동은 수원역 서편과 경기상상캠퍼스, 농촌진흥청 옛터 인근 생활권으로 주거와 캠퍼스권이 섞여 있습니다.", zone: "수원역 서편·경기상상캠퍼스", landmark: "경기상상캠퍼스",
        faq: { q: "서둔동 수원역 서편도 방문 되나요?", a: "가능합니다. 역 서편 오피스텔·주거권 모두 공동현관 출입 방식만 확인하면 됩니다." } },
      { slug: "guun-dong", name: "구운동", intro: "권선구 구운동은 일월저수지·서호 인근 서수원 주거권으로, 아파트·빌라 방문 문의가 고르게 있는 지역입니다.", zone: "일월저수지·서호 인근", landmark: "일월저수지",
        faq: { q: "구운동 어느 곳까지 방문 되나요?", a: "구운동 전역 방문이 가능하며, 주거 형태에 맞춰 출입 동선을 안내드립니다." } },
      { slug: "geumgok-dong", name: "금곡동", intro: "권선구 금곡동은 호매실지구와 인접한 서수원 생활권으로, LG빌리지 등 대단지 아파트 방문 문의가 많은 지역입니다.", zone: "호매실 인접·대단지", landmark: "금곡 LG빌리지",
        faq: { q: "금곡동 대단지 방문 시 준비할 점은?", a: "단지 공동현관과 동호수, 방문차량 등록 여부를 미리 알려주시면 됩니다." } },
      { slug: "homaesil-dong", name: "호매실동", intro: "권선구 호매실동은 호매실 택지지구의 신축 대단지 중심 생활권으로, 칠보산 자락과 가까워 가족 단위 주거 방문 문의가 많습니다.", zone: "호매실 택지지구·칠보산", landmark: "호매실지구",
        faq: { q: "호매실 신축 아파트도 방문 가능한가요?", a: "가능합니다. 신축 단지는 공동현관·방문차량 등록 절차를 미리 확인하면 출입이 매끄럽습니다." } },
      { slug: "gwonseon-dong", name: "권선동", intro: "권선구 권선동은 권선시장과 권선구청 인근 생활권으로, 권선1·2동 주거권과 상권이 섞여 방문 문의가 꾸준한 지역입니다.", zone: "권선시장·권선구청 인근", landmark: "권선시장",
        faq: { q: "권선동 어디까지 방문 되나요?", a: "권선동 전역 방문이 가능하며, 상권 인근은 주차 여건을 함께 확인합니다." } },
      { slug: "gokseon-dong", name: "곡선동", intro: "권선구 곡선동은 곡반정동·대황교동 일대 생활권으로, 권선구청과 가까운 신축 주거권 방문 문의가 늘고 있는 지역입니다.", zone: "곡반정·대황교 신축 주거권", landmark: "권선구청",
        faq: { q: "곡선동 신축 단지도 방문 가능한가요?", a: "가능합니다. 신축 단지 공동현관과 방문등록 방식을 미리 알려주시면 됩니다." } },
      { slug: "ipbuk-dong", name: "입북동", intro: "권선구 입북동은 당수동·입북동 일대 서수원 외곽 생활권으로, 당수지구 개발과 함께 신규 주거 방문 문의가 생기는 지역입니다.", zone: "당수지구·서수원 외곽", landmark: "당수지구",
        faq: { q: "입북동 외곽도 출장 되나요?", a: "가능합니다. 서수원 외곽은 이동 시간이 길어질 수 있어 도착 예상 시간을 함께 안내드립니다." } },
    ],
  },
  {
    slug: "paldal-gu", name: "팔달구",
    intro: "수원 팔달구는 인계동 번화가, 수원화성·행궁동 관광권, 수원역 매산·고등동 상권, 아주대 우만동 생활권이 모여 있는 수원의 중심 지역입니다. 상권·숙소 문의와 주거 문의가 함께 많습니다.",
    move: "도심 번화가 특성상 저녁 시간 주차·정체가 변수라 출입 동선과 도착 시간을 미리 안내합니다.",
    rec: "퇴근 후 짧은 휴식에는 피로 회복 관리, 어깨·목 뭉침이 강하면 스포츠 관리를 추천합니다.",
    faq: [
      { q: "팔달구 어디까지 방문 가능한가요?", a: "인계·행궁·매산동 등 팔달구 전역 방문이 가능하며, 번화가는 도착 예상 시간을 함께 안내드립니다." },
      { q: "수원역·인계동 숙소도 되나요?", a: "가능합니다. 숙소명을 알려주시면 객실 방문 가능 여부를 확인 후 안내합니다." },
    ],
    dongs: [
      { slug: "ingye-dong", name: "인계동", intro: "수원 팔달구 인계동은 수원시청역, 나혜석거리, 효원공원 인근 생활권과 가까워 퇴근 후 또는 숙소 방문 관리 문의가 많은 지역입니다.", zone: "수원시청역·나혜석거리·효원공원", landmark: "나혜석거리",
        faq: { q: "인계동 번화가 숙소·오피스텔도 방문 가능한가요?", a: "가능합니다. 공동현관 출입 방식과 객실 방문 규정만 사전에 확인합니다." } },
      { slug: "maegyo-dong", name: "매교동", intro: "팔달구 매교동은 매교역(수인분당선)과 매교역 일대 재개발 신축 대단지 생활권으로, 단지 출입·방문등록 확인이 중요한 지역입니다.", zone: "매교역·재개발 신축 단지", landmark: "매교역",
        faq: { q: "매교동 신축 단지 방문 시 준비할 점은?", a: "신축 대단지는 공동현관과 동호수, 방문차량 등록 여부를 미리 알려주시면 됩니다." } },
      { slug: "maesan-dong", name: "매산동", intro: "팔달구 매산동은 수원역 동편 매산로 상권 생활권으로, 역세권 숙소·오피스텔 방문 문의가 많은 지역입니다.", zone: "수원역 동편·매산로 상권", landmark: "수원역",
        faq: { q: "매산동 수원역 인근 숙소도 되나요?", a: "가능합니다. 역세권 숙소는 객실 방문 규정을 사전에 확인합니다." } },
      { slug: "godeung-dong", name: "고등동", intro: "팔달구 고등동은 수원역 북쪽 고등동 주거권으로, 역과 가까워 원룸·빌라 방문 문의가 고르게 있는 지역입니다.", zone: "수원역 북측 주거권", landmark: "수원역 북측",
        faq: { q: "고등동 원룸·빌라도 방문 가능한가요?", a: "가능합니다. 정확한 주소와 공동현관 출입 방식을 미리 알려주시면 됩니다." } },
      { slug: "hwaseo-dong", name: "화서동", intro: "팔달구 화서동은 화서역과 화서문, 스타필드 수원 인근 생활권으로, 화서역 신축 단지 방문 문의가 많은 지역입니다.", zone: "화서역·화서문·스타필드 인근", landmark: "화서역",
        faq: { q: "화서동 신축 아파트도 방문 가능한가요?", a: "가능합니다. 신축 단지 공동현관·방문등록 방식을 미리 알려주시면 됩니다." } },
      { slug: "ji-dong", name: "지동", intro: "팔달구 지동은 지동시장과 수원화성 남쪽 생활권으로, 오래된 주거지와 시장 상권이 섞인 지역입니다.", zone: "지동시장·수원화성 남측", landmark: "지동시장",
        faq: { q: "지동 주택가도 방문 되나요?", a: "가능합니다. 골목 주거권은 정확한 주소와 주차 안내를 미리 확인합니다." } },
      { slug: "uman-dong", name: "우만동", intro: "팔달구 우만동은 아주대학교·아주대병원과 월드컵경기장 인근 생활권으로, 대학·병원 주변 원룸·오피스텔 방문 문의가 많습니다.", zone: "아주대·월드컵경기장 인근", landmark: "아주대학교",
        faq: { q: "우만동 아주대 인근 원룸도 되나요?", a: "가능합니다. 대학가 원룸·오피스텔은 공동현관 출입 방식만 확인하면 됩니다." } },
      { slug: "haenggung-dong", name: "행궁동", intro: "팔달구 행궁동은 화성행궁과 행리단길, 수원화성 안쪽 생활권으로 관광·상권과 주거가 섞여 객실·숙소 방문 문의가 많은 지역입니다.", zone: "화성행궁·행리단길", landmark: "화성행궁",
        faq: { q: "행궁동 관광 숙소도 방문 가능한가요?", a: "가능합니다. 게스트하우스·숙소는 객실 방문 규정을 사전에 확인합니다." } },
    ],
  },
  {
    slug: "yeongtong-gu", name: "영통구",
    intro: "수원 영통구는 광교신도시 업무·주거권, 영통·매탄동 대단지, 삼성 사업장 인근 오피스텔, 망포·원천 신축 주거권으로 구성됩니다. 신도시·오피스텔 비중이 높아 단지 출입 확인이 핵심입니다.",
    move: "영통IC·광교 진입은 원활하나, 신도시 단지는 방문차량 등록 절차를 미리 확인합니다.",
    rec: "장시간 좌식 근무 후에는 스포츠 관리, 가벼운 이완에는 아로마 관리를 추천합니다.",
    faq: [
      { q: "영통구 어디까지 방문 가능한가요?", a: "광교·영통·매탄동 등 영통구 전역 방문이 가능하며, 신도시 단지는 방문등록 방식을 미리 확인합니다." },
      { q: "삼성 사업장 인근 원룸도 되나요?", a: "가능합니다. 원룸·오피스텔은 공동현관 출입 방식만 사전에 확인합니다." },
    ],
    dongs: [
      { slug: "maetan-dong", name: "매탄동", intro: "영통구 매탄동은 삼성전자 수원사업장과 매탄권선역 인근 생활권으로, 매탄1~4동 대단지 아파트와 오피스텔 방문 문의가 많은 지역입니다.", zone: "삼성 사업장·매탄권선역", landmark: "삼성전자 수원사업장",
        faq: { q: "매탄동 오피스텔·아파트도 방문 가능한가요?", a: "가능합니다. 공동현관 출입 방식과 동호수를 미리 알려주시면 됩니다." } },
      { slug: "woncheon-dong", name: "원천동", intro: "영통구 원천동은 광교호수공원(원천호수)과 아주대 인근 생활권으로, 호수 주변 신축 주거권 방문 문의가 많은 지역입니다.", zone: "광교호수공원·아주대 인근", landmark: "광교호수공원",
        faq: { q: "원천동 호수 인근 신축 단지도 되나요?", a: "가능합니다. 신축 단지 공동현관·방문등록 방식을 미리 확인합니다." } },
      { slug: "gwanggyo-dong", name: "광교동", intro: "영통구 광교동은 광교신도시 중심 생활권으로, 광교중앙역·경기도청 신청사와 가까운 신축 대단지·오피스텔 방문 문의가 많습니다.", zone: "광교신도시·광교중앙역·경기도청", landmark: "광교중앙역",
        faq: { q: "광교 신도시 오피스텔 방문 시 준비할 점은?", a: "공동현관 출입 방식과 방문차량 등록 여부를 미리 알려주시면 출입이 매끄럽습니다." } },
      { slug: "yeongtong-dong", name: "영통동", intro: "영통구 영통동은 영통역과 청명역 인근 생활권으로, 영통1~3동 대단지 아파트와 영통 상권 방문 문의가 꾸준한 지역입니다.", zone: "영통역·청명역·영통 상권", landmark: "영통역",
        faq: { q: "영통동 대단지·상권 모두 방문 되나요?", a: "가능합니다. 대단지는 공동현관·동호수를, 상권 숙소는 객실 규정을 확인합니다." } },
      { slug: "mangpo-dong", name: "망포동", intro: "영통구 망포동은 망포역(분당선)과 영통 동쪽 신축 대단지 생활권으로, 신영통 일대 가족 단위 주거 방문 문의가 많은 지역입니다.", zone: "망포역·신영통 신축 단지", landmark: "망포역",
        faq: { q: "망포동 신축 아파트도 방문 가능한가요?", a: "가능합니다. 신축 단지 공동현관과 방문차량 등록 절차를 미리 확인합니다." } },
    ],
  },
];

// 고객후기(구 단위) - 대표 후기 예시
const reviewsByGu = {
  "jangan-gu": [
    { s: 5, t: "정자동 아파트로 예약했는데 시간 맞춰 오셨고 압 조절이 편안했어요.", m: "장안구 · 김○○" },
    { s: 5, t: "조원동에서 받았습니다. 상담 후 진행해주셔서 부담 없었어요.", m: "장안구 · 이○○" },
  ],
  "gwonseon-gu": [
    { s: 5, t: "호매실 신축 단지인데 방문 등록 안내까지 친절했습니다.", m: "권선구 · 박○○" },
    { s: 4, t: "권선동에서 피로 회복 관리 받았어요. 다음에 또 예약할게요.", m: "권선구 · 정○○" },
  ],
  "paldal-gu": [
    { s: 5, t: "인계동 숙소로 예약했는데 위생 용품 챙겨오셔서 좋았습니다.", m: "팔달구 · 최○○" },
    { s: 5, t: "화서동 집으로 받았어요. 예약부터 마무리까지 깔끔했습니다.", m: "팔달구 · 한○○" },
  ],
  "yeongtong-gu": [
    { s: 5, t: "광교 오피스텔인데 시간 약속 잘 지켜주셔서 만족했어요.", m: "영통구 · 윤○○" },
    { s: 4, t: "매탄동에서 아로마 관리 받았습니다. 분위기가 편안했어요.", m: "영통구 · 장○○" },
  ],
};

/* ===================== 3. 공통 헬퍼 ===================== */
function megaCols() {
  return suwonGu
    .map(
      (g) => `<div class="mega-col">
            <a class="gu-title" href="/suwon/${g.slug}/">${g.name} 출장마사지</a>
            ${g.dongs.map((d) => `<a href="/suwon/${g.slug}/${d.slug}/">${d.name}</a>`).join("\n            ")}
          </div>`
    )
    .join("\n          ");
}

const navHtml = `
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="${brand} 홈">
      <span class="logo">${brandEn}</span><span class="ko">${brand}</span>
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

// 구조화 데이터
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
  return `<div class="breadcrumb">${items
    .map((it, i) => (i === items.length - 1 ? it.name : `<a href="${it.path}">${it.name}</a>`))
    .join(" › ")}</div>`;
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

/* ===================== 4. 페이지 빌더 ===================== */
async function writeFile(rel, content) {
  const full = path.join(ROOT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf8");
  return rel;
}

// 공통 아티클 페이지 (breadcrumb + prose + sidebar)
function articlePage({ title, description, canonicalPath, h1, lead, proseHtml, crumbs, jsonLd, sideExtra = "", noindex = false }) {
  // canonicalPath 미지정 시 마지막 breadcrumb 경로를 사용
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
  return layout({ title, description, canonicalPath, ogType: "article", noindex,
    jsonLd: [breadcrumbLd(crumbs), ...jsonLd], bodyContent: body });
}

// ---- 홈 ----
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
      <div class="trust-grid">
        <div class="trust-card"><h3>오늘 예약 가능 안내</h3><p>24시간 예약 상담을 받으며, 지역과 시간대에 맞춰 당일 가능한 일정을 안내합니다.</p></div>
        <div class="trust-card"><h3>인기 코스 바로가기</h3><p>피로 회복·아로마·스포츠 관리 등 휴식 중심의 코스를 컨디션에 맞춰 안내합니다.</p></div>
        <div class="trust-card"><h3>지역별 출장 가능 안내</h3><p>장안·권선·팔달·영통 구별 생활권과 방문 조건을 페이지에서 확인할 수 있습니다.</p></div>
      </div>
    </div>
  </section>

  <section id="courses">
    <div class="wrap">
      <div class="section-head"><span class="kicker">COURSE</span><h2>인기 코스 바로가기</h2><p>컨디션과 상황에 맞춰 선택할 수 있는 대표 코스입니다.</p></div>
      <div class="card-grid">
        ${courses.map((c) => `<a class="svc-card" href="/course/${c.slug}/">
          <div class="ico">${c.icon}</div><h3>${c.name}</h3><p>${c.short}</p><span class="more">자세히 보기 →</span>
        </a>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section id="areas">
    <div class="wrap">
      <div class="section-head"><span class="kicker">AREA</span><h2>지역별 출장 가능 안내</h2><p>수원 4개 구 전 지역으로 방문합니다. 구를 선택하면 동별 생활권 안내를 볼 수 있습니다.</p></div>
      <div class="area-grid">
        <a class="area-chip" href="/suwon/">수원 전체<span>대표 안내</span></a>
        ${suwonGu.map((g) => `<a class="area-chip" href="/suwon/${g.slug}/">${g.name}<span>${g.dongs.length}개 동 안내</span></a>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section id="how">
    <div class="wrap">
      <div class="section-head"><span class="kicker">HOW IT WORKS</span><h2>예약문의 바로가기</h2><p>예약부터 마무리까지 절차가 간단합니다.</p></div>
      <div class="step-grid">
        <div class="step"><div class="num">1</div><h3>예약 문의</h3><p>전화·문자로 지역, 시간, 코스를 알려주세요.</p></div>
        <div class="step"><div class="num">2</div><h3>일정 확인</h3><p>가능한 시간대와 출장비를 안내드립니다.</p></div>
        <div class="step"><div class="num">3</div><h3>방문 준비</h3><p>공동현관·주차·객실 규정을 미리 확인합니다.</p></div>
        <div class="step"><div class="num">4</div><h3>관리 진행</h3><p>상담 후 컨디션에 맞춘 압으로 진행합니다.</p></div>
        <div class="step"><div class="num">5</div><h3>결제·마무리</h3><p>안내된 방법으로 결제하고 마무리합니다.</p></div>
      </div>
      <div style="margin-top:20px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px;color:var(--muted);font-size:14px;">
        자세한 예약 방법은 <a href="/reservation/" style="color:var(--accent);font-weight:700;">예약안내</a>를, 처음 이용하신다면 <a href="/guide/" style="color:var(--accent);font-weight:700;">이용가이드</a>를 확인하세요.
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
    canonicalPath: "/", isHome: true,
    jsonLd: [websiteLd, orgLd],
    bodyContent: body,
  });
}

// ---- /suwon/ 대표 ----
function buildSuwonMain() {
  const faqs = [
    { q: "수원 어느 지역까지 방문 가능한가요?", a: "장안구·권선구·팔달구·영통구 등 수원 전 지역 방문이 가능합니다. 외곽은 이동 시간만 추가로 확인합니다." },
    { q: "예약은 어떻게 하나요?", a: `전화(${phone}) 또는 문자로 지역, 희망 시간, 코스를 알려주시면 가능한 일정을 안내드립니다.` },
    { q: "방문 가능한 장소는 어디인가요?", a: "자택, 오피스텔, 호텔·숙소 등에서 가능합니다. 공동현관·주차·객실 규정을 미리 확인하면 진행이 매끄럽습니다." },
    { q: "위생 관리는 어떻게 하나요?", a: "1회용품과 청결한 용품을 사용하며 위생을 우선으로 관리합니다." },
  ];
  const prose = `
        <h2 id="intro">수원 출장마사지 서비스 소개</h2>
        <p>${brand}는 수원 장안구, 권선구, 팔달구, 영통구 전 지역으로 방문하는 출장마사지 예약 안내 서비스입니다. 신도시 아파트·오피스텔부터 오래된 주거권, 번화가 숙소까지 구별로 다른 생활권과 예약 조건에 맞춰 안내합니다. 건전한 휴식·웰니스 관리만 제공하며 의료 행위가 아닙니다.</p>

        <h2 id="area">출장 가능 지역</h2>
        <p>수원 4개 구 전 지역 방문이 가능합니다. 구를 선택하면 동별 생활권과 방문 조건을 확인할 수 있습니다.</p>
        <div class="zone-grid">
          ${suwonGu.map((g) => `<a class="zone-card" href="/suwon/${g.slug}/" style="text-decoration:none;"><h4>${g.name} 출장마사지 →</h4><p>${g.dongs.map((d) => d.name).join(" · ")}</p></a>`).join("\n          ")}
        </div>

        <h2 id="course">이용 가능한 코스</h2>
        <p>피로 회복·아로마·스포츠 관리 등 휴식 중심 코스를 컨디션에 맞춰 선택할 수 있습니다. 자세한 내용은 <a href="/course/">코스안내</a>를 확인하세요.</p>
        <ul>${courses.map((c) => `<li><strong>${c.name}</strong> – ${c.short}</li>`).join("")}</ul>

        <h2 id="process">예약 진행 방식</h2>
        <ul>
          <li>전화 또는 문자로 지역·희망 시간·코스를 알려주세요.</li>
          <li>가능한 시간대와 출장비를 안내드립니다.</li>
          <li>방문 장소의 공동현관·주차·객실 규정을 확인합니다.</li>
          <li>상담 후 컨디션에 맞춘 압으로 진행하고 안내된 방법으로 결제합니다.</li>
        </ul>

        <h2 id="check">관리 전 확인사항</h2>
        <ul>
          <li>샤워 후 편안한 상태가 좋습니다.</li>
          <li>정확한 주소와 공동현관·주차 정보를 미리 알려주세요.</li>
          <li>건강상 주의가 필요한 부분은 상담 시 알려주세요.</li>
        </ul>

        <h2 id="safety">위생 및 안전 안내</h2>
        <div class="callout">1회용품과 청결한 용품을 사용하며 위생을 우선으로 관리합니다. ${brand}는 건전한 휴식 관리만 제공하며 성적 서비스를 제공하지 않습니다. 관련 요청은 정중히 거절합니다.</div>

        <h2 id="faq">자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2>예약 문의</h2>
        <p>수원 출장마사지 예약은 전화(${phone}) 또는 문자로 지역과 희망 시간을 알려주시면 가능한 일정을 안내드립니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "수원출장마사지", path: "/suwon/" }];
  const sideExtra = `
    <div class="side-card"><h4>구별 안내</h4><div class="side-links">
      ${suwonGu.map((g) => `<a href="/suwon/${g.slug}/">${g.name} 출장마사지</a>`).join("\n      ")}
    </div></div>`;
  return articlePage({
    title: "수원출장마사지 | 수원 전지역 방문 마사지 예약 안내",
    description: "수원 장안구, 권선구, 팔달구, 영통구 출장마사지 예약 안내 페이지입니다. 코스, 이용시간, 출장 가능 지역, 예약 전 확인사항을 확인해보세요.",
    canonicalPath: "/suwon/", h1: "수원 출장마사지 예약 안내", lead: `${brand}는 수원 장안·권선·팔달·영통 전 지역으로 방문합니다.`,
    proseHtml: prose, crumbs, sideExtra,
    jsonLd: [serviceLd({ name: "수원 출장마사지", description: "수원 전지역 방문 마사지 예약 안내", url: `${siteUrl}/suwon/`, areaServed: "수원시" }), faqLd(faqs)],
  });
}

// ---- 구 허브 ----
function buildGu(g) {
  const prose = `
        <h2>${g.name} 출장마사지 안내</h2>
        <p>${g.intro}</p>

        <h2>${g.name} 방문 가능 생활권</h2>
        <div class="zone-grid">
          ${g.dongs.map((d) => `<a class="zone-card" href="/suwon/${g.slug}/${d.slug}/" style="text-decoration:none;"><h4>${d.name} →</h4><p>${d.zone}</p></a>`).join("\n          ")}
        </div>

        <h2>${g.name}에서 많이 찾는 코스</h2>
        <p>${g.rec} 자세한 코스는 <a href="/course/">코스안내</a>에서 확인하세요.</p>

        <h2>예약 가능 시간</h2>
        <p>오전부터 심야까지 시간대를 협의해 안내드립니다. 당일 예약도 가능하며, 원하는 시간대가 있으면 미리 문의하시는 편이 좋습니다.</p>

        <h2>방문 시 확인할 점</h2>
        <p>${g.move}</p>
        <ul>
          <li>방문 장소(자택·오피스텔·숙소)의 공동현관 출입 방식</li>
          <li>주차 가능 여부 또는 인근 주차 안내</li>
          <li>아파트 단지의 경우 방문차량 등록 여부</li>
        </ul>

        <h2>예약 전 확인사항</h2>
        <div class="callout">${g.name} 시내 기본 권역은 동일하게 안내됩니다. 외곽·심야 이동은 이동 거리와 시간에 따라 출장비가 달라질 수 있어 예약 시 정확히 안내드리며, 숨겨진 비용은 없습니다.</div>

        <h2>${g.name} 출장마사지 자주 묻는 질문</h2>
        ${faqBlock(g.faq)}

        <h2>예약 문의</h2>
        <p>${g.name} 예약은 전화(${phone}) 또는 문자로 동·건물 정보와 희망 시간을 알려주시면 가능한 일정을 안내드립니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "수원출장마사지", path: "/suwon/" }, { name: `${g.name} 출장마사지`, path: `/suwon/${g.slug}/` }];
  const sideExtra = `
    <div class="side-card"><h4>${g.name} 동별 안내</h4><div class="side-links">
      ${g.dongs.map((d) => `<a href="/suwon/${g.slug}/${d.slug}/">${d.name} 출장마사지</a>`).join("\n      ")}
    </div></div>
    <div class="side-card"><h4>다른 구</h4><div class="side-links">
      ${suwonGu.filter((x) => x.slug !== g.slug).map((x) => `<a href="/suwon/${x.slug}/">${x.name} 출장마사지</a>`).join("\n      ")}
    </div></div>`;
  return articlePage({
    title: `${g.name} 출장마사지 | 수원 ${g.name} 방문 마사지 안내`,
    description: `${g.name} 출장마사지 - ${g.dongs.map((d) => d.name).slice(0, 6).join(", ")} 등 ${g.name} 생활권별 방문 조건과 예약 안내. ${g.rec.split(",")[0]} 예약 ${phone}.`.replace(/\s+/g, " "),
    h1: `${g.name} 출장마사지 예약 안내`, lead: g.intro,
    proseHtml: prose, crumbs, sideExtra,
    jsonLd: [serviceLd({ name: `${g.name} 출장마사지`, description: g.intro, url: `${siteUrl}/suwon/${g.slug}/`, areaServed: `수원시 ${g.name}` }), faqLd(g.faq)],
  });
}

// ---- 동 ----
function buildDong(g, d) {
  const others = g.dongs.filter((x) => x.slug !== d.slug);
  const faqs = [
    d.faq,
    { q: `${d.name} 예약은 어떻게 하나요?`, a: `전화(${phone}) 또는 문자로 ${d.name} 내 동·건물 정보와 희망 시간을 알려주시면 가능한 일정을 안내드립니다.` },
    { q: `${d.name}도 당일 예약이 가능한가요?`, a: "가능합니다. 다만 원하는 시간대가 있으면 미리 문의하시는 편이 배정이 수월합니다." },
  ];
  const prose = `
        <h2>${d.name} 출장마사지 안내</h2>
        <p>${d.intro} ${brand}는 ${g.name} ${d.name} 전 지역으로 방문하며, 이용 가능 시간·코스 선택 기준·예약 전 확인사항을 안내합니다.</p>

        <h2>${d.name} 방문 가능 지역</h2>
        <p>${d.name} 일대는 ${d.zone}을(를) 중심으로 한 생활권입니다. 자택·오피스텔·숙소 등 방문 장소에 맞춰 출입 동선을 안내드립니다.</p>

        <h2>${d.name} 주변 생활권 안내</h2>
        <p>${d.landmark} 인근을 비롯한 ${d.name} 주변 생활권으로 방문이 가능합니다. 같은 ${g.name} 내 ${others.slice(0, 3).map((x) => x.name).join(", ")} 등 인접 지역도 함께 예약하실 수 있습니다.</p>

        <h2>예약 가능 시간</h2>
        <p>오전부터 심야까지 시간대를 협의해 안내드립니다. 당일 예약도 가능합니다.</p>

        <h2>추천 코스</h2>
        <p>${g.rec} 코스별 자세한 내용은 <a href="/course/">코스안내</a>를 확인하세요.</p>

        <h2>이용 전 확인사항</h2>
        <ul>
          <li>정확한 주소와 공동현관 출입 방식을 미리 알려주세요.</li>
          <li>주차 가능 여부 또는 인근 주차 안내를 확인합니다.</li>
          <li>아파트 단지는 방문차량 등록 여부를 확인합니다.</li>
          <li>${brand}는 건전한 휴식 관리만 제공하며 성적 서비스를 제공하지 않습니다.</li>
        </ul>

        <h2>${d.name}에서 자주 묻는 질문</h2>
        ${faqBlock(faqs)}

        <h2>예약문의</h2>
        <p>${g.name} ${d.name} 출장마사지 예약은 전화(${phone}) 또는 문자로 문의해주세요.</p>`;
  const crumbs = [
    { name: "홈", path: "/" },
    { name: "수원출장마사지", path: "/suwon/" },
    { name: `${g.name} 출장마사지`, path: `/suwon/${g.slug}/` },
    { name: `${d.name} 출장마사지`, path: `/suwon/${g.slug}/${d.slug}/` },
  ];
  const sideExtra = `
    <div class="side-card"><h4>${g.name} 다른 지역</h4><div class="side-links">
      <a href="/suwon/${g.slug}/">${g.name} 전체</a>
      ${others.map((x) => `<a href="/suwon/${g.slug}/${x.slug}/">${x.name} 출장마사지</a>`).join("\n      ")}
    </div></div>`;
  return articlePage({
    title: `${d.name} 출장마사지 | 수원 ${g.name} ${d.name} 방문 마사지`,
    description: `${d.name} 출장마사지 - ${d.intro} 이용 시간·코스·예약 전 확인사항 안내, 예약 ${phone}.`.replace(/\s+/g, " "),
    h1: `${d.name} 출장마사지 예약 안내`, lead: d.intro,
    proseHtml: prose, crumbs, sideExtra,
    jsonLd: [serviceLd({ name: `${d.name} 출장마사지`, description: d.intro, url: `${siteUrl}/suwon/${g.slug}/${d.slug}/`, areaServed: `수원시 ${g.name} ${d.name}` }), faqLd(faqs)],
  });
}

// ---- 코스 인덱스 / 상세 / 가격 / 선택가이드 ----
function buildCourseIndex() {
  const prose = `
        <h2>전체 코스 보기</h2>
        <p>${brand}의 코스는 모두 건전한 휴식·웰니스 관리입니다. 컨디션과 상황에 맞춰 선택하세요.</p>
        <div class="zone-grid">
          ${courses.map((c) => `<a class="zone-card" href="/course/${c.slug}/" style="text-decoration:none;"><h4>${c.icon} ${c.name} →</h4><p>${c.short}</p></a>`).join("\n          ")}
        </div>
        <h2>코스 선택이 고민된다면</h2>
        <p><a href="/course/guide/">코스 선택 가이드</a>에서 상황별 추천을, <a href="/course/price/">코스별 가격 안내</a>에서 시간대별 기준을 확인할 수 있습니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "코스안내", path: "/course/" }];
  const sideExtra = `<div class="side-card"><h4>코스</h4><div class="side-links">
    ${courses.map((c) => `<a href="/course/${c.slug}/">${c.name}</a>`).join("\n    ")}
    <a href="/course/price/">코스별 가격 안내</a>
    <a href="/course/guide/">코스 선택 가이드</a>
  </div></div>`;
  return articlePage({
    title: `코스안내 | 수원 출장마사지 코스 | ${brand}`,
    description: `${brand} 코스안내 - 피로 회복·아로마·스포츠·커플/가족·기업 방문 관리. 컨디션에 맞춘 건전한 휴식 코스를 확인하세요. 예약 ${phone}.`,
    h1: "코스안내", lead: "컨디션과 상황에 맞춰 선택할 수 있는 대표 코스입니다.",
    proseHtml: prose, crumbs, sideExtra, jsonLd: [orgLd],
  });
}

function buildCourse(c) {
  const faqs = [
    { q: `${c.name}는 어떤 분께 맞나요?`, a: `${c.when[0]} 등 ${c.intro}` },
    { q: "관리 시간은 얼마나 걸리나요?", a: c.time },
    { q: "압 조절이 가능한가요?", a: "네, 상담 시 원하는 압과 집중 부위를 알려주시면 컨디션에 맞춰 조절합니다." },
    { q: "수원 어디로 방문 가능한가요?", a: `장안·권선·팔달·영통 수원 전 지역으로 방문합니다. 전화(${phone})로 지역과 시간을 알려주세요.` },
  ];
  const prose = `
        <h2>${c.name}란?</h2>
        <p>${c.intro}</p>
        <h2>이런 경우에 좋아요</h2>
        <ul>${c.when.map((x) => `<li>${x}</li>`).join("")}</ul>
        <h2>특징</h2>
        <ul>${c.feat.map((x) => `<li>${x}</li>`).join("")}</ul>
        <h2>추천 관리 시간</h2>
        <p>${c.time}</p>
        <h2>이용 전 확인사항</h2>
        <div class="callout">${c.name}는 건전한 휴식·웰니스 관리이며 의료 행위가 아닙니다. 예약 시 지역, 희망 시간, 원하는 압을 함께 알려주시면 일정 안내가 빠릅니다.</div>
        <h2>자주 묻는 질문</h2>
        ${faqBlock(faqs)}`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "코스안내", path: "/course/" }, { name: c.name, path: `/course/${c.slug}/` }];
  const sideExtra = `<div class="side-card"><h4>다른 코스</h4><div class="side-links">
    ${courses.filter((x) => x.slug !== c.slug).map((x) => `<a href="/course/${x.slug}/">${x.name}</a>`).join("\n    ")}
    <a href="/course/price/">코스별 가격 안내</a>
  </div></div>`;
  return articlePage({
    title: `${c.name} | 수원 출장마사지 코스 | ${brand}`,
    description: `${c.name} - ${c.intro} 수원 전지역 방문 가능, 예약 ${phone}.`.replace(/\s+/g, " "),
    h1: `${c.name} 안내`, lead: c.intro,
    proseHtml: prose, crumbs, sideExtra,
    jsonLd: [serviceLd({ name: c.name, description: c.intro, url: `${siteUrl}/course/${c.slug}/`, areaServed: "수원시" }), faqLd(faqs)],
  });
}

function buildCoursePrice() {
  const prose = `
        <h2>코스별 가격 안내</h2>
        <p>관리 시간 기준 안내입니다. 정확한 요금과 출장비는 예약 시 안내드리며, 숨겨진 비용은 없습니다.</p>
        <div class="price-grid">
          <div class="price-card"><div class="time">60분 코스</div><div class="price">예약 시 안내</div><ul><li>전신 기본 관리</li><li>처음 이용 시 추천</li><li>컨디션 압 조절</li></ul></div>
          <div class="price-card featured"><div class="time">90분 코스</div><div class="price">예약 시 안내</div><ul><li>전신 + 집중 부위</li><li>가장 많이 찾는 코스</li><li>충분한 이완</li></ul></div>
          <div class="price-card"><div class="time">120분 코스</div><div class="price">예약 시 안내</div><ul><li>전신 + 스트레칭/집중</li><li>여유로운 관리</li><li>심화 휴식</li></ul></div>
        </div>
        <p class="price-note">※ 지역·시간대에 따라 추가 출장비가 발생할 수 있으며, 심야·장거리 이동은 예약 시 사전 안내드립니다.</p>
        <h2>출장비 기준</h2>
        <p>수원 시내 기본 권역은 동일하게 안내됩니다. 서수원 외곽·심야 시간대는 이동 거리와 시간에 따라 출장비가 달라질 수 있어 예약 시 정확히 안내드립니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "코스안내", path: "/course/" }, { name: "코스별 가격 안내", path: "/course/price/" }];
  return articlePage({
    title: `코스별 가격 안내 | 수원 출장마사지 요금 | ${brand}`,
    description: `수원 출장마사지 코스별 가격 안내 - 60·90·120분 기준과 출장비 안내. 정확한 요금은 예약 시 안내드립니다. 예약 ${phone}.`,
    h1: "코스별 가격 안내", lead: "관리 시간 기준 요금과 출장비 안내입니다.",
    proseHtml: prose, crumbs, jsonLd: [orgLd],
  });
}

function buildCourseGuide() {
  const faqs = [
    { q: "처음인데 어떤 코스가 좋을까요?", a: "강한 자극이 부담되면 피로 회복 관리나 아로마 관리를, 어깨·다리 피로가 강하면 스포츠 관리를 추천합니다." },
    { q: "두 명이 함께 받을 수 있나요?", a: "네, 커플/가족 관리로 2인 동시 진행이 가능합니다. 예약 시 인원을 알려주세요." },
  ];
  const prose = `
        <h2>코스 선택 가이드</h2>
        <p>상황과 컨디션에 맞춰 코스를 고르면 됩니다. 아래 기준을 참고하세요.</p>
        <h3>휴식·이완이 목적이라면</h3>
        <p><a href="/course/relax/">피로 회복 관리</a> 또는 <a href="/course/aroma/">아로마 관리</a>가 무난합니다. 부드러운 압과 편안한 분위기를 우선합니다.</p>
        <h3>활동·운동 피로가 강하다면</h3>
        <p><a href="/course/sports/">스포츠 관리</a>가 적합합니다. 활동 부위를 리듬감 있게 정돈합니다.</p>
        <h3>함께 받고 싶다면</h3>
        <p><a href="/course/couple/">커플/가족 관리</a>로 2인 동시 진행이 가능합니다. 단체는 <a href="/course/corporate/">기업/단체 방문 관리</a>를 확인하세요.</p>
        <h2>자주 묻는 질문</h2>
        ${faqBlock(faqs)}`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "코스안내", path: "/course/" }, { name: "코스 선택 가이드", path: "/course/guide/" }];
  return articlePage({
    title: `코스 선택 가이드 | 수원 출장마사지 | ${brand}`,
    description: `수원 출장마사지 코스 선택 가이드 - 휴식·활동 피로·동시 관리 등 상황별 추천 코스를 안내합니다. 예약 ${phone}.`,
    h1: "코스 선택 가이드", lead: "상황과 컨디션에 맞는 코스를 고르는 기준입니다.",
    proseHtml: prose, crumbs, jsonLd: [faqLd(faqs)],
  });
}

// ---- 예약안내 ----
function buildReservation() {
  const faqs = [
    { q: "예약은 얼마나 미리 해야 하나요?", a: "당일 예약도 가능하지만 원하는 시간대가 있으면 미리 문의하시는 편이 좋습니다." },
    { q: "예약을 변경하거나 취소할 수 있나요?", a: "가능합니다. 일정 변경이 필요하면 가급적 빨리 연락 주시면 조정을 도와드립니다." },
  ];
  const prose = `
        <h2 id="how">예약 방법</h2>
        <p>전화(${phone}) 또는 문자로 ① 지역(구·동), ② 희망 시간, ③ 원하는 코스를 알려주시면 가능한 일정을 안내드립니다.</p>
        <h2 id="time">예약 가능 시간</h2>
        <p>오전부터 심야까지 시간대를 협의해 안내드립니다. 당일 예약도 가능하며, 시간대에 따라 도착 예상 시간을 함께 안내합니다.</p>
        <h2 id="place">방문 가능 장소</h2>
        <p>자택, 오피스텔, 호텔·숙소 등에서 가능합니다. 공동현관·주차·객실 방문 규정을 미리 확인하면 진행이 매끄럽습니다.</p>
        <h2 id="pay">결제 안내</h2>
        <p>결제 방법은 예약 시 안내드리며, 추가 출장비가 있는 경우 사전에 명확히 알려드립니다. 숨겨진 비용은 없습니다.</p>
        <h2 id="cancel">취소·변경 안내</h2>
        <p>일정 변경·취소는 가급적 빨리 연락 주시면 조정을 도와드립니다.</p>
        <h2 id="check">예약 전 확인사항</h2>
        <div class="callout">정확한 주소와 출입 방식, 원하는 코스와 압을 함께 알려주시면 일정 안내가 빠릅니다. ${brand}는 건전한 휴식 관리만 제공하며 성적 서비스를 제공하지 않습니다.</div>
        <h2>자주 묻는 질문</h2>
        ${faqBlock(faqs)}`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "예약안내", path: "/reservation/" }];
  return articlePage({
    title: `예약안내 | 수원 출장마사지 예약 방법 | ${brand}`,
    description: `수원 출장마사지 예약안내 - 예약 방법, 예약 가능 시간, 방문 가능 장소, 결제·취소 안내. 예약 ${phone}.`,
    h1: "예약안내", lead: "예약 방법부터 결제·취소까지 한 번에 확인하세요.",
    proseHtml: prose, crumbs, jsonLd: [faqLd(faqs)],
  });
}

// ---- 이용가이드 ----
function buildGuide() {
  const faqs = [
    { q: "처음이라 긴장되는데 괜찮을까요?", a: "상담으로 원하는 압과 집중 부위를 먼저 확인한 뒤 진행하니 편안하게 받으시면 됩니다." },
    { q: "관리 후 주의할 점이 있나요?", a: "수분을 충분히 섭취하고 무리한 활동은 피한 채 충분히 쉬는 것이 좋습니다." },
  ];
  const prose = `
        <h2 id="first">처음 이용하시는 분</h2>
        <p>처음이라면 부드러운 <a href="/course/relax/">피로 회복 관리</a>나 <a href="/course/aroma/">아로마 관리</a>로 시작하길 추천합니다. 상담 시 원하는 압을 알려주시면 컨디션에 맞춰 진행합니다.</p>
        <h2 id="prepare">방문 전 준비사항</h2>
        <ul><li>샤워 후 편안한 상태가 좋습니다.</li><li>방문 장소의 공동현관·주차 정보를 준비해주세요.</li><li>건강상 주의가 필요한 부분은 미리 알려주세요.</li></ul>
        <h2 id="safety">위생 및 안전 안내</h2>
        <p>1회용품과 청결한 용품을 사용하며 위생을 우선으로 관리합니다.</p>
        <h2 id="after">관리 후 주의사항</h2>
        <p>관리 후에는 수분을 충분히 섭취하고 무리한 활동을 피하며 충분히 쉬는 것이 좋습니다.</p>
        <h2 id="forbidden">금지행위 안내</h2>
        <div class="callout">${brand}는 건전한 휴식·웰니스 관리만 제공합니다. 성적 서비스 및 불법적 요청은 일절 제공하지 않으며, 관련 요청 시 관리는 즉시 중단되고 정중히 거절합니다. 관리사에 대한 부적절한 언행도 금지됩니다.</div>
        <h2 id="faq">자주 묻는 질문</h2>
        ${faqBlock(faqs)}`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "이용가이드", path: "/guide/" }];
  return articlePage({
    title: `이용가이드 | 수원 출장마사지 이용 안내 | ${brand}`,
    description: `수원 출장마사지 이용가이드 - 처음 이용, 방문 전 준비, 위생·안전, 관리 후 주의, 금지행위 안내. 예약 ${phone}.`,
    h1: "이용가이드", lead: "처음 이용하시는 분을 위한 안내와 주의사항입니다.",
    proseHtml: prose, crumbs, jsonLd: [faqLd(faqs)],
  });
}

// ---- 고객후기 ----
function buildReviewsIndex() {
  const all = Object.entries(reviewsByGu).flatMap(([gu, arr]) => arr.map((r) => ({ ...r, gu })));
  const prose = `
        <h2>전체 후기</h2>
        <p>${brand}를 이용해주신 고객님의 대표 후기입니다. 구별 후기는 아래에서 확인하세요.</p>
        <div class="review-grid">
          ${all.map((r) => `<div class="review-card"><div class="stars">${"★".repeat(r.s)}${"☆".repeat(5 - r.s)}</div><p>${r.t}</p><div class="meta">${r.m}</div></div>`).join("\n          ")}
        </div>
        <h2>구별 후기</h2>
        <ul>${suwonGu.map((g) => `<li><a href="/reviews/${g.slug}/">${g.name} 후기</a></li>`).join("")}</ul>
        <h2>후기 작성 안내</h2>
        <p>관리를 받으신 후 솔직한 후기를 남겨주시면 다른 고객님께 도움이 됩니다. 후기는 실제 이용 경험을 바탕으로 작성해주세요.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "고객후기", path: "/reviews/" }];
  const sideExtra = `<div class="side-card"><h4>구별 후기</h4><div class="side-links">
    ${suwonGu.map((g) => `<a href="/reviews/${g.slug}/">${g.name} 후기</a>`).join("\n    ")}
  </div></div>`;
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
        <p>${g.name} 지역에서 ${brand}를 이용해주신 고객님의 후기입니다.</p>
        <div class="review-grid">
          ${arr.map((r) => `<div class="review-card"><div class="stars">${"★".repeat(r.s)}${"☆".repeat(5 - r.s)}</div><p>${r.t}</p><div class="meta">${r.m}</div></div>`).join("\n          ")}
        </div>
        <h2>${g.name} 출장마사지 예약</h2>
        <p>${g.name} 예약은 전화(${phone}) 또는 문자로 문의해주세요. 지역 안내는 <a href="/suwon/${g.slug}/">${g.name} 출장마사지</a> 페이지에서 확인할 수 있습니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "고객후기", path: "/reviews/" }, { name: `${g.name} 후기`, path: `/reviews/${g.slug}/` }];
  const sideExtra = `<div class="side-card"><h4>다른 구 후기</h4><div class="side-links">
    <a href="/reviews/">전체 후기</a>
    ${suwonGu.filter((x) => x.slug !== g.slug).map((x) => `<a href="/reviews/${x.slug}/">${x.name} 후기</a>`).join("\n    ")}
  </div></div>`;
  return articlePage({
    title: `${g.name} 후기 | 수원 ${g.name} 출장마사지 후기 | ${brand}`,
    description: `수원 ${g.name} 출장마사지 고객후기 - ${g.name} 지역 이용 후기를 확인하세요. 예약 ${phone}.`,
    h1: `${g.name} 출장마사지 후기`, lead: `${g.name} 지역 이용 후기입니다.`,
    proseHtml: prose, crumbs, sideExtra, jsonLd: [orgLd],
  });
}

// ---- 고객센터 ----
function buildCustomer() {
  const faqs = [
    { q: "상담은 어떻게 하나요?", a: `전화(${phone}) 또는 문자로 문의해주시면 안내드립니다.` },
    { q: "제휴·기업 문의도 가능한가요?", a: "가능합니다. 기업/단체 방문 관리는 인원과 장소를 알려주시면 협의 후 안내드립니다." },
  ];
  const prose = `
        <h2 id="notice">공지사항</h2>
        <p>운영 시간 및 안내 변경 사항은 본 페이지를 통해 공지합니다. 현재 24시간 예약 상담을 운영하고 있습니다.</p>
        <h2 id="faq">자주 묻는 질문</h2>
        ${faqBlock(faqs)}
        <h2 id="contact">1:1 문의</h2>
        <p>예약·이용 관련 문의는 전화(${phone}) 또는 문자로 남겨주시면 순차적으로 안내드립니다.</p>
        <h2 id="biz">제휴·기업 문의</h2>
        <p>기업/단체 방문 관리, 제휴 관련 문의는 인원·장소·일정을 함께 알려주시면 협의 후 안내드립니다. 자세한 내용은 <a href="/course/corporate/">기업/단체 방문 관리</a>를 확인하세요.</p>
        <h2>개인정보처리방침</h2>
        <p>개인정보 수집·이용에 관한 내용은 <a href="/privacy-policy/">개인정보처리방침</a>에서 확인할 수 있습니다.</p>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "고객센터", path: "/customer/" }];
  return articlePage({
    title: `고객센터 | 수원 출장마사지 문의 | ${brand}`,
    description: `${brand} 고객센터 - 공지사항, 자주 묻는 질문, 1:1 문의, 제휴·기업 문의 안내. 예약 ${phone}.`,
    h1: "고객센터", lead: "문의와 안내를 한 곳에서 확인하세요.",
    proseHtml: prose, crumbs, jsonLd: [faqLd(faqs)],
  });
}

function buildPrivacy() {
  const prose = `
        <h2>개인정보처리방침</h2>
        <p>${brand}(이하 "회사")는 이용자의 개인정보를 중요하게 생각하며 관련 법령을 준수합니다.</p>
        <h3>1. 수집하는 개인정보 항목</h3>
        <p>예약 상담을 위해 연락처(전화번호), 방문 지역, 희망 시간 등 예약에 필요한 최소한의 정보를 수집합니다.</p>
        <h3>2. 개인정보의 이용 목적</h3>
        <p>수집한 정보는 예약 접수·확인, 방문 일정 안내, 고객 문의 응대 목적으로만 이용합니다.</p>
        <h3>3. 개인정보의 보유 및 이용 기간</h3>
        <p>예약 및 상담 목적이 달성된 후에는 관련 법령에서 정한 기간을 제외하고 지체 없이 파기합니다.</p>
        <h3>4. 개인정보의 제3자 제공</h3>
        <p>회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만 법령에 근거가 있는 경우는 예외로 합니다.</p>
        <h3>5. 이용자의 권리</h3>
        <p>이용자는 언제든지 자신의 개인정보 열람·정정·삭제를 요청할 수 있으며, 고객센터(${phone})로 요청하실 수 있습니다.</p>
        <h3>6. 문의처</h3>
        <p>개인정보 관련 문의는 고객센터 운영팀(${phone})으로 연락해주시기 바랍니다.</p>
        <div class="callout">본 방침은 ${buildDate} 기준이며, 내용 변경 시 본 페이지를 통해 공지합니다.</div>`;
  const crumbs = [{ name: "홈", path: "/" }, { name: "개인정보처리방침", path: "/privacy-policy/" }];
  return articlePage({
    title: `개인정보처리방침 | ${brand}`,
    description: `${brand} 개인정보처리방침 - 개인정보 수집 항목, 이용 목적, 보유 기간, 이용자 권리 안내.`,
    h1: "개인정보처리방침", lead: "",
    proseHtml: prose, crumbs, jsonLd: [],
  });
}

/* ===================== 5. SEO 파일 ===================== */
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
  const map = {
    "/": "수원 출장마사지 예약 안내", "/suwon/": "수원출장마사지", "/course/": "코스안내",
    "/course/price/": "코스별 가격 안내", "/course/guide/": "코스 선택 가이드", "/reservation/": "예약안내",
    "/guide/": "이용가이드", "/reviews/": "고객후기", "/customer/": "고객센터", "/privacy-policy/": "개인정보처리방침",
  };
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

/* ===================== 6. 실행 ===================== */
async function main() {
  const w = [];
  w.push(await writeFile("index.html", buildHome()));
  w.push(await writeFile("suwon/index.html", buildSuwonMain()));
  w.push(await writeFile("course/index.html", buildCourseIndex()));
  for (const c of courses) w.push(await writeFile(`course/${c.slug}/index.html`, buildCourse(c)));
  w.push(await writeFile("course/price/index.html", buildCoursePrice()));
  w.push(await writeFile("course/guide/index.html", buildCourseGuide()));
  w.push(await writeFile("reservation/index.html", buildReservation()));
  w.push(await writeFile("guide/index.html", buildGuide()));
  w.push(await writeFile("reviews/index.html", buildReviewsIndex()));
  w.push(await writeFile("customer/index.html", buildCustomer()));
  w.push(await writeFile("privacy-policy/index.html", buildPrivacy()));
  for (const g of suwonGu) {
    w.push(await writeFile(`suwon/${g.slug}/index.html`, buildGu(g)));
    w.push(await writeFile(`reviews/${g.slug}/index.html`, buildReviewsGu(g)));
    for (const d of g.dongs) w.push(await writeFile(`suwon/${g.slug}/${d.slug}/index.html`, buildDong(g, d)));
  }
  const urls = collectUrls();
  const sm = buildSitemap(urls);
  w.push(await writeFile("sitemap.xml", sm));
  w.push(await writeFile("sitemap1.xml", sm));
  w.push(await writeFile("rss.xml", buildRss(urls)));
  w.push(await writeFile("robots.txt", robotsTxt));
  console.log(`✅ ${w.length}개 파일 생성 완료 (siteUrl: ${siteUrl})`);
  console.log(`   동 페이지 ${suwonGu.reduce((n, g) => n + g.dongs.length, 0)}개, sitemap URL ${urls.length}개`);
}

main().catch((e) => { console.error(e); process.exit(1); });
