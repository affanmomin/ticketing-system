import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';

const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design',
    color: '#5E81F4',
    openTickets: 12,
    closedTickets: 8,
    members: [
      { name: 'John Doe', role: 'employee' as const },
      { name: 'Jane Smith', role: 'employee' as const },
      { name: 'Bob Johnson', role: 'employee' as const },
    ],
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'iOS and Android app for customer engagement',
    color: '#10B981',
    openTickets: 24,
    closedTickets: 15,
    members: [
      { name: 'Alice Williams', role: 'employee' as const },
      { name: 'Charlie Brown', role: 'employee' as const },
    ],
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Third-party API integrations and documentation',
    color: '#F59E0B',
    openTickets: 6,
    closedTickets: 18,
    members: [
      { name: 'David Lee', role: 'employee' as const },
    ],
  },
  {
    id: '4',
    name: 'Customer Portal',
    description: 'Self-service portal for customers',
    color: '#8B5CF6',
    openTickets: 8,
    closedTickets: 5,
    members: [
      { name: 'Emma Davis', role: 'employee' as const },
      { name: 'Frank Miller', role: 'employee' as const },
      { name: 'Grace Wilson', role: 'employee' as const },
      { name: 'Henry Taylor', role: 'employee' as const },
    ],
  },
];

export function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your projects and track progress</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </div>
  );
}
