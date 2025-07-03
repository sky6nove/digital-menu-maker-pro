import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import MenuPreview from "@/components/MenuPreview";
import AuthNavbar from "@/components/AuthNavbar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Menu = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuName, setMenuName] = useState("CARDÁPIO Burguers");
  const [slogan, setSlogan] = useState("Sabor sem igual!");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load profile for menu name
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
        
      if (!profileError && profileData) {
        setMenuName(profileData.menu_name || "CARDÁPIO Burguers");
        setSlogan(profileData.slogan || "Sabor sem igual!");
        setWhatsappNumber(profileData.whatsapp_number || "");
        setRestaurantAddress(profileData.restaurant_address || "");
      }
      
      // Load categories with proper ordering
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id)
        .order('order', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      // Load products with proper ordering and all needed data
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          product_complement_groups (
            id, 
            complement_group_id, 
            is_required
          )
        `)
        .eq("user_id", user?.id)
        .order('display_order', { ascending: true, nullsFirst: false });
      
      if (productsError) throw productsError;
      
      // Transform to match our existing interfaces
      const formattedCategories: Category[] = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.name,
        isActive: cat.is_active,
        order: cat.order || 0,
        categoryType: (cat.category_type === 'pizza' ? 'pizza' : 'regular') as 'regular' | 'pizza',
        allowHalfHalf: cat.allow_half_half || false,
        halfHalfPriceRule: (cat.half_half_price_rule as 'lowest' | 'highest' | 'average') || 'highest',
        hasPortions: cat.has_portions || false,
        portionsLabel: cat.portions_label || 'Serve'
      }));
      
      const formattedProducts: Product[] = productsData.map(prod => {
        console.log(`Product ${prod.name} image URL:`, prod.image_url);
        return {
          id: prod.id,
          name: prod.name,
          description: prod.description || "",
          price: prod.price,
          categoryId: prod.category_id || 0,
          isActive: prod.is_active,
          image_url: prod.image_url,
          allow_half_half: prod.allow_half_half || false,
          half_half_price_rule: prod.half_half_price_rule as 'lowest' | 'highest' | 'average' || 'highest',
          pdvCode: prod.pdv_code,
          productTypeId: prod.product_type_id,
          dietaryRestrictions: prod.dietary_restrictions,
          portionSize: prod.portion_size,
          servesCount: prod.serves_count,
          hasStockControl: prod.has_stock_control || false,
          stockQuantity: prod.stock_quantity,
          display_order: prod.display_order
        };
      });
      
      setCategories(formattedCategories);
      setProducts(formattedProducts);

      console.log("Loaded products with images:", formattedProducts.filter(p => p.image_url).map(p => ({ name: p.name, image_url: p.image_url })));
    } catch (error: any) {
      toast.error("Erro ao carregar dados do menu");
      console.error("Error loading menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      <MenuPreview 
        products={products} 
        categories={categories} 
        menuName={menuName}
        slogan={slogan}
        whatsappNumber={whatsappNumber}
        restaurantAddress={restaurantAddress}
      />
    </div>
  );
};

export default Menu;
