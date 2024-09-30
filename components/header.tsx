'use client'

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Header() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const response = await fetch('/api/user', { method: 'GET' });
      if (response.ok) {
        router.refresh();
      } else {
        console.error('Failed to create user profile');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100">
      <Link href="/" className="text-2xl font-bold">
        Emoj maker
      </Link>
      <nav>
        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.firstName || user.username}!</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="flex gap-2">
            <SignInButton mode="modal">
              <Button variant="outline" onClick={handleSignIn}>Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Sign Up</Button>
            </SignUpButton>
          </div>
        )}
      </nav>
    </header>
  );
}