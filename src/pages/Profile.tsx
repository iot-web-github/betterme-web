import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Calendar, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading, updating, updateProfile } = useProfile();
  
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile({
      full_name: fullName || null,
      avatar_url: avatarUrl || null,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground text-sm">Manage your account settings</p>
            </div>
          </div>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={fullName || 'Profile'} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{fullName || 'Your Name'}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
          </Card>

          {/* Settings Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL for your profile picture
                </p>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={updating}
                className="w-full"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.created_at 
                      ? format(new Date(profile.created_at), 'MMMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full"
          >
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
