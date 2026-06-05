/* 세븐록 마사지 - FAQ 토글, 모바일 메뉴 인터랙션 */
(function () {
  "use strict";

  // 모바일 메뉴 토글
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      var expanded = nav.classList.contains("open");
      toggle.setAttribute("aria-expanded", String(expanded));
    });
  }

  // FAQ 아코디언
  var items = document.querySelectorAll(".faq-item");
  items.forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // 한 번에 하나만 열고 싶다면 아래 주석 해제
      // items.forEach(function (i) { i.classList.remove("open"); var aa = i.querySelector(".faq-a"); if (aa) aa.style.maxHeight = null; });
      if (isOpen) {
        item.classList.remove("open");
        a.style.maxHeight = null;
        q.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  // 부드러운 앵커 이동 시 헤더 높이 보정은 CSS scroll-margin으로 처리
})();
