import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Settings,
  Eye,
  Clock,
} from "lucide-react";

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  description?: string;
}

interface DashboardStatsProps {
  stats: {
    users?: { count: number };
    messages?: { count: number; unread?: number };
    projects?: { count: number; featured?: number };
    blog?: { count: number; published?: number };
    skills?: { count: number };
    education?: { count: number };
    experience?: { count: number };
    certifications?: { count: number };
    [key: string]: any;
  };
  isLoading?: boolean;
  recentActivity?: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    status?: string;
  }>;
}

export function DashboardStats({ stats, isLoading, recentActivity }: DashboardStatsProps) {
  const statCards: StatCard[] = [
    {
      title: "Total Users",
      value: stats?.users?.count || 0,
      icon: <Users className="h-4 w-4" />,
      color: "blue",
      description: "Active admin users",
    },
    {
      title: "Messages",
      value: stats?.messages?.count || 0,
      icon: <MessageSquare className="h-4 w-4" />,
      color: "green",
      description: `${stats?.messages?.unread || 0} unread`,
    },
    {
      title: "Projects",
      value: stats?.projects?.count || 0,
      icon: <Briefcase className="h-4 w-4" />,
      color: "purple",
      description: `${stats?.projects?.featured || 0} featured`,
    },
    {
      title: "Blog Posts",
      value: stats?.blog?.count || 0,
      icon: <FileText className="h-4 w-4" />,
      color: "orange",
      description: `${stats?.blog?.published || 0} published`,
    },
    {
      title: "Skills",
      value: stats?.skills?.count || 0,
      icon: <Code className="h-4 w-4" />,
      color: "cyan",
      description: "Technical skills",
    },
    {
      title: "Education",
      value: stats?.education?.count || 0,
      icon: <GraduationCap className="h-4 w-4" />,
      color: "emerald",
      description: "Academic records",
    },
    {
      title: "Experience",
      value: stats?.experience?.count || 0,
      icon: <Briefcase className="h-4 w-4" />,
      color: "yellow",
      description: "Work experience",
    },
    {
      title: "Certifications",
      value: stats?.certifications?.count || 0,
      icon: <Award className="h-4 w-4" />,
      color: "red",
      description: "Professional certs",
    },
  ];

  // Always show dashboard with data immediately, no loading states
  const safeStats = stats || {};

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer group"
          >
            <CardHeader className="pb-2 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-md bg-${stat.color}-500/20 text-${stat.color}-400`}>
                  {stat.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex items-baseline justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-xl sm:text-2xl font-bold text-white truncate">{stat.value}</div>
                  {stat.description && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{stat.description}</p>
                  )}
                </div>
                {stat.change && (
                  <div className={`flex items-center text-xs ml-2 ${
                    stat.change.type === "increase" ? "text-green-400" : "text-red-400"
                  }`}>
                    {stat.change.type === "increase" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {stat.change.value}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.slice(0, 8).map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b border-gray-700 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1 sm:mt-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-medium truncate">{activity.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {activity.status && (
                    <Badge
                      variant={activity.status === "published" ? "default" : "secondary"}
                      className="text-xs self-start sm:self-center"
                    >
                      {activity.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "View Site", icon: <Eye className="h-4 w-4" />, action: "view-site" },
              { label: "New Project", icon: <Briefcase className="h-4 w-4" />, action: "new-project" },
              { label: "New Post", icon: <FileText className="h-4 w-4" />, action: "new-blog" },
              { label: "Settings", icon: <Settings className="h-4 w-4" />, action: "settings" },
            ].map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors border border-gray-600 hover:border-gray-500 group"
              >
                <div className="text-gray-400 group-hover:text-gray-300">{action.icon}</div>
                <span className="text-xs sm:text-sm text-gray-300 text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}