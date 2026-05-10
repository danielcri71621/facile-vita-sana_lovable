import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, RefreshCw, Bell, AlarmClock, Smartphone } from "lucide-react";
import {
  ensureMedicationNotificationChannel,
  ensureMedicationNotificationPermissions,
  MEDICATION_NOTIFICATION_CHANNEL_ID,
} from "@/lib/medicationNotifications";
import { toast } from "@/hooks/use-toast";

type Status = "granted" | "denied" | "prompt" | "unknown";

interface DiagState {
  isNative: boolean;
  platform: string;
  notifications: Status;
  exactAlarm: Status;
  channelOk: boolean;
  loading: boolean;
}

const StatusIcon = ({ status }: { status: Status | boolean }) => {
  const ok = status === "granted" || status === true;
  const bad = status === "denied" || status === false;
  if (ok) return <CheckCircle2 className="h-6 w-6 text-success" />;
  if (bad) return <XCircle className="h-6 w-6 text-destructive" />;
  return <AlertCircle className="h-6 w-6 text-warning" />;
};

const DiagnosticaNotifiche = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<DiagState>({
    isNative: false,
    platform: "web",
    notifications: "unknown",
    exactAlarm: "unknown",
    channelOk: false,
    loading: true,
  });

  const runCheck = async (requestExact = false) => {
    setState((s) => ({ ...s, loading: true }));
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();

    if (!isNative) {
      setState({
        isNative: false,
        platform,
        notifications: "unknown",
        exactAlarm: "unknown",
        channelOk: false,
        loading: false,
      });
      return;
    }

    const perms = await ensureMedicationNotificationPermissions(requestExact);
    let channelOk = false;
    try {
      await ensureMedicationNotificationChannel();
      const { channels } = await LocalNotifications.listChannels();
      channelOk = channels.some((c) => c.id === MEDICATION_NOTIFICATION_CHANNEL_ID);
    } catch (e) {
      console.warn(e);
    }

    setState({
      isNative,
      platform,
      notifications: (perms.display as Status) ?? "unknown",
      exactAlarm: (perms.exactAlarm as Status) ?? (platform === "android" ? "unknown" : "granted"),
      channelOk,
      loading: false,
    });
  };

  useEffect(() => {
    runCheck(false);
  }, []);

  const requestNotifications = async () => {
    try {
      const res = await LocalNotifications.requestPermissions();
      toast({
        title: res.display === "granted" ? t("notifications.permissionGranted") : t("notifications.permissionDenied"),
      });
      await runCheck(false);
    } catch (e) {
      console.error(e);
    }
  };

  const requestExactAlarm = async () => {
    await runCheck(true);
  };

  const sendTest = async () => {
    try {
      await ensureMedicationNotificationChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999999,
            title: t("diagnostics.testTitle"),
            body: t("diagnostics.testBody"),
            schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
            channelId: MEDICATION_NOTIFICATION_CHANNEL_ID,
            sound: "default",
          },
        ],
      });
      toast({ title: t("diagnostics.testScheduled"), description: t("diagnostics.testScheduledDesc") });
    } catch (e: any) {
      toast({ title: t("notifications.permissionError"), description: String(e?.message ?? e), variant: "destructive" });
    }
  };

  const allOk = state.isNative && state.notifications === "granted" && state.exactAlarm === "granted" && state.channelOk;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/medicinali" className="inline-flex items-center gap-2 text-primary mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              {t("diagnostics.title")}
            </CardTitle>
            <CardDescription>{t("diagnostics.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!state.isNative && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-sm">
                {t("diagnostics.webWarning")}
              </div>
            )}

            {allOk && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                {t("diagnostics.allOk")}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{t("diagnostics.platform")}</div>
                    <div className="text-sm text-muted-foreground">{state.platform}</div>
                  </div>
                </div>
                <StatusIcon status={state.isNative} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{t("diagnostics.notifPerm")}</div>
                    <div className="text-sm text-muted-foreground">{state.notifications}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={state.notifications} />
                  {state.notifications !== "granted" && state.isNative && (
                    <Button size="sm" onClick={requestNotifications}>{t("diagnostics.fix")}</Button>
                  )}
                </div>
              </div>

              {state.platform === "android" && (
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <AlarmClock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{t("diagnostics.exactAlarm")}</div>
                      <div className="text-sm text-muted-foreground">{state.exactAlarm}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={state.exactAlarm} />
                    {state.exactAlarm !== "granted" && (
                      <Button size="sm" onClick={requestExactAlarm}>{t("diagnostics.fix")}</Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{t("diagnostics.channel")}</div>
                    <div className="text-sm text-muted-foreground">{MEDICATION_NOTIFICATION_CHANNEL_ID}</div>
                  </div>
                </div>
                <StatusIcon status={state.channelOk} />
              </div>
            </div>

            {(state.notifications !== "granted" || state.exactAlarm !== "granted") && state.isNative && (
              <div className="p-4 rounded-lg bg-muted text-sm space-y-2">
                <div className="font-semibold">{t("diagnostics.howToFix")}</div>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>{t("diagnostics.tipNotif")}</li>
                  <li>{t("diagnostics.tipExact")}</li>
                  <li>{t("diagnostics.tipBattery")}</li>
                  <li>{t("diagnostics.tipForceStop")}</li>
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => runCheck(false)} variant="outline" disabled={state.loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? "animate-spin" : ""}`} />
                {t("diagnostics.recheck")}
              </Button>
              <Button onClick={sendTest} disabled={!state.isNative || state.notifications !== "granted"}>
                {t("diagnostics.sendTest")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticaNotifiche;
