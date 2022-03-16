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

export function groupBy<TItem extends object, K extends keyof TItem>(
  collection: TItem[],
  field: K,
): Record<string, TItem[]> {
  const groups: Record<string, TItem[]> = {};

  for (const item of collection) {
    const group = item[field].toString();
    groups[group] = groups[group] || [];
    groups[group].push(item);
  }

  return groups;
}

export function intersect<T>(sets: Set<T>[]): Set<T> {
  if (!sets.length) return new Set();

  const i = sets.reduce((m, s, i) => (s.size < sets[m].size ? i : m), 0);
  const [smallest] = sets.splice(i, 1);

  const res = new Set<T>();

  for (let val of smallest) if (sets.every(s => s.has(val))) res.add(val);

  return res;
}
