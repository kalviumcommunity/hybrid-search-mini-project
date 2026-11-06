
// Hybrid Search (RRF) mini project - STARTER
// Goal: fuse keyword + semantic search with RRF, then compare all three systems.
// Fill in the 4 TODOs. Run with:  node hybrid-eval.js
// When your Summary row matches the answer key in the README, you are done.
// You do NOT need a database or API keys: the ranked results are provided as data.

const fs = require('fs');

// --- loading is done for you ---
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);
  return lines.map(line => {
    const [query, ids] = line.split(',');
    return { query, correctIds: ids.split(';').map(Number) };
  });
}
const testSet = loadTestSet('test-set.csv');
// results[query] = { keyword: [id1, id2, ...top 20], semantic: [...top 20] }
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// TODO 1: Reciprocal Rank Fusion.
// Given two ranked id-lists, return ONE fused id-list (highest RRF score first).
// RRF score of a doc = sum over each list it appears in of 1 / (k + rank), rank is 1-based.
function rrfFuse(keywordIds, semanticIds, k = 60) {
  // ...
  const scores = new Map();

  const addScores = (ids) => {
    ids.forEach((id, index) => {
      const rank = index + 1;
      const score = 1 / (k + rank);

      scores.set(id, (scores.get(id) || 0) + score);
    });
  };

  addScores(keywordIds);
  addScores(semanticIds);

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

// TODO 2: rank of the first correct id in a list (1-based), or null if none.
// The optional `cutoff` limits how far down you look (use 10 for recall@10).
function rankOf(ids, correctIds, cutoff = Infinity) {
  // ...
  const index = ids
    .slice(0, cutoff)
    .findIndex(id => correctIds.includes(Number(id)));

  return index === -1 ? null : index + 1;
}

// helpers
const rr = (ids, correctIds) => { const r = rankOf(ids, correctIds); return r ? 1 / r : 0; };
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;

const systems = ['keyword', 'semantic', 'hybrid'];
const rrs = { keyword: [], semantic: [], hybrid: [] };
const hits = { keyword: 0, semantic: 0, hybrid: 0 };
const rows = [];

for (const { query, correctIds } of testSet) {
  const kw = results[query].keyword;
  const sem = results[query].semantic;
  const hyb = rrfFuse(kw, sem, 60);   // uses your TODO 1
  const lists = { keyword: kw, semantic: sem, hybrid: hyb };

  // TODO 3: for each system, push its reciprocal rank and count a recall@10 hit.
  for (const s of systems) {
    // rrs[s].push(...)
    // if (correct answer is within the top 10 of lists[s]) hits[s]++
    rrs[s].push(rr(lists[s], correctIds));

    if (rankOf(lists[s], correctIds, 10) !== null) {
      hits[s]++;
    }
  }

  rows.push({ query, kw: rankOf(kw, correctIds), sem: rankOf(sem, correctIds), hyb: rankOf(hyb, correctIds) });
}

// TODO 4: print a markdown table, one row per query with the keyword / semantic / hybrid rank
// (print 'miss' when the answer is not in a list), then a Summary row with each system's
// MRR and Recall@10 rounded to 2 decimals.
const n = testSet.length;
// console.log(...)

console.log('| Query | Keyword Rank | Semantic Rank | Hybrid Rank |');
console.log('|---|---:|---:|---:|');

for (const row of rows) {
  console.log(
    `| ${row.query} | ${row.kw ?? 'miss'} | ${row.sem ?? 'miss'} | ${row.hyb ?? 'miss'} |`
  );
}

console.log(
  `| **Summary** | **MRR: ${mean(rrs.keyword).toFixed(2)}, Recall@10: ${(hits.keyword / n).toFixed(2)}** | **MRR: ${mean(rrs.semantic).toFixed(2)}, Recall@10: ${(hits.semantic / n).toFixed(2)}** | **MRR: ${mean(rrs.hybrid).toFixed(2)}, Recall@10: ${(hits.hybrid / n).toFixed(2)}** |`
);
