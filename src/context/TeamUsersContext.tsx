import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { DOCUMENT_USERS } from '../lib/documentUsers';

export type TeamUser = { name: string; email: string };

const defaultTeamUsers: TeamUser[] = DOCUMENT_USERS.map((user) => ({ ...user }));

const TeamUsersContext = createContext<TeamUser[]>(defaultTeamUsers);

export function TeamUsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<TeamUser[]>(defaultTeamUsers);

  useEffect(() => {
    let cancelled = false;
    void api
      .listUsers()
      .then(({ users: fromApi }) => {
        if (cancelled || !fromApi?.length) return;
        setUsers(
          fromApi.map((user) => ({
            name: user.name,
            email: user.email,
          })),
        );
      })
      .catch(() => {
        /* keep bundled defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => users, [users]);
  return <TeamUsersContext.Provider value={value}>{children}</TeamUsersContext.Provider>;
}

export function useTeamUsers() {
  return useContext(TeamUsersContext);
}
