// termspot theme.js — live ASCII album art in the Now Playing view.
// The current track's cover is redrawn as character art in your accent color.
// Toggle: run `localStorage.setItem("termspot:ascii", "0")` in the console
// (or "1" to re-enable), then change track.
(function termspotAscii() {
    if (!(window.Spicetify && Spicetify.Player)) {
        setTimeout(termspotAscii, 400);
        return;
    }

    const RAMP = " .'-:=+*#%@";
    const W = 60; // characters per row
    const H = 34; // rows (chars are ~2:1 tall)
    let lastKey = "";

    const style = document.createElement("style");
    style.id = "termspot-ascii-style";
    style.textContent = [
        // the hidden img keeps the cover box's size; the ascii overlays it exactly
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
    ].join("\n");
    document.head.appendChild(style);

    const enabled = () => window.localStorage.getItem("termspot:ascii") !== "0";

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
                out += RAMP[Math.min(RAMP.length - 1, (lum / 256) * RAMP.length | 0)];
            }
            out += "\n";
        }
        return out;
    }

    async function render() {
        const host = document.querySelector(".main-nowPlayingView-coverArt");
        const url = coverUrl();
        let pre = document.getElementById("termspot-ascii");

        if (!host || !url || !enabled()) {
            if (pre) pre.remove();
            document.body.classList.remove("termspot-ascii-on");
            lastKey = "";
            return;
        }
        const key = url;
        if (pre && key === lastKey && host.contains(pre)) return;

        try {
            const art = await toAscii(url);
            if (!pre || !host.contains(pre)) {
                if (pre) pre.remove();
                pre = document.createElement("pre");
                pre.id = "termspot-ascii";
                host.prepend(pre);
            }
            pre.textContent = art;
            document.body.classList.add("termspot-ascii-on");
            lastKey = key;
        } catch (e) {
            // cover fetch failed — leave the normal art alone
            document.body.classList.remove("termspot-ascii-on");
        }
    }

    render();
    // the sidebar re-mounts on navigation, so keep an eye on it
    setInterval(render, 2000);
    try {
        Spicetify.Player.addEventListener("songchange", () => setTimeout(render, 300));
    } catch (e) {
        /* interval covers it */
    }
})();
