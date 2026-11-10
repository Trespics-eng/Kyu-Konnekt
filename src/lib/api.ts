import {
  getValidAuthToken,
  getRefreshToken,
  setSession,
  clearSession,
  recordActivity,
} from './session';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: { nextCursor?: string | null; hasMore?: boolean } | null;
};

export class ApiError extends Error {
  status: number;
  errors: unknown;
  requestId?: string;
  endpoint: string;
  method: string;

  constructor(message: string, status: number, errors: unknown, requestId?: string, endpoint = '', method = 'GET') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.requestId = requestId;
    this.endpoint = endpoint;
    this.method = method;
  }
}

type ApiOptions = Omit<RequestInit, 'headers'> & {
  accessToken?: string | null;
  headers?: HeadersInit;
};

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        const session = result?.data?.session;
        if (!response.ok || !session?.access_token) {
          clearSession('unauthorized');
          return null;
        }
        setSession(session.access_token, session.refresh_token);
        return session.access_token as string;
      })
      .catch(() => {
        clearSession('unauthorized');
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<ApiEnvelope<T>> {
  const { accessToken, headers: suppliedHeaders, ...requestOptions } = options;
  const method = requestOptions.method || 'GET';
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const headers = new Headers(suppliedHeaders);
  if (requestOptions.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  // If no accessToken is explicitly provided, fetch valid token from sessionStorage
  const token = accessToken !== undefined ? accessToken : getValidAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    recordActivity();
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...requestOptions, headers });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Network request failed';
    const apiError = new ApiError(`Could not reach the KyU Connect server for ${method} ${endpoint}. ${detail}`, 0, null, undefined, endpoint, method);
    console.error('[KyU API network error]', apiError);
    throw apiError;
  }

  if (response.status === 401 && (token || getRefreshToken())) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      headers.set('Authorization', `Bearer ${refreshedToken}`);
      try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...requestOptions, headers });
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'Network request failed';
        throw new ApiError(`Could not reach the KyU Connect server for ${method} ${endpoint}. ${detail}`, 0, null, undefined, endpoint, method);
      }
    } else {
      // Refresh failed; purge session to prevent repeating 401 errors
      clearSession('unauthorized');
    }
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    if (response.status === 401) {
      clearSession('unauthorized');
    }
    const apiError = new ApiError(body?.message || `Request failed with HTTP ${response.status}.`, response.status, body?.errors ?? null, body?.requestId, endpoint, method);
    console.error('[KyU API error]', { endpoint, method, status: response.status, requestId: body?.requestId, code: body?.code, errors: body?.errors, message: apiError.message });
    throw apiError;
  }
  return body as ApiEnvelope<T>;
}

// ----------------------------------------------------
// Health
// ----------------------------------------------------
export function getApiHealth() {
  return apiRequest<{ service: string; status: string; timestamp: string; environment: string }>('/health');
}

// ----------------------------------------------------
// Auth
// ----------------------------------------------------
export function registerApi(data: Record<string, unknown>) {
  return apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export function loginApi(credentials: { email: string; password: string }) {
  return apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
}

export function logoutApi() {
  return apiRequest<null>('/auth/logout', { method: 'POST' });
}

export function forgotPasswordApi(email: string) {
  return apiRequest<null>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export function getMeApi() {
  return apiRequest<any>('/auth/me');
}

// ----------------------------------------------------
// Users & Profile
// ----------------------------------------------------
export function getProfileApi(id: string) {
  return apiRequest<any>(`/users/${id}`);
}

export function updateMeApi(profileData: Record<string, unknown>) {
  return apiRequest<any>('/users/me', { method: 'PATCH', body: JSON.stringify(profileData) });
}

export function getSettingsApi() {
  return apiRequest<any>('/users/me/settings');
}

export function updateSettingsApi(settings: Record<string, boolean>) {
  return apiRequest<any>('/users/me/settings', { method: 'PATCH', body: JSON.stringify(settings) });
}

export function toggleFollowUserApi(id: string, isFollowed: boolean) {
  return apiRequest<{ followed: boolean }>(`/users/${id}/follow`, { method: isFollowed ? 'DELETE' : 'POST' });
}

// ----------------------------------------------------
// Posts & Social Feed
// ----------------------------------------------------
export function getPostsApi(params?: { category?: string; sort?: string; cursor?: string }) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.cursor) query.set('cursor', params.cursor);
  return apiRequest<any[]>(`/posts?${query.toString()}`);
}

