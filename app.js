(function () {
  var config = window.INVITATION || {};
  var MAX_NAME = 40;
  var ALLOWED = /[^A-Za-z0-9 .,'\-&]/g;

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value || "";
  }

  function cleanName(raw) {
    if (!raw) return "";
    try {
      raw = decodeURIComponent(String(raw).replace(/\+/g, " "));
    } catch (err) {
      raw = String(raw);
    }
    return raw.trim().replace(ALLOWED, "").slice(0, MAX_NAME).trim();
  }

  function queryParams() {
    var search = window.location.search.replace(/^\?/, "");
    try {
      search = decodeURIComponent(search);
    } catch (err) {}
    return new URLSearchParams(search);
  }

  function inviteeName() {
    var params = queryParams();
    var fromQuery = params.get("to") || params.get("name");
    var hash = window.location.hash.replace(/^#\/?/, "");
    try {
      hash = decodeURIComponent(hash);
    } catch (err) {}
    if (/^(to|name)=/i.test(hash)) hash = hash.split("=").slice(1).join("=");
    var parts = window.location.pathname.split("/").filter(Boolean);
    var last = parts[parts.length - 1] || "";
    if (/\./.test(last) || /^(assets|invitation|inviweb)$/i.test(last)) last = "";
    return cleanName(fromQuery || hash || last);
  }

  function fillInvite() {
    setText("invitee-name", inviteeName() || "Friend");
    setText("invite-line", config.inviteLine);
    setText("person-a", config.personA);
    setText("person-b", config.personB);
    setText("date-line", config.dateLine);
    setText("time-line", config.timeLine);
    setText("venue-name", config.venueName);
    setText("venue-address", config.venueAddress);

    var maps = document.getElementById("maps-link");
    if (maps && config.mapsUrl) maps.href = config.mapsUrl;
  }

  function setupPager() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
    var OPENED_KEY = "invite-opened";
    var opened = false;
    try {
      opened = window.sessionStorage.getItem(OPENED_KEY) === "1";
    } catch (err) {}
    var index = opened ? 1 : 0;
    var busy = false;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var duration = reduce ? 180 : 700;
    var cooldown = reduce ? 80 : 420;
    var touchX = 0;
    var touchY = 0;
    var touchOnLink = false;

    function place(panel, state) {
      panel.classList.remove("is-current", "is-left", "is-right", "is-prep");
      if (state) panel.classList.add(state);
      panel.setAttribute("aria-hidden", state === "is-current" ? "false" : "true");
    }

    function markOpened() {
      opened = true;
      try {
        window.sessionStorage.setItem(OPENED_KEY, "1");
      } catch (err) {}
    }

    function sync() {
      panels.forEach(function (panel, n) {
        place(panel, n === index ? "is-current" : n < index ? "is-left" : "is-right");
      });
    }

    function go(next) {
      if (!opened) return;
      if (next < 1) next = 1;
      if (busy || next === index || next < 0 || next >= panels.length) return;
      busy = true;
      var dir = next > index ? 1 : -1;
      var current = panels[index];
      var incoming = panels[next];

      place(incoming, dir > 0 ? "is-right" : "is-left");
      incoming.classList.add("is-prep");
      incoming.offsetWidth;
      incoming.classList.remove("is-prep");
      place(current, dir > 0 ? "is-left" : "is-right");
      place(incoming, "is-current");
      index = next;

      window.setTimeout(function () {
        panels.forEach(function (panel, n) {
          place(panel, n === index ? "is-current" : n < index ? "is-left" : "is-right");
        });
        window.setTimeout(function () {
          busy = false;
        }, cooldown);
      }, duration);
    }

    window.addEventListener(
      "wheel",
      function (event) {
        event.preventDefault();
        if (busy) return;
        if (Math.abs(event.deltaY) < 8 && Math.abs(event.deltaX) < 8) return;
        var delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
        go(delta > 0 ? index + 1 : index - 1);
      },
      { passive: false }
    );

    window.addEventListener(
      "touchstart",
      function (event) {
        if (!event.touches[0]) return;
        touchOnLink = Boolean(event.target.closest("a, button"));
        touchX = event.touches[0].clientX;
        touchY = event.touches[0].clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      "touchend",
      function (event) {
        if (busy || touchOnLink || !event.changedTouches[0]) return;
        var dx = event.changedTouches[0].clientX - touchX;
        var dy = event.changedTouches[0].clientY - touchY;
        if (Math.abs(dx) < 48 && Math.abs(dy) < 48) return;
        if (Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? index + 1 : index - 1);
        else go(dy < 0 ? index + 1 : index - 1);
      },
      { passive: true }
    );

    var openBtn = document.getElementById("open-invite");
    if (openBtn) {
      openBtn.addEventListener("click", function () {
        markOpened();
        go(1);
      });
    }

    if (opened) sync();

    window.addEventListener("keydown", function (event) {
      if (event.target.closest("a, button, input, textarea") && event.key === " ") return;
      if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        go(index + 1);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go(index - 1);
      }
    });
  }

  fillInvite();
  setupPager();
})();
