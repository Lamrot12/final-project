import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Package, History, Settings, LogOut, Plus, Search, Edit, Trash2, AlertTriangle, CheckCircle, TrendingUp, Users, ShoppingCart, Bell, FileText, BarChart3, Home, Calendar, Clock, DollarSign, ArrowUpRight, ArrowDownRight, Minus, X, Check, Mail, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function PharmacyDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReduceModal, setShowReduceModal] = useState(false);
  const [reduceMedicine, setReduceMedicine] = useState("");
  const [reduceQuantity, setReduceQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pharmacyInfo, setPharmacyInfo] = useState<any>(null);

  const [notifications, setNotifications] = useState<any[]>([]);

  const [medicines, setMedicines] = useState<any[]>([]);
  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchPharmacyInfo = async () => {
    try {
      const pharmacy = await api.getPharmacyByEmail(user.email);
      setPharmacyInfo(pharmacy);
    } catch (err: any) {
      console.error('Error fetching pharmacy info:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Use authenticated endpoint - pharmacyId comes from token
      console.log('Fetching inventory for logged-in pharmacy');
      const inventory = await api.getPharmacyInventory();
      console.log('Inventory fetched:', inventory);
      console.log('Inventory length:', inventory?.length);
      console.log('Is array:', Array.isArray(inventory));
      
      if (!inventory || !Array.isArray(inventory)) {
        console.error('Invalid inventory response:', inventory);
        setError('Invalid inventory data received');
        setLoading(false);
        return;
      }
      
      // Pass raw data directly from pharmacy_stocks + medicines join
      setMedicines(inventory);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Failed to fetch inventory');
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Use authenticated endpoint - pharmacyId comes from token
      console.log('Fetching transactions for logged-in pharmacy');
      const transactions = await api.getTransactions();
      console.log('Transactions fetched:', transactions);
      setTransactions(transactions);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchAllMedicines = async () => {
    try {
      console.log('Fetching all medicines...');
      const response = await api.getAllMedicines();
      console.log('Medicines response:', response);
      if (response && response.length > 0) {
        const mapped = response.map((item: any) => ({
          id: item.medicine_id,
          name: item.brand_name || item.generic_name
        }));
        console.log('Mapped medicines:', mapped);
        setAllMedicines(mapped);
      } else {
        console.log('No medicines found in response');
      }
    } catch (err: any) {
      console.error('Error fetching medicines:', err);
    }
  };

  const generateNotifications = () => {
    if (!medicines.length) return;
    const newNotifications: any[] = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    medicines.forEach((med) => {
      const medicineName = med.brand_name || med.generic_name;

      // Low stock notifications
      if (med.quantity === 0) {
        newNotifications.push({
          id: `out-${med.medicine_id}`,
          message: `Out of stock: ${medicineName}`,
          time: "Just now",
          type: "error"
        });
      } else if (med.quantity < 10) {
        newNotifications.push({
          id: `low-${med.medicine_id}`,
          message: `Low stock alert: ${medicineName} (${med.quantity} units)`,
          time: "Just now",
          type: "warning"
        });
      }

      // Expiry date notifications
      if (med.expiry_date) {
        const expiryDate = new Date(med.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

        if (daysUntilExpiry < 0) {
          newNotifications.push({
            id: `expired-${med.medicine_id}`,
            message: `EXPIRED: ${medicineName} expired on ${expiryDate.toLocaleDateString()}`,
            time: "Just now",
            type: "error"
          });
        } else if (daysUntilExpiry <= 30) {
          newNotifications.push({
            id: `expiring-${med.medicine_id}`,
            message: `Expiring soon: ${medicineName} expires in ${daysUntilExpiry} days`,
            time: "Just now",
            type: "warning"
          });
        }
      }
    });

    setNotifications(newNotifications);
  };

  useEffect(() => {
    fetchPharmacyInfo();
    fetchAllMedicines();
  }, []);

  useEffect(() => {
    if (pharmacyInfo?.pharmacy_id) {
      fetchInventory();
      fetchTransactions();
      generateNotifications();
    }
  }, [pharmacyInfo]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAddStock = async () => {
    const qty = parseInt(quantity);
    
    if (!selectedMedicine) {
      setError('Please select a valid medicine from the dropdown');
      return;
    }
    if (!quantity || isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }
    try {
      setLoading(true);
      await api.addStock(selectedMedicine, qty, expiryDate);

      await fetchInventory();
      await fetchTransactions();
      generateNotifications();

      setSelectedMedicine("");
      setQuantity("");
      setExpiryDate("");
      setError("");
      setShowAddForm(false);
      setSuccessMessage('Stock added successfully!');
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error('Error adding stock:', err);
      setError(err.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  const handleReduceStock = async () => {
    const qty = parseInt(reduceQuantity);
    
    if (!reduceMedicine) {
      setError('Please select a valid medicine from the dropdown');
      return;
    }
    if (!reduceQuantity || isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }
    try {
      setLoading(true);
      await api.reduceStock(reduceMedicine, qty);

      await fetchInventory();
      await fetchTransactions();
      generateNotifications();

      setShowReduceModal(false);
      setReduceMedicine("");
      setReduceQuantity("");
      setError("");
      setSuccessMessage('Stock reduced successfully!');
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error('Error reducing stock:', err);
      setError(err.message || 'Failed to reduce stock');
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "inventory", icon: Package, label: "Inventory" },
    { id: "bincard", icon: FileText, label: "Bin Card" },
    { id: "transactions", icon: History, label: "Transactions" },
    { id: "notifications", icon: Bell, label: "Notifications", badge: notifications.length },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg">PharmaLink</span>
              <p className="text-xs text-slate-500">Pharmacy Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-white" : "text-slate-500"}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 space-y-1">
          <button 
            onClick={() => setActiveTab("settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200"
          >
            <Settings className="w-5 h-5 text-slate-500" />
            <span className="font-medium">Settings</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="bg-gradient-to-r from-white via-slate-50 to-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{pharmacyInfo?.pharmacy_name || 'Pharmacy'}</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour < 12) return "Good morning! Here's your overview.";
                      if (hour < 18) return "Good afternoon! Here's your overview.";
                      return "Good evening! Here's your overview.";
                    })()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search medicines, transactions, reports..."
                  className="pl-12 w-96 bg-white border-2 border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-sm"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 rounded border border-slate-200">⌘K</kbd>
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">{notifications.length}</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-sm text-slate-500">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                notif.type === "error" ? "bg-red-100" :
                                notif.type === "warning" ? "bg-yellow-100" :
                                notif.type === "success" ? "bg-green-100" :
                                "bg-blue-100"
                              }`}>
                                {notif.type === "error" ? (
                                  <AlertTriangle className="w-4 h-4 text-red-600" />
                                ) : notif.type === "warning" ? (
                                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                ) : notif.type === "success" ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Bell className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-900">{notif.message}</p>
                                <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-slate-200">
                      <Button 
                        variant="outline" 
                        className="w-full text-sm"
                        onClick={() => { setActiveTab("notifications"); setShowNotifications(false); }}
                      >
                        View All Notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user.full_name || pharmacyInfo?.pharmacy_name || 'Pharmacy'}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold">
                  {(user.full_name || pharmacyInfo?.pharmacy_name || 'P').substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center backdrop-blur-sm">
                      <Package className="w-6 h-6 text-purple-800" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">{medicines.length}</p>
                  <p className="text-sm text-purple-700">Total Items</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center backdrop-blur-sm">
                      <AlertTriangle className="w-6 h-6 text-blue-800" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{medicines.filter(m => m.quantity < 10).length}</p>
                  <p className="text-sm text-blue-700">Low Stock</p>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center backdrop-blur-sm">
                      <ShoppingCart className="w-6 h-6 text-emerald-800" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-emerald-900">{transactions.length}</p>
                  <p className="text-sm text-emerald-700">Total Transactions</p>
                </div>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-lg">
                  <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-slate-900 text-lg">Recent Transactions</h2>
                      <span className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.transaction_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-xl hover:shadow-md hover:border-slate-200 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-primary to-primary/80">
                              {tx.transaction_type === "sale" ? (
                                <ShoppingCart className="w-5 h-5 text-white" />
                              ) : (
                                <Package className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{tx.brand_name || tx.generic_name}</p>
                              <p className="text-sm text-slate-500">{new Date(tx.created_at).toLocaleDateString()} • {tx.notes || 'No notes'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">{tx.quantity} units</p>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {tx.transaction_type}
                            </span>
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <p className="text-center text-slate-500 py-8">No transactions found</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg">
                  <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <h2 className="font-bold text-slate-900 text-lg">Quick Actions</h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 hover:bg-primary/5 hover:border-primary/30"
                      onClick={() => { setShowAddForm(true); setShowReduceModal(false); setSelectedMedicine(""); setQuantity(""); setExpiryDate(""); setError(""); }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Stock
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 hover:bg-primary/5 hover:border-primary/30"
                      onClick={() => { setShowReduceModal(true); setShowAddForm(false); setReduceMedicine(""); setReduceQuantity(""); }}
                    >
                      <Minus className="w-4 h-4" />
                      Reduce Stock
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 hover:bg-primary/5 hover:border-primary/30"
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add/Reduce Stock Form - shown when Quick Actions clicked */}
              {(showAddForm || showReduceModal) && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-slate-900 text-lg">
                      {showReduceModal ? "Reduce Stock from Inventory" : "Add Stock to Inventory"}
                    </h2>
                    <button 
                      onClick={() => { setShowAddForm(false); setShowReduceModal(false); }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                      <p className="text-red-700 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                      </p>
                    </div>
                  )}
                  {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                      <p className="text-green-700 text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {successMessage}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Select Medicine</Label>
                      <select
                        value={showReduceModal ? reduceMedicine : selectedMedicine}
                        onChange={(e) => {
                          if (showReduceModal) {
                            setReduceMedicine(e.target.value);
                          } else {
                            setSelectedMedicine(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Choose medicine...</option>
                        {showReduceModal 
                          ? medicines.map((med) => (
                              <option key={med.medicine_id} value={med.medicine_id}>
                                {med.brand_name || med.generic_name} (Current: {med.quantity})
                              </option>
                            ))
                          : allMedicines.map((med) => (
                              <option key={med.id} value={med.id}>
                                {med.name}
                              </option>
                            ))
                        }
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Quantity</Label>
                      <Input
                        type="number"
                        value={showReduceModal ? reduceQuantity : quantity}
                        onChange={(e) => {
                          if (showReduceModal) {
                            setReduceQuantity(e.target.value);
                          } else {
                            setQuantity(e.target.value);
                          }
                        }}
                        placeholder="Enter quantity"
                        className="px-4 py-3 border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    {!showReduceModal && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Expiry Date</Label>
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="px-4 py-3 border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    )}
                    {showReduceModal && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Reason</Label>
                        <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                          <option value="">Select reason...</option>
                          <option value="sale">Sale</option>
                          <option value="damage">Damage</option>
                          <option value="expiry">Expired</option>
                          <option value="loss">Loss</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    )}
                    <div className="flex items-end">
                      <Button
                        className="w-full gap-2 h-11"
                        onClick={() => {
                          if (showReduceModal) {
                            handleReduceStock();
                          } else {
                            handleAddStock();
                          }
                        }}
                      >
                        {showReduceModal ? (
                          <>
                            <Minus className="w-4 h-4" />
                            Reduce Stock
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add Stock
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">Inventory Management</h2>
                    <span className="text-xs text-slate-400">Pharmacy ID: {pharmacyInfo?.pharmacy_id || 'Not loaded'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{medicines.length} items</span>
                    <Button size="sm" onClick={() => { setActiveTab("bincard"); setShowAddForm(true); setShowReduceModal(false); setSelectedMedicine(""); setQuantity(""); setExpiryDate(""); setError(""); }}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Stock
                    </Button>
                  </div>
                </div>
              </div>
              {error && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-green-50 border-b border-green-200">
                  <p className="text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {successMessage}
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                    <tr>
                      <th className="text-left p-5 text-sm font-bold text-slate-700">Medicine</th>
                      <th className="text-left p-5 text-sm font-bold text-slate-700">Batch No.</th>
                      <th className="text-left p-5 text-sm font-bold text-slate-700">Expiry Date</th>
                      <th className="text-left p-5 text-sm font-bold text-slate-700">Quantity</th>
                      <th className="text-left p-5 text-sm font-bold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          {loading ? 'Loading inventory...' : error ? `Error: ${error}` : 'No inventory items found. Add stock to see items here.'}
                        </td>
                      </tr>
                    ) : (
                      medicines.map((med) => (
                        <tr key={med.medicine_id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-300">
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
                                <Pill className="w-6 h-6 text-white" />
                              </div>
                              <span className="font-semibold text-slate-900">{med.brand_name || med.generic_name}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">BTH-{med.stock_id}</span>
                          </td>
                          <td className="p-5 text-slate-600 font-medium">{med.expiry_date ? new Date(med.expiry_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</td>
                          <td className="p-5">
                            <span className="text-2xl font-bold text-slate-900">{med.quantity}</span>
                          </td>
                          <td className="p-5">
                            <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                              med.quantity === 0 ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30" :
                              med.quantity < 10 ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30" :
                              "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30"
                            }`}>
                              {med.quantity === 0 ? 'Out of Stock' : med.quantity < 10 ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                        </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bin Card Tab */}
          {activeTab === "bincard" && (
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  className="gap-2"
                  onClick={() => {
                    setShowReduceModal(true);
                    setReduceMedicine("");
                  }}
                >
                  <Minus className="w-4 h-4" />
                  Reduce Stock
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setShowAddForm(true);
                    setShowReduceModal(false);
                    setSelectedMedicine("");
                    setQuantity("");
                    setExpiryDate("");
                    setError("");
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Stock
                </Button>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Add/Reduce Stock Form */}
              {(showAddForm || showReduceModal) && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-semibold text-slate-900 text-lg mb-6">
                    {showReduceModal ? "Reduce Stock from Inventory" : "Add Stock to Inventory"}
                  </h2>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Select Medicine</Label>
                      <select
                        value={showReduceModal ? reduceMedicine : selectedMedicine}
                        onChange={(e) => {
                          if (showReduceModal) {
                            setReduceMedicine(e.target.value);
                          } else {
                            setSelectedMedicine(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Choose medicine...</option>
                        {showReduceModal 
                          ? medicines.map((med) => (
                              <option key={med.medicine_id} value={med.medicine_id}>
                                {med.brand_name || med.generic_name} (Current: {med.quantity})
                              </option>
                            ))
                          : allMedicines.map((med) => (
                              <option key={med.id} value={med.id}>
                                {med.name}
                              </option>
                            ))
                        }
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Quantity</Label>
                      <Input
                        type="number"
                        value={showReduceModal ? reduceQuantity : quantity}
                        onChange={(e) => {
                          if (showReduceModal) {
                            setReduceQuantity(e.target.value);
                          } else {
                            setQuantity(e.target.value);
                          }
                        }}
                        placeholder="Enter quantity"
                        className="px-4 py-3 border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    {!showReduceModal && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Expiry Date</Label>
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="px-4 py-3 border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    )}
                    {showReduceModal && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Reason</Label>
                        <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                          <option value="">Select reason...</option>
                          <option value="sale">Sale</option>
                          <option value="damage">Damage</option>
                          <option value="expiry">Expired</option>
                          <option value="loss">Loss</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    )}
                    <div className="flex items-end">
                      <Button
                        className="w-full gap-2 h-11"
                        onClick={() => {
                          if (showReduceModal) {
                            handleReduceStock();
                          } else {
                            handleAddStock();
                          }
                        }}
                      >
                        {showReduceModal ? (
                          <>
                            <Minus className="w-4 h-4" />
                            Reduce Stock
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add Stock
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bin Card Table - Inventory */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900 text-lg">Current Inventory</h2>
                  <span className="text-sm text-slate-500">{medicines.length} items</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Medicine</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Quantity</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Expiry Date</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500">
                            No inventory yet. Add stock to get started.
                          </td>
                        </tr>
                      ) : (
                        medicines.map((med) => (
                          <tr key={med.medicine_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-medium text-slate-900">{med.brand_name || med.generic_name}</td>
                            <td className="p-4 text-slate-900">{med.quantity}</td>
                            <td className="p-4 text-slate-600">{med.expiry_date || '-'}</td>
                            <td className="p-4">
                              {med.quantity === 0 ? (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Out of Stock</span>
                              ) : med.quantity < 10 ? (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Low Stock</span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">In Stock</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900 text-lg">Recent Transactions</h2>
                  <span className="text-sm text-slate-500">{transactions.length} transactions</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Type</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Medicine</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Quantity</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500">
                            No transactions yet. Add or reduce stock to see transaction history.
                          </td>
                        </tr>
                      ) : (
                        transactions.slice(0, 10).map((tx) => (
                          <tr key={tx.transaction_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                tx.transaction_type === 'stock_in' ? "bg-green-100 text-green-700" :
                                tx.transaction_type === 'stock_out' ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>
                                {tx.transaction_type === 'stock_in' ? 'Stock In' :
                                 tx.transaction_type === 'stock_out' ? 'Stock Out' : tx.transaction_type}
                              </span>
                            </td>
                            <td className="p-4 font-medium text-slate-900">{tx.brand_name || tx.generic_name}</td>
                            <td className="p-4 text-slate-900">{tx.quantity}</td>
                            <td className="p-4 text-slate-500 text-sm">
                              {new Date(tx.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-slate-900 text-lg">Transaction History</h2>
                  <span className="text-sm text-slate-500">{transactions.length} transactions</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Type</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Medicine</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Quantity</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No transactions yet. Add or reduce stock to see transaction history.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.transaction_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tx.transaction_type === 'stock_in' ? "bg-green-100 text-green-700" :
                              tx.transaction_type === 'stock_out' ? "bg-red-100 text-red-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>
                              {tx.transaction_type === 'stock_in' ? 'Stock In' :
                               tx.transaction_type === 'stock_out' ? 'Stock Out' : tx.transaction_type}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-slate-900">{tx.brand_name || tx.generic_name}</td>
                          <td className="p-4 text-slate-900">{tx.quantity}</td>
                          <td className="p-4 text-slate-500 text-sm">
                            {new Date(tx.created_at).toLocaleString()}
                          </td>
                          <td className="p-4 text-slate-600 text-sm">{tx.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 text-lg mb-6">Transaction Overview</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <div>
                      <p className="text-sm text-purple-700">Stock In</p>
                      <p className="text-2xl font-bold text-purple-900">{transactions.filter(t => t.transaction_type === 'stock_in').length} transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div>
                      <p className="text-sm text-blue-700">Stock Out</p>
                      <p className="text-2xl font-bold text-blue-900">{transactions.filter(t => t.transaction_type === 'stock_out').length} transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <div>
                      <p className="text-sm text-emerald-700">Total Transactions</p>
                      <p className="text-2xl font-bold text-emerald-900">{transactions.length} transactions</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 text-lg mb-6">Inventory Summary</h2>
                <div className="space-y-4">
                  {medicines.slice(0, 4).map((med, index) => (
                    <div key={med.medicine_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{med.brand_name || med.generic_name}</p>
                          <p className="text-sm text-slate-500">BTH-{med.stock_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{med.quantity} units</p>
                        <p className={`text-sm ${med.quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {med.quantity < 10 ? 'Low Stock' : 'In Stock'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {medicines.length === 0 && (
                    <p className="text-center text-slate-500 py-4">No inventory data</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Inventory Report</h3>
                <p className="text-sm text-slate-500 mb-4">Complete inventory status and stock levels</p>
                <Button variant="outline" className="w-full">Generate</Button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Sales Report</h3>
                <p className="text-sm text-slate-500 mb-4">Daily, weekly, and monthly sales analysis</p>
                <Button variant="outline" className="w-full">Generate</Button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Transaction Report</h3>
                <p className="text-sm text-slate-500 mb-4">Complete transaction history and logs</p>
                <Button variant="outline" className="w-full">Generate</Button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-slate-900 text-lg">All Notifications</h2>
                  <span className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
                    {notifications.length} unread
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNotifications([])}
                >
                  Mark All as Read
                </Button>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-500">No notifications at the moment. Your inventory looks good.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          notif.type === "error" ? "bg-red-100" :
                          notif.type === "warning" ? "bg-yellow-100" :
                          notif.type === "success" ? "bg-green-100" :
                          "bg-blue-100"
                        }`}>
                          {notif.type === "error" ? (
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          ) : notif.type === "warning" ? (
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                          ) : notif.type === "success" ? (
                            <Check className="w-6 h-6 text-green-600" />
                          ) : (
                            <Bell className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{notif.message}</p>
                          <p className="text-sm text-slate-500 mt-1">{notif.time}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-400 hover:text-slate-600"
                          onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Pharmacy Info Card */}
              {pharmacyInfo && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                      <Pill className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{pharmacyInfo.pharmacy_name}</h2>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{pharmacyInfo.address}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {pharmacyInfo.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {pharmacyInfo.phone}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Logged in as</p>
                      <p className="font-semibold text-slate-900">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Management */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 text-lg mb-6">Stock Management</h2>
                <div className="flex gap-4">
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setShowReduceModal(true);
                      setShowAddForm(false);
                      setReduceMedicine("");
                      setReduceQuantity("");
                    }}
                  >
                    <Minus className="w-4 h-4" />
                    Reduce Stock
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setShowAddForm(true);
                      setShowReduceModal(false);
                      setSelectedMedicine("");
                      setQuantity("");
                      setExpiryDate("");
                      setError("");
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Stock
                  </Button>
                </div>

                {/* Add/Reduce Stock Form */}
                {(showAddForm || showReduceModal) && (
                  <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      {showReduceModal ? "Reduce Stock from Inventory" : "Add Stock to Inventory"}
                    </h3>
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                        <p className="text-red-700 text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {error}
                        </p>
                      </div>
                    )}
                    {successMessage && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                        <p className="text-green-700 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {successMessage}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Select Medicine</Label>
                        <select
                          value={showReduceModal ? reduceMedicine : selectedMedicine}
                          onChange={(e) => {
                            if (showReduceModal) {
                              setReduceMedicine(e.target.value);
                            } else {
                              setSelectedMedicine(e.target.value);
                            }
                          }}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="">Choose medicine...</option>
                          {showReduceModal 
                            ? medicines.map((med) => (
                                <option key={med.medicine_id} value={med.medicine_id}>
                                  {med.brand_name || med.generic_name} (Current: {med.quantity})
                                </option>
                              ))
                            : allMedicines.map((med) => (
                                <option key={med.id} value={med.id}>
                                  {med.name}
                                </option>
                              ))
                          }
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Quantity</Label>
                        <Input
                          type="number"
                          value={showReduceModal ? reduceQuantity : quantity}
                          onChange={(e) => {
                            if (showReduceModal) {
                              setReduceQuantity(e.target.value);
                            } else {
                              setQuantity(e.target.value);
                            }
                          }}
                          placeholder="Enter quantity"
                          className="px-4 py-3 border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      {!showReduceModal && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Expiry Date</Label>
                          <Input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="px-4 py-3 border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      )}
                      {showReduceModal && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Reason</Label>
                          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                            <option value="">Select reason...</option>
                            <option value="sale">Sale</option>
                            <option value="damage">Damage</option>
                            <option value="expiry">Expired</option>
                            <option value="loss">Loss</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      )}
                      <div className="flex items-end">
                        <Button
                          className="w-full gap-2 h-11"
                          onClick={() => {
                            if (showReduceModal) {
                              handleReduceStock();
                            } else {
                              handleAddStock();
                            }
                          }}
                        >
                          {showReduceModal ? (
                            <>
                              <Minus className="w-4 h-4" />
                              Reduce Stock
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Add Stock
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
