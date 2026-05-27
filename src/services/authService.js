import { nanoid } from "nanoid";
import { getJSON, remove, setJSON } from "./storage";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const DEMO_EMAIL = "demo@saludia.app";

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function getCurrentUser() {
  return getJSON(CURRENT_USER_KEY, null);
}

export function register({ name, email, password, consent }) {
  if (!name || !email || !password) {
    return { ok: false, error: "Completa todos los campos." };
  }
  if (!consent) {
    return { ok: false, error: "Necesitamos tu consentimiento para continuar." };
  }

  const users = getJSON(USERS_KEY, []);
  const normalizedEmail = normalizeEmail(email);
  const exists = users.some((user) => user.email === normalizedEmail);
  if (exists) {
    return { ok: false, error: "Este correo ya esta registrado." };
  }

  const user = {
    id: nanoid(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    consent: true,
    createdAt: new Date().toISOString(),
  };

  setJSON(USERS_KEY, [user, ...users]);
  setJSON(CURRENT_USER_KEY, user);
  return { ok: true, user };
}

export function login({ email, password }) {
  if (!email || !password) {
    return { ok: false, error: "Ingresa tu correo y contrasena." };
  }

  const users = getJSON(USERS_KEY, []);
  const normalizedEmail = normalizeEmail(email);
  const user = users.find(
    (item) => item.email === normalizedEmail && item.password === password
  );
  if (!user) {
    return { ok: false, error: "Credenciales invalidas." };
  }

  setJSON(CURRENT_USER_KEY, user);
  return { ok: true, user };
}

export function logout() {
  remove(CURRENT_USER_KEY);
}

export function ensureDemoUser() {
  const users = getJSON(USERS_KEY, []);
  const existing = users.find((user) => user.email === DEMO_EMAIL);
  if (existing) return existing;

  const demoUser = {
    id: nanoid(),
    name: "Demo SaludIA",
    email: DEMO_EMAIL,
    password: "demo123",
    consent: true,
    createdAt: new Date().toISOString(),
  };

  setJSON(USERS_KEY, [demoUser, ...users]);
  return demoUser;
}

export function setCurrentUser(user) {
  setJSON(CURRENT_USER_KEY, user);
}

export function deleteAccount(userId) {
  const users = getJSON(USERS_KEY, []);
  const readings = getJSON("readings", []);
  const alerts = getJSON("alerts", []);
  const thresholds = getJSON("thresholds", []);

  setJSON(
    USERS_KEY,
    users.filter((user) => user.id !== userId)
  );
  setJSON(
    "readings",
    readings.filter((reading) => reading.userId !== userId)
  );
  setJSON(
    "alerts",
    alerts.filter((alert) => alert.userId !== userId)
  );
  setJSON(
    "thresholds",
    thresholds.filter((item) => item.userId !== userId)
  );
  remove(CURRENT_USER_KEY);
}
