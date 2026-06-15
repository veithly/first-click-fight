import { customAlphabet } from "nanoid";

// Unambiguous alphabet (no 0/O/1/l/I) for readable share links.
const nano = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 8);

export const newFightId = (): string => `f_${nano()}`;
export const newCardSlug = (): string => `c_${nano()}`;
export const newClickId = (): string => `ck_${nano()}`;
export const newEventId = (): string => `ev_${nano()}`;
export const newSessionId = (): string => `s_${nano()}${nano()}`;
