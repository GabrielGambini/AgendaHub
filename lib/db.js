const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.json');
const REDIS_KEY = 'agendahub:db';

function defaultDb() {
  return {
    adminPassHash: null,
    adminToken: null,
    services: [],
    apts: [],
    clients: [],
    settings: {
      businessName: 'AgendaHub',
      openingHour: '08:00',
      closingHour: '18:00',
      workingDays: [1, 2, 3, 4, 5, 6],
      blockedDates: []
    }
  };
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

function useRedis() {
  return !!getRedisConfig();
}

let redisClient = null;

function getRedis() {
  if (!redisClient && useRedis()) {
    const { Redis } = require('@upstash/redis');
    redisClient = new Redis(getRedisConfig());
  }
  return redisClient;
}

async function loadDb() {
  if (useRedis()) {
    const data = await getRedis().get(REDIS_KEY);
    if (!data) return defaultDb();
    return { ...defaultDb(), ...data };
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return { ...defaultDb(), ...JSON.parse(raw) };
  } catch {
    return defaultDb();
  }
}

async function saveDb(data) {
  if (useRedis()) {
    await getRedis().set(REDIS_KEY, data);
    return;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { loadDb, saveDb, defaultDb, useRedis };
