export const overviewMetrics = [
  {
    id: 'active-automations',
    label: 'Active automations',
    value: '48',
    change: '+6 this month',
    trend: 'up',
    tone: 'indigo',
  },
  {
    id: 'executions',
    label: 'Executions this month',
    value: '128,420',
    change: '+14.8%',
    trend: 'up',
    tone: 'blue',
  },
  {
    id: 'success-rate',
    label: 'Success rate',
    value: '97.6%',
    change: '+1.2%',
    trend: 'up',
    tone: 'emerald',
  },
  {
    id: 'failed-runs',
    label: 'Failed runs',
    value: '214',
    change: '-18.4%',
    trend: 'down',
    tone: 'rose',
  },
]

export const executionVolume = [
  {
    date: 'Jul 31',
    successful: 14800,
    failed: 420,
  },
  {
    date: 'Aug 01',
    successful: 16200,
    failed: 310,
  },
  {
    date: 'Aug 02',
    successful: 17400,
    failed: 265,
  },
  {
    date: 'Aug 03',
    successful: 16950,
    failed: 290,
  },
  {
    date: 'Aug 04',
    successful: 18600,
    failed: 235,
  },
  {
    date: 'Aug 05',
    successful: 19400,
    failed: 180,
  },
  {
    date: 'Aug 06',
    successful: 20120,
    failed: 145,
  },
]

export const automationHealth = [
  {
    name: 'Healthy',
    value: 38,
  },
  {
    name: 'Warning',
    value: 7,
  },
  {
    name: 'Critical',
    value: 3,
  },
]

export const recentRuns = [
  {
    id: 'RUN-84291',
    automation:
      'Lead qualification and routing',
    platform: 'GoHighLevel',
    status: 'Successful',
    duration: '2.8s',
    startedAt: '2 minutes ago',
    owner: 'J Patrick',
  },
  {
    id: 'RUN-84290',
    automation:
      'New booking confirmation',
    platform: 'Calendly',
    status: 'Successful',
    duration: '1.9s',
    startedAt: '5 minutes ago',
    owner: 'Ana Reyes',
  },
  {
    id: 'RUN-84289',
    automation:
      'Failed payment follow-up',
    platform: 'Stripe',
    status: 'Failed',
    duration: '4.2s',
    startedAt: '9 minutes ago',
    owner: 'Marco Lim',
  },
  {
    id: 'RUN-84288',
    automation:
      'Client onboarding sequence',
    platform: 'HubSpot',
    status: 'Successful',
    duration: '3.1s',
    startedAt: '14 minutes ago',
    owner: 'J Patrick',
  },
  {
    id: 'RUN-84287',
    automation:
      'Weekly campaign report',
    platform: 'Google Sheets',
    status: 'Retrying',
    duration: '8.4s',
    startedAt: '21 minutes ago',
    owner: 'Ana Reyes',
  },
]

export const failingAutomations = [
  {
    id: 'AUTO-014',
    name:
      'Stripe failed payment follow-up',
    platform: 'Stripe',
    failures: 28,
    lastFailure: '9 minutes ago',
    severity: 'Critical',
  },
  {
    id: 'AUTO-031',
    name: 'Weekly campaign report',
    platform: 'Google Sheets',
    failures: 12,
    lastFailure: '21 minutes ago',
    severity: 'Warning',
  },
  {
    id: 'AUTO-008',
    name: 'Facebook lead enrichment',
    platform: 'Meta',
    failures: 7,
    lastFailure: '43 minutes ago',
    severity: 'Warning',
  },
]

export const platformActivity = [
  {
    name: 'GoHighLevel',
    runs: 34820,
    percentage: 27,
  },
  {
    name: 'Zapier',
    runs: 28640,
    percentage: 22,
  },
  {
    name: 'HubSpot',
    runs: 23910,
    percentage: 19,
  },
  {
    name: 'Stripe',
    runs: 19860,
    percentage: 15,
  },
  {
    name: 'Google Sheets',
    runs: 12840,
    percentage: 10,
  },
  {
    name: 'Other',
    runs: 8350,
    percentage: 7,
  },
]

