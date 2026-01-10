

# HomeGuard Kerala – Database Table Design


## 1️⃣ `admins`

| Column Name   | Data Type    | Constraints      | Description     |
| ------------- | ------------ | ---------------- | --------------- |
| id            | UUID         | PK               | Admin ID        |
| full_name     | VARCHAR(100) | NOT NULL         | Admin name      |
| email         | VARCHAR(150) | NOT NULL, UNIQUE | Login email     |
| password_hash | TEXT         | NOT NULL         | Hashed password |
| created_at    | TIMESTAMP    | NOT NULL         | Created time    |

---

## 2️⃣ `owners`

| Column Name | Data Type    | Constraints      | Description       |
| ----------- | ------------ | ---------------- | ----------------- |
| id          | UUID         | PK               | Owner ID          |
| full_name   | VARCHAR(100) | NOT NULL         | Owner name        |
| email       | VARCHAR(150) | NOT NULL, UNIQUE | Login email       |
| phone       | VARCHAR(15)  | NOT NULL         | Contact number    |
| country     | VARCHAR(100) | NOT NULL         | Country           |
| created_at  | TIMESTAMP    | NOT NULL         | Registration time |

---

## 3️⃣ `inspectors`

| Column Name | Data Type    | Constraints      | Description                    |
| ----------- | ------------ | ---------------- | ------------------------------ |
| id          | UUID         | PK               | Inspector ID                   |
| full_name   | VARCHAR(100) | NOT NULL         | Inspector name                 |
| email       | VARCHAR(150) | NOT NULL, UNIQUE | Login email                    |
| phone       | VARCHAR(15)  | NOT NULL         | Contact number                 |
| status      | VARCHAR(20)  | NOT NULL         | Pending / Approved / Suspended |
| approved_by | UUID         | FK → admins(id)  | Approved admin                 |
| created_at  | TIMESTAMP    | NOT NULL         | Created time                   |

---

## 4️⃣ `properties`

| Column Name | Data Type     | Constraints     | Description      |
| ----------- | ------------- | --------------- | ---------------- |
| id          | UUID          | PK              | Property ID      |
| owner_id    | UUID          | FK → owners(id) | Property owner   |
| address     | TEXT          | NOT NULL        | Property address |
| latitude    | DECIMAL(10,7) | NOT NULL        | Latitude         |
| longitude   | DECIMAL(10,7) | NOT NULL        | Longitude        |
| created_at  | TIMESTAMP     | NOT NULL        | Added date       |

---

## 5️⃣ `inspection_packages`

| Column Name | Data Type     | Constraints | Description     |
| ----------- | ------------- | ----------- | --------------- |
| id          | UUID          | PK          | Package ID      |
| name        | VARCHAR(50)   | NOT NULL    | Basic / Deep    |
| description | TEXT          | NOT NULL    | Package details |
| price       | DECIMAL(10,2) | NOT NULL    | Inspection cost |

---

## 6️⃣ `inspection_schedules`

| Column Name    | Data Type   | Constraints                  | Description                    |
| -------------- | ----------- | ---------------------------- | ------------------------------ |
| id             | UUID        | PK                           | Schedule ID                    |
| owner_id       | UUID        | FK → owners(id)              | Owner                          |
| property_id    | UUID        | FK → properties(id)          | Property                       |
| package_id     | UUID        | FK → inspection_packages(id) | Package                        |
| scheduled_date | DATE        | NOT NULL                     | Inspection date                |
| frequency      | VARCHAR(20) | NOT NULL                     | OneTime / Monthly / Quarterly  |
| status         | VARCHAR(20) | NOT NULL                     | Pending / Assigned / Completed |
| created_at     | TIMESTAMP   | NOT NULL                     | Created time                   |

---

## 7️⃣ `job_tickets`

| Column Name  | Data Type   | Constraints                   | Description                                  |
| ------------ | ----------- | ----------------------------- | -------------------------------------------- |
| id           | UUID        | PK                            | Job ticket ID                                |
| schedule_id  | UUID        | FK → inspection_schedules(id) | Schedule                                     |
| inspector_id | UUID        | FK → inspectors(id)           | Inspector                                    |
| status       | VARCHAR(20) | NOT NULL                      | Assigned / InProgress / Submitted / Verified |
| assigned_at  | TIMESTAMP   | NOT NULL                      | Assigned time                                |

