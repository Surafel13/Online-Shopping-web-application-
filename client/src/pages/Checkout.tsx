import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { ShieldCheck } from 'lucide-react';
import type { AppDispatch, RootState } from '../redux/store';
import { profileService, orderService } from '../services';
import { fetchCart } from '../redux/slices/cartSlice';
import { showError, showSuccess } from '../redux/slices/uiSlice';
import { getApiErrorMessage } from '../lib/errors';
import type { ApiAddress } from '../types/api';

export function Checkout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  useEffect(() => {
    dispatch(fetchCart());
    profileService.getProfile().then((profile) => {
      setAddresses(profile.addresses || []);
      const defaultAddress = profile.addresses?.[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      }
    });
  }, [dispatch]);

  const subtotal = totalAmount || items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal > 0 ? subtotal * 0.08 : 0;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      let addressId = selectedAddressId;

      if (!addressId) {
        if (!shippingForm.street || !shippingForm.city || !shippingForm.country) {
          dispatch(showError('Please fill out all required shipping address fields.'));
          setIsSubmitting(false);
          return;
        }

        const profile = await profileService.addAddress(shippingForm);
        const createdAddress = profile.addresses?.[profile.addresses.length - 1];
        addressId = createdAddress?._id || '';
      }

      if (!addressId) {
        dispatch(showError('Please provide a valid shipping address.'));
        setIsSubmitting(false);
        return;
      }

      await orderService.create(addressId, 'card');
      dispatch(fetchCart());
      dispatch(showSuccess('Order placed successfully.'));
      navigate('/orders');
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Unable to place order.')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="container px-4 py-8 max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-12">
        
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
                Apple Pay
              </Button>
              <Button variant="outline" className="h-12 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600 shadow-sm">
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
            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <h2 className="text-xl font-semibold">Contact Information</h2>
              </div>
              <div className="pl-12 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                  <Input type="email" placeholder="you@example.com" defaultValue={user?.email} />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              <div className="pl-12 space-y-4">
                {addresses.length > 0 && (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label key={address._id} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address._id}
                          onChange={() => setSelectedAddressId(address._id)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{address.street}</div>
                          <div className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postalCode}, {address.country}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Address</label>
                  <Input
                    placeholder="123 Luxury Lane"
                    value={shippingForm.street}
                    onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">City</label>
                    <Input
                      placeholder="New York"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">State</label>
                    <Input
                      placeholder="NY"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">ZIP Code</label>
                    <Input
                      placeholder="10001"
                      value={shippingForm.postalCode}
                      onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              <div className="pl-12">
                <div className="border rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">Credit Card</span>
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
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="w-full lg:w-[420px] shrink-0">
          <div className="border rounded-xl p-6 bg-muted/20 sticky top-24">
            <h2 className="text-lg font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="h-16 w-16 bg-white dark:bg-slate-800 border rounded-md overflow-hidden shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center">Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-4 border-gray-300 dark:border-slate-700" />

            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-lg">Total</span>
              <span className="text-2xl font-bold text-blue-600">USD ${total.toFixed(2)}</span>
            </div>

            <Button
              className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 font-semibold shadow-md"
              disabled={isSubmitting || items.length === 0}
              onClick={handlePlaceOrder}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
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
