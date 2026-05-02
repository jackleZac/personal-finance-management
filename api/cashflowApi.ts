import { apiCoreRequest } from "./apiService";
import { CashflowResponse } from "../types/types";

export const fetchPastWeeklyCashflow = (
  token: string,
  startDate?: string,
  endDate?: string,
  accountId?: string | undefined
) => {
    const params: Record<string, string> = {};

    if (accountId !== undefined) {
        params.account_id = accountId.toString();
    };

    if (startDate !== undefined) {
        params.start_date = startDate.toString();
    };

    if (endDate !== undefined) {
        params.end_date = endDate.toString();
    };

    return apiCoreRequest<CashflowResponse>(
        '/cashflows',
        "GET",
        token,
        params,
        {}
    );
}