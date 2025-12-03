"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Sparkles, User, Save, Camera } from "lucide-react";
import { api } from "~/trpc/react";
import { useSession, signIn } from "next-auth/react";
import { getUserAvatar } from "~/lib/avatar";
import { UploadButton } from "~/lib/uploadthing";

const FALLBACK_AVATAR = "/default-avatar.svg";

export default function Profile() {
  const { status } = useSession();
  const utils = api.useUtils();

  const { data: profile, isLoading } = api.profile.getMyProfile.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
      });
    }
  }, [profile]);

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      void utils.profile.getMyProfile.invalidate();
    },
  });

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="p-8 text-center max-w-md">
          <User className="w-16 h-16 text-coral mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-4">Sign in to view your profile</h2>
          <Button
            onClick={() => signIn()}
            className="bg-coral hover:bg-coral/90 text-white rounded-full"
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const avatarUrl = getUserAvatar(profile?.image, profile?.avatarUrl);

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-coral/10 px-4 py-2 rounded-full mb-4">
            <User className="w-5 h-5 text-coral" />
            <span className="font-semibold text-coral">Your Profile</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-2">
            Hey, {profile?.name?.split(" ")[0] ?? "Friend"}! 👋
          </h1>
          <p className="text-xl text-gray-600">Make your profile shine</p>
        </motion.div>

        {/* Avatar section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 mb-6 text-center bg-gradient-to-br from-soft-pink to-white">
            <div className="relative inline-block mb-4">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl bg-soft-pink"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-coral text-white p-2 rounded-full shadow-lg">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {profile?.avatarUrl && profile.avatarUrl !== "/default-avatar.svg"
                ? "Your custom profile photo"
                : "Upload a photo to personalize your profile!"}
            </p>

            <UploadButton
              endpoint="profileImage"
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) {
                  updateProfile.mutate({ avatarUrl: res[0].url });
                }
              }}
              onUploadError={(error: Error) => {
                alert(`Upload failed: ${error.message}`);
              }}
              appearance={{
                button: "bg-coral hover:bg-coral/90 text-white rounded-full px-6 py-2 text-sm font-medium",
                allowedContent: "text-xs text-gray-500",
              }}
            />
          </Card>
        </motion.div>

        {/* Profile form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-charcoal font-semibold mb-2">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-charcoal font-semibold mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="location" className="text-charcoal font-semibold mb-2">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-charcoal font-semibold mb-2">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell people what makes you, you! Your hobbies, what you're looking for in a friend, fun facts..."
                  className="min-h-[120px] text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="w-full bg-coral hover:bg-coral/90 text-white rounded-full py-6 text-lg"
              >
                {updateProfile.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quiz status */}
        {profile?.quizCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card className="p-6 bg-green-50 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-charcoal">Quiz Completed!</div>
                  <div className="text-sm text-gray-600">
                    You&apos;re all set to find amazing matches
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
