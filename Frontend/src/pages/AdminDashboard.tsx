import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LayoutDashboard, Building2, CreditCard, Megaphone,
  Users, CheckCircle, XCircle, Clock, AlertCircle, Calendar,
  Eye, Download, Filter, Search, ChevronDown, Bell, Settings,
  LogOut, Star, TrendingUp, TrendingDown, MoreVertical,
  Phone, Mail, MapPin, FileText, Image as ImageIcon,
  UserCheck, UserX, RefreshCw, Loader2, Store
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
// Types
interface Pharmacy {
  pharmacy_id: string;
  pharmacy_name: string;
  latitude: number;
  longitude: number;
  address: string;
  contact_phone: string;
  contact_email: string;
  operating_hours: string;
  user_id: string;
  is_verified: boolean;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  verified_by_name?: string;
  owner_name?: string;
  license_image?: string;
  license_id?: string;
}

interface License {
  license_id: string;
  license_number: string;
  issue_date: string;
  expiry_date: string;
  license_document_url: string;
  pharmacy_id: string;
  verification_status: string;
}

interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  role_id: string;
  role_name: string;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
  onClick?: () => void;
}

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('analysis');
  const [approvalView, setApprovalView] = useState<'pending' | 'all' | 'licenses'>('pending');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [selectedPharmacyForAction, setSelectedPharmacyForAction] = useState<Pharmacy | null>(null);
  // User management states
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Pharmacy management states
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [licenses, setLicenses] = useState<Record<string, License>>({});
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [showPharmaciesModal, setShowPharmaciesModal] = useState(false);
  const [pharmacyModalType, setPharmacyModalType] = useState<'total' | 'active' | 'inactive' | 'subscribed'>('total');
  const [pharmacySearchTerm, setPharmacySearchTerm] = useState('');
  const navigate = useNavigate();

// Show logout confirmation modal
const handleLogoutClick = () => {
  setShowLogoutConfirm(true);
};

// Execute logout when confirmed
const confirmLogout = () => {
  // Clear all localStorage items
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('pendingUser');
  localStorage.removeItem('pharmacyData');
  
  // Clear sessionStorage if you're using it
  sessionStorage.clear();
  
  // Show success message
  toast.success('Logged out successfully');
  
  // Close the confirmation modal
  setShowLogoutConfirm(false);
  
  // Navigate to home page
  navigate('/');
};

