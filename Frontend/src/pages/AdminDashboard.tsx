import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LayoutDashboard, Building2, CreditCard, Megaphone,
  Users, CheckCircle, XCircle, Clock, AlertCircle, Calendar,
  Eye, Download, Filter, Search, ChevronDown, Bell, Settings,
  LogOut, Star, TrendingUp, TrendingDown, MoreVertical,
  Phone, Mail, MapPin, FileText, Image as ImageIcon,
  UserCheck, UserX, RefreshCw, Loader2, Store,
  Plus, Edit, Trash2, DollarSign, Tag, Save, Image, Play
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

interface SubscriptionPlan {
  plan_id: string;
  plan_name: string;
  description: string;
  duration_days: number;
  price: number;
  created_at: string;
}

interface Subscription {
  subscription_id: string;
  plan_id: string;
  pharmacy_id: string;
  receipt_image_url: string;
  verification_status: boolean;
  verified_by: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  plan_name?: string;
  pharmacy_name?: string;
}

interface AdvertisementPlan {
  plan_id: string;
  plan_name: string;
  description: string;
  duration_days: number;
  price: number;
  created_at: string;
}

interface Advertisement {
  ad_id: string;
  plan_id: string;
  pharmacy_id: string;
  ad_title: string;
  ad_content: string;
  advertisement_image: string;
  receipt_image_url: string;
  verification_status: boolean;
  approved_by: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  plan_name?: string;
  pharmacy_name?: string;
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
  
