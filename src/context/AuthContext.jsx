import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] =
    useState(null)

  const [profile, setProfile] =
    useState(null)

  const [
    workspaceRecord,
    setWorkspaceRecord,
  ] = useState(null)

  const [
    membership,
    setMembership,
  ] = useState(null)

  const [
    pendingInvitation,
    setPendingInvitation,
  ] = useState(null)

  const [loading, setLoading] =
    useState(true)

  const isInviteFlow =
    typeof window !== 'undefined' &&
    new URLSearchParams(
      window.location.search,
    ).get('invite') === '1'

  const loadAccountData = useCallback(
    async (userId) => {
      if (!userId) {
        setProfile(null)
        setWorkspaceRecord(null)
        setMembership(null)
        setPendingInvitation(null)
        return
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      setProfile(profileData)

      const {
        data: membershipData,
        error: membershipError,
      } = await supabase
        .from('workspace_members')
        .select(`
          id,
          workspace_id,
          user_id,
          invited_email,
          invited_name,
          role,
          status,
          department,
          joined_at,
          workspaces (
            id,
            name,
            slug,
            timezone,
            date_format,
            week_starts_on,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

      if (membershipError) {
        throw membershipError
      }

      setMembership(
        membershipData || null,
      )

      setWorkspaceRecord(
        membershipData?.workspaces ||
          null,
      )

      /*
       * If the user does not yet have
       * an active membership, check
       * whether their authenticated
       * email has a pending invitation.
       */
      if (!membershipData) {
        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        const email =
          userData.user?.email

        if (email) {
          const {
            data: invitationData,
            error:
              invitationError,
          } = await supabase
            .from(
              'workspace_members',
            )
            .select(`
              id,
              workspace_id,
              user_id,
              invited_email,
              invited_name,
              role,
              status,
              department,
              joined_at,
              workspaces (
                id,
                name,
                slug,
                timezone,
                date_format,
                week_starts_on,
                created_by,
                created_at,
                updated_at
              )
            `)
            .eq(
              'invited_email',
              email.toLowerCase(),
            )
            .eq(
              'status',
              'invited',
            )
            .is(
              'user_id',
              null,
            )
            .limit(1)
            .maybeSingle()

          if (
            invitationError
          ) {
            throw invitationError
          }

          setPendingInvitation(
            invitationData ||
              null,
          )
        } else {
          setPendingInvitation(
            null,
          )
        }
      } else {
        setPendingInvitation(null)
      }
    },
    [],
  )

  useEffect(() => {
    let active = true

    async function initializeAuth() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!active) {
          return
        }

        const currentSession =
          data.session || null

        setSession(currentSession)

        if (
          currentSession?.user
        ) {
          await loadAccountData(
            currentSession.user.id,
          )
        }
      } catch (error) {
        console.error(
          'Unable to initialize authentication:',
          error,
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          setSession(nextSession)

          window.setTimeout(
            async () => {
              try {
                if (
                  nextSession?.user
                ) {
                  await loadAccountData(
                    nextSession.user
                      .id,
                  )
                } else {
                  setProfile(null)
                  setWorkspaceRecord(
                    null,
                  )
                  setMembership(null)
                  setPendingInvitation(
                    null,
                  )
                }
              } catch (error) {
                console.error(
                  'Unable to refresh account data:',
                  error,
                )
              } finally {
                setLoading(false)
              }
            },
            0,
          )
        },
      )

    return () => {
      active = false

      authListener.subscription.unsubscribe()
    }
  }, [loadAccountData])

  async function signUp({
    fullName,
    email,
    password,
  }) {
    const {
      data,
      error,
    } =
      await supabase.auth.signUp({
        email,
        password,

        options: {
          data: {
            full_name:
              fullName,
          },
        },
      })

    if (error) {
      throw error
    }

    return data
  }

  async function signIn({
    email,
    password,
  }) {
    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      )

    if (error) {
      throw error
    }

    return data
  }

  async function signOut() {
    const { error } =
      await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  async function createInitialWorkspace({
    name,
    slug,
  }) {
    const {
      data,
      error,
    } = await supabase.rpc(
      'create_initial_workspace',
      {
        workspace_name: name,
        workspace_slug: slug,
      },
    )

    if (error) {
      throw error
    }

    if (session?.user) {
      await loadAccountData(
        session.user.id,
      )
    }

    return data
  }

  async function completeInvite({
    fullName,
    password,
  }) {
    if (!session?.user) {
      throw new Error(
        'No authenticated invitation session was found.',
      )
    }

    if (
      !password ||
      password.length < 8
    ) {
      throw new Error(
        'Password must be at least 8 characters.',
      )
    }

    const {
      error: passwordError,
    } =
      await supabase.auth.updateUser({
        password,

        data: {
          full_name:
            fullName?.trim() ||
            undefined,
        },
      })

    if (passwordError) {
      throw passwordError
    }

    const {
      data:
        acceptedWorkspaceId,
      error:
        invitationError,
    } = await supabase.rpc(
      'accept_workspace_invitation',
    )

    if (invitationError) {
      throw invitationError
    }

    if (!acceptedWorkspaceId) {
      throw new Error(
        'No pending workspace invitation was found for this account.',
      )
    }

    await loadAccountData(
      session.user.id,
    )

    /*
     * Remove ?invite=1 once
     * membership activation succeeds.
     */
    const url =
      new URL(
        window.location.href,
      )

    url.searchParams.delete(
      'invite',
    )

    window.history.replaceState(
      {},
      '',
      `${url.pathname}${url.search}${url.hash}`,
    )

    return acceptedWorkspaceId
  }

  const value = useMemo(
    () => ({
      session,

      user:
        session?.user || null,

      profile,

      workspaceRecord,

      membership,

      pendingInvitation,

      loading,

      isInviteFlow,

      signUp,

      signIn,

      signOut,

      createInitialWorkspace,

      completeInvite,

      refreshAccount: () =>
        session?.user
          ? loadAccountData(
              session.user.id,
            )
          : Promise.resolve(),
    }),
    [
      session,
      profile,
      workspaceRecord,
      membership,
      pendingInvitation,
      loading,
      isInviteFlow,
      loadAccountData,
    ],
  )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}