// Cancel logout
const cancelLogout = () => {
  setShowLogoutConfirm(false);
};

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPharmacies: 0,
    activePharmacies: 0,
    inactivePharmacies: 0,
    subscribedPharmacies: 0,
    totalAds: 0
  });

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.users);
        setStats(prev => ({ ...prev, totalUsers: response.data.count }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch pharmacies from backend
  const fetchPharmacies = async () => {
    setLoadingPharmacies(true);
    try {
      const response = await axios.get('http://localhost:5000/api/pharmacies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setPharmacies(response.data);
        
        // Fetch licenses for each pharmacy
        const licensesMap: Record<string, License> = {};
        for (const pharmacy of response.data) {
          try {
            const licenseResponse = await axios.get(`http://localhost:5000/api/pharmacies/${pharmacy.pharmacy_id}/licenses`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (licenseResponse.data && licenseResponse.data.length > 0) {
              licensesMap[pharmacy.pharmacy_id] = licenseResponse.data[0];
            }
          } catch (error) {
            console.error(`Error fetching license for pharmacy ${pharmacy.pharmacy_id}:`, error);
          }
        }
        setLicenses(licensesMap);
        
        // Calculate stats
        const active = response.data.filter((p: Pharmacy) => p.is_verified === true).length;
        const inactive = response.data.filter((p: Pharmacy) => p.is_verified === false).length;
        
        setStats({
          totalUsers: stats.totalUsers,
          totalPharmacies: response.data.length,
          activePharmacies: active,
          inactivePharmacies: inactive,
          subscribedPharmacies: Math.floor(response.data.length * 0.45),
          totalAds: stats.totalAds
        });
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast.error('Failed to fetch pharmacies');
    } finally {
      setLoadingPharmacies(false);
    }
  };

// Approve pharmacy
// Show approve confirmation
const handleApproveClick = (pharmacy: Pharmacy) => {
  setSelectedPharmacyForAction(pharmacy);
  setShowApproveConfirm(true);
};

// Execute approve when confirmed
const confirmApprove = async () => {
  if (!selectedPharmacyForAction) return;
  
  setIsProcessing(true);
  try {
    const token = localStorage.getItem('token');
    console.log('📤 Approving pharmacy:', selectedPharmacyForAction.pharmacy_id);
    
    if (!token) {
      toast.error('No authentication token found. Please login again.');
      return;
    }
    
    const response = await axios.put(
      `http://localhost:5000/api/pharmacies/${selectedPharmacyForAction.pharmacy_id}/verify`,
      { is_verified: true },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('✅ Approve response:', response.data);
    
    if (response.data.success) {
      toast.success(`${selectedPharmacyForAction.pharmacy_name} approved successfully!`);
      // Refresh the pharmacies list
      await fetchPharmacies();
    } else {
      toast.error(response.data.message || 'Failed to approve pharmacy');
    }
  } catch (error: any) {
    console.error('❌ Error approving pharmacy:', error);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to approve pharmacy';
    toast.error(errorMessage);
  } finally {
    setIsProcessing(false);
    setShowApproveConfirm(false);
    setSelectedPharmacyForAction(null);
  }
};

// Cancel approve
const cancelApprove = () => {
  setShowApproveConfirm(false);
  setSelectedPharmacyForAction(null);
};

// Show reject confirmation
const handleRejectClick = (pharmacy: Pharmacy) => {
  setSelectedPharmacyForAction(pharmacy);
  setShowRejectConfirm(true);
};

// Execute reject when confirmed
const confirmReject = async () => {
  if (!selectedPharmacyForAction) return;
  
  setIsProcessing(true);
  try {
    const token = localStorage.getItem('token');
    console.log('📤 Rejecting pharmacy:', selectedPharmacyForAction.pharmacy_id);
    
    if (!token) {
      toast.error('No authentication token found. Please login again.');
      return;
    }
    
    const response = await axios.delete(
      `http://localhost:5000/api/pharmacies/${selectedPharmacyForAction.pharmacy_id}`,
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('✅ Reject response:', response.data);
    
    if (response.data.success) {
      toast.success(`${selectedPharmacyForAction.pharmacy_name} rejected and removed successfully!`);
      // Refresh the pharmacies list
      await fetchPharmacies();
    } else {
      toast.error(response.data.message || 'Failed to reject pharmacy');
    }
  } catch (error: any) {
    console.error('❌ Error rejecting pharmacy:', error);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to reject pharmacy';
    toast.error(errorMessage);
  } finally {
    setIsProcessing(false);
    setShowRejectConfirm(false);
    setSelectedPharmacyForAction(null);
  }
};

// Cancel reject
const cancelReject = () => {
  setShowRejectConfirm(false);
  setSelectedPharmacyForAction(null);
};
// Reject pharmacy

  // Fetch all data on mount
  useEffect(() => {
    fetchUsers();
    fetchPharmacies();
  }, []);

  const navItems = [
    { id: 'analysis', label: 'Analysis', icon: <LayoutDashboard size={20} /> },
    { id: 'pharmacies', label: 'Manage Pharmacies', icon: <Building2 size={20} /> },
    { id: 'subscriptions', label: 'Manage Subscription', icon: <CreditCard size={20} /> },
    { id: 'ads', label: 'Manage Ads', icon: <Megaphone size={20} /> },
  ];

  const statCards: StatCard[] = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: <Users size={28} />, 
      trend: 12.5, 
      color: 'from-blue-500 to-cyan-500',
      onClick: () => {
        fetchUsers();
        setShowUsersModal(true);
      }
    },
    { 
      title: 'Total Pharmacies', 
      value: stats.totalPharmacies, 
      icon: <Building2 size={28} />, 
      trend: 8.3, 
      color: 'from-emerald-500 to-teal-500',
      onClick: () => {
        fetchPharmacies();
        setPharmacyModalType('total');
        setShowPharmaciesModal(true);
      }
    },
    { 
      title: 'Active Pharmacies', 
      value: stats.activePharmacies, 
      icon: <CheckCircle size={28} />, 
      trend: 15.2, 
      color: 'from-green-500 to-emerald-500',
      onClick: () => {
        fetchPharmacies();
        setPharmacyModalType('active');
        setShowPharmaciesModal(true);
      }
    },
    { 
      title: 'Inactive Pharmacies', 
      value: stats.inactivePharmacies, 
      icon: <Clock size={28} />, 
      trend: -5.1, 
      color: 'from-orange-500 to-amber-500',
      onClick: () => {
        fetchPharmacies();
        setPharmacyModalType('inactive');
        setShowPharmaciesModal(true);
      }
    },
    { 
      title: 'Subscribed Pharmacies', 
      value: stats.subscribedPharmacies, 
      icon: <Star size={28} />, 
      trend: 22.4, 
      color: 'from-purple-500 to-pink-500',
      onClick: () => {
        fetchPharmacies();
        setPharmacyModalType('subscribed');
        setShowPharmaciesModal(true);
      }
    },
    { 
      title: 'Total Ads', 
      value: stats.totalAds, 
      icon: <Megaphone size={28} />, 
      trend: 45.8, 
      color: 'from-indigo-500 to-purple-500' 
    },
  ];

  const chartData = [
    { month: 'Jan', users: 4000, pharmacies: 240, ads: 40 },
    { month: 'Feb', users: 4800, pharmacies: 280, ads: 55 },
    { month: 'Mar', users: 5200, pharmacies: 310, ads: 68 },
    { month: 'Apr', users: 5800, pharmacies: 340, ads: 82 },
    { month: 'May', users: 6200, pharmacies: 360, ads: 95 },
    { month: 'Jun', users: 6800, pharmacies: 380, ads: 110 },
  ];

  const getFilteredPharmacies = () => {
    switch (pharmacyModalType) {
      case 'active':
        return pharmacies.filter(p => p.is_verified === true);
      case 'inactive':
        return pharmacies.filter(p => p.is_verified === false);
      case 'subscribed':
        return pharmacies.filter((_, index) => index % 2 === 0);
      default:
        return pharmacies;
    }
  };

  const filteredPharmacies = getFilteredPharmacies().filter(pharmacy =>
    pharmacy.pharmacy_name?.toLowerCase().includes(pharmacySearchTerm.toLowerCase()) ||
    pharmacy.contact_email?.toLowerCase().includes(pharmacySearchTerm.toLowerCase()) ||
    pharmacy.contact_phone?.includes(pharmacySearchTerm)
  );

  // Get pending pharmacies (inactive/unverified)
  const pendingPharmacies = pharmacies.filter(p => p.is_verified === false);
  
  // Get all pharmacies for the all view
  const allPharmaciesList = pharmacies.filter(p => 
    (statusFilter === 'all' || 
      (statusFilter === 'approved' && p.is_verified === true) ||
      (statusFilter === 'pending' && p.is_verified === false)) &&
    p.pharmacy_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'admin': return 'bg-purple-500/20 text-purple-400';
      case 'pharmacy': return 'bg-emerald-500/20 text-emerald-400';
      case 'user': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="relative h-full bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl z-20"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              {sidebarOpen && (
                <span className="text-white font-semibold text-lg">Pharmalink</span>
              )}
            </motion.div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white/70 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-8">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-white/80 hover:text-white transition-all relative group ${
                  activeTab === item.id ? 'text-white' : ''
                }`}
                whileHover={{ x: 5 }}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full"
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                {sidebarOpen && (
                  <span className="relative z-10 font-medium">{item.label}</span>
                )}
              </motion.button>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-6 border-t border-white/20">
            <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 text-white/70 hover:text-white transition-colors">
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
              
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-white/60">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 bg-white/10 backdrop-blur rounded-xl text-white/70 hover:text-white transition-colors">
                <Bell size={20} />
              </button>
              <button className="p-2 bg-white/10 backdrop-blur rounded-xl text-white/70 hover:text-white transition-colors">
                <Settings size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-medium">Admin User</p>
                  <p className="text-white/60 text-sm">Super Admin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Dashboard - LARGER CARDS */}
          {activeTab === 'analysis' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Stats Grid - Larger cards with increased padding and icon sizes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group cursor-pointer"
                    onClick={stat.onClick}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all hover:scale-105">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-4 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                          {stat.icon}
                        </div>
                        {stat.trend && (
                          <div className={`flex items-center gap-1 text-sm ${stat.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stat.trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{Math.abs(stat.trend)}%</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-white/60 text-sm mb-2">{stat.title}</h3>
                      <p className="text-white text-4xl font-bold">
                        <CountUp end={stat.value} duration={2.5} separator="," />
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4 text-lg">Growth Overview</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                      <YAxis stroke="rgba(255,255,255,0.6)" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                      <Line type="monotone" dataKey="pharmacies" stroke="#F8FAFC" strokeWidth={2} dot={{ fill: '#F8FAFC' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4 text-lg">Monthly Performance</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                      <YAxis stroke="rgba(255,255,255,0.6)" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="ads" fill="#ec4899" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* Manage Pharmacies - Updated with real data */}
          {activeTab === 'pharmacies' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Action Selector Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setApprovalView('pending')}
                  className={`relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    approvalView === 'pending' ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <Clock size={24} className="text-orange-400" />
                    </div>
                    <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {pendingPharmacies.length} Pending
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Pharmacy Approval</h3>
                  <p className="text-white/60 text-sm">Review and approve pending pharmacies</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setApprovalView('all')}
                  className={`relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    approvalView === 'all' ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Building2 size={24} className="text-blue-400" />
                    </div>
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {stats.totalPharmacies} Total
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">See All Pharmacies</h3>
                  <p className="text-white/60 text-sm">View and manage all registered pharmacies</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setApprovalView('licenses')}
                  className={`relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    approvalView === 'licenses' ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Calendar size={24} className="text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Annual Licence Checking</h3>
                  <p className="text-white/60 text-sm">Monitor license expirations and compliance</p>
                </motion.div>
              </div>

              {/* Pharmacy Approval View - Show pending/inactive pharmacies */}
              {approvalView === 'pending' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Pending Approvals</h2>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          placeholder="Search pharmacies..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingPharmacies
                      .filter(p => p.pharmacy_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((pharmacy) => (
                      <motion.div
                        key={pharmacy.pharmacy_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-emerald-400/50 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-1">{pharmacy.pharmacy_name}</h3>
                            <p className="text-white/60 text-sm">Owner: {pharmacy.owner_name}</p>
                          </div>
                          <div className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">
                            Pending
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Mail size={14} />
                            <span>{pharmacy.contact_email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Phone size={14} />
                            <span>{pharmacy.contact_phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <MapPin size={14} />
                            <span>{pharmacy.address}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-white/70 text-sm mb-2">License Document</div>
                          <div
                            onClick={() => {
                              setSelectedPharmacy(pharmacy);
                              setShowLicenseModal(true);
                            }}
                            className="relative w-full h-32 bg-white/5 rounded-xl overflow-hidden cursor-pointer group"
                          >
                            {licenses[pharmacy.pharmacy_id]?.license_document_url ? (
                              <img
                                src={licenses[pharmacy.pharmacy_id].license_document_url}
                                alt="License"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <FileText size={32} className="text-white/40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye size={24} className="text-white" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => handleApproveClick(pharmacy)}
    disabled={isProcessing}
    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-xl font-semibold disabled:opacity-50"
  >
    Approve
  </motion.button>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => handleRejectClick(pharmacy)}
    disabled={isProcessing}
    className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-xl font-semibold border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
  >
    Reject
  </motion.button>
</div>
                      </motion.div>
                    ))}
                  </div>
                  {pendingPharmacies.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle size={48} className="text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">No pending pharmacies</p>
                    </div>
                  )}
                </div>
              )}

              {/* See All Pharmacies View - List all pharmacies with details */}
              {approvalView === 'all' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                    <div className="flex gap-2">
                      {['all', 'approved', 'pending'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-4 py-2 rounded-xl capitalize transition-all ${
                            statusFilter === status
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                        >
                          {status === 'approved' ? 'Verified' : status}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search pharmacies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5 backdrop-blur rounded-xl">
                        <tr className="border-b border-white/10">
                          <th className="text-left p-4 text-white/60 font-medium">Pharmacy</th>
                          <th className="text-left p-4 text-white/60 font-medium">Address</th>
                          <th className="text-left p-4 text-white/60 font-medium">Contact</th>
                          <th className="text-left p-4 text-white/60 font-medium">Status</th>
                          <th className="text-left p-4 text-white/60 font-medium">Registered</th>
                          <th className="text-left p-4 text-white/60 font-medium">Verified</th>
                          <th className="text-left p-4 text-white/60 font-medium">Verified By</th>
                          <th className="text-left p-4 text-white/60 font-medium">License</th>
                          <th className="text-left p-4 text-white/60 font-medium">Owner</th>
                          <th className="text-left p-4 text-white/60 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPharmaciesList.map((pharmacy) => (
                          <motion.tr
                            key={pharmacy.pharmacy_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-white/10 hover:bg-white/5 transition-colors"
                          >
                            <td className="p-4">
                              <p className="text-white font-medium">{pharmacy.pharmacy_name}</p>
                             </td>
                            <td className="p-4 text-white/80 max-w-xs truncate">{pharmacy.address}</td>
                            <td className="p-4">
                              <div className="text-white/80 text-sm">{pharmacy.contact_phone}</div>
                              <div className="text-white/60 text-xs">{pharmacy.contact_email}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                pharmacy.is_verified ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {pharmacy.is_verified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="p-4 text-white/60 text-sm">
                              {new Date(pharmacy.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-white/60 text-sm">
                              {pharmacy.verified_at ? new Date(pharmacy.verified_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-4 text-white/80 text-sm">
                              {pharmacy.verified_by_name || '-'}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setSelectedPharmacy(pharmacy);
                                  setShowLicenseModal(true);
                                }}
                                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                            <td className="p-4 text-white/80 text-sm">{pharmacy.owner_name}</td>
                            <td className="p-4">
                              <button className="text-white/60 hover:text-white transition-colors">
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Annual Licence Checking View - Keep as is */}
              {approvalView === 'licenses' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur rounded-2xl p-6 border border-green-500/30">
                      <div className="text-3xl font-bold text-green-400 mb-2">245</div>
                      <div className="text-white/80">Valid Licenses</div>
                      <div className="text-white/40 text-sm">Active & compliant</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur rounded-2xl p-6 border border-orange-500/30">
                      <div className="text-3xl font-bold text-orange-400 mb-2">67</div>
                      <div className="text-white/80">Expiring Soon</div>
                      <div className="text-white/40 text-sm">Within 30 days</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur rounded-2xl p-6 border border-red-500/30">
                      <div className="text-3xl font-bold text-red-400 mb-2">30</div>
                      <div className="text-white/80">Expired Licenses</div>
                      <div className="text-white/40 text-sm">Require immediate action</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Manage Subscriptions - Keep as is */}
          {activeTab === 'subscriptions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur rounded-2xl p-6 border border-purple-500/30">
                  <h3 className="text-white font-semibold mb-2">Premium Plan</h3>
                  <p className="text-3xl font-bold text-white mb-2">124</p>
                  <p className="text-white/60">Active Subscriptions</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur rounded-2xl p-6 border border-blue-500/30">
                  <h3 className="text-white font-semibold mb-2">Basic Plan</h3>
                  <p className="text-3xl font-bold text-white mb-2">32</p>
                  <p className="text-white/60">Active Subscriptions</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur rounded-2xl p-6 border border-orange-500/30">
                  <h3 className="text-white font-semibold mb-2">Expiring Soon</h3>
                  <p className="text-3xl font-bold text-white mb-2">18</p>
                  <p className="text-white/60">Within 30 days</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-white font-semibold text-xl mb-4">Subscription Overview</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Premium', value: 124, color: '#F8FAFC' },
                        { name: 'Basic', value: 32, color: '#06b6d4' },
                        { name: 'None', value: 186, color: '#0EA5E9' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={150}
                      fill="#F59E0B"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#F8FAFC" />
                      <Cell fill="#06b6d4" />
                      <Cell fill="#0EA5E9" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Manage Ads - Keep as is */}
          {activeTab === 'ads' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 hover:border-emerald-400/50 transition-all"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                      <img
                        src={`https://via.placeholder.com/400x300?text=Ad+${i}`}
                        alt="Ad"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold">
                        Active
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-1">Special Promotion {i}</h3>
                      <p className="text-white/60 text-sm mb-3">City Health Pharmacy</p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <span className="text-white/40 text-xs">📊 1.2k views</span>
                          <span className="text-white/40 text-xs">❤️ 89 clicks</span>
                        </div>
                        <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                          Manage
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Users List Modal */}
      <AnimatePresence>
        {showUsersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUsersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-6xl w-full max-h-[85vh] bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Users size={28} />
                      System Users
                    </h2>
                    <p className="text-white/60 mt-1">Total {users.length} users registered</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={fetchUsers}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                    >
                      <RefreshCw size={20} className={loadingUsers ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => setShowUsersModal(false)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-800/50 backdrop-blur">
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-white/60 font-medium">User</th>
                        <th className="text-left p-4 text-white/60 font-medium">Email</th>
                        <th className="text-left p-4 text-white/60 font-medium">Phone</th>
                        <th className="text-left p-4 text-white/60 font-medium">Role</th>
                        <th className="text-left p-4 text-white/60 font-medium">Status</th>
                        <th className="text-left p-4 text-white/60 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(user => 
                          user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          user.role_name?.toLowerCase().includes(userSearchTerm.toLowerCase())
                        )
                        .map((user, index) => (
                          <motion.tr
                            key={user.user_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-white/10 hover:bg-white/5 transition-colors group"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    {user.full_name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">{user.full_name}</p>
                                  <p className="text-white/40 text-sm">ID: {user.user_id?.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-white/40" />
                                <span className="text-white/80">{user.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-white/40" />
                                <span className="text-white/80">{user.phone || 'Not provided'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role_name)}`}>
                                {user.role_name || 'User'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                                user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {user.is_active ? <UserCheck size={12} /> : <UserX size={12} />}
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-white/40" />
                                <span className="text-white/60 text-sm">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                )}
                
                {!loadingUsers && users.length === 0 && (
                  <div className="text-center py-20">
                    <Users size={48} className="text-white/20 mx-auto mb-4" />
                    <p className="text-white/40">No users found</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur p-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <div className="text-white/60 text-sm">
                    Showing {users.filter(u => 
                      u.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                    ).length} of {users.length} users
                  </div>
                  <button
                    onClick={() => setShowUsersModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pharmacies List Modal */}
      <AnimatePresence>
        {showPharmaciesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPharmaciesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-6xl w-full max-h-[85vh] bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-6 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Building2 size={28} />
                      {pharmacyModalType === 'total' && 'All Pharmacies'}
                      {pharmacyModalType === 'active' && 'Active Pharmacies'}
                      {pharmacyModalType === 'inactive' && 'Inactive Pharmacies'}
                      {pharmacyModalType === 'subscribed' && 'Subscribed Pharmacies'}
                    </h2>
                    <p className="text-white/60 mt-1">
                      Total {filteredPharmacies.length} pharmacies {pharmacyModalType !== 'total' && `(${pharmacyModalType})`}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={fetchPharmacies}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                    >
                      <RefreshCw size={20} className={loadingPharmacies ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => setShowPharmaciesModal(false)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search pharmacies by name, email, or phone..."
                    value={pharmacySearchTerm}
                    onChange={(e) => setPharmacySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6">
                {loadingPharmacies ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredPharmacies.map((pharmacy, index) => (
                      <motion.div
                        key={pharmacy.pharmacy_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/5 backdrop-blur rounded-xl p-5 border border-white/10 hover:border-emerald-500/50 transition-all hover:bg-white/10 cursor-pointer"
                        onClick={() => {
                          setSelectedPharmacy(pharmacy);
                          setShowLicenseModal(true);
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-white font-semibold text-lg">{pharmacy.pharmacy_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            pharmacy.is_verified ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {pharmacy.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-white/70">
                            <Phone size={14} className="text-emerald-400" />
                            <span>{pharmacy.contact_phone || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <Mail size={14} className="text-emerald-400" />
                            <span>{pharmacy.contact_email || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <Calendar size={14} className="text-emerald-400" />
                            <span>Registered: {new Date(pharmacy.created_at).toLocaleDateString()}</span>
                          </div>
                          {pharmacy.verified_at && (
                            <div className="flex items-center gap-2 text-white/70">
                              <CheckCircle size={14} className="text-emerald-400" />
                              <span>Verified: {new Date(pharmacy.verified_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          {pharmacy.owner_name && (
                            <div className="flex items-center gap-2 text-white/70">
                              <Users size={14} className="text-emerald-400" />
                              <span>Owner: {pharmacy.owner_name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPharmacy(pharmacy);
                              setShowLicenseModal(true);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 transition-colors"
                          >
                            <Eye size={14} />
                            View Details
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {!loadingPharmacies && filteredPharmacies.length === 0 && (
                  <div className="text-center py-20">
                    <Building2 size={48} className="text-white/20 mx-auto mb-4" />
                    <p className="text-white/40">No pharmacies found</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur p-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <div className="text-white/60 text-sm">
                    Showing {filteredPharmacies.length} of {getFilteredPharmacies().length} pharmacies
                  </div>
                  <button
                    onClick={() => setShowPharmaciesModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pharmacy Details Modal */}
      <AnimatePresence>
        {showLicenseModal && selectedPharmacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLicenseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl p-6 border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLicenseModal(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
              >
                <X size={24} />
              </button>
              <h3 className="text-white text-2xl font-bold mb-4">Pharmacy Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm">Pharmacy Name</p>
                  <p className="text-white font-semibold">{selectedPharmacy.pharmacy_name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Contact Email</p>
                  <p className="text-white">{selectedPharmacy.contact_email}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Contact Phone</p>
                  <p className="text-white">{selectedPharmacy.contact_phone}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Address</p>
                  <p className="text-white">{selectedPharmacy.address}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Operating Hours</p>
                  <p className="text-white">{selectedPharmacy.operating_hours || 'Not specified'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm">Registered Date</p>
                    <p className="text-white">{new Date(selectedPharmacy.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Verification Status</p>
                    <p className={`font-semibold ${selectedPharmacy.is_verified ? 'text-green-400' : 'text-orange-400'}`}>
                      {selectedPharmacy.is_verified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>
                {selectedPharmacy.verified_at && (
                  <div>
                    <p className="text-white/60 text-sm">Verified Date</p>
                    <p className="text-white">{new Date(selectedPharmacy.verified_at).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedPharmacy.verified_by_name && (
                  <div>
                    <p className="text-white/60 text-sm">Verified By</p>
                    <p className="text-white">{selectedPharmacy.verified_by_name}</p>
                  </div>
                )}
                {selectedPharmacy.latitude && selectedPharmacy.longitude && (
                  <div>
                    <p className="text-white/60 text-sm">Location Coordinates</p>
                    <p className="text-white">Lat: {selectedPharmacy.latitude}, Lng: {selectedPharmacy.longitude}</p>
                  </div>
                )}
                {licenses[selectedPharmacy.pharmacy_id] && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white font-semibold mb-2">License Information</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-white/60 text-sm">License Number</p>
                        <p className="text-white">{licenses[selectedPharmacy.pharmacy_id].license_number}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/60 text-sm">Issue Date</p>
                          <p className="text-white">{new Date(licenses[selectedPharmacy.pharmacy_id].issue_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Expiry Date</p>
                          <p className="text-white">{new Date(licenses[selectedPharmacy.pharmacy_id].expiry_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">License Document</p>
                        <a 
                          href={licenses[selectedPharmacy.pharmacy_id].license_document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                        >
                          <FileText size={14} />
                          View License Document
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Logout Confirmation Modal */}
<AnimatePresence>
  {showLogoutConfirm && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={cancelLogout}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <LogOut size={28} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Confirm Logout</h3>
          </div>
          
          <p className="text-white/70 mb-6">
            Are you sure you want to logout? You will need to login again to access your account.
          </p>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={confirmLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 rounded-xl font-semibold"
            >
              Yes, Logout
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={cancelLogout}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-semibold border border-white/20 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{/* Approve Confirmation Modal */}
<AnimatePresence>
  {showApproveConfirm && selectedPharmacyForAction && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={cancelApprove}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-full">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Confirm Approval</h3>
          </div>
          
          <p className="text-white/70 mb-2">
            Are you sure you want to approve <strong className="text-emerald-400">{selectedPharmacyForAction.pharmacy_name}</strong>?
          </p>
          <p className="text-white/50 text-sm mb-6">
            This pharmacy will be verified and the owner will be notified.
          </p>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={confirmApprove}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Approving...
                </div>
              ) : (
                'Yes, Approve'
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={cancelApprove}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-semibold border border-white/20 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* Reject Confirmation Modal */}
<AnimatePresence>
  {showRejectConfirm && selectedPharmacyForAction && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={cancelReject}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <XCircle size={28} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Confirm Rejection</h3>
          </div>
          
          <p className="text-white/70 mb-2">
            Are you sure you want to reject <strong className="text-red-400">{selectedPharmacyForAction.pharmacy_name}</strong>?
          </p>
          <p className="text-white/50 text-sm mb-6">
            This action cannot be undone. The pharmacy will be permanently removed from the system.
          </p>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={confirmReject}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Rejecting...
                </div>
              ) : (
                'Yes, Reject'
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={cancelReject}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-semibold border border-white/20 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

