/** Hot Pepper Web Service API の共通型 */

export type HotpepperError = {
  message: string;
  code: number | string;
};

export type HotpepperBudget = {
  code?: string;
  name?: string;
  average?: string;
};

export type HotpepperShop = {
  id: string;
  name: string;
  address?: string;
  catch?: string;
  open?: string;
  close?: string;
  access?: string;
  lat?: string;
  lng?: string;
  logo_image?: string;
  genre?: { code?: string; name?: string };
  budget?: HotpepperBudget;
  photo?: {
    pc?: { l?: string; m?: string; s?: string };
    mobile?: { l?: string; s?: string };
  };
  urls?: { pc?: string };
  [key: string]: unknown;
};

export type HotpepperGourmetResults = {
  api_version?: string;
  results_available: number;
  results_returned: string | number;
  results_start: number;
  shop?: HotpepperShop | HotpepperShop[];
  error?: HotpepperError;
};

export type HotpepperGourmetResponse = {
  results: HotpepperGourmetResults;
};

export type HotpepperMasterItem = {
  code?: string;
  name?: string;
};

export type HotpepperSpecialMasterItem = {
  code?: string;
  name?: string;
  special_category?: {
    code?: string;
    name?: string;
  };
};

export type HotpepperMasterResponse<K extends string> = {
  results: {
    [P in K]?: HotpepperMasterItem | HotpepperMasterItem[];
  } & {
    api_version?: string;
    results_available?: number;
    results_returned?: number;
    results_start?: number;
    error?: HotpepperError;
  };
};
