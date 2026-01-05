declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: 'user' | 'admin';
      authMethod: 'oauth' | 'local' | 'ldap';
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: 'user' | 'admin';
    authMethod: 'oauth' | 'local' | 'ldap';
  }

  interface Profile {
    email_verified?: boolean;
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
    avatar_url?: string;
    login?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'user' | 'admin';
    authMethod: 'oauth' | 'local' | 'ldap';
  }
}
