export function mapObjectValues<T, P>(
  obj: Record<string, T>,
  cb: (key: string, value: T) => P,
): Record<string, P> {
  if (obj === undefined) return undefined;
  const res = {};
  for (const key of Object.keys(obj)) {
    res[key] = cb(key, obj[key]);
  }

  return res;
}

type ObjectKey = string | number | symbol;
export function groupByField<K extends ObjectKey, TItem extends Record<K, any>>(
  collection: TItem[],
  field: K,
): { group: TItem[K]; values: TItem[] }[] {
  const groups: Record<ObjectKey, TItem[]> = {};

  for (const item of collection) {
    const group = item[field];
    groups[group] = groups[group] || [];
    groups[group].push(item);
  }

  return Object.entries(groups).map(([group, values]) => {
    return { group: group as TItem[K], values };
  });
}

export function intersect<T>(sets: Set<T>[]): Set<T> {
  if (!sets.length) return new Set();

  const i = sets.reduce((m, s, i) => (s.size < sets[m].size ? i : m), 0);
  const [smallest] = sets.splice(i, 1);

  const res = new Set<T>();

  for (let val of smallest) if (sets.every(s => s.has(val))) res.add(val);

  return res;
}
