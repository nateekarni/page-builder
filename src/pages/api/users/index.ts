/**
 * Users API — List & Create
 *
 * GET  /api/users → list all users (admin only)
 * POST /api/users → create new user (admin only)
 *
 * Clean Code: thin controller — validate → delegate → respond.
 */

import type { APIRoute } from 'astro';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createAuth } from '../../../../auth';
import { logActivity } from '@/lib/activity-log';

const createUserSchema = z.object({
  name: z.string().min(1, 'ชื่อห้ามว่าง'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  role: z.enum(['admin', 'editor', 'author']).default('author'),
});

export const GET: APIRoute = async ({ locals }) => {
  try {
    const users = await locals.db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
    }).from(user);

    return Response.json({ success: true, data: users });
  } catch (error) {
    console.error('[Users API] List error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = createUserSchema.parse(await request.json());
    const auth = createAuth(locals.runtime.env.DB);

    // Use Better Auth to create user (handles password hashing)
    const result = await auth.api.signUpEmail({
      body: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    });

    if (!result) {
      return Response.json({ success: false, error: 'ไม่สามารถสร้างผู้ใช้ได้' }, { status: 400 });
    }

    // Update role if not default
    if (body.role !== 'author') {
      await locals.db
        .update(user)
        .set({ role: body.role })
        .where(eq(user.email, body.email));
    }

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'create',
      entityType: 'user',
      entityId: body.email,
      metadata: { name: body.name, role: body.role },
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Users API] Create error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
