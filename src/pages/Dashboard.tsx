import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FolderKanban, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const stats = [
    {
      title: 'Total Tickets',
      value: '24',
      icon: <FileText className="w-5 h-5" />,
      change: '+12%',
    },
    {
      title: 'Active Projects',
      value: '6',
      icon: <FolderKanban className="w-5 h-5" />,
      change: '+2',
    },
    {
      title: profile.role === 'admin' ? 'Total Users' : 'Team Members',
      value: profile.role === 'admin' ? '18' : '8',
      icon: <Users className="w-5 h-5" />,
      change: '+3',
    },
    {
      title: 'Completed',
      value: '12',
      icon: <CheckCircle2 className="w-5 h-5" />,
      change: '+5',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile.full_name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your {profile.role === 'client' ? 'projects' : 'workspace'} today.
          </p>
        </div>
        <Button onClick={() => navigate('/tickets/new')}>New Ticket</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="text-muted-foreground">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-400">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">Ticket #{100 + i} was updated</p>
                    <p className="text-xs text-muted-foreground mt-1">{i} hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/tickets/new')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Create New Ticket
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/tickets')}
              >
                <FileText className="w-4 h-4 mr-2" />
                View All Tickets
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/projects')}
              >
                <FolderKanban className="w-4 h-4 mr-2" />
                Browse Projects
              </Button>
              {profile.role === 'admin' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/clients')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
