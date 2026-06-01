import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LayoutDashboard, Building2, CreditCard, Megaphone,
  Users, CheckCircle, XCircle, Clock, AlertCircle, Calendar,
  Eye, Download, Filter, Search, ChevronDown, Bell, Settings,
  LogOut, Star, TrendingUp, TrendingDown, MoreVertical,
  Phone, Mail, MapPin, FileText, Image as ImageIcon,
  UserCheck, UserX, RefreshCw, Loader2, Store,
  Plus, Edit, Trash2, DollarSign, Tag, Save, Image, Play, ExternalLink
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

interface ExtendedLicense extends License {
  pharmacy_name?: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  is_verified?: boolean;
  operating_hours?: string;
  latitude?: number;
  longitude?: number;
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
  
  const [licenseNumberValid, setLicenseNumberValid] = useState(false);
  const [issueDateValid, setIssueDateValid] = useState(false);
  const [expiryDateValid, setExpiryDateValid] = useState(false);
  const [documentClear, setDocumentClear] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [showPharmaciesModal, setShowPharmaciesModal] = useState(false);
  const [pharmacyModalType, setPharmacyModalType] = useState<'total' | 'active' | 'inactive' | 'subscribed'>('total');
  const [pharmacySearchTerm, setPharmacySearchTerm] = useState('');
  
