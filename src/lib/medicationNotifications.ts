import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

interface MedicationReminder {
  id: number;
  nomeMedicinale: string;
  data: string;
  orario: string;
}

interface MedicationStatus {
  stato: "preso" | "non preso" | "in attesa";
}

interface MedicationNotificationPermissions {
  display: string;
  exactAlarm?: string;
}

const MAX_ANDROID_NOTIFICATION_ID = 2_147_483_647;
export const MEDICATION_NOTIFICATION_CHANNEL_ID = "medicine_reminders";

export const getMedicationNotificationId = (id: number) => {
  const normalized = Math.abs(Math.trunc(Number(id))) % MAX_ANDROID_NOTIFICATION_ID;
  return normalized === 0 ? MAX_ANDROID_NOTIFICATION_ID : normalized;
};

const getReminderDate = (reminder: MedicationReminder) => {
  const [year, month, day] = reminder.data.split("-").map(Number);
  const [hours, minutes] = reminder.orario.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

export const ensureMedicationNotificationChannel = async () => {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.createChannel({
    id: MEDICATION_NOTIFICATION_CHANNEL_ID,
    name: "Promemoria medicinali",
    description: "Avvisi per l'orario di assunzione dei medicinali",
    importance: 5,
    visibility: 1,
    vibration: true,
    lights: true,
    lightColor: "#22c55e",
  });
};

export const ensureMedicationNotificationPermissions = async (
  openExactAlarmSettings = false,
): Promise<MedicationNotificationPermissions> => {
  if (!Capacitor.isNativePlatform()) {
    return { display: "granted" };
  }

  let display = (await LocalNotifications.checkPermissions()).display;

  if (display !== "granted") {
    display = (await LocalNotifications.requestPermissions()).display;
  }

  let exactAlarm: string | undefined;

  if (Capacitor.getPlatform() === "android") {
    try {
      exactAlarm = (await LocalNotifications.checkExactNotificationSetting()).exact_alarm;

      if (exactAlarm !== "granted" && openExactAlarmSettings) {
        exactAlarm = (await LocalNotifications.changeExactNotificationSetting()).exact_alarm;
      }
    } catch (error) {
      console.warn("Impossibile verificare il permesso allarmi esatti:", error);
    }
  }

  return { display, exactAlarm };
};

export const cancelMedicationNotifications = async (ids: number[]) => {
  if (!Capacitor.isNativePlatform() || ids.length === 0) return;

  await LocalNotifications.cancel({
    notifications: ids.map((id) => ({ id: getMedicationNotificationId(id) })),
  });
};

export const scheduleMedicationNotifications = async (
  reminders: MedicationReminder[],
  statuses: Record<number, MedicationStatus> = {},
  title = "È ora di prendere il medicinale",
) => {
  if (!Capacitor.isNativePlatform()) return;

  const permissions = await ensureMedicationNotificationPermissions();
  if (permissions.display !== "granted") {
    console.warn("Notifiche medicinali non programmate: permesso notifiche non concesso.");
    return;
  }

  if (permissions.exactAlarm && permissions.exactAlarm !== "granted") {
    console.warn("Allarmi esatti non concessi: Android potrebbe ritardare il promemoria medicinale.");
  }

  await ensureMedicationNotificationChannel();

  await LocalNotifications.cancel({
    notifications: reminders.map((reminder) => ({ id: getMedicationNotificationId(reminder.id) })),
  });

  const now = new Date();
  const notifications = reminders
    .filter((reminder) => {
      const status = statuses[reminder.id];
      return (!status || status.stato === "in attesa") && getReminderDate(reminder) > now;
    })
    .map((reminder) => ({
      id: getMedicationNotificationId(reminder.id),
      title,
      body: reminder.nomeMedicinale,
      largeBody: reminder.nomeMedicinale,
      schedule: {
        at: getReminderDate(reminder),
        allowWhileIdle: true,
      },
      channelId: MEDICATION_NOTIFICATION_CHANNEL_ID,
      sound: "default",
      autoCancel: true,
      extra: { medicineId: reminder.id },
    }));

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
};