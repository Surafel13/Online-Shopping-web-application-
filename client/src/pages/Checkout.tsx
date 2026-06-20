import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { ShieldCheck } from 'lucide-react';

export function Checkout() {
  return (
    <PageTransition>
      <div className="container px-4 py-8 max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Forms */}
        <div className="flex-1 max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Secure Checkout</h1>
            <div className="flex items-center text-sm text-green-600">
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Secure
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Express Checkout</span>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 bg-black hover:bg-black/90 text-white border-transparent">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V15.33H7.898v-3.33h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.876h2.773l-.443 3.33h-2.33v6.549C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Apple Pay
              </Button>
              <Button variant="outline" className="h-12 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600 shadow-sm">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/></svg>
                Google Pay
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Or continue with email</span>
              <Separator className="flex-1" />
            </div>
          </div>

          <div className="space-y-10">
            {/* Step 1 */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <h2 className="text-xl font-semibold">Contact Information</h2>
              </div>
              <div className="pl-12 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                  <Input type="email" placeholder="you@example.com" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="news" className="rounded border-gray-300 dark:border-slate-600 bg-background" />
                  <label htmlFor="news" className="text-sm">Email me with news and offers</label>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              <div className="pl-12 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Address</label>
                  <Input placeholder="123 Luxury Lane" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Apartment, suite, etc. (optional)</label>
                  <Input placeholder="Apt 4B" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">City</label>
                    <Input placeholder="New York" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">State</label>
                    <Input placeholder="NY" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">ZIP Code</label>
                    <Input placeholder="10001" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input placeholder="(555) 000-0000" />
                </div>
              </div>
            </section>

            {/* Step 3 */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <h2 className="text-xl font-semibold">Shipping Method</h2>
              </div>
              <div className="pl-12 space-y-3">
                <label className="flex items-center justify-between p-4 border rounded-lg border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 bg-background" defaultChecked />
                    <div>
                      <div className="font-medium">Standard Shipping</div>
                      <div className="text-sm text-muted-foreground">3-5 Business Days</div>
                    </div>
                  </div>
                  <span className="font-semibold">Free</span>
                </label>
                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 bg-background" />
                    <div>
                      <div className="font-medium">Express Delivery</div>
                      <div className="text-sm text-muted-foreground">1-2 Business Days</div>
                    </div>
                  </div>
                  <span className="font-medium">$15.00</span>
                </label>
              </div>
            </section>

            {/* Step 4 */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">4</div>
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              <div className="pl-12">
                <div className="border rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">Credit Card</span>
                    <div className="flex gap-1">
                      <div className="h-6 w-10 bg-gray-200 dark:bg-slate-700 rounded shrink-0"></div>
                      <div className="h-6 w-10 bg-gray-200 dark:bg-slate-700 rounded shrink-0"></div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Card Number</label>
                    <Input placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Expiration Date (MM/YY)</label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">CVV</label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Name on Card</label>
                    <Input placeholder="Full Name" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="border rounded-xl p-6 bg-muted/20 sticky top-24">
            <h2 className="text-lg font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="h-16 w-16 bg-white dark:bg-slate-800 border rounded-md overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium line-clamp-1">Premium Item {i}</h4>
                    <p className="text-xs text-muted-foreground">Color / Size</p>
                  </div>
                  <span className="text-sm font-semibold">$249.00</span>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="flex gap-2 mb-6">
              <Input placeholder="Gift card or discount code" className="flex-1 bg-white dark:bg-transparent" />
              <Button variant="secondary">Apply</Button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>$754.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center">Estimated Tax</span>
                <span>$62.20</span>
              </div>
            </div>

            <Separator className="my-4 border-gray-300 dark:border-slate-700" />

            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-lg">Total</span>
              <span className="text-2xl font-bold text-blue-600">USD $816.20</span>
            </div>

            <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 font-semibold shadow-md">
              Place Order
            </Button>
            
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center mt-4">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Secure 256-bit SSL Encrypted Payment
            </p>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
