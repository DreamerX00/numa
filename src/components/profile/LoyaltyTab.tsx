import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, 
  Gift, 
  TrendingUp, 
  Calendar,
  Loader2,
  Star,
  Trophy,
  Award,
  Gem
} from "lucide-react";

interface LoyaltyActivity {
  id: string;
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTMENT';
  points: number;
  reason: string;
  date: string;
  orderId?: string;
}

interface LoyaltyProgram {
  currentPoints: number;
  currentTier?: string;
  tier?: string; // Support both naming conventions
  nextTier?: string;
  pointsToNextTier: number;
  tierThresholds?: Record<string, number>;
  activities?: LoyaltyActivity[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface LoyaltyTabProps {
  loyaltyData?: LoyaltyProgram;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

const tierConfig = {
  BRONZE: {
    name: 'Bronze',
    color: 'bg-amber-600',
    icon: Award,
    benefits: [
      'Earn 1 point per ₹1 spent',
      'Birthday discount',
      'Early access to sales'
    ]
  },
  SILVER: {
    name: 'Silver',
    color: 'bg-gray-400',
    icon: Star,
    benefits: [
      'All Bronze benefits',
      'Earn 1.5 points per ₹1 spent',
      'Free shipping on orders above ₹999',
      'Priority customer support'
    ]
  },
  GOLD: {
    name: 'Gold',
    color: 'bg-yellow-500',
    icon: Trophy,
    benefits: [
      'All Silver benefits',
      'Earn 2 points per ₹1 spent',
      'Free shipping on all orders',
      'Exclusive member events',
      'Personalized styling sessions'
    ]
  },
  PLATINUM: {
    name: 'Platinum',
    color: 'bg-gray-300',
    icon: Crown,
    benefits: [
      'All Gold benefits',
      'Earn 2.5 points per ₹1 spent',
      'Complimentary gift wrapping',
      'Personal shopper service',
      'VIP access to new collections'
    ]
  },
  DIAMOND: {
    name: 'Diamond',
    color: 'bg-blue-500',
    icon: Gem,
    benefits: [
      'All Platinum benefits',
      'Earn 3 points per ₹1 spent',
      'Concierge service',
      'Exclusive limited edition pieces',
      'Annual appreciation gift'
    ]
  }
};

export function LoyaltyTab({ loyaltyData, isLoading = false, onLoadMore }: LoyaltyTabProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading loyalty program data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!loyaltyData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Gift className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">Loyalty Program</h3>
          <p className="text-muted-foreground">
            Start shopping to join our loyalty program and earn rewards!
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentTierConfig = tierConfig[(loyaltyData.currentTier || loyaltyData.tier)?.toUpperCase() as keyof typeof tierConfig] || tierConfig.BRONZE;
  const nextTierConfig = loyaltyData.nextTier ? tierConfig[loyaltyData.nextTier.toUpperCase() as keyof typeof tierConfig] : null;
  const progressPercentage = loyaltyData.nextTier && loyaltyData.tierThresholds
    ? (((loyaltyData.currentPoints || 0) - (loyaltyData.tierThresholds[loyaltyData.currentTier || loyaltyData.tier || 'BRONZE'] || 0)) / (loyaltyData.pointsToNextTier || 1)) * 100
    : (loyaltyData.pointsToNextTier || 0) > 0 
      ? ((loyaltyData.currentPoints || 0) / (loyaltyData.pointsToNextTier || 1)) * 100 
      : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Loyalty Program</h2>
        <p className="text-muted-foreground">
          Earn points with every purchase and unlock exclusive benefits
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Status */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Points & Tier Card */}
            <Card className="relative overflow-hidden">
              <div className={`absolute inset-x-0 top-0 h-1 ${currentTierConfig.color}`} />
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <currentTierConfig.icon className="h-6 w-6 text-brand" />
                  <Badge variant="secondary" className={`${currentTierConfig.color} text-white`}>
                    {currentTierConfig.name} Member
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold text-brand">
                  {(loyaltyData.currentPoints || 0).toLocaleString()}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </CardHeader>
              <CardContent className="text-center">
                {loyaltyData.nextTier ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {nextTierConfig?.name}</span>
                      <span>{loyaltyData.pointsToNextTier || 0} points to go</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Spend ₹{loyaltyData.pointsToNextTier || 0} more to reach {nextTierConfig?.name} tier
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-brand">Highest Tier Achieved!</p>
                    <p className="text-xs text-muted-foreground">
                      You&apos;re at the top of our loyalty program
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Benefits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-brand" />
                  Your Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentTierConfig.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand mt-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-brand" />
                <p className="text-2xl font-bold">{loyaltyData.currentPoints}</p>
                <p className="text-xs text-muted-foreground">Available Points</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-brand" />
                <p className="text-2xl font-bold">
                  {loyaltyData.activities?.filter(a => a.type === 'EARNED').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Earning Activities</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Gift className="h-6 w-6 mx-auto mb-2 text-brand" />
                <p className="text-2xl font-bold">
                  {loyaltyData.activities?.filter(a => a.type === 'REDEEMED').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Rewards Redeemed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-brand" />
                <p className="text-2xl font-bold">{currentTierConfig.name}</p>
                <p className="text-xs text-muted-foreground">Current Tier</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Tier Benefits</h3>
            <p className="text-muted-foreground">
              Discover the exclusive benefits available at each tier level
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(tierConfig).map(([tierKey, config]) => {
              const threshold = loyaltyData.tierThresholds?.[tierKey] || 0;
              const isCurrentTier = tierKey === (loyaltyData.currentTier || loyaltyData.tier)?.toUpperCase();
              const isAchieved = (loyaltyData.currentPoints || 0) >= threshold;
              
              return (
                <Card key={tierKey} className={`relative ${isCurrentTier ? 'ring-2 ring-brand' : ''}`}>
                  <div className={`absolute inset-x-0 top-0 h-1 ${config.color}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <config.icon className={`h-6 w-6 ${isAchieved ? 'text-brand' : 'text-muted-foreground'}`} />
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {config.name} Tier
                            {isCurrentTier && (
                              <Badge variant="secondary" className="text-xs">Current</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {threshold === 0 ? 'Starting tier' : `${(threshold || 0).toLocaleString()} points required`}
                          </p>
                        </div>
                      </div>
                      {isAchieved ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Achieved
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {((threshold || 0) - (loyaltyData.currentPoints || 0)).toLocaleString()} points to go
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {config.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className={`h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0 ${isAchieved ? 'bg-brand' : 'bg-muted-foreground'}`} />
                          <span className={isAchieved ? '' : 'text-muted-foreground'}>
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Points Activity</h3>
            <p className="text-muted-foreground">
              Track your points earning and redemption history
            </p>
          </div>

          {loyaltyData.activities?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                <p className="text-muted-foreground">
                  Start shopping to see your points activity here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {loyaltyData.activities?.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          activity.type === 'EARNED' 
                            ? 'bg-green-100 text-green-600' 
                            : activity.type === 'REDEEMED'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {activity.type === 'EARNED' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className={`text-right ${
                        activity.type === 'EARNED' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <p className="font-semibold">
                          {activity.type === 'EARNED' ? '+' : '-'}{activity.points}
                        </p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {loyaltyData.pagination?.hasNextPage && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={onLoadMore}>
                    Load More Activity
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}