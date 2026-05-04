/**
 * Mock Organization Data Generator
 * Generates realistic sample data for the Admin Project Dashboard
 */

// Sample company names for realistic mock data
const companyNames = [
  'Acme Corporation', 'TechStart Inc', 'Global Solutions Ltd', 'Innovate Systems',
  'Digital Dynamics', 'CloudFirst Technologies', 'DataStream Analytics', 'NextGen Software',
  'Quantum Computing Co', 'Synergy Solutions', 'Apex Industries', 'Velocity Labs',
  'Horizon Enterprises', 'Pinnacle Group', 'Catalyst Ventures', 'Momentum Tech',
  'Fusion Innovations', 'Vertex Solutions', 'Nexus Corporation', 'Zenith Systems',
  'Stellar Technologies', 'Orbit Dynamics', 'Prism Analytics', 'Echo Networks',
  'Atlas Consulting', 'Beacon Software', 'Compass Digital', 'Delta Innovations',
  'Eclipse Technologies', 'Frontier Systems', 'Genesis Labs', 'Harbor Solutions',
  'Insight Analytics', 'Journey Tech', 'Keystone Group', 'Lighthouse Digital',
  'Matrix Corporation', 'Nova Enterprises', 'Omega Systems', 'Phoenix Solutions',
  'Quest Technologies', 'Radius Networks', 'Summit Innovations', 'Titan Industries',
  'Unity Software', 'Vanguard Tech', 'Wavelength Systems', 'Xcelerate Labs',
  'Yield Analytics', 'Zephyr Solutions', 'Alpine Technologies', 'Blaze Digital',
  'Cascade Systems', 'Drift Innovations', 'Ember Tech', 'Flow Dynamics',
  'Grove Solutions', 'Haven Networks', 'Iris Analytics', 'Jade Enterprises',
  'Kinetic Labs', 'Lunar Systems', 'Meridian Group', 'Nimbus Technologies',
  'Oasis Digital', 'Pulse Innovations', 'Quantum Leap Inc', 'Ripple Solutions',
  'Spark Technologies', 'Thrive Systems', 'Uplift Labs', 'Vista Enterprises',
  'Willow Networks', 'Xero Analytics', 'Yonder Tech', 'Zenith Innovations',
  'Anchor Solutions', 'Bridge Technologies', 'Crown Systems', 'Dawn Digital',
  'Edge Innovations', 'Forge Labs', 'Glacier Tech', 'Helix Solutions',
  'Impact Systems', 'Jolt Technologies', 'Kite Networks', 'Lumen Analytics',
  'Mosaic Group', 'Nucleus Enterprises', 'Origin Labs', 'Peak Systems',
  'Quantum Solutions', 'Realm Technologies', 'Sphere Innovations', 'Torch Digital',
  'Upstream Tech', 'Vertex Labs', 'Wave Systems', 'Xenon Solutions',
  'Yield Technologies', 'Zeal Innovations', 'Aether Networks', 'Bolt Analytics'
];

// Email domains for realistic email addresses
const emailDomains = [
  'company.com', 'corp.com', 'tech.io', 'solutions.net', 'group.com',
  'systems.com', 'digital.io', 'labs.com', 'ventures.com', 'enterprises.com'
];

// Phone number area codes
const areaCodes = ['415', '650', '408', '510', '925', '707', '831', '209', '559', '530'];

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random date between start and end dates
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generates a realistic email address from company name
 */
function generateEmail(companyName) {
  const domain = emailDomains[randomInt(0, emailDomains.length - 1)];
  const prefix = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);
  return `contact@${prefix}.${domain}`;
}

/**
 * Generates a realistic US phone number
 */
function generatePhone() {
  const areaCode = areaCodes[randomInt(0, areaCodes.length - 1)];
  const exchange = randomInt(200, 999);
  const number = randomInt(1000, 9999);
  return `+1 (${areaCode}) ${exchange}-${number}`;
}

/**
 * Generates a unique organization ID
 */
function generateId(index) {
  return `org-${String(index).padStart(4, '0')}-${randomInt(1000, 9999)}`;
}

/**
 * Determines subscription plan based on distribution
 * Targets: Starter (25%), Professional (30%), Business (25%), Enterprise (20%)
 */
function determineSubscriptionPlan() {
  const rand = Math.random();
  if (rand < 0.25) return 'Starter';
  if (rand < 0.55) return 'Professional';
  if (rand < 0.80) return 'Business';
  return 'Enterprise';
}

/**
 * Determines subscription status based on distribution
 * 80% active, 10% trial, 5% inactive, 5% suspended
 */
function determineSubscriptionStatus() {
  const rand = Math.random();
  if (rand < 0.8) return 'active';
  if (rand < 0.9) return 'trial';
  if (rand < 0.95) return 'inactive';
  return 'suspended';
}

