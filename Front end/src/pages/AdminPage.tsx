import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill, Users, Building2, FileText, Settings, LogOut, ArrowLeft, BarChart3, Shield, Search } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <Button variant="secondary" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search pharmacies, users, reports..."
              className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 rounded border border-slate-200">⌘K</kbd>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Total Patients</span>
            </div>
            <p className="text-3xl font-bold text-foreground">1,234</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Pharmacies</span>
            </div>
            <p className="text-3xl font-bold text-foreground">56</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Medicines</span>
            </div>
            <p className="text-3xl font-bold text-foreground">892</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Prescriptions</span>
            </div>
            <p className="text-3xl font-bold text-foreground">456</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/admin/users" className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Manage Users</h3>
            </div>
            <p className="text-muted-foreground text-sm">View and manage patient and pharmacy accounts</p>
          </Link>
          <Link to="/admin/pharmacies" className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Pharmacy Approvals</h3>
            </div>
            <p className="text-muted-foreground text-sm">Review and approve pharmacy registrations</p>
          </Link>
          <Link to="/admin/medicines" className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Medicine Database</h3>
            </div>
            <p className="text-muted-foreground text-sm">Manage medicine information and inventory</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">New pharmacy registration</p>
                  <p className="text-sm text-muted-foreground">MediCare Pharmacy submitted registration</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">New patient registered</p>
                  <p className="text-sm text-muted-foreground">Patient account created successfully</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">License verification</p>
                  <p className="text-sm text-muted-foreground">Abeba Pharmacy license verified</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Medicine database updated</p>
                  <p className="text-sm text-muted-foreground">50 new medicines added to database</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">2 days ago</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button variant="outline" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
