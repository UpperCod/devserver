import { createMatch } from "@uppercod/exp-route";

const cache = {};

export function routes(cases, value) {
  for (const prop in cases) {
    cache[prop] = cache[prop] || createMatch(prop);
    const params = cache[prop](value);
    if (params) {
      return cases[prop](params);
    }
  }
}
