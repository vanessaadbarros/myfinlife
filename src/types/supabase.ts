export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          settings: Json
        }
        Insert: {
          id: string
          email: string
          name: string
          created_at?: string
          settings?: Json
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          settings?: Json
        }
      }
      bank_accounts: {
        Row: {
          id: string
          user_id: string
          bank_name: string
          account_number: string | null
          account_type: 'checking' | 'savings' | 'investment'
          balance: number
          is_active: boolean
          color: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bank_name: string
          account_number?: string | null
          account_type?: 'checking' | 'savings' | 'investment'
          balance?: number
          is_active?: boolean
          color?: string
          icon?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bank_name?: string
          account_number?: string | null
          account_type?: 'checking' | 'savings' | 'investment'
          balance?: number
          is_active?: boolean
          color?: string
          icon?: string
          created_at?: string
        }
      }
      budget_boxes: {
        Row: {
          id: string
          user_id: string
          name: string
          percentage: number
          color: string
          icon: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          percentage: number
          color?: string
          icon?: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          percentage?: number
          color?: string
          icon?: string
          order_index?: number
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color: string
          icon: string
          parent_id: string | null
          box_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color?: string
          icon?: string
          parent_id?: string | null
          box_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          color?: string
          icon?: string
          parent_id?: string | null
          box_id?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          credit_card_id: string | null
          amount: number
          description: string
          category_id: string | null
          budget_box_id: string | null
          goal_id: string | null
          installment_group_id: string | null
          installment_number: number | null
          total_installments: number | null
          date: string
          type: 'income' | 'expense' | 'investment'
          payment_method: 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip'
          invoice_date: string | null
          is_transfer: boolean
          transfer_to_account_id: string | null
          linked_transaction_id: string | null
          invoice_id: string | null
          is_recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          credit_card_id?: string | null
          amount: number
          description: string
          category_id?: string | null
          budget_box_id?: string | null
          goal_id?: string | null
          installment_group_id?: string | null
          installment_number?: number | null
          total_installments?: number | null
          date: string
          type: 'income' | 'expense' | 'investment'
          payment_method?: 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip'
          invoice_date?: string | null
          is_transfer?: boolean
          transfer_to_account_id?: string | null
          linked_transaction_id?: string | null
          invoice_id?: string | null
          is_recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          credit_card_id?: string | null
          amount?: number
          description?: string
          category_id?: string | null
          budget_box_id?: string | null
          goal_id?: string | null
          installment_group_id?: string | null
          installment_number?: number | null
          total_installments?: number | null
          date?: string
          type?: 'income' | 'expense' | 'investment'
          payment_method?: 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip'
          invoice_date?: string | null
          is_transfer?: boolean
          transfer_to_account_id?: string | null
          linked_transaction_id?: string | null
          invoice_id?: string | null
          is_recurring?: boolean
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'yearly'
          spent_amount: number
          alert_threshold: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'yearly'
          spent_amount?: number
          alert_threshold?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: 'monthly' | 'yearly'
          spent_amount?: number
          alert_threshold?: number
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          target_date: string
          annual_interest_rate: number
          priority: 'low' | 'medium' | 'high' | null
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          target_amount: number
          current_amount?: number
          target_date: string
          annual_interest_rate?: number
          priority?: 'low' | 'medium' | 'high' | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          target_date?: string
          annual_interest_rate?: number
          priority?: 'low' | 'medium' | 'high' | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          symbol: string
          asset_type: 'stock' | 'fund' | 'crypto' | 'fixed_income' | 'real_estate'
          quantity: number
          avg_price: number
          current_price: number | null
          broker: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          asset_type: 'stock' | 'fund' | 'crypto' | 'fixed_income' | 'real_estate'
          quantity: number
          avg_price: number
          current_price?: number | null
          broker?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          asset_type?: 'stock' | 'fund' | 'crypto' | 'fixed_income' | 'real_estate'
          quantity?: number
          avg_price?: number
          current_price?: number | null
          broker?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      installment_groups: {
        Row: {
          id: string
          user_id: string
          description: string
          total_amount: number
          total_installments: number
          installment_amount: number
          start_date: string
          category_id: string | null
          budget_box_id: string | null
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          total_amount: number
          total_installments: number
          installment_amount: number
          start_date: string
          category_id?: string | null
          budget_box_id?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          total_amount?: number
          total_installments?: number
          installment_amount?: number
          start_date?: string
          category_id?: string | null
          budget_box_id?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          category_id: string | null
          budget_box_id: string | null
          account_id: string | null
          credit_card_id: string | null
          payment_method: 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip'
          frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string | null
          is_active: boolean
          last_executed: string | null
          next_execution: string | null
          type: 'income' | 'expense'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          category_id?: string | null
          budget_box_id?: string | null
          account_id?: string | null
          credit_card_id?: string | null
          payment_method?: 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip'
          frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date?: string | null
          is_active?: boolean
          last_executed?: string | null
          next_execution?: string | null
          type: 'income' | 'expense'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: number
          category_id?: string | null
          budget_box_id?: string | null
          account_id?: string | null
          credit_card_id?: string | null
          payment_method?: 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip'
          frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          last_executed?: string | null
          next_execution?: string | null
          type?: 'income' | 'expense'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goal_contributions: {
        Row: {
          id: string
          goal_id: string
          amount: number
          date: string
          description: string | null
          source_type: 'manual' | 'transaction' | 'investment' | null
          source_id: string | null
          transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          amount: number
          date: string
          description?: string | null
          source_type?: 'manual' | 'transaction' | 'investment' | null
          source_id?: string | null
          transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          amount?: number
          date?: string
          description?: string | null
          source_type?: 'manual' | 'transaction' | 'investment' | null
          source_id?: string | null
          transaction_id?: string | null
          created_at?: string
        }
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          bank_account_id: string | null
          card_name: string
          last_four_digits: string | null
          card_network: string | null
          credit_limit: number
          closing_day: number
          due_day: number
          is_active: boolean
          color: string
          icon: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bank_account_id?: string | null
          card_name: string
          last_four_digits?: string | null
          card_network?: string | null
          credit_limit?: number
          closing_day: number
          due_day: number
          is_active?: boolean
          color?: string
          icon?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bank_account_id?: string | null
          card_name?: string
          last_four_digits?: string | null
          card_network?: string | null
          credit_limit?: number
          closing_day?: number
          due_day?: number
          is_active?: boolean
          color?: string
          icon?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_card_invoices: {
        Row: {
          id: string
          user_id: string
          credit_card_id: string
          reference_month: string
          closing_date: string
          due_date: string
          total_amount: number
          paid_amount: number
          status: 'open' | 'closed' | 'paid' | 'overdue' | 'partial'
          payment_transaction_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          credit_card_id: string
          reference_month: string
          closing_date: string
          due_date: string
          total_amount?: number
          paid_amount?: number
          status?: 'open' | 'closed' | 'paid' | 'overdue' | 'partial'
          payment_transaction_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          credit_card_id?: string
          reference_month?: string
          closing_date?: string
          due_date?: string
          total_amount?: number
          paid_amount?: number
          status?: 'open' | 'closed' | 'paid' | 'overdue' | 'partial'
          payment_transaction_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

