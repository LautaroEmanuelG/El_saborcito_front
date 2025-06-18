// src/types/Rol.ts
export enum Rol {
  ADMIN = 'ADMIN',
  COCINERO = 'COCINERO',
  CAJERO = 'CAJERO',
  DELIVERY = 'DELIVERY',
  CLIENTE = 'CLIENTE',
}

export interface RolResponse {
  mensaje: string;
  source: string;
  algorithm: string;
  rol: Rol;
  email: string;
  tokenType: string;
}

export interface AuthInfo {
  rol: Rol;
  email: string;
  isValidToken: boolean;
}

export type AllowedRoles = Rol[];
