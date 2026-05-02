import { apiCoreRequest } from './apiService';
import { CategoriesResponse, TransactionsResponse } from '../types/types';

export const fetchTransactions = (
    token: string,
    startDate?: string,
    endDate?: string,
    accountId?: number | undefined
  ) => {
    const params: Record<string, string> = { };
    if (accountId && accountId !== undefined) {
      params.account_id = accountId.toString();
    };

    if (startDate && startDate !== undefined) {
      params.start_date = startDate.toString();
    };

    if (endDate && endDate !== undefined) {
      params.end_date = endDate.toString();
    };
    return apiCoreRequest<TransactionsResponse>('/transactions', 'GET', token, params);
};

export const createTransaction = (
  token: string,
  data: Record<string, any>
  ) => {
    return apiCoreRequest<TransactionsResponse>('/transactions', 'POST', token, {}, data)
}

export const updateTransaction = async (
  token: string,
  userId: string,
  transactionId: number,
  transactionData: Record<string, any>
): Promise<Record<string, any>> => {
  try {
    const endpoint = `/transactions/${transactionId}`;
    const response = await apiCoreRequest<Record<string, any>>(
      endpoint,
      'PUT',
      token,
      { },
      {
        user_id: userId,
        account_id: transactionData.account_id,
        amount: transactionData.amount,
        transaction_date: transactionData.date,
        category_id: transactionData.category_id,
        description: transactionData.description,
        type: transactionData.type,
        currency: transactionData.currency,
        is_recurring: transactionData.is_recurring,

      }
    );
    return response;
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export const deleteTransaction = async (token: string, transactionId: number) => {
  const endpoint = `/transactions/${transactionId}`
  return apiCoreRequest<CategoriesResponse>(
    endpoint, 'DELETE', token, {}, {}
  )
}