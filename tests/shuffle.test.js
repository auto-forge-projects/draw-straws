'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomInt, fisherYatesShuffle, createDraw } = require('../public/shuffle.js');

test('randomInt(n) daima [0, n) aralığında tam sayı döner (SEC-1/SEC-2)', () => {
  for (let i = 0; i < 2000; i++) {
    const v = randomInt(7);
    assert.ok(Number.isInteger(v), `tam sayı değil: ${v}`);
    assert.ok(v >= 0 && v < 7, `aralık dışı: ${v}`);
  }
});

test('randomInt(n) rejection sampling ile modulo-bias göstermez — büyük örneklemde düzgün dağılır', () => {
  const N = 5;
  const SAMPLE = 50000;
  const counts = new Array(N).fill(0);
  for (let i = 0; i < SAMPLE; i++) counts[randomInt(N)] += 1;
  for (let i = 0; i < N; i++) {
    const pct = (counts[i] / SAMPLE) * 100;
    assert.ok(pct >= 18 && pct <= 22, `pozisyon ${i} beklenen ~%20 aralığı dışında: %${pct.toFixed(2)}`);
  }
});

test('fisherYatesShuffle(arr) girdiyi mutasyona uğratır ve tüm elemanları korur', () => {
  const arr = [1, 2, 3, 4, 5];
  const before = arr.slice();
  fisherYatesShuffle(arr);
  assert.equal(arr.length, before.length);
  assert.deepEqual(arr.slice().sort(), before.slice().sort());
});

test('createDraw(n) tam olarak n çöp üretir, tam 1 tanesi kısa (FR-1, FR-4)', () => {
  for (const n of [2, 5, 20]) {
    const straws = createDraw(n);
    assert.equal(straws.length, n);
    const shortCount = straws.filter((s) => s.isShort).length;
    assert.equal(shortCount, 1, `n=${n} için kısa çöp sayısı 1 değil: ${shortCount}`);
    straws.forEach((s) => assert.equal(s.revealed, false));
  }
});

test('createDraw: büyük örneklemde her pozisyon ~1/N sıklıkla kısa çöpü alır ±%2 (FR-2/KPI-2)', () => {
  // Küçük örneklem istatistiksel olarak flaky olur (bkz. sibling proje DL-09-001 dersi);
  // aynı ±%2 gereksinimini deterministik doğrulamak için örneklem büyütüldü (gevşetme değil).
  const N = 5;
  const SAMPLE = 20000;
  const counts = new Array(N).fill(0);
  for (let i = 0; i < SAMPLE; i++) {
    const straws = createDraw(N);
    const shortIdx = straws.findIndex((s) => s.isShort);
    counts[shortIdx] += 1;
  }
  for (let i = 0; i < N; i++) {
    const pct = (counts[i] / SAMPLE) * 100;
    assert.ok(pct >= 18 && pct <= 22, `pozisyon ${i} beklenen %20±%2 dışında: %${pct.toFixed(2)}`);
  }
});

test('createDraw(n) her çağrıda bağımsız/yeni bir dizi döner (Yeniden Çek — FR-4)', () => {
  const a = createDraw(5);
  const b = createDraw(5);
  assert.notEqual(a, b);
});
