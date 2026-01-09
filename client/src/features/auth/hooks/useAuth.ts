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
  SendOtpRequest,
  VerifyOtpRequest,
  UpdateProfileRequest,
} from "@mytudo/shared";

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

  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOtp,
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      queryClient.setQueryData(["user", "me"], data.user);
    },
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

  const sendOtp = async (data: SendOtpRequest) => {
    await sendOtpMutation.mutateAsync(data);
  };

  const verifyOtp = async (data: VerifyOtpRequest) => {
    await verifyOtpMutation.mutateAsync(data);
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
    sendOtp,
    verifyOtp,
    updateProfile,
    logout,
    sendOtpError: sendOtpMutation.error,
    verifyOtpError: verifyOtpMutation.error,
    isSendOtpPending: sendOtpMutation.isPending,
    isVerifyOtpPending: verifyOtpMutation.isPending,
    isUpdateProfilePending: updateProfileMutation.isPending,
  };
}

// Re-export selectors for components that only need partial state
export {
  useIsAuthenticated,
  useUser,
  useAuthLoading,
} from "../../../stores/auth.store";