export const automations = [
  {
    id: 'AUTO-001',
    name:
      'Lead qualification and routing',
    description:
      'Qualifies inbound leads and routes them to the correct GoHighLevel pipeline and owner.',
    platform: 'GoHighLevel',
    trigger: 'New form submission',
    owner: 'J Patrick',
    status: 'Active',
    health: 'Healthy',
    executions: 18420,
    successRate: 99.2,
    lastRun: '2 minutes ago',
    updatedAt: 'Aug 6, 2026',
  },
  {
    id: 'AUTO-002',
    name:
      'New booking confirmation',
    description:
      'Sends booking confirmations, creates CRM activities and notifies the assigned team member.',
    platform: 'Calendly',
    trigger: 'Booking created',
    owner: 'Ana Reyes',
    status: 'Active',
    health: 'Healthy',
    executions: 9430,
    successRate: 98.7,
    lastRun: '5 minutes ago',
    updatedAt: 'Aug 6, 2026',
  },
  {
    id: 'AUTO-003',
    name:
      'Client onboarding sequence',
    description:
      'Creates onboarding records, sends welcome messages and schedules internal follow-up tasks.',
    platform: 'HubSpot',
    trigger: 'Deal marked won',
    owner: 'J Patrick',
    status: 'Active',
    health: 'Healthy',
    executions: 6780,
    successRate: 97.9,
    lastRun: '14 minutes ago',
    updatedAt: 'Aug 5, 2026',
  },
  {
    id: 'AUTO-008',
    name:
      'Facebook lead enrichment',
    description:
      'Enriches new advertising leads before assigning qualification tags and sales ownership.',
    platform: 'Meta',
    trigger: 'New lead ad response',
    owner: 'Marco Lim',
    status: 'Active',
    health: 'Warning',
    executions: 12560,
    successRate: 93.4,
    lastRun: '43 minutes ago',
    updatedAt: 'Aug 5, 2026',
  },
  {
    id: 'AUTO-014',
    name:
      'Stripe failed payment follow-up',
    description:
      'Creates recovery tasks and sends customer follow-up messages after failed subscription payments.',
    platform: 'Stripe',
    trigger: 'Payment failed',
    owner: 'Marco Lim',
    status: 'Active',
    health: 'Critical',
    executions: 8240,
    successRate: 88.6,
    lastRun: '9 minutes ago',
    updatedAt: 'Aug 6, 2026',
  },
  {
    id: 'AUTO-019',
    name:
      'Support escalation notification',
    description:
      'Escalates urgent support conversations and alerts the assigned customer-success lead.',
    platform: 'Slack',
    trigger: 'Urgent ticket created',
    owner: 'Ana Reyes',
    status: 'Paused',
    health: 'Paused',
    executions: 4920,
    successRate: 96.1,
    lastRun: '2 days ago',
    updatedAt: 'Aug 4, 2026',
  },
  {
    id: 'AUTO-025',
    name:
      'Weekly client performance digest',
    description:
      'Compiles campaign data and emails a weekly performance summary to active clients.',
    platform: 'Gmail',
    trigger:
      'Every Monday at 8:00 AM',
    owner: 'J Patrick',
    status: 'Active',
    health: 'Healthy',
    executions: 1180,
    successRate: 99.8,
    lastRun: '3 days ago',
    updatedAt: 'Aug 3, 2026',
  },
  {
    id: 'AUTO-031',
    name:
      'Weekly campaign report',
    description:
      'Collects advertising metrics and writes campaign summaries into a shared reporting workbook.',
    platform: 'Google Sheets',
    trigger:
      'Every Friday at 5:00 PM',
    owner: 'Ana Reyes',
    status: 'Active',
    health: 'Warning',
    executions: 2360,
    successRate: 91.7,
    lastRun: '21 minutes ago',
    updatedAt: 'Aug 6, 2026',
  },
]

