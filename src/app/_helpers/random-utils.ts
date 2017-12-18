import { Workflow } from '../_models';

const _letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const _digits = '0123456789';
const _alphanumeric = _letters + _digits;
const _workflows: Workflow[] = [{
    id: 1,
    name: 'Publish',
    icon: 'car'
  },
  {
    id: 2,
    name: 'Process',
    icon: 'plane'
  },
  {
    id: 3,
    name: 'Transform',
    icon: 'bicycle'
  },
  {
    id: 4,
    name: 'Harvest',
    icon: 'truck'
  }
];

function randomValue(str) {
  return str[randomNumber(0, str.length - 1)];
}

function randomChar() {
  return randomValue(_letters);
}

function randomDigit() {
  return randomValue(_digits);
}

function randomAlphaNumeric() {
  return randomValue(_alphanumeric);
}

export function randomNumber(min, max) {
  return Math.floor((Math.random() * (max + 1)) + min);
}

function randomString(n, fn) {
  let s = '';
  while (n--) { s += fn(); }
  return s;
}

function randomCharString(n: number) {
  return randomString(n, randomChar);
}

function randomDigitString(n: number) {
  return randomString(n, randomDigit);
}

function randomAlphaNumericString(n: number) {
  return randomString(n, randomAlphaNumeric);
}

export function randomOrganizationId() {
  return randomCharString(3).toUpperCase() + '-' + randomDigitString(randomNumber(3, 6));
}

export function randomDatasetName() {
  return randomAlphaNumericString(randomNumber(4, 6)) + randomDigitString(randomNumber(3, 5)) + randomCharString(randomNumber(2, 4));
}

export function randomWorkflow(): Workflow {
  return randomValue(_workflows);
}

export function randomDate(d1: Date, d2: Date) {
  const dt1 = d1.getTime();
  const dt2 = d2.getTime();
  return new Date(dt1 + Math.random() * (dt2 - dt1));
}

export function randomDateRange(d1: Date, d2: Date) {
  const dd1 = randomDate(d1, d2);
  const dd2 = randomDate(d1, d2);
  return dd1 < dd2 ? [dd1, dd2] : [dd2, dd1];
}

