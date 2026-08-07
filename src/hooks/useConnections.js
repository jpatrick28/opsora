import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useAuth } from '../context/AuthContext'
import { useWorkspaceRealtime } from './useWorkspaceRealtime'

import {
  createConnection,
  deleteConnection,
  getConnections,
  setConnectionStatus,
  updateConnection,
} from '../services/connectionService'

export function useConnections() {
  const {
    user,
    workspaceRecord,
  } = useAuth()

  const workspaceId =
    workspaceRecord?.id || null

  const [connections, setConnections] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const loadConnections = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (!workspaceId) {
        setConnections([])
        setLoading(false)
        return
      }

      if (!silent) {
        setLoading(true)
      }

      setError('')

      try {
        const records =
          await getConnections(
            workspaceId,
          )

        setConnections(records)
      } catch (loadError) {
        console.error(
          'Unable to load connections:',
          loadError,
        )

        setError(
          loadError.message ||
            'Unable to load connections.',
        )
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [workspaceId],
  )

  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  const handleRealtimeChange =
    useCallback(
      ({ table }) => {
        console.log(
          `Connections realtime update: ${table}`,
        )

        loadConnections({
          silent: true,
        })
      },
      [loadConnections],
    )

  useWorkspaceRealtime({
    workspaceId,
    channelKey: 'connections',
    tables: [
      'connections',
    ],
    onChange:
      handleRealtimeChange,
  })

  async function addConnection(
    formData,
  ) {
    setSaving(true)
    setError('')

    try {
      const created =
        await createConnection({
          workspaceId,
          userId: user.id,
          connection: formData,
        })

      setConnections((current) => [
        created,
        ...current,
      ])

      return created
    } catch (createError) {
      setError(
        createError.message ||
          'Unable to create connection.',
      )

      throw createError
    } finally {
      setSaving(false)
    }
  }

  async function editConnection({
    connection,
    formData,
  }) {
    setSaving(true)
    setError('')

    try {
      const updated =
        await updateConnection({
          workspaceId,
          userId: user.id,
          connectionId:
            connection.id,
          connection: formData,
        })

      replaceConnection(updated)

      return updated
    } catch (updateError) {
      setError(
        updateError.message ||
          'Unable to update connection.',
      )

      throw updateError
    } finally {
      setSaving(false)
    }
  }

  async function toggleConnection(
    connection,
  ) {
    const nextStatus =
      connection.status === 'connected'
        ? 'disconnected'
        : 'connected'

    setSaving(true)
    setError('')

    try {
      const updated =
        await setConnectionStatus({
          workspaceId,
          userId: user.id,
          connection,
          status: nextStatus,
        })

      replaceConnection(updated)

      return updated
    } catch (statusError) {
      setError(
        statusError.message ||
          'Unable to update connection.',
      )

      throw statusError
    } finally {
      setSaving(false)
    }
  }

  async function removeConnection(
    connection,
  ) {
    setSaving(true)
    setError('')

    try {
      await deleteConnection({
        workspaceId,
        userId: user.id,
        connection,
      })

      setConnections((current) =>
        current.filter(
          (record) =>
            record.id !==
            connection.id,
        ),
      )
    } catch (deleteError) {
      setError(
        deleteError.message ||
          'Unable to delete connection.',
      )

      throw deleteError
    } finally {
      setSaving(false)
    }
  }

  function replaceConnection(
    updated,
  ) {
    setConnections((current) =>
      current.map((record) =>
        record.id === updated.id
          ? updated
          : record,
      ),
    )
  }

  return {
    connections,
    loading,
    saving,
    error,
    reload: loadConnections,
    addConnection,
    editConnection,
    toggleConnection,
    removeConnection,
  }
}