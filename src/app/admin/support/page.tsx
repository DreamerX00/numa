"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Search, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Reply,
  LifeBuoy,
  HelpCircle
} from 'lucide-react';

// Types
interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'GENERAL' | 'TECHNICAL' | 'BILLING' | 'PRODUCT' | 'SHIPPING';
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      displayName?: string;
    };
  };
  assignedAgent?: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  _count: {
    messages: number;
    attachments: number;
  };
}

interface SupportMessage {
  id: string;
  message: string;
  isFromCustomer: boolean;
  createdAt: string;
  author: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
}

interface TicketsResponse {
  tickets: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: SupportStats;
}

// API functions
const api = {
  getTickets: async (page = 1, limit = 20, search = '', status = 'all', priority = 'all'): Promise<TicketsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status !== 'all' && { status }),
      ...(priority !== 'all' && { priority })
    });
    const response = await fetch(`/api/admin/support/tickets?${params}`);
    if (!response.ok) throw new Error('Failed to fetch tickets');
    return response.json();
  },

  getTicketMessages: async (ticketId: string): Promise<SupportMessage[]> => {
    const response = await fetch(`/api/admin/support/tickets/${ticketId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  updateTicketStatus: async (id: string, status: string) => {
    const response = await fetch(`/api/admin/support/tickets/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update ticket status');
    return response.json();
  },

  assignTicket: async (id: string, agentId: string) => {
    const response = await fetch(`/api/admin/support/tickets/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    if (!response.ok) throw new Error('Failed to assign ticket');
    return response.json();
  },

  replyToTicket: async (ticketId: string, message: string) => {
    const response = await fetch(`/api/admin/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to send reply');
    return response.json();
  }
};

const statusConfig = {
  OPEN: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Open' },
  IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'In Progress' },
  RESOLVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' },
  CLOSED: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Closed' },
};

