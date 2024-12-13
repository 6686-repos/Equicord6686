import { Alerts, Button, ChannelStore, Toasts } from "@webpack/common";
import { Message } from "discord-types/general";
import { CLONE_LINK_REGEX, clonePlugin, Native, plugins } from ".";

const WHITELISTED_SHARE_CHANNELS = ["1256395889354997771", "1032200195582197831", "1301947896601509900"];

export default function UserpluginInstallButton({ props }: any) {
    const message: Message = props.message;
    if (!WHITELISTED_SHARE_CHANNELS.includes(ChannelStore.getChannel(message.channel_id).parent_id) && !WHITELISTED_SHARE_CHANNELS.includes(message.channel_id))
        return;
    const gitLink = (props.message.content as string).match(CLONE_LINK_REGEX);
    if (!gitLink) return;
    const installed = plugins.includes(gitLink[1]);
    return <>
        <div style={{ display: "flex" }}>
            <Button style={{
                marginTop: "5px"
            }}
                onClick={() => clonePlugin(gitLink)}>
                {installed ? "Reinstall" : "Install"} plugin
            </Button>
            {
                installed && <Button style={{
                    marginTop: "5px",
                    marginLeft: "10px"
                }}
                    color={Button.Colors.RED}
                    onClick={() => {
                        Alerts.show({
                            title: "Uninstall plugin",
                            body: `Are you sure that you want to uninstall ${gitLink[1]}?`,
                            cancelText: "Cancel",
                            confirmColor: Button.Colors.RED,
                            confirmText: "Uninstall",
                            async onConfirm() {
                                Toasts.show({
                                    id: Toasts.genId(),
                                    message: `Uninstalling ${gitLink[1]}...`,
                                    type: Toasts.Type.MESSAGE
                                });
                                try {
                                    await Native.deleteFolder(`${VesktopNative.fileManager.getVencordDir().replace("\\", "/")}/../src/userplugins/${gitLink[1]}`);
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
                            },
                        });
                    }}>
                    Uninstall plugin
                </Button>
            }
        </div>
    </>;
}
