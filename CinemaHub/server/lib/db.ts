import fs from 'fs/promises'
import path from 'path'

const USERS_PATH = path.resolve('./public/users-data.json')
const REFRESH_PATH = path.resolve('./server/db.json')

export async function readUsers() {
  try {
    const raw = await fs.readFile(USERS_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

export async function writeUsers(users: any[]) {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8')
}

export async function readRefreshTokens(): Promise<string[]> {
  try {
    const raw = await fs.readFile(REFRESH_PATH, 'utf-8')
    const json = JSON.parse(raw)
    return json.refreshTokens || []
  } catch (e) {
    return []
  }
}

export async function writeRefreshTokens(tokens: string[]) {
  const obj = { refreshTokens: tokens }
  await fs.writeFile(REFRESH_PATH, JSON.stringify(obj, null, 2), 'utf-8')
}

export async function addRefreshToken(token: string) {
  const tokens = await readRefreshTokens()
  tokens.push(token)
  await writeRefreshTokens(tokens)
}

export async function removeRefreshToken(token: string) {
  let tokens = await readRefreshTokens()
  tokens = tokens.filter(t => t !== token)
  await writeRefreshTokens(tokens)
}
