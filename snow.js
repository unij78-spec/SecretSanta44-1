(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 26; i++) {
    const s = document.createElement("span"), z = 2 + Math.random() * 4;
    s.className = "snow";
    s.style.cssText = "left:" + Math.random() * 100 + "vw;width:" + z + "px;height:" + z +
      "px;animation-duration:" + (9 + Math.random() * 10) + "s;animation-delay:-" + Math.random() * 15 +
      "s;--dx:" + (Math.random() * 60 - 30) + "px;opacity:" + (0.5 + Math.random() * 0.5);
    document.body.appendChild(s);
  }
})();
