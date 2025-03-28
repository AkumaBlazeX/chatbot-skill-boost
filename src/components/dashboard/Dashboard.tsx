
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import RoleSelection from '../role-selection/RoleSelection';
import ChatInterface from '../chat/ChatInterface';
import { LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSelectRole = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-brand-800">SkillBoost</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Hello, {user?.name || 'User'}
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      
      <main className="flex-1">
        {selectedRole ? (
          <ChatInterface roleId={selectedRole} onBack={handleBackToRoles} />
        ) : (
          <RoleSelection onSelectRole={handleSelectRole} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