export const executionLogs = [
  {
    id: 'RUN-84291',
    automationId: 'AUTO-001',
    automation:
      'Lead qualification and routing',
    platform: 'GoHighLevel',
    status: 'Successful',
    owner: 'J Patrick',
    trigger: 'New form submission',
    startedAt: 'Aug 6, 2026 · 11:58 PM',
    relativeTime: '2 minutes ago',
    duration: '2.8s',
    recordsProcessed: 1,
    retryCount: 0,
    input: {
      leadId: 'LEAD-48192',
      source: 'Website form',
      email: 'alex@example.com',
      score: 87,
    },
    steps: [
      {
        name: 'Receive form payload',
        status: 'Successful',
        duration: '0.3s',
      },
      {
        name: 'Calculate qualification score',
        status: 'Successful',
        duration: '0.8s',
      },
      {
        name: 'Create CRM contact',
        status: 'Successful',
        duration: '1.1s',
      },
      {
        name: 'Assign pipeline and owner',
        status: 'Successful',
        duration: '0.6s',
      },
    ],
    errorMessage: null,
  },
  {
    id: 'RUN-84290',
    automationId: 'AUTO-002',
    automation:
      'New booking confirmation',
    platform: 'Calendly',
    status: 'Successful',
    owner: 'Ana Reyes',
    trigger: 'Booking created',
    startedAt: 'Aug 6, 2026 · 11:55 PM',
    relativeTime: '5 minutes ago',
    duration: '1.9s',
    recordsProcessed: 1,
    retryCount: 0,
    input: {
      bookingId: 'BK-29018',
      guest: 'Jamie Cruz',
      service: 'Discovery call',
      timezone: 'Asia/Manila',
    },
    steps: [
      {
        name: 'Receive booking event',
        status: 'Successful',
        duration: '0.2s',
      },
      {
        name: 'Create CRM activity',
        status: 'Successful',
        duration: '0.7s',
      },
      {
        name: 'Send confirmation email',
        status: 'Successful',
        duration: '0.6s',
      },
      {
        name: 'Notify assigned owner',
        status: 'Successful',
        duration: '0.4s',
      },
    ],
    errorMessage: null,
  },
  {
    id: 'RUN-84289',
    automationId: 'AUTO-014',
    automation:
      'Stripe failed payment follow-up',
    platform: 'Stripe',
    status: 'Failed',
    owner: 'Marco Lim',
    trigger: 'Payment failed',
    startedAt: 'Aug 6, 2026 · 11:51 PM',
    relativeTime: '9 minutes ago',
    duration: '4.2s',
    recordsProcessed: 1,
    retryCount: 2,
    input: {
      paymentId: 'PI-90421',
      customerId: 'CUS-18240',
      amount: 149,
      currency: 'USD',
    },
    steps: [
      {
        name: 'Receive payment failure',
        status: 'Successful',
        duration: '0.3s',
      },
      {
        name: 'Fetch customer record',
        status: 'Successful',
        duration: '0.9s',
      },
      {
        name: 'Create recovery task',
        status: 'Successful',
        duration: '1.2s',
      },
      {
        name: 'Send customer follow-up',
        status: 'Failed',
        duration: '1.8s',
      },
    ],
    errorMessage:
      'Email provider returned HTTP 429: rate limit exceeded.',
  },
  {
    id: 'RUN-84288',
    automationId: 'AUTO-003',
    automation:
      'Client onboarding sequence',
    platform: 'HubSpot',
    status: 'Successful',
    owner: 'J Patrick',
    trigger: 'Deal marked won',
    startedAt: 'Aug 6, 2026 · 11:46 PM',
    relativeTime: '14 minutes ago',
    duration: '3.1s',
    recordsProcessed: 1,
    retryCount: 0,
    input: {
      dealId: 'DEAL-29012',
      company: 'Northstar Labs',
      owner: 'J Patrick',
      plan: 'Growth',
    },
    steps: [
      {
        name: 'Receive closed deal event',
        status: 'Successful',
        duration: '0.4s',
      },
      {
        name: 'Create onboarding record',
        status: 'Successful',
        duration: '0.9s',
      },
      {
        name: 'Send welcome message',
        status: 'Successful',
        duration: '1.0s',
      },
      {
        name: 'Schedule internal tasks',
        status: 'Successful',
        duration: '0.8s',
      },
    ],
    errorMessage: null,
  },
  {
    id: 'RUN-84287',
    automationId: 'AUTO-031',
    automation:
      'Weekly campaign report',
    platform: 'Google Sheets',
    status: 'Retrying',
    owner: 'Ana Reyes',
    trigger:
      'Every Friday at 5:00 PM',
    startedAt: 'Aug 6, 2026 · 11:39 PM',
    relativeTime: '21 minutes ago',
    duration: '8.4s',
    recordsProcessed: 12,
    retryCount: 1,
    input: {
      reportWeek: '2026-W32',
      campaigns: 12,
      destination:
        'Client Performance Workbook',
    },
    steps: [
      {
        name: 'Load campaign metrics',
        status: 'Successful',
        duration: '2.1s',
      },
      {
        name: 'Calculate weekly summaries',
        status: 'Successful',
        duration: '2.4s',
      },
      {
        name: 'Write reporting rows',
        status: 'Retrying',
        duration: '3.9s',
      },
    ],
    errorMessage:
      'Google Sheets API temporarily unavailable. Retry scheduled.',
  },
  {
    id: 'RUN-84286',
    automationId: 'AUTO-008',
    automation:
      'Facebook lead enrichment',
    platform: 'Meta',
    status: 'Failed',
    owner: 'Marco Lim',
    trigger: 'New lead ad response',
    startedAt: 'Aug 6, 2026 · 11:17 PM',
    relativeTime: '43 minutes ago',
    duration: '3.6s',
    recordsProcessed: 1,
    retryCount: 3,
    input: {
      leadId: 'META-51082',
      campaign: 'Operations Audit',
      adSet: 'Agency Owners',
    },
    steps: [
      {
        name: 'Receive lead event',
        status: 'Successful',
        duration: '0.2s',
      },
      {
        name: 'Fetch enrichment data',
        status: 'Failed',
        duration: '3.4s',
      },
    ],
    errorMessage:
      'Enrichment service did not return a valid company domain.',
  },
  {
    id: 'RUN-84285',
    automationId: 'AUTO-025',
    automation:
      'Weekly client performance digest',
    platform: 'Gmail',
    status: 'Successful',
    owner: 'J Patrick',
    trigger:
      'Every Monday at 8:00 AM',
    startedAt: 'Aug 6, 2026 · 10:48 PM',
    relativeTime: '1 hour ago',
    duration: '6.7s',
    recordsProcessed: 14,
    retryCount: 0,
    input: {
      activeClients: 14,
      reportingPeriod:
        'Jul 29 – Aug 5, 2026',
    },
    steps: [
      {
        name: 'Load client metrics',
        status: 'Successful',
        duration: '2.3s',
      },
      {
        name: 'Generate summaries',
        status: 'Successful',
        duration: '2.1s',
      },
      {
        name: 'Send client emails',
        status: 'Successful',
        duration: '2.3s',
      },
    ],
    errorMessage: null,
  },
]

