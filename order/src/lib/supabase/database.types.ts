export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name_ar: string;
          name_en: string;
          sort: number;
          tenant_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name_ar: string;
          name_en: string;
          sort?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name_ar?: string;
          name_en?: string;
          sort?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      item_modifier_groups: {
        Row: {
          created_at: string;
          group_id: string;
          item_id: string;
          sort: number;
          tenant_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          group_id: string;
          item_id: string;
          sort?: number;
          tenant_id: string;
        };
        Update: {
          created_at?: string;
          group_id?: string;
          item_id?: string;
          sort?: number;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'item_modifier_groups_group_id_tenant_id_fkey';
            columns: ['group_id', 'tenant_id'];
            isOneToOne: false;
            referencedRelation: 'modifier_groups';
            referencedColumns: ['id', 'tenant_id'];
          },
          {
            foreignKeyName: 'item_modifier_groups_item_id_tenant_id_fkey';
            columns: ['item_id', 'tenant_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id', 'tenant_id'];
          },
          {
            foreignKeyName: 'item_modifier_groups_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      item_variants: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          name_ar: string;
          name_en: string;
          price: number;
          sort: number;
          tenant_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          name_ar: string;
          name_en: string;
          price: number;
          sort?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          name_ar?: string;
          name_en?: string;
          price?: number;
          sort?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'item_variants_item_id_tenant_id_fkey';
            columns: ['item_id', 'tenant_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id', 'tenant_id'];
          },
          {
            foreignKeyName: 'item_variants_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      items: {
        Row: {
          base_price: number | null;
          category_id: string;
          created_at: string;
          description_ar: string | null;
          description_en: string | null;
          id: string;
          image_path: string | null;
          in_stock: boolean;
          is_active: boolean;
          name_ar: string;
          name_en: string;
          sort: number;
          tenant_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          base_price?: number | null;
          category_id: string;
          created_at?: string;
          description_ar?: string | null;
          description_en?: string | null;
          id?: string;
          image_path?: string | null;
          in_stock?: boolean;
          is_active?: boolean;
          name_ar: string;
          name_en: string;
          sort?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          base_price?: number | null;
          category_id?: string;
          created_at?: string;
          description_ar?: string | null;
          description_en?: string | null;
          id?: string;
          image_path?: string | null;
          in_stock?: boolean;
          is_active?: boolean;
          name_ar?: string;
          name_en?: string;
          sort?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'items_category_id_tenant_id_fkey';
            columns: ['category_id', 'tenant_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id', 'tenant_id'];
          },
          {
            foreignKeyName: 'items_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      modifier_groups: {
        Row: {
          created_at: string;
          id: string;
          max_select: number;
          min_select: number;
          name_ar: string;
          name_en: string;
          sort: number;
          tenant_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          max_select?: number;
          min_select?: number;
          name_ar: string;
          name_en: string;
          sort?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          max_select?: number;
          min_select?: number;
          name_ar?: string;
          name_en?: string;
          sort?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'modifier_groups_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      modifier_options: {
        Row: {
          created_at: string;
          group_id: string;
          id: string;
          in_stock: boolean;
          name_ar: string;
          name_en: string;
          price_delta: number;
          sort: number;
          tenant_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          group_id: string;
          id?: string;
          in_stock?: boolean;
          name_ar: string;
          name_en: string;
          price_delta?: number;
          sort?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          group_id?: string;
          id?: string;
          in_stock?: boolean;
          name_ar?: string;
          name_en?: string;
          price_delta?: number;
          sort?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'modifier_options_group_id_tenant_id_fkey';
            columns: ['group_id', 'tenant_id'];
            isOneToOne: false;
            referencedRelation: 'modifier_groups';
            referencedColumns: ['id', 'tenant_id'];
          },
          {
            foreignKeyName: 'modifier_options_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      order_counters: {
        Row: {
          day: string;
          last_number: number;
          tenant_id: string;
        };
        ComputedFields: never;
        Insert: {
          day: string;
          last_number?: number;
          tenant_id: string;
        };
        Update: {
          day?: string;
          last_number?: number;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_counters_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          item_id: string | null;
          line_total: number;
          modifiers: NonNullable<Json>;
          name_ar: string;
          name_en: string;
          order_id: string;
          quantity: number;
          tenant_id: string;
          unit_price: number;
          variant_id: string | null;
          variant_name_ar: string | null;
          variant_name_en: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          item_id?: string | null;
          line_total: number;
          modifiers?: NonNullable<Json>;
          name_ar: string;
          name_en: string;
          order_id: string;
          quantity: number;
          tenant_id: string;
          unit_price: number;
          variant_id?: string | null;
          variant_name_ar?: string | null;
          variant_name_en?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string | null;
          line_total?: number;
          modifiers?: NonNullable<Json>;
          name_ar?: string;
          name_en?: string;
          order_id?: string;
          quantity?: number;
          tenant_id?: string;
          unit_price?: number;
          variant_id?: string | null;
          variant_name_ar?: string | null;
          variant_name_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_order_id_tenant_id_fkey';
            columns: ['order_id', 'tenant_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id', 'tenant_id'];
          },
          {
            foreignKeyName: 'order_items_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_variant_id_fkey';
            columns: ['variant_id'];
            isOneToOne: false;
            referencedRelation: 'item_variants';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          cancelled_at: string | null;
          car_description: string | null;
          collected_at: string | null;
          created_at: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          id: string;
          is_outside: boolean;
          notes: string | null;
          order_number: number;
          outside_at: string | null;
          payment_method: Database['public']['Enums']['payment_method'];
          payment_provider_ref: string | null;
          payment_status: Database['public']['Enums']['payment_status'];
          pickup_at: string;
          pickup_type: Database['public']['Enums']['pickup_type'];
          preparing_at: string | null;
          ready_at: string | null;
          received_at: string;
          status: Database['public']['Enums']['order_status'];
          subtotal: number;
          tenant_id: string;
          total: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          cancelled_at?: string | null;
          car_description?: string | null;
          collected_at?: string | null;
          created_at?: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          id?: string;
          is_outside?: boolean;
          notes?: string | null;
          order_number: number;
          outside_at?: string | null;
          payment_method?: Database['public']['Enums']['payment_method'];
          payment_provider_ref?: string | null;
          payment_status?: Database['public']['Enums']['payment_status'];
          pickup_at: string;
          pickup_type?: Database['public']['Enums']['pickup_type'];
          preparing_at?: string | null;
          ready_at?: string | null;
          received_at?: string;
          status?: Database['public']['Enums']['order_status'];
          subtotal: number;
          tenant_id: string;
          total: number;
          updated_at?: string;
        };
        Update: {
          cancelled_at?: string | null;
          car_description?: string | null;
          collected_at?: string | null;
          created_at?: string;
          customer_id?: string;
          customer_name?: string;
          customer_phone?: string;
          id?: string;
          is_outside?: boolean;
          notes?: string | null;
          order_number?: number;
          outside_at?: string | null;
          payment_method?: Database['public']['Enums']['payment_method'];
          payment_provider_ref?: string | null;
          payment_status?: Database['public']['Enums']['payment_status'];
          pickup_at?: string;
          pickup_type?: Database['public']['Enums']['pickup_type'];
          preparing_at?: string | null;
          ready_at?: string | null;
          received_at?: string;
          status?: Database['public']['Enums']['order_status'];
          subtotal?: number;
          tenant_id?: string;
          total?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      platform_admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tenant_domains: {
        Row: {
          created_at: string;
          hostname: string;
          tenant_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          hostname: string;
          tenant_id: string;
        };
        Update: {
          created_at?: string;
          hostname?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tenant_domains_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      tenant_members: {
        Row: {
          created_at: string;
          id: string;
          role: Database['public']['Enums']['tenant_role'];
          tenant_id: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          role: Database['public']['Enums']['tenant_role'];
          tenant_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database['public']['Enums']['tenant_role'];
          tenant_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tenant_members_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      tenants: {
        Row: {
          created_at: string;
          currency: string;
          features: NonNullable<Json>;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          name_ar: string;
          name_en: string;
          opening_hours: NonNullable<Json>;
          ordering_paused: boolean;
          paused_until: string | null;
          pickup_lead_minutes: number;
          slug: string;
          theme: NonNullable<Json>;
          timezone: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          currency?: string;
          features?: NonNullable<Json>;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name_ar: string;
          name_en: string;
          opening_hours?: NonNullable<Json>;
          ordering_paused?: boolean;
          paused_until?: string | null;
          pickup_lead_minutes?: number;
          slug: string;
          theme?: NonNullable<Json>;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          features?: NonNullable<Json>;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name_ar?: string;
          name_en?: string;
          opening_hours?: NonNullable<Json>;
          ordering_paused?: boolean;
          paused_until?: string | null;
          pickup_lead_minutes?: number;
          slug?: string;
          theme?: NonNullable<Json>;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      hours_open_at: { Args: { p_at: string; p_hours: Json; p_timezone: string }; Returns: boolean };
      is_platform_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_tenant_owner: { Args: { p_tenant_id: string }; Returns: boolean };
      is_tenant_staff: { Args: { p_tenant_id: string }; Returns: boolean };
      mark_outside: { Args: { p_car_description?: string; p_order_id: string }; Returns: undefined };
      ordering_is_paused: { Args: { p_paused: boolean; p_until: string }; Returns: boolean };
      place_order: { Args: { p_payload: Json; p_tenant_id: string }; Returns: Json };
      set_item_stock: { Args: { p_in_stock: boolean; p_item_id: string }; Returns: undefined };
      set_option_stock: { Args: { p_in_stock: boolean; p_option_id: string }; Returns: undefined };
      set_order_status: {
        Args: { p_order_id: string; p_status: Database['public']['Enums']['order_status'] };
        Returns: Json;
      };
      set_ordering_paused: { Args: { p_minutes?: number; p_paused: boolean; p_tenant_id: string }; Returns: undefined };
      tenant_insights: { Args: { p_from: string; p_tenant_id: string; p_to: string }; Returns: Json };
      update_store_settings: {
        Args: { p_opening_hours?: Json; p_pickup_lead_minutes?: number; p_tenant_id: string };
        Returns: undefined;
      };
      validate_opening_hours: { Args: { p_hours: Json }; Returns: boolean };
    };
    Enums: {
      order_status: 'received' | 'preparing' | 'ready' | 'collected' | 'cancelled';
      payment_method: 'pay_at_pickup';
      payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed';
      pickup_type: 'asap' | 'scheduled';
      tenant_role: 'owner' | 'staff';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    keyof (DefaultSchema['Tables'] & DefaultSchema['Views']) | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      order_status: ['received', 'preparing', 'ready', 'collected', 'cancelled'],
      payment_method: ['pay_at_pickup'],
      payment_status: ['unpaid', 'paid', 'refunded', 'failed'],
      pickup_type: ['asap', 'scheduled'],
      tenant_role: ['owner', 'staff'],
    },
  },
} as const;
