import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../api/auth.api";
import {
  useAuthStore,
  useIsAuthenticated,
  useUser,
  useAuthLoading,
} from "../../../stores/auth.store";
import type {
  LoginWithEmailRequest,
  RegisterWithEmailRequest,
  SendMagicLinkRequest,
  UpdateProfileRequest,
} from "@/shared";

/**
 * Custom hook for authentication operations
 * Combines Zustand for state management with React Query for data fetching
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const { setUser, setTokens, clearAuth, setLoading, hydrateFromStorage } =
    useAuthStore();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const isLoading = useAuthLoading();

  // Hydrate auth state from storage on mount
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Fetch current user when authenticated
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: authApi.getMe,
    enabled: isAuthenticated && !user,
    retry: false,
  });

  // Sync user data from React Query to Zustand
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData, setUser]);

  // Update loading state
  useEffect(() => {
    if (isAuthenticated && isUserLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isUserLoading, setLoading]);

  const loginWithEmailMutation = useMutation({
    mutationFn: authApi.loginWithEmail,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      queryClient.setQueryData(["user", "me"], data.user);
    },
  });

  const registerWithEmailMutation = useMutation({
    mutationFn: authApi.registerWithEmail,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      queryClient.setQueryData(["user", "me"], data.user);
    },
  });

  const sendMagicLinkMutation = useMutation({
    mutationFn: authApi.sendMagicLink,
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(["user", "me"], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
    onError: () => {
      // Clear auth even if logout fails on server
      clearAuth();
      queryClient.clear();
    },
  });

  const loginWithEmail = async (data: LoginWithEmailRequest) => {
    await loginWithEmailMutation.mutateAsync(data);
  };

  const registerWithEmail = async (data: RegisterWithEmailRequest) => {
    await registerWithEmailMutation.mutateAsync(data);
  };

  const sendMagicLink = async (data: SendMagicLinkRequest) => {
    await sendMagicLinkMutation.mutateAsync(data);
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isUserLoading,
    loginWithEmail,
    registerWithEmail,
    sendMagicLink,
    updateProfile,
    logout,
    loginWithEmailError: loginWithEmailMutation.error,
    registerWithEmailError: registerWithEmailMutation.error,
    sendMagicLinkError: sendMagicLinkMutation.error,
    isLoginWithEmailPending: loginWithEmailMutation.isPending,
    isRegisterWithEmailPending: registerWithEmailMutation.isPending,
    isSendMagicLinkPending: sendMagicLinkMutation.isPending,
    isUpdateProfilePending: updateProfileMutation.isPending,
  };
}

// Re-export selectors for components that only need partial state
export {
  useIsAuthenticated,
  useUser,
  useAuthLoading,
} from "../../../stores/auth.store";