/**
 * Generates optional usage statistics for an organization
 * Only included for some organizations (60% chance)
 */
function generateUsageStats() {
  if (Math.random() < 0.4) return undefined; // 40% don't have usage stats
  
  return {
    activeUsers: randomInt(5, 150),
    tasksCreated: randomInt(50, 5000),
    storageUsed: randomInt(100, 10000) // in MB
  };
}

/**
 * Generates mock organizations with realistic data
 * @param {number} count - Number of organizations to generate (default: random between 120-180)
 * @returns {Array} Array of organization objects
 */
export function generateMockOrganizations(count = 241) {
  const organizations = [];
  const now = new Date();
  const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
  
  // Shuffle company names to ensure variety
  const shuffledNames = [...companyNames].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < count; i++) {
    const companyName = shuffledNames[i % shuffledNames.length];
    const subscriptionPlan = determineSubscriptionPlan();
    const subscriptionStatus = determineSubscriptionStatus();
    
    // Generate join date within past 3 years
    const joinDate = randomDate(threeYearsAgo, now);
    
    // Generate renewal date (1 year from join date, or in the past if old enough)
    const renewalDate = new Date(joinDate);
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    
    // If renewal date is in the past, add years until it's in the future
    while (renewalDate < now && subscriptionStatus === 'active') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }
    
    const organization = {
      id: generateId(i + 1),
      name: companyName + (i >= shuffledNames.length ? ` ${Math.floor(i / shuffledNames.length) + 1}` : ''),
      contactEmail: generateEmail(companyName),
      contactPhone: generatePhone(),
      subscriptionPlan,
      subscriptionStatus,
      joinDate: joinDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      usageStats: generateUsageStats()
    };
    
    organizations.push(organization);
  }
  
  // Sort by join date (newest first)
  return organizations.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
}

/**
 * Generates monthly growth data for the past 12 months
 * @returns {Array} Array of monthly growth data objects
 */
export function generateMonthlyGrowthData() {
  const monthlyData = [];
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let cumulativeTotal = randomInt(120, 160); // Starting base (higher)
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    const newOrganizations = randomInt(12, 30);
    const churnedOrganizations = randomInt(2, 8);
    cumulativeTotal += (newOrganizations - churnedOrganizations);
    
    monthlyData.push({
      month: monthLabel,
      totalOrganizations: cumulativeTotal,
      newOrganizations,
      churnedOrganizations
    });
  }
  
  return monthlyData;
}

/**
 * Generates yearly growth data for the past 3-5 years
 * @returns {Array} Array of yearly growth data objects
 */
export function generateYearlyGrowthData() {
  const yearlyData = [];
  const currentYear = new Date().getFullYear();
  const yearsToGenerate = randomInt(3, 5);
  
  let previousTotal = randomInt(40, 70);
  
  for (let i = yearsToGenerate - 1; i >= 0; i--) {
    const year = currentYear - i;
    const growthRate = randomInt(25, 50); // 25-50% growth
    const totalOrganizations = Math.round(previousTotal * (1 + growthRate / 100));
    
    yearlyData.push({
      year: year.toString(),
      totalOrganizations,
      growthRate: i === yearsToGenerate - 1 ? 0 : growthRate // First year has no growth rate
    });
    
    previousTotal = totalOrganizations;
  }
  
  return yearlyData;
}

/**
 * Generates plan distribution data from organizations array
 * @param {Array} organizations - Array of organization objects
 * @returns {Array} Array of plan distribution objects with counts and percentages
 */
export function generatePlanDistribution(organizations) {
  const planCounts = {
    Starter: 0,
    Professional: 0,
    Business: 0,
    Enterprise: 0
  };
  
  // Count organizations by plan
  organizations.forEach(org => {
    if (planCounts.hasOwnProperty(org.subscriptionPlan)) {
      planCounts[org.subscriptionPlan]++;
    }
  });
  
  const total = organizations.length;
  
  // Generate distribution array with percentages
  return [
    {
      plan: 'Starter',
      count: planCounts.Starter,
      percentage: total > 0 ? Math.round((planCounts.Starter / total) * 100) : 0,
      color: '#9CA3AF'
    },
    {
      plan: 'Professional',
      count: planCounts.Professional,
      percentage: total > 0 ? Math.round((planCounts.Professional / total) * 100) : 0,
      color: '#3B5BFC'
    },
    {
      plan: 'Business',
      count: planCounts.Business,
      percentage: total > 0 ? Math.round((planCounts.Business / total) * 100) : 0,
      color: '#7C3AED'
    },
    {
      plan: 'Enterprise',
      count: planCounts.Enterprise,
      percentage: total > 0 ? Math.round((planCounts.Enterprise / total) * 100) : 0,
      color: '#F97316'
    }
  ];
}
