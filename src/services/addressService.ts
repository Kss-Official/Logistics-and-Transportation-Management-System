import api from './api';

export interface Address {
    id: number;
    addressType: string;
    contactName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    defaultAddress: boolean;
}

export interface AddressRequest {
    addressType: string;
    contactName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    defaultAddress: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export const addressService = {
    async getAll(): Promise<Address[]> {
        const response = await api.get<ApiResponse<Address[]>>(
            '/customer/addresses'
        );

        return response.data.data;
    },

    async getById(id: number): Promise<Address> {
        const response = await api.get<ApiResponse<Address>>(
            `/customer/addresses/${id}`
        );

        return response.data.data;
    },

    async create(data: AddressRequest): Promise<Address> {
        const response = await api.post<ApiResponse<Address>>(
            '/customer/addresses',
            data
        );

        return response.data.data;
    },

    async update(
        id: number,
        data: AddressRequest
    ): Promise<Address> {
        const response = await api.put<ApiResponse<Address>>(
            `/customer/addresses/${id}`,
            data
        );

        return response.data.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete<ApiResponse<void>>(
            `/customer/addresses/${id}`
        );
    },
};