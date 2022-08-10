import { customAlphabet } from "nanoid";
import dayjs from 'dayjs';

export function generateOtp(): string {
  return customAlphabet('0123456789', 6)();
}

export function isExpired(otpExpiry: string): boolean {
  if (!otpExpiry) return true;
  return dayjs().isAfter(dayjs(otpExpiry));
}