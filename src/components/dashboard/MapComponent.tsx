
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const MapComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="grid gap-4 h-[calc(100vh-120px)]">
      <Card className="col-span-12">
        <CardContent className="p-4 flex gap-2">
          <Input
            className="flex-1"
            placeholder="Search routes, buses, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </CardContent>
      </Card>
      <Card className="col-span-12 flex-1">
        <CardContent className="p-0 h-full">
          <div className="h-full w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Interactive Map</h2>
              <p className="text-muted-foreground">
                Here you'll see bus routes, stops, and real-time tracking.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                (In a real implementation, this would be a map integration)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapComponent;
