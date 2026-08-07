import { supabase } from '../lib/supabase'

export async function getAnalyticsData({
  workspaceId,
  days = 30,
}) {
  if (!workspaceId) {
    return emptyAnalytics()
  }

  const startDate = new Date()

  startDate.setHours(0, 0, 0, 0)
  startDate.setDate(
    startDate.getDate() - (days - 1),
  )

  const [
    runsResult,
    automationsResult,
  ] = await Promise.all([
    supabase
      .from('automation_runs')
      .select(`
        id,
        automation_id,
        status,
        duration_ms,
        records_processed,
        retry_count,
        error_message,
        started_at,
        completed_at,
        automations (
          id,
          name,
          platform,
          owner_id
        )
      `)
      .eq('workspace_id', workspaceId)
      .gte(
        'started_at',
        startDate.toISOString(),
      )
      .order('started_at', {
        ascending: true,
      }),

    supabase
      .from('automations')
      .select(`
        id,
        name,
        platform,
        owner_id,
        status,
        health,
        execution_count,
        success_rate,
        last_run_at
      `)
      .eq('workspace_id', workspaceId),
  ])

  if (runsResult.error) {
    throw runsResult.error
  }

  if (automationsResult.error) {
    throw automationsResult.error
  }

  const runs =
    runsResult.data || []

  const automations =
    automationsResult.data || []

  return {
    summary: buildSummary(runs),
    executionTrends:
      buildExecutionTrends(
        runs,
        days,
      ),
    platformPerformance:
      buildPlatformPerformance(runs),
    failureCategories:
      buildFailureCategories(runs),
    ownerPerformance:
      buildOwnerPerformance(
        runs,
        automations,
      ),
    automationRanking:
      buildAutomationRanking(
        runs,
        automations,
      ),
  }
}

function buildSummary(runs) {
  const totalRuns = runs.length

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

  const averageDuration =
    totalRuns > 0
      ? Math.round(
          runs.reduce(
            (sum, run) =>
              sum +
              Number(
                run.duration_ms || 0,
              ),
            0,
          ) / totalRuns,
        )
      : 0

  const recordsProcessed =
    runs.reduce(
      (sum, run) =>
        sum +
        Number(
          run.records_processed || 0,
        ),
      0,
    )

  return [
    {
      id: 'executions',
      label: 'Total executions',
      value:
        totalRuns.toLocaleString(),
      helper: `${successfulRuns} successful`,
      tone: 'indigo',
    },
    {
      id: 'success-rate',
      label: 'Success rate',
      value: `${successRate}%`,
      helper:
        failedRuns > 0
          ? `${failedRuns} failed`
          : 'No failed runs',
      tone: 'emerald',
    },
    {
      id: 'duration',
      label: 'Avg. duration',
      value:
        formatDuration(
          averageDuration,
        ),
      helper: 'Across all runs',
      tone: 'blue',
    },
    {
      id: 'records',
      label: 'Records processed',
      value:
        recordsProcessed.toLocaleString(),
      helper: 'Across all executions',
      tone: 'violet',
    },
  ]
}

function buildExecutionTrends(
  runs,
  days,
) {
  const buckets =
    days <= 7
      ? createDailyBuckets(days)
      : days <= 30
        ? createDailyBuckets(days)
        : createWeeklyBuckets(days)

  runs.forEach((run) => {
    if (!run.started_at) {
      return
    }

    const runDate =
      new Date(run.started_at)

    const bucket = buckets.find(
      (item) =>
        runDate >= item.start &&
        runDate <= item.end,
    )

    if (!bucket) {
      return
    }

    bucket.executions += 1

    if (
      run.status === 'successful'
    ) {
      bucket.successful += 1
    }

    if (run.status === 'failed') {
      bucket.failed += 1
    }
  })

  return buckets.map(
    ({
      start,
      end,
      ...bucket
    }) => bucket,
  )
}

function createDailyBuckets(days) {
  const buckets = []

  for (
    let offset = days - 1;
    offset >= 0;
    offset--
  ) {
    const date = new Date()

    date.setHours(0, 0, 0, 0)
    date.setDate(
      date.getDate() - offset,
    )

    const end = new Date(date)

    end.setHours(
      23,
      59,
      59,
      999,
    )

    buckets.push({
      start: date,
      end,
      label:
        new Intl.DateTimeFormat(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
          },
        ).format(date),
      executions: 0,
      successful: 0,
      failed: 0,
    })
  }

  return buckets
}

function createWeeklyBuckets(days) {
  const bucketCount =
    Math.ceil(days / 7)

  const buckets = []

  for (
    let offset =
      bucketCount - 1;
    offset >= 0;
    offset--
  ) {
    const start = new Date()

    start.setHours(0, 0, 0, 0)
    start.setDate(
      start.getDate() -
        offset * 7 -
        6,
    )

    const end = new Date(start)

    end.setDate(
      end.getDate() + 6,
    )

    end.setHours(
      23,
      59,
      59,
      999,
    )

    buckets.push({
      start,
      end,
      label:
        new Intl.DateTimeFormat(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
          },
        ).format(start),
      executions: 0,
      successful: 0,
      failed: 0,
    })
  }

  return buckets
}

