# termspot

by [fdeox](https://github.com/fdeox) — a CRT phosphor terminal theme for Spotify (via [Spicetify](https://spicetify.app)).

Scanlines, vignette, phosphor glow, path-style pane labels (`~/nav`, `~/library`,
`~/playing`), terminal control glyphs and a `>>` lyrics cursor. Your Spotify,
running on a machine from a better timeline.

> Pairs perfectly with the [Terminal Greeting](https://github.com/fdeox/spicetify-terminal-greeting)
> extension: boot log, terminal prompt with time-of-day greeting, now-playing
> ticker and night shift.

## Color schemes

| Scheme | Vibe |
|---|---|
| `Fdeox` *(default)* | Green phosphor — the classic CRT |
| `FdeoxAmber` | Amber phosphor — the warm one |
| `Gruvbox`, `GruvboxHard` | Retro warmth |
| `EverforestDarkHard/Medium/Soft` | Forest tones |

```
spicetify config color_scheme FdeoxAmber
spicetify apply
```

## CRT knobs

At the top of `user.css`:

```css
--crt-scanlines: block; /* none to disable */
--crt-vignette: block;  /* none to disable */
--crt-glow: 6px;        /* 0px to disable  */
```

## Install

```
# copy (or symlink) this folder to your spicetify Themes folder as "termspot"
spicetify config current_theme termspot
spicetify config color_scheme Fdeox
spicetify apply
```

## Credits

Structure inspired by the [text](https://github.com/spicetify/spicetify-themes/tree/master/text)
theme by darkthemer (spicetify-themes, MIT).
