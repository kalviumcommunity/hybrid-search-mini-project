# Hybrid Search: BM25 + Vector with RRF

## Evaluation Results

| Query | Keyword Rank | Semantic Rank | Hybrid Rank |
|---|---:|---:|---:|
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

Hybrid Search performs best overall, achieving an MRR of 0.90 compared to 0.67 for Semantic Search and 0.33 for Keyword Search. It improves MRR by 0.23 over Semantic Search and 0.57 over Keyword Search. For the query "redis or memcached for caching", neither search ranked the correct answer first, but fusion moved it to rank 1 because both searches ranked it near the top. For "why does my redis memory keep climbing", Keyword Search ranked the correct answer at position 15, but Hybrid Search moved it to rank 1 because Semantic Search also found it at rank 2; fetching the top 20 results allowed RRF to rescue this document. Hybrid Search does not rank every answer first because some documents receive stronger ranking contributions from one search than from the other.