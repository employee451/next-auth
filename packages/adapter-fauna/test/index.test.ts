import {
  FaunaAdapter,
  format,
  userFields,
  sessionFields,
  verificationTokenFields,
} from "../src"
import { runBasicTests } from "utils/adapter"
import { Client, fql } from "fauna"

import type {
  FaunaUser,
  FaunaAccount,
  FaunaSession,
  FaunaVerificationToken,
} from "../src"

const client = new Client({
  secret: "secret",
  endpoint: new URL("http://localhost:8443"),
})

const adapter = FaunaAdapter(client)

runBasicTests({
  adapter,
  db: {
    disconnect: async () => client.close(),
    user: async (id) => {
      const response = await client.query<FaunaUser>(
        fql`User.byId(${id}) { ${userFields} }`
      )
      return format.from(response.data)
    },
    async session(sessionToken) {
      const response = await client.query<FaunaSession>(
        fql`Session.bySessionToken(${sessionToken}).first() { ${sessionFields} }`
      )
      return format.from(response.data)
    },
    async account({ provider, providerAccountId }) {
      const response = await client.query<FaunaAccount>(fql`
        Account.byProviderAndProviderAccountId(${provider}, ${providerAccountId}).first() {
          access_token,
          expires_at,
          id_token,
          provider,
          providerAccountId,
          refresh_token,
          scope,
          session_state,
          token_type,
          type,
          userId
        }
      `)
      return format.from(response.data)
    },
    async verificationToken({ identifier, token }) {
      const response = await client.query<FaunaVerificationToken>(
        fql`VerificationToken.byIdentifierAndToken(${identifier}, ${token}).first() { ${verificationTokenFields} }`
      )
      return format.from(response.data)
    },
  },
})
