import type { Language } from "../../lib/language";
import { en } from "./en";
import { es } from "./es";
import type { Messages } from "./types";

export const messages: Record<Language, Messages> = { es, en };
