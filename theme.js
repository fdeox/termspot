// termspot theme.js — ASCII album art, VFD spectrum bars and live CRT settings.
// Everything is configurable from Profile menu → "termspot settings".
(function termspot() {
    if (
        !(
            window.Spicetify &&
            Spicetify.React &&
            Spicetify.ReactJSX &&
            Spicetify.Player &&
            Spicetify.Menu &&
            Spicetify.PopupModal
        )
    ) {
        setTimeout(termspot, 400);
        return;
    }

    /* ---- settings ---------------------------------------------------- */
    const STORAGE_KEY = "termspot:settings";
    const DEFAULTS = {
        ascii: true, // ASCII album art in the now playing view
        spectrum: true, // VFD spectrum bars in the playbar
        scanlines: true,
        vignette: true,
        poweron: true,
    };
    function loadSettings() {
        try {
            return { ...DEFAULTS, ...JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") };
        } catch (e) {
            return { ...DEFAULTS };
        }
    }
    function saveSettings(s) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        } catch (e) {
            /* keep in-memory */
        }
    }
    let settings = loadSettings();

    function applyCrtKnobs() {
        const root = document.documentElement.style;
        root.setProperty("--crt-scanlines", settings.scanlines ? "block" : "none");
        root.setProperty("--crt-vignette", settings.vignette ? "block" : "none");
        root.setProperty(
            "--crt-poweron",
            settings.poweron ? "termspot-power-on 0.9s ease-out 1" : "none"
        );
    }

    /* ---- shared css ---------------------------------------------------- */
    const style = document.createElement("style");
    style.id = "termspot-js-style";
    style.textContent = [
        // ascii art: the hidden img keeps the cover box's size, the pre overlays it
        ".termspot-ascii-on .main-nowPlayingView-coverArt img { visibility: hidden !important; }",
        ".termspot-ascii-on .main-nowPlayingView-coverArt { position: relative; }",
        "#termspot-ascii {",
        "  position: absolute; inset: 0; z-index: 2;",
        "  display: flex; align-items: center; justify-content: center;",
        '  font-family: "JetBrains Mono", "Cascadia Mono", Consolas, monospace !important;',
        "  font-size: 10px !important; line-height: 10px !important; letter-spacing: 0;",
        "  color: var(--spice-accent-active); white-space: pre;",
        "  text-shadow: 0 0 4px currentColor; user-select: none;",
        "  overflow: hidden; pointer-events: none;",
        "}",
        // spectrum bars
        "#termspot-spectrum {",
        "  display: flex; align-items: flex-end; gap: 2px;",
        "  height: 20px; margin: 0 14px; align-self: center;",
        "}",
        "#termspot-spectrum i {",
        "  width: 3px; background: var(--spice-accent-active);",
        "  box-shadow: 0 0 4px var(--spice-accent);",
        "  animation: termspot-bar 0.9s ease-in-out infinite alternate;",
        "}",
        "@keyframes termspot-bar { from { height: 15%; } to { height: 100%; } }",
    ].join("\n");
    document.head.appendChild(style);

    /* ---- ascii album art ------------------------------------------------ */
    const RAMP = " .'-:=+*#%@";
    const W = 60;
    const H = 34;
    let lastKey = "";
    let rendering = false;

    function coverUrl() {
        try {
            const item = Spicetify.Player.data && (Spicetify.Player.data.item || Spicetify.Player.data.track);
            const meta = item && item.metadata;
            const raw = meta && (meta.image_url || meta.image_xlarge_url);
            if (!raw) return null;
            return raw.startsWith("spotify:image:")
                ? "https://i.scdn.co/image/" + raw.slice("spotify:image:".length)
                : raw;
        } catch (e) {
            return null;
        }
    }

    async function toAscii(url) {
        const blob = await (await fetch(url)).blob();
        const bmp = await createImageBitmap(blob, { resizeWidth: W, resizeHeight: H });
        const cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext("2d");
        ctx.drawImage(bmp, 0, 0, W, H);
        const d = ctx.getImageData(0, 0, W, H).data;
        let out = "";
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const i = (y * W + x) * 4;
                const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
                out += RAMP[Math.min(RAMP.length - 1, ((lum / 256) * RAMP.length) | 0)];
            }
            out += "\n";
        }
        return out;
    }

    async function renderAscii() {
        if (rendering) return;
        const pre = document.getElementById("termspot-ascii");
        if (!settings.ascii) {
            if (pre) pre.remove();
            document.body.classList.remove("termspot-ascii-on");
            lastKey = "";
            return;
        }
        // keep the body class while enabled: when the sidebar remounts, the real
        // cover stays hidden from first paint instead of flashing before the art
        document.body.classList.add("termspot-ascii-on");

        const host = document.querySelector(".main-nowPlayingView-coverArt");
        const url = coverUrl();
        if (!host || !url) return;
        if (pre && url === lastKey && host.contains(pre)) return;

        rendering = true;
        try {
            const art = await toAscii(url);
            let target = document.getElementById("termspot-ascii");
            if (!target || !host.contains(target)) {
                if (target) target.remove();
                target = document.createElement("pre");
                target.id = "termspot-ascii";
                host.prepend(target);
            }
            target.textContent = art;
            lastKey = url;
        } catch (e) {
            /* cover fetch failed; try again on the next pass */
        } finally {
            rendering = false;
        }
    }

    /* ---- VFD spectrum bars ---------------------------------------------- */
    const BAR_COUNT = 14;

    function renderSpectrum() {
        let box = document.getElementById("termspot-spectrum");
        if (!settings.spectrum) {
            if (box) box.remove();
            return;
        }
        const anchor = document.querySelector(".main-nowPlayingBar-right");
        if (!anchor) return;
        if (!box || box.parentElement !== anchor) {
            if (box) box.remove();
            box = document.createElement("div");
            box.id = "termspot-spectrum";
            for (let i = 0; i < BAR_COUNT; i++) {
                const bar = document.createElement("i");
                bar.style.animationDuration = (0.45 + Math.random() * 0.75).toFixed(2) + "s";
                bar.style.animationDelay = (-Math.random()).toFixed(2) + "s";
                box.appendChild(bar);
            }
            anchor.prepend(box);
        }
        const playing = (() => {
            try {
                return Spicetify.Player.isPlaying();
            } catch (e) {
                return false;
            }
        })();
        box.querySelectorAll("i").forEach((b) => {
            b.style.animationPlayState = playing ? "running" : "paused";
        });
    }

    /* ---- settings ui ------------------------------------------------------ */
    function openSettings() {
        const wrap = document.createElement("div");
        wrap.style.cssText = "display:flex;flex-direction:column;gap:12px;font-size:14px;";

        const boxes = [
            ["ascii", "ASCII album art in the now playing view"],
            ["spectrum", "VFD spectrum bars in the playbar"],
            ["scanlines", "CRT scanlines"],
            ["vignette", "CRT vignette"],
            ["poweron", "Power-on warm-up animation"],
        ].map(([key, label]) => {
            const l = document.createElement("label");
            l.style.cssText = "display:flex;gap:8px;align-items:center;cursor:pointer;";
            const c = document.createElement("input");
            c.type = "checkbox";
            c.checked = settings[key];
            c.dataset.key = key;
            l.append(c, document.createTextNode(label));
            return l;
        });

        const save = document.createElement("button");
        save.textContent = "Save";
        save.style.cssText =
            "margin-top:4px;padding:8px 24px;align-self:flex-start;cursor:pointer;" +
            "background:var(--spice-button-active);color:var(--spice-main);border:none;";
        save.addEventListener("click", () => {
            boxes.forEach((l) => {
                const c = l.querySelector("input");
                settings[c.dataset.key] = c.checked;
            });
            saveSettings(settings);
            applyCrtKnobs();
            renderAscii();
            renderSpectrum();
            Spicetify.PopupModal.hide();
            Spicetify.showNotification("termspot: settings saved");
        });

        wrap.append(...boxes, save);
        Spicetify.PopupModal.display({ title: "termspot", content: wrap });
    }

    try {
        new Spicetify.Menu.Item("termspot settings", false, openSettings).register();
    } catch (e) {
        console.error("[termspot] menu registration failed:", e);
    }

    /* ---- wiring -------------------------------------------------------------- */
    const safely = (fn) => () => {
        try {
            fn();
        } catch (e) {
            console.error("[termspot]", e);
        }
    };
    const tick = safely(() => {
        renderAscii();
        renderSpectrum();
    });

    applyCrtKnobs();
    tick();
    // the sidebar and playbar remount on navigation — react quickly but debounced
    let obsTimer = 0;
    new MutationObserver(() => {
        clearTimeout(obsTimer);
        obsTimer = setTimeout(tick, 250);
    }).observe(document.body, { childList: true, subtree: true });
    try {
        Spicetify.Player.addEventListener("songchange", () => setTimeout(tick, 250));
        Spicetify.Player.addEventListener("onplaypause", tick);
    } catch (e) {
        /* observer covers it */
    }
})();