---

## 8️⃣ `inspections`

| Column Name    | Data Type   | Constraints          | Description      |
| -------------- | ----------- | -------------------- | ---------------- |
| id             | UUID        | PK                   | Inspection ID    |
| job_ticket_id  | UUID        | FK → job_tickets(id) | Job ticket       |
| start_time     | TIMESTAMP   | NOT NULL             | Start time       |
| end_time       | TIMESTAMP   | NOT NULL             | End time         |
| overall_status | VARCHAR(20) | NOT NULL             | OK / IssuesFound |

---

## 9️⃣ `geo_verification_logs`

| Column Name            | Data Type     | Constraints          | Description         |
| ---------------------- | ------------- | -------------------- | ------------------- |
| id                     | UUID          | PK                   | Geo log ID          |
| inspection_id          | UUID          | FK → inspections(id) | Inspection          |
| latitude               | DECIMAL(10,7) | NOT NULL             | Inspector latitude  |
| longitude              | DECIMAL(10,7) | NOT NULL             | Inspector longitude |
| distance_from_property | DECIMAL(6,2)  | NOT NULL             | Distance (meters)   |
| verified               | BOOLEAN       | NOT NULL             | Geo verified        |
| verified_at            | TIMESTAMP     | NOT NULL             | Verified time       |

---

## 🔟 `checklist_items`

| Column Name | Data Type    | Constraints                  | Description       |
| ----------- | ------------ | ---------------------------- | ----------------- |
| id          | UUID         | PK                           | Checklist item ID |
| package_id  | UUID         | FK → inspection_packages(id) | Package           |
| area_name   | VARCHAR(100) | NOT NULL                     | Area name         |

---

## 1️⃣1️⃣ `inspection_checklist_results`

| Column Name       | Data Type   | Constraints              | Description |
| ----------------- | ----------- | ------------------------ | ----------- |
| id                | UUID        | PK                       | Result ID   |
| inspection_id     | UUID        | FK → inspections(id)     | Inspection  |
| checklist_item_id | UUID        | FK → checklist_items(id) | Checklist   |
| status            | VARCHAR(20) | NOT NULL                 | OK / Issue  |
| remarks           | TEXT        | NULL                     | Notes       |

---

## 1️⃣2️⃣ `evidence_media`

| Column Name       | Data Type   | Constraints              | Description   |
| ----------------- | ----------- | ------------------------ | ------------- |
| id                | UUID        | PK                       | Media ID      |
| inspection_id     | UUID        | FK → inspections(id)     | Inspection    |
| checklist_item_id | UUID        | FK → checklist_items(id) | Checklist     |
| media_type        | VARCHAR(20) | NOT NULL                 | Photo / Video |
| media_url         | TEXT        | NOT NULL                 | File path     |
| uploaded_at       | TIMESTAMP   | NOT NULL                 | Uploaded time |

---

## 1️⃣3️⃣ `red_flags`

| Column Name   | Data Type   | Constraints          | Description               |
| ------------- | ----------- | -------------------- | ------------------------- |
| id            | UUID        | PK                   | Red flag ID               |
| inspection_id | UUID        | FK → inspections(id) | Inspection                |
| category      | VARCHAR(50) | NOT NULL             | Leak / Crack / Electrical |
| severity      | VARCHAR(20) | NOT NULL             | Low / Medium / High       |
| description   | TEXT        | NOT NULL             | Issue description         |

---

## 1️⃣4️⃣ `inspection_reports`

| Column Name   | Data Type | Constraints          | Description    |
| ------------- | --------- | -------------------- | -------------- |
| id            | UUID      | PK                   | Report ID      |
| inspection_id | UUID      | FK → inspections(id) | Inspection     |
| generated_at  | TIMESTAMP | NOT NULL             | Generated time |
| report_url    | TEXT      | NOT NULL             | Report link    |

---

## 1️⃣5️⃣ `notifications`

| Column Name | Data Type   | Constraints     | Description     |
| ----------- | ----------- | --------------- | --------------- |
| id          | UUID        | PK              | Notification ID |
| owner_id    | UUID        | FK → owners(id) | Owner           |
| message     | TEXT        | NOT NULL        | Message         |
| sent_at     | TIMESTAMP   | NOT NULL        | Sent time       |
| status      | VARCHAR(20) | NOT NULL        | Sent / Failed   |

---

