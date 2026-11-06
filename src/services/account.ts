/**
 * Conta (cadastro, entrada com link no e-mail, dados na conta, sugestões): só no web app.
 * No app instalado (pausado por enquanto) a conta fica desligada e nada é bloqueado.
 * A versão de verdade está em account.web.ts.
 */
import { create } from 'zustand';
import type { FeedbackType, Profile } from '@/core/account';

export type AccountStatus = 'off' | 'loading' | 'signedOut' | 'needsProfile' | 'ready';
export interface AccountInfo { status: AccountStatus; uid: string | null; email: string | null; profile: Profile | null }

export const accountAvailable = false;
export const useAccount = create<AccountInfo>(() => ({ status: 'off', uid: null, email: null, profile: null }));

const off = () => Promise.reject(new Error('Conta só no web app'));
export function startAccount(): void {}
export type LoginRequest = { rid: string; email: string; code: string };
export const pendingLogin = (): LoginRequest | null => null;
export const requestLogin = (_email: string): Promise<LoginRequest> => off();
export const waitForLogin = (_req: LoginRequest, _onError: (e: unknown) => void): (() => void) => () => {};
export const cancelLogin = (): void => {};
export type ConfirmInfo =
  | { kind: 'invalid' } | { kind: 'signedInHere' } | { kind: 'used' } | { kind: 'noRequest' }
  | { kind: 'remote'; rid: string; email: string; device: string; code: string };
export const readConfirm = (_href: string): Promise<ConfirmInfo> => off();
export const approveRemote = (_rid: string, _href: string): Promise<void> => off();
export const signInHere = (_email: string, _href: string): Promise<void> => off();
export const saveProfile = (_p: Profile): Promise<void> => off();
export const signOutAccount = (): Promise<void> => off();
export const deleteAccount = (): Promise<'deleted' | 'dataOnly'> => off();
export const sendFeedback = (_f: { rating: number | null; type: FeedbackType; message: string; route: string }): Promise<void> => off();
export const authErrorCode = (e: unknown): string => String((e as { code?: string })?.code ?? '');
