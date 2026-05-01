import { useMemo, useState } from 'react';
import { allCategories, allSets, blocks } from '../data/blocks';
import BlockTile from '../components/BlockTile';

export default function Library() {
  const [query, setQuery] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const filtered = useMemo(() => {
    let list = blocks;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.material.toLowerCase().includes(q),
      );
    }
    if (setFilter) list = list.filter((b) => b.set === setFilter);
    if (catFilter) list = list.filter((b) => b.category === catFilter);
    return list;
  }, [query, setFilter, catFilter]);

  // group by set for nicer display
  const grouped = useMemo(() => {
    const m = new Map<string, typeof filtered>();
    for (const b of filtered) {
      if (!m.has(b.set)) m.set(b.set, []);
      m.get(b.set)!.push(b);
    }
    return Array.from(m.entries());
  }, [filtered]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Block Library</h1>
        <p className="page-sub">{blocks.length} building pieces from Grounded 2.</p>
      </header>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search blocks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input"
          value={setFilter}
          onChange={(e) => setSetFilter(e.target.value)}
        >
          <option value="">All sets</option>
          {allSets.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {grouped.map(([set, items]) => (
        <section key={set} className="library-set">
          <h2 className="library-set-title">{set}</h2>
          <div className="library-grid">
            {items.map((b) => (
              <div key={b.id} className="library-item">
                <BlockTile block={b} />
                <div className="library-item-name">{b.name}</div>
                <div className="library-item-sub">{b.category}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
