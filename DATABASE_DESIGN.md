# Simbahan — MongoDB Database Design Document

**App:** Simbahan (Catholic Parish Management App)  
**Database:** MongoDB  
**Stack:** Node.js + Express + Mongoose  
**Version:** 1.0.0  
**Date:** 2026-04-11

---

## Table of Contents

1. [Overview](#overview)
2. [Collections Summary](#collections-summary)
3. [Collection Schemas](#collection-schemas)
   - [1. users](#1-users)
   - [2. churches](#2-churches)
   - [3. families](#3-families)
   - [4. dependents](#4-dependents)
   - [5. ministries](#5-ministries)
   - [6. announcements](#6-announcements)
   - [7. announcement_reads](#7-announcement_reads)
   - [8. events](#8-events)
   - [9. event_rsvps](#9-event_rsvps)
   - [10. mass_schedules](#10-mass_schedules)
   - [11. confession_schedules](#11-confession_schedules)
   - [12. donations](#12-donations)
   - [13. donation_funds](#13-donation_funds)
   - [14. sacrament_requests](#14-sacrament_requests)
   - [15. liturgical_calendar](#15-liturgical_calendar)
   - [16. scripture_readings](#16-scripture_readings)
   - [17. novenas](#17-novenas)
   - [18. novena_progress](#18-novena_progress)
   - [19. simbang_gabi_attendance](#19-simbang_gabi_attendance)
   - [20. notifications](#20-notifications)
   - [21. bookmarks](#21-bookmarks)
4. [Relationships Diagram](#relationships-diagram)
5. [Indexes](#indexes)
6. [API Endpoints](#api-endpoints)
   - [Auth](#auth)
   - [Users / Profile](#users--profile)
   - [Churches](#churches)
   - [Families](#families)
   - [Dependents](#dependents)
   - [Ministries](#ministries)
   - [Announcements](#announcements)
   - [Events](#events)
   - [Mass Schedule](#mass-schedule)
   - [Confession Schedule](#confession-schedule)
   - [Donations](#donations)
   - [Sacrament Requests](#sacrament-requests)
   - [Liturgical Calendar](#liturgical-calendar)
   - [Scripture Readings](#scripture-readings)
   - [Novenas](#novenas)
   - [Simbang Gabi](#simbang-gabi)
   - [Notifications](#notifications)
   - [Bookmarks](#bookmarks)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Enums Reference](#enums-reference)

---

## Overview

Simbahan is a Catholic parish management and community engagement mobile app for Filipino communities. It supports:

- Parish news and announcements
- Mass and confession schedules
- Event management with RSVP
- Sacrament request workflows
- Donation tracking and fundraising
- Liturgical calendar and daily scripture readings
- Novena and prayer tracking
- Simbang Gabi (Dawn Mass) attendance
- Family and ministry management
- Multi-language support (Filipino / English)

The MongoDB database is organized into **21 collections** covering all app features.

---

## Collections Summary

| # | Collection | Purpose | Estimated Records |
|---|-----------|---------|------------------|
| 1 | `users` | Parish members and accounts | High |
| 2 | `churches` | Parish master data | Low (one per install) |
| 3 | `families` | Family units | Medium |
| 4 | `dependents` | Non-account family members | Medium |
| 5 | `ministries` | Ministry definitions | Low |
| 6 | `announcements` | Parish announcements | Medium |
| 7 | `announcement_reads` | Read-status tracking per user | High |
| 8 | `events` | Parish events | Medium |
| 9 | `event_rsvps` | Per-user RSVP responses | High |
| 10 | `mass_schedules` | Weekly mass time slots | Low |
| 11 | `confession_schedules` | Priest confession availability | Low |
| 12 | `donations` | Individual donation records | High |
| 13 | `donation_funds` | Fundraising campaigns | Low |
| 14 | `sacrament_requests` | Sacrament request workflow | Medium |
| 15 | `liturgical_calendar` | Church seasons by year | Low |
| 16 | `scripture_readings` | Daily Bible readings | Medium |
| 17 | `novenas` | Novena definitions with prayers | Low |
| 18 | `novena_progress` | Per-user novena day tracking | Medium |
| 19 | `simbang_gabi_attendance` | Dawn mass attendance tracker | Medium |
| 20 | `notifications` | In-app and push notifications | High |
| 21 | `bookmarks` | User-saved content | Medium |

---

## Collection Schemas

---

### 1. `users`

Stores all registered parish members and staff accounts.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `firstName` | String | Yes | First name |
| `lastName` | String | Yes | Last name |
| `email` | String | Yes | Unique login email |
| `password` | String | Yes | Bcrypt-hashed password |
| `phone` | String | No | Mobile number |
| `birthDate` | Date | No | Date of birth |
| `gender` | String | No | `"male"` or `"female"` |
| `barangay` | String | No | Home barangay/district |
| `address` | String | No | Full home address |
| `avatar` | String | No | Profile photo URL |
| `role` | String | Yes | `"member"`, `"coordinator"`, `"priest"`, `"admin"` |
| `familyId` | ObjectId | No | Reference → `families._id` |
| `ministryIds` | [ObjectId] | No | Array of refs → `ministries._id` |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `joinedDate` | Date | No | Date joined the parish |
| `isActive` | Boolean | Yes | Account active status |
| `directoryVisible` | Boolean | Yes | Show in parish directory |
| `language` | String | Yes | `"Filipino"` or `"English"` |
| `textSize` | String | Yes | `"Small"`, `"Normal"`, `"Large"` |
| `notifPrefs` | Object | No | Notification preferences (see below) |
| `notifPrefs.announcements` | Boolean | Yes | Receive announcement notifications |
| `notifPrefs.events` | Boolean | Yes | Receive event notifications |
| `notifPrefs.sacraments` | Boolean | Yes | Receive sacrament notifications |
| `notifPrefs.dailyReadings` | Boolean | Yes | Receive daily reading notifications |
| `notifPrefs.fastingReminders` | Boolean | Yes | Receive fasting reminder notifications |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:** `email` (unique), `churchId`, `familyId`

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "firstName": "Maria",
  "lastName": "Santos",
  "email": "maria.santos@email.com",
  "password": "$2b$10$hashedpassword",
  "phone": "+639171234567",
  "birthDate": "1990-05-15",
  "gender": "female",
  "barangay": "San Isidro",
  "address": "123 Rizal St, San Isidro",
  "avatar": "https://cdn.simbahan.app/avatars/maria.jpg",
  "role": "member",
  "familyId": "64a1b2c3d4e5f6a7b8c9d0e2",
  "ministryIds": ["64a1b2c3d4e5f6a7b8c9d0e3"],
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "joinedDate": "2023-01-15",
  "isActive": true,
  "directoryVisible": true,
  "language": "Filipino",
  "textSize": "Normal",
  "notifPrefs": {
    "announcements": true,
    "events": true,
    "sacraments": true,
    "dailyReadings": false,
    "fastingReminders": true
  },
  "createdAt": "2023-01-15T08:00:00Z",
  "updatedAt": "2026-04-01T10:30:00Z"
}
```

---

### 2. `churches`

Stores parish/church master information. Typically one document per deployed instance.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Full parish name |
| `patron` | String | Yes | Patron saint name |
| `diocese` | String | Yes | Diocese name |
| `address` | String | Yes | Street address |
| `barangay` | String | Yes | Barangay/district |
| `city` | String | Yes | City/municipality |
| `province` | String | Yes | Province |
| `zipCode` | String | No | ZIP/postal code |
| `phone` | String | Yes | Parish phone number |
| `email` | String | Yes | Parish email |
| `website` | String | No | Parish website URL |
| `feastDay` | String | Yes | Patron feast day (e.g. `"June 29"`) |
| `founded` | Number | No | Year established |
| `image` | String | No | Church photo URL |
| `officeHours` | String | No | Office hours description |
| `pastorId` | ObjectId | No | Reference → `users._id` (priest role) |
| `socialLinks` | Object | No | Social media links |
| `socialLinks.facebook` | String | No | Facebook page URL |
| `socialLinks.youtube` | String | No | YouTube channel URL |
| `socialLinks.instagram` | String | No | Instagram handle URL |
| `bankDetails` | Object | No | Bank transfer information |
| `bankDetails.bankName` | String | No | Bank name |
| `bankDetails.accountName` | String | No | Account name |
| `bankDetails.accountNumber` | String | No | Account number |
| `gcash` | Object | No | GCash payment details |
| `gcash.number` | String | No | GCash number |
| `gcash.name` | String | No | GCash registered name |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e4",
  "name": "Saint Peter the Apostle Parish",
  "patron": "Saint Peter the Apostle",
  "diocese": "Diocese of Malolos",
  "address": "Mabini St., Brgy. Poblacion",
  "barangay": "Poblacion",
  "city": "Meycauayan",
  "province": "Bulacan",
  "zipCode": "3020",
  "phone": "(044) 123-4567",
  "email": "parish@stpeter.ph",
  "website": "https://stpeter.ph",
  "feastDay": "June 29",
  "founded": 1890,
  "image": "https://cdn.simbahan.app/churches/stpeter.jpg",
  "officeHours": "Monday–Friday: 8AM–5PM, Saturday: 8AM–12PM",
  "pastorId": "64a1b2c3d4e5f6a7b8c9d0e5",
  "socialLinks": {
    "facebook": "https://facebook.com/stpeterparish",
    "youtube": "https://youtube.com/@stpeterparish",
    "instagram": "https://instagram.com/stpeterparish"
  },
  "bankDetails": {
    "bankName": "BDO",
    "accountName": "Saint Peter Parish",
    "accountNumber": "001234567890"
  },
  "gcash": {
    "number": "09171234567",
    "name": "Saint Peter Parish"
  },
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2026-04-01T00:00:00Z"
}
```

---

### 3. `families`

Represents a household/family unit within the parish.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `familyName` | String | Yes | Family surname or household name |
| `headId` | ObjectId | Yes | Reference → `users._id` (head of family) |
| `memberIds` | [ObjectId] | No | Array of refs → `users._id` |
| `barangay` | String | No | Barangay/district |
| `address` | String | No | Family home address |
| `weddingDate` | Date | No | Marriage date (if applicable) |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `isActive` | Boolean | Yes | Family active in parish |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
  "familyName": "Santos Family",
  "headId": "64a1b2c3d4e5f6a7b8c9d0e6",
  "memberIds": [
    "64a1b2c3d4e5f6a7b8c9d0e1",
    "64a1b2c3d4e5f6a7b8c9d0e6"
  ],
  "barangay": "San Isidro",
  "address": "123 Rizal St, San Isidro",
  "weddingDate": "2015-06-29",
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "isActive": true,
  "createdAt": "2023-01-15T08:00:00Z",
  "updatedAt": "2026-04-01T10:30:00Z"
}
```

---

### 4. `dependents`

Non-account family members (children, elderly parents) added by a registered user.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Full name of dependent |
| `relationship` | String | Yes | `"Anak"`, `"Magulang"`, `"Kapatid"`, `"Lolo/Lola"`, `"Apo"`, `"Iba pa"` |
| `birthday` | Date | No | Date of birth |
| `familyId` | ObjectId | Yes | Reference → `families._id` |
| `addedById` | ObjectId | Yes | Reference → `users._id` (who added this dependent) |
| `createdAt` | Date | Auto | Record creation timestamp |

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e7",
  "name": "Juan Santos Jr.",
  "relationship": "Anak",
  "birthday": "2018-03-10",
  "familyId": "64a1b2c3d4e5f6a7b8c9d0e2",
  "addedById": "64a1b2c3d4e5f6a7b8c9d0e6",
  "createdAt": "2024-01-20T10:00:00Z"
}
```

---

### 5. `ministries`

Parish ministry groups that members can join.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Ministry name |
| `description` | String | No | What the ministry does |
| `coordinatorId` | ObjectId | No | Reference → `users._id` |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `isActive` | Boolean | Yes | Ministry currently active |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
  "name": "Youth Ministry",
  "description": "Parish youth group for ages 13–35 focused on faith formation and community service.",
  "coordinatorId": "64a1b2c3d4e5f6a7b8c9d0e8",
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

**Default Ministries:**
- Basic Ecclesial Community
- Youth Ministry
- Choir
- Lectors & Commentators
- Extraordinary Ministers of Holy Communion
- Knights of Columbus
- Legion of Mary
- Couples for Christ
- Parish Pastoral Council

---

### 6. `announcements`

Parish bulletins and news announcements.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `title` | String | Yes | Announcement headline |
| `description` | String | Yes | Full announcement body |
| `category` | String | Yes | `"Mass"`, `"Event"`, `"Sacrament"`, `"Youth"`, `"Ministry"` |
| `image` | String | No | Banner image URL |
| `isPinned` | Boolean | Yes | Pinned to top of list |
| `authorId` | ObjectId | Yes | Reference → `users._id` |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `publishedAt` | Date | Yes | When to show this announcement |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:** `churchId`, `publishedAt`, `isPinned`, `category`

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e9",
  "title": "Holy Week Schedule 2026",
  "description": "Our parish Holy Week celebrations begin on Palm Sunday, April 5...",
  "category": "Mass",
  "image": "https://cdn.simbahan.app/announcements/holyweek2026.jpg",
  "isPinned": true,
  "authorId": "64a1b2c3d4e5f6a7b8c9d0e5",
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "publishedAt": "2026-03-25T00:00:00Z",
  "createdAt": "2026-03-24T15:00:00Z",
  "updatedAt": "2026-03-24T15:00:00Z"
}
```

---

### 7. `announcement_reads`

Tracks which users have read which announcements (for unread badge counts).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | Yes | Reference → `users._id` |
| `announcementId` | ObjectId | Yes | Reference → `announcements._id` |
| `readAt` | Date | Yes | Timestamp when marked as read |

**Indexes:** `userId + announcementId` (compound unique)

---

### 8. `events`

Parish events and activities with optional RSVP.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `title` | String | Yes | Event name |
| `description` | String | Yes | Full event description |
| `startDate` | Date | Yes | Event start date and time |
| `endDate` | Date | No | Event end date and time (multi-day) |
| `location` | String | Yes | Venue or place |
| `category` | String | Yes | `"Liturgical"`, `"Youth"`, `"Fiesta"`, `"Sacraments"`, `"Outreach"` |
| `image` | String | No | Event banner URL |
| `rsvpEnabled` | Boolean | Yes | Whether RSVP is open |
| `rsvpCount` | Number | Auto | Total RSVP count (cached) |
| `organizerId` | ObjectId | Yes | Reference → `users._id` |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:** `churchId`, `startDate`, `category`

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0f1",
  "title": "Parish Fiesta 2026",
  "description": "Join us in celebrating the feast day of our patron saint...",
  "startDate": "2026-06-29T08:00:00Z",
  "endDate": "2026-06-29T22:00:00Z",
  "location": "Parish Grounds",
  "category": "Fiesta",
  "image": "https://cdn.simbahan.app/events/fiesta2026.jpg",
  "rsvpEnabled": true,
  "rsvpCount": 142,
  "organizerId": "64a1b2c3d4e5f6a7b8c9d0e5",
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "createdAt": "2026-04-01T00:00:00Z",
  "updatedAt": "2026-04-10T12:00:00Z"
}
```

---

### 9. `event_rsvps`

Stores each user's RSVP response for an event.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `eventId` | ObjectId | Yes | Reference → `events._id` |
| `userId` | ObjectId | Yes | Reference → `users._id` |
| `status` | String | Yes | `"Pupunta"` (Yes), `"Baka"` (Maybe), `"Hindi"` (No) |
| `createdAt` | Date | Auto | When RSVP was submitted |
| `updatedAt` | Date | Auto | When RSVP was last changed |

**Indexes:** `eventId + userId` (compound unique), `eventId`

---

### 10. `mass_schedules`

Weekly mass time slots for the parish.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `day` | String | Yes | `"Sunday"` through `"Saturday"` |
| `dayIndex` | Number | Yes | `0` (Sunday) to `6` (Saturday) |
| `slots` | [Object] | Yes | Array of mass time slots |
| `slots[].time` | String | Yes | Time string (e.g. `"6:00 AM"`) |
| `slots[].language` | String | Yes | `"Filipino"`, `"English"`, `"Latin"` |
| `slots[].notes` | String | No | Additional notes for this slot |
| `updatedAt` | Date | Auto | Last update timestamp |

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0f2",
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "day": "Sunday",
  "dayIndex": 0,
  "slots": [
    { "time": "6:00 AM", "language": "Filipino", "notes": "" },
    { "time": "8:00 AM", "language": "Filipino", "notes": "Family Mass" },
    { "time": "10:00 AM", "language": "English", "notes": "" },
    { "time": "12:00 PM", "language": "Filipino", "notes": "" },
    { "time": "5:00 PM", "language": "Filipino", "notes": "Youth Mass" }
  ],
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

### 11. `confession_schedules`

Scheduled confession/reconciliation slots with priest assignments.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `day` | String | Yes | Day of week (e.g. `"Saturday"`) |
| `timeRange` | String | Yes | Time range (e.g. `"3:00 PM – 5:00 PM"`) |
| `priestId` | ObjectId | No | Reference → `users._id` (priest) |
| `isActive` | Boolean | Yes | Slot currently active |
| `updatedAt` | Date | Auto | Last update timestamp |

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0f3",
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "day": "Saturday",
  "timeRange": "3:00 PM – 5:00 PM",
  "priestId": "64a1b2c3d4e5f6a7b8c9d0e5",
  "isActive": true,
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

### 12. `donations`

Individual donation transaction records.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `memberId` | ObjectId | Yes | Reference → `users._id` |
| `fundId` | ObjectId | Yes | Reference → `donation_funds._id` |
| `amount` | Number | Yes | Donation amount |
| `currency` | String | Yes | Currency code (default `"PHP"`) |
| `method` | String | Yes | `"cash"`, `"gcash"`, `"bank_transfer"` |
| `isAnonymous` | Boolean | Yes | Hide donor name in reports |
| `notes` | String | No | Donor's personal note |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `verifiedById` | ObjectId | No | Reference → `users._id` (admin who verified) |
| `donatedAt` | Date | Yes | Date and time of donation |
| `createdAt` | Date | Auto | Record creation timestamp |

**Indexes:** `memberId`, `fundId`, `churchId`, `donatedAt`

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0f4",
  "memberId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "fundId": "64a1b2c3d4e5f6a7b8c9d0f5",
  "amount": 500,
  "currency": "PHP",
  "method": "gcash",
  "isAnonymous": false,
  "notes": "Para sa kapwa natin",
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "verifiedById": "64a1b2c3d4e5f6a7b8c9d0e8",
  "donatedAt": "2026-04-05T14:30:00Z",
  "createdAt": "2026-04-05T14:31:00Z"
}
```

---

### 13. `donation_funds`

Fundraising campaigns and collection categories.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `title` | String | Yes | Fund name |
| `description` | String | Yes | Purpose of this fund |
| `goal` | Number | No | Target amount in PHP |
| `collected` | Number | Yes | Total collected so far (cached) |
| `startDate` | Date | Yes | Campaign start date |
| `endDate` | Date | No | Campaign end date (null = ongoing) |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `isActive` | Boolean | Yes | Fund currently accepting donations |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0f5",
  "title": "Building Fund",
  "description": "Support the renovation of our parish church roof and bell tower.",
  "goal": 2000000,
  "collected": 875000,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": null,
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2026-04-11T00:00:00Z"
}
```

---

### 14. `sacrament_requests`

Requests for sacramental services with a status workflow.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `type` | String | Yes | `"baptism"`, `"marriage"`, `"confirmation"`, `"anointing"`, `"funeral"`, `"other"` |
| `memberId` | ObjectId | Yes | Reference → `users._id` (requester) |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `status` | String | Yes | `"submitted"`, `"pending"`, `"approved"`, `"confirmed"`, `"rejected"` |
| `preferredDate` | Date | No | Requested date for the sacrament |
| `notes` | String | No | Additional notes from requester |
| `assignedPriestId` | ObjectId | No | Reference → `users._id` (assigned priest) |
| `details` | Object | No | Type-specific fields (see below) |
| `details.childName` | String | No | *(Baptism)* Name of child |
| `details.parentNames` | String | No | *(Baptism)* Names of parents |
| `details.spouseName` | String | No | *(Marriage)* Name of spouse |
| `details.patientName` | String | No | *(Anointing)* Name of patient |
| `details.location` | String | No | *(Anointing)* Location of patient |
| `details.urgency` | String | No | *(Anointing)* `"urgent"` or `"scheduled"` |
| `details.deceasedName` | String | No | *(Funeral)* Name of deceased |
| `details.contact` | String | No | Contact number for coordination |
| `submittedAt` | Date | Yes | When the request was submitted |
| `updatedAt` | Date | Auto | Last status update timestamp |

**Status Flow:** `submitted` → `pending` → `approved` → `confirmed`  
**Rejection:** Any status can move to `rejected`

**Indexes:** `memberId`, `churchId`, `status`, `type`

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0f6",
  "type": "baptism",
  "memberId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "status": "approved",
  "preferredDate": "2026-05-10T09:00:00Z",
  "notes": "Please confirm one week before the date.",
  "assignedPriestId": "64a1b2c3d4e5f6a7b8c9d0e5",
  "details": {
    "childName": "Gabriel Santos",
    "parentNames": "Juan Santos & Maria Santos",
    "contact": "+639171234567"
  },
  "submittedAt": "2026-04-01T08:00:00Z",
  "updatedAt": "2026-04-05T10:00:00Z"
}
```

---

### 15. `liturgical_calendar`

Defines the Catholic liturgical seasons for each year.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `season` | String | Yes | `"advent"`, `"christmas"`, `"lent"`, `"easter"`, `"pentecost"`, `"ordinary"` |
| `name` | String | Yes | Display name |
| `startDate` | Date | Yes | Season start date |
| `endDate` | Date | Yes | Season end date |
| `color` | String | Yes | Liturgical color (hex, e.g. `"#742121"` for purple) |
| `description` | String | No | Season meaning/description |
| `year` | Number | Yes | Liturgical year |

**Indexes:** `year`, `startDate`, `endDate`

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0f7",
  "season": "lent",
  "name": "Lenten Season",
  "startDate": "2026-02-18T00:00:00Z",
  "endDate": "2026-04-04T00:00:00Z",
  "color": "#742121",
  "description": "A season of penance, prayer, and preparation for Easter.",
  "year": 2026
}
```

---

### 16. `scripture_readings`

Daily liturgical Bible readings (First Reading, Psalm, Second Reading, Gospel).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `date` | Date | Yes | Calendar date (unique, indexed) |
| `season` | String | Yes | Liturgical season name |
| `weekday` | String | Yes | Day name (e.g. `"Palm Sunday"`) |
| `title` | String | Yes | Special title if applicable |
| `firstReading` | Object | Yes | First reading data |
| `firstReading.book` | String | Yes | Book of the Bible |
| `firstReading.reference` | String | Yes | Chapter and verse (e.g. `"Acts 10:34-38"`) |
| `firstReading.text` | String | Yes | Full reading text |
| `psalm` | Object | Yes | Responsorial psalm |
| `psalm.reference` | String | Yes | Psalm reference |
| `psalm.response` | String | Yes | Congregational response |
| `secondReading` | Object | No | Second reading (Sundays/Solemnities only) |
| `secondReading.book` | String | No | Book of the Bible |
| `secondReading.reference` | String | No | Chapter and verse |
| `secondReading.text` | String | No | Full reading text |
| `gospel` | Object | Yes | Gospel reading |
| `gospel.book` | String | Yes | Gospel book (Matthew/Mark/Luke/John) |
| `gospel.reference` | String | Yes | Chapter and verse |
| `gospel.text` | String | Yes | Full gospel text |

**Indexes:** `date` (unique)

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0f8",
  "date": "2026-04-05T00:00:00Z",
  "season": "lent",
  "weekday": "Palm Sunday",
  "title": "Palm Sunday of the Lord's Passion",
  "firstReading": {
    "book": "Isaiah",
    "reference": "Isaiah 50:4-7",
    "text": "The Lord God has given me a well-trained tongue..."
  },
  "psalm": {
    "reference": "Psalm 22:8-9, 17-18, 19-20, 23-24",
    "response": "My God, my God, why have you abandoned me?"
  },
  "secondReading": {
    "book": "Philippians",
    "reference": "Philippians 2:6-11",
    "text": "Christ Jesus, though he was in the form of God..."
  },
  "gospel": {
    "book": "Luke",
    "reference": "Luke 22:14—23:56",
    "text": "When the hour came, Jesus took his place at table..."
  }
}
```

---

### 17. `novenas`

Novena prayer definitions with all daily prayers embedded.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `title` | String | Yes | Novena name |
| `patron` | String | Yes | Saint or devotion this novena is for |
| `feastDate` | String | No | Feast day (e.g. `"June 29"`) |
| `duration` | Number | Yes | Number of days (usually 9) |
| `description` | String | Yes | Brief introduction to the novena |
| `image` | String | No | Novena banner image URL |
| `churchId` | ObjectId | No | Reference → `churches._id` (null = global) |
| `prayers` | [Object] | Yes | Array of daily prayers |
| `prayers[].day` | Number | Yes | Day number (1–9) |
| `prayers[].title` | String | Yes | Title for this day's prayer |
| `prayers[].prayer` | String | Yes | Full prayer text |
| `isActive` | Boolean | Yes | Available to users |
| `createdAt` | Date | Auto | Record creation timestamp |

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0f9",
  "title": "Novena to Our Lady of Perpetual Help",
  "patron": "Our Lady of Perpetual Help",
  "feastDate": "June 27",
  "duration": 9,
  "description": "A nine-day prayer asking for Mary's intercession...",
  "image": "https://cdn.simbahan.app/novenas/oloph.jpg",
  "churchId": null,
  "prayers": [
    {
      "day": 1,
      "title": "Day 1 – Trust in Mary",
      "prayer": "O Mother of Perpetual Help, grant me ever to be able to call upon thy powerful name..."
    }
  ],
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00Z"
}
```

---

### 18. `novena_progress`

Tracks which days of a novena each user has completed.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | Yes | Reference → `users._id` |
| `novenaId` | ObjectId | Yes | Reference → `novenas._id` |
| `completedDays` | [Number] | Yes | Array of day numbers completed (e.g. `[1, 2, 3]`) |
| `startedAt` | Date | Yes | When user started this novena |
| `updatedAt` | Date | Auto | Last progress update |

**Indexes:** `userId + novenaId` (compound unique)

---

### 19. `simbang_gabi_attendance`

Tracks a user's Simbang Gabi (9-day dawn mass before Christmas) attendance each year.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | Yes | Reference → `users._id` |
| `churchId` | ObjectId | Yes | Reference → `churches._id` |
| `year` | Number | Yes | Year (e.g. `2025`) |
| `attendedDays` | [Number] | Yes | Days attended (1–9) |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:** `userId + year` (compound unique), `churchId`

**Example Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d100",
  "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "churchId": "64a1b2c3d4e5f6a7b8c9d0e4",
  "year": 2025,
  "attendedDays": [1, 2, 3, 5, 7, 9],
  "updatedAt": "2025-12-24T05:30:00Z"
}
```

---

### 20. `notifications`

In-app and push notification records per user.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | Yes | Reference → `users._id` |
| `type` | String | Yes | `"announcement"`, `"event"`, `"sacrament"`, `"reading"`, `"general"` |
| `title` | String | Yes | Notification title |
| `body` | String | Yes | Notification message body |
| `refId` | ObjectId | No | Reference to related document |
| `refModel` | String | No | Collection name of ref (e.g. `"announcements"`) |
| `isRead` | Boolean | Yes | Whether user has read this notification |
| `sentAt` | Date | Yes | When notification was delivered |
| `createdAt` | Date | Auto | Record creation timestamp |

**Indexes:** `userId`, `isRead`, `sentAt`

---

### 21. `bookmarks`

User-saved/favorited content items.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | Yes | Reference → `users._id` |
| `refId` | ObjectId | Yes | ID of the bookmarked document |
| `refModel` | String | Yes | Collection name (e.g. `"announcements"`, `"novenas"`, `"events"`) |
| `createdAt` | Date | Auto | When bookmark was saved |

**Indexes:** `userId`, `userId + refId + refModel` (compound unique)

---

## Relationships Diagram

```
churches
    │
    ├── users (many)
    │     ├── families (one)
    │     │     └── dependents (many)
    │     ├── ministries (many-to-many via users.ministryIds)
    │     ├── donations (many)
    │     ├── sacrament_requests (many)
    │     ├── novena_progress (many)
    │     ├── simbang_gabi_attendance (many)
    │     ├── announcement_reads (many)
    │     ├── event_rsvps (many)
    │     ├── notifications (many)
    │     └── bookmarks (many)
    │
    ├── announcements (many)
    ├── events (many)
    │     └── event_rsvps (many)
    ├── mass_schedules (7, one per day)
    ├── confession_schedules (many)
    ├── donation_funds (many)
    │     └── donations (many)
    ├── sacrament_requests (many)
    ├── liturgical_calendar (many, by year)
    ├── scripture_readings (many, by date)
    └── novenas (many)
          └── novena_progress (many, per user)
```

---

## Indexes

| Collection | Index | Type | Notes |
|-----------|-------|------|-------|
| `users` | `email` | Unique | Login lookup |
| `users` | `churchId` | Regular | Directory filtering |
| `users` | `familyId` | Regular | Family member lookup |
| `announcements` | `churchId, publishedAt` | Compound | Feed queries |
| `announcements` | `isPinned` | Regular | Pinned filter |
| `announcement_reads` | `userId, announcementId` | Unique | Prevent duplicate reads |
| `events` | `churchId, startDate` | Compound | Upcoming events |
| `events` | `category` | Regular | Category filter |
| `event_rsvps` | `eventId, userId` | Unique | One RSVP per user per event |
| `donations` | `memberId` | Regular | Member history |
| `donations` | `fundId` | Regular | Fund totals |
| `sacrament_requests` | `memberId, status` | Compound | Status tracking |
| `scripture_readings` | `date` | Unique | Daily lookup |
| `liturgical_calendar` | `year, startDate` | Compound | Season lookup |
| `novena_progress` | `userId, novenaId` | Unique | One progress per user per novena |
| `simbang_gabi_attendance` | `userId, year` | Unique | One record per user per year |
| `notifications` | `userId, isRead` | Compound | Unread count |
| `bookmarks` | `userId, refId, refModel` | Unique | No duplicate bookmarks |

---

## API Endpoints

> **Base URL:** `https://api.simbahan.app/v1`  
> **Auth:** Bearer JWT token in `Authorization` header (except public routes)  
> **Format:** All requests and responses use `application/json`

---

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register a new user account |
| `POST` | `/auth/login` | Public | Login with email + password, returns JWT |
| `POST` | `/auth/logout` | Auth | Logout and invalidate token |
| `POST` | `/auth/refresh` | Auth | Refresh expired JWT token |
| `POST` | `/auth/join-church` | Auth | Link user account to a parish |

**POST /auth/register — Request Body:**
```json
{
  "firstName": "Maria",
  "lastName": "Santos",
  "email": "maria@email.com",
  "password": "securepassword123",
  "phone": "+639171234567"
}
```

**POST /auth/login — Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "firstName": "Maria", "role": "member" }
}
```

---

### Users / Profile

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/users/me` | Auth | Get own full profile |
| `PUT` | `/users/me` | Auth | Update own profile fields |
| `GET` | `/users` | Auth | List parish directory (`?barangay=&ministry=&search=`) |
| `GET` | `/users/:id` | Auth | Get a member's public profile |
| `DELETE` | `/users/me` | Auth | Delete own account |

---

### Churches

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/churches/:id` | Public | Get parish information |
| `PUT` | `/churches/:id` | Admin | Update parish info |

---

### Families

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/families` | Auth | List all families in parish |
| `GET` | `/families/:id` | Auth | Get family details |
| `POST` | `/families` | Auth | Create a new family |
| `PUT` | `/families/:id` | Auth | Update family info |
| `POST` | `/families/:id/invite` | Auth | Invite another member to family |

---

### Dependents

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/families/:id/dependents` | Auth | List all dependents of a family |
| `POST` | `/families/:id/dependents` | Auth | Add a dependent to family |
| `PUT` | `/families/:id/dependents/:depId` | Auth | Update dependent info |
| `DELETE` | `/families/:id/dependents/:depId` | Auth | Remove a dependent |

**POST /families/:id/dependents — Request Body:**
```json
{
  "name": "Juan Jr.",
  "relationship": "Anak",
  "birthday": "2018-03-10"
}
```

---

### Ministries

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/ministries` | Auth | List all active ministries |
| `POST` | `/ministries` | Admin | Create a new ministry |
| `PUT` | `/ministries/:id` | Admin | Update ministry details |
| `DELETE` | `/ministries/:id` | Admin | Deactivate a ministry |
| `POST` | `/users/me/ministries/:id` | Auth | Join a ministry |
| `DELETE` | `/users/me/ministries/:id` | Auth | Leave a ministry |

---

### Announcements

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/announcements` | Auth | List announcements (`?category=Mass&pinned=true&page=1&limit=20`) |
| `GET` | `/announcements/:id` | Auth | Get single announcement |
| `POST` | `/announcements` | Admin/Coordinator | Create announcement |
| `PUT` | `/announcements/:id` | Admin/Coordinator | Update announcement |
| `DELETE` | `/announcements/:id` | Admin | Delete announcement |
| `POST` | `/announcements/:id/read` | Auth | Mark announcement as read |
| `GET` | `/announcements/unread-count` | Auth | Get count of unread announcements |

**GET /announcements — Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | String | Filter by category |
| `pinned` | Boolean | Show only pinned |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 20) |

---

### Events

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/events` | Auth | List events (`?category=Youth&upcoming=true&page=1`) |
| `GET` | `/events/:id` | Auth | Get event detail |
| `POST` | `/events` | Admin | Create event |
| `PUT` | `/events/:id` | Admin | Update event |
| `DELETE` | `/events/:id` | Admin | Delete event |
| `GET` | `/events/:id/rsvp` | Auth | Get my RSVP status for an event |
| `POST` | `/events/:id/rsvp` | Auth | Submit or update RSVP |
| `DELETE` | `/events/:id/rsvp` | Auth | Cancel RSVP |

**POST /events/:id/rsvp — Request Body:**
```json
{
  "status": "Pupunta"
}
```

---

### Mass Schedule

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/mass-schedule` | Public | Get full weekly mass schedule |
| `GET` | `/mass-schedule/:day` | Public | Get schedule for a specific day |
| `PUT` | `/mass-schedule/:day` | Admin | Update a day's mass schedule |

---

### Confession Schedule

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/confession-schedule` | Public | List all active confession slots |
| `POST` | `/confession-schedule` | Admin | Add a confession slot |
| `PUT` | `/confession-schedule/:id` | Admin | Update a confession slot |
| `DELETE` | `/confession-schedule/:id` | Admin | Remove a confession slot |

---

### Donations

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/donations` | Auth | Get my donation history |
| `POST` | `/donations` | Auth | Submit a donation record |
| `GET` | `/donations/funds` | Public | List all active donation funds |
| `GET` | `/donations/funds/:id` | Public | Get fund details and progress |
| `POST` | `/donations/funds` | Admin | Create a new fund |
| `PUT` | `/donations/funds/:id` | Admin | Update fund info |
| `DELETE` | `/donations/funds/:id` | Admin | Close/deactivate a fund |

**POST /donations — Request Body:**
```json
{
  "fundId": "64a1b2c3d4e5f6a7b8c9d0f5",
  "amount": 500,
  "method": "gcash",
  "isAnonymous": false,
  "notes": "Para sa simbahan"
}
```

---

### Sacrament Requests

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/sacraments` | Auth | List my sacrament requests |
| `GET` | `/sacraments/all` | Admin/Priest | List all requests (`?status=pending&type=baptism`) |
| `POST` | `/sacraments` | Auth | Submit a new sacrament request |
| `GET` | `/sacraments/:id` | Auth | Get request detail |
| `PUT` | `/sacraments/:id/status` | Admin/Priest | Update request status |
| `PUT` | `/sacraments/:id/assign` | Admin | Assign priest to request |

**POST /sacraments — Request Body (Baptism example):**
```json
{
  "type": "baptism",
  "preferredDate": "2026-05-10",
  "notes": "Please confirm one week before.",
  "details": {
    "childName": "Gabriel Santos",
    "parentNames": "Juan & Maria Santos",
    "contact": "+639171234567"
  }
}
```

**PUT /sacraments/:id/status — Request Body:**
```json
{
  "status": "approved"
}
```

---

### Liturgical Calendar

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/liturgical-calendar` | Public | Get all seasons (`?year=2026`) |
| `GET` | `/liturgical-calendar/today` | Public | Get current liturgical season |
| `POST` | `/liturgical-calendar` | Admin | Add a season entry |
| `PUT` | `/liturgical-calendar/:id` | Admin | Update a season entry |

---

### Scripture Readings

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/readings/today` | Public | Get today's readings |
| `GET` | `/readings/:date` | Public | Get readings for a specific date (`YYYY-MM-DD`) |
| `POST` | `/readings` | Admin | Add a day's readings |
| `PUT` | `/readings/:id` | Admin | Update readings for a date |

---

### Novenas

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/novenas` | Auth | List all available novenas |
| `GET` | `/novenas/:id` | Auth | Get novena with all daily prayers |
| `POST` | `/novenas` | Admin | Create a new novena |
| `PUT` | `/novenas/:id` | Admin | Update novena info or prayers |
| `DELETE` | `/novenas/:id` | Admin | Deactivate a novena |
| `GET` | `/novenas/:id/progress` | Auth | Get my progress for this novena |
| `POST` | `/novenas/:id/progress` | Auth | Mark a day as completed |
| `DELETE` | `/novenas/:id/progress` | Auth | Reset my novena progress |

**POST /novenas/:id/progress — Request Body:**
```json
{
  "day": 3
}
```

---

### Simbang Gabi

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/simbang-gabi` | Auth | Get my attendance (`?year=2025`) |
| `POST` | `/simbang-gabi/attend` | Auth | Mark a day as attended |
| `GET` | `/simbang-gabi/stats` | Admin | Get parish-wide attendance stats |

**POST /simbang-gabi/attend — Request Body:**
```json
{
  "year": 2025,
  "day": 5
}
```

---

### Notifications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/notifications` | Auth | List my notifications (`?type=event&unread=true`) |
| `GET` | `/notifications/unread-count` | Auth | Get count of unread notifications |
| `POST` | `/notifications/:id/read` | Auth | Mark a notification as read |
| `POST` | `/notifications/read-all` | Auth | Mark all notifications as read |
| `DELETE` | `/notifications/:id` | Auth | Delete a notification |

---

### Bookmarks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/bookmarks` | Auth | List all my bookmarks (`?model=novenas`) |
| `POST` | `/bookmarks` | Auth | Add a new bookmark |
| `DELETE` | `/bookmarks/:id` | Auth | Remove a bookmark |
| `GET` | `/bookmarks/check` | Auth | Check if item is bookmarked (`?refId=&refModel=`) |

**POST /bookmarks — Request Body:**
```json
{
  "refId": "64a1b2c3d4e5f6a7b8c9d0f9",
  "refModel": "novenas"
}
```

---

## User Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| `member` | Regular parish member | Read all content, manage own data (profile, family, RSVP, donations, novenas) |
| `coordinator` | Ministry/group leader | All member permissions + create announcements and events for their ministry |
| `priest` | Assigned clergy | All coordinator permissions + update sacrament request status + view all requests |
| `admin` | Parish administrator | Full access to all endpoints including create/update/delete all content |

---

## Enums Reference

### User Role
```
"member" | "coordinator" | "priest" | "admin"
```

### Gender
```
"male" | "female"
```

### Language
```
"Filipino" | "English"
```

### Text Size
```
"Small" | "Normal" | "Large"
```

### Dependent Relationship
```
"Anak" | "Magulang" | "Kapatid" | "Lolo/Lola" | "Apo" | "Iba pa"
```

### Announcement Category
```
"Mass" | "Event" | "Sacrament" | "Youth" | "Ministry"
```

### Event Category
```
"Liturgical" | "Youth" | "Fiesta" | "Sacraments" | "Outreach"
```

### Event RSVP Status
```
"Pupunta"  (Yes — I will attend)
"Baka"     (Maybe)
"Hindi"    (No — I will not attend)
```

### Donation Method
```
"cash" | "gcash" | "bank_transfer"
```

### Sacrament Type
```
"baptism" | "marriage" | "confirmation" | "anointing" | "funeral" | "other"
```

### Sacrament Request Status
```
"submitted" → "pending" → "approved" → "confirmed"
                                ↘ "rejected" (from any status)
```

### Notification Type
```
"announcement" | "event" | "sacrament" | "reading" | "general"
```

### Liturgical Season
```
"advent" | "christmas" | "lent" | "easter" | "pentecost" | "ordinary"
```

### Liturgical Season Colors
| Season | Color | Hex |
|--------|-------|-----|
| Advent | Purple | `#742121` |
| Christmas | White/Gold | `#D4AF37` |
| Lent | Purple | `#742121` |
| Easter | White | `#FFFFFF` |
| Pentecost | Red | `#CC0000` |
| Ordinary Time | Green | `#2D6A2D` |

---

*Document generated for Simbahan v1.0 — 2026-04-11*
