import { supabase } from "./supabase";

export interface DbUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  created_at: string;
}

export interface DbOrder {
  id: number;
  order_id: string;
  user_id: number | null;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  payment_method: string;
  items_json: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "done" | "cancelled";
  result_image?: string;
  admin_notes?: string;
  created_at: string;
}

// ─── User Queries (Supabase Cloud) ──────────────────────────────────────────

export const userQueries = {
  findByEmail: async (email: string): Promise<DbUser | undefined> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("userQueries.findByEmail error:", error);
      return undefined;
    }
    return (data as DbUser) || undefined;
  },

  findById: async (id: number): Promise<DbUser | undefined> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("userQueries.findById error:", error);
      return undefined;
    }
    return (data as DbUser) || undefined;
  },

  create: async (
    name: string,
    email: string,
    password: string,
    role: string = "user"
  ): Promise<number> => {
    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password, role }])
      .select("id")
      .single();

    if (error) {
      console.error("userQueries.create error:", error);
      throw error;
    }
    return Number(data.id);
  },
};

// ─── Order Queries (Supabase Cloud) ─────────────────────────────────────────

export const orderQueries = {
  create: async (
    order_id: string,
    user_id: number | null,
    customer_name: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    notes: string,
    payment_method: string,
    items_json: string,
    subtotal: number,
    shipping: number,
    total: number
  ): Promise<number> => {
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          order_id,
          user_id,
          customer_name,
          email,
          phone,
          address,
          city,
          notes: notes || "",
          payment_method,
          items_json,
          subtotal,
          shipping,
          total,
          status: "pending",
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("orderQueries.create error:", error);
      throw error;
    }
    return Number(data.id);
  },

  findAll: async (): Promise<DbOrder[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("orderQueries.findAll error:", error);
      return [];
    }
    return (data as DbOrder[]) || [];
  },

  findByUserId: async (uid: number): Promise<DbOrder[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("orderQueries.findByUserId error:", error);
      return [];
    }
    return (data as DbOrder[]) || [];
  },

  findByOrderId: async (oid: string): Promise<DbOrder | undefined> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", oid)
      .maybeSingle();

    if (error) {
      console.error("orderQueries.findByOrderId error:", error);
      return undefined;
    }
    return (data as DbOrder) || undefined;
  },

  updateStatus: async (status: string, order_id: string): Promise<void> => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_id", order_id);

    if (error) {
      console.error("orderQueries.updateStatus error:", error);
      throw error;
    }
  },

  updateResult: async (
    order_id: string,
    result_image: string,
    admin_notes: string = ""
  ): Promise<void> => {
    const { error } = await supabase
      .from("orders")
      .update({ result_image, admin_notes })
      .eq("order_id", order_id);

    if (error) {
      console.error("orderQueries.updateResult error:", error);
      throw error;
    }
  },

  delete: async (order_id: string): Promise<void> => {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("order_id", order_id);

    if (error) {
      console.error("orderQueries.delete error:", error);
      throw error;
    }
  },
};
