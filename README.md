Based on the code structure and files you provided, here is a comprehensive README.md tailored specifically for the Stolarija BM project.

Stolarija BM 🪑

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
