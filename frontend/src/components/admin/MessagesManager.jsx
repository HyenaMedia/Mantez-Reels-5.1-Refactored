import React, { useState, useEffect } from 'react';
import { 
  Mail, MailOpen, Star, Archive, Trash2, Reply, Search, 
  Download, Send, User,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const MessagesManager = () => {
  const { token } = useAuth(); // Get token from context
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDetail, setShowMessageDetail] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, unread, starred, archived
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month
  
  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Reply form
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyMessageId, setReplyMessageId] = useState(null);
  const [sending, setSending] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/contact/messages`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        // Add UI state to messages
        const messagesWithState = (response.data.messages || []).map(msg => ({
          ...msg,
          read: msg.read || (msg.status !== 'new'), // Fallback to status if read is missing
          starred: msg.starred || false,
          archived: msg.archived || false,
        }));

        setMessages(messagesWithState);
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    filterMessages();
  }, [messages, searchQuery, activeFilter, dateRange]);

  const fetchMessages = async () => {
    if (!token) return; // Don't fetch if no token

    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/contact/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add UI state to messages
      const messagesWithState = (response.data.messages || []).map(msg => ({
        ...msg,
        read: msg.read || (msg.status !== 'new'), // Fallback to status if read is missing
        starred: msg.starred || false,
        archived: msg.archived || false,
      }));

      setMessages(messagesWithState);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];
    
    // Apply status filter
    if (activeFilter === 'unread') {
      filtered = filtered.filter(m => !m.read);
    } else if (activeFilter === 'starred') {
      filtered = filtered.filter(m => m.starred);
    } else if (activeFilter === 'archived') {
      filtered = filtered.filter(m => m.archived);
    } else {
      // 'all' - exclude archived by default
      filtered = filtered.filter(m => !m.archived);
    }
    
    // Apply date filter
    const now = new Date();
    if (dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(m => new Date(m.created_at) >= today);
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(m => new Date(m.created_at) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(m => new Date(m.created_at) >= monthAgo);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.subject?.toLowerCase().includes(query) ||
        m.message?.toLowerCase().includes(query)
      );
    }
    
    setFilteredMessages(filtered);
  };

  const toggleRead = async (id) => {
    const message = messages.find(m => m.id === id);
    const newReadStatus = !message.read;
    
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, read: newReadStatus } : m
    ));
    
    try {
      await axios.patch(`${BACKEND_URL}/api/contact/messages/${id}`, null, {
        params: { read: newReadStatus },
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      // Revert on failure
      setMessages(prev => prev.map(m => 
        m.id === id ? { ...m, read: !newReadStatus } : m
      ));
    }
  };

  const toggleStar = async (id) => {
    const message = messages.find(m => m.id === id);
    const newStarStatus = !message.starred;
    
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, starred: newStarStatus } : m
    ));
    
    try {
      await axios.patch(`${BACKEND_URL}/api/contact/messages/${id}`, null, {
        params: { starred: newStarStatus },
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === id ? { ...m, starred: !newStarStatus } : m
      ));
    }
    
    toast({
      title: newStarStatus ? 'Starred' : 'Unstarred',
      description: 'Message updated',
    });
  };

  const toggleArchive = async (id) => {
    const message = messages.find(m => m.id === id);
    const newArchivedStatus = !message.archived;
    
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, archived: newArchivedStatus } : m
    ));
    
    try {
      await axios.patch(`${BACKEND_URL}/api/contact/messages/${id}`, null, {
        params: { archived: newArchivedStatus },
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === id ? { ...m, archived: !newArchivedStatus } : m
      ));
    }
    
    toast({
      title: newArchivedStatus ? 'Archived' : 'Unarchived',
      description: 'Message moved',
    });
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await axios.delete(`${BACKEND_URL}/api/contact/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => prev.filter(m => m.id !== id));
      setShowMessageDetail(false);
      
      toast({
        title: 'Deleted',
        description: 'Message permanently deleted',
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action) => {
    const ids = Array.from(selectedIds);
    
    if (action === 'markRead') {
      setMessages(prev => prev.map(m => 
        ids.includes(m.id) ? { ...m, read: true } : m
      ));
    } else if (action === 'markUnread') {
      setMessages(prev => prev.map(m => 
        ids.includes(m.id) ? { ...m, read: false } : m
      ));
    } else if (action === 'archive') {
      setMessages(prev => prev.map(m => 
        ids.includes(m.id) ? { ...m, archived: true } : m
      ));
    } else if (action === 'delete') {
      if (!window.confirm(`Delete ${ids.length} messages?`)) return;
      
      try {
        await Promise.all(ids.map(id => 
          axios.delete(`${BACKEND_URL}/api/contact/messages/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
        
        setMessages(prev => prev.filter(m => !ids.includes(m.id)));
      } catch (error) {
        console.error('Failed to bulk delete messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete some messages',
          variant: 'destructive',
        });
      }
    }
    
    setSelectedIds(new Set());
    setSelectAll(false);
    
    toast({
      title: 'Updated',
      description: `${ids.length} message(s) updated`,
    });
  };

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Name', 'Email', 'Subject', 'Message', 'Status'].join(','),
      ...filteredMessages.map(m => [
        new Date(m.created_at).toISOString(),
        m.name,
        m.email,
        m.subject || '',
        `"${(m.message || '').replace(/"/g, '""')}"`,
        m.read ? 'Read' : 'Unread'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: 'Exported',
      description: `${filteredMessages.length} messages exported to CSV`,
    });
  };

  const handleReply = (message) => {
    setReplyTo(message.email);
    setReplySubject(`Re: ${message.subject || 'Contact Form Message'}`);
    setReplyBody('');
    setReplyMessageId(message.id);
    setShowReplyDialog(true);
  };

  const sendReply = async () => {
    setSending(true);
    try {
      await axios.post(`${BACKEND_URL}/api/contact/reply`, {
        to: replyTo,
        subject: replySubject,
        body: replyBody,
        message_id: replyMessageId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state: mark message as replied
      if (replyMessageId) {
        setMessages(prev => prev.map(m =>
          m.id === replyMessageId ? { ...m, status: 'replied', replied_at: new Date().toISOString() } : m
        ));
      }

      toast({
        title: 'Sent',
        description: 'Reply sent successfully',
      });

      setShowReplyDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedMessages.map(m => m.id)));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === paginatedMessages.length);
  };

  // Pagination
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const stats = {
    total: messages.filter(m => !m.archived).length,
    unread: messages.filter(m => !m.read && !m.archived).length,
    starred: messages.filter(m => m.starred && !m.archived).length,
    archived: messages.filter(m => m.archived).length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Messages</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <Mail className="text-violet-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unread</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.unread}</p>
            </div>
            <MailOpen className="text-blue-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Starred</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.starred}</p>
            </div>
            <Star className="text-yellow-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Archived</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.archived}</p>
            </div>
            <Archive className="text-gray-400" size={24} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[140px] bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10 text-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px] bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10 text-white">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={fetchMessages}
              variant="outline"
              size="sm"
              className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
            >
              <RefreshCw size={16} />
            </Button>
            
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <span className="text-violet-400 font-medium">{selectedIds.size} selected</span>
            <div className="flex gap-2 ml-auto">
              <Button
                onClick={() => handleBulkAction('markRead')}
                size="sm"
                variant="outline"
                className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
              >
                <MailOpen size={14} className="mr-1" />
                Mark Read
              </Button>
              <Button
                onClick={() => handleBulkAction('markUnread')}
                size="sm"
                variant="outline"
                className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
              >
                <Mail size={14} className="mr-1" />
                Mark Unread
              </Button>
              <Button
                onClick={() => handleBulkAction('archive')}
                size="sm"
                variant="outline"
                className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
              >
                <Archive size={14} className="mr-1" />
                Archive
              </Button>
              <Button
                onClick={() => handleBulkAction('delete')}
                size="sm"
                variant="outline"
                className="bg-white/[0.04] border-red-500/30 hover:bg-red-500/10 text-red-400"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium mb-2">No messages found</p>
            <p className="text-gray-500 text-sm">Messages will appear here when someone contacts you</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/[0.06] bg-white/[0.02] text-sm font-medium text-gray-400">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.04] text-violet-500 focus:ring-violet-500"
                />
              </div>
              <div className="col-span-3">From</div>
              <div className="col-span-4">Subject</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            {/* Messages */}
            {paginatedMessages.map((message) => (
              <div
                key={message.id}
                className={`grid grid-cols-12 gap-4 p-4 border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer
                  ${!message.read ? 'bg-violet-500/5' : ''}`}
                onClick={() => {
                  setSelectedMessage(message);
                  setShowMessageDetail(true);
                  if (!message.read) toggleRead(message.id);
                }}
              >
                <div className="col-span-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(message.id)}
                    onChange={() => toggleSelect(message.id)}
                    className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.04] text-violet-500 focus:ring-violet-500"
                  />
                </div>
                
                <div className="col-span-3 flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {message.starred ? (
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${!message.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                      {message.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{message.email}</p>
                  </div>
                </div>
                
                <div className="col-span-4 flex items-center">
                  <p className={`text-sm truncate ${!message.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {message.subject || 'No subject'}
                  </p>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <p className="text-sm text-gray-500">{formatDate(message.created_at)}</p>
                </div>
                
                <div className="col-span-2 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleStar(message.id)}
                    className="p-1 hover:bg-white/[0.08] rounded transition-colors"
                    title={message.starred ? 'Unstar' : 'Star'}
                  >
                    <Star size={16} className={message.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'} />
                  </button>
                  
                  <button
                    onClick={() => handleReply(message)}
                    className="p-1 hover:bg-white/[0.08] rounded transition-colors"
                    title="Reply"
                  >
                    <Reply size={16} className="text-gray-500" />
                  </button>
                  
                  <button
                    onClick={() => toggleArchive(message.id)}
                    className="p-1 hover:bg-white/[0.08] rounded transition-colors"
                    title={message.archived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive size={16} className="text-gray-500" />
                  </button>
                  
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-gray-500 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMessages.length)} of {filteredMessages.length} messages
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={showMessageDetail} onOpenChange={setShowMessageDetail}>
        <DialogContent className="bg-[#12121a] border-white/[0.08] text-white max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-3">
                  <User size={20} className="text-violet-400" />
                  {selectedMessage.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedMessage.email}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Subject</p>
                  <p className="text-white font-medium">{selectedMessage.subject || 'No subject'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Received</p>
                  <p className="text-gray-300">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Message</p>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button
                  onClick={() => handleReply(selectedMessage)}
                  className="bg-violet-600 hover:bg-violet-500"
                >
                  <Reply size={16} className="mr-2" />
                  Reply
                </Button>
                
                <Button
                  onClick={() => {
                    toggleStar(selectedMessage.id);
                    setSelectedMessage({ ...selectedMessage, starred: !selectedMessage.starred });
                  }}
                  variant="outline"
                  className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
                >
                  <Star size={16} className={`mr-2 ${selectedMessage.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {selectedMessage.starred ? 'Unstar' : 'Star'}
                </Button>
                
                <Button
                  onClick={() => {
                    toggleArchive(selectedMessage.id);
                    setShowMessageDetail(false);
                  }}
                  variant="outline"
                  className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
                >
                  <Archive size={16} className="mr-2" />
                  Archive
                </Button>
                
                <Button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  variant="outline"
                  className="bg-white/[0.04] border-red-500/30 hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="bg-[#12121a] border-white/[0.08] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">To</label>
              <input
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                className="w-full px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Subject</label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="w-full px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Message</label>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={8}
                className="w-full px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-violet-500 resize-none"
                placeholder="Type your reply..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setShowReplyDialog(false)}
              variant="outline"
              className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
            >
              Cancel
            </Button>
            <Button
              onClick={sendReply}
              disabled={sending || !replyTo || !replyBody}
              className="bg-violet-600 hover:bg-violet-500"
            >
              {sending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesManager;
