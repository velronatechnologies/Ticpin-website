import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, type UserProfile } from '@/lib/api/profile';
import { toast } from '@/components/ui/Toast';

export const useProfile = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) return null;
            try {
                const profile = await profileApi.getProfile(userId);
                if (!profile) {
                    // Return dummy profile if not found, as per current logic
                    return { userId, phone: userId, name: 'Member' } as UserProfile;
                }
                return profile;
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                toast.error('Could not load profile details. Showing default details.');
                return { userId, phone: userId, name: 'Member' } as UserProfile;
            }
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string, data: Partial<UserProfile> }) =>
            profileApi.updateProfile(userId, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
        },
    });
};

export const useUploadPhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, file }: { userId: string, file: File }) =>
            profileApi.uploadPhoto(userId, file),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
        },
    });
};
