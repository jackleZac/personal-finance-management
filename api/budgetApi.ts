import { apiCoreRequest } from './apiService';
import { Budget, BudgetsResponse, BudgetTrendsResponse } from '@/types/types';

export const fetchBudgets = (token: string) => {
  return apiCoreRequest<BudgetsResponse>('/budgets', 'GET', token, {}, {});
};

export const fetchBudgetTrend = async (
  token: string,
  budgetId: number | undefined
): Promise<BudgetTrendsResponse> => {
    return apiCoreRequest<BudgetTrendsResponse>(
      `/budgets/${budgetId}/trend`,
      'GET',
      token,
      {},
      {}
    );
};

export const createBudget = (
  token: string, 
  data: Record<string, any>
) => {
  return apiCoreRequest<BudgetsResponse>('/budgets', 'POST', token, {}, data)
}

export const updateBudget = async (
  token: string,
  budgetId: number,
  budgetData: Budget
): Promise<Budget> => {
  try {
    const endpoint = `/budgets/${budgetId}`;
    const response = await apiCoreRequest<Budget>(
      endpoint,
      'PUT',
      token,
      {},
      {
        user_id: budgetData.user_id,
        category_id: budgetData.category_id,
        budget_limit: budgetData.budget_limit,
        spent_amount: budgetData.spent_amount,
        type: budgetData.type,
        notification_enabled: budgetData.notification_enabled,
        status: budgetData.status,
        created_at: budgetData.created_at,
        updated_at: budgetData.updated_at,
      }
    );
    return response;
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

export const deleteBudget = async (token: string, budgetId: number) => {
  const endpoint = `/budgets/${budgetId}`;
  return apiCoreRequest<BudgetsResponse>(
    endpoint, 'DELETE', token, {}, {}
  )
}