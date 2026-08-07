import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import {
  Edit3,
  LoaderCircle,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'

import { useWorkspace } from '../context/WorkspaceContext'
import { useAuth } from '../context/AuthContext'
import { useTeam } from '../hooks/useTeam'

import TeamMemberModal from '../components/TeamMemberModal'

const roleOptions = [
  {
    label: 'All roles',
    value: 'all',
  },
  {
    label: 'Owner',
    value: 'owner',
  },
  {
    label: 'Administrator',
    value: 'administrator',
  },
  {
    label: 'Developer',
    value: 'developer',
  },
  {
    label: 'Analyst',
    value: 'analyst',
  },
  {
    label: 'Viewer',
    value: 'viewer',
  },
]

const statusOptions = [
  {
    label: 'All statuses',
    value: 'all',
  },
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'Invited',
    value: 'invited',
  },
  {
    label: 'Suspended',
    value: 'suspended',
  },
]

function Team() {
  const {
    theme,
    isSidebarCollapsed,
  } = useWorkspace()

  const {
    user,
  } = useAuth()

  const {
    members: memberRecords,
    loading,
    saving,
    error,
    inviteMember,
    editMember,
    changeStatus,
    removeMember,
  } = useTeam()

  const darkMode =
    theme === 'dark'

  const [query, setQuery] =
    useState('')

  const [
    roleFilter,
    setRoleFilter,
  ] = useState('all')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [
    selectedMember,
    setSelectedMember,
  ] = useState(null)

  const [
    isMemberModalOpen,
    setIsMemberModalOpen,
  ] = useState(false)

  const [
    openMenuId,
    setOpenMenuId,
  ] = useState(null)

  const [
    message,
    setMessage,
  ] = useState('')

  const filteredMembers =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase()

      return memberRecords.filter(
        (member) => {
          const name =
            getMemberName(member)

          const email =
            getMemberEmail(member)

          const matchesQuery =
            !normalizedQuery ||
            [
              member.id,
              name,
              email,
              member.role,
              member.status,
              member.department,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(
                normalizedQuery,
              )

          const matchesRole =
            roleFilter === 'all' ||
            member.role ===
              roleFilter

          const matchesStatus =
            statusFilter === 'all' ||
            member.status ===
              statusFilter

          return (
            matchesQuery &&
            matchesRole &&
            matchesStatus
          )
        },
      )
    }, [
      memberRecords,
      query,
      roleFilter,
      statusFilter,
    ])

  const activeCount =
    memberRecords.filter(
      (member) =>
        member.status === 'active',
    ).length

  const invitedCount =
    memberRecords.filter(
      (member) =>
        member.status === 'invited',
    ).length

  const suspendedCount =
    memberRecords.filter(
      (member) =>
        member.status ===
        'suspended',
    ).length

  function showMessage(
    nextMessage,
  ) {
    setMessage(nextMessage)

    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function openInviteModal() {
    setSelectedMember(null)
    setIsMemberModalOpen(true)
    setOpenMenuId(null)
  }

  function openEditModal(member) {
    setSelectedMember(member)
    setIsMemberModalOpen(true)
    setOpenMenuId(null)
  }

  function closeMemberModal() {
    if (saving) {
      return
    }

    setSelectedMember(null)
    setIsMemberModalOpen(false)
  }

  async function saveMember(
    formData,
  ) {
    try {
      if (selectedMember) {
        await editMember({
          member:
            selectedMember,
          formData,
        })

        showMessage(
          'Team member updated successfully.',
        )
      } else {
        await inviteMember(
          formData,
        )

        showMessage(
          'Team invitation created.',
        )
      }

      setSelectedMember(null)
      setIsMemberModalOpen(false)
    } catch (saveError) {
      console.error(
        'Unable to save team member:',
        saveError,
      )

      showMessage(
        saveError.message ||
          'Unable to save team member.',
      )
    }
  }

  async function activateMember(
    member,
  ) {
    try {
      await changeStatus(
        member,
        'active',
      )

      setOpenMenuId(null)

      showMessage(
        'Member activated.',
      )
    } catch (statusError) {
      showMessage(
        statusError.message ||
          'Unable to activate member.',
      )
    }
  }

  async function suspendMember(
    member,
  ) {
    if (
      member.role === 'owner'
    ) {
      showMessage(
        'The workspace owner cannot be suspended.',
      )

      setOpenMenuId(null)
      return
    }

    try {
      await changeStatus(
        member,
        'suspended',
      )

      setOpenMenuId(null)

      showMessage(
        'Member suspended.',
      )
    } catch (statusError) {
      showMessage(
        statusError.message ||
          'Unable to suspend member.',
      )
    }
  }

  async function handleRemoveMember(
    member,
  ) {
    if (
      member.role === 'owner'
    ) {
      showMessage(
        'The workspace owner cannot be removed.',
      )

      setOpenMenuId(null)
      return
    }

    const confirmed =
      window.confirm(
        `Remove "${getMemberName(
          member,
        )}" from this workspace?`,
      )

    if (!confirmed) {
      return
    }

    try {
      await removeMember(
        member,
      )

      setOpenMenuId(null)

      showMessage(
        'Team member removed.',
      )
    } catch (removeError) {
      showMessage(
        removeError.message ||
          'Unable to remove team member.',
      )
    }
  }

  function handleResendInvitation(
    member,
  ) {
    setOpenMenuId(null)

    showMessage(
      `Invitation record is still pending for ${getMemberEmail(
        member,
      )}.`,
    )
  }

  function clearFilters() {
    setQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  return (
    <>
      <main
        className={`min-h-screen pt-[72px] transition-[padding] duration-300 ${
          isSidebarCollapsed
            ? 'lg:pl-[82px]'
            : 'lg:pl-[260px]'
        } ${
          darkMode
            ? 'bg-[#111827] text-white'
            : 'bg-[#f4f6f8] text-slate-900'
        }`}
      >
        <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Workspace access
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Team
              </h2>

              <p
                className={`mt-3 max-w-2xl text-sm leading-7 ${
                  darkMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Manage workspace members,
                roles, invitations and
                access status.
              </p>
            </div>

            <button
              type="button"
              onClick={
                openInviteModal
              }
              disabled={saving}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus
                size={17}
              />
              Invite member
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total members"
              value={
                memberRecords.length
              }
              darkMode={darkMode}
              icon={
                <Users size={18} />
              }
            />

            <SummaryCard
              label="Active members"
              value={activeCount}
              darkMode={darkMode}
              tone="success"
              icon={
                <UserCheck
                  size={18}
                />
              }
            />

            <SummaryCard
              label="Pending invitations"
              value={invitedCount}
              darkMode={darkMode}
              tone="warning"
              icon={
                <Mail size={18} />
              }
            />

            <SummaryCard
              label="Suspended"
              value={suspendedCount}
              darkMode={darkMode}
              tone="danger"
              icon={
                <ShieldCheck
                  size={18}
                />
              }
            />
          </div>

          {message && (
            <div
              role="status"
              className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                darkMode
                  ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-700'
              }`}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500"
            >
              {error}
            </div>
          )}

          <div className="mt-5 grid gap-5 2xl:grid-cols-[1.35fr_0.65fr]">
            <section
              className={`overflow-hidden rounded-2xl border ${
                darkMode
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col gap-3 border-b border-inherit p-4 xl:flex-row xl:items-center">
                <label
                  className={`flex min-h-[44px] flex-1 items-center gap-3 rounded-xl border px-4 ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Search
                    size={16}
                    className={
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }
                  />

                  <input
                    type="search"
                    value={query}
                    onChange={(
                      event,
                    ) =>
                      setQuery(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Search members, roles or departments"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                  <FilterSelect
                    value={
                      roleFilter
                    }
                    onChange={
                      setRoleFilter
                    }
                    options={
                      roleOptions
                    }
                    darkMode={
                      darkMode
                    }
                  />

                  <FilterSelect
                    value={
                      statusFilter
                    }
                    onChange={
                      setStatusFilter
                    }
                    options={
                      statusOptions
                    }
                    darkMode={
                      darkMode
                    }
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[420px] items-center justify-center">
                  <div className="text-center">
                    <LoaderCircle
                      size={28}
                      className="mx-auto animate-spin text-indigo-500"
                    />

                    <p
                      className={`mt-3 text-sm ${
                        darkMode
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    >
                      Loading team
                      members...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="opsora-scrollbar overflow-x-auto">
                    <table className="w-full min-w-[940px] border-collapse">
                      <thead>
                        <tr
                          className={
                            darkMode
                              ? 'bg-slate-900/45 text-slate-500'
                              : 'bg-slate-50 text-slate-400'
                          }
                        >
                          <TableHeading>
                            Member
                          </TableHeading>

                          <TableHeading>
                            Role
                          </TableHeading>

                          <TableHeading>
                            Status
                          </TableHeading>

                          <TableHeading>
                            Department
                          </TableHeading>

                          <TableHeading>
                            Joined
                          </TableHeading>

                          <TableHeading>
                            Actions
                          </TableHeading>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredMembers.map(
                          (
                            member,
                          ) => (
                            <MemberRow
                              key={
                                member.id
                              }
                              member={
                                member
                              }
                              currentUserId={
                                user?.id
                              }
                              darkMode={
                                darkMode
                              }
                              saving={
                                saving
                              }
                              isMenuOpen={
                                openMenuId ===
                                member.id
                              }
                              onToggleMenu={() =>
                                setOpenMenuId(
                                  (
                                    current,
                                  ) =>
                                    current ===
                                    member.id
                                      ? null
                                      : member.id,
                                )
                              }
                              onEdit={() =>
                                openEditModal(
                                  member,
                                )
                              }
                              onResend={() =>
                                handleResendInvitation(
                                  member,
                                )
                              }
                              onActivate={() =>
                                activateMember(
                                  member,
                                )
                              }
                              onSuspend={() =>
                                suspendMember(
                                  member,
                                )
                              }
                              onRemove={() =>
                                handleRemoveMember(
                                  member,
                                )
                              }
                            />
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>

                  {filteredMembers.length ===
                    0 && (
                    <EmptyState
                      darkMode={
                        darkMode
                      }
                      hasMembers={
                        memberRecords.length >
                        0
                      }
                      onClearFilters={
                        clearFilters
                      }
                      onInvite={
                        openInviteModal
                      }
                    />
                  )}

                  <footer className="flex flex-col justify-between gap-3 border-t border-inherit px-5 py-4 sm:flex-row sm:items-center">
                    <p
                      className={`text-xs ${
                        darkMode
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      Showing{' '}
                      {
                        filteredMembers.length
                      }{' '}
                      of{' '}
                      {
                        memberRecords.length
                      }{' '}
                      members
                    </p>

                    <p
                      className={`text-xs ${
                        darkMode
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      Workspace access is
                      stored in Supabase.
                    </p>
                  </footer>
                </>
              )}
            </section>

            <aside className="space-y-5">
              <RoleDistributionPanel
                members={
                  memberRecords
                }
                darkMode={
                  darkMode
                }
              />

              <AccessStatusPanel
                members={
                  memberRecords
                }
                darkMode={
                  darkMode
                }
              />
            </aside>
          </div>
        </div>
      </main>

      <TeamMemberModal
        isOpen={
          isMemberModalOpen
        }
        member={
          selectedMember
            ? normalizeMemberForModal(
                selectedMember,
              )
            : null
        }
        darkMode={darkMode}
        saving={saving}
        onClose={
          closeMemberModal
        }
        onSave={saveMember}
      />
    </>
  )
}

function MemberRow({
  member,
  currentUserId,
  darkMode,
  saving,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onResend,
  onActivate,
  onSuspend,
  onRemove,
}) {
  const name =
    getMemberName(member)

  const email =
    getMemberEmail(member)

  const isCurrentUser =
    Boolean(
      member.user_id &&
        member.user_id ===
          currentUserId,
    )

  return (
    <tr className="border-t border-inherit">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
            {createInitials(
              name,
            )}
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">
                {name}
              </p>

              {isCurrentUser && (
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-semibold text-indigo-500">
                  You
                </span>
              )}
            </div>

            <p
              className={`mt-1 truncate text-xs ${
                darkMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <RoleBadge
          role={member.role}
        />
      </td>

      <td className="px-5 py-4">
        <MemberStatusBadge
          status={
            member.status
          }
        />
      </td>

      <td className="px-5 py-4 text-xs">
        {member.department ||
          'Not assigned'}
      </td>

      <td
        className={`px-5 py-4 text-xs ${
          darkMode
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}
      >
        {member.joined_at
          ? formatDate(
              member.joined_at,
            )
          : member.status ===
              'invited'
            ? 'Invitation pending'
            : '—'}
      </td>

      <td className="px-5 py-4">
        <MemberActionMenuTrigger
          member={member}
          darkMode={darkMode}
          saving={saving}
          isMenuOpen={
            isMenuOpen
          }
          onToggleMenu={
            onToggleMenu
          }
          onEdit={onEdit}
          onResend={onResend}
          onActivate={
            onActivate
          }
          onSuspend={
            onSuspend
          }
          onRemove={onRemove}
        />
      </td>
    </tr>
  )
}

function MemberActionMenuTrigger({
  member,
  darkMode,
  saving,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onResend,
  onActivate,
  onSuspend,
  onRemove,
}) {
  const buttonRef =
    useRef(null)

  const [
    menuPosition,
    setMenuPosition,
  ] = useState(null)

  function updatePosition() {
    const rect =
      buttonRef.current?.getBoundingClientRect()

    if (!rect) {
      return
    }

    setMenuPosition({
      top: rect.bottom + 8,
      right:
        window.innerWidth -
        rect.right,
      buttonTop: rect.top,
    })
  }

  function handleToggle() {
    if (!isMenuOpen) {
      updatePosition()
    }

    onToggleMenu()
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    function handleViewportChange() {
      updatePosition()
    }

    window.addEventListener(
      'resize',
      handleViewportChange,
    )

    window.addEventListener(
      'scroll',
      handleViewportChange,
      true,
    )

    return () => {
      window.removeEventListener(
        'resize',
        handleViewportChange,
      )

      window.removeEventListener(
        'scroll',
        handleViewportChange,
        true,
      )
    }
  }, [isMenuOpen])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={saving}
        aria-label={`Open actions for ${getMemberName(
          member,
        )}`}
        className={`flex h-9 w-9 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-50 ${
          darkMode
            ? 'border-slate-700 hover:bg-slate-900'
            : 'border-slate-200 hover:bg-slate-50'
        }`}
      >
        <MoreHorizontal
          size={17}
        />
      </button>

      {isMenuOpen &&
        menuPosition &&
        createPortal(
          <MemberActions
            member={member}
            darkMode={
              darkMode
            }
            saving={saving}
            position={
              menuPosition
            }
            onClose={
              onToggleMenu
            }
            onEdit={onEdit}
            onResend={
              onResend
            }
            onActivate={
              onActivate
            }
            onSuspend={
              onSuspend
            }
            onRemove={
              onRemove
            }
          />,
          document.body,
        )}
    </>
  )
}

function MemberActions({
  member,
  darkMode,
  saving,
  position,
  onClose,
  onEdit,
  onResend,
  onActivate,
  onSuspend,
  onRemove,
}) {
  const menuRef =
    useRef(null)

  const isOwner =
    member.role === 'owner'

  const itemCount =
    1 +
    (member.status ===
    'invited'
      ? 2
      : 0) +
    (member.status ===
      'suspended' &&
    !isOwner
      ? 1
      : 0) +
    (member.status ===
      'active' &&
    !isOwner
      ? 1
      : 0) +
    (!isOwner ? 1 : 0)

  const estimatedMenuHeight =
    itemCount * 40 + 12

  const shouldOpenUp =
    position.top +
      estimatedMenuHeight >
    window.innerHeight - 16

  useEffect(() => {
    function handlePointerDown(
      event,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target,
        )
      ) {
        onClose()
      }
    }

    function handleKeyDown(
      event,
    ) {
      if (
        event.key === 'Escape'
      ) {
        onClose()
      }
    }

    window.addEventListener(
      'mousedown',
      handlePointerDown,
    )

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        'mousedown',
        handlePointerDown,
      )

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [onClose])

  const menuStyle =
    shouldOpenUp
      ? {
          bottom:
            window.innerHeight -
            position.buttonTop +
            8,
          right:
            position.right,
        }
      : {
          top: position.top,
          right:
            position.right,
        }

  function runAction(action) {
    onClose()
    action()
  }

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className={`fixed z-[9999] w-52 overflow-hidden rounded-xl border p-1.5 shadow-xl ${
        darkMode
          ? 'border-slate-700 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}
    >
      <ActionButton
        icon={
          <Edit3 size={15} />
        }
        label="Edit member"
        onClick={() =>
          runAction(onEdit)
        }
        darkMode={darkMode}
        disabled={saving}
      />

      {member.status ===
        'invited' && (
        <>
          <ActionButton
            icon={
              <Mail size={15} />
            }
            label="Invitation status"
            onClick={() =>
              runAction(
                onResend,
              )
            }
            darkMode={
              darkMode
            }
            disabled={saving}
          />

          <ActionButton
            icon={
              <UserCheck
                size={15}
              />
            }
            label="Activate member"
            onClick={() =>
              runAction(
                onActivate,
              )
            }
            darkMode={
              darkMode
            }
            disabled={saving}
          />
        </>
      )}

      {member.status ===
        'suspended' &&
        !isOwner && (
          <ActionButton
            icon={
              <UserCheck
                size={15}
              />
            }
            label="Reactivate member"
            onClick={() =>
              runAction(
                onActivate,
              )
            }
            darkMode={
              darkMode
            }
            disabled={saving}
          />
        )}

      {member.status ===
        'active' &&
        !isOwner && (
          <ActionButton
            icon={
              <ShieldCheck
                size={15}
              />
            }
            label="Suspend member"
            onClick={() =>
              runAction(
                onSuspend,
              )
            }
            darkMode={
              darkMode
            }
            disabled={saving}
          />
        )}

      {!isOwner && (
        <ActionButton
          icon={
            <Trash2 size={15} />
          }
          label="Remove member"
          onClick={() =>
            runAction(
              onRemove,
            )
          }
          darkMode={
            darkMode
          }
          destructive
          disabled={saving}
        />
      )}
    </div>
  )
}

function RoleDistributionPanel({
  members,
  darkMode,
}) {
  const roles = [
    'owner',
    'administrator',
    'developer',
    'analyst',
    'viewer',
  ]

  const counts =
    roles.map((role) => ({
      role,
      count:
        members.filter(
          (member) =>
            member.role === role,
        ).length,
    }))

  const maximum =
    Math.max(
      ...counts.map(
        (item) =>
          item.count,
      ),
      1,
    )

  return (
    <section
      className={`rounded-2xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <h3 className="text-sm font-semibold">
        Role distribution
      </h3>

      <p
        className={`mt-1 text-xs ${
          darkMode
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}
      >
        Current workspace access
        levels
      </p>

      <div className="mt-5 space-y-5">
        {counts.map(
          (item) => (
            <div
              key={item.role}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold">
                  {formatRole(
                    item.role,
                  )}
                </p>

                <span
                  className={`text-xs ${
                    darkMode
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </div>

              <div
                className={`mt-2 h-2 overflow-hidden rounded-full ${
                  darkMode
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
                }`}
              >
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width: `${
                      (item.count /
                        maximum) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  )
}

function AccessStatusPanel({
  members,
  darkMode,
}) {
  const statuses = [
    {
      status: 'active',
      label: 'Active',
    },
    {
      status: 'invited',
      label: 'Invited',
    },
    {
      status:
        'suspended',
      label: 'Suspended',
    },
  ]

  return (
    <section
      className={`rounded-2xl border ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <header className="border-b border-inherit px-5 py-4">
        <h3 className="text-sm font-semibold">
          Access overview
        </h3>

        <p
          className={`mt-1 text-xs ${
            darkMode
              ? 'text-slate-500'
              : 'text-slate-400'
          }`}
        >
          Workspace membership status
        </p>
      </header>

      <div className="divide-y divide-inherit">
        {statuses.map(
          (item) => {
            const count =
              members.filter(
                (member) =>
                  member.status ===
                  item.status,
              ).length

            return (
              <div
                key={
                  item.status
                }
                className="flex items-center justify-between px-5 py-4"
              >
                <MemberStatusBadge
                  status={
                    item.status
                  }
                />

                <span className="text-lg font-bold">
                  {count}
                </span>
              </div>
            )
          },
        )}
      </div>
    </section>
  )
}

function SummaryCard({
  label,
  value,
  darkMode,
  icon,
  tone,
}) {
  const toneClass = {
    success:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    warning:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    danger:
      'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  }[tone]

  return (
    <article
      className={`rounded-2xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs ${
              darkMode
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-[-0.04em]">
            {value}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            toneClass ||
            'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
          }`}
        >
          {icon}
        </span>
      </div>
    </article>
  )
}

function RoleBadge({ role }) {
  const styles = {
    owner:
      'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    administrator:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
    developer:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    analyst:
      'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
    viewer:
      'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[role] ||
        styles.viewer
      }`}
    >
      {formatRole(role)}
    </span>
  )
}

function MemberStatusBadge({
  status,
}) {
  const styles = {
    active:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    invited:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    suspended:
      'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[status] ||
        styles.invited
      }`}
    >
      {capitalize(status)}
    </span>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
  darkMode,
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      className={`min-h-[44px] rounded-xl border px-4 text-xs font-semibold outline-none ${
        darkMode
          ? 'border-slate-700 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}
    >
      {options.map(
        (option) => (
          <option
            key={option.value}
            value={
              option.value
            }
          >
            {option.label}
          </option>
        ),
      )}
    </select>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  darkMode,
  destructive = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
        destructive
          ? 'text-rose-500 hover:bg-rose-500/10'
          : darkMode
            ? 'text-slate-300 hover:bg-slate-800'
            : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function EmptyState({
  darkMode,
  hasMembers,
  onClearFilters,
  onInvite,
}) {
  return (
    <div className="flex min-h-[320px] items-center justify-center border-t border-inherit px-6">
      <div className="text-center">
        <Search
          size={28}
          className="mx-auto text-slate-400"
        />

        <h3 className="mt-4 text-lg font-semibold">
          {hasMembers
            ? 'No team members found'
            : 'No team members yet'}
        </h3>

        <p
          className={`mt-2 text-sm ${
            darkMode
              ? 'text-slate-500'
              : 'text-slate-400'
          }`}
        >
          {hasMembers
            ? 'Adjust the search or filter selections.'
            : 'Invite someone to this workspace.'}
        </p>

        <button
          type="button"
          onClick={
            hasMembers
              ? onClearFilters
              : onInvite
          }
          className="mt-5 rounded-xl border border-indigo-500/30 px-4 py-2.5 text-sm font-semibold text-indigo-500"
        >
          {hasMembers
            ? 'Clear filters'
            : 'Invite member'}
        </button>
      </div>
    </div>
  )
}

function TableHeading({
  children,
}) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em]">
      {children}
    </th>
  )
}

function normalizeMemberForModal(
  member,
) {
  return {
    ...member,
    name:
      getMemberName(member),
    email:
      getMemberEmail(member),
    role:
      formatRole(member.role),
    status:
      capitalize(
        member.status,
      ),
  }
}

function getMemberName(member) {
  return (
    member.profiles
      ?.full_name ||
    member.invited_name ||
    member.invited_email ||
    'Workspace member'
  )
}

function getMemberEmail(member) {
  if (member.invited_email) {
    return member.invited_email
  }

  if (member.user_id) {
    return 'Authenticated member'
  }

  return 'No email available'
}

function createInitials(name) {
  const safeName =
    String(name || '')
      .trim()

  if (!safeName) {
    return '?'
  }

  return safeName
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part[0] || '',
    )
    .join('')
    .toUpperCase()
}

function formatRole(role) {
  if (
    role === 'administrator'
  ) {
    return 'Administrator'
  }

  return capitalize(role)
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(date)
}

function capitalize(value) {
  if (!value) {
    return ''
  }

  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(1)
  )
}

export default Team