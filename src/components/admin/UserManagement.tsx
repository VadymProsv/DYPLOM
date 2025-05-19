import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setUsers,
  appendUsers,
  updateUser,
  removeUser,
  setLoading,
  setError,
} from '@/store/slices/adminSlice';
import { adminService } from '@/services/adminService';
import {
  UserIcon,
  PencilIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function UserManagement() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const adminState = useAppSelector((state) => state.admin) || {};
  const { users, loading, error } = adminState;
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    role: 'user' | 'organizer' | 'admin';
  } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      dispatch(setLoading(true));
      try {
        const data = await adminService.getUsers(page);
        if (page === 1) {
          dispatch(setUsers(data));
        } else {
          dispatch(appendUsers(data));
        }
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error
              ? error.message
              : t('admin.errors.loadUsersFailed')
          )
        );
      }
    };

    fetchUsers();
  }, [dispatch, page, t]);

  const handleRoleChange = async (userId: string, role: 'user' | 'organizer' | 'admin') => {
    try {
      const updatedUser = await adminService.updateUserRole(userId, role);
      dispatch(updateUser(updatedUser));
      setEditingUser(null);
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : t('admin.errors.updateRoleFailed')
        )
      );
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      await adminService.blockUser(userId);
      dispatch(updateUser({ ...users.items.find(u => u.id === userId), isBlocked: true }));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : t('admin.errors.blockUserFailed')));
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await adminService.unblockUser(userId);
      dispatch(updateUser({ ...users.items.find(u => u.id === userId), isBlocked: false }));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : t('admin.errors.unblockUserFailed')));
    }
  };

  const loadMore = () => {
    if (!loading && users.hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Таблиця користувачів */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.user')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.items.map((user) => {
              const allowedRoles = ['admin', 'user', 'organizer'];
              const isEditableRole = allowedRoles.includes(user.role);
              return (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatar ? (user.avatar.startsWith('/uploads') ? `${API_URL}${user.avatar}` : user.avatar) : '/default-avatar.svg'}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === user.id && isEditableRole ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) =>
                          setEditingUser({
                            id: user.id,
                            role: e.target.value as 'user' | 'organizer' | 'admin',
                          })
                        }
                        onBlur={() =>
                          handleRoleChange(user.id, editingUser.role)
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="user">{t('admin.roles.user')}</option>
                        <option value="organizer">
                          {t('admin.roles.organizer')}
                        </option>
                        <option value="admin">{t('admin.roles.admin')}</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'organizer'
                            ? 'bg-green-100 text-green-800'
                            : user.role === 'user'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {allowedRoles.includes(user.role)
                          ? t(`admin.roles.${user.role}`)
                          : user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.isBlocked ? t('admin.statusBlocked') : t('admin.statusActive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isEditableRole && (
                      <button
                        onClick={() =>
                          setEditingUser({ id: user.id, role: user.role as 'user' | 'organizer' | 'admin' })
                        }
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {user.isBlocked ? (
                      <button
                        onClick={() => handleUnblockUser(user.id)}
                        className="text-green-600 hover:text-green-900"
                        title={t('admin.unblockUser')}
                      >
                        <LockOpenIcon className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlockUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title={t('admin.blockUser')}
                      >
                        <LockClosedIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Кнопка "Завантажити ще" */}
      {users.hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('admin.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
} 