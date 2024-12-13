import { Notices } from "@api/index";
import { addAccessory, removeAccessory } from "@api/MessageAccessories";
import { Devs } from "@utils/constants";
import definePlugin, { PluginNative } from "@utils/types";
import { Alerts, Button, ChannelStore, Forms, TextInput, Toasts, Text } from "@webpack/common";
import { Message } from "discord-types/general";
import { clone } from "lodash";
import UserpluginInstallButton from "./UserpluginInstallButton";
import { showInstallModal } from "./UserpluginInstallModal";

import "./style.css";

export let plugins: any[] = [];
export const CLONE_LINK_REGEX = /https:\/\/(?:git(?:hub|lab)\.com|git\.(?:[a-zA-Z0-9]|\.)+|codeberg\.org)\/(?!user-attachments)(?:[a-zA-Z0-9]|-)+\/((?:[a-zA-Z0-9]|-)+)(?:\.git)?(?:\/)?/;

// @ts-ignore
export const Native = VencordNative.pluginHelpers.UserpluginInstaller as PluginNative<typeof import("./native")>;

export async function clonePlugin(gitLink: RegExpMatchArray) {
    Toasts.show({
        message: "Cloning plugin...",
        id: Toasts.genId(),
        type: Toasts.Type.MESSAGE
    });
    try {
        const path = `${VesktopNative.fileManager.getVencordDir().replace("\\", "/")}/../src/userplugins/${gitLink[1]}`;
        await Native.cloneRepo(gitLink[0], path);
        const meta = await Native.getPluginMeta(path);
        console.log(meta);
        showInstallModal(meta, path);
    }
    catch (e) {
        Toasts.pop();
        return Toasts.show({
            message: "Something bad has happened while cloning the plugin, try again later and make sure that the plugin link is valid.",
            id: Toasts.genId(),
            type: Toasts.Type.FAILURE
        });
    }
}

export default definePlugin({
    name: "UserpluginInstaller",
    description: "Install userplugins with a simple button click",
    authors: [Devs.nin0dev],
    async start() {
        plugins = await Native.getPlugins(`${VesktopNative.fileManager.getVencordDir().replace("\\", "/")}/../src/userplugins/`);
        console.log(plugins);
        addAccessory("userpluginInstallButton", (props: Record<string, any>) => (
            <UserpluginInstallButton props={props} />
        ), 4);
    },
    stop() {
        removeAccessory("userpluginInstallButton");
    },
    toolboxActions: {
        "Install Plugin": () => {
            let gitUrl = "";
            Alerts.show({
                title: "Install plugin",
                body: <>
                    <TextInput onChange={v => { gitUrl = v; }} placeholder="Git link (https://github.com/...)" />
                </>,
                confirmText: "Install",
                onConfirm() {
                    const fullGitLink = gitUrl.match(CLONE_LINK_REGEX);
                    if (!fullGitLink) return;
                    clonePlugin(fullGitLink);
                }
            });
        },
        "Uninstall Plugin": () => {
            let name = "";
            Alerts.show({
                title: "Uninstall plugin",
                body: <>
                    <Text>Out of these plugins, which would you like to uninstall?</Text>
                    {
                        plugins.map((item, i) =>
                            <Text style={{ fontWeight: "bold" }}>{item}</Text>
                        )
                    }
                    <TextInput onChange={v => { name = v; }} style={{ marginTop: "10px" }} placeholder="Plugin name as written above" />
                </>,
                confirmText: "Uninstall",
                confirmColor: Button.Colors.RED,
                async onConfirm() {
                    if (!plugins.includes(name)) return;
                    Toasts.show({
                        id: Toasts.genId(),
                        message: `Uninstalling ${name}...`,
                        type: Toasts.Type.MESSAGE
                    });
                    try {
                        await Native.deleteFolder(`${VesktopNative.fileManager.getVencordDir().replace("\\", "/")}/../src/userplugins/${name}`);
                        await Native.build(VesktopNative.fileManager.getVencordDir().replace("\\", "/"));
                        window.location.reload();
                    }
                    catch {
                        Toasts.pop();
                        return Toasts.show({
                            message: "Something bad has happened while deleting the plugin.",
                            id: Toasts.genId(),
                            type: Toasts.Type.FAILURE
                        });
                    }
                }
            });
        }
    }
});
