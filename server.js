const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { loadDb, saveDb } = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'src', 'public');
const ADMIN_DIR = path.join(__dirname, 'src', 'admin');
const CLIENT_DIR = path.join(__dirname, 'src', 'client');
const ASSETS_DIR = path.join(__dirname, 'src', 'assets');

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(ASSETS_DIR));
app.use('/admin', express.static(ADMIN_DIR));
app.use('/client', express.static(CLIENT_DIR));
app.use(express.static(PUBLIC_DIR));

function hashString(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function isDateBlocked(settings, dateStr) {
  return (settings.blockedDates || []).some(item => item.date === dateStr);
}

function isWorkingDay(settings, dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return (settings.workingDays || [1, 2, 3, 4, 5, 6]).includes(day);
}

function isTimeInRange(settings, time) {
  const toMinutes = (value) => {
    const [hh, mm] = value.split(':').map(Number);
    return hh * 60 + mm;
  };
  const mins = toMinutes(time);
  const opening = toMinutes(settings.openingHour || '08:00');
  const closing = toMinutes(settings.closingHour || '18:00');
  return mins >= opening && mins <= closing;
}

async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    const db = await loadDb();
    if (!token || token !== db.adminToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
}

app.get('/api/auth/status', async (req, res) => {
  try {
    const db = await loadDb();
    res.json({ hasAccount: !!db.adminPassHash });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const db = await loadDb();
    if (db.adminPassHash) {
      return res.status(400).json({ error: 'Admin account already exists' });
    }
    const { password } = req.body;
    if (!password || password.trim().length < 4) {
      return res.status(400).json({ error: 'Password must have at least 4 characters' });
    }
    db.adminPassHash = hashString(password.trim());
    db.adminToken = crypto.randomBytes(32).toString('hex');
    await saveDb(db);
    res.json({ token: db.adminToken });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const db = await loadDb();
    const { password } = req.body;
    if (!db.adminPassHash) {
      return res.status(400).json({ error: 'No admin account configured' });
    }
    if (!password || hashString(password.trim()) !== db.adminPassHash) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    db.adminToken = crypto.randomBytes(32).toString('hex');
    await saveDb(db);
    res.json({ token: db.adminToken });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(ADMIN_DIR, 'index.html'));
});

app.get('/client', (req, res) => {
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

app.get('/api/public/state', async (req, res) => {
  try {
    const db = await loadDb();
    res.json({
      settings: db.settings,
      services: db.services,
      apts: db.apts.map(({ id, date, time, status }) => ({ id, date, time, status }))
    });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/public/book', async (req, res) => {
  try {
    const { name, phone, serviceIds, date, time } = req.body;
    if (!name || !phone || !Array.isArray(serviceIds) || !serviceIds.length || !date || !time) {
      return res.status(400).json({ error: 'Dados de agendamento incompletos' });
    }

    const db = await loadDb();

    if (isDateBlocked(db.settings, date)) {
      return res.status(400).json({ error: 'Esta data está bloqueada para agendamentos' });
    }
    if (!isWorkingDay(db.settings, date)) {
      return res.status(400).json({ error: 'Este dia não está disponível para agendamentos' });
    }
    if (!isTimeInRange(db.settings, time)) {
      return res.status(400).json({ error: 'Horário fora do expediente' });
    }
    if (db.apts.some(a => a.date === date && a.time === time && a.status !== 'Cancelado')) {
      return res.status(400).json({ error: 'Este horário já está ocupado' });
    }

    const selectedServices = db.services.filter(s => serviceIds.includes(s.id));
    if (!selectedServices.length) {
      return res.status(400).json({ error: 'Serviços inválidos' });
    }

    let client = db.clients.find(c => c.phone === phone.trim());
    if (!client) {
      client = { id: Date.now().toString(), name: name.trim(), phone: phone.trim() };
      db.clients.push(client);
    } else {
      client.name = name.trim();
    }

    const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
    const serviceNames = selectedServices.map(s => s.name).join(', ');
    const appointment = {
      id: Date.now().toString(),
      clientId: client.id,
      client: client.name,
      service: serviceNames,
      serviceIds,
      price: totalPrice,
      date,
      time,
      obs: 'Via link público',
      status: 'Pendente',
      source: 'public'
    };
    db.apts.push(appointment);
    await saveDb(db);
    res.json({ appointment });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.get('/api/admin/state', authMiddleware, async (req, res) => {
  try {
    const db = await loadDb();
    res.json({
      settings: db.settings,
      services: db.services,
      apts: db.apts,
      clients: db.clients
    });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/admin/data', authMiddleware, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!['settings', 'services', 'apts', 'clients'].includes(key)) {
      return res.status(400).json({ error: 'Chave inválida' });
    }
    const db = await loadDb();
    db[key] = value;
    await saveDb(db);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
      console.log('Persistência: Upstash Redis');
    } else {
      console.log('Persistência: data.json (local)');
    }
  });
}
