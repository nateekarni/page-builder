globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_CD2jnfAQ.mjs';
import { $ as $$AdminLayout } from '../chunks/AdminLayout_CooD1Pxy.mjs';
import { a as sql, p as pages, m as media, u as user, f as formSubmissions, b as activityLog } from '../chunks/schema_HDzOIqy1.mjs';
/* empty css                                 */
import { e as eq } from '../chunks/conditions_Dv2B9G-F.mjs';
import { d as desc } from '../chunks/select_dqRfph0M.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://page-builder-1tl.pages.dev/");
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const db = Astro2.locals.db;
  const [pageCount, mediaCount, userCount, formCount, recentActivity] = await Promise.all([
    db.select({ count: sql`count(*)` }).from(pages).then((r) => r[0]?.count ?? 0),
    db.select({ count: sql`count(*)` }).from(media).then((r) => r[0]?.count ?? 0),
    db.select({ count: sql`count(*)` }).from(user).then((r) => r[0]?.count ?? 0),
    db.select({ count: sql`count(*)` }).from(formSubmissions).then((r) => r[0]?.count ?? 0),
    db.select({
      id: activityLog.id,
      action: activityLog.action,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      metadata: activityLog.metadata,
      createdAt: activityLog.createdAt,
      userName: user.name
    }).from(activityLog).leftJoin(user, eq(activityLog.userId, user.id)).orderBy(desc(activityLog.createdAt)).limit(15)
  ]);
  const stats = [
    {
      label: "\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E27\u0E47\u0E1A",
      count: pageCount,
      icon: "\u{1F4C4}",
      color: "#3B82F6",
      href: "/admin/pages"
    },
    {
      label: "\u0E2A\u0E37\u0E48\u0E2D",
      count: mediaCount,
      icon: "\u{1F5BC}\uFE0F",
      color: "#8B5CF6",
      href: "/admin/media"
    },
    {
      label: "\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49",
      count: userCount,
      icon: "\u{1F465}",
      color: "#10B981",
      href: "/admin/users"
    },
    {
      label: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1F\u0E2D\u0E23\u0E4C\u0E21",
      count: formCount,
      icon: "\u{1F4CB}",
      color: "#F59E0B",
      href: "/admin/forms"
    }
  ];
  const actionLabels = {
    create: "\u0E2A\u0E23\u0E49\u0E32\u0E07",
    update: "\u0E41\u0E01\u0E49\u0E44\u0E02",
    delete: "\u0E25\u0E1A",
    publish: "\u0E40\u0E1C\u0E22\u0E41\u0E1E\u0E23\u0E48",
    login: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A",
    logout: "\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A",
    upload: "\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14",
    settings_update: "\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32",
    restore: "\u0E01\u0E39\u0E49\u0E04\u0E37\u0E19"
  };
  const entityLabels = {
    page: "\u0E2B\u0E19\u0E49\u0E32",
    media: "\u0E2A\u0E37\u0E48\u0E2D",
    user: "\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49",
    settings: "\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32",
    template: "\u0E40\u0E17\u0E21\u0E40\u0E1E\u0E25\u0E15",
    form_submission: "\u0E1F\u0E2D\u0E23\u0E4C\u0E21",
    ab_test: "A/B Test"
  };
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "\u0E41\u0E14\u0E0A\u0E1A\u0E2D\u0E23\u0E4C\u0E14", "activeNav": "dashboard", "data-astro-cid-u2h3djql": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="stats-grid" data-astro-cid-u2h3djql> ${stats.map((s) => renderTemplate`<a${addAttribute(s.href, "href")} class="stat-card" data-astro-cid-u2h3djql> <div class="stat-icon"${addAttribute(`background: ${s.color}15; color: ${s.color}`, "style")} data-astro-cid-u2h3djql> ${s.icon} </div> <div class="stat-info" data-astro-cid-u2h3djql> <span class="stat-count" data-astro-cid-u2h3djql>${s.count}</span> <span class="stat-label" data-astro-cid-u2h3djql>${s.label}</span> </div> </a>`)} </div>  <div class="quick-actions" data-astro-cid-u2h3djql> <a href="/admin/pages/new" class="action-btn primary" data-astro-cid-u2h3djql>+ สร้างหน้าใหม่</a> <a href="/admin/media" class="action-btn secondary" data-astro-cid-u2h3djql>อัปโหลดสื่อ</a> </div>  <div class="activity-section" data-astro-cid-u2h3djql> <h2 class="section-title" data-astro-cid-u2h3djql>กิจกรรมล่าสุด</h2> <div class="activity-list" data-astro-cid-u2h3djql> ${recentActivity.length === 0 ? renderTemplate`<div class="activity-empty" data-astro-cid-u2h3djql>ยังไม่มีกิจกรรม</div>` : recentActivity.map((a) => renderTemplate`<div class="activity-item" data-astro-cid-u2h3djql> <div class="activity-dot" data-astro-cid-u2h3djql></div> <div class="activity-content" data-astro-cid-u2h3djql> <span class="activity-user" data-astro-cid-u2h3djql>${a.userName ?? "System"}</span> <span class="activity-action" data-astro-cid-u2h3djql> ${actionLabels[a.action] ?? a.action} </span> <span class="activity-entity" data-astro-cid-u2h3djql> ${entityLabels[a.entityType] ?? a.entityType} </span> ${a.entityId && renderTemplate`<span class="activity-id" data-astro-cid-u2h3djql>#${a.entityId.slice(0, 8)}</span>`} </div> <time class="activity-time" data-astro-cid-u2h3djql> ${a.createdAt ? new Date(a.createdAt).toLocaleString("th-TH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : ""} </time> </div>`)} </div> </div> ` })} `;
}, "D:/Projects/portfolio-builder/src/pages/admin/index.astro", void 0);

const $$file = "D:/Projects/portfolio-builder/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
