
import React from 'react';
import { jobRoles } from '@/data/jobRoles';
import RoleCard from './RoleCard';

interface RoleSelectionProps {
  onSelectRole: (roleId: string) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-800 mb-3">Choose Your Role</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select a job role to start practicing and improving skills specific to that position.
          Each role has tailored questions and challenges to help you grow.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {jobRoles.map((role) => (
          <RoleCard 
            key={role.id} 
            role={role} 
            onSelect={() => onSelectRole(role.id)} 
          />
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
