const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Medicines
  async searchMedicines(query: string) {
    const response = await fetch(`${API_BASE_URL}/medicines/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search medicines');
    return response.json();
  },

  async getPopularMedicines(limit: number = 10) {
    const response = await fetch(`${API_BASE_URL}/medicines/popular?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get popular medicines');
    return response.json();
  },

  async getAllMedicines() {
    const response = await fetch(`${API_BASE_URL}/medicines`);
    if (!response.ok) throw new Error('Failed to get medicines');
    return response.json();
  },

  // Pharmacies
  async getNearbyPharmacies(lat: number, lng: number, radius: number = 5) {
    const response = await fetch(`${API_BASE_URL}/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    if (!response.ok) throw new Error('Failed to get nearby pharmacies');
    return response.json();
  },

  async getAllPharmacies() {
    const response = await fetch(`${API_BASE_URL}/pharmacies`);
    if (!response.ok) throw new Error('Failed to get pharmacies');
    return response.json();
  },

  async getPharmacyInventory(pharmacyId?: number) {
    // Use protected endpoint for pharmacy staff (no pharmacyId needed - from token)
    // or public endpoint with pharmacyId for patients
    const endpoint = pharmacyId ? `${API_BASE_URL}/inventory/${pharmacyId}` : `${API_BASE_URL}/inventory/my-inventory`;
    const response = await fetch(endpoint, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get pharmacy inventory');
    return response.json();
  },

  async getTransactions(pharmacyId?: number) {
    // Use protected endpoint for pharmacy staff (no pharmacyId needed - from token)
    const endpoint = pharmacyId ? `${API_BASE_URL}/inventory/${pharmacyId}/transactions` : `${API_BASE_URL}/inventory/my-inventory/transactions`;
    const response = await fetch(endpoint, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get transactions');
    return response.json();
  },

  async getPharmacyByEmail(email: string) {
    const response = await fetch(`${API_BASE_URL}/pharmacies/email/${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to get pharmacy');
    return response.json();
  },

  async updatePharmacy(pharmacyData: any) {
    const response = await fetch(`${API_BASE_URL}/pharmacies/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(pharmacyData),
    });
    if (!response.ok) throw new Error('Failed to update pharmacy');
    return response.json();
  },

  async toggleOpenStatus(isOpen: boolean) {
    const response = await fetch(`${API_BASE_URL}/pharmacies/toggle-open`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_open: isOpen }),
    });
    if (!response.ok) throw new Error('Failed to toggle open status');
    return response.json();
  },

  // Inventory (pharmacyId now comes from auth token, not parameter)
  async addStock(medicineId: number, quantity: number, expiryDate?: string) {
    const response = await fetch(`${API_BASE_URL}/inventory/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ medicine_id: medicineId, quantity, expiry_date: expiryDate }),
    });
    if (!response.ok) throw new Error('Failed to add stock');
    return response.json();
  },

  async reduceStock(medicineId: number, quantity: number) {
    const response = await fetch(`${API_BASE_URL}/inventory/reduce`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ medicine_id: medicineId, quantity }),
    });
    if (!response.ok) throw new Error('Failed to reduce stock');
    return response.json();
  },

  // Auth
  async register(userData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to register');
    return response.json();
  },

  async registerPharmacy(formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/pharmacy-registration/register`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to register pharmacy' }));
      throw new Error(error.error || 'Failed to register pharmacy');
    }
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || 'Failed to login');
    }
    return response.json();
  },
};
