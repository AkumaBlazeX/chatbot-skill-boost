
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobRole } from '@/data/jobRoles';

interface RoleCardProps {
  role: JobRole;
  onSelect: (role: JobRole) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, onSelect }) => {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-4xl">{role.icon}</span>
          <h3 className="text-xl font-semibold">{role.title}</h3>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{role.description}</p>
        <div className="mt-2">
          <h4 className="text-sm font-semibold mb-2">Key Skills:</h4>
          <div className="flex flex-wrap gap-1">
            {role.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="text-xs bg-secondary rounded-full px-2 py-1">
                {skill}
              </span>
            ))}
            {role.skills.length > 3 && (
              <span className="text-xs bg-secondary rounded-full px-2 py-1">
                +{role.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onSelect(role)}>
          Select Role
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoleCard;
