import type { Language } from "../../lib/language.ts";
import { en } from "./en.ts";
import { es } from "./es.ts";
import type { Messages } from "./types.ts";

export const messages: Record<Language, Messages> = { es, en };
