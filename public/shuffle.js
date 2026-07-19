'use strict';

// SEC-1/SEC-2: CSPRNG + rejection sampling — Math.random yasak, modulo-bias yok.
function randomInt(n) {
  const max = 256 - (256 % n);
  const buf = new Uint8Array(1);
  let v;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= max);
  return v % n;
}

// Fisher-Yates: yerinde, tarafsız karıştırma.
function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

// FR-1/FR-4: n çöp, tam 1 tanesi kısa; her çağrı yeni/bağımsız dizi döner.
function createDraw(n) {
  const straws = [];
  for (let i = 0; i < n; i++) {
    straws.push({ index: i, isShort: false, revealed: false });
  }
  const shortIdx = randomInt(n);
  straws[shortIdx].isShort = true;
  fisherYatesShuffle(straws);
  straws.forEach((s, i) => { s.index = i; });
  return straws;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { randomInt, fisherYatesShuffle, createDraw };
}
