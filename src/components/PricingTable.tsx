import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BENNE_PRICING, WASTE_PRICING, BIGBAG_PRICING } from "@/data/pricing";

interface PricingTableProps {
  type: "LOCATION_BENNE" | "BIGBAG";
}

export const PricingTable = ({ type }: PricingTableProps) => {
  if (type === "LOCATION_BENNE") {
    // Grouper les tarifs par taille de benne
    const bennesBySize = BENNE_PRICING.reduce((acc, item) => {
      if (!acc[item.size]) acc[item.size] = [];
      acc[item.size].push(item);
      return acc;
    }, {} as Record<string, typeof BENNE_PRICING>);

    return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {/* Tarifs par benne */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Tarifs estimatifs par benne</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(bennesBySize).map(([size, items]) => (
              <div key={size} className="space-y-2">
                <Badge variant="secondary" className="mb-2 text-xs">Benne {size}</Badge>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm p-1.5 sm:p-4">Type</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm p-1.5 sm:p-4">T</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm p-1.5 sm:p-4">€/T</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm p-1.5 sm:p-4">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-xs sm:text-sm p-1.5 sm:p-4">{item.wasteType}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm p-1.5 sm:p-4">{item.tonnage}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm p-1.5 sm:p-4">{item.pricePerTon}€</TableCell>
                        <TableCell className="text-right font-semibold text-xs sm:text-sm p-1.5 sm:p-4">{item.estimate}€</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tarifs à la tonne */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Tarifs à la tonne</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm p-1.5 sm:p-4">Type</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm p-1.5 sm:p-4">HT</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm p-1.5 sm:p-4">TTC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {WASTE_PRICING.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-xs sm:text-sm p-1.5 sm:p-4">{item.type}</TableCell>
                    <TableCell className="text-right text-xs sm:text-sm p-1.5 sm:p-4">{item.priceHT}€</TableCell>
                    <TableCell className="text-right text-xs sm:text-sm p-1.5 sm:p-4">{item.priceTTC}€</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // BIGBAG pricing
  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      {/* Tarifs BigBag */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Tarifs enlèvement BigBag</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm p-1.5 sm:p-4">Pack</TableHead>
                <TableHead className="text-xs sm:text-sm p-1.5 sm:p-4">Secteur</TableHead>
                <TableHead className="text-right text-xs sm:text-sm p-1.5 sm:p-4">HT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BIGBAG_PRICING.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-xs sm:text-sm p-1.5 sm:p-4">{item.pack}</TableCell>
                  <TableCell className="text-xs sm:text-sm p-1.5 sm:p-4">{item.sector}</TableCell>
                  <TableCell className="text-right font-semibold text-xs sm:text-sm p-1.5 sm:p-4">{item.priceHT}€</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tarifs à la tonne */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Tarifs traitement à la tonne</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm p-1.5 sm:p-4">Type</TableHead>
                <TableHead className="text-right text-xs sm:text-sm p-1.5 sm:p-4">HT</TableHead>
                <TableHead className="text-right text-xs sm:text-sm p-1.5 sm:p-4">TTC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WASTE_PRICING.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-xs sm:text-sm p-1.5 sm:p-4">{item.type}</TableCell>
                  <TableCell className="text-right text-xs sm:text-sm p-1.5 sm:p-4">{item.priceHT}€</TableCell>
                  <TableCell className="text-right text-xs sm:text-sm p-1.5 sm:p-4">{item.priceTTC}€</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