function buildPlatformPerformance(
  runs,
) {
  const platformMap =
    new Map()

  runs.forEach((run) => {
    const platform =
      run.automations?.platform ||
      'Unknown'

    if (
      !platformMap.has(platform)
    ) {
      platformMap.set(platform, {
        platform,
        executions: 0,
        successful: 0,
        failed: 0,
        totalDuration: 0,
      })
    }

    const record =
      platformMap.get(platform)

    record.executions += 1

    record.totalDuration +=
      Number(
        run.duration_ms || 0,
      )

    if (
      run.status === 'successful'
    ) {
      record.successful += 1
    }

    if (run.status === 'failed') {
      record.failed += 1
    }
  })

  return [...platformMap.values()]
    .map((record) => ({
      platform: record.platform,
      executions:
        record.executions,
      successful:
        record.successful,
      failed: record.failed,

      successRate:
        record.executions > 0
          ? Number(
              (
                (record.successful /
                  record.executions) *
                100
              ).toFixed(1),
            )
          : 0,

      averageDuration:
        record.executions > 0
          ? Math.round(
              record.totalDuration /
                record.executions,
            )
          : 0,
    }))
    .sort(
      (a, b) =>
        b.executions -
        a.executions,
    )
}

function buildFailureCategories(
  runs,
) {
  const failures =
    runs.filter(
      (run) =>
        run.status === 'failed',
    )

  const categories = {
    'Processing failure': 0,
    'Connection failure': 0,
    Timeout: 0,
    Authentication: 0,
    'Unknown failure': 0,
  }

  failures.forEach((run) => {
    const message =
      String(
        run.error_message || '',
      ).toLowerCase()

    if (
      message.includes('timeout') ||
      message.includes('timed out')
    ) {
      categories.Timeout += 1
      return
    }

    if (
      message.includes('auth') ||
      message.includes(
        'unauthorized',
      ) ||
      message.includes(
        'credential',
      )
    ) {
      categories.Authentication += 1
      return
    }

    if (
      message.includes(
        'connection',
      ) ||
      message.includes('network')
    ) {
      categories[
        'Connection failure'
      ] += 1

      return
    }

    if (
      message.includes(
        'process',
      ) ||
      message.includes(
        'processing',
      )
    ) {
      categories[
        'Processing failure'
      ] += 1

      return
    }

    categories[
      'Unknown failure'
    ] += 1
  })

  return Object.entries(categories)
    .filter(
      ([, value]) => value > 0,
    )
    .map(([name, value]) => ({
      name,
      value,
      percentage:
        failures.length > 0
          ? Math.round(
              (value /
                failures.length) *
                100,
            )
          : 0,
    }))
    .sort(
      (a, b) =>
        b.value - a.value,
    )
}

function buildOwnerPerformance(
  runs,
  automations,
) {
  const ownerMap = new Map()

  automations.forEach(
    (automation) => {
      const ownerId =
        automation.owner_id ||
        'unassigned'

      if (!ownerMap.has(ownerId)) {
        ownerMap.set(ownerId, {
          ownerId,
          executions: 0,
          successful: 0,
          failed: 0,
          automationIds:
            new Set(),
        })
      }

      ownerMap
        .get(ownerId)
        .automationIds.add(
          automation.id,
        )
    },
  )

  runs.forEach((run) => {
    const ownerId =
      run.automations?.owner_id ||
      'unassigned'

    if (!ownerMap.has(ownerId)) {
      ownerMap.set(ownerId, {
        ownerId,
        executions: 0,
        successful: 0,
        failed: 0,
        automationIds:
          new Set(),
      })
    }

    const record =
      ownerMap.get(ownerId)

    record.executions += 1

    if (
      run.status === 'successful'
    ) {
      record.successful += 1
    }

    if (run.status === 'failed') {
      record.failed += 1
    }
  })

  return [...ownerMap.values()]
    .map((record) => ({
      ownerId: record.ownerId,

      owner:
        record.ownerId ===
        'unassigned'
          ? 'Unassigned'
          : 'Workspace member',

      automations:
        record.automationIds.size,

      executions:
        record.executions,

      successRate:
        record.executions > 0
          ? Number(
              (
                (record.successful /
                  record.executions) *
                100
              ).toFixed(1),
            )
          : 0,
    }))
    .sort(
      (a, b) =>
        b.executions -
        a.executions,
    )
}

function buildAutomationRanking(
  runs,
  automations,
) {
  return automations
    .map((automation) => {
      const automationRuns =
        runs.filter(
          (run) =>
            run.automation_id ===
            automation.id,
        )

      const successful =
        automationRuns.filter(
          (run) =>
            run.status ===
            'successful',
        ).length

      const failed =
        automationRuns.filter(
          (run) =>
            run.status === 'failed',
        ).length

      const averageDuration =
        automationRuns.length > 0
          ? Math.round(
              automationRuns.reduce(
                (sum, run) =>
                  sum +
                  Number(
                    run.duration_ms ||
                      0,
                  ),
                0,
              ) /
                automationRuns.length,
            )
          : 0

      return {
        id: automation.id,
        name: automation.name,
        platform:
          automation.platform,
        executions:
          automationRuns.length,
        successful,
        failed,

        successRate:
          automationRuns.length > 0
            ? Number(
                (
                  (successful /
                    automationRuns.length) *
                  100
                ).toFixed(1),
              )
            : 0,

        averageDuration,
      }
    })
    .sort(
      (a, b) =>
        b.executions -
        a.executions,
    )
}

function formatDuration(
  milliseconds,
) {
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

function emptyAnalytics() {
  return {
    summary: [],
    executionTrends: [],
    platformPerformance: [],
    failureCategories: [],
    ownerPerformance: [],
    automationRanking: [],
  }
}