
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AuthNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="font-bold text-xl text-primary">
              CardápioDG
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/menu"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Cardápio
              </Link>
              <Link
                to="/categories"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Categorias
              </Link>
              <Link
                to="/complement-groups"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Complementos
              </Link>
              <Link
                to="/settings"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Configurações
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-9 w-9 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/subscription")}>
                  Assinatura
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="relative rounded-full h-9 w-9 p-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-2">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/menu"
              onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              Cardápio
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              Categorias
            </Link>
            <Link
              to="/complement-groups"
              onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              <Package className="h-4 w-4 inline-block mr-1" />
              Complementos
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              Configurações
            </Link>
            <Link
              to="/subscription"
              onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              Assinatura
            </Link>
            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              <LogOut className="h-4 w-4 inline-block mr-1" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AuthNavbar;
