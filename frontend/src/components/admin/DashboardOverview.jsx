import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Eye,
  Mail,
  Image,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  CheckCircle2,
  Lightbulb,
  Activity,
  Flame,Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

// Mini sparkline component
const Sparkline = ({ data, color, height = 40 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="drop-shadow-lg"
      />
      <polygon
        fill={`url(#gradient-${color})`}
        points={`0,${height} ${points} 100,${height}`}
      />
    </svg>
  );
};

// Progress ring component
const ProgressRing = ({ progress, size = 60, strokeWidth = 4, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out drop-shadow-lg"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
};

// Get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: '☀️' };
  if (hour < 17) return { text: 'Good afternoon', icon: '🌤️' };
  if (hour < 21) return { text: 'Good evening', icon: '🌅' };
  return { text: 'Good night', icon: '🌙' };
};

const DashboardOverview = () => {
  const [greeting] = useState(getGreeting());
  const [animateStats, setAnimateStats] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);

  useEffect(() => {
    setTimeout(() => setAnimateStats(true), 100);
    const controller = new AbortController();
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
    const API = `${BACKEND_URL}/api`;
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.allSettled([
      fetch(`${API}/portfolio/list?published_only=false`, { signal: controller.signal }).then(r => r.json()),
      fetch(`${API}/media/list`, { signal: controller.signal }).then(r => r.json()),
      fetch(`${API}/contact/messages`, { headers, signal: controller.signal }).then(r => r.json()),
    ]).then(([portfolio, media, messages]) => {
      if (portfolio.status === 'fulfilled') setPortfolioCount(portfolio.value.items?.length || 0);
      if (media.status === 'fulfilled') setMediaCount(media.value.media?.length || 0);
      if (messages.status === 'fulfilled') setMessagesCount(messages.value.count || 0);
    });
    return () => controller.abort();
  }, []);

  // Sample data for sparklines
  const sparklineData = {
    portfolio: [3, 5, 4, 7, 6, 8, 9, 8, 10, 12],
    media: [10, 12, 8, 15, 14, 18, 20, 19, 22, 25],
    messages: [2, 4, 3, 5, 8, 6, 9, 7, 10, 12],
    views: [100, 150, 120, 180, 200, 190, 250, 280, 300, 350] };

  const stats = [
    {
      label: 'Portfolio Items',
      value: portfolioCount || 0,
      icon: Image,
      color: '#3b82f6',
      gradient: 'from-blue-500 to-cyan-400',
      change: '+12%',
      isPositive: true,
      sparkline: sparklineData.portfolio,
      progress: 75 },
    {
      label: 'Media Files',
      value: mediaCount || 0,
      icon: Eye,
      color: '#10b981',
      gradient: 'from-emerald-500 to-teal-400',
      change: '+8%',
      isPositive: true,
      sparkline: sparklineData.media,
      progress: 60 },
    {
      label: 'Messages',
      value: messagesCount || 0,
      icon: Mail,
      color: '#8b5cf6',
      gradient: 'from-violet-500 to-purple-400',
      change: '+23%',
      isPositive: true,
      sparkline: sparklineData.messages,
      progress: 85 },
    {
      label: 'Total Views',
      value: '-',
      icon: TrendingUp,
      color: '#f59e0b',
      gradient: 'from-amber-500 to-orange-400',
      change: '',
      isPositive: true,
      sparkline: sparklineData.views,
      progress: 0 },
  ];

  const insights = [
    {
      icon: Flame,
      title: 'Trending Content',
      description: 'Connect analytics to see your top-performing content',
      color: '#f59e0b',
      action: 'View Analytics',
      modalContent: {
        title: 'Trending Content Analysis',
        description: 'Connect PostHog analytics in Integrations to see detailed insights',
        details: [
          { label: 'Status', value: 'Not Connected' },
          { label: 'Share Count', value: '87 shares' },
        ],
        tips: [
          'Consider creating similar content to capitalize on this trend',
          'Add more high-quality images to keep visitors engaged',
          'Share this project on social media for more visibility',
        ] } },
    {
      icon: Target,
      title: 'Goal Progress',
      description: `You have ${portfolioCount || 0} portfolio items published`,
      color: '#10b981',
      action: 'Set New Goal',
      modalContent: {
        title: 'Portfolio Goals',
        description: 'Track your content creation progress',
        details: [
          { label: 'Published Items', value: `${portfolioCount || 0}` },
          { label: 'Media Files', value: `${mediaCount || 0}` },
          { label: 'Messages', value: `${messagesCount || 0}` },
        ],
        tips: [
          'You\'re on track to meet your goal! Keep up the great work.',
          'Consider preparing content in advance for next month',
          'Quality over quantity - ensure each item is polished',
        ] } },
    {
      icon: Lightbulb,
      title: 'Quick Tip',
      description: 'Add more tags to your projects for better discoverability',
      color: '#8b5cf6',
      action: 'Learn More',
      modalContent: {
        title: 'SEO Best Practices',
        description: 'Improve your portfolio\'s visibility and searchability',
        details: [
          { label: 'Current Avg. Tags', value: '2.3 per project' },
          { label: 'Recommended', value: '5-7 tags' },
          { label: 'Projects Missing Tags', value: '3 items' },
          { label: 'Search Traffic', value: '+15% with tags' },
          { label: 'Tag Performance', value: 'Wedding: High, Film: Medium' },
        ],
        tips: [
          'Use specific, descriptive tags related to your work',
          'Include location-based tags for local discoverability',
          'Add skill-based tags (videography, cinematography, etc.)',
          'Research popular search terms in your industry',
        ] } },
  ];

  const quickActions = [
    {
      icon: Image,
      title: 'Add Project',
      subtitle: 'Showcase your work',
      gradient: 'from-violet-600 to-indigo-600',
      hoverGlow: 'group-hover:shadow-violet-500/25' },
    {
      icon: Eye,
      title: 'Upload Media',
      subtitle: 'Images & videos',
      gradient: 'from-cyan-500 to-blue-600',
      hoverGlow: 'group-hover:shadow-cyan-500/25' },
    {
      icon: Mail,
      title: 'Messages',
      subtitle: `${messagesCount || 0} unread`,
      gradient: 'from-emerald-500 to-teal-600',
      hoverGlow: 'group-hover:shadow-emerald-500/25' },
  ];

  const recentActivity = [
    { icon: CheckCircle2, text: `${portfolioCount || 0} portfolio items published`, time: 'Current', color: '#10b981' },
    { icon: Mail, text: `${messagesCount || 0} messages received`, time: 'Current', color: '#3b82f6' },
    { icon: Eye, text: `${mediaCount || 0} media files uploaded`, time: 'Current', color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{greeting.icon}</span>
            <h1 className="text-3xl font-bold text-white">
              {greeting.text}, <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Admin</span>
            </h1>
          </div>
          <p className="text-gray-400 flex items-center gap-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-gray-400 text-sm">All systems operational</span>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`group relative rounded-3xl p-5 transition-all duration-500 cursor-pointer overflow-hidden
                bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl
                border border-white/10 hover:border-white/20
                hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1
                ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Subtle gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon size={20} style={{ color: stat.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                    ${stat.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}
                  >
                    {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.change}
                  </div>
                </div>

                {/* Value */}
                <div className="mb-3">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
                </div>

                {/* Sparkline */}
                <div className="h-10 -mx-1">
                  <Sparkline data={stat.sparkline} color={stat.color} height={40} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Section - Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Insights Card - Takes 2 columns */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AI Insights</h3>
                <p className="text-gray-500 text-xs">Personalized recommendations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedInsight(insight)}
                    className="group p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${insight.color}15` }}
                    >
                      <Icon size={16} style={{ color: insight.color }} />
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">{insight.description}</p>
                    <span className="text-xs font-medium group-hover:underline" style={{ color: insight.color }}>
                      {insight.action} →
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Ring */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-4">Overall Performance</p>
          <div className="relative">
            <ProgressRing progress={78} size={120} strokeWidth={8} color="#8b5cf6" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">78%</span>
              <span className="text-gray-500 text-xs">Score</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm">
            <TrendingUp size={14} />
            <span>+12% from last month</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={18} className="text-amber-400" />
            <h3 className="text-white font-bold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className={`group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 
                    hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 text-left
                    hover:shadow-xl ${action.hoverGlow}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{action.title}</p>
                    <p className="text-gray-500 text-xs truncate">{action.subtitle}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-600 group-hover:text-white transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={18} className="text-blue-400" />
            <h3 className="text-white font-bold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${activity.color}15` }}
                  >
                    <Icon size={14} style={{ color: activity.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-xs truncate group-hover:text-white transition-colors">{activity.text}</p>
                    <p className="text-gray-600 text-xs">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insight Modal */}
      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="bg-gradient-to-br from-gray-900 to-black border-white/10 max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedInsight && (
                <>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${selectedInsight.color}20` }}
                  >
                    {React.createElement(selectedInsight.icon, {
                      size: 20,
                      style: { color: selectedInsight.color } })}
                  </div>
                  <div>
                    <DialogTitle className="text-white text-xl">
                      {selectedInsight.modalContent.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {selectedInsight.modalContent.description}
                    </DialogDescription>
                  </div>
                </>
              )}
            </div>
          </DialogHeader>

          {selectedInsight && (
            <div className="space-y-6 mt-4">
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {selectedInsight.modalContent.details.map((detail, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] transition-colors"
                  >
                    <p className="text-gray-500 text-xs mb-1">{detail.label}</p>
                    <p className="text-white font-semibold text-lg">{detail.value}</p>
                  </div>
                ))}
              </div>

              {/* Tips Section */}
              {selectedInsight.modalContent.tips && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb size={16} style={{ color: selectedInsight.color }} />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {selectedInsight.modalContent.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: selectedInsight.color }}
                        />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => setSelectedInsight(null)}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: `${selectedInsight.color}20`,
                  color: selectedInsight.color,
                  border: `1px solid ${selectedInsight.color}40` }}
              >
                Got it, thanks!
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardOverview;
