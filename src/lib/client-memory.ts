/**
 * O que o aparelho do cliente lembra, no lugar de uma conta: nome e e-mail (para preencher o formulário)
 * e o código secreto de cada barbearia (para abrir "Meus agendamentos"). Fica só neste navegador.
 * Pode estar bloqueado (aba anônima, navegador interno): então tudo falha em silêncio e o site funciona igual.
 */
const PROFILE = "probarber:perfil";
const tokenKey = (slug: string) => `probarber:codigo:${slug}`;

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* sem armazenamento: o cliente só não terá o preenchimento automático */
  }
};

export type Profile = { name: string; email: string };

export function loadProfile(): Profile | null {
  try {
    const parsed = JSON.parse(read(PROFILE) ?? "null") as Partial<Profile> | null;
    return parsed && typeof parsed.name === "string" && typeof parsed.email === "string"
      ? { name: parsed.name, email: parsed.email }
      : null;
  } catch {
    return null;
  }
}

export const saveProfile = (profile: Profile) => write(PROFILE, JSON.stringify(profile));

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isToken = (value: unknown): value is string => typeof value === "string" && UUID.test(value);

export function loadToken(slug: string) {
  const value = read(tokenKey(slug));
  return isToken(value) ? value : null;
}

export const saveToken = (slug: string, token: string) => write(tokenKey(slug), token);
