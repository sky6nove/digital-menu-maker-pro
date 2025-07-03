
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PizzaOptionsTabProps {
  allowHalfHalf: boolean;
  halfHalfPriceRule: string;
  onChange: (field: string, value: any) => void;
}

const PizzaOptionsTab = ({
  allowHalfHalf,
  halfHalfPriceRule,
  onChange
}: PizzaOptionsTabProps) => {
  const handleHalfHalfChange = (checked: boolean) => {
    onChange('allow_half_half', checked);
  };

  const handleHalfHalfPriceRuleChange = (value: string) => {
    onChange('half_half_price_rule', value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="allowHalfHalf"
          checked={allowHalfHalf}
          onCheckedChange={handleHalfHalfChange}
        />
        <Label htmlFor="allowHalfHalf">Permitir meia/meia</Label>
      </div>
      
      {allowHalfHalf && (
        <div className="space-y-2 pt-2">
          <Label>Regra de preço para meia/meia</Label>
          <RadioGroup 
            value={halfHalfPriceRule} 
            onValueChange={handleHalfHalfPriceRuleChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="highest" id="highest" />
              <Label htmlFor="highest">Maior preço</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lowest" id="lowest" />
              <Label htmlFor="lowest">Menor preço</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="average" id="average" />
              <Label htmlFor="average">Média dos preços</Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
};

export default PizzaOptionsTab;
