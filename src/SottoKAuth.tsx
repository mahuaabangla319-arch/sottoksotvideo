import { ClerkProvider, SignInButton, SignUpButton, UserButton, OrganizationSwitcher, SignedIn, SignedOut, useOrganization } from '@clerk/clerk-react'

// SottoK Org ID - org_3ME0kDKsx1fnSt5C2f2TWSemQTW - Do Not Delete Old Code
export function SottoKHeader() {
  const { organization } = useOrganization()
  const isAdmin = organization?.membership?.role === 'org:admin'
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <SignedOut>
        <SignInButton mode="modal"><button>Login - Phone / Google / GitHub</button></SignInButton>
        <SignUpButton mode="modal"><button>Sign Up</button></SignUpButton>
      </SignedOut>
      <SignedIn>
        <OrganizationSwitcher />
        {isAdmin && <button style={{ background: 'red', color: 'white' }}>Admin Panel</button>}
        <UserButton />
      </SignedIn>
    </div>
  )
}

export function SottoKWrap({ children }: { children: any }) {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  )
}