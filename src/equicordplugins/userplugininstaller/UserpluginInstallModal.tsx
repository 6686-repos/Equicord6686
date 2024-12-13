import { classNameFactory } from "@api/Styles";
import ErrorBoundary from "@components/ErrorBoundary";
import { PluginCard } from "@components/PluginSettings";
import { ModalCloseButton, ModalContent, ModalHeader, ModalRoot, ModalSize, openModal, closeModal } from "@utils/modal";
import { Alerts, Button, Card, Parser, Text, Toasts } from "@webpack/common";
import { Native } from ".";

const cl = classNameFactory("vc-userplugininstaller-");

export function showInstallModal(meta: any, pluginPath: string) {
    console.log(meta);
    Alerts.show({
        title: <>
            <div className={cl("title")}>
                Review userplugin
            </div>
        </>,
        body: <>
            <div className={cl("body")}>
                <Text className={cl("subheader")}>
                    Plugin info
                </Text>
                <Card className={cl(["card", "lead-card"])}>
                    <Text>
                        <Text className={cl("name")}>{meta.name}</Text>
                        <Text className={cl("desc")}>{meta.description}</Text>
                    </Text>
                </Card>
                <Text className={cl("subheader")}>
                    Notes & warnings
                </Text>
                {
                    meta.usesPreSend && <Card className={cl(["card", "warning-card"])}>
                        <Text>
                            <Text className={cl("name")}>Has pre-send listeners</Text>
                            <Text className={cl("desc")}>This plugin is able to intercept and edit messages before sending them.</Text>
                        </Text>
                    </Card>
                }
                <Card className={cl(["card"])}>
                    <Text>
                        <Text className={cl("name")}>Refresh and enable required</Text>
                        <Text className={cl("desc")}>After the install is completed, Discord will be reloaded and you will need to enable the plugin yourself.</Text>
                    </Text>
                </Card>
                <Text style={{ color: "var(--text-danger) !important", margin: "3px 0" }}>Make sure that the plugin author is trustworthy before installing {meta.name}.</Text>
            </div>
        </>,
        cancelText: "Cancel install",
        confirmText: `Install plugin`,
        onCancel() {
            Native.deleteFolder(pluginPath);
        },
        onCloseCallback() {
            setTimeout(() => {
                Native.deleteFolder(pluginPath);
            }, 20000);
        },
        async onConfirm() {
            Toasts.pop();
            Toasts.show({
                message: "Rebuilding Vencord, please wait...",
                id: Toasts.genId(),
                type: Toasts.Type.MESSAGE
            });
            try {
                await Native.build(pluginPath);
                window.location.reload();
            }
            catch {
                Toasts.pop();
                return Toasts.show({
                    message: "Something bad has happened while building Vencord.",
                    id: Toasts.genId(),
                    type: Toasts.Type.FAILURE
                });
            }
        },
    });
}
