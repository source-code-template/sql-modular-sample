import { Request } from "express"
import { query } from "express-ext"
import { StringMap } from "onecore"
import { en as commonEN } from "./en"
import { vi as commonVI } from "./vi"

export interface Resources {
  [key: string]: StringMap
}

const en: StringMap = {
  ...commonEN,
}
const vi: StringMap = {
  ...commonVI,
}

export const resources: Resources = {
  en: en,
  vi: vi,
}

export function getResource(lang: string | Request): StringMap {
  if (lang) {
    if (typeof lang === "string") {
      const r = resources[lang]
      if (r) {
        return r
      }
    } else {
      const l = query(lang, "lang")
      if (l) {
        const r = resources[l]
        if (r) {
          return r
        }
      }
    }
  }
  return resources["en"]
}
