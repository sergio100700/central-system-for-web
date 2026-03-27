const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const API = {
    organizations: `${BASE_URL}/organizations`,
    chargepoints: `${BASE_URL}/chargepoints`,
}