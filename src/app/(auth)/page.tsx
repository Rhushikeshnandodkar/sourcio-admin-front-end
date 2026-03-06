const PlatformInfoPage = () => {
  return (
    <div className="text-base border min-h-[calc(100vh-1.1rem)] rounded-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">Welcome to Sourcio Admin</h1>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Your comprehensive platform for managing products, customers, sales,
          and more.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Products</h3>
            <p className="text-sm text-muted-foreground">
              Manage your product catalogue, checkout links, and discounts
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Customers</h3>
            <p className="text-sm text-muted-foreground">
              View and manage your customer base
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Sales</h3>
            <p className="text-sm text-muted-foreground">
              Track orders and subscriptions
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Usage Billing</h3>
            <p className="text-sm text-muted-foreground">
              Configure meters and track events
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your business performance
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure your platform settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformInfoPage;