  const [allLicenses, setAllLicenses] = useState<ExtendedLicense[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [showLicenseDetailsModal, setShowLicenseDetailsModal] = useState(false);
  const [selectedLicenseForDetails, setSelectedLicenseForDetails] = useState<{pharmacy: Pharmacy, license: License} | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [pharmacyToDeactivate, setPharmacyToDeactivate] = useState<Pharmacy | null>(null);
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'expired' | 'expiring' | 'valid'>('all');
  const [licenseSearchTerm, setLicenseSearchTerm] = useState('');
  
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
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  // Add these new state variables
const [showLicenseActionModal, setShowLicenseActionModal] = useState(false);
const [selectedLicenseForAction, setSelectedLicenseForAction] = useState<ExtendedLicense | null>(null);
const [licenseActionType, setLicenseActionType] = useState<'deactivate' | 'activate' | 'suspend' | 'warning' | 'extend' | 'renew' | null>(null);
const [showLicenseStatusModal, setShowLicenseStatusModal] = useState(false);
const [selectedLicenseStatus, setSelectedLicenseStatus] = useState<ExtendedLicense | null>(null);
const [licenseRenewalData, setLicenseRenewalData] = useState({
  new_expiry_date: '',
  new_license_number: '',
  renewal_document_url: ''
});
  const [revenueBreakdown, setRevenueBreakdown] = useState<Array<{
    pharmacy_name: string;
    ad_title: string;
    plan_name: string;
    price: number;
    start_date: string;
  }>>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  const navigate = useNavigate();

  const allValidationsPassed = () => {
    return licenseNumberValid && issueDateValid && expiryDateValid && documentClear;
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

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

 const fetchPharmacies = async () => {
  setLoadingPharmacies(true);
  try {
    // Change this to your new admin endpoint
    const response = await axios.get('http://localhost:5000/api/pharmacies/admin/pharmacies', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data && Array.isArray(response.data)) {
      // The backend now returns owner_name directly from the JOIN
      setPharmacies(response.data);
      
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
// License action handlers with professional confirmations
const handleLicenseAction = (license: ExtendedLicense, action: 'deactivate' | 'activate' | 'suspend' | 'warning' | 'extend' | 'renew') => {
  setSelectedLicenseForAction(license);
  setLicenseActionType(action);
  setShowLicenseActionModal(true);
};

const confirmLicenseAction = async () => {
  if (!selectedLicenseForAction || !licenseActionType) return;
  
  setIsProcessing(true);
  try {
    let response;
    const token = localStorage.getItem('token');
    
    switch (licenseActionType) {
      case 'deactivate':
        response = await axios.put(
          `http://localhost:5000/api/pharmacies/${selectedLicenseForAction.pharmacy_id}/deactivate`,
          { is_active: false, reason: 'License related issue' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Pharmacy ${selectedLicenseForAction.pharmacy_name} has been deactivated`);
        break;
        
      case 'activate':
        response = await axios.put(
          `http://localhost:5000/api/pharmacies/${selectedLicenseForAction.pharmacy_id}/activate`,
          { is_active: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Pharmacy ${selectedLicenseForAction.pharmacy_name} has been reactivated`);
        break;
        
      case 'suspend':
        response = await axios.put(
          `http://localhost:5000/api/pharmacies/${selectedLicenseForAction.pharmacy_id}/suspend`,
          { is_suspended: true, suspended_until: new Date(Date.now() + 30*24*60*60*1000).toISOString() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.warning(`Pharmacy ${selectedLicenseForAction.pharmacy_name} has been suspended for 30 days`);
        break;
        
      case 'warning':
        // Send warning email/notification
        await axios.post(
          `http://localhost:5000/api/notifications/license-warning`,
          {
            pharmacy_id: selectedLicenseForAction.pharmacy_id,
            license_number: selectedLicenseForAction.license_number,
            expiry_date: selectedLicenseForAction.expiry_date,
            days_left: Math.ceil((new Date(selectedLicenseForAction.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.info(`Warning notification sent to ${selectedLicenseForAction.pharmacy_name}`);
        break;
        
      case 'extend':
        if (!licenseRenewalData.new_expiry_date) {
          toast.error('Please enter new expiry date');
          return;
        }
        response = await axios.put(
          `http://localhost:5000/api/pharmacy-licenses/${selectedLicenseForAction.license_id}/extend`,
          { new_expiry_date: licenseRenewalData.new_expiry_date },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`License extended for ${selectedLicenseForAction.pharmacy_name}`);
        break;
        
      case 'renew':
        if (!licenseRenewalData.new_expiry_date || !licenseRenewalData.new_license_number) {
          toast.error('Please fill all renewal information');
          return;
        }
        response = await axios.post(
          `http://localhost:5000/api/pharmacy-licenses/${selectedLicenseForAction.pharmacy_id}/renew`,
          licenseRenewalData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`License renewed successfully for ${selectedLicenseForAction.pharmacy_name}`);
        break;
    }
    
    await fetchAllLicenses();
    await fetchPharmacies();
    setShowLicenseActionModal(false);
    setSelectedLicenseForAction(null);
    setLicenseActionType(null);
    setLicenseRenewalData({ new_expiry_date: '', new_license_number: '', renewal_document_url: '' });
    
  } catch (error: any) {
    console.error('Error performing license action:', error);
    toast.error(error.response?.data?.message || 'Failed to perform action');
  } finally {
    setIsProcessing(false);
  }
};

// View license status details
const viewLicenseStatus = (license: ExtendedLicense) => {
  setSelectedLicenseStatus(license);
  setShowLicenseStatusModal(true);
};

// Get status color for license
const getLicenseStatusColor = (daysLeft: number) => {
  if (daysLeft < 0) return 'text-red-600 bg-red-100 border-red-200';
  if (daysLeft <= 7) return 'text-red-500 bg-red-50 border-red-100';
  if (daysLeft <= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (daysLeft <= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-green-600 bg-green-50 border-green-200';
};
  const fetchAllLicenses = async () => {
    setLoadingLicenses(true);
    try {
      const response = await axios.get('http://localhost:5000/api/pharmacy-licenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Licenses fetched successfully:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setAllLicenses(response.data);
      } else {
        setAllLicenses([]);
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast.error('Failed to fetch licenses');
      setAllLicenses([]);
    } finally {
      setLoadingLicenses(false);
    }
  };

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

  const handleApproveClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacyForAction(pharmacy);
    setLicenseNumberValid(false);
    setIssueDateValid(false);
    setExpiryDateValid(false);
    setDocumentClear(false);
    const license = allLicenses.find(l => l.pharmacy_id === pharmacy.pharmacy_id);
    console.log('Selected pharmacy for approval:', pharmacy.pharmacy_id);
    console.log('License data for this pharmacy:', license);
    setShowApproveConfirm(true);
  };

  const confirmApprove = async () => {
    if (!selectedPharmacyForAction) return;
    
    if (!allValidationsPassed()) {
      toast.error('Please verify all license information before approving');
      return;
    }
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      console.log('📤 Approving pharmacy:', selectedPharmacyForAction.pharmacy_id);
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }
      
      const response = await axios.put(
        `http://localhost:5000/api/pharmacies/${selectedPharmacyForAction.pharmacy_id}/approve`,
        {},
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
        await fetchPharmacies();
        await fetchAllLicenses();
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

  const cancelApprove = () => {
    setShowApproveConfirm(false);
    setSelectedPharmacyForAction(null);
    setLicenseNumberValid(false);
    setIssueDateValid(false);
    setExpiryDateValid(false);
    setDocumentClear(false);
  };

  const handleRejectClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacyForAction(pharmacy);
    setShowRejectConfirm(true);
  };

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
        await fetchPharmacies();
        await fetchAllLicenses();
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

  const cancelReject = () => {
    setShowRejectConfirm(false);
    setSelectedPharmacyForAction(null);
  };

  const pendingAdvertisements = advertisements.filter(ad => ad.verification_status === false);
  const activeAdvertisements = advertisements.filter(ad => ad.verification_status === true);
  
  const calculateRealRevenue = () => {
    const approvedAds = advertisements.filter(ad => ad.verification_status === true);
    
    let total = 0;
    const breakdown = [];
    
    for (const ad of approvedAds) {
      const plan = advertisementPlans.find(p => p.plan_id === ad.plan_id);
      const price = plan?.price || 0;
      total += price;
      
      breakdown.push({
        pharmacy_name: ad.pharmacy_name || 'Unknown Pharmacy',
        ad_title: ad.ad_title,
        plan_name: plan?.plan_name || 'Unknown Plan',
        price: price,
        start_date: ad.start_date || ad.created_at
      });
    }
    
    setTotalRevenue(total);
    setRevenueBreakdown(breakdown);
    setShowRevenueModal(true);
  };

  useEffect(() => {
    fetchUsers();
    fetchPharmacies();
    fetchSubscriptionPlans();
    fetchAdvertisementPlans();
    fetchAllLicenses();
  }, []);
  // Add this after your existing useEffects
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (selectedPharmacyForAction) {
      const target = event.target as HTMLElement;
      // Check if click is outside the dropdown
      if (!target.closest('.action-dropdown') && !target.closest('.action-button')) {
        setSelectedPharmacyForAction(null);
      }
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, [selectedPharmacyForAction]);

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
      color: 'from-sky-500 to-cyan-500',
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
      color: 'from-amber-500 to-orange-500',
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
      color: 'from-violet-500 to-purple-500',
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
      color: 'from-rose-500 to-pink-500',
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
  
  const getLicenseStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'red', text: 'Expired', bgClass: 'bg-red-500/20', textClass: 'text-red-600', borderClass: 'border-red-500/30' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'yellow', text: `Expiring in ${daysUntilExpiry} days`, bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-600', borderClass: 'border-yellow-500/30' };
    } else {
      return { status: 'valid', color: 'green', text: 'Valid', bgClass: 'bg-green-500/20', textClass: 'text-green-600', borderClass: 'border-green-500/30' };
    }
  };

  const deactivatePharmacyAccount = async (pharmacy: Pharmacy) => {
    setIsProcessing(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/pharmacies/${pharmacy.pharmacy_id}/deactivate`,
        { is_active: false },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        toast.success(`${pharmacy.pharmacy_name} has been deactivated successfully!`);
        await fetchPharmacies();
        setShowDeactivateConfirm(false);
        setPharmacyToDeactivate(null);
      } else {
        toast.error(response.data.message || 'Failed to deactivate pharmacy');
      }
    } catch (error: any) {
      console.error('Error deactivating pharmacy:', error);
      toast.error(error.response?.data?.message || 'Failed to deactivate pharmacy');
    } finally {
      setIsProcessing(false);
    }
  };

  const activatePharmacyAccount = async (pharmacy: Pharmacy) => {
    setIsProcessing(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/pharmacies/${pharmacy.pharmacy_id}/activate`,
        { is_active: true },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        toast.success(`${pharmacy.pharmacy_name} has been activated successfully!`);
        await fetchPharmacies();
      } else {
        toast.error(response.data.message || 'Failed to activate pharmacy');
      }
    } catch (error: any) {
      console.error('Error activating pharmacy:', error);
      toast.error(error.response?.data?.message || 'Failed to activate pharmacy');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'admin': return 'bg-purple-500/20 text-purple-400';
      case 'pharmacy': return 'bg-emerald-500/20 text-emerald-400';
      case 'user': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Helper function to get license by pharmacy ID
  const getLicenseByPharmacyId = (pharmacyId: string): ExtendedLicense | undefined => {
    return allLicenses.find(l => l.pharmacy_id === pharmacyId);
  };

  return (
    <div className="flex h-screen bg-[#DFF0F1] overflow-hidden">
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="relative h-full bg-white/30 backdrop-blur-xl border-r border-white/40 shadow-xl z-20"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-[#009689]/20">
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#009689] to-[#007a6f] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              {sidebarOpen && (
                <span className="text-[#009689] font-semibold text-lg">Pharmalink</span>
              )}
            </motion.div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#009689]/60 hover:text-[#009689] transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 py-8">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-[#009689]/80 hover:text-[#009689] transition-all relative group ${
                  activeTab === item.id ? 'text-[#009689]' : ''
                }`}
                whileHover={{ x: 5 }}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-full bg-gradient-to-b from-[#009689] to-[#007a6f] rounded-r-full"
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                {sidebarOpen && (
                  <span className="relative z-10 font-medium">{item.label}</span>
                )}
              </motion.button>
            ))}
          </nav>

          <div className="p-6 border-t border-[#009689]/20">
            <button 
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 text-[#009689]/70 hover:text-[#009689] transition-colors"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#009689] mb-2">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-[#009689]/60">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 bg-white/40 backdrop-blur rounded-xl text-[#009689]/70 hover:text-[#009689] transition-colors">
                <Bell size={20} />
              </button>
              <button className="p-2 bg-white/40 backdrop-blur rounded-xl text-[#009689]/70 hover:text-[#009689] transition-colors">
                <Settings size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#009689] to-[#007a6f] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-[#009689] font-medium">Admin User</p>
                  <p className="text-[#009689]/60 text-sm">Super Admin</p>
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
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/40 backdrop-blur-xl rounded-2xl p-8 border border-white/50 hover:border-[#009689]/30 transition-all hover:scale-105 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-4 bg-gradient-to-r ${stat.color} rounded-xl shadow-md`}>
                          {stat.icon}
                        </div>
                        {stat.trend && (
                          <div className={`flex items-center gap-1 text-sm ${stat.trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {stat.trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{Math.abs(stat.trend)}%</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-[#009689]/70 text-sm mb-2">{stat.title}</h3>
                      <p className="text-[#009689] text-4xl font-bold">
                        <CountUp end={stat.value} duration={2.5} separator="," />
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm">
                  <h3 className="text-[#009689] font-semibold mb-4 text-lg">Growth Overview</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,150,137,0.2)" />
                      <XAxis dataKey="month" stroke="#009689" />
                      <YAxis stroke="#009689" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', color: '#009689' }} />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#009689" strokeWidth={2} dot={{ fill: '#009689' }} />
                      <Line type="monotone" dataKey="pharmacies" stroke="#007a6f" strokeWidth={2} dot={{ fill: '#007a6f' }} />
                      <Line type="monotone" dataKey="ads" stroke="#DFF0F1" strokeWidth={2} dot={{ fill: '#DFF0F1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm">
                  <h3 className="text-[#009689] font-semibold mb-4 text-lg">Ad Performance</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,150,137,0.2)" />
                      <XAxis dataKey="month" stroke="#009689" />
                      <YAxis stroke="#009689" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', color: '#009689' }} />
                      <Legend />
                      <Bar dataKey="ads" fill="#009689" radius={[8, 8, 0, 0]} />
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
                  className={`relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border transition-all shadow-sm ${
                    approvalView === 'pending' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-white/50 hover:border-[#009689]/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                      <Clock size={24} className="text-amber-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      {pendingPharmacies.length} Pending
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Pharmacy Approval</h3>
                  <p className="text-[#009689]/60 text-sm">Review and approve pending pharmacies</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setApprovalView('all')}
                  className={`relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border transition-all shadow-sm ${
                    approvalView === 'all' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-white/50 hover:border-[#009689]/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Building2 size={24} className="text-blue-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      {stats.totalPharmacies} Total
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">See All Pharmacies</h3>
                  <p className="text-[#009689]/60 text-sm">View and manage all registered pharmacies</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setApprovalView('licenses')}
                  className={`relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border transition-all shadow-sm ${
                    approvalView === 'licenses' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-white/50 hover:border-[#009689]/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Calendar size={24} className="text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Annual Licence Checking</h3>
                  <p className="text-[#009689]/60 text-sm">Monitor license expirations and compliance</p>
                </motion.div>
              </div>

              {approvalView === 'pending' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#009689]">Pending Approvals</h2>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#009689]/40" />
                      <input
                        type="text"
                        placeholder="Search pharmacies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/40 backdrop-blur rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689]"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingPharmacies
                      .filter(p => p.pharmacy_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((pharmacy) => {
                        const pharmacyLicense = getLicenseByPharmacyId(pharmacy.pharmacy_id);
                        
                        return (
                          <motion.div
                            key={pharmacy.pharmacy_id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/50 hover:border-[#009689]/40 transition-all shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-[#009689] font-semibold text-lg mb-1">{pharmacy.pharmacy_name}</h3>
                                <p className="text-[#009689]/60 text-sm">Owner: {pharmacy.owner_name}</p>
                              </div>
                              <div className="px-3 py-1 bg-amber-500/20 text-amber-600 rounded-full text-xs font-semibold">
                                Pending
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-[#009689]/60 text-sm">
                                <Mail size={14} />
                                <span>{pharmacy.contact_email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#009689]/60 text-sm">
                                <Phone size={14} />
                                <span>{pharmacy.contact_phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#009689]/60 text-sm">
                                <MapPin size={14} />
                                <span>{pharmacy.address}</span>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <div className="text-[#009689]/70 text-sm mb-2">License Document</div>
                              <div
                                onClick={() => {
                                  setSelectedPharmacy(pharmacy);
                                  setShowLicenseModal(true);
                                }}
                                className="relative w-full h-32 bg-white/20 rounded-xl overflow-hidden cursor-pointer group"
                              >
                                {pharmacyLicense?.license_document_url ? (
                                  <img
                                    src={pharmacyLicense.license_document_url}
                                    alt="License"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <FileText size={32} className="text-[#009689]/40" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                                className="flex-1 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white py-2 rounded-xl font-semibold disabled:opacity-50 shadow-sm"
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRejectClick(pharmacy)}
                                disabled={isProcessing}
                                className="flex-1 bg-red-500/20 text-red-600 py-2 rounded-xl font-semibold border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                  {pendingPharmacies.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle size={48} className="text-[#009689]/20 mx-auto mb-4" />
                      <p className="text-[#009689]/40">No pending pharmacies</p>
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
                              ? 'bg-gradient-to-r from-[#009689] to-[#007a6f] text-white shadow-sm'
                              : 'bg-white/40 text-[#009689]/60 hover:bg-white/60'
                          }`}
                        >
                          {status === 'approved' ? 'Verified' : status}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#009689]/40" />
                      <input
                        type="text"
                        placeholder="Search pharmacies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/40 backdrop-blur rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689]"
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/30 backdrop-blur rounded-xl">
                        <tr className="border-b border-[#009689]/10">
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Pharmacy</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Address</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Contact</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Status</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Registered</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">License</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Owner</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPharmaciesList.map((pharmacy) => (
                          <motion.tr
                            key={pharmacy.pharmacy_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-[#009689]/10 hover:bg-white/20 transition-colors"
                          >
                            <td className="p-4">
                              <p className="text-[#009689] font-medium">{pharmacy.pharmacy_name}</p>
                            </td>
                            <td className="p-4 text-[#009689]/80 max-w-xs truncate">{pharmacy.address}</td>
                            <td className="p-4">
                              <div className="text-[#009689]/80 text-sm">{pharmacy.contact_phone}</div>
                              <div className="text-[#009689]/60 text-xs">{pharmacy.contact_email}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                pharmacy.is_verified ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600'
                              }`}>
                                {pharmacy.is_verified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="p-4 text-[#009689]/60 text-sm">
                              {new Date(pharmacy.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setSelectedPharmacy(pharmacy);
                                  setShowLicenseModal(true);
                                }}
                                className="text-[#009689] hover:text-[#007a6f] transition-colors"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                            <td className="p-4 text-[#009689]/80 text-sm">{pharmacy.owner_name}</td>
                           <td className="p-4">
  <div className="relative">
    <button 
      onClick={() => {
        // Toggle dropdown - close if same pharmacy, open if different
        setSelectedPharmacyForAction(
          selectedPharmacyForAction?.pharmacy_id === pharmacy.pharmacy_id ? null : pharmacy
        );
      }}
      className="text-[#009689]/60 hover:text-[#009689] transition-colors p-2 rounded-lg hover:bg-white/30 action-button"
    >
      <MoreVertical size={18} />
    </button>
    
    {/* Dropdown Menu */}
    {selectedPharmacyForAction?.pharmacy_id === pharmacy.pharmacy_id && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 action-dropdown">
        <div className="py-1">
          <button
            onClick={() => {
              setSelectedPharmacy(pharmacy);
              setShowLicenseModal(true);
              setSelectedPharmacyForAction(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Eye size={14} />
            View Details
          </button>
          
          {!pharmacy.is_verified && (
            <button
              onClick={() => {
                handleApproveClick(pharmacy);
                setSelectedPharmacyForAction(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
            >
              <CheckCircle size={14} />
              Approve Pharmacy
            </button>
          )}
          
          {!pharmacy.is_verified && (
            <button
              onClick={() => {
                handleRejectClick(pharmacy);
                setSelectedPharmacyForAction(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <XCircle size={14} />
              Reject Pharmacy
            </button>
          )}
          
          {pharmacy.is_verified && (
            <button
              onClick={() => {
                setPharmacyToDeactivate(pharmacy);
                setShowDeactivateConfirm(true);
                setSelectedPharmacyForAction(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
            >
              <AlertCircle size={14} />
              Deactivate Account
            </button>
          )}
          
          <button
            onClick={() => {
              window.location.href = `mailto:${pharmacy.contact_email}`;
              setSelectedPharmacyForAction(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
          >
            <Mail size={14} />
            Contact Pharmacy
          </button>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(pharmacy.pharmacy_id);
              toast.success('Pharmacy ID copied to clipboard');
              setSelectedPharmacyForAction(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2"
          >
            <FileText size={14} />
            Copy Pharmacy ID
          </button>
        </div>
      </div>
    )}
  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setLicenseFilter('all')}
                      className={`cursor-pointer bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur rounded-2xl p-6 border transition-all ${
                        licenseFilter === 'all' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-blue-500/30 hover:border-[#009689]/30'
                      }`}
                    >
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {allLicenses.length}
                      </div>
                      <div className="text-[#009689]/80">Total Licenses</div>
                      <div className="text-[#009689]/40 text-sm">All registered licenses</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setLicenseFilter('expired')}
                      className={`cursor-pointer bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur rounded-2xl p-6 border transition-all ${
                        licenseFilter === 'expired' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-red-500/30 hover:border-[#009689]/30'
                      }`}
                    >
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {allLicenses.filter(lic => getLicenseStatus(lic.expiry_date).status === 'expired').length}
                      </div>
                      <div className="text-[#009689]/80">Expired Licenses</div>
                      <div className="text-[#009689]/40 text-sm">Require immediate action</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setLicenseFilter('expiring')}
                      className={`cursor-pointer bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur rounded-2xl p-6 border transition-all ${
                        licenseFilter === 'expiring' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-yellow-500/30 hover:border-[#009689]/30'
                      }`}
                    >
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {allLicenses.filter(lic => getLicenseStatus(lic.expiry_date).status === 'expiring').length}
                      </div>
                      <div className="text-[#009689]/80">Expiring Soon</div>
                      <div className="text-[#009689]/40 text-sm">Within 30 days</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setLicenseFilter('valid')}
                      className={`cursor-pointer bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur rounded-2xl p-6 border transition-all ${
                        licenseFilter === 'valid' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-green-500/30 hover:border-[#009689]/30'
                      }`}
                    >
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {allLicenses.filter(lic => getLicenseStatus(lic.expiry_date).status === 'valid').length}
                      </div>
                      <div className="text-[#009689]/80">Valid Licenses</div>
                      <div className="text-[#009689]/40 text-sm">Active & compliant</div>
                    </motion.div>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLicenseFilter('all')}
                        className={`px-4 py-2 rounded-xl capitalize transition-all ${
                          licenseFilter === 'all'
                            ? 'bg-gradient-to-r from-[#009689] to-[#007a6f] text-white shadow-sm'
                            : 'bg-white/40 text-[#009689]/60 hover:bg-white/60'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setLicenseFilter('expired')}
                        className={`px-4 py-2 rounded-xl capitalize transition-all ${
                          licenseFilter === 'expired'
                            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm'
                            : 'bg-white/40 text-[#009689]/60 hover:bg-white/60'
                        }`}
                      >
                        Expired
                      </button>
                      <button
                        onClick={() => setLicenseFilter('expiring')}
                        className={`px-4 py-2 rounded-xl capitalize transition-all ${
                          licenseFilter === 'expiring'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm'
                            : 'bg-white/40 text-[#009689]/60 hover:bg-white/60'
                        }`}
                      >
                        Expiring Soon
                      </button>
                      <button
                        onClick={() => setLicenseFilter('valid')}
                        className={`px-4 py-2 rounded-xl capitalize transition-all ${
                          licenseFilter === 'valid'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
                            : 'bg-white/40 text-[#009689]/60 hover:bg-white/60'
                        }`}
                      >
                        Valid
                      </button>
                    </div>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#009689]/40" />
                      <input
                        type="text"
                        placeholder="Search by pharmacy name or license number..."
                        value={licenseSearchTerm}
                        onChange={(e) => setLicenseSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/40 backdrop-blur rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689] w-80"
                      />
                    </div>
                  </div>

                  <div className="bg-white/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-sm">
  {loadingLicenses ? (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={40} className="animate-spin text-[#009689]" />
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/30 backdrop-blur">
          <tr className="border-b border-[#009689]/10">
            <th className="text-left p-4 text-[#009689]/70 font-medium">License Image</th>
            <th className="text-left p-4 text-[#009689]/70 font-medium">Pharmacy Name</th>
            <th className="text-left p-4 text-[#009689]/70 font-medium">License Number</th>
            <th className="text-left p-4 text-[#009689]/70 font-medium">Expiry Date</th>
            <th className="text-left p-4 text-[#009689]/70 font-medium">Days Left</th>
            <th className="text-left p-4 text-[#009689]/70 font-medium">Pharmacy Status</th>
            <th className="text-left p-4 text-[#009689]/70 font-medium">License Status</th>
            <th className="text-left p-4 text-[#009689]/70 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const processedLicenses = allLicenses
              .filter(license => {
                if (licenseFilter === 'all') return true;
                const status = getLicenseStatus(license.expiry_date).status;
                return status === licenseFilter;
              })
              .filter(license => {
                const searchLower = licenseSearchTerm.toLowerCase();
                return license.pharmacy_name?.toLowerCase().includes(searchLower) ||
                       license.license_number?.toLowerCase().includes(searchLower);
              })
              .map(license => {
                const today = new Date();
                const expiry = new Date(license.expiry_date);
                const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
                const licenseStatus = getLicenseStatus(license.expiry_date);
                
                return {
                  ...license,
                  daysLeft,
                  licenseStatus
                };
              })
              .sort((a, b) => a.daysLeft - b.daysLeft);

            return processedLicenses.map((license) => {
              const { daysLeft, licenseStatus } = license;
              
              let rowBgClass = '';
              let rowBorderClass = '';
              if (daysLeft < 0) {
                rowBgClass = 'bg-red-50/50';
                rowBorderClass = 'border-l-4 border-l-red-500';
              } else if (daysLeft <= 7) {
                rowBgClass = 'bg-red-50/30';
                rowBorderClass = 'border-l-4 border-l-red-400';
              } else if (daysLeft <= 15) {
                rowBgClass = 'bg-orange-50/30';
                rowBorderClass = 'border-l-4 border-l-orange-400';
              } else if (daysLeft <= 30) {
                rowBgClass = 'bg-yellow-50/30';
                rowBorderClass = 'border-l-4 border-l-yellow-500';
              } else if (daysLeft <= 60) {
                rowBgClass = 'bg-green-50/20';
                rowBorderClass = 'border-l-4 border-l-green-400';
              }
              
              let daysLeftColor = '';
              let daysLeftBg = '';
              if (daysLeft < 0) {
                daysLeftColor = 'text-red-700';
                daysLeftBg = 'bg-red-100';
              } else if (daysLeft <= 7) {
                daysLeftColor = 'text-red-600';
                daysLeftBg = 'bg-red-100';
              } else if (daysLeft <= 15) {
                daysLeftColor = 'text-orange-600';
                daysLeftBg = 'bg-orange-100';
              } else if (daysLeft <= 30) {
                daysLeftColor = 'text-yellow-600';
                daysLeftBg = 'bg-yellow-100';
              } else if (daysLeft <= 60) {
                daysLeftColor = 'text-green-600';
                daysLeftBg = 'bg-green-100';
              } else {
                daysLeftColor = 'text-green-600';
                daysLeftBg = 'bg-green-50';
              }
              
              return (
                <motion.tr
                  key={license.license_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`border-b border-[#009689]/10 hover:bg-white/30 transition-all ${rowBgClass} ${rowBorderClass}`}
                >
                  {/* License Image Column */}
                  <td className="p-4">
                    <div
                      onClick={() => {
                        window.open(license.license_document_url, '_blank');
                      }}
                      className="relative w-16 h-16 bg-white/30 rounded-lg overflow-hidden cursor-pointer group shadow-sm"
                    >
                      {license.license_document_url ? (
                        <img
                          src={license.license_document_url}
                          alt="License"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <FileText size={24} className="text-[#009689]/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye size={16} className="text-white" />
                      </div>
                    </div>
                  </td>
                  
                  {/* Pharmacy Name Column */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#009689] to-[#007a6f] rounded-full flex items-center justify-center">
                        <Store size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[#009689] font-medium">{license.pharmacy_name || 'Unknown'}</p>
                        <p className="text-[#009689]/50 text-xs truncate max-w-[150px]">
                          {license.address?.substring(0, 40) || 'No address'}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  {/* License Number Column */}
                  <td className="p-4">
                    <p className="text-[#009689]/80 font-mono text-sm">{license.license_number}</p>
                  </td>
                  
                  {/* Expiry Date Column */}
                  <td className="p-4">
                    <p className={`font-semibold ${licenseStatus.textClass}`}>
                      {new Date(license.expiry_date).toLocaleDateString()}
                    </p>
                  </td>
                  
                  {/* Days Left Column */}
                  <td className="p-4">
                    <div className="flex flex-col items-start">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${daysLeftBg} ${daysLeftColor}`}>
                        {daysLeft < 0 ? (
                          <>Expired {Math.abs(daysLeft)} days ago</>
                        ) : daysLeft === 0 ? (
                          <>Expires today!</>
                        ) : (
                          <>{daysLeft} days left</>
                        )}
                      </span>
                      {daysLeft > 0 && daysLeft <= 90 && (
                        <div className="w-full mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                daysLeft <= 7 ? 'bg-red-500' :
                                daysLeft <= 15 ? 'bg-orange-500' :
                                daysLeft <= 30 ? 'bg-yellow-500' :
                                daysLeft <= 60 ? 'bg-green-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, (daysLeft / 90) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Pharmacy Status Column */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      license.is_verified 
                        ? 'bg-green-500/20 text-green-600' 
                        : 'bg-red-500/20 text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${license.is_verified ? 'bg-green-500' : 'bg-red-500'}`} />
                      {license.is_verified ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  {/* License Status Column */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${licenseStatus.bgClass} ${licenseStatus.textClass}`}>
                      <div className={`w-2 h-2 rounded-full ${
                        licenseStatus.color === 'red' ? 'bg-red-500 animate-pulse' : 
                        licenseStatus.color === 'yellow' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} />
                      {licenseStatus.text}
                    </span>
                  </td>
                  
                  {/* Actions Column with Dropdown */}
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => {
                          setSelectedLicenseForAction(
                            selectedLicenseForAction?.license_id === license.license_id ? null : license
                          );
                        }}
                        className="p-2 bg-gray-500/20 rounded-lg text-gray-600 hover:bg-gray-500/30 transition-colors"
                        title="More Actions"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {selectedLicenseForAction?.license_id === license.license_id && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <div className="py-1">
                            {/* View License Document */}
                            <button
                              onClick={() => {
                                window.open(license.license_document_url, '_blank');
                                setSelectedLicenseForAction(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <FileText size={14} />
                              View License Document
                            </button>
                            
                            {/* Extend License - for expiring licenses */}
                            {daysLeft <= 30 && daysLeft >= 0 && (
                              <button
                                onClick={() => {
                                  handleLicenseAction(license, 'extend');
                                  setSelectedLicenseForAction(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                              >
                                <Calendar size={14} />
                                Extend License
                              </button>
                            )}
                            
                            {/* Send Warning - for expiring soon */}
                            {daysLeft <= 15 && daysLeft >= 0 && (
                              <button
                                onClick={() => {
                                  handleLicenseAction(license, 'warning');
                                  setSelectedLicenseForAction(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                              >
                                <AlertCircle size={14} />
                                Send Warning
                              </button>
                            )}
                            
                            {/* Deactivate/Activate Pharmacy */}
                            <button
                              onClick={() => {
                                handleLicenseAction(license, license.is_verified ? 'deactivate' : 'activate');
                                setSelectedLicenseForAction(null);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                license.is_verified 
                                  ? 'text-red-600 hover:bg-red-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {license.is_verified ? <XCircle size={14} /> : <CheckCircle size={14} />}
                              {license.is_verified ? 'Deactivate Pharmacy' : 'Activate Pharmacy'}
                            </button>
                            
                            <hr className="my-1 border-gray-200" />
                            
                            {/* View Pharmacy Details */}
                            <button
                              onClick={() => {
                                // Open pharmacy details modal
                                const pharmacyObj: Pharmacy = {
                                  pharmacy_id: license.pharmacy_id,
                                  pharmacy_name: license.pharmacy_name || 'Unknown',
                                  latitude: license.latitude || 0,
                                  longitude: license.longitude || 0,
                                  address: license.address || '',
                                  contact_phone: license.contact_phone || '',
                                  contact_email: license.contact_email || '',
                                  operating_hours: license.operating_hours || '',
                                  user_id: '',
                                  is_verified: license.is_verified || false,
                                  created_at: '',
                                  verified_at: null,
                                  verified_by: null,
                                  verified_by_name: '',
                                  owner_name: '',
                                };
                                const licenseObj: License = {
                                  license_id: license.license_id,
                                  license_number: license.license_number,
                                  issue_date: license.issue_date,
                                  expiry_date: license.expiry_date,
                                  license_document_url: license.license_document_url,
                                  pharmacy_id: license.pharmacy_id,
                                  verification_status: license.verification_status,
                                };
                                setSelectedLicenseForDetails({ pharmacy: pharmacyObj, license: licenseObj });
                                setShowLicenseDetailsModal(true);
                                setSelectedLicenseForAction(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                            >
                              <Eye size={14} />
                              View Full Details
                            </button>
                            
                            {/* Contact Pharmacy */}
                            <button
                              onClick={() => {
                                window.location.href = `mailto:${license.contact_email}`;
                                setSelectedLicenseForAction(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                            >
                              <Mail size={14} />
                              Contact Pharmacy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            });
          })()}
        </tbody>
      </table>
    </div>
  )}
  
  {!loadingLicenses && allLicenses.length === 0 && (
    <div className="text-center py-12">
      <Calendar size={48} className="text-[#009689]/20 mx-auto mb-4" />
      <p className="text-[#009689]/40">No license information available</p>
    </div>
  )}
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
                  className={`relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border transition-all shadow-sm ${
                    subscriptionView === 'plans' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-white/50 hover:border-[#009689]/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Tag size={24} className="text-emerald-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      {subscriptionPlans.length} Plans
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Subscription Plans</h3>
                  <p className="text-[#009689]/60 text-sm">Manage pricing plans and durations</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSubscriptionView('requests')}
                  className={`relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border transition-all shadow-sm ${
                    subscriptionView === 'requests' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-white/50 hover:border-[#009689]/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                      <Clock size={24} className="text-amber-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      {pendingSubscriptions.length} Pending
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Pending Requests</h3>
                  <p className="text-[#009689]/60 text-sm">Review and approve subscription requests</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSubscriptionView('list')}
                  className={`relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border transition-all shadow-sm ${
                    subscriptionView === 'list' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-white/50 hover:border-[#009689]/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <CreditCard size={24} className="text-blue-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      {subscriptions.filter(s => s.verification_status === true).length} Active
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Active Subscriptions</h3>
                  <p className="text-[#009689]/60 text-sm">View all active subscriptions</p>
                </motion.div>

                <motion.div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <DollarSign size={24} className="text-purple-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      Monthly
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Revenue Overview</h3>
                  <p className="text-[#009689] text-2xl font-bold">
                    ${subscriptionPlans.reduce((sum, plan) => sum + (plan.price * 5), 0).toLocaleString()}
                  </p>
                  <p className="text-[#009689]/60 text-sm">Estimated monthly revenue</p>
                </motion.div>
              </div>

              {subscriptionView === 'plans' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#009689]">Subscription Plans</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingPlan(null);
                        setPlanFormData({ plan_name: '', description: '', duration_days: 30, price: 0 });
                        setShowPlanModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm"
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
                        className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/50 hover:border-[#009689]/30 transition-all shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-[#009689] font-bold text-xl mb-1">{plan.plan_name}</h3>
                            <p className="text-[#009689]/60 text-sm">{plan.description || 'No description'}</p>
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
                              className="p-2 bg-blue-500/20 rounded-lg text-blue-600 hover:bg-blue-500/30 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteSubscriptionPlan(plan.plan_id)}
                              className="p-2 bg-red-500/20 rounded-lg text-red-600 hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[#009689]/60">Duration</span>
                            <span className="text-[#009689] font-semibold">{plan.duration_days} days</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#009689]/60">Price</span>
                            <span className="text-[#009689] font-bold text-xl">${plan.price}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/30">
                          <div className="text-[#009689]/40 text-xs">Created: {new Date(plan.created_at).toLocaleDateString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {subscriptionPlans.length === 0 && (
                    <div className="text-center py-12">
                      <Tag size={48} className="text-[#009689]/20 mx-auto mb-4" />
                      <p className="text-[#009689]/40">No subscription plans found</p>
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="mt-4 px-4 py-2 bg-[#009689] text-white rounded-lg"
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
                    <h2 className="text-xl font-semibold text-[#009689]">Pending Subscription Requests</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {pendingSubscriptions.map((subscription) => (
                      <motion.div
                        key={subscription.subscription_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/50 hover:border-[#009689]/30 transition-all shadow-sm"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-amber-500/20 rounded-xl">
                                <Store size={20} className="text-amber-600" />
                              </div>
                              <div>
                                <h3 className="text-[#009689] font-semibold text-lg">{subscription.pharmacy_name || 'Unknown Pharmacy'}</h3>
                                <p className="text-[#009689]/60 text-sm">Subscription ID: {subscription.subscription_id.slice(0, 8)}...</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-[#009689]/60 text-sm mb-1">Requested Plan</p>
                                <p className="text-[#009689] font-medium">{subscription.plan_name || 'Unknown Plan'}</p>
                              </div>
                              <div>
                                <p className="text-[#009689]/60 text-sm mb-1">Request Date</p>
                                <p className="text-[#009689]">{new Date(subscription.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>

                            {subscription.receipt_image_url && (
                              <div className="mb-4">
                                <p className="text-[#009689]/60 text-sm mb-2">Payment Receipt</p>
                                <a
                                  href={subscription.receipt_image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-white/30 rounded-lg text-[#009689] hover:bg-white/50 transition-colors"
                                >
                                  <Eye size={16} />
                                  View Receipt
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <label className="text-[#009689]/60 text-sm">Select Plan</label>
                            <select
                              value={subscription.plan_id}
                              onChange={(e) => {
                                const updatedSub = { ...subscription, plan_id: e.target.value };
                                setSelectedSubscription(updatedSub);
                                setSelectedPlanForSubscription(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-2 bg-white/40 rounded-xl border border-white/50 text-[#009689] focus:outline-none focus:border-[#009689]"
                            >
                              {subscriptionPlans.map(plan => (
                                <option key={plan.plan_id} value={plan.plan_id} className="bg-white">
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
                                className="flex-1 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white py-2 rounded-xl font-semibold shadow-sm"
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => rejectSubscription(subscription)}
                                className="flex-1 bg-red-500/20 text-red-600 py-2 rounded-xl font-semibold border border-red-500/30 hover:bg-red-500/30 transition-colors"
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
                      <CheckCircle size={48} className="text-[#009689]/20 mx-auto mb-4" />
                      <p className="text-[#009689]/40">No pending subscription requests</p>
                    </div>
                  )}
                </div>
              )}

              {subscriptionView === 'list' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#009689]">Active Subscriptions</h2>
                    <button
                      onClick={fetchSubscriptions}
                      className="p-2 bg-white/40 rounded-xl text-[#009689]/70 hover:text-[#009689] transition-colors"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/30 backdrop-blur rounded-xl">
                        <tr className="border-b border-[#009689]/10">
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Pharmacy</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Plan</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Start Date</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">End Date</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Status</th>
                          <th className="text-left p-4 text-[#009689]/60 font-medium">Verified By</th>
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
                              className="border-b border-[#009689]/10 hover:bg-white/20 transition-colors"
                            >
                              <td className="p-4">
                                <p className="text-[#009689] font-medium">{subscription.pharmacy_name || 'Unknown'}</p>
                                <p className="text-[#009689]/40 text-xs">{subscription.subscription_id.slice(0, 8)}...</p>
                               </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 rounded-full text-xs font-semibold">
                                  {subscription.plan_name}
                                </span>
                               </td>
                              <td className="p-4 text-[#009689]/80">
                                {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : '-'}
                               </td>
                              <td className="p-4">
                                <span className={new Date(subscription.end_date || '') < new Date() ? 'text-red-600' : 'text-[#009689]/80'}>
                                  {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : '-'}
                                </span>
                               </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-semibold">
                                  Active
                                </span>
                               </td>
                              <td className="p-4 text-[#009689]/60 text-sm">
                                {subscription.verified_by || 'System'}
                               </td>
                            </motion.tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {subscriptions.filter(s => s.verification_status === true).length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard size={48} className="text-[#009689]/20 mx-auto mb-4" />
                      <p className="text-[#009689]/40">No active subscriptions found</p>
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
                  className={`relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border transition-all shadow-sm ${
                    adView === 'plans' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-white/50 hover:border-[#009689]/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Tag size={24} className="text-emerald-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      {advertisementPlans.length} Plans
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Ad Plans</h3>
                  <p className="text-[#009689]/60 text-sm">Manage advertisement pricing</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setAdView('requests')}
                  className={`relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border transition-all shadow-sm ${
                    adView === 'requests' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-white/50 hover:border-[#009689]/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                      <Clock size={24} className="text-amber-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      {pendingAdvertisements.length} Pending
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Pending Ads</h3>
                  <p className="text-[#009689]/60 text-sm">Review advertisement requests</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setAdView('list')}
                  className={`relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border transition-all shadow-sm ${
                    adView === 'list' ? 'border-[#009689] shadow-lg shadow-[#009689]/20' : 'border-white/50 hover:border-[#009689]/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Megaphone size={24} className="text-blue-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      {activeAdvertisements.length} Active
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Active Ads</h3>
                  <p className="text-[#009689]/60 text-sm">View running advertisements</p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={calculateRealRevenue}
                  className="relative cursor-pointer bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/50 hover:border-[#009689]/30 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <DollarSign size={24} className="text-purple-600" />
                    </div>
                    <div className="bg-[#009689] text-white px-2 py-1 rounded-full text-xs font-bold">
                      Revenue
                    </div>
                  </div>
                  <h3 className="text-[#009689] font-semibold text-lg mb-1">Ad Revenue</h3>
                  <p className="text-[#009689] text-2xl font-bold">
                    ${advertisements
                      .filter(ad => ad.verification_status === true)
                      .reduce((sum, ad) => {
                        const plan = advertisementPlans.find(p => p.plan_id === ad.plan_id);
                        return sum + (plan?.price || 0);
                      }, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-[#009689]/60 text-sm">Click to see breakdown</p>
                </motion.div>
              </div>

              {adView === 'plans' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#009689]">Advertisement Plans</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingAdPlan(null);
                        setAdPlanFormData({ plan_name: '', description: '', duration_days: 30, price: 0, display_interval: 5 });
                        setShowAdPlanModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm"
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
                        className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/50 hover:border-[#009689]/30 transition-all shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-[#009689] font-bold text-xl mb-1">{plan.plan_name}</h3>
                            <p className="text-[#009689]/60 text-sm">{plan.description || 'No description'}</p>
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
                              className="p-2 bg-blue-500/20 rounded-lg text-blue-600 hover:bg-blue-500/30 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteAdvertisementPlan(plan.plan_id)}
                              className="p-2 bg-red-500/20 rounded-lg text-red-600 hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[#009689]/60">Duration</span>
                            <span className="text-[#009689] font-semibold">{plan.duration_days} days</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#009689]/60">Price</span>
                            <span className="text-[#009689] font-bold text-xl">${plan.price}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/30">
                          <div className="text-[#009689]/40 text-xs">Created: {new Date(plan.created_at).toLocaleDateString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {advertisementPlans.length === 0 && (
                    <div className="text-center py-12">
                      <Tag size={48} className="text-[#009689]/20 mx-auto mb-4" />
                      <p className="text-[#009689]/40">No advertisement plans found</p>
                      <button
                        onClick={() => setShowAdPlanModal(true)}
                        className="mt-4 px-4 py-2 bg-[#009689] text-white rounded-lg"
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
                    <h2 className="text-xl font-semibold text-[#009689]">Pending Ad Requests</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {pendingAdvertisements.map((advertisement) => (
                      <motion.div
                        key={advertisement.ad_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 hover:border-[#009689]/30 transition-all shadow-sm"
                      >
                        <div className="grid md:grid-cols-2 gap-0">
                          <div className="relative h-64 md:h-auto bg-gradient-to-br from-[#009689]/10 to-[#007a6f]/10 overflow-hidden group">
                            {advertisement.advertisement_image ? (
                              <img
                                src={advertisement.advertisement_image}
                                alt={advertisement.ad_title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center">
                                <Image size={48} className="text-[#009689]/30 mb-2" />
                                <p className="text-[#009689]/40 text-sm">No image</p>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setPreviewAd(advertisement);
                                setShowAdPreviewModal(true);
                              }}
                              className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur rounded-lg text-white text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Eye size={14} />
                              Preview
                            </button>
                          </div>

                          <div className="p-6">
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-amber-600 text-xs font-semibold px-2 py-0.5 bg-amber-500/20 rounded-full">
                                  Pending
                                </span>
                              </div>
                              <h3 className="text-[#009689] font-bold text-xl mb-1">{advertisement.ad_title}</h3>
                              <p className="text-[#009689]/60 text-sm">{advertisement.pharmacy_name}</p>
                            </div>

                            <div className="space-y-3 mb-4">
                              <p className="text-[#009689]/80 text-sm">{advertisement.ad_content || 'No content'}</p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[#009689]/60 text-xs">Plan</p>
                                  <p className="text-[#009689] text-sm">{advertisement.plan_name}</p>
                                </div>
                                <div>
                                  <p className="text-[#009689]/60 text-xs">Requested</p>
                                  <p className="text-[#009689] text-sm">{new Date(advertisement.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>

                            {advertisement.receipt_image_url && (
                              <a                                href={advertisement.receipt_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#009689] text-sm mb-4"
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
                                className="flex-1 px-3 py-2 bg-white/40 rounded-xl border border-white/50 text-[#009689] text-sm"
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
                                className="flex-1 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white py-2 rounded-xl font-semibold text-sm shadow-sm"
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => rejectAdvertisement(advertisement)}
                                className="flex-1 bg-red-500/20 text-red-600 py-2 rounded-xl font-semibold border border-red-500/30 text-sm"
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
                      <CheckCircle size={48} className="text-[#009689]/20 mx-auto mb-4" />
                      <p className="text-[#009689]/40">No pending ad requests</p>
                    </div>
                  )}
                </div>
              )}

              {adView === 'list' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#009689]">Active Ads</h2>
                    <button
                      onClick={fetchAdvertisements}
                      className="p-2 bg-white/40 rounded-xl text-[#009689]/70 hover:text-[#009689] transition-colors"
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
                        className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 hover:border-[#009689]/30 transition-all cursor-pointer shadow-sm"
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
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#009689]/20 to-[#007a6f]/20">
                              <Image size={40} className="text-[#009689]/40" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 px-2 py-1 bg-[#009689] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
                            <Play size={10} />
                            Live
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <h3 className="text-white font-bold text-lg">{ad.ad_title}</h3>
                            <p className="text-white/80 text-sm">{ad.pharmacy_name}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-[#009689]/60 text-sm line-clamp-2">{ad.ad_content}</p>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/30">
                            <div>
                              <p className="text-[#009689]/40 text-xs">{ad.plan_name}</p>
                              <p className="text-[#009689]/40 text-xs">
                                {ad.start_date && new Date(ad.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[#009689]">
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
                      <Megaphone size={48} className="text-[#009689]/20 mx-auto mb-4" />
                      <p className="text-[#009689]/40">No active ads</p>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUsersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-6xl w-full max-h-[85vh] bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#009689] to-[#007a6f] p-6 border-b border-white/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Users size={28} />
                      System Users
                    </h2>
                    <p className="text-white/70 mt-1">Total {users.length} users registered</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={fetchUsers}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
                    >
                      <RefreshCw size={20} className={loadingUsers ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => setShowUsersModal(false)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/30 backdrop-blur rounded-xl border border-white/40 text-[#009689] placeholder-white/60 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-[#009689]" />
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white/50 backdrop-blur">
                      <tr className="border-b border-[#009689]/10">
                        <th className="text-left p-4 text-[#009689]/70 font-medium">User</th>
                        <th className="text-left p-4 text-[#009689]/70 font-medium">Email</th>
                        <th className="text-left p-4 text-[#009689]/70 font-medium">Phone</th>
                        <th className="text-left p-4 text-[#009689]/70 font-medium">Role</th>
                        <th className="text-left p-4 text-[#009689]/70 font-medium">Status</th>
                        <th className="text-left p-4 text-[#009689]/70 font-medium">Joined</th>
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
                            className="border-b border-[#009689]/10 hover:bg-white/30 transition-colors group"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#009689] to-[#007a6f] rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-white font-semibold">
                                    {user.full_name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-[#009689] font-medium">{user.full_name}</p>
                                  <p className="text-[#009689]/50 text-sm">ID: {user.user_id?.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-[#009689]/50" />
                                <span className="text-[#009689]/80">{user.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-[#009689]/50" />
                                <span className="text-[#009689]/80">{user.phone || 'Not provided'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role_name)}`}>
                                {user.role_name || 'User'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                                user.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                              }`}>
                                {user.is_active ? <UserCheck size={12} /> : <UserX size={12} />}
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-[#009689]/50" />
                                <span className="text-[#009689]/60 text-sm">
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
                    <Users size={48} className="text-[#009689]/20 mx-auto mb-4" />
                    <p className="text-[#009689]/40">No users found</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white/60 backdrop-blur p-4 border-t border-[#009689]/10">
                <div className="flex justify-between items-center">
                  <div className="text-[#009689]/60 text-sm">
                    Showing {users.filter(u => 
                      u.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                    ).length} of {users.length} users
                  </div>
                  <button
                    onClick={() => setShowUsersModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-sm"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPharmaciesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-6xl w-full max-h-[85vh] bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#009689] to-[#007a6f] p-6 border-b border-white/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Building2 size={28} />
                      {pharmacyModalType === 'total' && 'All Pharmacies'}
                      {pharmacyModalType === 'active' && 'Active Pharmacies'}
                      {pharmacyModalType === 'inactive' && 'Inactive Pharmacies'}
                      {pharmacyModalType === 'subscribed' && 'Subscribed Pharmacies'}
                    </h2>
                    <p className="text-white/70 mt-1">
                      Total {filteredPharmacies.length} pharmacies {pharmacyModalType !== 'total' && `(${pharmacyModalType})`}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={fetchPharmacies}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
                    >
                      <RefreshCw size={20} className={loadingPharmacies ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => setShowPharmaciesModal(false)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search pharmacies by name, email, or phone..."
                    value={pharmacySearchTerm}
                    onChange={(e) => setPharmacySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/30 backdrop-blur rounded-xl border border-white/40 text-[#009689] placeholder-white/60 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6">
                {loadingPharmacies ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-[#009689]" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredPharmacies.map((pharmacy, index) => (
                      <motion.div
                        key={pharmacy.pharmacy_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/30 backdrop-blur rounded-xl p-5 border border-white/40 hover:border-[#009689]/40 transition-all hover:bg-white/40 cursor-pointer shadow-sm"
                        onClick={() => {
                          setSelectedPharmacy(pharmacy);
                          setShowLicenseModal(true);
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-[#009689] font-semibold text-lg">{pharmacy.pharmacy_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            pharmacy.is_verified ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600'
                          }`}>
                            {pharmacy.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-[#009689]/70">
                            <Phone size={14} className="text-[#009689]" />
                            <span>{pharmacy.contact_phone || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#009689]/70">
                            <Mail size={14} className="text-[#009689]" />
                            <span>{pharmacy.contact_email || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#009689]/70">
                            <Calendar size={14} className="text-[#009689]" />
                            <span>Registered: {new Date(pharmacy.created_at).toLocaleDateString()}</span>
                          </div>
                          {pharmacy.verified_at && (
                            <div className="flex items-center gap-2 text-[#009689]/70">
                              <CheckCircle size={14} className="text-[#009689]" />
                              <span>Verified: {new Date(pharmacy.verified_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          {pharmacy.owner_name && (
                            <div className="flex items-center gap-2 text-[#009689]/70">
                              <Users size={14} className="text-[#009689]" />
                              <span>Owner: {pharmacy.owner_name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-white/30">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPharmacy(pharmacy);
                              setShowLicenseModal(true);
                            }}
                            className="text-[#009689] hover:text-[#007a6f] text-sm flex items-center gap-1 transition-colors"
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
                    <Building2 size={48} className="text-[#009689]/20 mx-auto mb-4" />
                    <p className="text-[#009689]/40">No pharmacies found</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white/60 backdrop-blur p-4 border-t border-[#009689]/10">
                <div className="flex justify-between items-center">
                  <div className="text-[#009689]/60 text-sm">
                    Showing {filteredPharmacies.length} of {getFilteredPharmacies().length} pharmacies
                  </div>
                  <button
                    onClick={() => setShowPharmaciesModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-sm"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
              className="relative max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#009689] to-[#007a6f] p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
                    </h2>
                    <p className="text-white/70 mt-1">
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
                    <label className="text-[#009689]/70 text-sm block mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={planFormData.plan_name}
                      onChange={(e) => setPlanFormData({ ...planFormData, plan_name: e.target.value })}
                      placeholder="e.g., Basic, Premium, Enterprise"
                      className="w-full px-4 py-2 bg-white/60 rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689]"
                    />
                  </div>

                  <div>
                    <label className="text-[#009689]/70 text-sm block mb-2">Description (Optional)</label>
                    <textarea
                      value={planFormData.description}
                      onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                      placeholder="Describe what this plan includes..."
                      rows={3}
                      className="w-full px-4 py-2 bg-white/60 rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#009689]/70 text-sm block mb-2">Duration (Days)</label>
                    <input
                      type="number"
                      value={planFormData.duration_days}
                      onChange={(e) => setPlanFormData({ ...planFormData, duration_days: parseInt(e.target.value) || 0 })}
                      placeholder="30, 90, 365"
                      className="w-full px-4 py-2 bg-white/60 rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689]"
                    />
                  </div>

                  <div>
                    <label className="text-[#009689]/70 text-sm block mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={planFormData.price}
                      onChange={(e) => setPlanFormData({ ...planFormData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-white/60 rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={editingPlan ? updateSubscriptionPlan : createSubscriptionPlan}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
                    className="flex-1 bg-white/40 hover:bg-white/60 text-[#009689] py-2.5 rounded-xl font-semibold border border-white/50 transition-colors"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApproveSubscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#009689] to-[#007a6f] p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Confirm Approval</h2>
                    <p className="text-white/70 mt-1">Approve subscription request</p>
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
                <p className="text-[#009689]/70 mb-4">
                  Are you sure you want to approve this subscription for <strong className="text-[#009689]">{selectedSubscription.pharmacy_name}</strong>?
                </p>
                
                {selectedPlanForSubscription && (
                  <div className="bg-white/50 rounded-xl p-3 mb-4">
                    <p className="text-[#009689]/60 text-sm">Selected Plan:</p>
                    <p className="text-[#009689] font-semibold">
                      {subscriptionPlans.find(p => p.plan_id === selectedPlanForSubscription)?.plan_name}
                    </p>
                    <p className="text-[#009689]/60 text-sm mt-1">
                      Duration: {subscriptionPlans.find(p => p.plan_id === selectedPlanForSubscription)?.duration_days} days
                    </p>
                  </div>
                )}
                
                <p className="text-[#009689]/50 text-sm mb-6">
                  The subscription will start today and expire based on the selected plan's duration.
                </p>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={approveSubscription}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
                    className="flex-1 bg-white/40 hover:bg-white/60 text-[#009689] py-2.5 rounded-xl font-semibold border border-white/50 transition-colors"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLicenseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLicenseModal(false)}
                className="absolute top-4 right-4 text-[#009689]/60 hover:text-[#009689]"
              >
                <X size={24} />
              </button>
              <h3 className="text-[#009689] text-2xl font-bold mb-4">Pharmacy Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[#009689]/60 text-sm">Pharmacy Name</p>
                  <p className="text-[#009689] font-semibold">{selectedPharmacy.pharmacy_name}</p>
                </div>
                <div>
                  <p className="text-[#009689]/60 text-sm">Contact Email</p>
                  <p className="text-[#009689]">{selectedPharmacy.contact_email}</p>
                </div>
                <div>
                  <p className="text-[#009689]/60 text-sm">Contact Phone</p>
                  <p className="text-[#009689]">{selectedPharmacy.contact_phone}</p>
                </div>
                <div>
                  <p className="text-[#009689]/60 text-sm">Address</p>
                  <p className="text-[#009689]">{selectedPharmacy.address}</p>
                </div>
                <div>
                  <p className="text-[#009689]/60 text-sm">Operating Hours</p>
                  <p className="text-[#009689]">{selectedPharmacy.operating_hours || 'Not specified'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#009689]/60 text-sm">Registered Date</p>
                    <p className="text-[#009689]">{new Date(selectedPharmacy.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[#009689]/60 text-sm">Verification Status</p>
                    <p className={`font-semibold ${selectedPharmacy.is_verified ? 'text-green-600' : 'text-amber-600'}`}>
                      {selectedPharmacy.is_verified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>
                {selectedPharmacy.verified_at && (
                  <div>
                    <p className="text-[#009689]/60 text-sm">Verified Date</p>
                    <p className="text-[#009689]">{new Date(selectedPharmacy.verified_at).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedPharmacy.verified_by_name && (
                  <div>
                    <p className="text-[#009689]/60 text-sm">Verified By</p>
                    <p className="text-[#009689]">{selectedPharmacy.verified_by_name}</p>
                  </div>
                )}
                {selectedPharmacy.latitude && selectedPharmacy.longitude && (
                  <div>
                    <p className="text-[#009689]/60 text-sm">Location Coordinates</p>
                    <p className="text-[#009689]">Lat: {selectedPharmacy.latitude}, Lng: {selectedPharmacy.longitude}</p>
                  </div>
                )}
{(() => {
  const pharmacyLicense = getLicenseByPharmacyId(selectedPharmacy.pharmacy_id);
  return pharmacyLicense && (
    <div className="mt-4 pt-4 border-t border-white/30">
      <p className="text-[#009689] font-semibold mb-2">License Information</p>
      <div className="space-y-2">
        <div>
          <p className="text-[#009689]/60 text-sm">License Number</p>
          <p className="text-[#009689]">{pharmacyLicense.license_number}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[#009689]/60 text-sm">Issue Date</p>
            <p className="text-[#009689]">{new Date(pharmacyLicense.issue_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-[#009689]/60 text-sm">Expiry Date</p>
            <p className="text-[#009689]">{new Date(pharmacyLicense.expiry_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <p className="text-[#009689]/60 text-sm">License Document</p>
          
          {/* Clickable image that opens in new tab */}
          <a 
            href={pharmacyLicense.license_document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative w-full h-64 bg-white/20 rounded-xl overflow-hidden cursor-pointer group mt-2"
          >
            <img
              src={pharmacyLicense.license_document_url}
              alt="License Document"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 rounded-lg px-3 py-1.5 flex items-center gap-2 text-[#009689] text-sm font-medium">
                <ExternalLink size={14} />
                Click to open
              </div>
            </div>
          </a>
          
          <a 
            href={pharmacyLicense.license_document_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#009689] hover:text-[#007a6f] text-sm flex items-center gap-1 mt-2"
          >
            <ExternalLink size={14} />
            Open License Document in New Tab
          </a>
        </div>
      </div>
    </div>
  );
})()}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelLogout}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <LogOut size={28} className="text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#009689]">Confirm Logout</h3>
                </div>
                
                <p className="text-[#009689]/70 mb-6">
                  Are you sure you want to logout? You will need to login again to access your account.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmLogout}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 rounded-xl font-semibold shadow-sm"
                  >
                    Yes, Logout
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelLogout}
                    className="flex-1 bg-white/40 hover:bg-white/60 text-[#009689] py-2.5 rounded-xl font-semibold border border-white/50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Confirmation Modal with License Validation */}
      <AnimatePresence>
        {showApproveConfirm && selectedPharmacyForAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelApprove}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#009689] to-[#007a6f] p-6 sticky top-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <CheckCircle size={28} />
                      Confirm Approval & Validate License
                    </h2>
                    <p className="text-white/70 mt-1">Review license information before approving</p>
                  </div>
                  <button
                    onClick={cancelApprove}
                    className="text-white/60 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Pharmacy Info */}
                <div className="bg-white/30 rounded-xl p-4">
                  <h3 className="font-semibold text-[#009689] mb-2">Pharmacy Information</h3>
                  <p className="text-[#009689]"><strong>Name:</strong> {selectedPharmacyForAction.pharmacy_name}</p>
                  <p className="text-[#009689]"><strong>Email:</strong> {selectedPharmacyForAction.contact_email}</p>
                  <p className="text-[#009689]"><strong>Phone:</strong> {selectedPharmacyForAction.contact_phone}</p>
                </div>

                {/* License Information with Validation */}
{(() => {
  const pharmacyLicense = getLicenseByPharmacyId(selectedPharmacyForAction.pharmacy_id);
  return pharmacyLicense && (
    <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
      <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
        <AlertCircle size={18} />
        License Verification Required
      </h3>
      
      <p className="text-amber-700 text-sm mb-4">
        Please verify that the entered dates match the license document:
      </p>
      
      <div className="mb-4">
        <p className="text-[#009689]/70 text-sm mb-2">License Document Uploaded by Pharmacy</p>
        
        {/* Clickable image that opens in new tab */}
        <a 
          href={pharmacyLicense.license_document_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative w-full h-64 bg-white rounded-xl overflow-hidden border border-amber-200 cursor-pointer group"
        >
          <img
            src={pharmacyLicense.license_document_url}
            alt="License Document"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/90 rounded-lg px-4 py-2 flex items-center gap-2 text-[#009689] font-medium shadow-md">
              <ExternalLink size={16} />
              Click to open in new tab
            </div>
          </div>
        </a>
        
        {/* Text link as secondary option */}
        <a 
          href={pharmacyLicense.license_document_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[#009689] mt-2 hover:underline"
        >
          <ExternalLink size={14} />
          Open in new tab for detailed view
        </a>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-amber-200">
        <div>
          <p className="text-[#009689]/60 text-sm">Entered Issue Date</p>
          <p className="text-[#009689] font-semibold">
            {new Date(pharmacyLicense.issue_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-[#009689]/60 text-sm">Entered Expiry Date</p>
          <p className="text-[#009689] font-semibold">
            {new Date(pharmacyLicense.expiry_date).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <label className="flex items-center gap-3 p-3 bg-white/50 rounded-lg cursor-pointer hover:bg-white/70 transition-colors">
          <input 
            type="checkbox" 
            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            checked={licenseNumberValid}
            onChange={(e) => setLicenseNumberValid(e.target.checked)}
          />
          <span className="text-[#009689]">✓ License number matches the document</span>
        </label>
        
        <label className="flex items-center gap-3 p-3 bg-white/50 rounded-lg cursor-pointer hover:bg-white/70 transition-colors">
          <input 
            type="checkbox" 
            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            checked={issueDateValid}
            onChange={(e) => setIssueDateValid(e.target.checked)}
          />
          <span className="text-[#009689]">✓ Issue date matches the document</span>
        </label>
        
        <label className="flex items-center gap-3 p-3 bg-white/50 rounded-lg cursor-pointer hover:bg-white/70 transition-colors">
          <input 
            type="checkbox" 
            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            checked={expiryDateValid}
            onChange={(e) => setExpiryDateValid(e.target.checked)}
          />
          <span className="text-[#009689]">✓ Expiry date matches the document</span>
        </label>
        
        <label className="flex items-center gap-3 p-3 bg-white/50 rounded-lg cursor-pointer hover:bg-white/70 transition-colors">
          <input 
            type="checkbox" 
            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            checked={documentClear}
            onChange={(e) => setDocumentClear(e.target.checked)}
          />
          <span className="text-[#009689]">✓ Document is clear and readable</span>
        </label>
      </div>
    </div>
  );
})()}

                <p className="text-[#009689]/60 text-sm bg-blue-50 p-3 rounded-lg">
                  ⚠️ <strong>Important:</strong> By approving this pharmacy, you confirm that all license information matches the uploaded document. 
                  Incorrect information may lead to legal issues.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmApprove}
                    disabled={isProcessing || !allValidationsPassed()}
                    className="flex-1 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Approving...
                      </div>
                    ) : (
                      'Yes, Approve (License Verified)'
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelApprove}
                    className="flex-1 bg-white/40 hover:bg-white/60 text-[#009689] py-2.5 rounded-xl font-semibold border border-white/50 transition-colors"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelReject}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <XCircle size={28} className="text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#009689]">Confirm Rejection</h3>
                </div>
                
                <p className="text-[#009689]/70 mb-2">
                  Are you sure you want to reject <strong className="text-red-600">{selectedPharmacyForAction.pharmacy_name}</strong>?
                </p>
                <p className="text-[#009689]/50 text-sm mb-6">
                  This action cannot be undone. The pharmacy will be permanently removed from the system.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmReject}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 shadow-sm"
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
                    className="flex-1 bg-white/40 hover:bg-white/60 text-[#009689] py-2.5 rounded-xl font-semibold border border-white/50 transition-colors"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
              className="relative max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#009689] to-[#007a6f] p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingAdPlan ? 'Edit Advertisement Plan' : 'Create New Ad Plan'}
                    </h2>
                    <p className="text-white/70 mt-1">
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
                    <label className="text-[#009689]/70 text-sm block mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={adPlanFormData.plan_name}
                      onChange={(e) => setAdPlanFormData({ ...adPlanFormData, plan_name: e.target.value })}
                      placeholder="e.g., Skincare, New product..."
                      className="w-full px-4 py-2 bg-white/60 rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689]"
                    />
                  </div>

                  <div>
                    <label className="text-[#009689]/70 text-sm block mb-2">Description (Optional)</label>
                    <textarea
                      value={adPlanFormData.description}
                      onChange={(e) => setAdPlanFormData({ ...adPlanFormData, description: e.target.value })}
                      placeholder="Describe what this ad plan includes..."
                      rows={3}
                      className="w-full px-4 py-2 bg-white/60 rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#009689]/70 text-sm block mb-2">Duration (Days)</label>
                    <input
                      type="number"
                      value={adPlanFormData.duration_days}
                      onChange={(e) => setAdPlanFormData({ ...adPlanFormData, duration_days: parseInt(e.target.value) || 0 })}
                      placeholder="7, 14, 30"
                      className="w-full px-4 py-2 bg-white/60 rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689]"
                    />
                  </div>

                  <div>
                    <label className="text-[#009689]/70 text-sm block mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adPlanFormData.price}
                      onChange={(e) => setAdPlanFormData({ ...adPlanFormData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-white/60 rounded-xl border border-white/50 text-[#009689] placeholder-[#009689]/40 focus:outline-none focus:border-[#009689]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={editingAdPlan ? updateAdvertisementPlan : createAdvertisementPlan}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
                    className="flex-1 bg-white/40 hover:bg-white/60 text-[#009689] py-2.5 rounded-xl font-semibold border border-white/50 transition-colors"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApproveAdModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#009689] to-[#007a6f] p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Confirm Approval</h2>
                    <p className="text-white/70 mt-1">Approve advertisement request</p>
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
                <p className="text-[#009689]/70 mb-4">
                  Are you sure you want to approve this advertisement for <strong className="text-[#009689]">{selectedAdvertisement.pharmacy_name}</strong>?
                </p>
                
                {selectedPlanForAd && (
                  <div className="bg-white/50 rounded-xl p-3 mb-4">
                    <p className="text-[#009689]/60 text-sm">Selected Plan:</p>
                    <p className="text-[#009689] font-semibold">
                      {advertisementPlans.find(p => p.plan_id === selectedPlanForAd)?.plan_name}
                    </p>
                    <p className="text-[#009689]/60 text-sm mt-1">
                      Duration: {advertisementPlans.find(p => p.plan_id === selectedPlanForAd)?.duration_days} days
                    </p>
                  </div>
                )}
                
                <p className="text-[#009689]/50 text-sm mb-6">
                  The advertisement will start today and expire based on the selected plan's duration. It will automatically be removed from the landing page after expiry.
                </p>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={approveAdvertisement}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
                    className="flex-1 bg-white/40 hover:bg-white/60 text-[#009689] py-2.5 rounded-xl font-semibold border border-white/50 transition-colors"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAdPreviewModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/40 rounded-full text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-80 md:h-full bg-gradient-to-br from-[#009689]/20 to-[#007a6f]/20">
                  {previewAd.advertisement_image ? (
                    <img
                      src={previewAd.advertisement_image}
                      alt={previewAd.ad_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Image size={64} className="text-[#009689]/30" />
                      <p className="text-[#009689]/50 mt-2">No image available</p>
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="px-3 py-1 bg-[#009689]/20 text-[#009689] rounded-full text-xs font-semibold">
                        {previewAd.plan_name}
                      </div>
                      {previewAd.verification_status && (
                        <div className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Play size={10} />
                          Live
                        </div>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold text-[#009689] mb-2">{previewAd.ad_title}</h2>
                    <p className="text-[#009689] text-sm">{previewAd.pharmacy_name}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="text-[#009689]/60 text-sm mb-1">Ad Content</h3>
                      <p className="text-[#009689]/80 leading-relaxed">{previewAd.ad_content || 'No content provided'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/30">
                      <div>
                        <p className="text-[#009689]/40 text-xs">Start Date</p>
                        <p className="text-[#009689]/80 text-sm">{previewAd.start_date ? new Date(previewAd.start_date).toLocaleDateString() : 'Not started'}</p>
                      </div>
                      <div>
                        <p className="text-[#009689]/40 text-xs">End Date</p>
                        <p className="text-[#009689]/80 text-sm">{previewAd.end_date ? new Date(previewAd.end_date).toLocaleDateString() : 'Not set'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAdPreviewModal(false)}
                      className="flex-1 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white py-2 rounded-xl font-semibold shadow-sm"
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

      {/* Revenue Breakdown Modal */}
      <AnimatePresence>
        {showRevenueModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRevenueModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full max-h-[80vh] bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#009689] to-[#007a6f] p-6 border-b border-white/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <DollarSign size={28} />
                      Ad Revenue Breakdown
                    </h2>
                    <p className="text-white/70 mt-1">
                      Total Revenue: <span className="font-bold text-xl">${totalRevenue.toLocaleString()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRevenueModal(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-6">
                {revenueBreakdown.length === 0 ? (
                  <div className="text-center py-20">
                    <DollarSign size={48} className="text-[#009689]/20 mx-auto mb-4" />
                    <p className="text-[#009689]/40">No active advertisements found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl p-4 text-center">
                        <p className="text-[#009689]/60 text-sm">Total Revenue</p>
                        <p className="text-[#009689] text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 text-center">
                        <p className="text-[#009689]/60 text-sm">Active Ads</p>
                        <p className="text-[#009689] text-2xl font-bold">{revenueBreakdown.length}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 text-center">
                        <p className="text-[#009689]/60 text-sm">Avg. Price per Ad</p>
                        <p className="text-[#009689] text-2xl font-bold">
                          ${(totalRevenue / revenueBreakdown.length || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Revenue Table */}
                    <div className="bg-white/30 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-white/50">
                          <tr className="border-b border-[#009689]/10">
                            <th className="text-left p-4 text-[#009689]/70 font-medium">Pharmacy Name</th>
                            <th className="text-left p-4 text-[#009689]/70 font-medium">Ad Title</th>
                            <th className="text-left p-4 text-[#009689]/70 font-medium">Plan</th>
                            <th className="text-right p-4 text-[#009689]/70 font-medium">Price</th>
                            <th className="text-left p-4 text-[#009689]/70 font-medium">Start Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueBreakdown.map((item, index) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-[#009689]/10 hover:bg-white/20 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-[#009689] to-[#007a6f] rounded-full flex items-center justify-center">
                                    <Store size={14} className="text-white" />
                                  </div>
                                  <span className="text-[#009689] font-medium">{item.pharmacy_name}</span>
                                </div>
                               </td>
                              <td className="p-4">
                                <p className="text-[#009689]/80">{item.ad_title}</p>
                               </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 rounded-full text-xs font-semibold">
                                  {item.plan_name}
                                </span>
                               </td>
                              <td className="p-4 text-right">
                                <span className="text-[#009689] font-bold">${item.price.toLocaleString()}</span>
                               </td>
                              <td className="p-4">
                                <p className="text-[#009689]/60 text-sm">
                                  {new Date(item.start_date).toLocaleDateString()}
                                </p>
                               </td>
                            </motion.tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-white/40">
                          <tr className="border-t border-[#009689]/10">
                            <td colSpan={3} className="p-4 text-right font-semibold text-[#009689]">
                              Total:
                             </td>
                            <td className="p-4 text-right">
                              <span className="text-[#009689] font-bold text-lg">${totalRevenue.toLocaleString()}</span>
                             </td>
                            <td></td>
                          </tr>
                        </tfoot>
                       </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white/60 backdrop-blur p-4 border-t border-[#009689]/10">
                <div className="flex justify-between items-center">
                  <div className="text-[#009689]/60 text-sm">
                    Showing {revenueBreakdown.length} active advertisements contributing to revenue
                  </div>
                  <button
                    onClick={() => setShowRevenueModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* License Details Modal */}
      <AnimatePresence>
        {showLicenseDetailsModal && selectedLicenseForDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLicenseDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-3xl w-full max-h-[85vh] bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#009689] to-[#007a6f] p-6 border-b border-white/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <FileText size={28} />
                      License Details
                    </h2>
                    <p className="text-white/70 mt-1">{selectedLicenseForDetails.pharmacy.pharmacy_name}</p>
                  </div>
                  <button
                    onClick={() => setShowLicenseDetailsModal(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pharmacy Information */}
                  <div className="space-y-4">
                    <h3 className="text-[#009689] font-semibold text-lg border-b border-[#009689]/20 pb-2">Pharmacy Information</h3>
                    <div>
                      <p className="text-[#009689]/60 text-sm">Pharmacy Name</p>
                      <p className="text-[#009689] font-semibold">{selectedLicenseForDetails.pharmacy.pharmacy_name}</p>
                    </div>
                    <div>
                      <p className="text-[#009689]/60 text-sm">Owner Name</p>
                      <p className="text-[#009689]">{selectedLicenseForDetails.pharmacy.owner_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-[#009689]/60 text-sm">Contact Email</p>
                      <p className="text-[#009689]">{selectedLicenseForDetails.pharmacy.contact_email}</p>
                    </div>
                    <div>
                      <p className="text-[#009689]/60 text-sm">Contact Phone</p>
                      <p className="text-[#009689]">{selectedLicenseForDetails.pharmacy.contact_phone}</p>
                    </div>
                    <div>
                      <p className="text-[#009689]/60 text-sm">Address</p>
                      <p className="text-[#009689]">{selectedLicenseForDetails.pharmacy.address}</p>
                    </div>
                    <div>
                      <p className="text-[#009689]/60 text-sm">Operating Hours</p>
                      <p className="text-[#009689]">{selectedLicenseForDetails.pharmacy.operating_hours || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* License Information */}
                  <div className="space-y-4">
                    <h3 className="text-[#009689] font-semibold text-lg border-b border-[#009689]/20 pb-2">License Information</h3>
                    <div>
                      <p className="text-[#009689]/60 text-sm">License Number</p>
                      <p className="text-[#009689] font-mono">{selectedLicenseForDetails.license.license_number}</p>
                    </div>
                    <div>
                      <p className="text-[#009689]/60 text-sm">Issue Date</p>
                      <p className="text-[#009689]">{new Date(selectedLicenseForDetails.license.issue_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[#009689]/60 text-sm">Expiry Date</p>
                      <p className={`font-semibold ${getLicenseStatus(selectedLicenseForDetails.license.expiry_date).textClass}`}>
                        {new Date(selectedLicenseForDetails.license.expiry_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#009689]/60 text-sm">Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getLicenseStatus(selectedLicenseForDetails.license.expiry_date).bgClass} ${getLicenseStatus(selectedLicenseForDetails.license.expiry_date).textClass}`}>
                        {getLicenseStatus(selectedLicenseForDetails.license.expiry_date).text}
                      </span>
                    </div>
                    <div>
                      <p className="text-[#009689]/60 text-sm">License Document</p>
                      <div className="relative w-full h-48 bg-white/20 rounded-xl overflow-hidden mt-2">
                        <img
                          src={selectedLicenseForDetails.license.license_document_url}
                          alt="License Document"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <a 
                        href={selectedLicenseForDetails.license.license_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#009689]/10 rounded-lg text-[#009689] hover:bg-[#009689]/20 transition-colors"
                      >
                        <ExternalLink size={16} />
                        View License Document in New Tab
                      </a>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="mt-6 pt-6 border-t border-[#009689]/10">
                  <h3 className="text-[#009689] font-semibold text-lg mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/30 rounded-xl p-4">
                      <p className="text-[#009689]/60 text-sm">Registered Date</p>
                      <p className="text-[#009689] font-semibold">{new Date(selectedLicenseForDetails.pharmacy.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white/30 rounded-xl p-4">
                      <p className="text-[#009689]/60 text-sm">Verification Status</p>
                      <p className={`font-semibold ${selectedLicenseForDetails.pharmacy.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedLicenseForDetails.pharmacy.is_verified ? 'Verified' : 'Pending'}
                      </p>
                    </div>
                    <div className="bg-white/30 rounded-xl p-4">
                      <p className="text-[#009689]/60 text-sm">Days Until Expiry</p>
                      <p className={`font-semibold ${getLicenseStatus(selectedLicenseForDetails.license.expiry_date).textClass}`}>
                        {Math.ceil((new Date(selectedLicenseForDetails.license.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white/60 backdrop-blur p-4 border-t border-[#009689]/10">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowLicenseDetailsModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-[#009689] to-[#007a6f] text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deactivate Pharmacy Confirmation Modal */}
      <AnimatePresence>
        {showDeactivateConfirm && pharmacyToDeactivate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeactivateConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertCircle size={28} className="text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#009689]">Deactivate Pharmacy</h3>
                </div>
                
                <p className="text-[#009689]/70 mb-4">
                  Are you sure you want to deactivate <strong className="text-red-600">{pharmacyToDeactivate.pharmacy_name}</strong>?
                </p>
                <p className="text-[#009689]/50 text-sm mb-6">
                  This will suspend the pharmacy's access to the platform. Their license status will be marked as inactive. You can reactivate them at any time.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => deactivatePharmacyAccount(pharmacyToDeactivate)}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <UserX size={18} />
                    )}
                    Deactivate
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDeactivateConfirm(false);
                      setPharmacyToDeactivate(null);
                    }}
                    className="flex-1 bg-white/40 hover:bg-white/60 text-[#009689] py-2.5 rounded-xl font-semibold border border-white/50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* License Action Confirmation Modal */}
<AnimatePresence>
  {showLicenseActionModal && selectedLicenseForAction && licenseActionType && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowLicenseActionModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 p-6 border-b ${
          licenseActionType === 'deactivate' ? 'bg-red-500' :
          licenseActionType === 'activate' ? 'bg-green-500' :
          licenseActionType === 'suspend' ? 'bg-orange-500' :
          licenseActionType === 'warning' ? 'bg-yellow-500' :
          'bg-[#009689]'
        } text-white`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {licenseActionType === 'deactivate' && 'Deactivate License'}
                {licenseActionType === 'activate' && 'Activate License'}
                {licenseActionType === 'suspend' && 'Suspend License'}
                {licenseActionType === 'warning' && 'Send License Warning'}
                {licenseActionType === 'extend' && 'Extend License'}
                {licenseActionType === 'renew' && 'Renew License'}
              </h2>
              <p className="text-white/80 mt-1">
                {selectedLicenseForAction.pharmacy_name}
              </p>
            </div>
            <button
              onClick={() => setShowLicenseActionModal(false)}
              className="text-white/60 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* License Information Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-700 mb-2">License Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">License Number</p>
                <p className="font-mono text-gray-700">{selectedLicenseForAction.license_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Expiry Date</p>
                <p className="font-semibold text-red-600">{new Date(selectedLicenseForAction.expiry_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Days Remaining</p>
                <p className={`font-bold ${
                  Math.ceil((new Date(selectedLicenseForAction.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) < 0 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {Math.ceil((new Date(selectedLicenseForAction.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                </p>
              </div>
              <div>
                <p className="text-gray-500">Current Status</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedLicenseForAction.is_verified ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                }`}>
                  {selectedLicenseForAction.is_verified ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Action-specific content */}
          {(licenseActionType === 'extend' || licenseActionType === 'renew') && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#009689]">Renewal Information</h3>
              
              <div>
                <label className="text-gray-700 text-sm block mb-2">New Expiry Date *</label>
                <input
                  type="date"
                  value={licenseRenewalData.new_expiry_date}
                  onChange={(e) => setLicenseRenewalData({ ...licenseRenewalData, new_expiry_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#009689] focus:border-[#009689]"
                />
              </div>
              
              {licenseActionType === 'renew' && (
                <>
                  <div>
                    <label className="text-gray-700 text-sm block mb-2">New License Number *</label>
                    <input
                      type="text"
                      value={licenseRenewalData.new_license_number}
                      onChange={(e) => setLicenseRenewalData({ ...licenseRenewalData, new_license_number: e.target.value })}
                      placeholder="Enter new license number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#009689] focus:border-[#009689]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-700 text-sm block mb-2">Renewal Document (Optional)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLicenseRenewalData({ ...licenseRenewalData, renewal_document_url: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#009689] focus:border-[#009689]"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Warning Message */}
          <div className={`p-4 rounded-lg ${
            licenseActionType === 'deactivate' ? 'bg-red-50 border border-red-200' :
            licenseActionType === 'activate' ? 'bg-green-50 border border-green-200' :
            licenseActionType === 'suspend' ? 'bg-orange-50 border border-orange-200' :
            licenseActionType === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className={
                licenseActionType === 'deactivate' ? 'text-red-600' :
                licenseActionType === 'activate' ? 'text-green-600' :
                licenseActionType === 'suspend' ? 'text-orange-600' :
                licenseActionType === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              } />
              <div>
                <p className="font-semibold text-gray-800">
                  {licenseActionType === 'deactivate' && '⚠️ Warning: Deactivating License'}
                  {licenseActionType === 'activate' && 'ℹ️ Information: Activating License'}
                  {licenseActionType === 'suspend' && '⚠️ Warning: Suspending License'}
                  {licenseActionType === 'warning' && '📧 Send Warning Notification'}
                  {licenseActionType === 'extend' && '📅 Extend License Validity'}
                  {licenseActionType === 'renew' && '🔄 Renew License'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {licenseActionType === 'deactivate' && `This will immediately deactivate ${selectedLicenseForAction.pharmacy_name}'s license. The pharmacy will not be able to operate until reactivated.`}
                  {licenseActionType === 'activate' && `This will reactivate ${selectedLicenseForAction.pharmacy_name}'s license. The pharmacy will be able to resume normal operations.`}
                  {licenseActionType === 'suspend' && `This will suspend ${selectedLicenseForAction.pharmacy_name}'s license for 30 days. A suspension notice will be sent to the pharmacy.`}
                  {licenseActionType === 'warning' && `This will send an official warning notification to ${selectedLicenseForAction.pharmacy_name} about their expiring license.`}
                  {licenseActionType === 'extend' && `This will extend the license validity. Please enter the new expiry date based on the updated license document.`}
                  {licenseActionType === 'renew' && `This will renew the license with new information. Please ensure all renewal documents are valid and up to date.`}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Buttons */}
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={confirmLicenseAction}
              disabled={isProcessing}
              className={`flex-1 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm ${
                licenseActionType === 'deactivate' ? 'bg-red-500 hover:bg-red-600' :
                licenseActionType === 'activate' ? 'bg-green-500 hover:bg-green-600' :
                licenseActionType === 'suspend' ? 'bg-orange-500 hover:bg-orange-600' :
                licenseActionType === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
                'bg-[#009689] hover:bg-[#007a6f]'
              } text-white`}
            >
              {isProcessing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {licenseActionType === 'deactivate' && <XCircle size={18} />}
                  {licenseActionType === 'activate' && <CheckCircle size={18} />}
                  {licenseActionType === 'suspend' && <AlertCircle size={18} />}
                  {licenseActionType === 'warning' && <Mail size={18} />}
                  {licenseActionType === 'extend' && <Calendar size={18} />}
                  {licenseActionType === 'renew' && <RefreshCw size={18} />}
                  Confirm {licenseActionType === 'deactivate' ? 'Deactivation' :
                           licenseActionType === 'activate' ? 'Activation' :
                           licenseActionType === 'suspend' ? 'Suspension' :
                           licenseActionType === 'warning' ? 'Send Warning' :
                           licenseActionType === 'extend' ? 'Extension' : 'Renewal'}
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowLicenseActionModal(false);
                setLicenseRenewalData({ new_expiry_date: '', new_license_number: '', renewal_document_url: '' });
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
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