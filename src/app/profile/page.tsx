"use client"

import Counter from "@/features/profile/components/Counter";
import LineChart from "@/features/profile/components/LineChart";
import PokemonsList from "@/features/profile/components/PokemonsList";

export const ProfilePage = () => {
  return (
    <div className="p-4">
      <h1>Profile</h1>
      <LineChart />
      <Counter />
      <PokemonsList />
    </div>
  );
};

export default ProfilePage
