/**
 * Google Analytics — versão do app instalado (iPhone/Android): por enquanto não faz nada.
 * No app instalado, Analytics e Crashlytics entram com o @react-native-firebase num build novo.
 * A versão web está em analytics.web.ts (o Metro escolhe o arquivo certo sozinho).
 */
export type EventParams = Record<string, string | number | boolean>;

export const analyticsAvailable = false;
export async function setAnalyticsEnabled(_on: boolean): Promise<void> {}
export function track(_name: string, _params?: EventParams): void {}
