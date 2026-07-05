# termspot

by [fdeox](https://github.com/fdeox) — a CRT phosphor terminal theme for Spotify (via [Spicetify](https://spicetify.app)).

Scanlines, vignette, phosphor glow, a power-on warm-up, tmux-style pane chips
(`~/nav`, `~/library`, `~/playing`), a statusline playbar, terminal control
glyphs, `## ` shelf headers, `> UPPERCASE` page titles and a `>>` lyrics cursor.
Your Spotify, running on a machine from a better timeline.

> Pairs perfectly with the [Terminal Greeting](https://github.com/fdeox/spicetify-terminal-greeting)
> extension: boot log, terminal prompt with time-of-day greeting, now-playing
> ticker and night shift.

![termspot](screenshots/scheme-Fdeox.jpg)

## Color schemes

Switch any time:

```
spicetify config color_scheme <SchemeName>
spicetify apply
```

| | |
|---|---|
| **Fdeox** *(default)* — green phosphor ![Fdeox](screenshots/scheme-Fdeox.jpg) | **FdeoxAmber** — amber phosphor ![FdeoxAmber](screenshots/scheme-FdeoxAmber.jpg) |
| **Synthwave** — neon night drive ![Synthwave](screenshots/scheme-Synthwave.jpg) | **Arctic** — cold storage ![Arctic](screenshots/scheme-Arctic.jpg) |
| **Bloodmoon** — alarm mode ![Bloodmoon](screenshots/scheme-Bloodmoon.jpg) | **Ultraviolet** — blacklight ![Ultraviolet](screenshots/scheme-Ultraviolet.jpg) |
| **Paper** — e-ink daylight ![Paper](screenshots/scheme-Paper.jpg) | **Gruvbox** ![Gruvbox](screenshots/scheme-Gruvbox.jpg) |
| **GruvboxHard** ![GruvboxHard](screenshots/scheme-GruvboxHard.jpg) | **EverforestDarkHard** ![EverforestDarkHard](screenshots/scheme-EverforestDarkHard.jpg) |
| **EverforestDarkMedium** ![EverforestDarkMedium](screenshots/scheme-EverforestDarkMedium.jpg) | **EverforestDarkSoft** ![EverforestDarkSoft](screenshots/scheme-EverforestDarkSoft.jpg) |

## Signature features

- **Live ASCII album art** — the current track's cover is redrawn as character
  art in your accent color, right in the now playing view.
- **VFD deck** — playback times in a real seven-segment display font, plus
  animated spectrum bars in the playbar that freeze when you pause.
- **Power-on warm-up** — the screen flickers to life like a real CRT.

## Settings

Everything is toggleable in-app: **Profile menu → termspot settings**
(ASCII art, spectrum bars, scanlines, vignette, power-on animation).

Fine-tuning lives at the top of `user.css`:

```css
--crt-glow: 6px;         /* 0px disables the phosphor glow */
--font-size: 14px;       /* try 12px + --line-height: 1.1 for a compact look */
```

## Install

```
# copy (or symlink) this folder into your spicetify Themes folder as "termspot"
spicetify config current_theme termspot
spicetify config color_scheme Fdeox
spicetify apply
```

## Credits

Structure inspired by the [text](https://github.com/spicetify/spicetify-themes/tree/master/text)
theme by darkthemer (spicetify-themes, MIT).