  // Subscription management states
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionView, setSubscriptionView] = useState<'plans' | 'requests' | 'list'>('plans');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planFormData, setPlanFormData] = useState({
    plan_name: '',
    description: '',
    duration_days: 30,
    price: 0
  });
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showApproveSubscriptionModal, setShowApproveSubscriptionModal] = useState(false);
  const [selectedPlanForSubscription, setSelectedPlanForSubscription] = useState<string>('');
  
  // Advertisement management states
  const [advertisementPlans, setAdvertisementPlans] = useState<AdvertisementPlan[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [adView, setAdView] = useState<'plans' | 'requests' | 'list'>('plans');
  const [showAdPlanModal, setShowAdPlanModal] = useState(false);
  const [editingAdPlan, setEditingAdPlan] = useState<AdvertisementPlan | null>(null);
  const [adPlanFormData, setAdPlanFormData] = useState({
    plan_name: '',
    description: '',
    duration_days: 30,
    price: 0,
    display_interval: 5
  });
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<Advertisement | null>(null);
  const [showApproveAdModal, setShowApproveAdModal] = useState(false);
  const [selectedPlanForAd, setSelectedPlanForAd] = useState<string>('');
  const [showAdPreviewModal, setShowAdPreviewModal] = useState(false);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  
  const navigate = useNavigate();

  // Show logout confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // Execute logout when confirmed
  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingUser');
    localStorage.removeItem('pharmacyData');
    sessionStorage.clear();
    toast.success('Logged out successfully');
    setShowLogoutConfirm(false);
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
        
        const active = response.data.filter((p: Pharmacy) => p.is_verified === true).length;
        const inactive = response.data.filter((p: Pharmacy) => p.is_verified === false).length;
        
        setStats(prev => ({
          ...prev,
          totalPharmacies: response.data.length,
          activePharmacies: active,
          inactivePharmacies: inactive,
          subscribedPharmacies: Math.floor(response.data.length * 0.45)
        }));
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast.error('Failed to fetch pharmacies');
    } finally {
      setLoadingPharmacies(false);
    }
  };

  // Fetch subscription plans
  const fetchSubscriptionPlans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/subscription-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setSubscriptionPlans(response.data);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error('Failed to fetch subscription plans');
    }
  };

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        const enrichedSubscriptions = await Promise.all(response.data.map(async (sub: Subscription) => {
          const plan = subscriptionPlans.find(p => p.plan_id === sub.plan_id);
          const pharmacy = pharmacies.find(p => p.pharmacy_id === sub.pharmacy_id);
          return {
            ...sub,
            plan_name: plan?.plan_name || 'Unknown',
            pharmacy_name: pharmacy?.pharmacy_name || 'Unknown'
          };
        }));
        setSubscriptions(enrichedSubscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to fetch subscriptions');
    }
  };

  // Fetch advertisement plans
  const fetchAdvertisementPlans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/advertisement-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setAdvertisementPlans(response.data);
        setStats(prev => ({ ...prev, totalAds: response.data.length * 2 }));
      }
    } catch (error) {
      console.error('Error fetching advertisement plans:', error);
      toast.error('Failed to fetch advertisement plans');
    }
  };

  // Fetch advertisements
  const fetchAdvertisements = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/advertisements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        const enrichedAdvertisements = await Promise.all(response.data.map(async (ad: Advertisement) => {
          const plan = advertisementPlans.find(p => p.plan_id === ad.plan_id);
          const pharmacy = pharmacies.find(p => p.pharmacy_id === ad.pharmacy_id);
          return {
            ...ad,
            plan_name: plan?.plan_name || 'Unknown',
            pharmacy_name: pharmacy?.pharmacy_name || 'Unknown'
          };
        }));
        setAdvertisements(enrichedAdvertisements);
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error('Failed to fetch advertisements');
    }
  };

  // Create advertisement plan
  const createAdvertisementPlan = async () => {
    if (!adPlanFormData.plan_name || adPlanFormData.price <= 0) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/advertisement-plans', adPlanFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        toast.success('Advertisement plan created successfully');
        setShowAdPlanModal(false);
        setAdPlanFormData({ plan_name: '', description: '', duration_days: 30, price: 0, display_interval: 5 });
        fetchAdvertisementPlans();
      }
    } catch (error) {
      console.error('Error creating ad plan:', error);
      toast.error('Failed to create advertisement plan');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update advertisement plan
  const updateAdvertisementPlan = async () => {
    if (!editingAdPlan) return;
    
    setIsProcessing(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/advertisement-plans/${editingAdPlan.plan_id}`, adPlanFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        toast.success('Advertisement plan updated successfully');
        setShowAdPlanModal(false);
        setEditingAdPlan(null);
        setAdPlanFormData({ plan_name: '', description: '', duration_days: 30, price: 0, display_interval: 5 });
        fetchAdvertisementPlans();
      }
    } catch (error) {
      console.error('Error updating ad plan:', error);
      toast.error('Failed to update advertisement plan');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete advertisement plan
  const deleteAdvertisementPlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this ad plan?')) return;
    
    setIsProcessing(true);
    try {
      await axios.delete(`http://localhost:5000/api/advertisement-plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Advertisement plan deleted successfully');
      fetchAdvertisementPlans();
    } catch (error) {
      console.error('Error deleting ad plan:', error);
      toast.error('Failed to delete advertisement plan');
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve advertisement
  const approveAdvertisement = async () => {
    if (!selectedAdvertisement || !selectedPlanForAd) {
      toast.error('Please select a plan');
      return;
    }
    
    setIsProcessing(true);
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const response = await axios.put(`http://localhost:5000/api/advertisements/${selectedAdvertisement.ad_id}`, {
        verification_status: true,
        approved_by: currentUser.user_id,
        plan_id: selectedPlanForAd,
        start_date: startDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        toast.success('Advertisement approved successfully');
        setShowApproveAdModal(false);
        setSelectedAdvertisement(null);
        setSelectedPlanForAd('');
        fetchAdvertisements();
      }
    } catch (error) {
      console.error('Error approving advertisement:', error);
      toast.error('Failed to approve advertisement');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject advertisement
  const rejectAdvertisement = async (advertisement: Advertisement) => {
    if (!window.confirm('Are you sure you want to reject this advertisement?')) return;
    
    setIsProcessing(true);
    try {
      await axios.delete(`http://localhost:5000/api/advertisements/${advertisement.ad_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Advertisement rejected and removed');
      fetchAdvertisements();
    } catch (error) {
      console.error('Error rejecting advertisement:', error);
      toast.error('Failed to reject advertisement');
    } finally {
      setIsProcessing(false);
    }
  };

  // Create subscription plan
  const createSubscriptionPlan = async () => {
    if (!planFormData.plan_name || planFormData.price <= 0) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/subscription-plans', planFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        toast.success('Subscription plan created successfully');
        setShowPlanModal(false);
        setPlanFormData({ plan_name: '', description: '', duration_days: 30, price: 0 });
        fetchSubscriptionPlans();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create subscription plan');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update subscription plan
  const updateSubscriptionPlan = async () => {
    if (!editingPlan) return;
    
    setIsProcessing(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/subscription-plans/${editingPlan.plan_id}`, planFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        toast.success('Subscription plan updated successfully');
        setShowPlanModal(false);
        setEditingPlan(null);
        setPlanFormData({ plan_name: '', description: '', duration_days: 30, price: 0 });
        fetchSubscriptionPlans();
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update subscription plan');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete subscription plan
  const deleteSubscriptionPlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    setIsProcessing(true);
    try {
      await axios.delete(`http://localhost:5000/api/subscription-plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Subscription plan deleted successfully');
      fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete subscription plan');
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve subscription
  const approveSubscription = async () => {
    if (!selectedSubscription || !selectedPlanForSubscription) {
      toast.error('Please select a plan');
      return;
    }
    
    setIsProcessing(true);
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const response = await axios.put(`http://localhost:5000/api/subscriptions/${selectedSubscription.subscription_id}`, {
        verification_status: true,
        verified_by: currentUser.user_id,
        plan_id: selectedPlanForSubscription,
        start_date: startDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        toast.success('Subscription approved successfully');
        setShowApproveSubscriptionModal(false);
        setSelectedSubscription(null);
        setSelectedPlanForSubscription('');
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error approving subscription:', error);
      toast.error('Failed to approve subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject subscription
  const rejectSubscription = async (subscription: Subscription) => {
    if (!window.confirm('Are you sure you want to reject this subscription?')) return;
    
    setIsProcessing(true);
    try {
      await axios.delete(`http://localhost:5000/api/subscriptions/${subscription.subscription_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Subscription rejected and removed');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error rejecting subscription:', error);
      toast.error('Failed to reject subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve pharmacy
  const handleApproveClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacyForAction(pharmacy);
    setShowApproveConfirm(true);
  };

  const confirmApprove = async () => {
    if (!selectedPharmacyForAction) return;
    
    setIsProcessing(true);
    try {
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
      
      if (response.data.success) {
        toast.success(`${selectedPharmacyForAction.pharmacy_name} approved successfully!`);
        await fetchPharmacies();
      } else {
        toast.error(response.data.message || 'Failed to approve pharmacy');
      }
    } catch (error: any) {
      console.error('Error approving pharmacy:', error);
      toast.error(error.response?.data?.message || 'Failed to approve pharmacy');
    } finally {
      setIsProcessing(false);
      setShowApproveConfirm(false);
      setSelectedPharmacyForAction(null);
    }
  };

  const cancelApprove = () => {
    setShowApproveConfirm(false);
    setSelectedPharmacyForAction(null);
  };

  const handleRejectClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacyForAction(pharmacy);
    setShowRejectConfirm(true);
  };

  const confirmReject = async () => {
    if (!selectedPharmacyForAction) return;
    
    setIsProcessing(true);
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/pharmacies/${selectedPharmacyForAction.pharmacy_id}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        toast.success(`${selectedPharmacyForAction.pharmacy_name} rejected and removed successfully!`);
        await fetchPharmacies();
      } else {
        toast.error(response.data.message || 'Failed to reject pharmacy');
      }
    } catch (error: any) {
      console.error('Error rejecting pharmacy:', error);
      toast.error(error.response?.data?.message || 'Failed to reject pharmacy');
    } finally {
      setIsProcessing(false);
      setShowRejectConfirm(false);
      setSelectedPharmacyForAction(null);
    }
  };

  const cancelReject = () => {
    setShowRejectConfirm(false);
    setSelectedPharmacyForAction(null);
  };

  // Get pending advertisements (unverified)
  const pendingAdvertisements = advertisements.filter(ad => ad.verification_status === false);
  const activeAdvertisements = advertisements.filter(ad => ad.verification_status === true);

  // Fetch all data on mount
  useEffect(() => {
    fetchUsers();
    fetchPharmacies();
    fetchSubscriptionPlans();
    fetchAdvertisementPlans();
  }, []);

  useEffect(() => {
    if (subscriptionPlans.length > 0 || pharmacies.length > 0) {
      fetchSubscriptions();
    }
    if (advertisementPlans.length > 0 || pharmacies.length > 0) {
      fetchAdvertisements();
    }
  }, [subscriptionPlans, advertisementPlans, pharmacies]);

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
      color: 'from-indigo-500 to-purple-500',
      onClick: () => {
        setAdView('list');
        setActiveTab('ads');
      }
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

  const pendingPharmacies = pharmacies.filter(p => p.is_verified === false);
  const allPharmaciesList = pharmacies.filter(p => 
    (statusFilter === 'all' || 
      (statusFilter === 'approved' && p.is_verified === true) ||
      (statusFilter === 'pending' && p.is_verified === false)) &&
    p.pharmacy_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingSubscriptions = subscriptions.filter(s => s.verification_status === false);

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

          <div className="p-6 border-t border-white/20">
            <button 
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 text-white/70 hover:text-white transition-colors"
            >
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

          {/* Analysis Dashboard */}
          {activeTab === 'analysis' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4 text-lg">Growth Overview</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                      <YAxis stroke="rgba(255,255,255,0.6)" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                      <Line type="monotone" dataKey="pharmacies" stroke="#F8FAFC" strokeWidth={2} dot={{ fill: '#F8FAFC' }} />
                      <Line type="monotone" dataKey="ads" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4 text-lg">Ad Performance</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                      <YAxis stroke="rgba(255,255,255,0.6)" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="ads" fill="#ec4899" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* Manage Pharmacies */}
          {activeTab === 'pharmacies' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
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

              {approvalView === 'pending' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Pending Approvals</h2>
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

          {/* Manage Subscriptions */}
          {activeTab === 'subscriptions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSubscriptionView('plans')}
                  className={`relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    subscriptionView === 'plans' ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Tag size={24} className="text-emerald-400" />
                    </div>
                    <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {subscriptionPlans.length} Plans
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Subscription Plans</h3>
                  <p className="text-white/60 text-sm">Manage pricing plans and durations</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSubscriptionView('requests')}
                  className={`relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    subscriptionView === 'requests' ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <Clock size={24} className="text-orange-400" />
                    </div>
                    <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {pendingSubscriptions.length} Pending
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Pending Requests</h3>
                  <p className="text-white/60 text-sm">Review and approve subscription requests</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSubscriptionView('list')}
                  className={`relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    subscriptionView === 'list' ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <CreditCard size={24} className="text-blue-400" />
                    </div>
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {subscriptions.filter(s => s.verification_status === true).length} Active
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Active Subscriptions</h3>
                  <p className="text-white/60 text-sm">View all active subscriptions</p>
                </motion.div>

                <motion.div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <DollarSign size={24} className="text-purple-400" />
                    </div>
                    <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Monthly
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Revenue Overview</h3>
                  <p className="text-white text-2xl font-bold">
                    ${subscriptionPlans.reduce((sum, plan) => sum + (plan.price * 5), 0).toLocaleString()}
                  </p>
                  <p className="text-white/60 text-sm">Estimated monthly revenue</p>
                </motion.div>
              </div>

              {subscriptionView === 'plans' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Subscription Plans</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingPlan(null);
                        setPlanFormData({ plan_name: '', description: '', duration_days: 30, price: 0 });
                        setShowPlanModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add New Plan
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan) => (
                      <motion.div
                        key={plan.plan_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-emerald-400/50 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">{plan.plan_name}</h3>
                            <p className="text-white/60 text-sm">{plan.description || 'No description'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPlan(plan);
                                setPlanFormData({
                                  plan_name: plan.plan_name,
                                  description: plan.description || '',
                                  duration_days: plan.duration_days,
                                  price: plan.price
                                });
                                setShowPlanModal(true);
                              }}
                              className="p-2 bg-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteSubscriptionPlan(plan.plan_id)}
                              className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Duration</span>
                            <span className="text-white font-semibold">{plan.duration_days} days</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Price</span>
                            <span className="text-emerald-400 font-bold text-xl">${plan.price}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <div className="text-white/40 text-xs">Created: {new Date(plan.created_at).toLocaleDateString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {subscriptionPlans.length === 0 && (
                    <div className="text-center py-12">
                      <Tag size={48} className="text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">No subscription plans found</p>
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg"
                      >
                        Create First Plan
                      </button>
                    </div>
                  )}
                </div>
              )}

              {subscriptionView === 'requests' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Pending Subscription Requests</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {pendingSubscriptions.map((subscription) => (
                      <motion.div
                        key={subscription.subscription_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-emerald-400/50 transition-all"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-orange-500/20 rounded-xl">
                                <Store size={20} className="text-orange-400" />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold text-lg">{subscription.pharmacy_name || 'Unknown Pharmacy'}</h3>
                                <p className="text-white/60 text-sm">Subscription ID: {subscription.subscription_id.slice(0, 8)}...</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-white/60 text-sm mb-1">Requested Plan</p>
                                <p className="text-white font-medium">{subscription.plan_name || 'Unknown Plan'}</p>
                              </div>
                              <div>
                                <p className="text-white/60 text-sm mb-1">Request Date</p>
                                <p className="text-white">{new Date(subscription.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>

                            {subscription.receipt_image_url && (
                              <div className="mb-4">
                                <p className="text-white/60 text-sm mb-2">Payment Receipt</p>
                                <a
                                  href={subscription.receipt_image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-emerald-400 hover:bg-white/20 transition-colors"
                                >
                                  <Eye size={16} />
                                  View Receipt
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <label className="text-white/60 text-sm">Select Plan</label>
                            <select
                              value={subscription.plan_id}
                              onChange={(e) => {
                                const updatedSub = { ...subscription, plan_id: e.target.value };
                                setSelectedSubscription(updatedSub);
                                setSelectedPlanForSubscription(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-2 bg-white/10 rounded-xl border border-white/20 text-white focus:outline-none focus:border-emerald-400"
                            >
                              {subscriptionPlans.map(plan => (
                                <option key={plan.plan_id} value={plan.plan_id} className="bg-gray-800">
                                  {plan.plan_name} - ${plan.price} ({plan.duration_days} days)
                                </option>
                              ))}
                            </select>
                            
                            <div className="flex gap-2 mt-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setSelectedPlanForSubscription(subscription.plan_id);
                                  setShowApproveSubscriptionModal(true);
                                }}
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-xl font-semibold"
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => rejectSubscription(subscription)}
                                className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-xl font-semibold border border-red-500/30 hover:bg-red-500/30 transition-colors"
                              >
                                Reject
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {pendingSubscriptions.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle size={48} className="text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">No pending subscription requests</p>
                    </div>
                  )}
                </div>
              )}

              {subscriptionView === 'list' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Active Subscriptions</h2>
                    <button
                      onClick={fetchSubscriptions}
                      className="p-2 bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5 backdrop-blur rounded-xl">
                        <tr className="border-b border-white/10">
                          <th className="text-left p-4 text-white/60 font-medium">Pharmacy</th>
                          <th className="text-left p-4 text-white/60 font-medium">Plan</th>
                          <th className="text-left p-4 text-white/60 font-medium">Start Date</th>
                          <th className="text-left p-4 text-white/60 font-medium">End Date</th>
                          <th className="text-left p-4 text-white/60 font-medium">Status</th>
                          <th className="text-left p-4 text-white/60 font-medium">Verified By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions
                          .filter(s => s.verification_status === true)
                          .map((subscription) => (
                            <motion.tr
                              key={subscription.subscription_id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-b border-white/10 hover:bg-white/5 transition-colors"
                            >
                              <td className="p-4">
                                <p className="text-white font-medium">{subscription.pharmacy_name || 'Unknown'}</p>
                                <p className="text-white/40 text-xs">{subscription.subscription_id.slice(0, 8)}...</p>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
                                  {subscription.plan_name}
                                </span>
                              </td>
                              <td className="p-4 text-white/80">
                                {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : '-'}
                              </td>
                              <td className="p-4">
                                <span className={new Date(subscription.end_date || '') < new Date() ? 'text-red-400' : 'text-white/80'}>
                                  {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : '-'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                                  Active
                                </span>
                              </td>
                              <td className="p-4 text-white/60 text-sm">
                                {subscription.verified_by || 'System'}
                              </td>
                            </motion.tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {subscriptions.filter(s => s.verification_status === true).length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard size={48} className="text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">No active subscriptions found</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Manage Ads - Enhanced Version */}
          {activeTab === 'ads' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setAdView('plans')}
                  className={`relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    adView === 'plans' ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Tag size={24} className="text-emerald-400" />
                    </div>
                    <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {advertisementPlans.length} Plans
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Ad Plans</h3>
                  <p className="text-white/60 text-sm">Manage advertisement pricing</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setAdView('requests')}
                  className={`relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    adView === 'requests' ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <Clock size={24} className="text-orange-400" />
                    </div>
                    <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {pendingAdvertisements.length} Pending
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Pending Ads</h3>
                  <p className="text-white/60 text-sm">Review advertisement requests</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setAdView('list')}
                  className={`relative cursor-pointer bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    adView === 'list' ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Megaphone size={24} className="text-blue-400" />
                    </div>
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {activeAdvertisements.length} Active
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Active Ads</h3>
                  <p className="text-white/60 text-sm">View running advertisements</p>
                </motion.div>

                <motion.div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <DollarSign size={24} className="text-purple-400" />
                    </div>
                    <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Revenue
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">Ad Revenue</h3>
                  <p className="text-white text-2xl font-bold">
                    ${advertisementPlans.reduce((sum, plan) => sum + (plan.price * 3), 0).toLocaleString()}
                  </p>
                  <p className="text-white/60 text-sm">Estimated ad revenue</p>
                </motion.div>
              </div>

              {adView === 'plans' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Advertisement Plans</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingAdPlan(null);
                        setAdPlanFormData({ plan_name: '', description: '', duration_days: 30, price: 0, display_interval: 5 });
                        setShowAdPlanModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add New Plan
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {advertisementPlans.map((plan) => (
                      <motion.div
                        key={plan.plan_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">{plan.plan_name}</h3>
                            <p className="text-white/60 text-sm">{plan.description || 'No description'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingAdPlan(plan);
                                setAdPlanFormData({
                                  plan_name: plan.plan_name,
                                  description: plan.description || '',
                                  duration_days: plan.duration_days,
                                  price: plan.price,
                                  display_interval: 5
                                });
                                setShowAdPlanModal(true);
                              }}
                              className="p-2 bg-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteAdvertisementPlan(plan.plan_id)}
                              className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Duration</span>
                            <span className="text-white font-semibold">{plan.duration_days} days</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Price</span>
                            <span className="text-purple-400 font-bold text-xl">${plan.price}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <div className="text-white/40 text-xs">Created: {new Date(plan.created_at).toLocaleDateString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {advertisementPlans.length === 0 && (
                    <div className="text-center py-12">
                      <Tag size={48} className="text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">No advertisement plans found</p>
                      <button
                        onClick={() => setShowAdPlanModal(true)}
                        className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg"
                      >
                        Create First Plan
                      </button>
                    </div>
                  )}
                </div>
              )}

              {adView === 'requests' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Pending Ad Requests</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {pendingAdvertisements.map((advertisement) => (
                      <motion.div
                        key={advertisement.ad_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 hover:border-purple-400/50 transition-all"
                      >
                        <div className="grid md:grid-cols-2 gap-0">
                          <div className="relative h-64 md:h-auto bg-gradient-to-br from-purple-500/10 to-pink-500/10 overflow-hidden group">
                            {advertisement.advertisement_image ? (
                              <img
                                src={advertisement.advertisement_image}
                                alt={advertisement.ad_title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center">
                                <Image size={48} className="text-white/30 mb-2" />
                                <p className="text-white/40 text-sm">No image</p>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setPreviewAd(advertisement);
                                setShowAdPreviewModal(true);
                              }}
                              className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur rounded-lg text-white text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Eye size={14} />
                              Preview
                            </button>
                          </div>

                          <div className="p-6">
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-orange-400 text-xs font-semibold px-2 py-0.5 bg-orange-500/20 rounded-full">
                                  Pending
                                </span>
                              </div>
                              <h3 className="text-white font-bold text-xl mb-1">{advertisement.ad_title}</h3>
                              <p className="text-white/60 text-sm">{advertisement.pharmacy_name}</p>
                            </div>

                            <div className="space-y-3 mb-4">
                              <p className="text-white/80 text-sm">{advertisement.ad_content || 'No content'}</p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-white/60 text-xs">Plan</p>
                                  <p className="text-white text-sm">{advertisement.plan_name}</p>
                                </div>
                                <div>
                                  <p className="text-white/60 text-xs">Requested</p>
                                  <p className="text-white text-sm">{new Date(advertisement.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>

                            {advertisement.receipt_image_url && (
                              <a
                                href={advertisement.receipt_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-emerald-400 text-sm mb-4"
                              >
                                <FileText size={14} />
                                View Receipt
                              </a>
                            )}

                            <div className="flex gap-3 mt-4">
                              <select
                                value={advertisement.plan_id}
                                onChange={(e) => {
                                  const updatedAd = { ...advertisement, plan_id: e.target.value };
                                  setSelectedAdvertisement(updatedAd);
                                  setSelectedPlanForAd(e.target.value);
                                }}
                                className="flex-1 px-3 py-2 bg-white/10 rounded-xl border border-white/20 text-white text-sm"
                              >
                                {advertisementPlans.map(plan => (
                                  <option key={plan.plan_id} value={plan.plan_id}>
                                    {plan.plan_name} - ${plan.price} ({plan.duration_days}d)
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex gap-3 mt-3">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setSelectedAdvertisement(advertisement);
                                  setSelectedPlanForAd(advertisement.plan_id);
                                  setShowApproveAdModal(true);
                                }}
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-xl font-semibold text-sm"
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => rejectAdvertisement(advertisement)}
                                className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-xl font-semibold border border-red-500/30 text-sm"
                              >
                                Reject
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {pendingAdvertisements.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle size={48} className="text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">No pending ad requests</p>
                    </div>
                  )}
                </div>
              )}

              {adView === 'list' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Active Ads</h2>
                    <button
                      onClick={fetchAdvertisements}
                      className="p-2 bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeAdvertisements.map((ad) => (
                      <motion.div
                        key={ad.ad_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 hover:border-purple-400/50 transition-all cursor-pointer"
                        onClick={() => {
                          setPreviewAd(ad);
                          setShowAdPreviewModal(true);
                        }}
                      >
                        <div className="relative h-48 overflow-hidden">
                          {ad.advertisement_image ? (
                            <img
                              src={ad.advertisement_image}
                              alt={ad.ad_title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                              <Image size={40} className="text-white/40" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Play size={10} />
                            Live
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <h3 className="text-white font-bold text-lg">{ad.ad_title}</h3>
                            <p className="text-white/70 text-sm">{ad.pharmacy_name}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-white/60 text-sm line-clamp-2">{ad.ad_content}</p>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                            <div>
                              <p className="text-white/40 text-xs">{ad.plan_name}</p>
                              <p className="text-white/40 text-xs">
                                {ad.start_date && new Date(ad.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400">
                              <Eye size={14} />
                              <span className="text-xs">Preview</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {activeAdvertisements.length === 0 && (
                    <div className="text-center py-12">
                      <Megaphone size={48} className="text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">No active ads</p>
                    </div>
                  )}
                </div>
              )}
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

      {/* Subscription Plan Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowPlanModal(false);
              setEditingPlan(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
                    </h2>
                    <p className="text-white/60 mt-1">
                      {editingPlan ? 'Update plan details' : 'Add a new subscription plan'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPlanModal(false);
                      setEditingPlan(null);
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm block mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={planFormData.plan_name}
                      onChange={(e) => setPlanFormData({ ...planFormData, plan_name: e.target.value })}
                      placeholder="e.g., Basic, Premium, Enterprise"
                      className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-sm block mb-2">Description (Optional)</label>
                    <textarea
                      value={planFormData.description}
                      onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                      placeholder="Describe what this plan includes..."
                      rows={3}
                      className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-sm block mb-2">Duration (Days)</label>
                    <input
                      type="number"
                      value={planFormData.duration_days}
                      onChange={(e) => setPlanFormData({ ...planFormData, duration_days: parseInt(e.target.value) || 0 })}
                      placeholder="30, 90, 365"
                      className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-sm block mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={planFormData.price}
                      onChange={(e) => setPlanFormData({ ...planFormData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={editingPlan ? updateSubscriptionPlan : createSubscriptionPlan}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowPlanModal(false);
                      setEditingPlan(null);
                    }}
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

      {/* Approve Subscription Modal */}
      <AnimatePresence>
        {showApproveSubscriptionModal && selectedSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApproveSubscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Confirm Approval</h2>
                    <p className="text-white/60 mt-1">Approve subscription request</p>
                  </div>
                  <button
                    onClick={() => setShowApproveSubscriptionModal(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-white/70 mb-4">
                  Are you sure you want to approve this subscription for <strong className="text-emerald-400">{selectedSubscription.pharmacy_name}</strong>?
                </p>
                
                {selectedPlanForSubscription && (
                  <div className="bg-white/5 rounded-xl p-3 mb-4">
                    <p className="text-white/60 text-sm">Selected Plan:</p>
                    <p className="text-white font-semibold">
                      {subscriptionPlans.find(p => p.plan_id === selectedPlanForSubscription)?.plan_name}
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      Duration: {subscriptionPlans.find(p => p.plan_id === selectedPlanForSubscription)?.duration_days} days
                    </p>
                  </div>
                )}
                
                <p className="text-white/50 text-sm mb-6">
                  The subscription will start today and expire based on the selected plan's duration.
                </p>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={approveSubscription}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowApproveSubscriptionModal(false)}
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
            {/* Advertisement Plan Modal */}
      <AnimatePresence>
        {showAdPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAdPlanModal(false);
              setEditingAdPlan(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingAdPlan ? 'Edit Advertisement Plan' : 'Create New Ad Plan'}
                    </h2>
                    <p className="text-white/60 mt-1">
                      {editingAdPlan ? 'Update plan details' : 'Add a new advertisement plan'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAdPlanModal(false);
                      setEditingAdPlan(null);
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm block mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={adPlanFormData.plan_name}
                      onChange={(e) => setAdPlanFormData({ ...adPlanFormData, plan_name: e.target.value })}
                      placeholder="e.g., Skincare, New product..."
                      className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-sm block mb-2">Description (Optional)</label>
                    <textarea
                      value={adPlanFormData.description}
                      onChange={(e) => setAdPlanFormData({ ...adPlanFormData, description: e.target.value })}
                      placeholder="Describe what this ad plan includes..."
                      rows={3}
                      className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-sm block mb-2">Duration (Days)</label>
                    <input
                      type="number"
                      value={adPlanFormData.duration_days}
                      onChange={(e) => setAdPlanFormData({ ...adPlanFormData, duration_days: parseInt(e.target.value) || 0 })}
                      placeholder="7, 14, 30"
                      className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-sm block mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adPlanFormData.price}
                      onChange={(e) => setAdPlanFormData({ ...adPlanFormData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={editingAdPlan ? updateAdvertisementPlan : createAdvertisementPlan}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {editingAdPlan ? 'Update Plan' : 'Create Plan'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAdPlanModal(false);
                      setEditingAdPlan(null);
                    }}
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

      {/* Approve Advertisement Modal */}
      <AnimatePresence>
        {showApproveAdModal && selectedAdvertisement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApproveAdModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Confirm Approval</h2>
                    <p className="text-white/60 mt-1">Approve advertisement request</p>
                  </div>
                  <button
                    onClick={() => setShowApproveAdModal(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-white/70 mb-4">
                  Are you sure you want to approve this advertisement for <strong className="text-purple-400">{selectedAdvertisement.pharmacy_name}</strong>?
                </p>
                
                {selectedPlanForAd && (
                  <div className="bg-white/5 rounded-xl p-3 mb-4">
                    <p className="text-white/60 text-sm">Selected Plan:</p>
                    <p className="text-white font-semibold">
                      {advertisementPlans.find(p => p.plan_id === selectedPlanForAd)?.plan_name}
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      Duration: {advertisementPlans.find(p => p.plan_id === selectedPlanForAd)?.duration_days} days
                    </p>
                  </div>
                )}
                
                <p className="text-white/50 text-sm mb-6">
                  The advertisement will start today and expire based on the selected plan's duration. It will automatically be removed from the landing page after expiry.
                </p>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={approveAdvertisement}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    Approve Ad
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowApproveAdModal(false)}
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

      {/* Ad Preview Modal */}
      <AnimatePresence>
        {showAdPreviewModal && previewAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAdPreviewModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-80 md:h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  {previewAd.advertisement_image ? (
                    <img
                      src={previewAd.advertisement_image}
                      alt={previewAd.ad_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Image size={64} className="text-white/30" />
                      <p className="text-white/50 mt-2">No image available</p>
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                        {previewAd.plan_name}
                      </div>
                      {previewAd.verification_status && (
                        <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Play size={10} />
                          Live
                        </div>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{previewAd.ad_title}</h2>
                    <p className="text-purple-400 text-sm">{previewAd.pharmacy_name}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="text-white/60 text-sm mb-1">Ad Content</h3>
                      <p className="text-white/80 leading-relaxed">{previewAd.ad_content || 'No content provided'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-white/40 text-xs">Start Date</p>
                        <p className="text-white/80 text-sm">{previewAd.start_date ? new Date(previewAd.start_date).toLocaleDateString() : 'Not started'}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">End Date</p>
                        <p className="text-white/80 text-sm">{previewAd.end_date ? new Date(previewAd.end_date).toLocaleDateString() : 'Not set'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAdPreviewModal(false)}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-xl font-semibold"
                    >
                      Close Preview
                    </button>
                  </div>
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