export function createPostApi(post: { body: string; category?: string; type?: string; media_url?: string; media_type?: string }) {
  return apiRequest<any>('/posts', { method: 'POST', body: JSON.stringify(post) });
}

export function togglePostReactionApi(postId: string) {
  return apiRequest<{ liked: boolean }>(`/posts/${postId}/reactions`, { method: 'POST' });
}

export function togglePostBookmarkApi(postId: string) {
  return apiRequest<{ saved: boolean }>(`/posts/${postId}/bookmarks`, { method: 'POST' });
}

export function getPostCommentsApi(postId: string) {
  return apiRequest<any[]>(`/posts/${postId}/comments`);
}

export function addPostCommentApi(postId: string, text: string) {
  return apiRequest<any>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
}

export function getTrendingTagsApi() {
  return apiRequest<{ tag: string; count: string }[]>('/posts/trending');
}

// ----------------------------------------------------
// Community Issues
// ----------------------------------------------------
export function getIssuesApi(params?: { category?: string; status?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  return apiRequest<any[]>(`/issues?${query.toString()}`);
}

export function createIssueApi(issueData: Record<string, unknown>) {
  return apiRequest<any>('/issues', { method: 'POST', body: JSON.stringify(issueData) });
}

export function getConfidentialIssuesApi() {
  return apiRequest<any[]>('/issues/mine/confidential');
}

export function toggleIssueSupportApi(issueId: string) {
  return apiRequest<{ supported: boolean }>(`/issues/${issueId}/support`, { method: 'POST' });
}

export function toggleIssueFollowApi(issueId: string) {
  return apiRequest<{ followed: boolean }>(`/issues/${issueId}/follow`, { method: 'POST' });
}

export function addIssueCommentApi(issueId: string, text: string) {
  return apiRequest<any>(`/issues/${issueId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
}

export function getIssueHistoryApi(issueId: string) {
  return apiRequest<any[]>(`/issues/${issueId}/history`);
}

// ----------------------------------------------------
// Marketplace & Businesses
// ----------------------------------------------------
export function getBusinessesApi(params?: { category?: string; studentOnly?: boolean; sort?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.studentOnly) query.set('studentOnly', 'true');
  if (params?.sort) query.set('sort', params.sort);
  if (params?.search) query.set('search', params.search);
  return apiRequest<any[]>(`/marketplace?${query.toString()}`);
}

export function createBusinessApi(businessData: Record<string, unknown>) {
  return apiRequest<any>('/marketplace', { method: 'POST', body: JSON.stringify(businessData) });
}

export function getBusinessByIdApi(id: string) {
  return apiRequest<any>(`/marketplace/${id}`);
}

export function toggleSaveBusinessApi(id: string) {
  return apiRequest<{ isSaved: boolean }>(`/marketplace/${id}/save`, { method: 'POST' });
}

// ----------------------------------------------------
// Articles & Blogs
// ----------------------------------------------------
export function getArticlesApi(params?: { category?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  return apiRequest<any[]>(`/articles?${query.toString()}`);
}

export function createArticleApi(articleData: Record<string, unknown>) {
  return apiRequest<any>('/articles', { method: 'POST', body: JSON.stringify(articleData) });
}

export function getArticleDraftsApi() {
  return apiRequest<any[]>('/articles/drafts');
}

export function deleteArticleDraftApi(id: string) {
  return apiRequest<null>(`/articles/drafts/${id}`, { method: 'DELETE' });
}

export function getArticleByIdApi(id: string) {
  return apiRequest<any>(`/articles/${id}`);
}

export function toggleArticleLikeApi(id: string) {
  return apiRequest<{ liked: boolean }>(`/articles/${id}/like`, { method: 'POST' });
}

export function addArticleCommentApi(id: string, text: string) {
  return apiRequest<any>(`/articles/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
}

// ----------------------------------------------------
// Opportunities
// ----------------------------------------------------
export function getOpportunitiesApi(params?: { type?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.search) query.set('search', params.search);
  return apiRequest<any[]>(`/opportunities?${query.toString()}`);
}

export function createOpportunityApi(data: Record<string, unknown>) {
  return apiRequest<any>('/opportunities', { method: 'POST', body: JSON.stringify(data) });
}

// ----------------------------------------------------
// Accommodation
// ----------------------------------------------------
export function getAccommodationsApi(params?: { place?: string; budget?: string; type?: string; facility?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.place) query.set('place', params.place);
  if (params?.budget) query.set('budget', params.budget);
  if (params?.type) query.set('type', params.type);
  if (params?.facility) query.set('facility', params.facility);
  if (params?.search) query.set('search', params.search);
  return apiRequest<any[]>(`/accommodation?${query.toString()}`);
}

export function createAccommodationApi(data: Record<string, unknown>) {
  return apiRequest<any>('/accommodation', { method: 'POST', body: JSON.stringify(data) });
}

// ----------------------------------------------------
// Events
// ----------------------------------------------------
export function getEventsApi(params?: { category?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  return apiRequest<any[]>(`/events?${query.toString()}`);
}

export function createEventApi(data: Record<string, unknown>) {
  return apiRequest<any>('/events', { method: 'POST', body: JSON.stringify(data) });
}

export function toggleEventAttendApi(id: string) {
  return apiRequest<{ isInterested: boolean }>(`/events/${id}/attend`, { method: 'POST' });
}

export function toggleEventSaveApi(id: string) {
  return apiRequest<{ isSaved: boolean }>(`/events/${id}/save`, { method: 'POST' });
}

// ----------------------------------------------------
// Lost & Found
// ----------------------------------------------------
export function getLostFoundApi(params?: { status?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  return apiRequest<any[]>(`/lost-found?${query.toString()}`);
}

export function createLostFoundApi(data: Record<string, unknown>) {
  return apiRequest<any>('/lost-found', { method: 'POST', body: JSON.stringify(data) });
}

// ----------------------------------------------------
// Communities
// ----------------------------------------------------
export function getCommunitiesApi(search?: string) {
  return apiRequest<any[]>(`/communities${search ? `?search=${encodeURIComponent(search)}` : ''}`);
}

export function toggleJoinCommunityApi(id: string) {
  return apiRequest<{ isJoined: boolean }>(`/communities/${id}/join`, { method: 'POST' });
}

// ----------------------------------------------------
// Messages
// ----------------------------------------------------
export function getConversationsApi() {
  return apiRequest<any[]>('/messages/conversations');
}

export function startConversationApi(recipientId: string) {
  return apiRequest<any>('/messages/conversations', { method: 'POST', body: JSON.stringify({ recipientId }) });
}

export function getMessagesApi(convId: string) {
  return apiRequest<any[]>(`/messages/${convId}`);
}

export function sendMessageApi(convId: string, payload: { body?: string; attachment_url?: string }) {
  return apiRequest<any>(`/messages/${convId}`, { method: 'POST', body: JSON.stringify(payload) });
}

// ----------------------------------------------------
// Notifications
// ----------------------------------------------------
export function getNotificationsApi() {
  return apiRequest<any[]>('/notifications');
}

export function markNotificationReadApi(id: string) {
  return apiRequest<any>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsReadApi() {
  return apiRequest<null>('/notifications/read-all', { method: 'POST' });
}

// ----------------------------------------------------
// Global Search
// ----------------------------------------------------
export function globalSearchApi(query: string) {
  return apiRequest<{ title: string; detail: string; kind: string; path: string }[]>(`/search?q=${encodeURIComponent(query)}`);
}

// ----------------------------------------------------
// Direct Upload Signature
// ----------------------------------------------------
export function getUploadSignatureApi(payload: { purpose: string; mimeType: string; sizeBytes: number }) {
  return apiRequest<{ bucket: string; path: string; signedUrl: string; token: string }>('/uploads/sign', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function uploadPostMediaApi(file: File): Promise<{ media_url: string; media_type: 'image' | 'video' }> {
  const form = new FormData();
  form.append('file', file);
  const token = getValidAuthToken();
  const response = await fetch(`${API_BASE_URL}/uploads/media`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (response.status === 401) {
    clearSession('unauthorized');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw new Error(result?.message || 'Media upload failed.');
  return result.data;
}

// ----------------------------------------------------
// Admin & Moderation
// ----------------------------------------------------
export function getAdminOverviewApi() {
  return apiRequest<{ label: string; value: string }[]>('/admin/overview');
}

export function getModerationQueueApi() {
  return apiRequest<any[]>('/admin/queue');
}

export function updateModerationStatusApi(id: string, status: string) {
  return apiRequest<any>(`/admin/queue/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function reportContentApi(report: { target_type: string; target_id: string; reason: string }) {
  return apiRequest<any>('/admin/report', { method: 'POST', body: JSON.stringify(report) });
}
