/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
const gl_require = createRequire(realpathSync("."));
export function bdCompatLayerUniqueId() { }
// export function getBridge() {
//     return bridge;
// }
export function unsafe_req() {
    return gl_require;
}
export function getUserHome() {
    return process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"];
}
