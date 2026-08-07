import { supabase } from '../lib/supabase'

export async function getOverviewData(
  workspaceId,
) {
  if (!workspaceId) {
    return emptyOverview()
  }

  const [
    automationsResult,
    runsResult,
    activityResult,
  ] = await Promise.all([
    supabase
      .from('automations')
      .select(`
        id,
        name,
        platform,
        status,
        health,
        execution_count,
        success_rate,
        last_run_at,
        updated_at
      `)
      .eq('workspace_id', workspaceId)
      .order('updated_at', {
        ascending: false,
      }),

    supabase
      .from('automation_runs')
      .select(`
        id,
        status,
        duration_ms,
        records_processed,
        retry_count,
        error_message,
        started_at,
        completed_at,
        automation_id,
        automations (
          id,
          name,
          platform
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('started_at', {
        ascending: false,
      })
      .limit(100),

    supabase
      .from('activity_logs')
      .select(`
        id,
        action,
        target_type,
        target_id,
        target_name,
        created_at
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', {
        ascending: false,
      })
      .limit(8),
  ])

  if (automationsResult.error) {
    throw automationsResult.error
  }

  if (runsResult.error) {
    throw runsResult.error
  }

  if (activityResult.error) {
    throw activityResult.error
  }

  const automations =
    automationsResult.data || []

  const runs =
    runsResult.data || []

  const activity =
    activityResult.data || []

  return {
    metrics: buildMetrics(
      automations,
      runs,
    ),
    executionVolume:
      buildExecutionVolume(runs),
    automationHealth:
      buildAutomationHealth(
        automations,
      ),
    recentRuns: runs.slice(0, 6),
    failingAutomations:
      buildFailingAutomations(
        automations,
        runs,
      ),
    platformActivity:
      buildPlatformActivity(
        automations,
        runs,
      ),
    activity,
  }
}

function buildMetrics(
  automations,
  runs,
) {
  const activeAutomations =
    automations.filter(
      (automation) =>
        automation.status === 'active',
    ).length

  const successfulRuns =
    runs.filter(
      (run) =>
        run.status === 'successful',
    ).length

  const failedRuns =
    runs.filter(
      (run) => run.status === 'failed',
    ).length

  const finishedRuns =
    successfulRuns + failedRuns

  const successRate =
    finishedRuns > 0
      ? (
          (successfulRuns /
            finishedRuns) *
          100
        ).toFixed(1)
      : '100.0'

  const totalDuration =
    runs.reduce(
      (sum, run) =>
        sum +
        Number(run.duration_ms || 0),
      0,
    )

  const averageDuration =
    runs.length > 0
      ? Math.round(
          totalDuration /
            runs.length,
        )
      : 0

  return [
    {
      label: 'Active automations',
      value: activeAutomations,
      helper: `${automations.length} total`,
      trend: null,
    },
    {
      label: 'Executions',
      value: runs.length.toLocaleString(),
      helper: 'Recent runs',
      trend: null,
    },
    {
      label: 'Success rate',
      value: `${successRate}%`,
      helper:
        failedRuns > 0
          ? `${failedRuns} failed`
          : 'No failed runs',
      trend: null,
    },
    {
      label: 'Avg. duration',
      value:
        formatDuration(
          averageDuration,
        ),
      helper: 'Across recent runs',
      trend: null,
    },
  ]
}

function buildExecutionVolume(runs) {
  const days = []

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date()

    date.setHours(0, 0, 0, 0)
    date.setDate(
      date.getDate() - offset,
    )

    days.push({
      date,
      label:
        new Intl.DateTimeFormat(
          'en-US',
          {
            weekday: 'short',
          },
        ).format(date),
      executions: 0,
      successful: 0,
      failed: 0,
    })
  }

  runs.forEach((run) => {
    if (!run.started_at) {
      return
    }

    const runDate =
      new Date(run.started_at)

    runDate.setHours(0, 0, 0, 0)

    const day = days.find(
      (item) =>
        item.date.getTime() ===
        runDate.getTime(),
    )

    if (!day) {
      return
    }

    day.executions += 1

    if (
      run.status === 'successful'
    ) {
      day.successful += 1
    }

    if (run.status === 'failed') {
      day.failed += 1
    }
  })

  return days.map(
    ({
      date,
      ...item
    }) => item,
  )
}

function buildAutomationHealth(
  automations,
) {
  const counts = {
    healthy: 0,
    warning: 0,
    critical: 0,
    paused: 0,
    draft: 0,
  }

  automations.forEach(
    (automation) => {
      const health =
        automation.health || 'draft'

      if (
        counts[health] !== undefined
      ) {
        counts[health] += 1
      }
    },
  )

  return Object.entries(counts)
    .filter(
      ([, value]) => value > 0,
    )
    .map(([name, value]) => ({
      name: capitalize(name),
      value,
      key: name,
    }))
}

function buildFailingAutomations(
  automations,
  runs,
) {
  return automations
    .map((automation) => {
      const automationRuns =
        runs.filter(
          (run) =>
            run.automation_id ===
            automation.id,
        )

      const failures =
        automationRuns.filter(
          (run) =>
            run.status === 'failed',
        )

      return {
        id: automation.id,
        name: automation.name,
        platform:
          automation.platform,
        health: automation.health,
        failures: failures.length,
        lastFailure:
          failures[0]?.started_at ||
          null,
      }
    })
    .filter(
      (automation) =>
        automation.failures > 0 ||
        [
          'warning',
          'critical',
        ].includes(
          automation.health,
        ),
    )
    .sort(
      (a, b) =>
        b.failures - a.failures,
    )
    .slice(0, 5)
}

function buildPlatformActivity(
  automations,
  runs,
) {
  const platforms = new Map()

  automations.forEach(
    (automation) => {
      if (
        !platforms.has(
          automation.platform,
        )
      ) {
        platforms.set(
          automation.platform,
          {
            platform:
              automation.platform,
            automations: 0,
            executions: 0,
            failures: 0,
          },
        )
      }

      platforms.get(
        automation.platform,
      ).automations += 1
    },
  )

  runs.forEach((run) => {
    const platform =
      run.automations?.platform

    if (!platform) {
      return
    }

    if (!platforms.has(platform)) {
      platforms.set(platform, {
        platform,
        automations: 0,
        executions: 0,
        failures: 0,
      })
    }

    const record =
      platforms.get(platform)

    record.executions += 1

    if (run.status === 'failed') {
      record.failures += 1
    }
  })

  return [...platforms.values()]
    .sort(
      (a, b) =>
        b.executions -
        a.executions,
    )
    .slice(0, 6)
}

function formatDuration(milliseconds) {
  if (!milliseconds) {
    return '0ms'
  }

  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  }

  return `${(
    milliseconds / 1000
  ).toFixed(1)}s`
}

function capitalize(value) {
  return value
    ? value.charAt(0).toUpperCase() +
        value.slice(1)
    : ''
}

function emptyOverview() {
  return {
    metrics: [],
    executionVolume: [],
    automationHealth: [],
    recentRuns: [],
    failingAutomations: [],
    platformActivity: [],
    activity: [],
  }
}