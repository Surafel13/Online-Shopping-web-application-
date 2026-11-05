import { SectionPlaceholder } from "./SectionPlaceholder";

export { SuperAdminProducts } from "./SuperAdminProducts";
export { SuperAdminCategories } from "./SuperAdminCategories";
export { SuperAdminOrders } from "./SuperAdminOrders";
export { SuperAdminPayments } from "./SuperAdminPayments";
export { SuperAdminReviews } from "./SuperAdminReviews";

export const SuperAdminUsers = () => <SectionPlaceholder slug="users" />;
export const SuperAdminAdmins = () => <SectionPlaceholder slug="admins" />;
export const SuperAdminReports = () => <SectionPlaceholder slug="reports" />;
export const SuperAdminInventory = () => (
  <SectionPlaceholder slug="inventory" />
);
export const SuperAdminActivityLogs = () => (
  <SectionPlaceholder slug="activity-logs" />
);
export const SuperAdminSettings = () => <SectionPlaceholder slug="settings" />;
export const SuperAdminProfile = () => <SectionPlaceholder slug="profile" />;
