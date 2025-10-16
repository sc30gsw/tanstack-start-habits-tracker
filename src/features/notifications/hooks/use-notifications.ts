import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { InferSelectModel } from 'drizzle-orm'
import {
  GET_NOTIFICATIONS_CACHE_KEY,
  GET_UNREAD_NOTIFICATIONS_COUNT_CACHE_KEY,
} from '~/constants/cache-key'
import type { notifications as notificationsTable } from '~/db/schema'
import { notificationDto } from '~/features/notifications/server/notification-functions'

/**
 * Hook to fetch and manage notifications
 */
export function useNotifications() {
  const queryClient = useQueryClient()

  // Fetch all notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useSuspenseQuery({
    queryKey: [GET_NOTIFICATIONS_CACHE_KEY],
    queryFn: () => notificationDto.getNotifications(),
    refetchInterval: 60000, // Poll every 60 seconds
    refetchOnWindowFocus: true,
  })

  // Fetch unread count
  const { data: unreadCount = 0 } = useSuspenseQuery({
    queryKey: [GET_NOTIFICATIONS_CACHE_KEY, GET_UNREAD_NOTIFICATIONS_COUNT_CACHE_KEY],
    queryFn: () => notificationDto.getUnreadNotificationsCount(),
    refetchInterval: 60000, // Poll every 60 seconds
    refetchOnWindowFocus: true,
  })

  // Mark notification as read
  const markAsRead = async (notificationId: InferSelectModel<typeof notificationsTable>['id']) => {
    try {
      await notificationDto.markNotificationAsRead({ data: { notificationId } })

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: [GET_NOTIFICATIONS_CACHE_KEY] })
      queryClient.invalidateQueries({
        queryKey: [GET_NOTIFICATIONS_CACHE_KEY, GET_UNREAD_NOTIFICATIONS_COUNT_CACHE_KEY],
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationDto.markAllNotificationsAsRead()

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: [GET_NOTIFICATIONS_CACHE_KEY] })
      queryClient.invalidateQueries({
        queryKey: [GET_NOTIFICATIONS_CACHE_KEY, GET_UNREAD_NOTIFICATIONS_COUNT_CACHE_KEY],
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  // Delete notification
  const deleteNotification = async (
    notificationId: InferSelectModel<typeof notificationsTable>['id'],
  ) => {
    try {
      await notificationDto.deleteNotification({ data: { notificationId } })

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: [GET_NOTIFICATIONS_CACHE_KEY] })
      queryClient.invalidateQueries({
        queryKey: [GET_NOTIFICATIONS_CACHE_KEY, GET_UNREAD_NOTIFICATIONS_COUNT_CACHE_KEY],
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  }

  // Delete all read notifications
  const deleteAllReadNotifications = async () => {
    try {
      await notificationDto.deleteAllReadNotifications()

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: [GET_NOTIFICATIONS_CACHE_KEY] })
      queryClient.invalidateQueries({
        queryKey: [GET_NOTIFICATIONS_CACHE_KEY, GET_UNREAD_NOTIFICATIONS_COUNT_CACHE_KEY],
      })
    } catch (error) {
      console.error('Failed to delete all read notifications:', error)
      throw error
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllReadNotifications,
  } as const
}