export const connections = [
  {
    id: 'CONN-001',
    name: 'GoHighLevel Production',
    platform: 'GoHighLevel',
    category: 'CRM',
    status: 'Connected',
    health: 'Healthy',
    account: 'Synervant Operations',
    owner: 'J Patrick',
    authType: 'API key',
    lastChecked: '2 minutes ago',
    lastConnected: 'Aug 6, 2026',
    automations: 14,
    description:
      'Primary CRM connection for lead routing, pipeline updates, contact management and follow-up workflows.',
  },
  {
    id: 'CONN-002',
    name: 'Zapier Workspace',
    platform: 'Zapier',
    category: 'Automation',
    status: 'Connected',
    health: 'Healthy',
    account: 'J Patrick Workspace',
    owner: 'J Patrick',
    authType: 'OAuth 2.0',
    lastChecked: '4 minutes ago',
    lastConnected: 'Aug 6, 2026',
    automations: 11,
    description:
      'Shared automation workspace used for cross-platform workflow execution and operational notifications.',
  },
  {
    id: 'CONN-003',
    name: 'HubSpot Client Portal',
    platform: 'HubSpot',
    category: 'CRM',
    status: 'Connected',
    health: 'Healthy',
    account: 'Northstar Growth',
    owner: 'Ana Reyes',
    authType: 'OAuth 2.0',
    lastChecked: '7 minutes ago',
    lastConnected: 'Aug 5, 2026',
    automations: 8,
    description:
      'Client CRM connection supporting deal-stage triggers, onboarding records and customer lifecycle workflows.',
  },
  {
    id: 'CONN-004',
    name: 'Stripe Billing',
    platform: 'Stripe',
    category: 'Payments',
    status: 'Connected',
    health: 'Warning',
    account: 'Synervant Billing',
    owner: 'Marco Lim',
    authType: 'Restricted API key',
    lastChecked: '9 minutes ago',
    lastConnected: 'Aug 4, 2026',
    automations: 5,
    description:
      'Payment connection used for failed-payment recovery, subscription events and billing notifications.',
  },
  {
    id: 'CONN-005',
    name: 'Google Sheets Reporting',
    platform: 'Google Sheets',
    category: 'Data',
    status: 'Connected',
    health: 'Warning',
    account: 'ops@synervant.example',
    owner: 'Ana Reyes',
    authType: 'OAuth 2.0',
    lastChecked: '21 minutes ago',
    lastConnected: 'Aug 3, 2026',
    automations: 7,
    description:
      'Reporting connection for campaign summaries, operational dashboards and scheduled data exports.',
  },
  {
    id: 'CONN-006',
    name: 'Slack Operations',
    platform: 'Slack',
    category: 'Communication',
    status: 'Disconnected',
    health: 'Critical',
    account: 'Synervant Operations',
    owner: 'J Patrick',
    authType: 'OAuth 2.0',
    lastChecked: '1 hour ago',
    lastConnected: 'Jul 31, 2026',
    automations: 4,
    description:
      'Team-notification connection used for escalations, workflow failures and operational status alerts.',
  },
]

