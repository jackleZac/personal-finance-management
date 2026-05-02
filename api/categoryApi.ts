import { apiCoreRequest } from './apiService';
import { CategoriesResponse } from '@/types/types';

export const fetchCategories = (token: string) => {
    return apiCoreRequest<CategoriesResponse>('/categories', 'GET', token, {}, {});
  };

export const createCategories = (
  token: string, 
  data: Record<string, any>
) => {
  return apiCoreRequest<CategoriesResponse>('/categories', 'POST', token, {}, data)
}

export const updateCategory = async (
  token: string,
  categoryId: number,
  categoryData: Record<string, any>
): Promise<CategoriesResponse> => {
  try {
    const endpoint = `/categories/${categoryId}`;
    const response = await apiCoreRequest<CategoriesResponse>(
      endpoint,
      'PUT',
      token,
      {},
      {
        user_id: categoryData.userId,
        name: categoryData.name,
        icon_id: categoryData.icon_id,
        type: categoryData.type,
      },
    );
    return response;
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

export const deleteCategory = async (token: string, categoryId: number) => {
  const endpoint = `/categories/${categoryId}`;
  return apiCoreRequest<CategoriesResponse>(
    endpoint, 'DELETE', token, {}, {}
  )
}