const priorityConfig = {
  LOW: { color: 'bg-blue-100 text-blue-800', label: 'Low' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  HIGH: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  URGENT: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
};

export default function AdminSupportPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [limit] = useState(20);
  
  const queryClient = useQueryClient();

  // Fetch tickets
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'support', 'tickets', currentPage, searchTerm, statusFilter, priorityFilter, limit],
    queryFn: () => api.getTickets(currentPage, limit, searchTerm, statusFilter, priorityFilter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch messages for selected ticket
  const { data: messages } = useQuery({
    queryKey: ['admin', 'support', 'messages', selectedTicket?.id],
    queryFn: () => selectedTicket ? api.getTicketMessages(selectedTicket.id) : Promise.resolve([]),
    enabled: !!selectedTicket,
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support'] });
    },
  });

  // Reply to ticket mutation
  const replyMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      api.replyToTicket(ticketId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support'] });
      setReplyMessage('');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleStatusUpdate = (ticketId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: ticketId, status: newStatus });
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicket && replyMessage.trim()) {
      replyMutation.mutate({ 
        ticketId: selectedTicket.id, 
        message: replyMessage.trim() 
      });
    }
  };

  const getCustomerName = (customer: SupportTicket['customer']) => {
    if (customer.profile?.firstName && customer.profile?.lastName) {
      return `${customer.profile.firstName} ${customer.profile.lastName}`;
    }
    if (customer.profile?.displayName) {
      return customer.profile.displayName;
    }
    return customer.email;
  };

  const tickets = data?.tickets || [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            <p className="text-gray-600">Manage customer support tickets and communications</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Tickets" 
              value={(stats.totalTickets ?? 0).toString()} 
              icon={LifeBuoy}
              trend="up"
              change="+5%"
            />
            <StatsCard 
              title="Open Tickets" 
              value={(stats.openTickets ?? 0).toString()} 
              icon={AlertCircle}
              trend="down"
              change="-12%"
            />
            <StatsCard 
              title="Resolved Today" 
              value={(stats.resolvedToday ?? 0).toString()} 
              icon={CheckCircle}
              trend="up"
              change="+18%"
            />
            <StatsCard 
              title="Avg Response Time" 
              value={`${stats.avgResponseTime ?? 0}h`} 
              icon={Clock}
              trend="down"
              change="-8%"
            />
          </div>
        )}

        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="settings">Support Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Support Tickets</CardTitle>
                  <div className="flex items-center space-x-2">
                    <form onSubmit={handleSearch} className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search tickets..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button type="submit" variant="outline">
                        Search
                      </Button>
                    </form>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    Failed to load tickets. Please try again.
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket #</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Messages</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.map((ticket) => {
                          const StatusIcon = statusConfig[ticket.status].icon;
                          return (
                            <TableRow key={ticket.id}>
                              <TableCell className="font-mono">
                                {ticket.ticketNumber}
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  <div className="font-medium truncate">{ticket.subject}</div>
                                  <div className="text-sm text-gray-500 truncate">
                                    {ticket.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{getCustomerName(ticket.customer)}</div>
                                  <div className="text-sm text-gray-500">{ticket.customer.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={statusConfig[ticket.status].color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig[ticket.status].label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={priorityConfig[ticket.priority].color}>
                                  {priorityConfig[ticket.priority].label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <MessageSquare className="h-4 w-4 text-gray-400" />
                                  <span>{ticket._count.messages}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setSelectedTicket(ticket)}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                    </DialogTrigger>
                                    <TicketDetailDialog 
                                      ticket={selectedTicket} 
                                      messages={messages || []}
                                      onStatusUpdate={handleStatusUpdate}
                                      onReply={handleReply}
                                      replyMessage={replyMessage}
                                      setReplyMessage={setReplyMessage}
                                      isReplying={replyMutation.isPending}
                                    />
                                  </Dialog>
                                  <Select
                                    value={ticket.status}
                                    onValueChange={(status) => handleStatusUpdate(ticket.id, status)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="OPEN">Open</SelectItem>
                                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                                      <SelectItem value="CLOSED">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} tickets
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            disabled={pagination.page === 1}
                            onClick={() => setCurrentPage(pagination.page - 1)}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-gray-600">
                            Page {pagination.page} of {pagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => setCurrentPage(pagination.page + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  Knowledge base management coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Support Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  Support settings coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// Ticket Detail Dialog Component
interface TicketDetailDialogProps {
  ticket: SupportTicket | null;
  messages: SupportMessage[];
  onStatusUpdate: (ticketId: string, status: string) => void;
  onReply: (e: React.FormEvent) => void;
  replyMessage: string;
  setReplyMessage: (message: string) => void;
  isReplying: boolean;
}

function TicketDetailDialog({ 
  ticket, 
  messages, 
  onStatusUpdate, 
  onReply, 
  replyMessage, 
  setReplyMessage, 
  isReplying 
}: TicketDetailDialogProps) {
  if (!ticket) return null;

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>Ticket #{ticket.ticketNumber}</span>
          <div className="flex items-center space-x-2">
            <Badge className={statusConfig[ticket.status].color}>
              {statusConfig[ticket.status].label}
            </Badge>
            <Badge className={priorityConfig[ticket.priority].color}>
              {priorityConfig[ticket.priority].label}
            </Badge>
          </div>
        </DialogTitle>
        <DialogDescription>
          {ticket.subject}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-3 gap-6 h-96">
        {/* Messages */}
        <div className="col-span-2 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 border rounded-lg p-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium text-sm text-gray-600 mb-2">
                Original Message from {ticket.customer.email}
              </div>
              <p className="text-gray-900">{ticket.description}</p>
              <div className="text-xs text-gray-500 mt-2">
                {new Date(ticket.createdAt).toLocaleString()}
              </div>
            </div>
            
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-4 rounded-lg ${
                  message.isFromCustomer 
                    ? 'bg-blue-50 ml-8' 
                    : 'bg-green-50 mr-8'
                }`}
              >
                <div className="font-medium text-sm text-gray-600 mb-2">
                  {message.isFromCustomer ? 'Customer' : 'Support Agent'}
                </div>
                <p className="text-gray-900">{message.message}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(message.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          
          {/* Reply Form */}
          <form onSubmit={onReply} className="mt-4 space-y-2">
            <Textarea
              placeholder="Type your reply..."
              value={replyMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyMessage(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isReplying || !replyMessage.trim()}>
                <Reply className="h-4 w-4 mr-2" />
                {isReplying ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </form>
        </div>

        {/* Ticket Info */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Customer Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Email:</span>
                <div>{ticket.customer.email}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Ticket Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <div>{ticket.category}</div>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <div>{new Date(ticket.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <div>{new Date(ticket.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Actions</h4>
            <div className="space-y-2">
              <Select
                value={ticket.status}
                onValueChange={(status) => onStatusUpdate(ticket.id, status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
  change: string;
}

function StatsCard({ title, value, icon: Icon, trend, change }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="mt-4">
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {change}
          </span>
          <span className="text-sm text-gray-600 ml-1">from last week</span>
        </div>
      </CardContent>
    </Card>
  );
}