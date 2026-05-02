import { apiCoreRequest } from './apiService';
import { 
  AccountsResponse, 
  Account,  
  IncomeExpenseBreakdownResponse, 
  MonthToDateBalanceResponse} from '../types/types';

export const fetchAccounts = (
  token: string, 
  type?: string,
) => {
  const params: Record<string, string> = { };
  if (type && type !== 'All') params.type = type;
  return apiCoreRequest<AccountsResponse>('/accounts', 'GET', token, params);
};

export const createAccount = (
  token: string, 
  data: Record<string, any> 
) => {
  return apiCoreRequest<AccountsResponse>('/accounts', 'POST', token, {}, data)
};

export const updateAccount = async (
  token: string,
  accountId: number,
  accountData: Account
): Promise<Account> => {
  try {
    const endpoint = `/accounts/${accountId}`;
    const response = await apiCoreRequest<Account>(
      endpoint,
      'PUT',
      token,
      {},
      {
        user_id: accountData.user_id,
        currency: accountData.currency,
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance,
        target_amount: accountData.target_amount,
      }
    );
    return response;
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

export const deleteAccount = async (
  token: string, 
  accountId: number
) => {
  const endpoint = `/accounts/${accountId}`;
  return apiCoreRequest<AccountsResponse>(
    endpoint, 'DELETE', token, {}, {}
  )
};

export const fetchIncomeExpenseBreakdown = (
  token: string, 
  breakdownType: string,
  start_date: string,
  end_date: string,
  accountId?: number, 
) => {
  const params: Record<string, string> = { 
    breakdown_type: breakdownType, 
    start_date, 
    end_date 
  };

  if (accountId && accountId !== undefined) {
    params.account_id = accountId.toString();
  }
  const endpoint = '/accounts/breakdown';
  return apiCoreRequest<IncomeExpenseBreakdownResponse>(endpoint, 'GET', token, params);
};

export const fetchMonthToDateBalance = async (
  token: string,
  accountId?: number,
) => {
  const endpoint = '/accounts/month-to-date-balance';
  const params: Record<string, any> = {};
  if (accountId && accountId !== undefined) {
    params.account_id = accountId;
  }
  return apiCoreRequest<MonthToDateBalanceResponse>(endpoint, 'GET', token, params, {});
};