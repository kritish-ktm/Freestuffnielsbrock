import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SecurityAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // days
  
  // Security Metrics State
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    suspiciousAccounts: 0,
    suspendedUsers: 0,
    
    totalReports: 0,
    pendingReports: 0,
    reportedUsers: 0,
    multipleReporters: [],
    
    rateLimitViolations: 0,
    rapidItemPosting: [],
    rapidReporting: [],
    
    accountsWithoutItems: 0,
    accountsWithManyItems: [],
    
    totalComments: 0,
    expiredItems: 0,
    unreadRequests: 0,
    flaggedContent: []
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [topReportedItems, setTopReportedItems] = useState([]);
  const [suspiciousUsers, setSuspiciousUsers] = useState([]);

  // Check admin access
  useEffect(() => {
    checkAdminAccess();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is admin (you can adjust this logic)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Add your admin check logic here
    // For now, checking if email contains 'admin' or specific domain
    const isAdmin = user.email?.includes('admin') || 
                    user.email?.endsWith('@edu.nielsbrock.dk');

    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchSecurityMetrics();
  };

  const fetchSecurityMetrics = async () => {
    setLoading(true);
    
    try {
      const now = new Date();
      const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
      
      // Fetch all data
      const [
        usersData,
        itemsData,
        reportsData,
        requestsData,
        commentsData
      ] = await Promise.all([
        supabase.from('user_profiles').select('*'),
        supabase.from('items').select('*'),
        supabase.from('reports').select('*, items(title, user_id)'),
        supabase.from('requests').select('*'),
        supabase.from('comments').select('*')
      ]);

      // Calculate User Metrics
      const totalUsers = usersData.data?.length || 0;
      const suspendedUsers = usersData.data?.filter(u => u.is_suspended).length || 0;
      const today = new Date().toDateString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const newUsersToday = usersData.data?.filter(u => 
        new Date(u.created_at).toDateString() === today
      ).length || 0;
      
      const newUsersThisWeek = usersData.data?.filter(u => 
        new Date(u.created_at) > weekAgo
      ).length || 0;

      // Suspicious Accounts: No items posted, created recently, not suspended
      const accountsWithoutItems = usersData.data?.filter(u => {
        const userItems = itemsData.data?.filter(i => i.posted_by === u.user_id);
        return userItems?.length === 0 && 
               new Date(u.created_at) > weekAgo &&
               !u.is_suspended;
      }).length || 0;

      // Users with many items in short time
      const accountsWithManyItems = usersData.data?.filter(u => !u.is_suspended).map(u => {
        const userItems = itemsData.data?.filter(i => 
          i.posted_by === u.user_id && 
          new Date(i.created_at) > daysAgo
        ) || [];
        
        return {
          email: u.email,
          name: u.full_name,
          itemCount: userItems.length,
          userId: u.user_id
        };
      }).filter(u => u.itemCount > 8).sort((a, b) => b.itemCount - a.itemCount) || [];

      // Report Metrics
      const totalReports = reportsData.data?.length || 0;
      const pendingReports = reportsData.data?.filter(r => r.status === 'pending').length || 0;
      
      // Count unique reported users
      const reportedUserIds = new Set(reportsData.data?.map(r => {
        const item = itemsData.data?.find(i => i.id === r.item_id);
        return item?.posted_by;
      }).filter(Boolean));
      const reportedUsers = reportedUserIds.size;

      // Items with multiple reports
      const itemReportCount = {};
      reportsData.data?.forEach(r => {
        if (r.item_id) {
          itemReportCount[r.item_id] = (itemReportCount[r.item_id] || 0) + 1;
        }
      });

      const topReportedItemsList = Object.entries(itemReportCount)
        .filter(([_, count]) => count > 1)
        .map(([itemId, count]) => {
          const item = itemsData.data?.find(i => i.id === itemId);
          return {
            itemId,
            title: item?.name || 'Unknown Item',
            reportCount: count,
            userId: item?.posted_by
          };
        })
        .sort((a, b) => b.reportCount - a.reportCount)
        .slice(0, 10);

      // Rapid reporting detection (users reporting many items quickly)
      const reporterCount = {};
      reportsData.data?.filter(r => new Date(r.created_at) > daysAgo).forEach(r => {
        reporterCount[r.reporter_id] = (reporterCount[r.reporter_id] || 0) + 1;
      });

      const rapidReporters = Object.entries(reporterCount)
        .filter(([_, count]) => count > 4)
        .map(([userId, count]) => {
          const user = usersData.data?.find(u => u.user_id === userId);
          return {
            email: user?.email || 'Unknown',
            name: user?.full_name || 'Unknown',
            reportCount: count,
            userId
          };
        })
        .sort((a, b) => b.reportCount - a.reportCount);

      // Total comments
      const totalComments = commentsData.data?.length || 0;

      // Unread requests
      const unreadRequests = requestsData.data?.filter(r => 
        !r.read_by_poster || !r.read_by_requester
      ).length || 0;

      // Expired items
      const expiredItems = itemsData.data?.filter(i => 
        new Date(i.expiry_date) < now && i.status === 'active'
      ).length || 0;

      // Suspicious users (multiple factors)
      const suspiciousUsersList = usersData.data?.filter(u => !u.is_suspended).map(u => {
        const userItems = itemsData.data?.filter(i => i.posted_by === u.user_id) || [];
        const userReports = reportsData.data?.filter(r => {
          const item = itemsData.data?.find(i => i.id === r.item_id);
          return item?.posted_by === u.user_id;
        }) || [];
        const userRequests = requestsData.data?.filter(r => r.requester_id === u.user_id) || [];
        const userComments = commentsData.data?.filter(c => c.user_id === u.user_id) || [];
        
        const recentItems = userItems.filter(i => new Date(i.created_at) > daysAgo);
        const suspicionScore = 
          (recentItems.length > 8 ? 3 : 0) + // Too many items
          (userReports.length > 2 ? 2 : 0) + // Multiple reports
          (userItems.length === 0 && new Date(u.created_at) > weekAgo ? 1 : 0) + // No activity
          (userRequests.length > 15 ? 2 : 0); // Excessive requests

        return {
          email: u.email,
          name: u.full_name,
          userId: u.user_id,
          suspicionScore,
          itemCount: userItems.length,
          reportCount: userReports.length,
          requestCount: userRequests.length,
          commentCount: userComments.length,
          accountAge: Math.floor((now - new Date(u.created_at)) / (1000 * 60 * 60 * 24))
        };
      }).filter(u => u.suspicionScore > 0)
        .sort((a, b) => b.suspicionScore - a.suspicionScore)
        .slice(0, 10) || [];

      // Recent activity
      const recentReports = reportsData.data
        ?.filter(r => new Date(r.created_at) > daysAgo)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(r => {
          const reporter = usersData.data?.find(u => u.user_id === r.reporter_id);
          const item = itemsData.data?.find(i => i.id === r.item_id);
          return {
            type: 'report',
            description: `${reporter?.email || 'User'} reported: ${item?.name || 'item'}`,
            reason: r.reason,
            time: new Date(r.created_at).toLocaleString(),
            status: r.status
          };
        }) || [];

      setMetrics({
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        suspiciousAccounts: suspiciousUsersList.length,
        suspendedUsers,
        
        totalReports,
        pendingReports,
        reportedUsers,
        multipleReporters: rapidReporters,
        
        rateLimitViolations: accountsWithManyItems.length + rapidReporters.length,
        rapidItemPosting: accountsWithManyItems,
        rapidReporting: rapidReporters,
        
        accountsWithoutItems,
        accountsWithManyItems,
        
        totalComments,
        expiredItems,
        unreadRequests
      });

      setTopReportedItems(topReportedItemsList);
      setSuspiciousUsers(suspiciousUsersList);
      setRecentActivity(recentReports);

    } catch (error) {
      console.error('Error fetching security metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (score) => {
    if (score >= 5) return 'danger';
    if (score >= 3) return 'warning';
    return 'info';
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Security Analytics Report', `Generated: ${new Date().toLocaleString()}`],
      [''],
      ['Metric', 'Value'],
      ['Total Users', metrics.totalUsers],
      ['New Users Today', metrics.newUsersToday],
      ['New Users This Week', metrics.newUsersThisWeek],
      ['Suspicious Accounts', metrics.suspiciousAccounts],
      ['Total Reports', metrics.totalReports],
      ['Pending Reports', metrics.pendingReports],
      ['Rate Limit Violations', metrics.rateLimitViolations],
      ['Expired Items', metrics.expiredItems],
      [''],
      ['Suspicious Users'],
      ['Email', 'Name', 'Suspicion Score', 'Items', 'Reports', 'Requests'],
      ...suspiciousUsers.map(u => [u.email, u.name, u.suspicionScore, u.itemCount, u.reportCount, u.requestCount])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">🔒 Security Analytics</h1>
        <div className="d-flex gap-2">
          <select 
            className="form-select" 
            value={timeRange} 
            onChange={(e) => {
              setTimeRange(e.target.value);
              setTimeout(() => fetchSecurityMetrics(), 100);
            }}
            style={{ width: 'auto' }}
          >
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <button className="btn btn-primary" onClick={fetchSecurityMetrics}>
            🔄 Refresh
          </button>
          <button className="btn btn-success" onClick={exportToCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-danger">
            <div className="card-body">
              <h6 className="text-danger mb-2">⚠️ Suspicious Accounts</h6>
              <h2 className="mb-0">{metrics.suspiciousAccounts}</h2>
              <small className="text-muted">Require investigation</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body">
              <h6 className="text-warning mb-2">📢 Pending Reports</h6>
              <h2 className="mb-0">{metrics.pendingReports}</h2>
              <small className="text-muted">Need review</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body">
              <h6 className="text-info mb-2">🚨 Rate Limit Violations</h6>
              <h2 className="mb-0">{metrics.rateLimitViolations}</h2>
              <small className="text-muted">Suspicious activity</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-secondary">
            <div className="card-body">
              <h6 className="text-secondary mb-2">🚫 Suspended Users</h6>
              <h2 className="mb-0">{metrics.suspendedUsers}</h2>
              <small className="text-muted">Currently suspended</small>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body">
              <h6 className="text-info mb-2">💬 Total Comments</h6>
              <h2 className="mb-0">{metrics.totalComments}</h2>
              <small className="text-muted">User engagement</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body">
              <h6 className="text-warning mb-2">📬 Unread Requests</h6>
              <h2 className="mb-0">{metrics.unreadRequests}</h2>
              <small className="text-muted">Need attention</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-secondary">
            <div className="card-body">
              <h6 className="text-secondary mb-2">⏰ Expired Items</h6>
              <h2 className="mb-0">{metrics.expiredItems}</h2>
              <small className="text-muted">Need cleanup</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body">
              <h6 className="text-success mb-2">📊 Activity Score</h6>
              <h2 className="mb-0">{Math.round((metrics.totalComments + metrics.totalReports) / metrics.totalUsers * 10) / 10}</h2>
              <small className="text-muted">Per user average</small>
            </div>
          </div>
        </div>
      </div>

      {/* User Overview */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">👥 Total Users</h6>
              <h2>{metrics.totalUsers}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">🆕 New Today</h6>
              <h2>{metrics.newUsersToday}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">📅 New This Week</h6>
              <h2>{metrics.newUsersThisWeek}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Suspicious Users Table */}
      <div className="card mb-4">
        <div className="card-header bg-danger text-white">
          <h5 className="mb-0">🚨 Suspicious Users (Risk Score)</h5>
        </div>
        <div className="card-body">
          {suspiciousUsers.length === 0 ? (
            <div className="text-center text-muted py-4">
              ✅ No suspicious activity detected
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Risk Level</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Score</th>
                    <th>Items</th>
                    <th>Reports</th>
                    <th>Requests</th>
                    <th>Comments</th>
                    <th>Account Age</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suspiciousUsers.map((u, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={`badge bg-${getSeverityColor(u.suspicionScore)}`}>
                          {u.suspicionScore >= 5 ? 'HIGH' : u.suspicionScore >= 3 ? 'MEDIUM' : 'LOW'}
                        </span>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.name || 'N/A'}</td>
                      <td><strong>{u.suspicionScore}</strong></td>
                      <td>{u.itemCount}</td>
                      <td>{u.reportCount}</td>
                      <td>{u.requestCount}</td>
                      <td>{u.commentCount}</td>
                      <td>{u.accountAge} days</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top Reported Items */}
      {topReportedItems.length > 0 && (
        <div className="card mb-4">
          <div className="card-header bg-warning">
            <h5 className="mb-0">⚠️ Most Reported Items</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Report Count</th>
                    <th>Item ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topReportedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.title}</td>
                      <td>
                        <span className="badge bg-danger">{item.reportCount} reports</span>
                      </td>
                      <td><small className="text-muted">{item.itemId.substring(0, 8)}...</small></td>
                      <td>
                        <button className="btn btn-sm btn-danger">
                          Review Reports
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rapid Activity Detection */}
      <div className="row g-3 mb-4">
        {metrics.rapidItemPosting.length > 0 && (
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">⚡ Rapid Item Posting</h6>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {metrics.rapidItemPosting.slice(0, 5).map((u, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between">
                      <div>
                        <strong>{u.email}</strong>
                        <br />
                        <small className="text-muted">{u.name}</small>
                      </div>
                      <span className="badge bg-warning">{u.itemCount} items</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {metrics.rapidReporting.length > 0 && (
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">⚡ Rapid Reporting</h6>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {metrics.rapidReporting.slice(0, 5).map((u, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between">
                      <div>
                        <strong>{u.email}</strong>
                        <br />
                        <small className="text-muted">{u.name}</small>
                      </div>
                      <span className="badge bg-warning">{u.reportCount} reports</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">📊 Recent Security Events</h5>
        </div>
        <div className="card-body">
          {recentActivity.length === 0 ? (
            <p className="text-muted text-center">No recent activity</p>
          ) : (
            <div className="list-group">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{activity.description}</strong>
                      <br />
                      <small className="text-muted">
                        Reason: {activity.reason.replace('_', ' ')}
                      </small>
                    </div>
                    <div className="text-end">
                      <span className={`badge bg-${activity.status === 'pending' ? 'warning' : 'success'}`}>
                        {activity.status}
                      </span>
                      <br />
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SecurityAnalytics;