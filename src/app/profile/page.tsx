"use client"

import Counter from "@/features/profile/components/Counter"
import PokemonsList from "@/features/profile/components/PokemonsList"

const ProfilePage = () => {
  return (
    <>
      <h1>Profile</h1>
      <Counter />
      <PokemonsList />
    </>
  )
}

export default ProfilePage
