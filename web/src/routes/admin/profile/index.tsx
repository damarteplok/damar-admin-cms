import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  GET_MY_PROFILE_QUERY,
  UPDATE_PROFILE_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  UPLOAD_AVATAR_MUTATION,
} from '@/lib/graphql/user.graphql'
import type {
  ProfileMeResponse,
  UpdateProfileResponse,
  ChangePasswordResponse,
  UpdateProfileInput,
  ChangePasswordInput,
  UploadAvatarResponse,
} from '@/types'

import {
  ProfileForm,
  ChangePasswordForm,
  AvatarUpload,
} from '@/components/features/profile'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/admin/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')

  // Fetch profile
  const [result, refetchProfile] = useQuery<ProfileMeResponse>({
    query: GET_MY_PROFILE_QUERY,
    requestPolicy: 'cache-and-network',
  })

  const [, updateProfileMutation] = useMutation<UpdateProfileResponse>(
    UPDATE_PROFILE_MUTATION,
  )
  const [, changePasswordMutation] = useMutation<ChangePasswordResponse>(
    CHANGE_PASSWORD_MUTATION,
  )
  const [, uploadAvatarMutation] = useMutation<UploadAvatarResponse>(
    UPLOAD_AVATAR_MUTATION,
  )

  const { data: queryData, fetching, error } = result
  const profile = queryData?.me.data

  // Debug: Log avatar data
  console.log('Profile data:', profile)
  console.log('Avatar data:', profile?.avatar)

  const handleUpdateProfile = async (data: UpdateProfileInput) => {
    const result = await updateProfileMutation({
      input: data,
    })

    if (result.data?.updateUser.success) {
      toast.success(
        t('profile.update_success', {
          defaultValue: 'Profile updated successfully!',
        }),
      )
      return true
    } else {
      toast.error(
        result.data?.updateUser.message ||
          t('profile.update_error', {
            defaultValue: 'Failed to update profile',
          }),
      )
      return false
    }
  }

  const handleChangePassword = async (data: ChangePasswordInput) => {
    const result = await changePasswordMutation({
      input: data,
    })

    if (result.data?.changePassword.success) {
      toast.success(
        t('profile.password.success', {
          defaultValue: 'Password changed successfully!',
        }),
      )
      return true
    } else {
      toast.error(
        result.data?.changePassword.message ||
          t('profile.password.error', {
            defaultValue: 'Failed to change password',
          }),
      )
      return false
    }
  }

  const handleUploadAvatar = async (file: File) => {
    if (!profile) return false

    const result = await uploadAvatarMutation({
      input: {
        content: file,
        fileName: file.name,
        mimeType: file.type,
        modelType: 'user',
        modelId: profile.id,
        collectionName: 'avatar',
        name: file.name,
        disk: 'public',
      },
    })

    if (result.data?.uploadFile.success) {
      toast.success(
        t('profile.avatar.upload_success', {
          defaultValue: 'Avatar uploaded successfully!',
        }),
      )
      // Refetch profile to get new avatar
      refetchProfile({ requestPolicy: 'network-only' })
      return true
    } else {
      toast.error(
        result.data?.uploadFile.message ||
          t('profile.avatar.upload_error', {
            defaultValue: 'Failed to upload avatar',
          }),
      )
      return false
    }
  }

  if (fetching && !profile) {
    return (
      <DataTableSkeleton
        showCreateButton={false}
        showSearch={false}
        rows={5}
        columns={2}
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title={t('profile.error_title', { defaultValue: 'Error' })}
        description={
          error.message ||
          t('profile.error', { defaultValue: 'Failed to load profile' })
        }
      />
    )
  }

  if (!profile) {
    return (
      <ErrorState
        title={t('profile.not_found_title', { defaultValue: 'Not Found' })}
        description={t('profile.not_found', {
          defaultValue: 'Profile not found',
        })}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('profile.title', { defaultValue: 'My Profile' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('profile.subtitle', {
              defaultValue: 'Manage your personal information and security',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          {profile.isAdmin && (
            <Badge variant="default">
              {t('profile.admin', { defaultValue: 'Admin' })}
            </Badge>
          )}
          {profile.emailVerified ? (
            <Badge variant="default">
              {t('profile.verified', { defaultValue: 'Verified' })}
            </Badge>
          ) : (
            <Badge variant="destructive">
              {t('profile.unverified', { defaultValue: 'Unverified' })}
            </Badge>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="profile">
            {t('profile.tabs.info', { defaultValue: 'Profile Information' })}
          </TabsTrigger>
          <TabsTrigger value="security">
            {t('profile.tabs.security', { defaultValue: 'Security' })}
          </TabsTrigger>
        </TabsList>

        {/* Profile Information Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.avatar.title', { defaultValue: 'Profile Picture' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AvatarUpload
                avatar={profile.avatar}
                userName={profile.name}
                onUpload={handleUploadAvatar}
              />
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.info.title', {
                  defaultValue: 'Personal Information',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialData={{
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  publicName: profile.publicName,
                  phoneNumber: profile.phoneNumber,
                  position: profile.position,
                }}
                onSubmit={handleUpdateProfile}
                onCancel={() => setActiveTab('profile')}
                isOwnProfile={true}
              />
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.account.title', {
                  defaultValue: 'Account Details',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {t('profile.account.created', {
                    defaultValue: 'Member Since',
                  })}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(profile.createdAt * 1000).toLocaleDateString()}
                </span>
              </div>
              {profile.lastLoginAt && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t('profile.account.last_login', {
                        defaultValue: 'Last Login',
                      })}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(profile.lastLoginAt * 1000).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.password.title', {
                  defaultValue: 'Change Password',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm
                onSubmit={handleChangePassword}
                onCancel={() => setActiveTab('profile')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
