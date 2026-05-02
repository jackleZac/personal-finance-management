import { apiCoreRequest } from "./apiService";
import { DailyBalancesResponse, InitialBalanceResponse } from "../types/types";

export const fetchDailyBalances = (
  token: string,
  accountId: string | undefined,
  startDate: string,
  endDate: string,
) => {
    const params: Record<string, number | any> = {
        start_date: startDate,
        end_date: endDate,
    };

    if (accountId !== undefined) {
        params.account_id = accountId.toString();
    } 

    return apiCoreRequest<DailyBalancesResponse>(
        "/balances",
        "GET",
        token,
        params
    );
}
