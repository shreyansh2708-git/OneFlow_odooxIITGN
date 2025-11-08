import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";
import { User, Mail, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await usersAPI.updateProfile(name);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground mt-1">
                View and update your profile information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-16 w-16 text-primary-foreground" />
                  </div>
                  <Button variant="outline" className="mt-4">
                    Change Picture
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex gap-2">
                      <User className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input id="email" type="email" defaultValue={user?.email} disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="flex gap-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input 
                        id="role" 
                        defaultValue={user?.role?.replace("_", " ").toUpperCase()} 
                        disabled 
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
