export const validateSlug = (slug, length = 6) => (typeof slug === 'string') && (slug.length >= length) && /^[a-z][a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export function checkRequired(required, obj) {
  const keys = Object.keys(obj);
  for (let key of Object.keys(required)) {
    if (!keys.includes(key)) throw new Error(`required field '${key}' missing`);
    if (!typeof obj[key] === required[key]) throw new Error(`required field '${key}' should be of type '${required[key]}'`);
  }
}

export function checkValid(valid, obj) {
  const keys = Object.keys(valid);
  for (let key of Object.keys(obj)) {
    if (!keys.includes(key)) throw new Error(`field '${key}' is not expected`);
    if (!typeof obj[key] === valid[key]) throw new Error(`field '${key}' should be of type '${valid[key]}'`);
  }
}
