import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Save, X, Mail, Phone, MapPin, Link as LinkIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAutomaticPlatformIcon, detectPlatformFromUrl } from "@/lib/platformIcons";

interface GetInTouchItem {
  type: 'email' | 'phone' | 'location' | 'custom';
  label: string;
  value: string;
  icon?: string;
  link?: string;
}

interface FollowMeItem {
  platform: string;
  url: string;
  icon: string;
  label: string;
  isActive?: boolean;
}

interface QuickLink {
  label: string;
  url: string;
  type: 'internal' | 'external';
}

interface FooterContent {
  // Main Profile Section
  profileName: string;
  profileInitials: string;
  profileDescription: string;
  
  // Newsletter Section
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterButtonText: string;
  emailPlaceholder: string;
  
  // Get in Touch Section
  getInTouchTitle: string;
  getInTouchItems: GetInTouchItem[];
  
  // Follow Me Section
  followMeTitle: string;
  followMeItems: FollowMeItem[];
  
  // Quick Links Section
  quickLinksTitle: string;
  quickLinks: QuickLink[];
  
  // Footer Bottom
  copyrightText: string;
  backToTopText: string;
}

export function FooterManager() {
  const [activeSection, setActiveSection] = useState<'profile' | 'newsletter' | 'getInTouch' | 'followMe' | 'quickLinks' | 'general'>('profile');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sectionOptions = [
    { value: 'profile', label: 'Profile Section' },
    { value: 'newsletter', label: 'Newsletter Section' },
    { value: 'getInTouch', label: 'Get in Touch' },
    { value: 'followMe', label: 'Follow Me' },
    { value: 'quickLinks', label: 'Quick Links' },
    { value: 'general', label: 'Footer Bottom' }
  ];

  // Fetch footer content
  const { data: footerContent, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/footer'],
    queryFn: async () => {
      const response = await fetch('/api/admin/footer', {
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json",
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch footer content');
      const result = await response.json();
      return result.data;
    },
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Update footer content
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<FooterContent>) => {
      return apiRequest({
        method: footerContent ? 'PUT' : 'POST',
        url: '/api/admin/footer',
        data
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Footer content updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/footer'] });
      queryClient.invalidateQueries({ queryKey: ['/api/footer'] }); // Invalidate public endpoint
      setIsFormOpen(false);
      setEditingItem(null);
      setFormData({});
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleUpdateGeneral = (field: string, value: string) => {
    const updatedData = {
      ...footerContent,
      [field]: value
    };
    updateMutation.mutate(updatedData);
  };

  const handleAddItem = (section: 'getInTouchItems' | 'followMeItems' | 'quickLinks') => {
    let newItem: any = {};
    
    switch (section) {
      case 'getInTouchItems':
        newItem = { type: 'email', label: '', value: '', icon: '', link: '' };
        break;
      case 'followMeItems':
        newItem = { platform: '', url: '', icon: '', label: '', isActive: true };
        break;
      case 'quickLinks':
        newItem = { label: '', url: '', type: 'internal' };
        break;
    }
    
    setFormData(newItem);
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (section: 'getInTouchItems' | 'followMeItems' | 'quickLinks', index: number) => {
    const item = footerContent?.[section]?.[index];
    if (item) {
      setFormData({ ...item, section, index });
      setEditingItem({ section, index });
      setIsFormOpen(true);
    }
  };

  const handleDeleteItem = (section: 'getInTouchItems' | 'followMeItems' | 'quickLinks', index: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const items = [...(footerContent?.[section] || [])];
      items.splice(index, 1);
      
      const updatedData = {
        ...footerContent,
        [section]: items
      };
      updateMutation.mutate(updatedData);
    }
  };

  const handleToggleActive = (section: 'followMeItems', index: number) => {
    const items = [...(footerContent?.[section] || [])];
    const item = items[index];
    if (item) {
      // Debug logging
      console.log('Before toggle:', { item, isActive: item.isActive });
      
      // Toggle the isActive status - treat undefined as true (active by default)
      const currentStatus = item.isActive !== false; // true if undefined or true, false if explicitly false
      const newStatus = !currentStatus;
      
      console.log('Toggle logic:', { currentStatus, newStatus });
      
      items[index] = {
        ...item,
        isActive: newStatus
      };
      
      console.log('After toggle:', { updatedItem: items[index] });
      
      const updatedData = {
        ...footerContent,
        [section]: items
      };
      updateMutation.mutate(updatedData);
    }
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    const { section, index, ...itemData } = formData;
    
    let updatedItems;
    if (editingItem) {
      // Edit existing item
      updatedItems = [...(footerContent?.[editingItem.section] || [])];
      updatedItems[editingItem.index] = itemData;
    } else {
      // Add new item
      const targetSection = activeSection === 'getInTouch' ? 'getInTouchItems' :
                           activeSection === 'followMe' ? 'followMeItems' : 'quickLinks';
      updatedItems = [...(footerContent?.[targetSection] || []), itemData];
    }

    const targetSection = editingItem ? editingItem.section : 
                         (activeSection === 'getInTouch' ? 'getInTouchItems' :
                          activeSection === 'followMe' ? 'followMeItems' : 'quickLinks');

    const updatedData = {
      ...footerContent,
      [targetSection]: updatedItems
    };
    updateMutation.mutate(updatedData);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      default: return <LinkIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="p-4 text-white">Loading footer content...</div>;
  }

  // Debug: Check if we have footer content
  console.log("Footer content:", footerContent);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Footer Content</h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage footer sections, contact info and social links</p>
        </div>
        <div className="flex space-x-2 relative">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full sm:w-[200px] bg-gray-700/50 border border-gray-600 text-white px-3 py-2 rounded-md text-left flex items-center justify-between hover:bg-gray-600/50 transition-colors"
            >
              <span>{sectionOptions.find(opt => opt.value === activeSection)?.label || 'Select section'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                {sectionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setActiveSection(option.value as any);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {!footerContent && (
            <Button 
              onClick={() => {
                apiRequest({
                  method: 'POST',
                  url: '/api/admin/migrate-footer-data'
                }).then(() => {
                  refetch();
                  toast({ title: "Success", description: "Footer data initialized successfully" });
                }).catch((error) => {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Initialize Footer Data
            </Button>
          )}
        </div>
      </div>

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-lg sm:text-xl">Profile Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">Profile Name</Label>
                <Input
                  value={footerContent?.profileName || ''}
                  onChange={(e) => handleUpdateGeneral('profileName', e.target.value)}
                  placeholder="Noorain Raza"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Profile Initials</Label>
                <Input
                  value={footerContent?.profileInitials || ''}
                  onChange={(e) => handleUpdateGeneral('profileInitials', e.target.value)}
                  placeholder="NR"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Profile Description</Label>
              <Textarea
                value={footerContent?.profileDescription || ''}
                onChange={(e) => handleUpdateGeneral('profileDescription', e.target.value)}
                placeholder="Passionate DevOps Engineer with expertise in cloud technologies..."
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter Section */}
      {activeSection === 'newsletter' && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-lg sm:text-xl">Newsletter Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">Newsletter Title</Label>
                <Input
                  value={footerContent?.newsletterTitle || ''}
                  onChange={(e) => handleUpdateGeneral('newsletterTitle', e.target.value)}
                  placeholder="STAY UPDATED"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Button Text</Label>
                <Input
                  value={footerContent?.newsletterButtonText || ''}
                  onChange={(e) => handleUpdateGeneral('newsletterButtonText', e.target.value)}
                  placeholder="Subscribe"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Email Placeholder</Label>
                <Input
                  value={footerContent?.emailPlaceholder || ''}
                  onChange={(e) => handleUpdateGeneral('emailPlaceholder', e.target.value)}
                  placeholder="Your email address"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Newsletter Description</Label>
              <Textarea
                value={footerContent?.newsletterDescription || ''}
                onChange={(e) => handleUpdateGeneral('newsletterDescription', e.target.value)}
                placeholder="I'll send occasional updates on new projects and tech content."
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Bottom Settings */}
      {activeSection === 'general' && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-lg sm:text-xl">General Footer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">Get in Touch Title</Label>
                <Input
                  value={footerContent?.getInTouchTitle || ''}
                  onChange={(e) => handleUpdateGeneral('getInTouchTitle', e.target.value)}
                  placeholder="Get in Touch"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Follow Me Title</Label>
                <Input
                  value={footerContent?.followMeTitle || ''}
                  onChange={(e) => handleUpdateGeneral('followMeTitle', e.target.value)}
                  placeholder="Follow Me"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Quick Links Title</Label>
                <Input
                  value={footerContent?.quickLinksTitle || ''}
                  onChange={(e) => handleUpdateGeneral('quickLinksTitle', e.target.value)}
                  placeholder="Quick Links"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Back to Top Text</Label>
                <Input
                  value={footerContent?.backToTopText || ''}
                  onChange={(e) => handleUpdateGeneral('backToTopText', e.target.value)}
                  placeholder="Back to Top"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Copyright Text</Label>
              <Input
                value={footerContent?.copyrightText || ''}
                onChange={(e) => handleUpdateGeneral('copyrightText', e.target.value)}
                placeholder="© 2024 Your Name. All rights reserved."
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Get in Touch Items */}
      {activeSection === 'getInTouch' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Get in Touch Items</h3>
            <Button onClick={() => handleAddItem('getInTouchItems')} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact Item
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {footerContent?.getInTouchItems?.map((item: GetInTouchItem, index: number) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-blue-400">{getIconForType(item.type)}</div>
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-gray-400">{item.value}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItem('getInTouchItems', index)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem('getInTouchItems', index)}
                        className="border-gray-600 text-red-400 hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Follow Me Items */}
      {activeSection === 'followMe' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Follow Me Items</h3>
            <Button onClick={() => handleAddItem('followMeItems')} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Social Link
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {footerContent?.followMeItems?.map((item: FollowMeItem, index: number) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white text-sm sm:text-base truncate">{item.platform}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.isActive !== false 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {item.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">{item.url}</p>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive('followMeItems', index)}
                          className={`h-8 w-8 p-0 border-gray-600 hover:bg-gray-700 ${
                            item.isActive !== false 
                              ? 'text-green-400 hover:text-green-300' 
                              : 'text-red-400 hover:text-red-300'
                          }`}
                          title={item.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          {item.isActive !== false ? (
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-400"></div>
                          ) : (
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-gray-400"></div>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem('followMeItems', index)}
                          className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem('followMeItems', index)}
                          className="h-8 w-8 p-0 border-gray-600 text-red-400 hover:bg-gray-700"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      {activeSection === 'quickLinks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Quick Links</h3>
            <Button onClick={() => handleAddItem('quickLinks')} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Quick Link
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {footerContent?.quickLinks?.map((item: QuickLink, index: number) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm sm:text-base truncate">{item.label}</p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{item.url}</p>
                      <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded mt-2 inline-block">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItem('quickLinks', index)}
                        className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem('quickLinks', index)}
                        className="h-8 w-8 p-0 border-gray-600 text-red-400 hover:bg-gray-700"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="w-full max-w-md bg-gray-800/95 border-gray-700 max-h-[90vh] overflow-hidden">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-700">
              <CardTitle className="text-white text-lg sm:text-xl">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmitItem} className="space-y-3 sm:space-y-4">
                {/* Get in Touch Form */}
                {(activeSection === 'getInTouch' || editingItem?.section === 'getInTouchItems') && (
                  <>
                    <div>
                      <Label>Type</Label>
                      <select
                        value={formData.type || 'email'}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 text-white px-3 py-2 rounded-md mt-1"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="location">Location</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={formData.label || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, label: e.target.value }))}
                        placeholder="Contact label"
                        required
                      />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={formData.value || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, value: e.target.value }))}
                        placeholder="Contact value"
                        required
                      />
                    </div>
                    <div>
                      <Label>Link (optional)</Label>
                      <Input
                        value={formData.link || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, link: e.target.value }))}
                        placeholder="mailto:, tel:, or URL"
                      />
                    </div>
                  </>
                )}

                {/* Follow Me Form */}
                {(activeSection === 'followMe' || editingItem?.section === 'followMeItems') && (
                  <>
                    <div>
                      <Label>Platform</Label>
                      <Input
                        value={formData.platform || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, platform: e.target.value }))}
                        placeholder="LinkedIn, GitHub, Twitter..."
                        required
                      />
                    </div>
                    <div>
                      <Label>URL</Label>
                      <Input
                        value={formData.url || ''}
                        onChange={(e) => {
                          const url = e.target.value;
                          setFormData((prev: any) => {
                            const newData = { ...prev, url };
                            
                            // Auto-detect platform when URL is entered
                            if (url && url.includes('://')) {
                              const detectedPlatform = detectPlatformFromUrl(url);
                              if (detectedPlatform && detectedPlatform !== 'unknown') {
                                newData.platform = detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1);
                              }
                            }
                            
                            return newData;
                          });
                        }}
                        placeholder="https://..."
                        required
                      />
                      {formData.url && formData.url.includes('://') && (
                        <div className="mt-2 p-2 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Auto-detected:</span>
                            {(() => {
                              const { icon, detectedPlatform } = getAutomaticPlatformIcon(formData.url, formData.platform);
                              return (
                                <div className="flex items-center gap-1">
                                  {icon}
                                  <span className="capitalize">{detectedPlatform}</span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Icon (optional - auto-detected from URL)</Label>
                      <Input
                        value={formData.icon || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, icon: e.target.value }))}
                        placeholder="Custom icon override (emoji or CSS class)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to use automatic platform detection from URL
                      </p>
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={formData.label || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, label: e.target.value }))}
                        placeholder="Display label"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Quick Links Form */}
                {(activeSection === 'quickLinks' || editingItem?.section === 'quickLinks') && (
                  <>
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={formData.label || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, label: e.target.value }))}
                        placeholder="Link text"
                        required
                      />
                    </div>
                    <div>
                      <Label>URL</Label>
                      <Input
                        value={formData.url || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, url: e.target.value }))}
                        placeholder="/about or https://..."
                        required
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <select
                        value={formData.type || 'internal'}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 text-white px-3 py-2 rounded-md mt-1"
                      >
                        <option value="internal">Internal Link</option>
                        <option value="external">External Link</option>
                      </select>
                    </div>
                  </>
                )}
                
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}