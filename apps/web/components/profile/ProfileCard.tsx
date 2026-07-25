"use client";

import { User } from "@/types";
import { getFlagEmoji, getCountryName } from "@/lib/utils";

interface ProfileCardProps {
  user: User;
  isOwn?: boolean;
}

export default function ProfileCard({ user, isOwn = false }: ProfileCardProps) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
      <div className="gradient-bg h-24 relative">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-dark-800 border-4 border-dark-800 flex items-center justify-center text-3xl font-bold gradient-bg">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="pt-14 pb-6 px-6 text-center">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-400 text-sm mt-1">
          {getFlagEmoji(user.country)} {getCountryName(user.country)} • {user.age} years
        </p>

        {user.bio && <p className="text-gray-300 text-sm mt-3">{user.bio}</p>}

        {user.interests.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {user.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{user.credits}</p>
            <p className="text-xs text-gray-500">Credits</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-secondary">{user.friends.length}</p>
            <p className="text-xs text-gray-500">Friends</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary-light">
              {user.isPremium ? "⭐" : "—"}
            </p>
            <p className="text-xs text-gray-500">Premium</p>
          </div>
        </div>
      </div>
    </div>
  );
}
