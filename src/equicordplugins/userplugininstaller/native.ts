import { exec, spawn } from "child_process";
import { IpcMainInvokeEvent } from "electron";
import { read, readdir, readdirSync, readFileSync, rmSync } from "fs";

const PLUGIN_META_REGEX = /export default definePlugin\((?:\s|\/(?:\/|\*).*)*{\s*(?:\s|\/(?:\/|\*).*)*name:\s*(?:"|'|`)(.*)(?:"|'|`)(?:\s|\/(?:\/|\*).*)*,(?:\s|\/(?:\/|\*).*)*(?:\s|\/(?:\/|\*).*)*description:\s*(?:"|'|`)(.*)(?:"|'|`)(?:\s|\/(?:\/|\*).*)*/;

export async function cloneRepo(_: IpcMainInvokeEvent, repo: string, clonePath: string): Promise<any> {
    rmSync(clonePath, { recursive: true, force: true });
    return new Promise((resolve, reject) => {
        exec(`git clone ${repo} ${clonePath}`, (error, stdout, stderr) => {
            if (error) {
                return reject(
                    stderr
                );
            }
            resolve(null);
        });
    });
}

export async function getPluginMeta(_, path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const files = readdirSync(path);
        let fileToRead: "index.ts" | "index.tsx" | "index.js" | "index.jsx" | undefined;
        files.forEach(f => {
            if (f === "index.ts") fileToRead = "index.ts";
            if (f === "index.tsx") fileToRead = "index.tsx";
            if (f === "index.js") fileToRead = "index.js";
            if (f === "index.jsx") fileToRead = "index.jsx";
        });
        if (!fileToRead) reject();

        const file = readFileSync(`${path}/${fileToRead}`, "utf8");
        const rawMeta = file.match(PLUGIN_META_REGEX);
        resolve({
            name: rawMeta![1],
            description: rawMeta![2],
            usesPreSend: file.includes("PreSendListener")
        });
    });
}

export function deleteFolder(_, path: string) {
    if(path.match(/\.\./g).length > 1) return;
    rmSync(path, { recursive: true, force: true });
}

export async function build(_: IpcMainInvokeEvent, path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        exec(`pnpm build`, {
            cwd: path
        }, (error, stdout, stderr) => {
            if (error) {
                return reject(
                    stderr
                );
            }
            resolve(null);
        });
    });
}

export async function getPlugins(_, path: string): Promise<string[]> {
    return new Promise((resolve) => {
        return resolve(readdirSync(path));
    });
}
