

# School Bus Tracking System — Implementation Plan

## Overview
A web-based school bus tracking application with three role-based interfaces: **Admin Dashboard**, **Parent Portal**, and **Driver Panel**. This phase focuses on building a complete UI prototype with mock data.

---

## Page 1: Authentication & Role-Based Routing
- **Login page** with username/password fields
- Role selection (Admin, Parent, Driver) — simulated login
- Automatic redirect to the appropriate dashboard based on role
- Clean, school-themed design with a bus illustration/icon

## Page 2: Admin Dashboard
- **Overview cards**: Total buses, active trips, total students, total drivers
- **Live bus map** (placeholder map showing bus positions with markers)
- **Recent activity feed**: trip starts, alerts, messages
- **Sidebar navigation**: Dashboard, Buses, Drivers, Parents, Students, Routes, Messages, Bus Fare, Reports, Settings

## Page 3: Admin — Bus Management
- Table listing all buses: bus name, registration number, assigned driver, route, status
- Add/edit bus dialog with form fields
- Assign driver to bus

## Page 4: Admin — Driver Management
- Table of all drivers: name, phone, email, assigned bus, duty status
- Add/edit driver dialog
- View driver details and trip history

## Page 5: Admin — Student & Parent Management
- **Parents tab**: List of parents with name, phone, email, number of children
- **Students tab**: List of students with name, class/standard, parent, assigned bus, pickup/drop location
- Add/edit forms for both

## Page 6: Admin — Route Management
- List of routes with source, destination, stops, assigned bus
- Add/edit route with stop points
- Placeholder map showing route visualization

## Page 7: Admin — Messages
- Inbox/sent messaging interface
- Send messages to individual or all drivers/parents
- Emergency broadcast option
- Message read status indicators

## Page 8: Admin — Bus Fare
- Table showing students, fare amount, payment status, reminder status
- Filter by paid/unpaid
- Send payment reminder action

## Page 9: Admin — Reports
- Trip reports: bus, driver, start/end time, date
- Driver attendance summary
- Student attendance summary
- Charts using Recharts (trips per bus, attendance trends)

## Page 10: Parent Portal — Home
- **Bus location map** (placeholder) showing current bus position and ETA
- Trip status: "In Progress" / "Completed" / "Not Started"
- Notification banner for recent alerts
- Bottom/side navigation: Home, Trip Details, My Children, Messages, Profile

## Page 11: Parent Portal — Trip Details
- Bus information: number, registration, route
- Driver information: name, ID, phone
- List of stops with estimated times

## Page 12: Parent Portal — My Children
- List of children with name, class, pickup/drop location
- Mark child as absent for a day
- Edit pickup/drop location

## Page 13: Parent Portal — Messages & Notifications
- View notifications (trip started, bus nearby, bus arrived at school)
- Send message / report issue to admin
- Notification history list

## Page 14: Parent Portal — Profile & Payment
- Edit parent profile: name, phone, address
- Payment section: view bus fare, payment status, pay button (mock)

## Page 15: Driver Panel — Home
- Current route with navigation guidance (placeholder map)
- List of upcoming stops with student names
- On-duty / Off-duty toggle
- Current trip status indicator

## Page 16: Driver Panel — Trip & Messages
- Trip details: route, bus info, passenger list
- Mark students as picked up / dropped off
- Send messages to admin
- View notifications (route changes, absent students)

---

## Design & UX
- Clean, modern UI using shadcn/ui components
- Color scheme: Blue primary (trust/safety), with role-based accent colors
- Responsive layout optimized for desktop (admin) and tablet-friendly (driver/parent)
- Consistent sidebar navigation for admin, bottom nav for parent/driver views
- Toast notifications for alerts and actions

## Data Architecture (Mock)
- Mock data files for: buses, drivers, parents, students, routes, trips, messages, fares
- Follows the database schema from the uploaded diagram
- State management via React context for role/auth simulation

