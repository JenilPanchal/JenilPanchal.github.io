# Netrunner Terminal

An interactive portfolio built as a command-line terminal, styled after
Cyberpunk 2077. Visitors type commands to browse projects, skills, awards
and contact links.

Live at **[jenilpanchal.github.io](https://jenilpanchal.github.io)**.

## Running it

Open `index.html`. No build step, no dependencies, no server.

Append `?fast` to the URL to skip the boot sequence while editing.

## Content

All copy lives in `data.js` — identity, about, skills, projects, hackathons,
experience, education and contact. Edit a string, save, reload. `index.html`,
`style.css` and `script.js` never need to change to update content.

Two counts are derived, not hardcoded: the `about` panel prints the length of
the `projects` and `hackathons` arrays. The `role` line claims "7x", so that
array is kept at seven entries.

## Commands

| Command | Does |
|---|---|
| `help` | lists every command |
| `about` | ASCII panel, identity stats, bullet points |
| `skills` | animated skill meters |
| `projects` | every project as a card |
| `project <id>` | one project — e.g. `project pinch` or `project 2` |
| `hackathons` | competition record with links |
| `experience` | work timeline |
| `education` | degrees, certifications, languages |
| `contact` | all links |
| `open <name>` | opens a link directly — e.g. `open github` |
| `resume` | opens the resume PDF in a new tab, plus a save-to-disk link |
| `breach` | Breach Protocol easter egg |
| `clear`, `date`, `echo` | shell basics |

A few more are hidden from `help`: `sudo`, `exit`, `hello`.

## Interactions

- **Tab** accepts the inline ghost suggestion
- **↑ / ↓** walks command history
- **Ctrl+L** clears the screen
- Any keypress skips a running print animation
- Clicking anywhere refocuses the prompt

## Palette

Three accents, defined as CSS variables at the top of `style.css`:

| Token | Used for |
|---|---|
| `--yellow` | headings, prompt, ASCII art, skill bars |
| `--cyan` | links, values, terminal chrome |
| `--pink` | award lines, section markers, skill percentages |

Changing one token retints every element that uses it.

## Files

| File | What |
|---|---|
| `data.js` | all site content |
| `index.html` | page structure |
| `style.css` | theme, CRT effects, responsive rules |
| `script.js` | terminal engine and command definitions |
| `resume.pdf` | served by the `resume` command |
| `steve-dev.jpg` | shown at the end of the `breach` easter egg |

The PDF and the image are referenced by relative path, so all six files ship
together.

## Adding a command

```js
define("music", "what I listen to while coding", async () => {
  await print([ head("NOW PLAYING"), "  Some synthwave, probably." ]);
});
```

It appears in `help` and in Tab-completion automatically.
