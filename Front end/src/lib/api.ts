const API_BASE_URL = 'http://localhost:5000/api';

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

  async getPharmacyInventory(pharmacyId: number) {
    const response = await fetch(`${API_BASE_URL}/inventory/${pharmacyId}`);
    if (!response.ok) throw new Error('Failed to get pharmacy inventory');
    return response.json();
  },

  async getTransactions(pharmacyId: number) {
    const response = await fetch(`${API_BASE_URL}/inventory/${pharmacyId}/transactions`);
    if (!response.ok) throw new Error('Failed to get transactions');
    return response.json();
  },

  async getPharmacyByEmail(email: string) {
    const response = await fetch(`${API_BASE_URL}/pharmacies/email/${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to get pharmacy');
    return response.json();
  },

  // Inventory
  async addStock(pharmacyId: number, medicineId: number, quantity: number, expiryDate?: string) {
    const response = await fetch(`${API_BASE_URL}/inventory/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pharmacy_id: pharmacyId, medicine_id: medicineId, quantity, expiry_date: expiryDate }),
    });
    if (!response.ok) throw new Error('Failed to add stock');
    return response.json();
  },

  async reduceStock(pharmacyId: number, medicineId: number, quantity: number) {
    const response = await fetch(`${API_BASE_URL}/inventory/reduce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pharmacy_id: pharmacyId, medicine_id: medicineId, quantity }),
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