export const alertRules = [
  {
    id: 'RULE-001',
    name: 'Critical automation failure',
    description:
      'Notify the operations team immediately when an automation enters a critical state.',
    trigger: 'Automation health becomes critical',
    severity: 'Critical',
    channel: 'Slack',
    recipient: '#ops-alerts',
    status: 'Enabled',
    createdBy: 'J Patrick',
    lastTriggered: '9 minutes ago',
    triggerCount: 28,
  },
  {
    id: 'RULE-002',
    name: 'Repeated execution failures',
    description:
      'Send an email when the same automation fails three or more times within thirty minutes.',
    trigger: '3 failures within 30 minutes',
    severity: 'High',
    channel: 'Email',
    recipient: 'ops@synervant.example',
    status: 'Enabled',
    createdBy: 'Marco Lim',
    lastTriggered: '21 minutes ago',
    triggerCount: 16,
  },
  {
    id: 'RULE-003',
    name: 'Disconnected platform',
    description:
      'Notify the workspace owner when a connected platform becomes unavailable.',
    trigger: 'Connection status becomes disconnected',
    severity: 'Critical',
    channel: 'Slack',
    recipient: '#platform-health',
    status: 'Enabled',
    createdBy: 'J Patrick',
    lastTriggered: '1 hour ago',
    triggerCount: 7,
  },
  {
    id: 'RULE-004',
    name: 'Low workflow success rate',
    description:
      'Create an operational warning when an automation drops below the required success rate.',
    trigger: 'Success rate falls below 95%',
    severity: 'Medium',
    channel: 'In-app',
    recipient: 'Workspace administrators',
    status: 'Enabled',
    createdBy: 'Ana Reyes',
    lastTriggered: '3 hours ago',
    triggerCount: 12,
  },
  {
    id: 'RULE-005',
    name: 'Weekly automation summary',
    description:
      'Send a weekly performance summary containing execution volume, failures and success rate.',
    trigger: 'Every Monday at 8:00 AM',
    severity: 'Low',
    channel: 'Email',
    recipient: 'team@synervant.example',
    status: 'Disabled',
    createdBy: 'Ana Reyes',
    lastTriggered: '6 days ago',
    triggerCount: 4,
  },
]

