import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    // Dump user table
    const { results: users } = await db.prepare('SELECT * FROM user').all();
    
    // Dump account table
    const { results: accounts } = await db.prepare('SELECT * FROM account').all();
    
    // Check table info
    const { results: userTableInfo } = await db.prepare('PRAGMA table_info(user)').all();
    const { results: accountTableInfo } = await db.prepare('PRAGMA table_info(account)').all();

    return Response.json({
      users,
      accounts,
      schema: {
        user: userTableInfo,
        account: accountTableInfo,
      }
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
