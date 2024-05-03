export function copyObject(obj) {
  return Object.fromEntries(Object.entries(obj));
}

export function parseArguments(argString) {
  const rex = /^("[^"]*"|'[^']*'|[^"',]+)(\s*,\s*(?:"[^"]*"|'[^']*'|[^"',]+))*$/s;
  const results = [];
  let s = argString.trim();
  let m = rex.exec(s);
  while (m) {
    if (m[2] === undefined) {
      results.unshift(m[1].trim());
      break;
    }
    s = s.substring(0, s.length - m[2].length);
    results.unshift(m[2].replace(/^[ ,]+/, "").trim());
    m = rex.exec(s);
  }

  // remove quote/double-quote from string
  for (let i = 0; i < results.length; i++) {
    const t = results[i];
    if (t.startsWith(`"`) || t.startsWith(`'`)) {
      results[i] = t.substring(1, t.length - 1);
      continue;
    }
    const n = Number(t);
    if (!isNaN(n)) {
      results[i] = n;
    }
  }
  return results;
}
