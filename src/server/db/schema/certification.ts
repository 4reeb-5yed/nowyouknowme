import {
  pgTable,
  uuid,
  varchar,
  date,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  certificationName: varchar("certification_name", { length: 255 }).notNull(),
  issuingOrganization: varchar("issuing_organization", { length: 255 }).notNull(),
  issueDate: date("issue_date").notNull(),
  expiryDate: date("expiry_date"),
  credentialId: varchar("credential_id", { length: 255 }),
  credentialUrl: varchar("credential_url", { length: 500 }),
  displayOrder: integer("display_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
