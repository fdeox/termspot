// termspot theme.js — ASCII album art, ASCII progress bar, track-load log,
// monochrome phosphor covers and live CRT settings.
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
        mono: true, // monochrome phosphor covers (hover restores color)
        asciiProgress: true, // [████░░░░] progress bar
        trackLog: true, // "reading: track_1947.dat" toast on song change
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
        document.body.classList.toggle("termspot-mono", settings.mono);
        document.body.classList.toggle("termspot-aprog", settings.asciiProgress);
    }

    /* ---- shared css ---------------------------------------------------- */
    const COVERS =
        ".main-cardImage-image, .view-homeShortcutsGrid-imageContainer img," +
        " .main-trackList-rowImage, .main-coverSlotCollapsed-container img," +
        " .main-nowPlayingWidget-coverArt img, .x-entityImage-image," +
        " .main-entityHeader-image, .main-nowPlayingView-coverArt img";

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
        // monochrome phosphor covers, hover restores the original colors
        ".termspot-mono :is(" + COVERS + ") {",
        "  filter: grayscale(1) sepia(1) hue-rotate(80deg) brightness(0.8);",
        "  transition: filter 0.25s ease;",
        "}",
        ".termspot-mono :is(" + COVERS + "):hover,",
        ".termspot-mono .main-card-card:hover :is(" + COVERS + "),",
        ".termspot-mono .main-trackList-trackListRow:hover :is(" + COVERS + ") {",
        "  filter: none;",
        "}",
        // ascii progress bar: hide the real bar's paint, keep its hit area
        ".termspot-aprog .playback-bar [data-testid=\"progress-bar\"] { opacity: 0 !important; }",
        "#termspot-progress {",
        "  position: absolute; inset: 0; z-index: 5;",
        "  display: flex; align-items: center; justify-content: center;",
        '  font-family: "JetBrains Mono", "Cascadia Mono", Consolas, monospace !important;',
        "  font-size: 12px !important; line-height: 1 !important;",
        "  color: var(--spice-accent-active); white-space: pre;",
        "  text-shadow: 0 0 var(--crt-glow, 6px) currentColor;",
        "  pointer-events: none; user-select: none;",
        "}",
        // track load log
        "#termspot-tracklog {",
        "  position: fixed; left: 18px; bottom: 118px; z-index: 9998;",
        '  font-family: "JetBrains Mono", "Cascadia Mono", Consolas, monospace !important;',
        "  font-size: 12px !important; line-height: 1.5 !important;",
        "  color: var(--spice-accent-active); white-space: pre;",
        "  text-shadow: 0 0 4px currentColor; pointer-events: none; user-select: none;",
        "  background: rgba(var(--spice-rgb-main), 0.85); padding: 8px 12px;",
        "  border: 1px solid var(--spice-border-inactive);",
        "  transition: opacity 0.4s ease;",
        "}",
    ].join("\n");
    document.head.appendChild(style);

    /* ---- ascii album art ------------------------------------------------ */
    const RAMP = " .'-:=+*#%@";
    const W = 60;
    const H = 34;
    let lastKey = "";
    let rendering = false;

    function currentItem() {
        try {
            return Spicetify.Player.data && (Spicetify.Player.data.item || Spicetify.Player.data.track);
        } catch (e) {
            return null;
        }
    }

    function coverUrl() {
        const item = currentItem();
        const meta = item && item.metadata;
        const raw = meta && (meta.image_url || meta.image_xlarge_url);
        if (!raw) return null;
        return raw.startsWith("spotify:image:")
            ? "https://i.scdn.co/image/" + raw.slice("spotify:image:".length)
            : raw;
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
        // keep the body class while enabled so the real cover never flashes
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

    /* ---- ascii progress bar ---------------------------------------------- */
    const CELLS = 36;

    function renderProgress() {
        let el = document.getElementById("termspot-progress");
        if (!settings.asciiProgress) {
            if (el) el.remove();
            return;
        }
        const bar = document.querySelector('.playback-bar [data-testid="progress-bar"]');
        if (!bar) return;
        const host = bar.parentElement;
        if (!host) return;
        if (!el || el.parentElement !== host) {
            if (el) el.remove();
            host.style.position = "relative";
            el = document.createElement("div");
            el.id = "termspot-progress";
            host.appendChild(el);
        }
        let frac = 0;
        try {
            const dur = Spicetify.Player.getDuration();
            frac = dur ? Spicetify.Player.getProgress() / dur : 0;
        } catch (e) {
            frac = 0;
        }
        const filled = Math.round(Math.max(0, Math.min(1, frac)) * CELLS);
        el.textContent = "[" + "█".repeat(filled) + "░".repeat(CELLS - filled) + "]";
    }

    /* ---- track load log ----------------------------------------------------- */
    let logTimers = [];

    function showTrackLog() {
        if (!settings.trackLog) return;
        const item = currentItem();
        const meta = item && item.metadata;
        if (!meta || !meta.title) return;

        logTimers.forEach(clearTimeout);
        logTimers = [];
        document.getElementById("termspot-tracklog")?.remove();

        const fname =
            meta.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24) ||
            "track";
        const durSec = ((item && item.duration && item.duration.milliseconds) || 194000) / 1000 | 0;
        const LINES = [
            "reading: " + fname + "_" + durSec + ".dat ........ OK",
            "artist metadata loaded",
            "album artwork rendered",
        ];

        const box = document.createElement("div");
        box.id = "termspot-tracklog";
        document.body.appendChild(box);

        LINES.forEach((line, i) => {
            logTimers.push(
                setTimeout(() => {
                    box.appendChild(document.createTextNode(line + "\n"));
                }, 140 * (i + 1))
            );
        });
        logTimers.push(setTimeout(() => (box.style.opacity = "0"), 2100));
        logTimers.push(setTimeout(() => box.remove(), 2600));
    }

    /* ---- settings ui ------------------------------------------------------ */
    function openSettings() {
        const wrap = document.createElement("div");
        wrap.style.cssText = "display:flex;flex-direction:column;gap:12px;font-size:14px;";

        const boxes = [
            ["ascii", "ASCII album art in the now playing view"],
            ["mono", "Monochrome phosphor covers (hover = color)"],
            ["asciiProgress", "ASCII progress bar [████░░░░]"],
            ["trackLog", "Track load log on song change"],
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
            renderProgress();
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
        renderProgress();
    });

    applyCrtKnobs();
    tick();
    setInterval(safely(renderProgress), 500);
    // the sidebar and playbar remount on navigation — react quickly but debounced
    let obsTimer = 0;
    new MutationObserver(() => {
        clearTimeout(obsTimer);
        obsTimer = setTimeout(tick, 250);
    }).observe(document.body, { childList: true, subtree: true });
    try {
        Spicetify.Player.addEventListener("songchange", () => {
            setTimeout(tick, 250);
            showTrackLog();
        });
    } catch (e) {
        /* observer covers it */
    }
})();
