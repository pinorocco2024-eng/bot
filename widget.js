/*!
 * withjet.js - Embed script for your bot
 * Usage:
 *   <script
 *     src="https://bot-psi-snowy.vercel.app/static/withjet.js"
 *     data-withjet-bot-id="BOT_ID"
 *     data-withjet-origin="https://bot-psi-snowy.vercel.app"
 *     data-withjet-embed-path="/bot/embed"
 *     data-withjet-token="PUBLIC_EMBED_TOKEN"
 *   ></script>
 */
(function () {
  "use strict";

  function readAttr(script, name, fallback) {
    const v = script.getAttribute(name);
    return (v === null || v === "") ? fallback : v;
  }

  function safeJsonParse(s, fallback) {
    try { return JSON.parse(s); } catch (_) { return fallback; }
  }

  function createStyles() {
    const css = `
      .withjet-launcher {
        position: fixed;
        right: 18px;
        bottom: 18px;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        border: 0;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,0,0,.18);
        background: linear-gradient(135deg, #5b4bff, #8d4bff);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font: 600 14px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
        z-index: 2147483000;
      }

      .withjet-panel {
        position: fixed;
        right: 18px;
        bottom: 86px;
        width: 380px;
        height: 560px;
        max-height: 75vh;
        border-radius: 18px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 16px 60px rgba(0,0,0,.22);
        transform: translateY(10px);
        opacity: 0;
        pointer-events: none;
        transition: opacity .18s ease, transform .18s ease;
        z-index: 2147483000;
      }

      .withjet-panel.withjet-open {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }

      .withjet-iframe {
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
        background: #fff;
      }

      .withjet-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.15);
        opacity: 0;
        pointer-events: none;
        transition: opacity .18s ease;
        z-index: 2147482000;
      }

      .withjet-overlay.withjet-open {
        opacity: 1;
        pointer-events: auto;
      }

      @media (max-width: 420px) {
        .withjet-panel {
          right: 10px;
          left: 10px;
          width: auto;
          height: 70vh;
        }
      }
    `;
    const style = document.createElement("style");
    style.setAttribute("data-withjet-style", "true");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildUrl(origin, path, params) {
    const url = new URL(path, origin);
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== "") {
        url.searchParams.set(k, String(params[k]));
      }
    });
    return url.toString();
  }

  function main() {
    const script = document.currentScript || (function () {
      const scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

    // Config da data-attributes
    const botId = readAttr(script, "data-withjet-bot-id", "");
    const origin = readAttr(script, "data-withjet-origin", "");
    const embedPath = readAttr(script, "data-withjet-embed-path", "/bot/embed");
    const token = readAttr(script, "data-withjet-token", "");
    const theme = readAttr(script, "data-withjet-theme", "auto");
    const lang = readAttr(script, "data-withjet-lang", "it");
    const userMetaRaw = readAttr(script, "data-withjet-user", "{}");
    const userMeta = safeJsonParse(userMetaRaw, {});

    if (!origin) {
      console.error("[withjet] Missing data-withjet-origin (e.g. https://bot-psi-snowy.vercel.app)");
      return;
    }
    if (!botId) {
      console.error("[withjet] Missing data-withjet-bot-id");
      return;
    }

    // UI
    createStyles();

    const overlay = document.createElement("div");
    overlay.className = "withjet-overlay";

    const panel = document.createElement("div");
    panel.className = "withjet-panel";

    const btn = document.createElement("button");
    btn.className = "withjet-launcher";
    btn.type = "button";
    btn.setAttribute("aria-label", "Apri chat");
    btn.textContent = "Chat";

    // Costruisci URL iframe embed
    const iframeUrl = buildUrl(origin, embedPath, {
      botId,
      token,    // consigliato: token pubblico o firmato lato server (non segreti veri!)
      theme,
      lang,
      // puoi passare info utili (non sensibili) sull’utente
      user: Object.keys(userMeta).length ? JSON.stringify(userMeta) : ""
    });

    const iframe = document.createElement("iframe");
    iframe.className = "withjet-iframe";
    iframe.src = iframeUrl;
    iframe.setAttribute("title", "WithJet Bot");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    // sandbox: allenta solo ciò che serve davvero al tuo bot
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-forms allow-popups allow-same-origin"
    );

    panel.appendChild(iframe);

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(btn);

    let isOpen = false;

    function open() {
      isOpen = true;
      panel.classList.add("withjet-open");
      overlay.classList.add("withjet-open");
      // notifichiamo l'iframe
      postToBot({ type: "WITHJET_OPEN" });
    }

    function close() {
      isOpen = false;
      panel.classList.remove("withjet-open");
      overlay.classList.remove("withjet-open");
      postToBot({ type: "WITHJET_CLOSE" });
    }

    function toggle() {
      isOpen ? close() : open();
    }

    btn.addEventListener("click", toggle);
    overlay.addEventListener("click", close);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) close();
    });

    function postToBot(payload) {
      // invia solo all’origin del bot
      try {
        iframe.contentWindow.postMessage(
          { ...payload, botId },
          origin
        );
      } catch (err) {
        // no-op
      }
    }

    // Ricezione messaggi dal bot (solo se arrivano dall’origin giusto)
    window.addEventListener("message", (event) => {
      if (event.origin !== origin) return;
      const data = event.data || {};
      if (!data || data.botId !== botId) return;

      // esempi di comandi che l’iframe può inviare
      if (data.type === "WITHJET_REQUEST_CLOSE") close();
      if (data.type === "WITHJET_SET_BADGE") {
        // es: mostra badge notifiche (implementazione semplice)
        const n = Number(data.count || 0);
        btn.textContent = n > 0 ? `Chat (${n})` : "Chat";
      }
      if (data.type === "WITHJET_RESIZE") {
        // opzionale: permetti al bot di ridimensionare il pannello
        const w = Number(data.width);
        const h = Number(data.height);
        if (w && w >= 280 && w <= 520) panel.style.width = w + "px";
        if (h && h >= 360 && h <= 800) panel.style.height = h + "px";
      }
    });

    // API globale opzionale (per aprire la chat via codice)
    window.WithJet = {
      open,
      close,
      toggle,
      send: (payload) => postToBot({ type: "WITHJET_SEND", payload })
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
