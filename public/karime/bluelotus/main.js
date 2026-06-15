(function () {
  "use strict";
  var CFG = window.BLUE_LOTUS || {};
  var body = document.body;
  body.classList.add("js");

  /* ---------- shared: USD display ---------- */
  function renderUsd() {
    var rate = CFG.usdRate || 18.5;
    document.querySelectorAll("[data-usd-from]").forEach(function (el) {
      var mxn = parseFloat(el.getAttribute("data-usd-from"));
      var usd = Math.round(mxn / rate);
      el.textContent = "approx $" + usd + " USD";
    });
  }
  renderUsd();

  function waLink(tier) {
    var num = (CFG.whatsapp || "").replace(/[^0-9]/g, "");
    var msg = (CFG.whatsappMsg && CFG.whatsappMsg[tier]) || "";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
  }

  /* ======================================================== INDEX */
  if (document.querySelector(".hero")) {
    initIndex();
  }
  /* ============================================== CONFIRMATION */
  if (document.querySelector(".confirm")) {
    initConfirmation();
  }

  /* ---------- ambient sound ---------- */
  var ambient = null, soundOn = false;
  function ensureAmbient() {
    if (ambient || !CFG.ambient) return;
    try { ambient = new Audio(CFG.ambient); ambient.loop = true; ambient.volume = 0.0; } catch (e) {}
  }
  function fade(el, to, ms) {
    if (!el) return;
    var from = el.volume, start = performance.now();
    function step(now) {
      var k = Math.min(1, (now - start) / ms);
      el.volume = from + (to - from) * k;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function setSound(on) {
    soundOn = on;
    var btn = document.getElementById("sound");
    if (btn) btn.classList.toggle("on", on);
    ensureAmbient();
    if (!ambient) return;
    if (on) { ambient.play().then(function(){ fade(ambient, 0.4, 1400); }).catch(function(){}); }
    else { fade(ambient, 0.0, 600); setTimeout(function(){ try{ ambient.pause(); }catch(e){} }, 650); }
  }
  var soundBtn = document.getElementById("sound");
  if (soundBtn) soundBtn.addEventListener("click", function () { setSound(!soundOn); });

  /* ---------- INDEX ---------- */
  function initIndex() {
    /* lotus petals */
    var NS = "http://www.w3.org/2000/svg";
    var g = document.getElementById("petals");
    if (g) {
      var layers = [
        { r: 92, w: 32, fill: "url(#pg)", op: 0.95 },
        { r: 66, w: 25, fill: "#8E6BCB", op: 0.92 },
        { r: 44, w: 19, fill: "#B98AD8", op: 0.95 }
      ];
      var count = 8;
      layers.forEach(function (L, li) {
        for (var i = 0; i < count; i++) {
          var ang = (360 / count) * i + (li % 2 ? 22 : 0);
          var p = document.createElementNS(NS, "path");
          p.setAttribute("d", "M0,0 C " + L.w + ",-" + (L.r * 0.55) + " " + (L.w * 0.4) + ",-" + L.r + " 0,-" + L.r + " C -" + (L.w * 0.4) + ",-" + L.r + " -" + L.w + ",-" + (L.r * 0.55) + " 0,0 Z");
          p.setAttribute("fill", L.fill);
          p.setAttribute("opacity", L.op);
          p.setAttribute("stroke", "#C9A24B");
          p.setAttribute("stroke-width", "0.6");
          p.setAttribute("class", "petal");
          p.style.setProperty("--r", ang + "deg");
          p.style.transitionDelay = (0.4 + 0.28 * li + 0.05 * i) + "s";
          g.appendChild(p);
        }
      });
    }

    /* drifting motes */
    for (var m = 0; m < 16; m++) {
      var d = document.createElement("div");
      d.className = "mote";
      d.style.left = (16 + Math.random() * 68) + "%";
      d.style.top = (30 + Math.random() * 45) + "%";
      d.style.animationDuration = (7 + Math.random() * 9) + "s";
      d.style.animationDelay = (Math.random() * 7) + "s";
      document.body.appendChild(d);
    }

    /* Lenis + GSAP */
    var lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.3, smoothWheel: true });
      window.__lenis = lenis;
      lenis.stop();
      if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
      }
    }

    /* reveals */
    function wireReveals() {
      if (window.gsap && window.ScrollTrigger) {
        gsap.utils.toArray(".reveal").forEach(function (el) {
          ScrollTrigger.create({ trigger: el, start: "top 86%", once: true,
            onEnter: function () { el.classList.add("in"); } });
        });
        /* hero altar parallax */
        if (document.querySelector(".bottle-wrap")) {
          gsap.to(".bottle-wrap", { y: -36, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
          gsap.to(".lotus-wrap", { y: -78, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
        }
      } else {
        document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      }
    }
    wireReveals();

    /* topbar appears after hero */
    var topbar = document.getElementById("topbar");
    if (topbar && window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: ".hero", start: "bottom 80%",
        onEnter: function(){ topbar.classList.add("show"); },
        onLeaveBack: function(){ topbar.classList.remove("show"); } });
    }

    /* ENTRY threshold */
    var enterBtn = document.getElementById("enter");
    function cross() {
      body.classList.remove("pre-enter");
      if (lenis) lenis.start();
      setSound(true);
      ScrollTrigger && ScrollTrigger.refresh();
    }
    if (enterBtn) enterBtn.addEventListener("click", cross);
    window.crossThreshold = cross;

    /* smooth scroll for the in-page cue */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.6 });
        else t.scrollIntoView({ behavior: "smooth" });
      });
    });

    /* commerce buttons */
    document.querySelectorAll("[data-buy]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var tier = btn.getAttribute("data-buy");
        var url = CFG.stripe && CFG.stripe[tier];
        if (url) { window.location.href = url; }
        else { window.location.href = "confirmation.html?tier=" + tier; }
      });
    });
  }

  /* ---------- CONFIRMATION ---------- */
  function initConfirmation() {
    var params = new URLSearchParams(window.location.search);
    var tier = params.get("tier") === "vessel" ? "vessel" : "rite";

    /* WhatsApp */
    var wa = document.querySelector(".wa-btn");
    if (wa) wa.setAttribute("href", waLink(tier));

    var riteOnly = document.querySelector(".rite-only");
    var vesselOnly = document.querySelector(".vessel-only");
    if (tier === "vessel") {
      if (riteOnly) riteOnly.style.display = "none";
      if (vesselOnly) vesselOnly.style.display = "";
    } else {
      if (vesselOnly) vesselOnly.style.display = "none";
      wireSoundcloud();
    }
  }

  function wireSoundcloud() {
    var a = CFG.audio || {};
    var btn = document.querySelector(".sc-btn");
    if (btn && a.soundcloud) btn.setAttribute("href", a.soundcloud);
    var titleEl = document.querySelector(".player-title");
    if (titleEl && a.title) titleEl.textContent = a.title;
    var durEl = document.querySelector(".player-dur");
    if (durEl && a.duration) durEl.textContent = a.duration;
  }
})();
