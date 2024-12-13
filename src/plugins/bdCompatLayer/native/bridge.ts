/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as fs_ from "node:fs";
import * as path_ from "node:path";
const fs = {
    readFileSync: (...args: Parameters<typeof fs_.readFileSync>) => {
        return fs_.readFileSync.call(null, ...args);
    },
};
export function getUserHome() {
    return process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"];
}
const path = {
    join: (...args) => {
        return path_.join(...args);
    },
    dirname: (...args: Parameters<typeof path_.dirname>) => {
        return path_.dirname(...args);
    },
};
export {
    fs,
    path,
};
