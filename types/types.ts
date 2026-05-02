// This file contains type definitions for the application.
import { FC } from 'react';
import { SvgProps } from 'react-native-svg';

/**
 * Represents a user in the system.
 */
export type User = {
    user_id: number;
    email: string;
    name: string;
    base_currency: string;
    is_admin: boolean;
    status: string;
    subscription_plan: string;
    subscription_status: string;
    subscription_start_date: string | null;
    subscription_end_date: string | null;
    next_payment_due_date: string | null;
    trial_remaining_days: number;
    created_at: string;
    updated_at: string;
}

/**
 * Represents an account in the system.
 */
export type Account = {
    account_id: number;
    user_id: number,
    currency: string;
    name: string;
    type: AccountType;
    balance: number;
    converted_balance?: number | null; // Converted to base currency
    target_amount: number | null;
    percentage?: number | null;
    provider_account_id?: string | null; // For linked accounts
    provider_id?: number| null; // For linked accounts
};

/**
 * Represents a budget for a specific category.
 */
export type Budget = {
    budget_id: number;
    budget_limit: number;
    spent_amount: number;
    category_id: number;
    created_at: string;
    notification_enabled: boolean;
    status: string;
    type: string;
    updated_at: string;
    user_id: number;
};

/**
 * Represents budget and and its summary.
 */

export type BudgetItem = {
  budget_id: number;
  budget_limit: number;
  spent_amount: number;
  category_name: string;
  category_id?: number;
  icon_id: string;
  MatchedIcon?: FC<SvgProps>;
  type?: string;
};

/**
 * Represents trend of budgets over time.
 */

export type BudgetTrend = {
  month: string;
  year: number;
  amount: number;
}

export type BudgetTrendTransaction = {
  transaction_id: number;
  transaction_date: string;
  amount: number;
  account_id: number;
  account_name: string;
}

/**
 * Represents a category for transactions or budgets.
 */
export type Category = {
    category_id: number;
    user_id: number;
    name: string;
    type: string;
    status: string;
    is_default: boolean;
    icon_id: string;
    created_at: string;
    updated_at: string;
};

/**
 * Represents a financial transaction.
 */
export type Transaction = {
    transaction_id: number;
    account_id: number;
    amount: number;
    category_id: number;
    type: TransactionType;
    transaction_date: string;
    user_id: number;
    currency: string;
    description: string | null;
    is_recurring: boolean;
    icon_id: number;
    category_name: string;
    account_name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

/**
 * Represents daily balances of an account.
 */
export type DailyBalance = {
    balance_id: number;
    account_id: number;
    date: string;
    balance: number;
    created_at: string;
    updated_at: string;
};

/**
 * Represents category summary for income and expenses.
 */
export type CategorySummary = {
  id: string;
  category: string;
  amount: number;
  percentage: number;
  icon_id: string;
  MatchedIcon?: FC<SvgProps>;
}

/**
 * Represents the breakdown of income and expenses by category.
 */

export type BreakdownItem = {
  category_id: string;
  category_name: string;
  amount: number;
  percentage: number;
  icon_id: string;
}

/**
 * Represents the past weekly cashflows
 */
export type PastWeeklyCashflows = {
    week_start: string;
    week_end: string;
    total_cashflow: number;
    total_transactions: number;
}

// enums
export enum TransactionType {
    Income = 'income',
    Expense = 'expense',
}

export enum CategoryType {
    Expense = 'expense',
    Income = 'income',
}

export enum CategoryStatus {
    Active = 'active',
    Archived = 'archived',
}

export enum AccountType {
    Cash = 'cash',
    Investment = 'investment',
    Debt = 'debt',
}

export enum BudgetType {
    Wants = 'wants',
    Needs = 'needs',
    Savings = 'savings',
}

// API response types
export type UserResponse = {
    message: string;
    user: User;
    status: number;
};

export type UserPasswordResponse = {
    message: string;
    is_password_set: boolean;
    status: number;
};

export type AccountsResponse = {
    message: string;
    net_worth: number;
    assets: Account[] | null;
    debt: Account[] | null;
    account: Account | null;
    status: number;
};

export type BudgetsResponse = {
    message: string;
    budgets: Budget[] | null;
    budget: Budget | null;
    status: number;
};

export type CategoriesResponse = {
    message: string;
    categories: Category[] | null;
    category: Category | null;
    status: number;
};

export type TransactionsResponse = {
    message: string;
    transactions: Transaction[] | null;
    transaction: Transaction | null;
    status: number;
};

export type DailyBalancesResponse = {
    message: string;
    daily_balances: DailyBalance[] | null;
    status: number;
};

export type InitialBalanceResponse = {
    message: string;
    initial_balance: DailyBalance | null;
    status: number;
}

export type CashflowResponse = {
    message: string;
    forecasted_daily_cashflows: [] | null;
    past_weekly_cashflows: PastWeeklyCashflows[] | null;
    status: number;
};

export type AccountBreakdown = {
  account_id: number;
  account_name: string;
  account_currency: string;
  base_currency: string;
  breakdown: BreakdownItem[];
  total_amount: number;
};

export type IncomeExpenseBreakdownResponse = {
  message?: string;
  accounts: AccountBreakdown[];
  all_accounts_total: number;
  base_currency: string;
  status: number;
};

export type BudgetTrendsResponse = {
  message: string;
  budget: Budget;
  budget_trend: BudgetTrend[];
  transactions: BudgetTrendTransaction[];
  status: number;
};

export type MonthToDateBalanceResponse = {
    message: string | null;
    base_currency: string;
    mtd_change: number;
    mtd_percentage: number;
    start_balance: number;
    current_balance: number;
    exchange_rates: Record<string, number>;
    status: number;
}