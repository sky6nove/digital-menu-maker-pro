
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Navbar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === "/menu" ? "menu" : "admin");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Menu Maker Pro</span>
          </Link>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admin" asChild>
              <Link to="/">Dashboard</Link>
            </TabsTrigger>
            <TabsTrigger value="menu" asChild>
              <Link to="/menu">Visualizar Menu</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};

export default Navbar;
