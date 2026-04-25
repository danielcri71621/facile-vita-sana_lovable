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
      smallIcon: "ic_launcher",
      largeIcon: "ic_launcher",
      autoCancel: true,
      extra: { medicineId: reminder.id },
    }));

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
};