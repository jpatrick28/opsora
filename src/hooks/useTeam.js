import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useAuth } from '../context/AuthContext'
import { useWorkspaceRealtime } from './useWorkspaceRealtime'

import {
  deleteTeamMember,
  getTeamMembers,
  inviteTeamMember,
  setTeamMemberStatus,
  updateTeamMember,
} from '../services/teamService'

export function useTeam() {
  const {
    user,
    workspaceRecord,
  } = useAuth()

  const workspaceId =
    workspaceRecord?.id || null

  const [members, setMembers] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const loadMembers = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (!workspaceId) {
        setMembers([])
        setLoading(false)
        return
      }

      if (!silent) {
        setLoading(true)
      }

      setError('')

      try {
        const records =
          await getTeamMembers(
            workspaceId,
          )

        setMembers(records)
      } catch (loadError) {
        console.error(
          'Unable to load team:',
          loadError,
        )

        setError(
          loadError.message ||
            'Unable to load team members.',
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
    loadMembers()
  }, [loadMembers])

  const handleRealtimeChange =
    useCallback(
      ({ table }) => {
        console.log(
          `Team realtime update: ${table}`,
        )

        loadMembers({
          silent: true,
        })
      },
      [loadMembers],
    )

  useWorkspaceRealtime({
    workspaceId,
    channelKey: 'team',
    tables: [
      'workspace_members',
    ],
    onChange:
      handleRealtimeChange,
  })

  async function inviteMember(
    formData,
  ) {
    setSaving(true)
    setError('')

    try {
      const created =
        await inviteTeamMember({
          workspaceId,
          userId: user.id,
          member: formData,
        })

      setMembers((current) => [
        ...current,
        created,
      ])

      return created
    } catch (inviteError) {
      setError(
        inviteError.message ||
          'Unable to invite team member.',
      )

      throw inviteError
    } finally {
      setSaving(false)
    }
  }

  async function editMember({
    member,
    formData,
  }) {
    setSaving(true)
    setError('')

    try {
      const updated =
        await updateTeamMember({
          workspaceId,
          userId: user.id,
          memberId: member.id,
          member: {
            ...formData,
            user_id:
              member.user_id,
          },
        })

      replaceMember(updated)

      return updated
    } catch (updateError) {
      setError(
        updateError.message ||
          'Unable to update team member.',
      )

      throw updateError
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(
    member,
    status,
  ) {
    setSaving(true)
    setError('')

    try {
      const updated =
        await setTeamMemberStatus({
          workspaceId,
          userId: user.id,
          member,
          status,
        })

      replaceMember(updated)

      return updated
    } catch (statusError) {
      setError(
        statusError.message ||
          'Unable to update member status.',
      )

      throw statusError
    } finally {
      setSaving(false)
    }
  }

  async function removeMember(
    member,
  ) {
    setSaving(true)
    setError('')

    try {
      await deleteTeamMember({
        workspaceId,
        userId: user.id,
        member,
      })

      setMembers((current) =>
        current.filter(
          (record) =>
            record.id !==
            member.id,
        ),
      )
    } catch (deleteError) {
      setError(
        deleteError.message ||
          'Unable to remove team member.',
      )

      throw deleteError
    } finally {
      setSaving(false)
    }
  }

  function replaceMember(
    updated,
  ) {
    setMembers((current) =>
      current.map((record) =>
        record.id === updated.id
          ? updated
          : record,
      ),
    )
  }

  return {
    members,
    loading,
    saving,
    error,
    reload: loadMembers,
    inviteMember,
    editMember,
    changeStatus,
    removeMember,
  }
}