export const alertHistory = [
  {
    id: 'ALERT-9021',
    ruleId: 'RULE-001',
    title: 'Stripe failed payment follow-up is critical',
    message:
      'The automation recorded 28 failed runs and an 88.6% success rate.',
    severity: 'Critical',
    channel: 'Slack',
    source: 'AUTO-014',
    createdAt: 'Aug 6, 2026 · 11:51 PM',
    relativeTime: '9 minutes ago',
    status: 'Open',
    acknowledgedBy: null,
  },
  {
    id: 'ALERT-9020',
    ruleId: 'RULE-002',
    title: 'Weekly campaign report failed repeatedly',
    message:
      'The workflow failed three times while writing data to Google Sheets.',
    severity: 'High',
    channel: 'Email',
    source: 'AUTO-031',
    createdAt: 'Aug 6, 2026 · 11:39 PM',
    relativeTime: '21 minutes ago',
    status: 'Open',
    acknowledgedBy: null,
  },
  {
    id: 'ALERT-9019',
    ruleId: 'RULE-003',
    title: 'Slack Operations connection disconnected',
    message:
      'The Slack connection could not refresh its OAuth credentials.',
    severity: 'Critical',
    channel: 'Slack',
    source: 'CONN-006',
    createdAt: 'Aug 6, 2026 · 11:00 PM',
    relativeTime: '1 hour ago',
    status: 'Acknowledged',
    acknowledgedBy: 'J Patrick',
  },
  {
    id: 'ALERT-9018',
    ruleId: 'RULE-004',
    title: 'Facebook lead enrichment success rate is low',
    message:
      'The workflow success rate fell to 93.4% during the latest monitoring period.',
    severity: 'Medium',
    channel: 'In-app',
    source: 'AUTO-008',
    createdAt: 'Aug 6, 2026 · 9:00 PM',
    relativeTime: '3 hours ago',
    status: 'Acknowledged',
    acknowledgedBy: 'Marco Lim',
  },
  {
    id: 'ALERT-9017',
    ruleId: 'RULE-004',
    title: 'Google Sheets reporting performance warning',
    message:
      'Average execution duration increased above the expected threshold.',
    severity: 'Medium',
    channel: 'In-app',
    source: 'CONN-005',
    createdAt: 'Aug 6, 2026 · 5:12 PM',
    relativeTime: '7 hours ago',
    status: 'Resolved',
    acknowledgedBy: 'Ana Reyes',
  },
]

export const analyticsSummary = {
  '7-days': {
    executions: 128420,
    successRate: 97.6,
    failedRuns: 214,
    averageDuration: 3.8,
    executionChange: 14.8,
    successRateChange: 1.2,
    failureChange: -18.4,
    durationChange: -7.1,
  },
  '30-days': {
    executions: 486920,
    successRate: 96.9,
    failedRuns: 964,
    averageDuration: 4.1,
    executionChange: 22.6,
    successRateChange: 0.8,
    failureChange: -9.7,
    durationChange: -3.4,
  },
  '90-days': {
    executions: 1298540,
    successRate: 96.2,
    failedRuns: 3184,
    averageDuration: 4.5,
    executionChange: 31.2,
    successRateChange: 2.1,
    failureChange: -14.3,
    durationChange: -5.8,
  },
}

