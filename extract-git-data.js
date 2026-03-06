#!/usr/bin/env node

/**
 * Git Reef Data Extractor
 * 
 * Run this script in your git repository to generate visualization data.
 * 
 * Usage:
 *   node extract-git-data.js > repo-data.json
 *   node extract-git-data.js --output data.json
 */

const { execSync } = require('child_process');
const path = require('path');

const COLORS = [
    '#00f5d4', '#00bbf9', '#7b2cbf', '#f72585', 
    '#ff6b6b', '#4ecdc4', '#a78bfa', '#fbbf24',
    '#06ffa5', '#fe5196', '#7c83fd', '#22d1ee',
    '#ff9f43', '#10ac84', '#5f27cd', '#ee5a24'
];

function exec(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }).trim();
    } catch (e) {
        return '';
    }
}

function getRepoName() {
    const remoteUrl = exec('git config --get remote.origin.url');
    if (remoteUrl) {
        const match = remoteUrl.match(/\/([^\/]+?)(\.git)?$/);
        if (match) return match[1];
    }
    return path.basename(process.cwd());
}

function getContributors() {
    const log = exec('git shortlog -sne --all');
    if (!log) return [];

    const contributors = [];
    const lines = log.split('\n').filter(Boolean);

    lines.forEach((line, index) => {
        const match = line.match(/^\s*(\d+)\s+(.+?)\s+<(.+)>$/);
        if (match) {
            const [, commits, name, email] = match;
            contributors.push({
                name: name.trim(),
                email: email.trim(),
                commits: parseInt(commits, 10),
                color: COLORS[index % COLORS.length]
            });
        }
    });

    return contributors;
}

function getContributorStats(name) {
    const stats = exec(`git log --author="${name}" --pretty=tformat: --numstat`);
    let additions = 0;
    let deletions = 0;

    if (stats) {
        stats.split('\n').forEach(line => {
            const match = line.match(/^(\d+)\s+(\d+)/);
            if (match) {
                additions += parseInt(match[1], 10) || 0;
                deletions += parseInt(match[2], 10) || 0;
            }
        });
    }

    return { additions, deletions };
}

function getFirstCommit(name) {
    const date = exec(`git log --author="${name}" --format="%ai" --reverse | head -1`);
    if (date) {
        return date.split(' ')[0];
    }
    return null;
}

function getMostActiveAreas(name) {
    const files = exec(`git log --author="${name}" --name-only --pretty=format: | sort | uniq -c | sort -rn | head -20`);
    if (!files) return [];

    const areaCounts = {};
    files.split('\n').filter(Boolean).forEach(line => {
        const match = line.match(/^\s*\d+\s+(.+)/);
        if (match) {
            const filepath = match[1];
            const parts = filepath.split('/');
            if (parts.length > 1) {
                const area = parts.slice(0, Math.min(2, parts.length - 1)).join('/') + '/';
                areaCounts[area] = (areaCounts[area] || 0) + 1;
            }
        }
    });

    return Object.entries(areaCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([area]) => area);
}

function getMergeCommits() {
    const count = exec('git log --merges --oneline | wc -l');
    return parseInt(count, 10) || 0;
}

function getBranchCount() {
    const count = exec('git branch -a | wc -l');
    return parseInt(count, 10) || 0;
}

function main() {
    console.error('🪸 Extracting git data for Git Reef...\n');

    const repoName = getRepoName();
    console.error(`Repository: ${repoName}`);

    const contributors = getContributors();
    console.error(`Found ${contributors.length} contributors\n`);

    console.error('Processing contributor stats...');
    const enrichedContributors = contributors.slice(0, 20).map((contributor, index) => {
        console.error(`  ${index + 1}. ${contributor.name} (${contributor.commits} commits)`);
        
        const stats = getContributorStats(contributor.name);
        const firstCommit = getFirstCommit(contributor.name);
        const areas = getMostActiveAreas(contributor.name);

        return {
            name: contributor.name,
            commits: contributor.commits,
            color: contributor.color,
            additions: stats.additions,
            deletions: stats.deletions,
            firstCommit: firstCommit,
            areas: areas.length > 0 ? areas : ['root/']
        };
    });

    const repoData = {
        name: repoName,
        contributors: enrichedContributors,
        mergeCommits: getMergeCommits(),
        branches: getBranchCount()
    };

    console.error('\n✅ Done! Paste this data into index.html:\n');
    console.log(JSON.stringify(repoData, null, 2));
}

main();
