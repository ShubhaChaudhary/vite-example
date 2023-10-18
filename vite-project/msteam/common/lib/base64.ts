import { Buffer } from 'buffer';

export const atob = (data: string) => {
  return Buffer.from(data, 'base64').toString();
};

export const btoa = (data: string) => {
  return Buffer.from(data).toString('base64');
};