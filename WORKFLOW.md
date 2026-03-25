# HomeGuard Application Workflow

This document describes the canonical workflow for the HomeGuard inspection and property management app.

## Role summary

| Role       | Description |
| ---------- | ----------- |
| **Owner** | Registers properties and creates inspection requests (schedules) for their own properties. |
| **Admin** | Manages the platform: assigns inspection requests to inspectors, approves inspectors, manages owners and packages. |
| **Inspector** | Performs inspections assigned by admin and records results. |

## Step-by-step workflow

1. **Owner adds property**  
   Only owners can add properties. From the Properties screen, an owner adds their property (address, optional coordinates).

2. **Owner creates inspection request (job)**  
   From the Inspections screen, the owner clicks “Schedule inspection” and selects their property, an inspection package, and date. This creates an **inspection schedule** (the owner’s “job” request). Backend enforces that the schedule is for the current owner.

3. **Admin assigns inspector**  
   From the Job tickets screen, the admin selects an unassigned schedule and an inspector, then creates a **job ticket**. This assigns that inspection request to the inspector.

4. **Inspector performs inspection**  
   The inspector sees their assigned job tickets and can create an **inspection** (start/end time, status) from the Job tickets or Inspections screen. Optionally they add evidence, red flags, and reports.

5. **Notifications (optional)**  
   When a job is assigned, the inspector can be notified. When an inspection is completed, the owner can be notified.

## UI entry points

- **Owner**: Dashboard → Properties (add property); Inspections → “Schedule inspection” (create job/schedule).
- **Admin**: Dashboard → Job tickets → “Create ticket” (assign schedule to inspector); Inspectors (approve/reject); Owners; Services (packages).
- **Inspector**: Dashboard → Job tickets (view assigned); “Create inspection” from a job ticket or from Inspections.

## Backend flow

- **POST /properties** – Owner only; creates property for current user.
- **POST /inspection/schedules** – Owner (own schedules only) or admin; creates inspection schedule.
- **POST /inspection/jobtickets** – Admin only; assigns a schedule to an inspector.
- **POST /inspection/inspections** – Admin or inspector; creates inspection for a job ticket.

See [backend/HomeGuard_Database_Design.md](backend/HomeGuard_Database_Design.md) for the full data model.
