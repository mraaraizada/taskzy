import { useState } from 'react';
import { useApp } from '../context/AppContext';
import OrganizationOverview from '../components/OrganizationOverview';
import GrowthAnalytics from '../components/GrowthAnalytics';
import SubscriptionDistribution from '../components/SubscriptionDistribution';
import RecentlyJoinedOrganizations from '../components/RecentlyJoinedOrganizations';

export default function AdminProjectDashboardPage() {
  const { organizations, monthlyGrowth, yearlyGrowth, planDistribution } = useApp();
  const [selectedTimeRange, setSelectedTimeRange] = useState('monthly');
  const [isLoading] = useState(false);

  const totalOrganizations = organizations.length;
  const starterCount = organizations.filter(org => org.subscriptionPlan === 'Starter').length;
  const professionalCount = organizations.filter(org => org.subscriptionPlan === 'Professional').length;
  const businessCount = organizations.filter(org => org.subscriptionPlan === 'Business').length;
  const enterpriseCount = organizations.filter(org => org.subscriptionPlan === 'Enterprise').length;
  
  // Main container with flex layout and padding - make it scrollable
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      gap: '24px',
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* Organization Overview Statistics Section */}
      <OrganizationOverview
        totalOrganizations={totalOrganizations}
        starterCount={starterCount}
        professionalCount={professionalCount}
        businessCount={businessCount}
        enterpriseCount={enterpriseCount}
        isLoading={isLoading}
      />

      {/* Growth Analytics and Revenue Graph Section - Side by Side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1fr',
        gap: '24px',
      }}>
        <GrowthAnalytics
          monthlyData={monthlyGrowth.map(m => ({ month: m.month, count: m.totalOrganizations }))}
          yearlyData={yearlyGrowth.map(y => ({ year: y.year, count: y.totalOrganizations }))}
          selectedView={selectedTimeRange}
          onViewChange={setSelectedTimeRange}
          isLoading={isLoading}
        />

        <SubscriptionDistribution
          data={planDistribution}
          isLoading={isLoading}
        />
      </div>

      {/* Recently Joined Organizations */}
      <RecentlyJoinedOrganizations
        organizations={organizations}
        isLoading={isLoading}
      />
    </div>
  );
}
