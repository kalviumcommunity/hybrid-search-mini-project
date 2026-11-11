# Hybrid Search Mini Project (BM25 + Vector with RRF)

A tiny, self-contained mini project: fuse keyword and semantic search with **Reciprocal Rank Fusion (RRF)** and prove the hybrid beats each search alone. **No database or API keys needed** — each system's ranked results are provided as data.

## Files

- `hybrid-eval.js` — the file you build (four TODOs; loading is done for you).
- `test-set.csv` — 10 `(query, correct_post_ids)` pairs. Multiple correct ids are `;`-separated.
- `search-results.json` — each system's **top-20** ranked `post_id` list per query: `{ "<query>": { "keyword": [...], "semantic": [...] } }`. Array position 0 is rank 1.
- `posts-dataset.csv` — the 35 posts the ids refer to (for sanity-checking only).

## What to build in `hybrid-eval.js`

1. `rrfFuse(keywordIds, semanticIds, k = 60)` — merge two ranked lists into one. A doc's score is the sum of `1 / (k + rank)` over each list it appears in (rank is 1-based); sort by score, highest first.
2. `rankOf(ids, correctIds, cutoff)` — 1-based rank of the first correct id, or `null`.
3. For each query, build the hybrid list and record reciprocal rank + a recall@10 hit for **keyword, semantic, and hybrid**.
4. Print a markdown table (keyword / semantic / hybrid rank per query, `miss` if not found) with a Summary row of MRR and Recall@10 per system.

## Formulas

```text
RRF(doc)        = sum over each list of  1 / (k + rank of doc in that list)   [k = 60]
Reciprocal Rank = 1 / (rank of the first correct answer)   [0 if not found]
MRR             = average reciprocal rank over all queries
Recall@10       = (queries whose correct answer is in the top 10) / (total queries)
```

## Run

```bash
node hybrid-eval.js
```

## Evaluation Results

| Query | Keyword rank | Semantic rank | Hybrid rank |
|---|---|---|---|
| my redis cache keeps showing old data | 8 | 1 | 1 |
| how do I add semantic search to a table I already have | 12 | 2 | 1 |
| redis or memcached for caching | 1 | 2 | 1 |
| why did my query get slower after I added an index | 14 | 1 | 2 |
| what does ACID actually guarantee | 2 | 1 | 1 |
| how do I keep my postgres online while changing the schema | 6 | 3 | 1 |
| my background jobs stop after every deploy | 13 | 2 | 2 |
| how do I let my database accept more writes per second | 4 | 1 | 1 |
| sql or nosql for a new product | 1 | 3 | 1 |
| why does my redis memory keep climbing | 15 | 2 | 1 |
| **Summary** | **MRR 0.33 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** | **MRR 0.90 · Recall@10 1.00** |

## Interpretation

Overall, the hybrid search system outperforms both individual approaches, achieving an MRR of 0.90—a substantial +0.23 improvement over semantic search (0.67) and +0.57 over keyword search (0.33)—while maintaining a perfect 1.00 Recall@10. The power of consensus is demonstrated on the query *"how do I keep my postgres online while changing the schema"*, where the true answer was ranked 6th by keyword and 3rd by semantic search, yet hybrid boosted it to rank 1 because its joint appearance across both lists yielded a higher cumulative reciprocal score than single-modality top picks. Fetching a deeper candidate pool of 20 items rather than 10 was essential for queries like *"how do I add semantic search to a table I already have"* (keyword rank 12) and *"why does my redis memory keep climbing"* (keyword rank 15), as it ensured these buried keyword results were present to contribute reciprocal rank points alongside high semantic ranks. Hybrid does not achieve a rank 1 for every query because extreme rank disparities (e.g., keyword placing answers down at rank 13 or 14) can leave the cumulative score slightly below a strong top candidate supported heavily by one retriever.
