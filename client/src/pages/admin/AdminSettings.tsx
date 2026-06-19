import { PageTransition } from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { Store, User, Lock, BellRing } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export function AdminSettings() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and store preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/20 p-1 rounded-xl mb-8 border shadow-sm">
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"><User className="h-4 w-4 mr-2" /> Profile</TabsTrigger>
            <TabsTrigger value="store" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"><Store className="h-4 w-4 mr-2" /> Store Info</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"><Lock className="h-4 w-4 mr-2" /> Security</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"><BellRing className="h-4 w-4 mr-2" /> Notifications</TabsTrigger>
          </TabsList>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TabsContent value="profile" className="mt-0">
              <div className="bg-card border rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Admin Profile</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                    <Input defaultValue="Admin User" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email Address</label>
                    <Input defaultValue="admin@nexacommerce.com" />
                  </div>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="store" className="mt-0">
              <div className="bg-card border rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Store Configuration</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Store Name</label>
                    <Input defaultValue="Nexa Commerce" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Currency</label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Update Store</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <div className="bg-card border rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current Password</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">New Password</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
                    <Input type="password" />
                  </div>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Update Password</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="bg-card border rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4 max-w-md">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">New Orders</p>
                      <p className="text-sm text-muted-foreground">Get notified when a new order is placed.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 accent-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Low Stock Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified when inventory is running low.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 accent-blue-600" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </PageTransition>
  );
}
