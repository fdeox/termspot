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

## CRT knobs

At the top of `user.css`:

```css
--crt-scanlines: block;  /* none to disable */
--crt-vignette: block;   /* none to disable */
--crt-glow: 6px;         /* 0px to disable  */
--crt-poweron: termspot-power-on 0.9s ease-out 1; /* none to disable */
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
