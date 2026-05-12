import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, FolderTree, MessageCircle } from "lucide-react";
import { useProducts, useCategories } from "@/lib/queries";

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <Icon className="h-5 w-5 text-gold" />
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-serif">{value}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back to Eraya admin.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat icon={Gem} label="Total Products" value={products.length} />
        <Stat icon={FolderTree} label="Categories" value={categories.length} />
        <Stat icon={MessageCircle} label="Enquiries" value="—" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Quick tips</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Set your WhatsApp number in <strong>Profile & Settings</strong> so the "I Love It" button can send enquiries.</p>
          <p>• Add real product photos in <strong>Products</strong>. The seeded items use placeholder images.</p>
          <p>• Update your homepage hero in <strong>Banner & Homepage</strong>.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
