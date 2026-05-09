import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill, ArrowLeft, Plus, Search, Edit, Trash2, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function BinCardPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const pharmacy = await api.getPharmacyByEmail(user.email);
      const inventoryData = await api.getPharmacyInventory(pharmacy.pharmacy_id);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredInventory.length;
  const lowStock = filteredInventory.filter(item => item.quantity > 0 && item.quantity < 10).length;
  const outOfStock = filteredInventory.filter(item => item.quantity === 0).length;

  const getStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (quantity < 10) return { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { label: 'In Stock', className: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Link>
              <h1 className="text-2xl font-bold">Bin Card - Inventory Management</h1>
            </div>
            <Button className="gap-2" onClick={fetchInventory}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search medicines by name..."
              className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-sm">Total Items</p>
            <p className="text-2xl font-bold text-foreground">{totalItems}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-sm">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">{lowStock}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-sm">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
          </div>
        </div>

        {/* Bin Card Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">Medicine Name</th>
                    <th className="text-left p-4 font-semibold text-foreground">Batch No.</th>
                    <th className="text-left p-4 font-semibold text-foreground">Expiry Date</th>
                    <th className="text-left p-4 font-semibold text-foreground">Quantity</th>
                    <th className="text-left p-4 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">No inventory found</td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const status = getStatus(item.quantity);
                      const StatusIcon = status.icon;
                      const expiryDate = item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A';
                      return (
                        <tr key={item.stock_id} className="border-b border-border">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Pill className="w-5 h-5 text-primary" />
                              <div>
                                <span className="font-medium text-foreground block">{item.generic_name}</span>
                                <span className="text-sm text-muted-foreground">{item.brand_name} {item.strength}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">BTH-{item.stock_id}</td>
                          <td className="p-4 text-muted-foreground">{expiryDate}</td>
                          <td className="p-4 font-medium text-foreground">{item.quantity}</td>
                          <td className="p-4">
                            <span className={`${status.className} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
