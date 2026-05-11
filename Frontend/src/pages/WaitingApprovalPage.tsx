import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WaitingApprovalPage() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pharmacy');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Clock className="w-10 h-10 text-white animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Account Pending Approval
          </h1>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            Your pharmacy account has been submitted and is currently waiting for admin approval.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm font-medium">
              ⏳ Please wait for the admin to review and approve your account. This usually takes 1-2 business days.
            </p>
          </div>
          
          <div className="space-y-3 text-left mb-6">
            <p className="text-sm text-slate-700">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Admin will review your pharmacy registration</li>
              <li>You will receive an email once approved</li>
              <li>After approval, you can login and access your dashboard</li>
            </ul>
          </div>
          
          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500 mb-4">
              Need to update your information? Contact support at support@pharmalink.com
            </p>
            
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