export const analyticsExecutionTrends = {
  '7-days': [
    {
      label: 'Jul 31',
      executions: 15220,
      successful: 14800,
      failed: 420,
      successRate: 97.2,
    },
    {
      label: 'Aug 01',
      executions: 16510,
      successful: 16200,
      failed: 310,
      successRate: 98.1,
    },
    {
      label: 'Aug 02',
      executions: 17665,
      successful: 17400,
      failed: 265,
      successRate: 98.5,
    },
    {
      label: 'Aug 03',
      executions: 17240,
      successful: 16950,
      failed: 290,
      successRate: 98.3,
    },
    {
      label: 'Aug 04',
      executions: 18835,
      successful: 18600,
      failed: 235,
      successRate: 98.8,
    },
    {
      label: 'Aug 05',
      executions: 19580,
      successful: 19400,
      failed: 180,
      successRate: 99.1,
    },
    {
      label: 'Aug 06',
      executions: 20265,
      successful: 20120,
      failed: 145,
      successRate: 99.3,
    },
  ],
  '30-days': [
    {
      label: 'Week 1',
      executions: 103240,
      successful: 99580,
      failed: 3660,
      successRate: 96.5,
    },
    {
      label: 'Week 2',
      executions: 116480,
      successful: 112920,
      failed: 3560,
      successRate: 96.9,
    },
    {
      label: 'Week 3',
      executions: 126740,
      successful: 123460,
      failed: 3280,
      successRate: 97.4,
    },
    {
      label: 'Week 4',
      executions: 140460,
      successful: 137190,
      failed: 3270,
      successRate: 97.7,
    },
  ],
  '90-days': [
    {
      label: 'May',
      executions: 372840,
      successful: 356610,
      failed: 16230,
      successRate: 95.6,
    },
    {
      label: 'June',
      executions: 424930,
      successful: 408620,
      failed: 16310,
      successRate: 96.2,
    },
    {
      label: 'July',
      executions: 500770,
      successful: 481430,
      failed: 19340,
      successRate: 96.1,
    },
  ],
}

export const analyticsPlatformPerformance = [
  {
    platform: 'GoHighLevel',
    executions: 34820,
    successRate: 99.1,
    failedRuns: 313,
    averageDuration: 2.6,
  },
  {
    platform: 'Zapier',
    executions: 28640,
    successRate: 98.2,
    failedRuns: 516,
    averageDuration: 3.1,
  },
  {
    platform: 'HubSpot',
    executions: 23910,
    successRate: 97.8,
    failedRuns: 526,
    averageDuration: 3.5,
  },
  {
    platform: 'Stripe',
    executions: 19860,
    successRate: 94.4,
    failedRuns: 1112,
    averageDuration: 4.2,
  },
  {
    platform: 'Google Sheets',
    executions: 12840,
    successRate: 92.7,
    failedRuns: 937,
    averageDuration: 7.8,
  },
  {
    platform: 'Slack',
    executions: 8350,
    successRate: 96.8,
    failedRuns: 267,
    averageDuration: 1.8,
  },
]

export const analyticsFailureCategories = [
  {
    name: 'Rate limit',
    value: 32,
    count: 68,
  },
  {
    name: 'Authentication',
    value: 24,
    count: 51,
  },
  {
    name: 'Invalid payload',
    value: 18,
    count: 39,
  },
  {
    name: 'Timeout',
    value: 15,
    count: 32,
  },
  {
    name: 'Platform outage',
    value: 11,
    count: 24,
  },
]

export const analyticsOwnerPerformance = [
  {
    owner: 'J Patrick',
    automations: 18,
    executions: 52460,
    successRate: 98.9,
    failedRuns: 577,
    averageDuration: 3.2,
  },
  {
    owner: 'Ana Reyes',
    automations: 16,
    executions: 43180,
    successRate: 97.2,
    failedRuns: 1209,
    averageDuration: 4.1,
  },
  {
    owner: 'Marco Lim',
    automations: 14,
    executions: 32780,
    successRate: 94.6,
    failedRuns: 1770,
    averageDuration: 4.8,
  },
]

