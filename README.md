**Stolarija BM 🪑**

A modern, full-stack web application for a custom furniture manufacturing business. This project serves as a digital portfolio, a web shop for products, and includes a fully functional administrative dashboard for managing inventory, orders, and customer messages.

Built with Next.js (App Router), TypeScript, and Supabase.

✨ Key Features

Modern UI/UX: Responsive design with smooth animations using Framer Motion.

Product Catalog: Browse furniture categories (Kitchens, Kids' Rooms, Furniture, Closets).

Advanced Filtering: Filter products by category and price range; sort by popularity, price, or date (powered by Redux).

Direct Ordering: Users can order products directly via a streamlined purchase modal.

Contact System: Integrated contact form with success/error handling and Google Maps integration.

Company Info: "About Us" section detailing history and machinery/tools.

Secure Authentication: Protected admin routes using NextAuth.js.

Dashboard Overview: Quick stats on orders and messages.

Order Management: View, update status (In Progress, Done, Waiting), and delete customer orders.

Product Management (CMS): Full CRUD capabilities. Add, edit, or delete products and upload images directly to Supabase Storage.

Message Inbox: Read and manage inquiries from the contact form.

🛠️ Tech Stack

Frontend:

Next.js (App Router)

TypeScript

Tailwind CSS & SCSS Modules

Framer Motion (Animations)

Redux Toolkit (State Management for filters)

NextUI & MUI (UI Components)

Backend & Database:

Supabase (PostgreSQL Database, Storage, Auth Helper)

NextAuth.js (Admin Session Management)

Resend (Email Service)

🪵 Slat-wall tool (owner only)

`/admin/lamele` is an internal tool for parametric slat walls. It sits behind the same admin login as `/admin`, is hidden from the public site (no links, `noindex`), and can be installed as an app from the browser ("Install app" / "Add to Home Screen").

Workflow: load an STL/OBJ (or the built-in sample) → set wall size, slat thickness, gap, direction and depth → check the 3D preview → set sheet size, edge margin and router-bit spacing → download a ZIP with one DXF per sheet plus a PDF assembly guide and cut list.

How it works (all in the browser, nothing is uploaded):
- `src/lib/slatwall/heightmap.ts` rasterises the model into a front depth map.
- `src/lib/slatwall/slice.ts` turns each slat strip of the depth map into a closed profile (straight back edge, optional batten notches, relief front edge) and splits slats longer than a sheet into A/B parts.
- `src/lib/slatwall/nest.ts` packs profiles on sheets with a skyline nester; parts keep the grain direction and may be rotated 180° so a relief edge drops into the part below.
- `src/lib/slatwall/dxf.ts` writes DXF R12 in mm with layers `REZ` (cut outlines), `OZNAKE` (part numbers) and `PLOCA` (sheet outline, reference only).
- `src/lib/slatwall/pdf.ts` builds the guide (overview, mounting positions, cut list, one page per sheet).
