import { SelectUser } from "@/server/data/services/user";
import { DateTime } from "luxon";

export type SearchParam = string | string[] | undefined;

export function parseStringParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    return Array.isArray(param) ? param[0] : param;
}

export function parseIntParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    const parsed = parseInt(Array.isArray(param) ? param[0] : param);
    return isNaN(parsed) ? null : parsed;
}

export function getUserDayEnd(user: SelectUser, date: Date) {
    return DateTime.fromJSDate(date).setZone(user.timezone).endOf("day").toJSDate();
}