export const analyticsAutomationRanking = [
  {
    id: 'AUTO-025',
    name: 'Weekly client performance digest',
    platform: 'Gmail',
    executions: 1180,
    successRate: 99.8,
    failedRuns: 2,
  },
  {
    id: 'AUTO-001',
    name: 'Lead qualification and routing',
    platform: 'GoHighLevel',
    executions: 18420,
    successRate: 99.2,
    failedRuns: 147,
  },
  {
    id: 'AUTO-002',
    name: 'New booking confirmation',
    platform: 'Calendly',
    executions: 9430,
    successRate: 98.7,
    failedRuns: 123,
  },
  {
    id: 'AUTO-003',
    name: 'Client onboarding sequence',
    platform: 'HubSpot',
    executions: 6780,
    successRate: 97.9,
    failedRuns: 142,
  },
  {
    id: 'AUTO-019',
    name: 'Support escalation notification',
    platform: 'Slack',
    executions: 4920,
    successRate: 96.1,
    failedRuns: 192,
  },
  {
    id: 'AUTO-008',
    name: 'Facebook lead enrichment',
    platform: 'Meta',
    executions: 12560,
    successRate: 93.4,
    failedRuns: 829,
  },
  {
    id: 'AUTO-031',
    name: 'Weekly campaign report',
    platform: 'Google Sheets',
    executions: 2360,
    successRate: 91.7,
    failedRuns: 196,
  },
  {
    id: 'AUTO-014',
    name: 'Stripe failed payment follow-up',
    platform: 'Stripe',
    executions: 8240,
    successRate: 88.6,
    failedRuns: 939,
  },
]

export const teamMembers = [
  {
    id: 'MEM-001',
    name: 'J Patrick Magadia',
    initials: 'JP',
    email: 'j.patrickmagadia28@gmail.com',
    role: 'Owner',
    status: 'Active',
    department: 'Automation Operations',
    automations: 18,
    executions: 52460,
    successRate: 98.9,
    lastActive: 'Just now',
    joinedAt: 'Jan 15, 2026',
  },
  {
    id: 'MEM-002',
    name: 'Ana Reyes',
    initials: 'AR',
    email: 'ana.reyes@synervant.example',
    role: 'Administrator',
    status: 'Active',
    department: 'Client Operations',
    automations: 16,
    executions: 43180,
    successRate: 97.2,
    lastActive: '8 minutes ago',
    joinedAt: 'Feb 2, 2026',
  },
  {
    id: 'MEM-003',
    name: 'Marco Lim',
    initials: 'ML',
    email: 'marco.lim@synervant.example',
    role: 'Developer',
    status: 'Active',
    department: 'Technical Operations',
    automations: 14,
    executions: 32780,
    successRate: 94.6,
    lastActive: '24 minutes ago',
    joinedAt: 'Mar 10, 2026',
  },
  {
    id: 'MEM-004',
    name: 'Sofia Navarro',
    initials: 'SN',
    email: 'sofia.navarro@synervant.example',
    role: 'Analyst',
    status: 'Active',
    department: 'Reporting',
    automations: 7,
    executions: 14820,
    successRate: 98.1,
    lastActive: '1 hour ago',
    joinedAt: 'Apr 18, 2026',
  },
  {
    id: 'MEM-005',
    name: 'Daniel Cruz',
    initials: 'DC',
    email: 'daniel.cruz@synervant.example',
    role: 'Viewer',
    status: 'Invited',
    department: 'Client Success',
    automations: 0,
    executions: 0,
    successRate: 0,
    lastActive: 'Invitation pending',
    joinedAt: 'Aug 6, 2026',
  },
]

export const teamActivity = [
  {
    id: 'ACT-001',
    member: 'J Patrick Magadia',
    action: 'updated',
    target: 'Lead qualification and routing',
    type: 'Automation',
    time: '6 minutes ago',
  },
  {
    id: 'ACT-002',
    member: 'Ana Reyes',
    action: 'acknowledged',
    target: 'Weekly campaign report alert',
    type: 'Alert',
    time: '21 minutes ago',
  },
  {
    id: 'ACT-003',
    member: 'Marco Lim',
    action: 'reconnected',
    target: 'Stripe Billing',
    type: 'Connection',
    time: '42 minutes ago',
  },
  {
    id: 'ACT-004',
    member: 'Sofia Navarro',
    action: 'exported',
    target: '30-day analytics report',
    type: 'Report',
    time: '1 hour ago',
  },
  {
    id: 'ACT-005',
    member: 'J Patrick Magadia',
    action: 'created',
    target: 'Critical automation failure rule',
    type: 'Alert Rule',
    time: '3 hours ago',
  },
]