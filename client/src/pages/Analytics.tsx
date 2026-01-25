import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Clock, Globe, ShoppingCart } from "lucide-react";

export default function Analytics() {
  const { data, isLoading, error } = trpc.analytics.getOverview.useQuery();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <p className="text-destructive">Failed to load analytics data</p>
          <p className="text-sm text-muted-foreground mt-2">{error?.message}</p>
        </div>
      </div>
    );
  }

  const { overview, trafficSources, popularIngredients, languages, dailyVisitors } = data;

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track user engagement and usage patterns</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.anonymousSessions} anonymous, {overview.authenticatedSessions} authenticated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Users who calculated costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(overview.avgSessionDuration / 60)}m {overview.avgSessionDuration % 60}s</div>
            <p className="text-xs text-muted-foreground mt-1">
              Time spent on site
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Visitors Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Visitors (Last 7 Days)</CardTitle>
            <CardDescription>Unique sessions per day</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyVisitors.length > 0 ? (
              <div className="space-y-2">
                {dailyVisitors.map((day) => (
                  <div key={day.date} className="flex items-center">
                    <div className="w-24 text-sm text-muted-foreground">{day.date}</div>
                    <div className="flex-1 ml-4">
                      <div className="h-8 bg-primary/20 rounded-md relative overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-md transition-all"
                          style={{
                            width: `${(day.count / Math.max(...dailyVisitors.map(d => d.count))) * 100}%`,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center px-3 text-sm font-medium">
                          {day.count}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            {trafficSources.length > 0 ? (
              <div className="space-y-2">
                {trafficSources.slice(0, 5).map((source) => (
                  <div key={source.source} className="flex items-center">
                    <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                    <div className="flex-1 text-sm">{source.source}</div>
                    <div className="text-sm font-medium">{source.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Ingredients</CardTitle>
            <CardDescription>Most frequently used ingredients</CardDescription>
          </CardHeader>
          <CardContent>
            {popularIngredients.length > 0 ? (
              <div className="space-y-2">
                {popularIngredients.map((ingredient, index) => (
                  <div key={ingredient.name} className="flex items-center">
                    <div className="w-6 text-sm text-muted-foreground">#{index + 1}</div>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground mr-2" />
                    <div className="flex-1 text-sm">{ingredient.name}</div>
                    <div className="text-sm font-medium">{ingredient.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No ingredients tracked yet</p>
            )}
          </CardContent>
        </Card>

        {/* Language Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>User language preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {languages.length > 0 ? (
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div key={lang.language} className="flex items-center">
                    <div className="w-16 text-sm text-muted-foreground">{lang.language}</div>
                    <div className="flex-1 ml-4">
                      <div className="h-8 bg-accent/20 rounded-md relative overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-md transition-all"
                          style={{
                            width: `${(lang.count / Math.max(...languages.map(l => l.count))) * 100}%`,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center px-3 text-sm font-medium">
                          {lang.count}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Total Events Counter */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Total Events Tracked</CardTitle>
          <CardDescription>All user interactions logged</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground mr-4" />
            <div className="text-3xl font-bold">{overview.totalEvents.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
