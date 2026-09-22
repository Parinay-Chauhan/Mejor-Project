import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "data");
const usersFile = path.join(dataDir, "users.json");
const sessionCookieName = "mejor_session";
const saltRounds = 10;

function getJwtSecret() {
    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
    if (!secret) {
        throw new Error("Missing JWT_SECRET or SESSION_SECRET environment variable");
    }
    return secret;
}

async function ensureUsersFile() {
    await fs.mkdir(dataDir, { recursive: true });
    try {
        await fs.access(usersFile);
    } catch {
        await fs.writeFile(usersFile, "[]", "utf8");
    }
}

async function readUsers() {
    await ensureUsersFile();
    const content = await fs.readFile(usersFile, "utf8");
    return JSON.parse(content || "[]");
}

async function writeUsers(users) {
    await ensureUsersFile();
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}

function normalizeUsername(username) {
    return String(username || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

async function hashPassword(password) {
    return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, storedHash) {
    if (!storedHash) {
        return false;
    }

    if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$")) {
        return bcrypt.compare(password, storedHash);
    }

    return verifyLegacyScryptPassword(password, storedHash);
}

function verifyLegacyScryptPassword(password, storedHash) {
    const [salt] = storedHash.split(":");
    if (!salt) {
        return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (error, derivedKey) => {
            if (error) {
                reject(error);
                return;
            }

            const passwordHash = `${salt}:${derivedKey.toString("hex")}`;
            resolve(
                crypto.timingSafeEqual(
                    Buffer.from(passwordHash),
                    Buffer.from(storedHash)
                )
            );
        });
    });
}

function isBcryptHash(passwordHash) {
    return passwordHash?.startsWith("$2a$") || passwordHash?.startsWith("$2b$");
}

function createSessionToken(userId) {
    return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
}

function getSessionUserId(req) {
    let token = req.cookies?.[sessionCookieName];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.substring(7);
    }

    if (!token) {
        return null;
    }

    try {
        const payload = jwt.verify(token, getJwtSecret());
        return payload.userId;
    } catch {
        return null;
    }
}

function setSessionCookie(res, userId) {
    res.cookie(sessionCookieName, createSessionToken(userId), {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

function clearSessionCookie(res) {
    res.clearCookie(sessionCookieName);
}

async function findUserByUsername(username) {
    const userId = normalizeUsername(username);
    if (!userId) {
        return null;
    }
    const users = await readUsers();
    return users.find((user) => user.id === userId) || null;
}

async function loginOrCreateUser(username, password) {
    const userId = normalizeUsername(username);
    if (!userId || !password) {
        throw new Error("Username and password are required");
    }

    const users = await readUsers();
    const existingUser = users.find((user) => user.id === userId);

    if (existingUser) {
        const isValidPassword = await verifyPassword(
            password,
            existingUser.passwordHash
        );
        if (!isValidPassword) {
            throw new Error("Invalid username or password");
        }

        if (!isBcryptHash(existingUser.passwordHash)) {
            existingUser.passwordHash = await hashPassword(password);
            await writeUsers(users);
        }

        return existingUser;
    }

    const newUser = {
        id: userId,
        username: username.trim(),
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);
    return newUser;
}

async function attachUser(req, res, next) {
    const userId = getSessionUserId(req);
    if (!userId) {
        next();
        return;
    }

    req.user = await findUserByUsername(userId);
    next();
}

function requirePageAuth(req, res, next) {
    if (!req.user) {
        res.redirect("/login");
        return;
    }
    next();
}

function requireApiAuth(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: "Login required" });
        return;
    }
    next();
}

export {
    attachUser,
    clearSessionCookie,
    loginOrCreateUser,
    requireApiAuth,
    requirePageAuth,
    setSessionCookie,
    createSessionToken,
};
