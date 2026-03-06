# Git Reef 🪸

A bioluminescent coral reef visualization of your git repository. Contributors become glowing coral formations, commits swim as luminescent fish, and merge commits create bursts of light in the deep ocean.

![Git Reef](https://img.shields.io/badge/aesthetic-Apple%20level-black?style=for-the-badge)

## Features

- **Coral Formations** — Each contributor is represented as a unique coral structure. More commits = taller, more complex coral
- **Swimming Commits** — Individual commits swim around as glowing fish in their contributor's color
- **Merge Bursts** — Merge commits trigger bioluminescent particle explosions
- **Deep Ocean Atmosphere** — Volumetric lighting, bloom effects, and ambient particles
- **Interactive** — Hover over corals to see contributor stats, switch between camera views

## Quick Start

Simply open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge).

```bash
# Or serve it locally
npx serve .
```

## Using Your Own Repository Data

To visualize your own git repository, you can generate JSON data from your repo:

```bash
# Generate contributor data from your repo
git shortlog -sne --all | head -20
```

Then modify the `sampleRepoData` object in `index.html` with your data:

```javascript
const sampleRepoData = {
    name: "your-repo-name",
    contributors: [
        { 
            name: "Contributor Name", 
            commits: 142, 
            color: "#00f5d4",  // Pick a unique color
            additions: 12847, 
            deletions: 3291, 
            firstCommit: "2024-01-15", 
            areas: ["src/core/", "lib/"] 
        },
        // ... more contributors
    ],
    mergeCommits: 34,
    branches: 12
};
```

### Generating Full Stats

For detailed stats, you can use:

```bash
# Per-contributor stats
git log --format='%aN' | sort | uniq -c | sort -rn

# Additions/deletions per author
git log --author="Name" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2 } END { print add, subs }'

# Merge commits
git log --merges --oneline | wc -l

# Branch count
git branch -a | wc -l
```

## Controls

| View | Description |
|------|-------------|
| **Orbit** | Slowly rotates around the reef (default) |
| **Flythrough** | Side perspective for exploring |
| **Top View** | Bird's eye view of the entire reef |

Mouse over any coral to see contributor details.

## Color Palette

The default palette is designed for maximum visual impact in the dark ocean environment:

- `#00f5d4` — Cyan/Teal (primary glow)
- `#00bbf9` — Electric Blue
- `#7b2cbf` — Purple (merge bursts)
- `#f72585` — Magenta/Pink
- `#ff6b6b` — Coral Red
- `#4ecdc4` — Seafoam
- `#a78bfa` — Lavender
- `#fbbf24` — Amber

## Technical Details

Built with:
- **Three.js** — WebGL rendering
- **Unreal Bloom** — Post-processing glow effects
- **Custom particle systems** — Bioluminescent atmosphere
- **Procedural geometry** — Each coral is uniquely generated

## Browser Support

Requires WebGL 2.0 support. Works best in:
- Chrome 90+
- Firefox 85+
- Safari 15+
- Edge 90+

## License

MIT
