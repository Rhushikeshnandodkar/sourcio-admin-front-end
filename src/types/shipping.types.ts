export interface ShippingAddress {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  address2?: string | null;
  postal_code: string;
  company?: string | null;
  instructions?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type ShippingAddressCreateRequest = Omit<
  ShippingAddress,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type ShippingAddressUpdateRequest =
  Partial<ShippingAddressCreateRequest>;
