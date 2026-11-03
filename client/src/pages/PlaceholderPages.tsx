import { Bell, Info, LayoutGrid, Mail, MapPin, Settings } from "lucide-react";
import { PlaceholderPage } from "../components/shared/PlaceholderPage";

export const CategoriesPage = () => (
  <PlaceholderPage
    title="Categories"
    description="Browse our full range of product categories in one place."
    icon={LayoutGrid}
  />
);

export const AboutPage = () => (
  <PlaceholderPage
    title="About Us"
    description="Learn more about Nexa Commerce, our story and what we stand for."
    icon={Info}
  />
);

export const ContactPage = () => (
  <PlaceholderPage
    title="Contact"
    description="Get in touch with our team for questions, support or feedback."
    icon={Mail}
  />
);

export const NotificationsPage = () => (
  <PlaceholderPage
    title="Notifications"
    description="Stay up to date with order updates, offers and account activity."
    icon={Bell}
  />
);

export const AddressesPage = () => (
  <PlaceholderPage
    title="Addresses"
    description="Manage your saved delivery and billing addresses."
    icon={MapPin}
  />
);

export const AccountSettingsPage = () => (
  <PlaceholderPage
    title="Account Settings"
    description="Manage your preferences, security and notification settings."
    icon={Settings}
  />
);
